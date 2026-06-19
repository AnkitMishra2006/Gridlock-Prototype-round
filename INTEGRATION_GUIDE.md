# GuardianEye - Complete Integration & Features Guide

This document explains the entire system architecture, how everything works together, what's implemented, and what needs to be completed.

---

## 🏗️ **System Architecture Overview**

```
┌──────────────────┐
│  Traffic Camera  │
│  (Physical/Feed) │
└────────┬─────────┘
         │
         │ Image/Video Stream
         ▼
┌────────────────────────────────────┐
│    AI MODEL (Your Friend's Work)   │
│  ──────────────────────────────   │
│  • YOLOv8 Detection Models        │
│  • Helmet, Seatbelt, RedLight     │
│  • Wrong Way, Accidents, etc.     │
│  • License Plate OCR              │
│  • Severity Scoring               │
└────────┬───────────────────────────┘
         │
         │ JSON Output
         ▼
    {
      "timestamp": "...",
      "camera_id": "CAM_001",
      "violations": [...],
      "license_plates": [...]
    }
         │
         ▼
┌────────────────────────────────────┐
│    BACKEND (FastAPI + MongoDB)    │
│  ──────────────────────────────   │
│  POST /api/incidents               │
│  • Receives JSON from model       │
│  • Stores in database             │
│  • Calculates analytics           │
│  • Triggers alerts                │
│  • Tracks repeat offenders        │
│  • Updates camera status          │
└────────┬───────────────────────────┘
         │
         │ REST API / WebSocket
         ▼
┌────────────────────────────────────┐
│    FRONTEND (React + TanStack)    │
│  ──────────────────────────────   │
│  • Dashboard Overview             │
│  • Live Violations Feed           │
│  • Alert Management               │
│  • Heatmap Visualization          │
│  • Vehicle History Search         │
│  • Incident Details               │
└────────┬───────────────────────────┘
         │
         │ Alert Dispatch
         ▼
    ┌────────┐
    │ Alerts │
    └────┬───┘
         ├──────► 🚔 Police Station
         ├──────► 🏥 Hospital
         └──────► 🚑 Ambulance
```

---

## 📊 **Data Flow Explained**

### Step 1: Model Detection
1. Camera captures image/video
2. AI model processes frame
3. Detects violations (helmet, seatbelt, etc.)
4. Reads license plates (OCR)
5. Calculates confidence scores
6. Assigns severity levels
7. Outputs JSON

**Example Model Output**:
```json
{
  "timestamp": "2026-06-18 06:48:46",
  "camera_id": "CAM_001",
  "location": "Delhi, India",
  "peak_hour": "🟢 NORMAL HOURS",
  "weather": "☀️ CLEAR",
  "total_score": 48,
  "overall_severity": "🔴 CRITICAL",
  "violations": [
    {
      "type": "helmet",
      "class": "driver",
      "confidence": 0.91,
      "score": 5,
      "severity": "🟡 MEDIUM",
      "time": "2026-06-18 06:48:26"
    },
    {
      "type": "redlight",
      "class": "red_light",
      "confidence": 0.83,
      "score": 9,
      "severity": "🔴 CRITICAL",
      "time": "2026-06-18 06:48:28"
    }
  ],
  "license_plates": ["BD5314"],
  "alert_sent": false,
  "image": "violation_20260618_064846.jpg"
}
```

### Step 2: Backend Processing
Backend receives this JSON at `POST /api/incidents/`:

1. **Parse & Validate** - Validates JSON structure
2. **Calculate Severity** - Determines overall severity
3. **Extract Primary Violation** - Identifies main violation type
4. **Generate Unique ID** - Creates incident ID (e.g., INC-20260618-1234)
5. **Store in Database** - Saves to MongoDB `incidents` collection
6. **Update Camera** - Updates camera last_seen timestamp
7. **Track Offender** - Updates/creates offender record for license plate
8. **Return Response** - Sends confirmation with incident ID

