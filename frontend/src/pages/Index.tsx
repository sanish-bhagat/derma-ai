import { useState } from "react";
import ImageUpload from "@/components/ImageUpload";
import AnalysisResults from "@/components/AnalysisResults";
import ChatInterface from "@/components/ChatInterface";
import { Activity } from "lucide-react";

export interface PredictionResult {
  disease: string;
  confidence: number;
  description: string;
}

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageUpload = (imageData: string) => {
    setUploadedImage(imageData);
    setPrediction(null); // Clear previous results
  };

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  const handleAnalyze = async () => {
    if (!uploadedImage) return;

    setIsAnalyzing(true);
    try {
      // Convert base64 to blob
      const base64Response = await fetch(uploadedImage);
      const blob = await base64Response.blob();
      
      const formData = new FormData();
      // Use 'image' to match backend expectations
      formData.append('image', blob, 'skin_image.jpg');

      const response = await fetch(`${BACKEND_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();
      setPrediction({
        disease: data.disease,
        confidence: data.confidence,
        description: data.description || 'Analysis completed successfully.',
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
      setPrediction({
        disease: 'Error',
        confidence: 0,
        description: 'Failed to analyze the image. Please ensure the backend is running on http://localhost:8000',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-y-auto lg:overflow-hidden">
      {/* Header */}
      <header className="border-b border-border bg-card flex-shrink-0">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-foreground truncate">Derma-AI</h1>
              <p className="text-xs md:text-sm text-muted-foreground truncate">AI-Powered Dermatology Assistant</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto lg:overflow-hidden">
        <div className="container mx-auto px-4 py-4 md:py-6 h-full">
          <div className="flex flex-col lg:grid lg:grid-cols-[40%_60%] gap-4 md:gap-6 h-auto lg:h-full">
            {/* Left Panel - Image Upload & Analysis */}
            <div className="flex flex-col gap-4 h-auto lg:h-full min-h-[400px] lg:min-h-0 overflow-visible lg:overflow-hidden">
              {/* Image Upload Section - Expanded and no internal scroll on mobile/tablet */}
              <div className="h-auto min-h-[340px] md:min-h-[420px] lg:h-1/2 lg:min-h-0 overflow-visible lg:overflow-hidden">
                <ImageUpload 
                  onImageUpload={handleImageUpload} 
                  uploadedImage={uploadedImage}
                  onAnalyze={handleAnalyze}
                  isAnalyzing={isAnalyzing}
                  onClear={() => {
                    setUploadedImage(null);
                    setPrediction(null);
                  }}
                />
              </div>

              {/* Analysis Results Section - Expanded and no internal scroll on mobile/tablet */}
              <div className="h-auto min-h-[260px] md:min-h-[320px] lg:h-1/2 lg:min-h-0 overflow-visible lg:overflow-hidden">
                <AnalysisResults prediction={prediction} />
              </div>
            </div>

            {/* Right Panel - Chat Interface */}
            <div className="h-auto min-h-[400px] lg:h-full lg:min-h-0 overflow-visible lg:overflow-hidden mb-4">
              <ChatInterface prediction={prediction} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
