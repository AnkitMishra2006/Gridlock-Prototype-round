# GuardianEye - Free Deployment Strategy

Complete guide to deploy all services for **FREE** (no payment required).

---

## 🎯 **Deployment Architecture**

```
┌─────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                       │
│              https://guardianeye.vercel.app             │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────────┐
│         FRONTEND (React + TanStack Router)              │
│                Vercel (Free Tier)                       │
│  • Automatic HTTPS                                      │
│  • CDN (Global)                                         │
│  • Unlimited bandwidth                                  │
│  • Auto-deploy from Git                                 │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API
                       ▼
┌─────────────────────────────────────────────────────────┐
│           BACKEND (FastAPI + MongoDB)                   │
│              Railway.app (Free Tier)                    │
│  • $5 free credit/month                                │
│  • Automatic HTTPS                                      │
│  • Environment variables                                │
│  • Auto-deploy from Git                                 │
└──────────────────────┬──────────────────────────────────┘
                       │ MongoDB Connection
                       ▼
┌─────────────────────────────────────────────────────────┐
│              DATABASE (MongoDB)                         │
│           MongoDB Atlas (Free Tier)                     │
│  • 512 MB storage                                       │
│  • Shared cluster                                       │
│  • Automatic backups                                    │
│  • Global regions                                       │
└─────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│               AI MODEL (YOLOv8)                         │
│          Hugging Face Spaces (Free)                     │
│  OR Google Colab (Free Tier)                            │
│  • GPU access (limited)                                 │
│  • API endpoint                                         │
│  • Automatic model hosting                              │
└─────────────────────────────────────────────────────────┘
```

---

## 1️⃣ **Deploy Frontend** (Vercel - FREE)

### Why Vercel?
- ✅ Completely FREE for personal projects
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Auto-deploy on Git push
- ✅ Zero configuration needed

### Step-by-Step:

#### A. Prepare Frontend
```bash
cd frontend

# Create production build
npm run build

# Test locally (optional)
npm run preview
```

#### B. Deploy to Vercel

**Option 1: Using Vercel CLI (Recommended)**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel

# Follow prompts:
# - Select scope: Your account
# - Link to existing project: N
# - Project name: guardianeye
# - Directory: ./
# - Override settings: N

# Production deployment
vercel --prod
```

**Option 2: Using Vercel Dashboard**
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "New Project"
4. Import your repository
5. Select `frontend` directory
6. Click "Deploy"

#### C. Configure Environment Variables
```bash
# In Vercel Dashboard:
# Settings → Environment Variables

VITE_API_URL=https://your-backend.railway.app/api
```

#### D. Custom Domain (Optional)
```
# Vercel provides free domain:
your-project.vercel.app

# Or add custom domain:
# Settings → Domains → Add Domain
```

### ✅ Result:
```
Frontend URL: https://guardianeye.vercel.app
Status: Live
SSL: Automatic
CDN: Global
Cost: $0/month
```

---

## 2️⃣ **Deploy Backend** (Railway - FREE)

### Why Railway?
- ✅ $5 free credit per month (~550 hours)
- ✅ Auto-deploys from Git
- ✅ Environment variables
- ✅ Automatic HTTPS
- ✅ Easy database connection

### Step-by-Step:

#### A. Prepare Backend

Create `railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Create `Procfile`:
```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Update `requirements.txt`:
```txt
fastapi==0.115.0
uvicorn[standard]==0.32.0
motor==3.6.0
pydantic==2.9.0
pydantic-settings==2.5.0
python-multipart==0.0.12
python-dotenv==1.0.1
aiofiles==24.1.0
pymongo==4.10.1
```

#### B. Deploy to Railway

**Option 1: Using Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd backend
railway init

# Deploy
railway up

# Add MongoDB
railway add mongodb

# Set environment variables
railway variables set MONGODB_URL=${{MONGODB_URL}}
railway variables set DATABASE_NAME=guardianeye
railway variables set FRONTEND_URL=https://your-frontend.vercel.app
```

**Option 2: Using Railway Dashboard**
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Select `backend` directory
7. Click "Deploy"

#### C. Configure Environment Variables
```bash
# In Railway Dashboard:
# Variables tab

MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/guardianeye
DATABASE_NAME=guardianeye
API_HOST=0.0.0.0
API_PORT=$PORT
FRONTEND_URL=https://guardianeye.vercel.app
DEBUG=false
```

#### D. Add Custom Domain (Optional)
```
# Railway provides:
your-app.railway.app

# Or add custom domain:
# Settings → Domains
```

### ✅ Result:
```
Backend URL: https://guardianeye-backend.railway.app
API Docs: https://guardianeye-backend.railway.app/docs
Status: Live
SSL: Automatic
Cost: $0/month (within free tier)
```

---