**What Backend Stores**:
```javascript
{
  incident_id: "INC-20260618-1234",
  camera_id: "CAM_001",
  timestamp: ISODate("2026-06-18T06:48:46Z"),
  location: {
    name: "Delhi, India",
    lat: 28.6139,
    lng: 77.2090
  },
  violation_type: "redlight",  // Primary violation
  severity: "critical",
  total_score: 48,
  confidence: 0.87,  // Average confidence
  license_plates: ["BD5314"],
  violations: [...],  // Full violations array
  evidence_image: "violation_20260618_064846.jpg",
  status: "new",
  alert_sent: false,
  alerts: [],
  created_at: ISODate(),
  updated_at: ISODate()
}
```

### Step 3: Frontend Display
Frontend polls or receives WebSocket updates:

1. **Dashboard** - Shows real-time metrics
2. **Violations Page** - Lists all incidents with filters
3. **Incident Detail** - Shows full violation details
4. **Alert Center** - Manages alert dispatch

---

## 🔌 **API Endpoints - What Each Does**

### 1. Incident Management

#### `POST /api/incidents/`
**Purpose**: Create incident from AI model output  
**Used by**: AI model (automated)  
**Input**: Full detection JSON from model  
**Output**: Created incident with ID  
**Frontend Usage**: Not directly used (model calls it)

#### `GET /api/incidents/`
**Purpose**: Get all incidents with filters  
**Used by**: Violations page, Dashboard  
**Query Params**:
- `skip`, `limit` - Pagination
- `severity` - Filter by severity
- `status` - Filter by status
- `camera_id` - Filter by camera

**Frontend Usage**:
```javascript
// Get all incidents
const incidents = await fetch('/api/incidents?limit=100').then(r => r.json());

// Get only critical incidents
const critical = await fetch('/api/incidents?severity=critical').then(r => r.json());

// Get new incidents
const newOnes = await fetch('/api/incidents?status=new').then(r => r.json());
```

#### `GET /api/incidents/{id}`
**Purpose**: Get single incident details  
**Used by**: Incident detail page  
**Frontend Usage**:
```javascript
const incident = await fetch(`/api/incidents/INC-20260618-1234`).then(r => r.json());
```

#### `PATCH /api/incidents/{id}/status`
**Purpose**: Update incident status  
**Used by**: Violations page (Resolve, Review buttons)  
**Frontend Usage**:
```javascript
await fetch(`/api/incidents/INC-123/status`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'resolved' })
});
```

#### `GET /api/incidents/recent`
**Purpose**: Get recent incidents (last N hours)  
**Used by**: Dashboard overview  
**Frontend Usage**:
```javascript
const recent = await fetch('/api/incidents/recent?hours=24&limit=10').then(r => r.json());
```

### 2. Alert Management

#### `POST /api/alerts/send-police`
**Purpose**: Send alert to police  
**Used by**: Violations page, Alert center  
**Frontend Usage**:
```javascript
await fetch('/api/alerts/send-police?incident_id=INC-123', {
  method: 'POST'
});
```

#### `POST /api/alerts/send-hospital`
**Purpose**: Send alert to hospital & ambulance  
**Used by**: Accidents page, Alert center  
**Frontend Usage**:
```javascript
await fetch('/api/alerts/send-hospital?incident_id=INC-123', {
  method: 'POST'
});
```

#### `GET /api/alerts/`
**Purpose**: Get all alerts with filters  
**Used by**: Alert center page  
**Frontend Usage**:
```javascript
const alerts = await fetch('/api/alerts?status=sent&limit=50').then(r => r.json());
```

#### `PATCH /api/alerts/{id}/status`
**Purpose**: Update alert status (acknowledge, dispatch)  
**Used by**: Alert center  
**Frontend Usage**:
```javascript
await fetch(`/api/alerts/ALR-123/status?status=acknowledged`, {
  method: 'PATCH'
});
```

### 3. Dashboard Statistics

