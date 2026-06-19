# GuardianEye - Automated Traffic Violation Detection System
## Project Context & Complete Overview

---

## 🎯 **Competition Background**

### Flipkart Gridlock Hackathon - Round 2
- **Achievement**: Selected from 20,000 teams, one of only 1,600 teams in Round 2
- **Goal**: Make it to Top 10 teams in Round 3 (final round)
- **Problem Statement**: #3 - Automated Photo Identification and Classification for Traffic Violations Using Computer Vision

---

## 📋 **Problem Statement Summary**

Build a comprehensive AI-powered system that:
1. **Image Preprocessing** - Enhance image quality, handle low light, rain, shadows, motion blur
2. **Vehicle & Road User Detection** - Detect and localize vehicles, riders, drivers, pedestrians
3. **Traffic Violation Detection** - Identify multiple violation types
4. **Violation Classification** - Categorize and assign confidence scores
5. **License Plate Recognition** - OCR for number plates
6. **Evidence Generation** - Annotated images with metadata
7. **Analytics & Reporting** - Statistics, trends, searchable records
8. **Performance Evaluation** - Accuracy, Precision, Recall, F1-score, mAP

### Violation Types to Detect:
- ✅ Helmet non-compliance
- ✅ Seatbelt non-compliance  
- ✅ Triple riding
- ✅ Wrong-side driving
- ✅ Stop-line violation
- ✅ Red-light violation
- ✅ Illegal parking

---

## 💡 **Our Unique Value Proposition**

We're not just building a violation detector - we're building a **life-saving emergency response system** called **GuardianEye**.

### Key Innovations:
1. **Automated Police Alerts** - Real-time WhatsApp/SMS to nearest traffic police with photo & location
2. **Accident Detection & Hospital Dispatch** - Automatic emergency alerts to nearest hospital and ambulance service
3. **Severity-Based Prioritization** - Smart scoring system (0-10) for each violation
4. **Repeat Offender Tracking** - Automatic flagging of vehicles with multiple violations
5. **Live Violation Heatmap** - Geographic visualization of violation hotspots
6. **Weather-Aware Context** - Time of day, weather conditions influence severity scoring
7. **Golden Hour Response** - Accident victims get help dispatched in seconds, not minutes

### Tagline: 
> **"See Everything. Save Everyone."**

---

## 🏗️ **System Architecture**

```
┌─────────────────┐
│  Traffic Camera │
│   (Input Feed)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│   AI/ML Model (YOLOv8-based)    │
│  ────────────────────────────   │
│  • Helmet Detection             │
│  • Seatbelt Detection           │
│  • Vehicle Detection            │
│  • Red Light Detection          │
│  • License Plate OCR            │
│  • Accident Detection           │
│  • Wrong Way Detection          │
└────────┬────────────────────────┘
         │
         ▼
    ┌────────┐
    │  JSON  │ (Model Output)
    └────┬───┘
         │
         ▼
┌─────────────────────────────────┐
│        BACKEND (FastAPI)        │
│  ────────────────────────────   │
│  • Ingestion API                │
│  • Severity Calculation         │
│  • Alert Dispatch Logic         │
│  • Database Storage             │
│  • Real-time WebSocket          │
│  • Evidence Management          │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│    FRONTEND (React/TanStack)    │
│  ────────────────────────────   │
│  • Dashboard Overview           │
│  • Live Camera Feed             │
│  • Violations Management        │
│  • Alert Center                 │
│  • Heatmap Visualization        │
│  • Incident Details             │
│  • Vehicle/Plate Search         │
└─────────────────────────────────┘
         │
         ▼
    ┌────────┐
    │ Alerts │
    └────┬───┘
         ├──────► 🚔 Police Station
         ├──────► 🏥 Hospital
         └──────► 🚑 Ambulance Service
```

---

## 🤖 **AI Model Details**

### Technology Stack:
- **Framework**: YOLOv8 (Ultralytics)
- **Models**: Multiple specialized models for different violation types
- **OCR**: EasyOCR / PaddleOCR for license plates

