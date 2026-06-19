## What you will need to build in the backend

Since your friend is handling the **AI model**, your backend should act as the bridge between the model and your dashboard.

### 1. Detection ingestion API

Your friend’s model will output results like:

```json
{
  "camera_id": "CAM-DELHI-001",
  "incident_type": "No Helmet",
  "severity": "High",
  "confidence": 0.92,
  "vehicle_number": "DL8CAF1234",
  "location": {
    "lat": 28.6139,
    "lng": 77.209,
    "address": "Rajiv Chowk, Delhi"
  },
  "evidence_image_url": "/evidence/img_001.jpg",
  "video_clip_url": "/evidence/clip_001.mp4",
  "timestamp": "2026-06-18T14:30:00+05:30"
}
```

You need an endpoint like:

```http
POST /api/detections
```

This will receive AI detections and save them as incidents.

---

### 2. Store incidents in database

You need collections/tables like:

```text
cameras
incidents
alerts
vehicles
responders
evidence
```

For hackathon, keep it simple:

```text
Incident:
- id
- camera_id
- incident_type
- severity
- confidence
- vehicle_number
- location
- evidence_image_url
- video_clip_url
- status
- alert_status
- created_at
```

---

### 3. Dashboard APIs

Your frontend will need APIs like:

```http
GET /api/dashboard/stats
GET /api/incidents
GET /api/incidents/:id
GET /api/alerts
GET /api/cameras
GET /api/vehicles/:plateNumber
```

These will power your cards, charts, tables, incident detail pages, heatmap, and repeat offender search.

---

### 4. Alert system backend

When a serious violation or accident is detected, backend should decide who to alert.

For example:

```text
If severity = Critical and type = Accident Detected:
Send alert to:
- nearest police station
- nearest hospital
- ambulance service
```

You need backend functions for:

```text
calculateSeverity()
findNearestPoliceStation()
findNearestHospital()
createAlert()
sendSMSorWhatsApp()
updateAlertStatus()
```

For demo, you can simulate SMS/WhatsApp. Real option later: Twilio, WhatsApp Cloud API, email, or push notifications.

---

### 5. Real-time updates

To make the dashboard feel live, backend should push new incidents to frontend using:

```text
WebSocket
or
Server-Sent Events
```

Example:

```text
AI model detects violation
↓
Backend receives detection
↓
Backend stores incident
↓
Backend emits event to frontend
↓
Dashboard updates instantly
```

For hackathon, even polling every 5 seconds is acceptable:

```http
GET /api/incidents/recent
```

---

### 6. Evidence storage

The AI model will generate images/video clips. Backend should save them somewhere.

Simple version:

```text
/evidence/images
/evidence/videos
```

Better version:

```text
Cloudinary / AWS S3 / Firebase Storage
```

Each incident should store evidence URLs.

---

### 7. Status update APIs

Your frontend buttons need backend endpoints later:

```http
PATCH /api/incidents/:id/status
PATCH /api/alerts/:id/status
POST /api/incidents/:id/send-police-alert
POST /api/incidents/:id/send-hospital-alert
POST /api/incidents/:id/resolve
```

Statuses can be:

```text
New
Alert Sent
Acknowledged
Team Dispatched
In Review
Resolved
False Positive
```

---

### 8. Backend stack suggestion

For your team, a good stack would be:

```text
Frontend: Lovable / React / Next.js
Backend: FastAPI or Node.js Express
Database: MongoDB
Real-time: WebSocket / Socket.io
File Storage: Cloudinary or local storage for prototype
Alert Service: Twilio or mocked alert sender
Map/Location: static mock data first, real geolocation later
```

For a hackathon prototype, I would keep the backend simple:

```text
FastAPI + MongoDB + WebSocket + mock alert service
```

---

## Your responsibility as frontend developer

You mainly need to build:

```text
1. Dashboard UI
2. Alert Center UI
3. Incident Detail UI
4. Heatmap UI
5. Live Camera UI
6. Emergency Response UI
7. Mock data first
8. Later connect API endpoints from backend
```

Your friend needs to provide you with a fixed output format from the model. Once that format is fixed, your frontend and backend can both be built smoothly around it.
