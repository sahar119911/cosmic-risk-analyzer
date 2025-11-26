"""
FastAPI Backend for Physics-Informed GAT Conjunction Assessment (Demo Mode)
This version runs without requiring pre-trained model files
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from typing import Dict
import random

app = FastAPI(title="CDM Risk Assessment API (Demo)")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    """Startup message"""
    print("✅ Demo API started successfully")
    print("⚠️  Running in DEMO mode - using simulated predictions")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "models_loaded": True,
        "mode": "demo"
    }

@app.post("/predict")
async def predict_collision_risk(data: Dict):
    """
    Predict collision probability and uncertainty (DEMO VERSION)

    Expected input:
    {
        "node_features": [[x, y, z, x_dot, y_dot, z_dot, cr_r, ct_t, cn_n], ...],
        "edge_features": [[miss_distance, relative_speed, angle_R_V_rel_deg, log_Error_Volume, Miss_over_SigmaR, Delta_Inclination_deg, Delta_SMA_km]],
        "edge_index": [[0, 1], [1, 0]],
        "mc_samples": 100
    }
    """
    try:
        # Extract basic features for realistic simulation
        edge_features = data.get("edge_features", [[125.0, 0.05, 15.2, 8.5, 2.1, 0.5, 2.0]])[0]
        miss_distance = edge_features[0] if len(edge_features) > 0 else 125.0

        # Simulate realistic predictions based on miss distance
        # Closer miss distance = higher risk (more negative log probability)
        base_prediction = -10.0 + (miss_distance / 50.0)  # Ranges from ~-7.5 to ~-10

        # Add some randomness for realism
        random.seed(int(miss_distance * 100))
        noise = random.gauss(0, 0.5)
        final_pred = base_prediction + noise

        # Simulate uncertainties
        epistemic_unc = abs(random.gauss(0.35, 0.15))
        aleatoric_unc = abs(random.gauss(2.8, 0.6))

        # Determine stage based on risk level
        use_stage2 = final_pred > -8.0
        stage = "Stage-2" if use_stage2 else "Stage-1"

        # Determine risk category
        if final_pred > -6:
            risk_category = "High"
        elif final_pred > -8:
            risk_category = "Medium"
        else:
            risk_category = "Low"

        return {
            "prediction": float(final_pred),
            "epistemic_uncertainty": float(epistemic_unc),
            "aleatoric_uncertainty": float(aleatoric_unc),
            "total_uncertainty": float(np.sqrt(epistemic_unc**2 + aleatoric_unc**2)),
            "risk_category": risk_category,
            "stage": stage
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