### Model Output Format (JSON):
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
  "alert_sent": true,
  "statistics": {
    "total_reports": 6,
    "total_violations": 70,
    "violation_counts": {
      "helmet": 38,
      "redlight": 11,
      "vehicle": 15,
      "wrong_way": 5
    },
    "severity_counts": {
      "CRITICAL": 3,
      "HIGH": 0,
      "MEDIUM": 18,
      "LOW": 49
    }
  }
}
```

### Severity Scoring System:
| Violation Type | Base Score | Description |
|----------------|-----------|-------------|
| Red Light Jump | 9/10 | CRITICAL - Extremely dangerous |
| Wrong Way Driving | 8/10 | CRITICAL - High accident risk |
| No Helmet (driver) | 5/10 | MEDIUM - Safety violation |
| No Seatbelt | 7/10 | HIGH - Safety violation |
| Triple Riding | 6/10 | HIGH - Overloading |
| Stop Line | 4/10 | MEDIUM - Traffic rule |
| Illegal Parking | 3/10 | LOW - Congestion |
| Vehicle Detection | 3/10 | LOW - Just tracking |

---

## 💾 **Backend Requirements**

### Technology Stack:
- **Framework**: FastAPI (Python)
- **Database**: MongoDB
- **Real-time**: WebSocket / Socket.io
- **File Storage**: Local storage for prototype (Cloudinary/S3 for production)
- **Alert Service**: Twilio for SMS/WhatsApp (mocked for demo)

### Core APIs Needed:

#### 1. Detection Ingestion
```
POST /api/detections
```
Receives model output JSON and creates incidents

#### 2. Dashboard APIs
```
GET  /api/dashboard/stats          # Overview metrics
GET  /api/incidents                # List all incidents
GET  /api/incidents/:id            # Single incident details
GET  /api/alerts                   # Alert center data
GET  /api/cameras                  # Camera status
GET  /api/vehicles/:plateNumber    # Vehicle history
GET  /api/heatmap                  # Geographic violation data
```

#### 3. Alert Management
```
POST /api/alerts/send-police       # Dispatch police alert
POST /api/alerts/send-hospital     # Dispatch hospital alert
PATCH /api/incidents/:id/status    # Update incident status
PATCH /api/alerts/:id/status       # Update alert status
```

#### 4. Real-time Updates
```
WS /ws/incidents                   # WebSocket for live updates
```

### Database Schema:

#### Incidents Collection:
```javascript
{
  _id: ObjectId,
  incident_id: "INC-001",
  camera_id: "CAM_001",
  timestamp: ISODate,
  location: {
    name: "Delhi, India",
    lat: 28.6139,
    lng: 77.209
  },
  violation_type: "helmet",
  severity: "critical",
  total_score: 48,
  confidence: 0.91,
  license_plates: ["BD5314"],
  violations: [...],
  evidence_image: "/evidence/img_001.jpg",
  status: "new",
  alert_sent: true,
  alerts: [],
  created_at: ISODate,
  updated_at: ISODate
}
```

#### Alerts Collection:
```javascript
{
  _id: ObjectId,
  alert_id: "ALR-001",
  incident_id: "INC-001",
  type: "police",
  severity: "critical",
  recipient: "Police Station Name",
  message: "...",
  status: "sent",
  sent_at: ISODate,
  acknowledged_at: ISODate
}
```

#### Cameras Collection:
```javascript
{
  _id: ObjectId,
  camera_id: "CAM_001",
  name: "MG Road Junction",
  location: { lat: 28.6139, lng: 77.209 },
  status: "active",
  last_seen: ISODate
}
```

#### Offenders Collection:
```javascript
{
  _id: ObjectId,
  license_plate: "BD5314",
  total_violations: 52,
  violations: [
    { type: "helmet", timestamp: ISODate },
    ...
  ],
  is_repeat_offender: true,
  first_seen: ISODate,
  last_seen: ISODate
}
```

---

## 🎨 **Frontend Structure**

### Technology Stack:
- **Framework**: React with TanStack Router & TanStack Start
- **Styling**: Tailwind CSS 4.x
- **UI Components**: Custom components + Radix UI primitives
- **State**: React Query for server state
- **Charts**: Recharts
- **Build Tool**: Vite

### Pages & Routes:
1. **Dashboard** (`/`) - Overview with metrics, charts, recent incidents
2. **Live Feed** (`/live`) - Real-time camera streams
3. **Violations** (`/violations`) - Filterable incident grid
4. **Incident Detail** (`/incidents/:id`) - Single incident view
5. **Alert Center** (`/alerts`) - Alert management
6. **Heatmap** (`/heatmap`) - Geographic visualization
7. **Vehicles** (`/vehicles`) - Repeat offender search
8. **Accidents** (`/accidents`) - Accident-specific view
9. **Settings** (`/settings`) - System configuration

### Key Components:
- `AppShell.tsx` - Main layout with sidebar navigation
- `CameraFeed.tsx` - Live camera stream component
- `CityMap.tsx` - Interactive map with violation markers
- Various UI components in `/components/ui/`

### Current Status:
✅ Frontend is **90% complete** with mock data  
🔄 Needs backend integration  
⚠️ Some features to be trimmed (marked as "Future Enhancements")

---

## 🚀 **Development Status**

### ✅ Completed:
1. **AI Model** - Trained and working, outputs JSON as specified
2. **Frontend UI** - Complete dashboard with all pages (using mock data)
3. **Problem Statement Analysis** - Clear understanding of requirements

### 🔄 In Progress:
1. **Backend Development** - Need to build FastAPI server
2. **Backend-Frontend Integration** - Connect APIs to frontend
3. **Evidence File Management** - Handle image/video storage

### 📝 To Do:
1. Real-time WebSocket implementation
2. Alert dispatch system (mock for demo, real for future)
3. Final testing & demo preparation
4. Presentation materials

---

## 🎯 **Demo Strategy**

### What to Show:
1. **Upload test image** → Model detects violations → Backend processes → Frontend displays
2. **Live dashboard** with real-time metrics updating
3. **Alert preview** showing automated message to police/hospital
4. **Heatmap** showing violation hotspots across city
5. **Repeat offender search** - Enter plate number, show history

### What to Explain as "Future Enhancements":
1. IoT device integration with traffic cameras
2. Full city deployment with edge computing
3. Auto-challan generation system
4. Weather API integration
5. Real hospital/ambulance routing
6. Mobile app for police officers

---

## 📂 **Project Structure**

```
Flipkart Gridlock/
├── context/                    # Problem statement & documentation
│   ├── problem statement.txt
│   ├── Backend Requirements.md
│   ├── whatsapp-chat.txt
│   └── Claude Chat.txt
├── model/                      # AI Model (friend's work)
│   ├── GuardianEye_Fina1l.ipynb
│   ├── offenders.json
│   ├── evidence/              # Generated violation images & JSONs
│   └── models/                # Trained YOLO models
├── frontend/                   # React Frontend (your work)
│   ├── src/
│   │   ├── components/
│   │   ├── routes/
│   │   └── lib/
│   └── package.json
└── backend/                    # FastAPI Backend (TO BE BUILT)
    ├── app/
    │   ├── main.py
    │   ├── models/
    │   ├── routes/
    │   └── services/
    └── requirements.txt
