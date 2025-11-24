/**
 * API client for Physics-Informed GAT Backend
 */

export interface NodeFeatures {
  x: number;
  y: number;
  z: number;
  x_dot: number;
  y_dot: number;
  z_dot: number;
  cr_r: number;
  ct_t: number;
  cn_n: number;
}

export interface EdgeFeatures {
  miss_distance: number;
  relative_speed: number;
  angle_R_V_rel_deg: number;
  log_Error_Volume: number;
  Miss_over_SigmaR: number;
  Delta_Inclination_deg: number;
  Delta_SMA_km: number;
}

export interface PredictionRequest {
  node_features: number[][];
  edge_features: number[][];
  edge_index: number[][];
  mc_samples?: number;
}

export interface PredictionResponse {
  prediction: number;
  epistemic_uncertainty: number;
  aleatoric_uncertainty: number;
  total_uncertainty: number;
  risk_category: "High" | "Medium" | "Low";
  stage: "Stage-1" | "Stage-2";
}

export interface HealthResponse {
  status: string;
  models_loaded: boolean;
}

class APIClient {
  private baseURL: string;

  constructor(baseURL?: string) {
    this.baseURL = baseURL || import.meta.env.VITE_PYTHON_BACKEND_URL || "http://localhost:8000";
  }

  async healthCheck(): Promise<HealthResponse> {
    const response = await fetch(`${this.baseURL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return response.json();
  }

  async predict(request: PredictionRequest): Promise<PredictionResponse> {
    const response = await fetch(`${this.baseURL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Prediction failed: ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Parse CDM file and extract features for prediction
   * This is a placeholder - actual implementation would parse XML/CSV CDM files
   */
  async processCDMFile(file: File): Promise<PredictionRequest> {
    // TODO: Implement actual CDM parsing
    // For now, return example data
    return {
      node_features: [
        // Primary object: x, y, z, x_dot, y_dot, z_dot, cr_r, ct_t, cn_n
        [6878.14, 0.0, 0.0, 0.0, 7.6, 0.0, 0.001, 0.002, 0.001],
        // Secondary object
        [6876.14, 0.5, 0.5, 0.0, 7.59, 0.01, 0.0015, 0.0018, 0.0012],
      ],
      edge_features: [
        // miss_distance, relative_speed, angle_R_V_rel_deg, log_Error_Volume,
        // Miss_over_SigmaR, Delta_Inclination_deg, Delta_SMA_km
        [125.0, 0.05, 15.2, 8.5, 2.1, 0.5, 2.0],
      ],
      edge_index: [
        [0, 1],
        [1, 0],
      ],
      mc_samples: 100,
    };
  }
}

export const apiClient = new APIClient();
