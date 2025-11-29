import { CheckCircle2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface PredictionResultsProps {
  disease: string;
  confidence: number;
  description?: string;
}

const PredictionResults = ({ disease, confidence, description }: PredictionResultsProps) => {
  const confidencePercent = Math.round(confidence * 100);
  const isHighConfidence = confidence > 0.7;

  return (
    <Card className="animate-fade-in p-6 shadow-card">
      <div className="mb-4 flex items-start gap-3">
        {isHighConfidence ? (
          <CheckCircle2 className="mt-1 h-6 w-6 text-accent" />
        ) : (
          <AlertCircle className="mt-1 h-6 w-6 text-destructive" />
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">Analysis Results</h3>
          <p className="text-sm text-muted-foreground">AI prediction completed</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Detected Condition</span>
            <span className="text-lg font-bold text-primary">{disease}</span>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Confidence</span>
            <span className={`text-sm font-semibold ${isHighConfidence ? 'text-accent' : 'text-destructive'}`}>
              {confidencePercent}%
            </span>
          </div>
          <Progress value={confidencePercent} className="h-2" />
        </div>

        {description && (
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm leading-relaxed text-foreground">{description}</p>
          </div>
        )}

        <div className="mt-4 rounded-lg border border-border bg-card p-3">
          <p className="text-xs text-muted-foreground">
            ⚠️ This is an AI-assisted analysis and should not replace professional medical advice. 
            Please consult with a dermatologist for proper diagnosis and treatment.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default PredictionResults;