```

---

## 🏆 **Why This Will Win**

### Technical Excellence:
- ✅ Complete end-to-end system
- ✅ Multiple violation types (helmet, seatbelt, red light, etc.)
- ✅ Real AI model (not just concept)
- ✅ Working prototype with real detections

### Innovation:
- 🚑 **Life-saving angle** - Accident → Hospital in seconds
- 🔥 **Smart severity scoring** - Not all violations treated equally
- 📍 **Heatmap visualization** - Strategic police deployment
- 🚨 **Automated alerts** - No manual intervention needed

### Presentation Impact:
- 🎥 **Visual demo** - Show actual violations being detected
- 📊 **Live dashboard** - Real-time metrics updating
- 🗺️ **Interactive map** - Geographic context
- 📱 **Alert preview** - Show police/hospital message

### Scalability Story:
- Start with 1 camera junction (demo)
- Scale to entire city (future)
- Edge computing at camera level (future)
- National deployment (vision)

---

## 📞 **Team Division**

- **Friend**: AI/ML Model Development (DONE ✅)
  - Trained YOLOv8 models
  - Multiple violation detectors
  - License plate OCR
  - JSON output format

- **You**: Frontend + Backend + Integration (IN PROGRESS 🔄)
  - Frontend UI (DONE ✅)
  - Backend API (TO DO)
  - Integration (TO DO)
  - Demo preparation (TO DO)

---

## 🎬 **Next Steps**

1. ✅ Create this context document
2. 🔄 Build FastAPI backend
3. 🔄 Integrate backend with frontend
4. 🔄 Test with real model outputs
5. ⏳ Prepare demo & presentation
6. ⏳ Practice pitch & Q&A

---

## 📚 **Key Resources**

- **Colab Notebook**: https://colab.research.google.com/drive/1TACwxUS3ltflt6uzrMt5BXgpKX2WycSI?usp=sharing
- **Claude Chat**: https://claude.ai/share/97923eae-efa9-4b50-a4d4-532fdd0900f6
- **Frontend**: Lovable-generated React app with TanStack Router
- **Model Framework**: Ultralytics YOLOv8

---

## 🎓 **Lessons Learned**

1. **Hackathon Strategy**: Pick the most **demonstrable** problem (visuals win)
2. **Think Beyond Requirements**: Add life-saving angle for emotional impact
3. **Parallel Development**: Model and frontend built simultaneously with agreed JSON format
4. **Mock First**: Frontend built with mock data, easy to connect real APIs later
5. **Future Scope**: Keep some features as "enhancements" - shows vision without overcommitting

---

**Last Updated**: June 19, 2026  
**Document Purpose**: Complete context for any new agent/developer joining the project
