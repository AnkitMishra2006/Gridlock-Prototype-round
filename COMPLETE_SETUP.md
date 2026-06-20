# GuardianEye - Complete Setup Guide

## System Architecture

```
┌─────────────┐
│   Camera    │ (captures traffic)
└──────┬──────┘
       │
       │ Image Upload
       ▼
┌─────────────────────────────────┐
│         BACKEND API             │
│      (FastAPI - Port 8000)      │
│                                 │
│  /api/process/upload            │
│  - Receives image               │
│  - Forwards to Model API        │
│  - Stores results in MongoDB    │
└────────┬─────────────┬──────────┘
         │             │
         │ HTTP POST   │ MongoDB
         ▼             ▼
┌─────────────┐  ┌──────────┐
│  MODEL API  │  │ Database │
│   (Port     │  │ MongoDB  │
│    8001)    │  └──────────┘
│             │
│ - YOLOv8    │
│ - 14 Models │
│ - Detection │
└─────────────┘
         │
         │ Results
         ▼
┌─────────────────────────────────┐
│        FRONTEND UI              │
│     (React - Port 5173)         │
│                                 │
│  - Dashboard                    │
│  - Violations List              │
│  - Alerts Center                │
└─────────────────────────────────┘
```

## Prerequisites

1. **Python 3.10+**
2. **Node.js 18+**
3. **MongoDB**
4. **pip** and **npm**

## Installation

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env  # If needed
# Edit .env to set MODEL_API_URL

# Start backend
uvicorn app.main:app --reload
```

Backend will run on: http://localhost:8000

### 2. Model API Setup

**Option A: Local Model Server**

```bash
cd model

# Install dependencies
pip install -r requirements.txt

# Start model API
python3 model_api.py
```

Model API will run on: http://localhost:8001

**Option B: Google Colab + ngrok**

1. Upload `model/GuardianEye_Fina1l.ipynb` to Colab
2. Add this code to serve the model:

```python
# In Colab notebook
!pip install pyngrok fastapi uvicorn ultralytics

from pyngrok import ngrok
import uvicorn
import nest_asyncio
nest_asyncio.apply()

# Start ngrok tunnel
public_url = ngrok.connect(8001)
print(f"Model API URL: {public_url}")

# Run the model API from model_api.py code
# ...
```

3. Copy the ngrok URL and update `backend/.env`:
```
MODEL_API_URL=https://xxxx-xxx-xxx-xxx.ngrok-free.app
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure API URL
# Check frontend/.env - should have:
# VITE_API_URL=http://localhost:8000/api

# Start frontend
npm run dev
```

Frontend will run on: http://localhost:5173

### 4. MongoDB Setup

```bash
# macOS
brew services start mongodb-community

# Ubuntu
sudo systemctl start mongod

# Windows
# Start MongoDB from Services or MongoDB Compass
```

## Quick Start

```bash
# Use the automated script
./start_all.sh

# Or manually in 3 terminals:

# Terminal 1: Backend
cd backend && source venv/bin/activate
uvicorn app.main:app --reload

# Terminal 2: Model API
cd model
python3 model_api.py

# Terminal 3: Frontend
cd frontend
npm run dev
```

## Testing the Complete Pipeline

### Test 1: Health Checks

```bash
# Backend
curl http://localhost:8000/health

# Model API
curl http://localhost:8001/health

# Frontend
open http://localhost:5173
```

### Test 2: Run Automated Tests

```bash
# From project root
python3 test_pipeline.py
```

### Test 3: Manual Image Upload

```bash
# Upload an image through backend
curl -X POST http://localhost:8000/api/process/upload \
  -F "file=@path/to/image.jpg" \
  -F "camera_id=TEST-001" \
  -F "location=Test Location"
```

### Test 4: Simulation (No Image Needed)

```bash
# Create a simulated incident
curl -X POST http://localhost:8000/api/process/simulate \
  -F "camera_id=TEST-002" \
  -F "violation_type=red_light"
