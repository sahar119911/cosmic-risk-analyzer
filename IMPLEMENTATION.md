# Cosmic Risk Analyzer - Implementation Guide

## Overview

This project is a **Physics-Informed Graph Attention Network (PI-GAT)** based conjunction assessment system for analyzing satellite collision risks. It consists of a React frontend and a Python backend with PyTorch models.

## Architecture

### Frontend (React + TypeScript + Vite)
- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui (Radix UI primitives)
- **3D Visualization**: Cesium.js for orbital trajectory display
- **Styling**: Tailwind CSS
- **State Management**: React Query (@tanstack/react-query)
- **Routing**: React Router v6

### Backend (Python + FastAPI)
- **Framework**: FastAPI
- **ML Framework**: PyTorch
- **Model**: Physics-Informed GAT with MC-Dropout uncertainty quantification
- **API**: RESTful endpoints for health check and collision prediction

## Key Features Implemented

### 1. **3D Orbital Visualization** (`src/components/CesiumViewer.tsx`)
   - Real-time 3D globe visualization using Cesium.js
   - Display of primary and secondary satellites
   - Visual representation of conjunction events
   - Interactive camera controls

### 2. **API Integration** (`src/lib/api.ts`, `src/hooks/useAPI.ts`)
   - Type-safe API client for backend communication
   - Custom React hooks for API operations:
     - `useHealthCheck()` - Backend health monitoring
     - `usePredict()` - Collision probability predictions
     - `useProcessCDM()` - CDM file processing
   - Proper error handling and loading states

### 3. **File Upload System** (`src/pages/Upload.tsx`)
   - Drag-and-drop file upload
   - CSV/XML CDM file support
   - Real-time processing feedback
   - Integration with prediction API

### 4. **Results Dashboard** (`src/pages/Results.tsx`)
   - Display of prediction results
   - Risk categorization (High/Medium/Low)
   - Uncertainty quantification (epistemic and aleatoric)
   - Stage information (Stage-1 or Stage-2 refinement)

## Project Structure

```
cosmic-risk-analyzer/
├── backend/
│   ├── models/
│   │   ├── pi_gat.py                 # PyTorch model architecture
│   │   ├── pi_gat_stage1_trained.pth # Stage 1 trained weights
│   │   ├── pi_gat_stage2_trained.pth # Stage 2 trained weights
│   │   ├── scalers.pkl               # Feature scalers
│   │   ├── id_encoder.pkl            # ID encoder
│   │   └── api_config.json           # API configuration
│   ├── main.py                       # FastAPI application
│   ├── requirements.txt              # Python dependencies
│   └── README.md                     # Backend documentation
├── src/
│   ├── components/
│   │   ├── CesiumViewer.tsx          # 3D visualization component
│   │   └── ui/                       # shadcn/ui components
│   ├── hooks/
│   │   └── useAPI.ts                 # Custom API hooks
│   ├── lib/
│   │   └── api.ts                    # API client
│   ├── pages/
│   │   ├── Dashboard.tsx             # Main dashboard
│   │   ├── Upload.tsx                # File upload page
│   │   ├── Visualization.tsx         # 3D visualization page
│   │   ├── Results.tsx               # Results display
│   │   └── EventDetail.tsx           # Event details
│   └── App.tsx                       # Main application
├── .env                              # Environment variables
├── vite.config.ts                    # Vite configuration
└── package.json                      # Node dependencies
```

## Setup Instructions

### Frontend Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Edit `.env` to set your backend URL:
   ```env
   VITE_PYTHON_BACKEND_URL="http://localhost:8000"
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:8080`

4. **Build for production**:
   ```bash
   npm run build
   ```

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the FastAPI server**:
   ```bash
   python main.py
   ```
   The API will be available at `http://localhost:8000`

## API Endpoints

### `GET /health`
Health check endpoint to verify backend status.

**Response**:
```json
{
  "status": "healthy",
  "models_loaded": true
}
```

### `POST /predict`
Predict collision probability and uncertainty.

**Request**:
```json
{
  "node_features": [[x, y, z, x_dot, y_dot, z_dot, cr_r, ct_t, cn_n], ...],
  "edge_features": [[miss_distance, relative_speed, angle_R_V_rel_deg, log_Error_Volume, Miss_over_SigmaR, Delta_Inclination_deg, Delta_SMA_km]],
  "edge_index": [[0, 1], [1, 0]],
  "mc_samples": 100
}
```

**Response**:
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

## Model Architecture

### Physics-Informed GAT
- **Stage 1**: Initial risk assessment for all events
- **Stage 2**: High-precision refinement for top 5% risk events
- **Uncertainty Quantification**: MC-Dropout for epistemic uncertainty + learned aleatoric uncertainty

### Input Features

**Node Features** (per satellite):
- Position: x, y, z (km)
- Velocity: x_dot, y_dot, z_dot (km/s)
- Covariance: cr_r, ct_t, cn_n (km²)

**Edge Features** (per conjunction):
- Miss distance (m)
- Relative speed (km/s)
- Angle between R and V_rel (degrees)
- Log error volume
- Miss over SigmaR
- Delta inclination (degrees)
- Delta semi-major axis (km)

## Improvements Made

1. ✅ **Cesium 3D Visualization**: Fully functional orbital visualization
2. ✅ **API Integration**: Complete backend integration with type safety
3. ✅ **Error Handling**: Comprehensive error handling and loading states
4. ✅ **TypeScript Types**: Strong typing throughout the application
5. ✅ **Custom Hooks**: Reusable API hooks for better code organization
6. ✅ **Environment Configuration**: Proper environment variable setup
7. ✅ **Build Optimization**: Vite configuration optimized for Cesium

## Deployment

### Frontend Deployment
The frontend can be deployed to:
- **Vercel**: Zero-config deployment
- **Netlify**: Automatic builds from Git
- **Lovable**: Built-in deployment platform

### Backend Deployment
The backend can be deployed to:
- **Railway**: Auto-deploy from GitHub
- **Render**: Python web service
- **Google Cloud Run**: Containerized deployment
- **Fly.io**: Edge deployment

After deploying the backend, update the `VITE_PYTHON_BACKEND_URL` environment variable in your frontend deployment settings.

## Performance Considerations

1. **Cesium Assets**: Cesium is excluded from pre-bundling to avoid build issues
2. **Chunk Size**: Increased to 2000KB to accommodate Cesium
3. **Lazy Loading**: Components can be lazy-loaded for better initial load time
4. **API Caching**: React Query caches API responses automatically

## Known Limitations

1. **CDM Parsing**: Currently returns mock data; real CDM parsing needs implementation
2. **Multi-Event Analysis**: Currently processes single events; batch processing can be added
3. **Real-time Updates**: No WebSocket support for real-time conjunction updates
4. **Authentication**: No user authentication system implemented

## Future Enhancements

1. **Real CDM Parser**: Implement XML/CSV CDM file parsing
2. **Batch Processing**: Support multiple event analysis
3. **Historical Data**: Store and analyze historical conjunction data
4. **Alerts System**: Real-time alerts for high-risk events
5. **Advanced Visualization**: Orbital trajectory predictions over time
6. **Export Functionality**: PDF report generation
7. **User Management**: Authentication and user-specific dashboards

## License

This project is part of the Lovable platform ecosystem.

## Support

For issues or questions, please check:
- Frontend: React, TypeScript, Cesium documentation
- Backend: FastAPI, PyTorch documentation
- Project-specific issues: GitHub repository
