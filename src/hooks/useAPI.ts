import { useState, useCallback } from "react";
import { apiClient, PredictionRequest, PredictionResponse } from "@/lib/api";
import { toast } from "sonner";

export const useHealthCheck = () => {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkHealth = useCallback(async () => {
    setIsChecking(true);
    try {
      const response = await apiClient.healthCheck();
      setIsHealthy(response.models_loaded && response.status === "healthy");
      return response.models_loaded;
    } catch (error) {
      console.error("Health check failed:", error);
      setIsHealthy(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  return { isHealthy, isChecking, checkHealth };
};

export const usePredict = () => {
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const predict = useCallback(async (request: PredictionRequest) => {
    setIsPredicting(true);
    setError(null);
    try {
      const response = await apiClient.predict(request);
      setPrediction(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Prediction failed";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsPredicting(false);
    }
  }, []);

  const reset = useCallback(() => {
    setPrediction(null);
    setError(null);
  }, []);

  return { isPredicting, prediction, error, predict, reset };
};

export const useProcessCDM = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processCDM = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    try {
      const request = await apiClient.processCDMFile(file);
      return request;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to process CDM file";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { isProcessing, error, processCDM };
};
