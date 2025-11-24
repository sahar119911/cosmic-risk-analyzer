# Cosmic Risk Analyzer

A Physics-Informed Graph Attention Network (PI-GAT) based conjunction assessment system for analyzing satellite collision risks.

## 🚀 Features

- **3D Orbital Visualization**: Interactive Cesium.js-powered globe with satellite tracking
- **AI-Powered Risk Assessment**: Physics-informed GAT model with uncertainty quantification
- **Two-Stage Prediction**: Stage-1 for all events, Stage-2 refinement for high-risk cases
- **Real-time Analysis**: Upload CDM files and get instant collision probability predictions
- **Comprehensive Dashboard**: Risk categorization, uncertainty metrics, and detailed event views

## Project info

**URL**: https://lovable.dev/projects/c7510656-d214-4a50-a852-9b88449406df

## 🏗️ Architecture

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Cesium.js** for 3D visualization
- **shadcn/ui** components
- **Tailwind CSS** for styling
- **React Query** for state management

### Backend
- **FastAPI** Python server
- **PyTorch** for ML models
- **Physics-Informed GAT** with MC-Dropout
- Dual-stage prediction system

## 🚦 Quick Start

### Frontend Setup
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Backend Setup
```bash
# Navigate to backend
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run FastAPI server
python main.py
```

The frontend will be available at `http://localhost:8080` and the backend API at `http://localhost:8000`.

## 📚 Documentation

See [IMPLEMENTATION.md](./IMPLEMENTATION.md) for detailed technical documentation, API reference, and deployment guide.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c7510656-d214-4a50-a852-9b88449406df) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c7510656-d214-4a50-a852-9b88449406df) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