## 3️⃣ **Deploy Database** (MongoDB Atlas - FREE)

### Why MongoDB Atlas?
- ✅ 512 MB free storage
- ✅ Shared cluster
- ✅ Auto backups
- ✅ No credit card required

### Step-by-Step:

#### A. Create Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up (no credit card needed)
3. Create free cluster

#### B. Configure Cluster
```
1. Choose: M0 Sandbox (FREE)
2. Region: Choose closest to you
3. Cluster Name: guardianeye-cluster
4. Click "Create"
```

#### C. Create Database User
```
Security → Database Access → Add New User
Username: guardianeye
Password: <generate strong password>
Role: Read and write to any database
```

#### D. Whitelist IP Addresses
```
Security → Network Access → Add IP Address
Option 1: Allow access from anywhere
  IP: 0.0.0.0/0 (for Railway/Vercel)

Option 2: Add specific IPs
  Railway IP: Get from Railway settings
  Your IP: For local development
```

#### E. Get Connection String
```
Deployment → Database → Connect
→ Connect your application
→ Copy connection string

Format:
mongodb+srv://<username>:<password>@cluster.mongodb.net/<database>

Example:
mongodb+srv://guardianeye:password123@cluster0.abc123.mongodb.net/guardianeye
```

### ✅ Result:
```
Database: guardianeye
Connection: mongodb+srv://...
Storage: 512 MB
Cost: $0/month
```

---

## 4️⃣ **Deploy AI Model** (Hugging Face Spaces - FREE)

### Why Hugging Face Spaces?
- ✅ Free GPU access
- ✅ Automatic API endpoint
- ✅ Model hosting
- ✅ Easy integration

### Alternative: Google Colab

Since your model is already in Google Colab, we'll use that initially.

### Step-by-Step (Google Colab):

#### A. Create API Wrapper
Create new notebook or add to existing:

```python
from flask import Flask, request, jsonify
from pyngrok import ngrok
import threading

app = Flask(__name__)

@app.route('/detect', methods=['POST'])
def detect_violations():
    try:
        # Get image from request
        image_file = request.files['image']
        
        # Process with your models
        result = process_image(image_file)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def process_image(image):
    # Your existing detection code here
    helmet_results = helmet_model.predict(image)
    redlight_results = redlight_model.predict(image)
    # ... rest of your code
    
    return {
        'timestamp': str(datetime.now()),
        'violations': violations,
        'license_plates': plates,
        # ... rest of output
    }

# Start Flask in background
def run_flask():
    app.run(port=5000)

threading.Thread(target=run_flask).start()

# Expose with ngrok
public_url = ngrok.connect(5000)
print(f"API URL: {public_url}")
```

#### B. Keep Colab Alive
```python
# Install
!pip install kora

# Keep alive
from kora.install import colab_keep_alive
colab_keep_alive()
```

### Step-by-Step (Hugging Face Spaces):

#### A. Create Space
1. Go to https://huggingface.co
2. Sign up
3. Create New → Space
4. Name: guardianeye-detector
5. SDK: Gradio or FastAPI
6. Visibility: Public

#### B. Upload Model Files
```bash
# Clone space
git clone https://huggingface.co/spaces/your-username/guardianeye-detector

# Add your files
cp -r model/models/* guardianeye-detector/
cp model/GuardianEye_Final.ipynb guardianeye-detector/

# Commit and push
cd guardianeye-detector
git add .
git commit -m "Add model"
git push
```

#### C. Create API Endpoint
Create `app.py`:
```python
from fastapi import FastAPI, File, UploadFile
from ultralytics import YOLO
import json

app = FastAPI()

# Load models
helmet_model = YOLO('models/helmet_model/weights/best.pt')
# ... load other models

@app.post("/detect")
async def detect(image: UploadFile = File(...)):
    # Process image
    results = process_image(image.file)
    return results

def process_image(image):
    # Your detection logic
    pass
```

### ✅ Result:
```
Model API: https://your-space.hf.space/detect
OR
Colab API: https://xxx.ngrok.io/detect
Cost: $0/month
```

---

## 5️⃣ **Connect Everything**

### Update Backend to Call Model

Edit `backend/app/services/incident_service.py`:

```python
import requests

MODEL_API_URL = os.getenv('MODEL_API_URL', 'https://your-model-api.com/detect')

async def process_camera_image(image_url):
    # Download image
    response = requests.get(image_url)
    image_data = response.content
    
    # Send to model
    files = {'image': image_data}
    model_response = requests.post(
        f"{MODEL_API_URL}/detect",
        files=files
    )
    
    # Get detection results
    detection = model_response.json()
    
    # Create incident
    await service.create_from_detection(detection)
```

### Update Environment Variables

**Backend (Railway):**
```bash
MODEL_API_URL=https://your-model-api.com/detect
```