#### `GET /api/dashboard/stats`
**Purpose**: Get comprehensive dashboard statistics  
**Used by**: Dashboard overview page  
**Returns**:
```json
{
  "violations_today": 1284,
  "active_accidents": 3,
  "high_severity_alerts": 47,
  "pending_police_response": 18,
  "pending_hospital_response": 2,
  "active_cameras": 7,
  "total_cameras": 8,
  "avg_response_time": "4m 38s",
  "city_safety_score": 78,
  "violation_trend": [
    { "hour": "00:00", "violations": 45, "accidents": 2 },
    { "hour": "01:00", "violations": 32, "accidents": 0 }
  ],
  "top_violations": [
    { "type": "helmet", "count": 456 },
    { "type": "redlight", "count": 234 }
  ],
  "severity_distribution": {
    "low": 500,
    "medium": 300,
    "high": 150,
    "critical": 50
  }
}
```

**Frontend Usage**:
```javascript
const stats = await fetch('/api/dashboard/stats').then(r => r.json());
// Use for metrics cards, charts, etc.
```

#### `GET /api/dashboard/heatmap`
**Purpose**: Get geographic violation data  
**Used by**: Heatmap page  
**Returns**:
```json
[
  {
    "lat": 28.6139,
    "lng": 77.2090,
    "location_name": "Rajiv Chowk",
    "count": 45,
    "severity": "critical"
  }
]
```

### 4. Camera Management

#### `GET /api/cameras/`
**Purpose**: Get all cameras  
**Used by**: Dashboard, Settings  

#### `GET /api/cameras/{id}`
**Purpose**: Get single camera with detection count  
**Used by**: Camera detail view  

### 5. Vehicle/Offender Tracking

#### `GET /api/vehicles/{license_plate}`
**Purpose**: Get vehicle violation history  
**Used by**: Vehicle search page  
**Returns**:
```json
{
  "license_plate": "BD5314",
  "total_violations": 52,
  "is_repeat_offender": true,
  "first_seen": "2026-05-01T10:00:00Z",
  "last_seen": "2026-06-18T06:48:46Z",
  "violations": [
    { "type": "helmet", "timestamp": "..." },
    { "type": "redlight", "timestamp": "..." }
  ],
  "incidents": [...]  // Full incident history
}
```

#### `GET /api/vehicles/`
**Purpose**: Get repeat offenders list  
**Used by**: Vehicles page  

---

## 🎨 **Frontend Integration**

### Current Frontend Structure
```
frontend/src/
├── routes/
│   ├── index.tsx           # Dashboard overview
│   ├── violations.tsx      # Violations management
│   ├── incidents.$id.tsx   # Incident detail
│   ├── alerts.tsx          # Alert center
│   ├── heatmap.tsx         # Heatmap visualization
│   ├── vehicles.tsx        # Vehicle search
│   ├── accidents.tsx       # Accidents view
│   ├── live.tsx            # Live camera feed
│   └── settings.tsx        # Settings
├── components/
│   ├── AppShell.tsx        # Main layout
│   ├── CameraFeed.tsx      # Camera component
│   ├── CityMap.tsx         # Map component
│   └── ui/                 # UI components
└── lib/
    └── mock-data.ts        # ⚠️ CURRENTLY USING MOCK DATA
```

### What Needs to Change

#### 1. Create API Client
Create `frontend/src/lib/api-client.ts`:
```typescript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = {
  // Incidents
  async getIncidents(params?: { skip?: number; limit?: number; severity?: string; status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`${API_BASE}/incidents?${query}`);
    return response.json();
  },
  
  async getIncident(id: string) {
    const response = await fetch(`${API_BASE}/incidents/${id}`);
    return response.json();
  },
  
  async updateIncidentStatus(id: string, status: string) {
    const response = await fetch(`${API_BASE}/incidents/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return response.json();
  },
  
  // Dashboard
  async getDashboardStats() {
    const response = await fetch(`${API_BASE}/dashboard/stats`);
    return response.json();
  },
  
  async getHeatmapData() {
    const response = await fetch(`${API_BASE}/dashboard/heatmap`);
    return response.json();
  },
  
  // Alerts
  async getAlerts(params?: { skip?: number; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`${API_BASE}/alerts?${query}`);
    return response.json();
  },
  
  async sendPoliceAlert(incidentId: string) {
    const response = await fetch(`${API_BASE}/alerts/send-police?incident_id=${incidentId}`, {
      method: 'POST'
    });
    return response.json();
  },
  
  async sendHospitalAlert(incidentId: string) {
    const response = await fetch(`${API_BASE}/alerts/send-hospital?incident_id=${incidentId}`, {
      method: 'POST'
    });
    return response.json();
  },
  
  // Vehicles
  async getVehicleHistory(licensePlate: string) {
    const response = await fetch(`${API_BASE}/vehicles/${licensePlate}`);
    return response.json();
  },
  
  async getRepeatOffenders(minViolations: number = 3) {
    const response = await fetch(`${API_BASE}/vehicles?min_violations=${minViolations}`);
    return response.json();
  },
  
  // Cameras
  async getCameras() {
    const response = await fetch(`${API_BASE}/cameras`);
    return response.json();
  }
};
```

#### 2. Replace Mock Data
In each route file, replace:
```typescript
// OLD
import { incidents, alerts } from "@/lib/mock-data";

