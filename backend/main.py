"""
FastAPI Backend for Physics-Informed GAT Conjunction Assessment
Falls back to demo mode if trained models cannot be loaded
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import torch
import pickle
import json
import numpy as np
from pathlib import Path
from typing import Dict
import random

app = FastAPI(title="CDM Risk Assessment API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model globals
stage1_model = None
stage2_model = None
scalers = None
id_encoder = None
config = None
demo_mode = False

@app.on_event("startup")
async def load_models():
    """Load trained models and scalers, fall back to demo mode if unavailable"""
    global stage1_model, stage2_model, scalers, id_encoder, config, demo_mode

    models_dir = Path("models")

    try:
        # Try to load models
        from models.pi_gat import PhysicsInformedGAT_Uncertainty

        # Load config
        with open(models_dir / "api_config.json") as f:
            config = json.load(f)

        # Load scalers
        with open(models_dir / "scalers.pkl", "rb") as f:
            scalers = pickle.load(f)

        # Load ID encoder
        with open(models_dir / "id_encoder.pkl", "rb") as f:
            id_encoder = pickle.load(f)

        # Initialize models
        node_feat_dim = config["input_requirements"]["node_feature_dim"]
        edge_feat_dim = config["input_requirements"]["edge_feature_dim"]

        stage1_model = PhysicsInformedGAT_Uncertainty(
            node_feat_dim=node_feat_dim,
            hidden_dim=128,
            edge_feat_dim=edge_feat_dim,
            readout_dim=64,
            dropout_p=0.4
        )
        stage1_model.load_state_dict(torch.load(models_dir / "pi_gat_stage1_trained.pth", map_location="cpu"))
        stage1_model.eval()

        stage2_model = PhysicsInformedGAT_Uncertainty(
            node_feat_dim=node_feat_dim,
            hidden_dim=128,
            edge_feat_dim=edge_feat_dim,
            readout_dim=64,
            dropout_p=0.4
        )
        stage2_model.load_state_dict(torch.load(models_dir / "pi_gat_stage2_trained.pth", map_location="cpu"))
        stage2_model.eval()

        print("✅ Models loaded successfully")
        demo_mode = False

    except Exception as e:
        print(f"⚠️  Failed to load trained models: {e}")
        print("🔄 Falling back to DEMO mode - using simulated predictions")
        demo_mode = True

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "models_loaded": stage1_model is not None and stage2_model is not None,
        "mode": "demo" if demo_mode else "production"
    }

def predict_demo_mode(data: Dict):
    """Demo mode prediction using simulated realistic values"""
    # Extract basic features for realistic simulation
    edge_features = data.get("edge_features", [[125.0, 0.05, 15.2, 8.5, 2.1, 0.5, 2.0]])[0]
    miss_distance = edge_features[0] if len(edge_features) > 0 else 125.0

    # Simulate realistic predictions based on miss distance
    base_prediction = -10.0 + (miss_distance / 50.0)

    # Add randomness for realism
    random.seed(int(miss_distance * 100))
    noise = random.gauss(0, 0.5)
    final_pred = base_prediction + noise

    # Simulate uncertainties
    epistemic_unc = abs(random.gauss(0.35, 0.15))
    aleatoric_unc = abs(random.gauss(2.8, 0.6))

    # Determine stage and risk
    use_stage2 = final_pred > -8.0
    stage = "Stage-2" if use_stage2 else "Stage-1"

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

@app.post("/predict")
async def predict_collision_risk(data: Dict):
    """
    Predict collision probability and uncertainty

    Expected input:
    {
        "node_features": [[x, y, z, x_dot, y_dot, z_dot, cr_r, ct_t, cn_n], ...],
        "edge_features": [[miss_distance, relative_speed, angle_R_V_rel_deg, log_Error_Volume, Miss_over_SigmaR, Delta_Inclination_deg, Delta_SMA_km]],
        "edge_index": [[0, 1], [1, 0]],
        "mc_samples": 100
    }
    """
    try:
        # Use demo mode if models not loaded
        if demo_mode or stage1_model is None:
            return predict_demo_mode(data)

        # Extract data for model prediction
        node_features = torch.tensor(data["node_features"], dtype=torch.float32)
        edge_features = torch.tensor(data["edge_features"], dtype=torch.float32)
        edge_index = torch.tensor(data["edge_index"], dtype=torch.long).T
        mc_samples = data.get("mc_samples", 100)

        # Stage 1 prediction with MC-dropout
        stage1_preds = []
        with torch.no_grad():
            for _ in range(mc_samples):
                mu, sigma, _ = stage1_model(
                    node_features,
                    edge_index,
                    edge_features,
                    torch.tensor([0]),
                    torch.tensor([0]),
                    torch.tensor([1])
                )
                stage1_preds.append(mu.item())

        stage1_mean = np.mean(stage1_preds)
        stage1_epistemic = np.std(stage1_preds)

        # Check if high-risk
        use_stage2 = stage1_mean > -1.0

        if use_stage2:
            # Stage 2 refinement
            stage2_preds = []
            with torch.no_grad():
                for _ in range(mc_samples):
                    mu, sigma, _ = stage2_model(
                        node_features,
                        edge_index,
                        edge_features,
                        torch.tensor([0]),
                        torch.tensor([0]),
                        torch.tensor([1])
                    )
                    stage2_preds.append(mu.item())

            final_pred = np.mean(stage2_preds)
            epistemic_unc = np.std(stage2_preds)

            with torch.no_grad():
                _, sigma, _ = stage2_model(
                    node_features,
                    edge_index,
                    edge_features,
                    torch.tensor([0]),
                    torch.tensor([0]),
                    torch.tensor([1])
                )
            aleatoric_unc = sigma.item()
            stage = "Stage-2"
        else:
            final_pred = stage1_mean
            epistemic_unc = stage1_epistemic

            with torch.no_grad():
                _, sigma, _ = stage1_model(
                    node_features,
                    edge_index,
                    edge_features,
                    torch.tensor([0]),
                    torch.tensor([0]),
                    torch.tensor([1])
                )
            aleatoric_unc = sigma.item()
            stage = "Stage-1"

        # Determine risk category
        if final_pred > -3:
            risk_category = "High"
        elif final_pred > -5:
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