**Frontend (Vercel):**
```bash
VITE_API_URL=https://your-backend.railway.app/api
```

---

## 📊 **Cost Summary**

| Service | Platform | Free Tier | Cost |
|---------|----------|-----------|------|
| Frontend | Vercel | Unlimited | $0 |
| Backend | Railway | $5 credit/month | $0 |
| Database | MongoDB Atlas | 512 MB | $0 |
| Model | HF Spaces/Colab | Limited GPU | $0 |
| **TOTAL** | | | **$0/month** |

---

## 🚀 **Quick Deploy Script**

```bash
#!/bin/bash

# Deploy Frontend
cd frontend
vercel --prod

# Deploy Backend
cd ../backend
railway up

# Get URLs
FRONTEND_URL=$(vercel inspect --prod | grep "url" | awk '{print $2}')
BACKEND_URL=$(railway status | grep "url" | awk '{print $2}')

echo "✅ Deployment Complete!"
echo "Frontend: $FRONTEND_URL"
echo "Backend: $BACKEND_URL"
echo "Next: Update environment variables in Vercel and Railway dashboards"
```

---

## 🔧 **Post-Deployment**

### 1. Test APIs
```bash
# Test backend health
curl https://your-backend.railway.app/health

# Test API docs
open https://your-backend.railway.app/docs

# Test frontend
open https://your-frontend.vercel.app
```

### 2. Monitor Services
```
Vercel Dashboard:
  - View deployments
  - Check analytics
  - View logs

Railway Dashboard:
  - View metrics
  - Check logs
  - Monitor usage

MongoDB Atlas:
  - View metrics
  - Check connections
  - Monitor storage
```

### 3. Set Up Alerts
```
Railway:
  - Settings → Webhooks
  - Add Discord/Slack webhook for alerts

Vercel:
  - Settings → Notifications
  - Enable deployment notifications

MongoDB:
  - Alerts → Add Alert
  - Set up disk usage alert
```

---

## 🆘 **Troubleshooting**

### Frontend Not Loading
```
1. Check Vercel build logs
2. Verify environment variables
3. Check browser console
4. Test API connection
```

### Backend Not Responding
```
1. Check Railway logs: railway logs
2. Verify MongoDB connection
3. Check environment variables
4. Test locally first
```

### Database Connection Failed
```
1. Check IP whitelist in Atlas
2. Verify connection string
3. Check username/password
4. Test with MongoDB Compass
```

### Model API Timeout
```
1. Check Colab session status
2. Verify ngrok tunnel
3. Consider Hugging Face Spaces
4. Add request timeout handling
```

---

## 🎯 **Alternative Free Platforms**

### Frontend Alternatives:
1. **Netlify** - Similar to Vercel
2. **GitHub Pages** - For static sites
3. **Cloudflare Pages** - Fast CDN

### Backend Alternatives:
1. **Render** - $0 free tier (sleeps after inactivity)
2. **Fly.io** - Free allowances
3. **Heroku** - (No longer free)

### Database Alternatives:
1. **Supabase** - PostgreSQL free tier
2. **PlanetScale** - MySQL free tier
3. **Neon** - Serverless Postgres

### Model Hosting Alternatives:
1. **Replicate** - Pay per use
2. **AWS Lambda** - Free tier (limited)
3. **Google Cloud Run** - Free tier

---

## 📝 **Deployment Checklist**

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway
- [ ] MongoDB Atlas cluster created
- [ ] Database connection working
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] Model API accessible
- [ ] Frontend can reach backend
- [ ] Backend can reach database
- [ ] Backend can reach model
- [ ] Test all pages work
- [ ] Test alert sending
- [ ] Test data fetching
- [ ] Check logs for errors
- [ ] Set up monitoring
- [ ] Document URLs

---

## 🎉 **Final URLs**

After deployment, update these in your documentation:

```
Frontend: https://guardianeye.vercel.app
Backend API: https://guardianeye.railway.app/api
API Docs: https://guardianeye.railway.app/docs
Model API: https://xxx.ngrok.io/detect (or HF Space)
MongoDB: mongodb+srv://cluster.mongodb.net/guardianeye

GitHub Repo: https://github.com/your-username/guardianeye
Demo Video: <YouTube link>
Presentation: <Google Slides link>
```

---

## 💡 **Pro Tips**

1. **Use Git**: Deploy automatically on push
2. **Environment Variables**: Never commit secrets
3. **Logs**: Check logs regularly
4. **Monitoring**: Set up alerts
5. **Backups**: MongoDB Atlas does automatic backups
6. **Documentation**: Keep URLs updated
7. **Testing**: Test in production before demo

---

**Total Setup Time: 2-3 hours**  
**Total Cost: $0/month** ✅

---

**You now have a production-ready, free deployment! 🚀**