// NEW
import { api } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

function ViolationsPage() {
  const { data: incidents, isLoading } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => api.getIncidents({ limit: 100 })
  });
  
  if (isLoading) return <div>Loading...</div>;
  
  // Use incidents...
}
```

#### 3. Environment Variables
Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000/api
```

---

## ✅ **What's IMPLEMENTED**

### ✅ Backend (100% Complete)
- [x] FastAPI application with MongoDB
- [x] All API endpoints for incidents, alerts, dashboard
- [x] Incident creation from model JSON
- [x] Alert dispatch system (mocked for demo)
- [x] Dashboard statistics calculation
- [x] Heatmap data aggregation
- [x] Camera tracking
- [x] Offender tracking
- [x] Severity calculation
- [x] Status management
- [x] CORS configuration
- [x] Evidence file serving
- [x] Error handling
- [x] API documentation (Swagger/ReDoc)

### ✅ Frontend (90% Complete)
- [x] All pages and routes
- [x] Dashboard UI with charts
- [x] Violations management page
- [x] Alert center
- [x] Incident detail view
- [x] Heatmap visualization
- [x] Vehicle search
- [x] Responsive design
- [x] UI components
- [x] Mock data structure

### ✅ AI Model (Friend's Work - Complete)
- [x] YOLOv8 detection models
- [x] Helmet detection
- [x] Red light detection
- [x] License plate OCR
- [x] Severity scoring
- [x] JSON output format

---

## ⏳ **What's PENDING**

### 🔄 High Priority (Required for Demo)
1. **Frontend-Backend Integration**
   - [ ] Create API client
   - [ ] Replace mock data with API calls
   - [ ] Add loading states
   - [ ] Add error handling
   - [ ] Test all pages with real data

2. **Evidence File Handling**
   - [ ] Copy model output images to backend `/evidence/` folder
   - [ ] Ensure images are accessible via `/evidence/` endpoint
   - [ ] Update frontend to show real evidence images

3. **MongoDB Setup**
   - [ ] Install MongoDB locally
   - [ ] Start MongoDB service
   - [ ] Test backend connection

4. **Testing**
   - [ ] Test model JSON → Backend → Frontend flow
   - [ ] Test alert dispatch
   - [ ] Test vehicle search
   - [ ] Test heatmap

### 🚀 Medium Priority (Nice to Have for Demo)
5. **Real-time Updates**
   - [ ] WebSocket implementation for live updates
   - [ ] Auto-refresh dashboard every 30s

6. **Demo Data**
   - [ ] Seed database with sample data
   - [ ] Add multiple camera locations
   - [ ] Create diverse violation examples

### 📋 Low Priority (Future Enhancements)
7. **Production Features**
   - [ ] Real Twilio/WhatsApp integration
   - [ ] Authentication & authorization
   - [ ] Rate limiting
   - [ ] Caching
   - [ ] Logging & monitoring
   - [ ] Deployment scripts
   - [ ] Docker containers

---

## 🎯 **Features to Highlight in Demo**