```

### Test 5: Check Frontend

1. Open http://localhost:5173
2. Go to Dashboard - should show metrics
3. Go to Violations - should show incidents
4. Click on an incident to see details

## API Endpoints

### Backend (Port 8000)

**Processing:**
- `POST /api/process/upload` - Upload image for detection
- `POST /api/process/simulate` - Simulate detection (testing)
- `GET /api/process/model-health` - Check model availability

**Incidents:**
- `POST /api/incidents/` - Create incident manually
- `GET /api/incidents/` - List all incidents
- `GET /api/incidents/{id}` - Get incident details
- `PATCH /api/incidents/{id}/status` - Update status

**Alerts:**
- `POST /api/alerts/send-police` - Send police alert
- `POST /api/alerts/send-hospital` - Send hospital alert
- `GET /api/alerts/` - List alerts

**Dashboard:**
- `GET /api/dashboard/stats` - Get dashboard metrics
- `GET /api/dashboard/heatmap` - Get heatmap data

**Documentation:**
- http://localhost:8000/docs - Swagger UI
- http://localhost:8000/redoc - ReDoc

### Model API (Port 8001)

- `POST /detect` - Detect violations in image
- `GET /health` - Health check
- http://localhost:8001/docs - API Documentation

## Data Flow

### Complete Pipeline:

1. **Camera Capture** → Image file
2. **Upload to Backend** → `POST /api/process/upload`
3. **Backend → Model** → Sends image to Model API
4. **Model Processing** → Runs YOLOv8 detection
5. **Model → Backend** → Returns violations JSON
6. **Backend Processing** → Creates incident, stores in MongoDB
7. **Backend → Frontend** → Auto-refresh shows new incident
8. **Alert Dispatch** → If critical, sends alerts

### Alternative: Direct Model Output

If you already have model output (from Colab):

1. Get JSON from model
2. POST to `POST /api/incidents/` directly
3. Skip upload endpoint

## Configuration

### Backend (.env)

```env
# MongoDB
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=guardianeye

# Model API
MODEL_API_URL=http://localhost:8001
# For Colab: MODEL_API_URL=https://xxxx.ngrok-free.app

# API
API_PORT=8000
DEBUG=true
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000/api
```

## Troubleshooting

### Model API Connection Failed

**Problem**: Backend can't reach Model API

**Solutions**:
1. Check Model API is running: `curl http://localhost:8001/health`
2. Check `MODEL_API_URL` in `backend/.env`
3. If using Colab, update with ngrok URL
4. Use simulation endpoint for testing without model

### No Violations Detected

**Problem**: Model returns empty violations

**Causes**:
1. Image quality too poor
2. No actual violations in image
3. Model confidence threshold too high

**Solutions**:
1. Use test images from `model/evidence/`
2. Use simulation endpoint: `POST /api/process/simulate`
3. Check model logs

### Frontend Not Showing Data

**Problem**: Dashboard is empty

**Solutions**:
1. Check backend is running
2. Check `VITE_API_URL` in `frontend/.env`
3. Open browser console (F12) for errors
4. Create test data: `curl -X POST http://localhost:8000/api/process/simulate -F "camera_id=TEST" -F "violation_type=red_light"`

### MongoDB Connection Error

**Problem**: Backend can't connect to MongoDB

**Solutions**:
1. Start MongoDB: `brew services start mongodb-community`
2. Check `MONGODB_URL` in `backend/.env`
3. Verify MongoDB is running: `pgrep mongod`

## Demo Mode (Without Model)

If you can't run the model API:

1. Start only Backend and Frontend
2. Use simulation endpoint to create incidents:

```bash
# Create multiple simulated incidents
for type in red_light no_helmet overspeeding accident; do
  curl -X POST http://localhost:8000/api/process/simulate \
    -F "camera_id=DEMO-$(date +%s)" \
    -F "violation_type=$type"
done
```

3. Frontend will show the simulated incidents
4. For demo, explain: "Model runs on Colab/Cloud"

## Deployment Options

### Model API:
- **Local**: Use `model_api.py` (development)
- **Colab**: Use with ngrok (demo)
- **Hugging Face Spaces**: Deploy as Space (production)
- **AWS/GCP**: Deploy with GPU (production)

### Backend:
- **Railway**: Free tier (recommended)
- **Heroku**: Free tier
- **Render**: Free tier
- **AWS/GCP**: Production

### Frontend:
- **Vercel**: Free unlimited (recommended)
- **Netlify**: Free tier
- **GitHub Pages**: Free

### Database:
- **MongoDB Atlas**: Free 512MB (recommended)
- **Railway**: Included with backend
- **Self-hosted**: For development

## Next Steps

1. ✅ Run `./start_all.sh` to see what's needed
2. ✅ Start all three services
3. ✅ Run `python3 test_pipeline.py` to verify
4. ✅ Open http://localhost:5173
5. ✅ Upload test image or use simulation
6. ✅ Verify data flows through system
7. ✅ Practice demo presentation

## Support

Check these files for more info:
- `PROJECT_CONTEXT.md` - Project overview
- `DEPLOYMENT_STRATEGY.md` - Deployment guides
- `MODEL_EXPLANATION.md` - How the AI works
- `TLDR.md` - Quick summary

## System is Complete When:

- [ ] Backend starts without errors
- [ ] Model API responds to health check
- [ ] Frontend loads and shows UI
- [ ] MongoDB is connected
- [ ] Upload endpoint works
- [ ] Incidents appear in dashboard
- [ ] Alerts can be sent
- [ ] All tests in `test_pipeline.py` pass

✅ **You're ready for the demo!**
