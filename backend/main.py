"""
FastAPI Backend for Physics-Informed GAT Conjunction Assessment
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import torch
import pickle
import json
import numpy as np
from pathlib import Path
from typing import Dict, List, Optional
import io

from models.pi_gat import PhysicsInformedGAT_Uncertainty

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

@app.on_event("startup")
async def load_models():
    """Load trained models and scalers"""
    global stage1_model, stage2_model, scalers, id_encoder, config
    
    models_dir = Path("models")
    
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

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "models_loaded": stage1_model is not None and stage2_model is not None
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
        # Extract data
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
        
        # Check if high-risk (top 5% threshold)
        # Assuming normalized predictions, threshold ~0.95
        use_stage2 = stage1_mean > -1.0  # Adjust threshold as needed
        
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
            
            # Get aleatoric uncertainty from last forward pass
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
