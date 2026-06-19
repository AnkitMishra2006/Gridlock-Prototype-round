# GuardianEye Backend

FastAPI-based backend for the GuardianEye Traffic Violation Detection System.

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- MongoDB (local or cloud)

### Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=guardianeye
FRONTEND_URL=http://localhost:3000
```

4. Start MongoDB (if running locally):
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Or run directly
mongod --dbpath ~/data/db
```

5. Run the backend:
```bash
# Development mode with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or using Python
python -m app.main
```

6. Access the API:
- API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 📡 API Endpoints

### Core Endpoints

#### Incidents
- `POST /api/incidents/` - Create incident from model detection
- `GET /api/incidents/` - Get all incidents (with filters)
- `GET /api/incidents/{id}` - Get single incident
- `PATCH /api/incidents/{id}/status` - Update incident status
- `GET /api/incidents/recent` - Get recent incidents
- `GET /api/incidents/stats/violations-today` - Today's violation count
- `GET /api/incidents/stats/trend` - Hourly violation trend
- `GET /api/incidents/stats/top-violations` - Top violation types

#### Alerts
- `POST /api/alerts/send-police` - Send police alert
- `POST /api/alerts/send-hospital` - Send hospital alert
- `GET /api/alerts/` - Get all alerts (with filters)
- `GET /api/alerts/{id}` - Get single alert
- `PATCH /api/alerts/{id}/status` - Update alert status
- `GET /api/alerts/stats/pending` - Pending alerts count

#### Dashboard
- `GET /api/dashboard/stats` - Comprehensive dashboard statistics
- `GET /api/dashboard/heatmap` - Violation heatmap data

#### Cameras
- `GET /api/cameras/` - Get all cameras
- `GET /api/cameras/{id}` - Get single camera

#### Vehicles
- `GET /api/vehicles/{plate}` - Get vehicle violation history
- `GET /api/vehicles/` - Get repeat offenders

## 🧪 Testing the API

### Using the Model Output

Your AI model generates JSON like this:

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
    }
  ],
  "license_plates": ["BD5314"],
  "alert_sent": true
}
```

### Send this to the backend:

```bash
curl -X POST "http://localhost:8000/api/incidents/" \
  -H "Content-Type: application/json" \
  -d @model/evidence/final_output.json
```

Or using Python:

```python
import requests
import json

with open('model/evidence/final_output.json', 'r') as f:
    detection = json.load(f)

response = requests.post(
    'http://localhost:8000/api/incidents/',
    json=detection
)

print(response.json())
```

### Get Dashboard Stats:

```bash
curl http://localhost:8000/api/dashboard/stats
```

## 📊 Database Schema

### Collections

#### `incidents`
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
  violation_type: "helmet",
  severity: "critical",
  total_score: 48,
  confidence: 0.91,
  license_plates: ["BD5314"],
  violations: [...],
  evidence_image: "violation_20260618_064846.jpg",
  status: "new",
  alert_sent: true,
  alerts: [],
  created_at: ISODate(),
  updated_at: ISODate()
}
```

#### `alerts`
```javascript
{
  alert_id: "ALR-20260618-5678",
  incident_id: "INC-20260618-1234",
  type: "police",
  severity: "critical",
  recipient: "Delhi Traffic Police",
  message: "...",
  status: "sent",
  sent_at: ISODate(),
  acknowledged_at: null,
  created_at: ISODate()
}
```

#### `cameras`
```javascript
{
  camera_id: "CAM_001",
  name: "Delhi, India",
  location: { name: "...", lat: 28.6139, lng: 77.2090 },
  status: "active",
  last_seen: ISODate()
}
```

#### `offenders`
```javascript
{
  license_plate: "BD5314",
  total_violations: 52,
  violations: [
    { type: "helmet", timestamp: ISODate() },
    ...
  ],
  is_repeat_offender: true,
  first_seen: ISODate(),
  last_seen: ISODate()
}
```

## 🔧 Development

### Project Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Configuration
│   ├── database.py          # MongoDB connection
│   ├── models/
│   │   └── schemas.py       # Pydantic models
│   ├── routes/
│   │   ├── incidents.py     # Incident endpoints
│   │   ├── alerts.py        # Alert endpoints
│   │   ├── dashboard.py     # Dashboard endpoints
│   │   ├── cameras.py       # Camera endpoints
│   │   └── vehicles.py      # Vehicle endpoints
│   ├── services/
│   │   ├── incident_service.py
│   │   ├── alert_service.py
│   │   └── dashboard_service.py
│   └── utils/
│       └── helpers.py       # Helper functions
├── evidence/                # Evidence images/videos
├── requirements.txt
├── .env.example
└── README.md
```

### Running Tests
```bash
pytest  # Coming soon
```

## 🌐 Deployment

### Docker (Coming Soon)
```bash
docker-compose up
```

### Production
```bash
# Using gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker

# Or PM2
pm2 start "uvicorn app.main:app --host 0.0.0.0 --port 8000" --name guardianeye-api
```

## 🔐 Security

For production:
1. Change `DEBUG=false` in `.env`
2. Set strong database credentials
3. Enable authentication (JWT tokens)
4. Use HTTPS only
5. Implement rate limiting
6. Add input validation
7. Enable API key authentication

## 📝 Notes

- Evidence files are served from `/evidence/` endpoint
- All timestamps are in UTC
- Severity levels: low, medium, high, critical
- Incident statuses: new, alert_sent, in_review, acknowledged, dispatched, resolved
- Alert statuses: pending, sent, acknowledged, dispatched, completed

## 🤝 Integration with Frontend

Frontend should make API calls to:
```javascript
const API_BASE = 'http://localhost:8000/api';

// Get dashboard stats
const stats = await fetch(`${API_BASE}/dashboard/stats`).then(r => r.json());

// Get incidents
const incidents = await fetch(`${API_BASE}/incidents`).then(r => r.json());

// Send police alert
await fetch(`${API_BASE}/alerts/send-police?incident_id=INC-123`, {
  method: 'POST'
});
```

## 🐛 Troubleshooting

**MongoDB connection failed**:
- Check if MongoDB is running: `brew services list`
- Verify connection string in `.env`

**Port 8000 already in use**:
- Change port in `.env` or `.env.example`
- Kill existing process: `lsof -ti:8000 | xargs kill`

**Module not found**:
- Ensure virtual environment is activated
- Reinstall requirements: `pip install -r requirements.txt`

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [MongoDB Motor Documentation](https://motor.readthedocs.io/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
