import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, FileText } from "lucide-react";
import { PredictionResult } from "@/pages/Index";

interface AnalysisResultsProps {
  prediction: PredictionResult | null;
}

const AnalysisResults = ({ prediction }: AnalysisResultsProps) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "success";
    if (confidence >= 0.6) return "warning";
    return "destructive";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return "High Confidence";
    if (confidence >= 0.6) return "Moderate Confidence";
    return "Low Confidence";
  };

  return (
    <Card className="h-full p-4 md:p-6 bg-card border-border flex flex-col overflow-hidden">
      <h2 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4 flex-shrink-0">Analysis Results</h2>

      {prediction ? (
        <div className="flex-1 flex flex-col gap-3 md:gap-4 overflow-y-auto chat-scroll min-h-0">
          {/* Disease Name */}
          <div className="p-3 md:p-4 rounded-lg bg-accent/50 border border-accent flex-shrink-0">
            <div className="flex items-start gap-2 md:gap-3">
              <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-accent-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground mb-1">Detected Condition</p>
                <p className="text-lg md:text-xl font-semibold text-foreground break-words">{prediction.disease}</p>
              </div>
            </div>
          </div>

          {/* Confidence Score */}
          <div className="p-3 md:p-4 rounded-lg bg-muted border border-border flex-shrink-0">
            <div className="flex items-center justify-between mb-2 gap-2">
              <p className="text-xs md:text-sm text-muted-foreground">Confidence Level</p>
              <Badge 
                variant={getConfidenceColor(prediction.confidence) as any}
                className="font-medium text-[10px] md:text-xs"
              >
                {getConfidenceLabel(prediction.confidence)}
              </Badge>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${prediction.confidence * 100}%` }}
                />
              </div>
              <span className="text-xs md:text-sm font-semibold text-foreground whitespace-nowrap">
                {(prediction.confidence * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="p-3 md:p-4 rounded-lg bg-secondary/50 border border-border flex-shrink-0">
            <div className="flex items-start gap-2 md:gap-3">
              <FileText className="w-4 h-4 md:w-5 md:h-5 text-secondary-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground mb-2">Description</p>
                <p className="text-xs md:text-sm text-foreground leading-relaxed break-words">
                  {prediction.description}
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-2 md:p-3 rounded-lg bg-warning/10 border border-warning/30 flex-shrink-0">
            <div className="flex gap-2">
              <AlertCircle className="w-3 h-3 md:w-4 md:h-4 text-warning flex-shrink-0 mt-0.5" />
              <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed">
                This is an AI-generated analysis. Please consult a healthcare professional for accurate diagnosis.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center p-4 md:p-6">
          <div>
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 md:mb-4">
              <FileText className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground" />
            </div>
            <p className="text-xs md:text-sm text-muted-foreground px-4">
              Upload and analyze an image to see results
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AnalysisResults;
