// Top-level imports and ImageUpload component
import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  onImageUpload: (imageData: string) => void;
  uploadedImage: string | null;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onClear: () => void;
}

// ChatInterface component
const ImageUpload = ({ onImageUpload, uploadedImage, onAnalyze, isAnalyzing, onClear }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('Image size should be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageUpload(result);
      toast.success('Image uploaded successfully');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
      // Ensure re-selecting the same file triggers change next time
      e.target.value = '';
    }
  };

  return (
    <Card className="h-auto lg:h-full flex flex-col p-4 md:p-6 bg-card border-border overflow-visible lg:overflow-hidden">
      {/* Upload Area */}
      <div
        className={`flex-1 min-h-0 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
          isDragging
            ? 'border-primary bg-primary-light'
            : 'border-border bg-muted/30 hover:bg-muted/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="h-full flex flex-col items-center justify-center p-3 md:p-6">
          {uploadedImage ? (
            <div className="w-full h-full relative flex items-center justify-center">
              {/* Clear (Cross) Button */}
              <Button
                variant="outline"
                size="icon"
                className="absolute top-2 right-2 z-10 bg-card/80"
                onClick={(e) => {
                  e.stopPropagation();
                  // Reset the input so uploading the same file again works
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                  onClear();
                }}
                aria-label="Clear image"
                title="Clear image"
              >
                <X className="w-4 h-4" />
              </Button>

              <img
                src={uploadedImage}
                alt="Uploaded skin"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          ) : (
            <>
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-accent flex items-center justify-center mb-3 md:mb-4">
                <ImageIcon className="w-6 h-6 md:w-8 md:h-8 text-accent-foreground" />
              </div>
              <p className="text-xs md:text-sm font-medium text-foreground mb-1 text-center">
                Drag and drop your image here
              </p>
              <p className="text-[10px] md:text-xs text-muted-foreground mb-3 md:mb-4 text-center">or click to browse</p>
              <Button variant="outline" size="sm" className="gap-2 text-xs md:text-sm">
                <Upload className="w-3 h-3 md:w-4 md:h-4" />
                Choose File
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Analyze Button */}
      <Button
        onClick={onAnalyze}
        disabled={!uploadedImage || isAnalyzing}
        className="mt-3 md:mt-4 w-full bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0"
        size="lg"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-3 h-3 md:w-4 md:h-4 mr-2 animate-spin" />
            <span className="text-sm md:text-base">Analyzing...</span>
          </>
        ) : (
          <span className="text-sm md:text-base">Analyze Image</span>
        )}
      </Button>
    </Card>
  );
};

export default ImageUpload;