### ✨ Core Features (Must Show)
1. **Automated Detection** - Model detects, backend stores, frontend displays
2. **Real-time Dashboard** - Live metrics, charts, recent incidents
3. **Smart Severity Scoring** - Not all violations treated equally
4. **Automated Alerts** - Police/hospital alerts with preview
5. **Repeat Offender Tracking** - Vehicle history search
6. **Violation Heatmap** - Geographic visualization
7. **Evidence Management** - Annotated images with violations

### 🔮 Future Enhancements (Mention as Roadmap)
1. **IoT Device Integration** - Portable device for police officers
2. **Weather API Integration** - Context-aware severity
3. **Auto-Challan Generation** - Automatic fine issuance
4. **Mobile App** - For police/ambulance
5. **City-wide Deployment** - Scale to all traffic junctions
6. **ML Model Improvements** - Better accuracy, more violation types
7. **Predictive Analytics** - Violation hotspot prediction
8. **Emergency Vehicle Routing** - Optimal ambulance paths

---

## 🚀 **Quick Start Guide**

### 1. Start Backend
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Start MongoDB
brew services start mongodb-community

# Run backend
uvicorn app.main:app --reload --port 8000
```

Access:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs

### 2. Test Backend with Model Output
```bash
# Send model output to backend
curl -X POST "http://localhost:8000/api/incidents/" \
  -H "Content-Type: application/json" \
  -d @../model/evidence/final_output.json

# Get dashboard stats
curl http://localhost:8000/api/dashboard/stats
```

### 3. Update Frontend
```bash
cd frontend

# Create API client
# (Copy the api-client.ts code from above)

# Update .env
echo "VITE_API_URL=http://localhost:8000/api" > .env

# Start frontend
npm run dev
```

### 4. Integrate Frontend
Replace mock data imports with API calls in:
- `routes/index.tsx` (Dashboard)
- `routes/violations.tsx`
- `routes/alerts.tsx`
- `routes/heatmap.tsx`
- `routes/vehicles.tsx`

---

## 📝 **Notes for Competition**

### What Judges Want to See:
1. ✅ **Working prototype** - Not just slides
2. ✅ **Real AI model** - Actual detections
3. ✅ **End-to-end system** - Model → Backend → Frontend
4. ✅ **Innovation** - Life-saving aspect (hospital alerts)
5. ✅ **Scalability story** - How to deploy city-wide
6. ✅ **Visual impact** - Dashboard, heatmap, annotated images

### Demo Flow:
1. **Show problem** - Manual traffic monitoring is inefficient
2. **Show solution** - GuardianEye automated system
3. **Live demo** - Upload image → Detection → Dashboard update
4. **Show features** - Dashboard, alerts, heatmap, repeat offenders
5. **Show innovation** - Hospital alerts for accidents (life-saving)
6. **Show roadmap** - Future enhancements
7. **Q&A** - Be ready to explain tech stack, scalability

### Key Talking Points:
- "We're not just detecting violations, we're saving lives"
- "Golden Hour response - seconds, not minutes"
- "Smart severity scoring - prioritize what matters"
- "Repeat offender tracking - target problematic drivers"
- "Scalable architecture - one junction to entire city"

---

## 🆘 **Troubleshooting**

### Backend Issues:
**MongoDB connection failed**:
```bash
brew services start mongodb-community
```

**Port 8000 in use**:
```bash
lsof -ti:8000 | xargs kill
```

### Frontend Issues:
**API not accessible**:
- Check CORS settings in backend
- Verify API_URL in .env
- Check network tab in browser DevTools

### Integration Issues:
**Data not showing**:
- Check backend is running
- Check MongoDB has data
- Check API responses in Network tab
- Check console for errors

---

## 🎓 **Summary**

You now have:
1. ✅ Complete backend with all APIs
2. ✅ Complete frontend UI
3. ✅ Working AI model
4. 📋 Integration checklist
5. 📋 Demo strategy

**Next steps**:
1. Start backend
2. Test with model output
3. Integrate frontend with backend
4. Test end-to-end flow
5. Prepare presentation
6. Practice demo

**You're ready to win! 🏆**
