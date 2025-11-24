import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon, File, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useProcessCDM, usePredict } from "@/hooks/useAPI";

const Upload = () => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { processCDM, isProcessing } = useProcessCDM();
  const { predict, isPredicting } = usePredict();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xml'))) {
      setFile(droppedFile);
      toast.success("File loaded successfully");
    } else {
      toast.error("Please upload a CSV or XML file");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      toast.success("File loaded successfully");
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    try {
      toast.info("Processing CDM file...");

      // Process the CDM file to extract features
      const predictionRequest = await processCDM(file);

      toast.info("Running prediction with Physics-Informed GAT model...");

      // Run prediction
      const result = await predict(predictionRequest);

      toast.success(`Analysis complete! Risk level: ${result.risk_category}`);

      // Store results in sessionStorage for the Results page
      sessionStorage.setItem("predictionResult", JSON.stringify(result));
      sessionStorage.setItem("fileName", file.name);

      navigate("/results");
    } catch (error) {
      console.error("Analysis failed:", error);
      // Toast error is already shown by the hook
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="text-foreground hover:bg-secondary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <header className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Upload CDM File</h1>
          <p className="text-muted-foreground">Upload a Conjunction Data Message for risk analysis</p>
        </header>

        <Card className="p-8 bg-card border-border">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
              isDragging 
                ? "border-primary bg-primary/10" 
                : "border-border hover:border-primary/50"
            }`}
          >
            <UploadIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-foreground">
              Drop your CDM file here
            </h3>
            <p className="text-muted-foreground mb-4">
              or click to browse (CSV or XML format)
            </p>
            <input
              type="file"
              accept=".csv,.xml"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button 
                variant="outline" 
                className="border-border text-foreground hover:bg-secondary"
                asChild
              >
                <span>Select File</span>
              </Button>
            </label>
          </div>

          {file && (
            <div className="mt-6 p-4 bg-secondary rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <File className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={isProcessing || isPredicting}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {(isProcessing || isPredicting) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isProcessing ? "Processing..." : isPredicting ? "Predicting..." : "Run Analysis"}
              </Button>
            </div>
          )}
        </Card>

        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-semibold mb-3 text-foreground">File Requirements</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Accepted formats: CSV or XML</li>
            <li>• Must contain standard CDM fields (TCA, miss distance, etc.)</li>
            <li>• Maximum file size: 10 MB</li>
            <li>• Ensure all required orbital parameters are present</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Upload;
