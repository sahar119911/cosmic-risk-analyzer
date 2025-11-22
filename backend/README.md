# Physics-Informed GAT Backend

This Python backend runs the trained PyTorch models for conjunction assessment.

## Setup

1. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Run the server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

## Deployment

For production, deploy this backend to a Python-compatible hosting service:
- **Railway**: Connect GitHub repo, auto-deploy
- **Render**: Web service with Python runtime
- **Fly.io**: Deploy with `fly launch`
- **Google Cloud Run**: Containerized deployment

After deployment, add the backend URL as a secret in Lovable:
- Secret name: `PYTHON_BACKEND_URL`
- Secret value: Your deployed backend URL (e.g., `https://your-app.railway.app`)

## API Endpoints

### `GET /health`
Health check

### `POST /predict`
Predict collision risk

**Request body:**
```json
{
  "node_features": [[x, y, z, x_dot, y_dot, z_dot, cr_r, ct_t, cn_n], ...],
  "edge_features": [[miss_distance, relative_speed, angle_R_V_rel_deg, log_Error_Volume, Miss_over_SigmaR, Delta_Inclination_deg, Delta_SMA_km]],
  "edge_index": [[0, 1], [1, 0]],
  "mc_samples": 100
}
```

**Response:**
```json
{
  "prediction": -5.92,
  "epistemic_uncertainty": 0.45,
  "aleatoric_uncertainty": 3.44,
  "total_uncertainty": 3.47,
  "risk_category": "High",
  "stage": "Stage-2"
}
```
