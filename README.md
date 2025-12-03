# 📌 Derma AI — Full-Stack AI Dermatology Assistant

Derma AI is an end-to-end **AI-powered dermatology assistant** capable of:

- 🖼️ Classifying skin disease from an uploaded image  
- 💬 Answering medical queries using RAG + Groq LLM  
- 📚 Retrieving dermatology knowledge from Pinecone VectorDB  
- 🌐 Providing a modern UI built with React + Vite  
- ⚙️ Running a Flask backend with TensorFlow, LangChain & Docker  

This project combines **Computer Vision, LLMs, RAG, and Full-Stack Deployment** into a production-ready AI application.

---

## 🚀 Live Demo

### **Live Demo:**  
🔗 https://derma-ai-assistant.vercel.app/

### **Demo Video:**  
🔗 https://drive.google.com/file/d/1LucHtTL0atLx-soF2EGGqBxqAPOxgDFS/view

---

# 🧠 Features

## 🔍 Skin Disease Classification
- MobileNet CNN-based model  
- Predicts diseases with confidence scores  
- Includes medical explanations for each disease  

## 💬 AI Dermatology Chat Assistant
- Uses **RAG (Retrieval-Augmented Generation)**  
- Powered by **Groq Llama-3 (70B)**  
- Retrieves context using Pinecone VectorDB  
- Generates medically aligned responses  

## 📚 RAG Pipeline
- **Embeddings:** Sentence Transformers (MiniLM-L6-v2)  
- **Vector DB:** Pinecone  
- **Retriever:** Similarity Search  
- **LLM:** Groq via LangChain  

## 🌐 Full-Stack System
- **Frontend:** React + Vite + Tailwind  
- **Backend:** Flask + TensorFlow + LangChain  
- **Deployment:**  
  - Frontend → **Vercel**  
  - Backend → **HuggingFace Spaces (Docker)**  

---

# 🧰 Tech Stack

## **Frontend**
- React  
- Vite  
- Tailwind CSS  
- Deployed on **Vercel**

## **Backend**
- Flask  
- TensorFlow / Keras  
- LangChain  
- Pinecone VectorStore  
- Groq API  
- Docker  
- Deployed on **HuggingFace Spaces**

---

# 🏗️ Project Architecture

├── 📁 backend/
│   ├── 🧠 app.py                  # Main Flask backend API
│   ├── 🧩 helper.py               # RAG utilities, embeddings, PDF processing
│   ├── 💬 prompt.py               # System prompt for medical chatbot
│   ├── 🧪 derma_mobilenet.keras   # Trained CNN model (Git LFS)
│   ├── 🐳 Dockerfile              # Docker setup for HuggingFace Spaces
│   └── 📄 requirements.txt        # Backend dependencies
│
├── 🎨 frontend/
│   ├── 📁 src/                    # React components & UI logic
│   │   ├── components/            # UI components
│   │   ├── pages/                 # App pages
│   │   ├── App.tsx                # Root component
│   │   └── main.tsx               # Entry point
│   ├── 📁 public/                 # Static assets
│   ├── ⚙️ vite.config.ts          # Vite frontend config
│   └── 📄 package.json            # Frontend dependencies
│
└── 📘 README.md                   # Project documentation


---

# 🏁 Local Setup

## 🔧 Clone the Repo

git clone https://github.com/sanish-bhagat/derma-ai.git
cd derma-ai


# 🔙 Backend Setup (Flask)
## 📦 Install Dependencies
pip install -r requirements.txt

## ▶️ Run Backend Server
python app.py


## Backend runs at:

http://localhost:7860

# 🎨 Frontend Setup (React + Vite)
## Install Dependencies
cd frontend
npm install

## Run Development Server
npm run dev

## 🌍 Environment Variables
### Backend .env
GROQ_API_KEY=your_groq_api_key
PINECONE_API_KEY=your_pinecone_api_key

### Frontend .env
VITE_API_URL=https://your-backend.hf.space

### 🧪 API Endpoints
#### POST /predict

Upload an image → returns:

Disease

Confidence

Description

#### POST /chat

Send a message → returns LLM response using RAG.

#### GET /health

Health check endpoint.

# 🤝 Contributing

Pull requests and suggestions are welcome!

# 🙌 Acknowledgements

Pinecone

Groq

HuggingFace

TensorFlow

Vercel

LangChain

# 💬 Contact

#### Sanish Bhagat
E-mail - sanishbhagat3@gmail.com
Linkedin - https://www.linkedin.com/in/sanish-bhagat-1795a6293?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app
