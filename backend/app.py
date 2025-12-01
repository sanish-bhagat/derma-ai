from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import os
from pinecone import Pinecone
from pinecone import ServerlessSpec
from langchain_pinecone import PineconeVectorStore
from langchain_groq import ChatGroq
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_classic.memory import ConversationBufferMemory
import numpy as np
from PIL import Image
import io
from helper import load_pdf_file, filter_to_minimal_docs, text_split, download_hugging_face_embeddings
from prompt import system_prompt
import tensorflow as tf
tf.keras.backend.set_image_data_format('channels_last')
from tensorflow.python.keras.saving import hdf5_format
from keras.models import load_model



# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Global variables for models and chains
model = None
rag_chain = None
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

# Disease classes for classification
DISEASE_CLASSES = ['Acne', 'Actinic Keratosis', 'Basal Cell Carcinoma', 'Eczema', 'Rosacea']

def load_models():
    global model, rag_chain

    # Load TensorFlow model
    model = load_model("backend/derma_mobilenet.keras")


    # Load RAG components
    embeddings = download_hugging_face_embeddings()

    # Load Pinecone
    pinecone_api_key = os.getenv("PINECONE_API_KEY")
    pc = Pinecone(api_key=pinecone_api_key)
    index_name = "derma-ai"

    # Load existing index
    docsearch = PineconeVectorStore.from_existing_index(
        index_name=index_name,
        embedding=embeddings
    )

    retriever = docsearch.as_retriever(search_type="similarity", search_kwargs={"k":3})

    # Setup LLM
    groq_api_key = os.getenv('GROQ_API_KEY')
    llm = ChatGroq(model="llama-3.3-70b-versatile", api_key=groq_api_key)

    # Create prompt
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}"),
    ])

    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)

def preprocess_image(image_bytes):
    """Preprocess image for model prediction"""
    img = Image.open(io.BytesIO(image_bytes))
    img = img.resize((224, 224))
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

@app.route('/predict', methods=['POST'])
def predict():
    try:
        file = None
        if 'image' in request.files:
            file = request.files['image']
        elif 'file' in request.files:
            file = request.files['file']
        else:
            return jsonify({'error': 'No image file provided'}), 400

        if file.filename == '':
            return jsonify({'error': 'No image selected'}), 400

        # Preprocess and predict
        image_bytes = file.read()
        processed_image = preprocess_image(image_bytes)
        predictions = model.predict(processed_image)

        # Get top prediction
        predicted_class_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class_idx])
        disease = DISEASE_CLASSES[predicted_class_idx]

        # Get description based on disease
        descriptions = {
            'Acne': 'Common inflammatory skin condition affecting hair follicles and oil glands. Treatment options include topical retinoids, benzoyl peroxide, and antibiotics.',
            'Actinic Keratosis': 'Precancerous skin condition caused by sun exposure. May require cryotherapy or topical treatments.',
            'Basal Cell Carcinoma': 'Most common type of skin cancer. Usually appears as a pearly bump or sore that doesn\'t heal.',
            'Eczema': 'Chronic skin condition causing inflammation and irritation. Managed with moisturizers and anti-inflammatory medications.',
            'Rosacea': 'Chronic skin condition causing facial redness and visible blood vessels. Treated with topical medications and lifestyle changes.'
        }

        description = descriptions.get(disease, 'Please consult a dermatologist for proper diagnosis and treatment.')

        return jsonify({
            'disease': disease,
            'confidence': confidence,
            'description': description
        })

    except Exception as e:
        print(f"Prediction error: {str(e)}")
        return jsonify({'error': 'Prediction failed'}), 500

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'error': 'No message provided'}), 400

        user_message = data['message']
        prediction = data.get('prediction')

        # Get memory context
        context = memory.load_memory_variables({})
        chat_history = context.get("chat_history", "")

        # Include prediction context if available
        prediction_context = ""
        if prediction:
            prediction_context = f"""
Recent skin analysis result:
- Disease: {prediction['disease']}
- Confidence: {prediction['confidence']:.2%}
- Description: {prediction['description']}
"""

        # Combine with user query
        final_input = f"""{prediction_context}
Previous conversation:
{chat_history}

User question: {user_message}
"""

        # RAG inference
        response = rag_chain.invoke({"input": final_input})

        # Save to memory (include full prediction details on first message after prediction)
        if prediction:
            memory.save_context(
                {"input": f"Prediction context:\n- Disease: {prediction['disease']}\n- Confidence: {prediction['confidence']:.2%}\n- Description: {prediction['description']}"},
                {"output": "Prediction stored in memory for future reference."}
            )
        memory.save_context({"input": user_message}, {"output": response["answer"]})

        return jsonify({'reply': response["answer"]})

    except Exception as e:
        print(f"Chat error: {str(e)}")
        return jsonify({'reply': 'I apologize, but I\'m having trouble connecting to the server. Please try again later.'}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    print("Loading models...")
    load_models()
    print("Models loaded. Starting server...")
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
