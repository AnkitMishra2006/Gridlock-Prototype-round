# 🚀 Quick Start - Demo Setup

Follow these steps to get everything running for your demo.

---

## ⚡ Prerequisites

1. **Python 3.9+** installed
2. **MongoDB** installed
3. **Node.js 18+** installed (for frontend)

### Install MongoDB (if not installed):

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu/Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

**Windows:**
Download from https://www.mongodb.com/try/download/community

---

## 🔥 Step 1: Start Backend (5 minutes)

```bash
# Go to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# The .env file is already created with default settings
# Start MongoDB (if not auto-started)
brew services start mongodb-community  # macOS

# Start the backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend will be running at:** http://localhost:8000  
**API Documentation:** http://localhost:8000/docs

---

## ✅ Step 2: Test Backend (2 minutes)

Open a new terminal:

```bash
cd backend

# Make test script executable
chmod +x test_api.py

# Run tests
python3 test_api.py
```

This will:
- ✅ Check if backend is running
- ✅ Create a test incident from your model output
- ✅ Verify all APIs are working
- ✅ Send a mock police alert

---

## 🎨 Step 3: Start Frontend (3 minutes)

Open a new terminal:

```bash
cd frontend

# Install dependencies (if not already done)
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000/api" > .env

# Start frontend
npm run dev
```

**Frontend will be running at:** http://localhost:5173 or http://localhost:3000

---

## 🔌 Step 4: Integrate Frontend with Backend (10 minutes)

### Option A: Quick Test (Without Code Changes)

1. Open http://localhost:8000/docs
2. Try the APIs directly from Swagger UI
3. Use your frontend with mock data for demo
4. Show backend API separately

### Option B: Full Integration (Recommended)

1. Create `frontend/src/lib/api-client.ts` with the code from INTEGRATION_GUIDE.md
2. Update each route file to use `api-client` instead of mock data
3. Test all pages

**Key files to update:**
- `routes/index.tsx` - Dashboard
- `routes/violations.tsx` - Violations page
- `routes/alerts.tsx` - Alert center

---

## 📊 Step 5: Populate Demo Data (5 minutes)

### Option 1: Use Your Model Outputs

```bash
cd backend

# Send all model outputs to backend
for file in ../model/evidence/*.json; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    curl -X POST "http://localhost:8000/api/incidents/" \
      -H "Content-Type: application/json" \
      -d @"$file"
  fi
done
```

### Option 2: Use the Test Script Multiple Times

```bash
# Run test script 10 times to create multiple incidents
for i in {1..10}; do
  python3 test_api.py
  sleep 1
done
```

---

## 🎯 Verify Everything is Working

### 1. Backend Health
```bash
curl http://localhost:8000/health
```
Should return: `{"status": "healthy", "database": "connected"}`

### 2. Dashboard Stats
```bash
curl http://localhost:8000/api/dashboard/stats
```
Should return statistics with violation counts

### 3. Get Incidents
```bash
curl http://localhost:8000/api/incidents?limit=10
```
Should return list of incidents

### 4. Frontend
- Open http://localhost:5173
- Dashboard should show metrics (either mock or real data)
- Violations page should show incidents
- Alert center should work

---

## 🎬 Demo Checklist

Before your presentation, verify:

- [ ] Backend is running (http://localhost:8000)
- [ ] MongoDB is connected
- [ ] Database has sample incidents (at least 10)
- [ ] Frontend is running (http://localhost:5173)
- [ ] API documentation is accessible (http://localhost:8000/docs)
- [ ] Evidence images are accessible (http://localhost:8000/evidence/)
- [ ] You can create a new incident via API
- [ ] You can send alerts via API
- [ ] Dashboard shows statistics
- [ ] Violations page shows incidents
- [ ] You have your model ready to demonstrate live detection

---

## 🐛 Troubleshooting

### MongoDB Not Starting
```bash
# Check if MongoDB is installed
mongod --version

# Start MongoDB service
brew services start mongodb-community  # macOS
sudo systemctl start mongodb          # Linux
```

### Port Already in Use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill

# Or use different port
uvicorn app.main:app --reload --port 8001
```

### Backend Dependencies Error
```bash
# Upgrade pip
pip install --upgrade pip

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Frontend Not Connecting to Backend
1. Check CORS settings in `backend/app/main.py`
2. Verify `VITE_API_URL` in `frontend/.env`
3. Check browser console for errors
4. Check Network tab in DevTools

---

## 📱 Demo Flow Suggestion

### 1. Introduction (1 min)
"GuardianEye is an AI-powered traffic violation detection system that not only catches violations but also saves lives by automatically dispatching emergency services."

### 2. Show the Problem (30 sec)
"Currently, traffic monitoring is manual, slow, and inconsistent. Our system automates this entire process."

### 3. Live Demo (3-4 min)

**Part A: AI Detection**
- Show your model notebook
- Upload a test image
- Show detection output (JSON)

**Part B: Backend Processing**
- Open http://localhost:8000/docs
- Show POST /api/incidents/ endpoint
- Send the detection JSON
- Show it creates an incident

**Part C: Dashboard**
- Open frontend dashboard
- Show real-time metrics
- Show violation trend chart
- Show recent incidents

**Part D: Alert System**
- Open Alert Center
- Send a police alert
- Show the alert message preview
- Explain hospital alerts for accidents

**Part E: Innovation**
- Show heatmap for violation hotspots
- Show repeat offender search
- Explain "Golden Hour" life-saving feature

### 4. Future Roadmap (1 min)
- IoT device for police
- City-wide deployment
- Auto-challan generation
- Mobile app

### 5. Q&A
Be ready to explain:
- Tech stack (YOLOv8, FastAPI, MongoDB, React)
- Scalability (can handle multiple cameras, edge computing)
- Accuracy (show confidence scores)
- Privacy (blur faces, secure data)

---

## 🏆 Tips for Winning

1. **Practice the demo** - Run through it 5 times
2. **Have backup** - Screenshots if live demo fails
3. **Tell a story** - "We're saving lives, not just catching violations"
4. **Show confidence** - You built a complete system!
5. **Be honest** - If asked about limitations, acknowledge and explain how you'd solve them
6. **Emphasize innovation** - Hospital alerts are your differentiator
7. **Think big** - Explain how this scales to entire city
8. **Be passionate** - Show you care about road safety

---

## 🎉 You're Ready!

Your system is production-ready for the demo. You have:
- ✅ Working AI model
- ✅ Complete backend with all features
- ✅ Beautiful frontend UI
- ✅ Innovation (life-saving alerts)
- ✅ Clear roadmap

**Go win this! 🚀🏆**
