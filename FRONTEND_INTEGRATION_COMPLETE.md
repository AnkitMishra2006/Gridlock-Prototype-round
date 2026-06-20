# Frontend Integration - Complete Guide

## ✅ What's Been Created

### 1. API Client (`frontend/src/lib/api-client.ts`)
- Complete TypeScript API client
- All backend endpoints covered
- Error handling built-in
- Type-safe methods

### 2. React Hooks (`frontend/src/lib/api-hooks.ts`)
- React Query hooks for all API calls
- Automatic caching and refetching
- Loading & error states handled
- Optimistic updates for mutations

### 3. Environment Configuration (`frontend/.env`)
- API URL configuration
- Easy switch between dev/prod

## 🔧 How to Complete Integration

### Step 1: Install Dependencies (if needed)
The project already has `@tanstack/react-query` installed, so no additional installation needed.

### Step 2: Update Route Files

For each route file, follow this pattern:

#### Before (Mock Data):
```typescript
import { incidents } from "@/lib/mock-data";

function Page() {
  const data = incidents;
  return <div>{/* render data */}</div>
}
```

#### After (Real API):
```typescript
import { useIncidents } from "@/lib/api-hooks";

function Page() {
  const { data: incidents, isLoading, error } = useIncidents();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;
  
  return <div>{/* render incidents */}</div>
}
```

### Files to Update:

1. **`src/routes/index.tsx` (Dashboard)**
   ```typescript
   import { useDashboardStats, useRecentIncidents, useAlerts } from "@/lib/api-hooks";
   
   function Overview() {
     const { data: stats } = useDashboardStats();
     const { data: recent } = useRecentIncidents(24, 7);
     const { data: alerts } = useAlerts({ limit: 3 });
     
     // Use stats, recent, alerts instead of mock data
   }
   ```

2. **`src/routes/violations.tsx`**
   ```typescript
   import { useIncidents, useUpdateIncidentStatus, useSendPoliceAlert } from "@/lib/api-hooks";
   
   function ViolationsPage() {
     const { data: incidents } = useIncidents({ limit: 100 });
     const updateStatus = useUpdateIncidentStatus();
     const sendAlert = useSendPoliceAlert();
     
     // Use real data and mutations
   }
   ```

3. **`src/routes/alerts.tsx`**
   ```typescript
   import { useAlerts, useUpdateAlertStatus } from "@/lib/api-hooks";
   
   function AlertsPage() {
     const { data: alerts } = useAlerts();
     const updateStatus = useUpdateAlertStatus();
     
     // Use real alerts
   }
   ```

4. **`src/routes/heatmap.tsx`**
   ```typescript
   import { useHeatmapData } from "@/lib/api-hooks";
   
   function HeatmapPage() {
     const { data: heatmapData } = useHeatmapData();
     
     // Use real heatmap data
   }
   ```

5. **`src/routes/vehicles.tsx`**
   ```typescript
   import { useRepeatOffenders, useVehicleHistory } from "@/lib/api-hooks";
   
   function VehiclesPage() {
     const [searchPlate, setSearchPlate] = useState("");
     const { data: offenders } = useRepeatOffenders();
     const { data: history } = useVehicleHistory(searchPlate);
     
     // Use real vehicle data
   }
   ```

6. **`src/routes/incidents.$id.tsx`**
   ```typescript
   import { useIncident } from "@/lib/api-hooks";
   import { useParams } from "@tanstack/react-router";
   
   function IncidentDetailPage() {
     const { id } = useParams({ from: '/incidents/$id' });
     const { data: incident } = useIncident(id);
     
     // Use real incident details
   }
   ```

## 📝 Quick Integration Script

Run this automated replacement:

```bash
cd frontend

# For each file, you can use this pattern
# (Replace manually for safety)

# 1. Add imports at top
# 2. Replace mock data imports with hooks
# 3. Add loading/error states
# 4. Update component to use real data
```

## 🚀 Testing Integration

### 1. Start Backend
```bash
cd backend
uvicorn app.main:app --reload
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Verify Connection
- Open http://localhost:5173
- Check browser console for API calls
- Data should load from backend

### 4. Test Features
- ✅ Dashboard shows real metrics
- ✅ Violations page shows real incidents
- ✅ Clicking "Send Alert" triggers API call
- ✅ Status updates work
- ✅ Search functionality works

## 🎯 Data Mapping

### Backend → Frontend Mapping:

| Backend Field | Frontend Field | Notes |
|--------------|---------------|-------|
| `incident_id` | `id` | Use incident_id as unique identifier |
| `violation_type` | `type` | Direct mapping |
| `severity` | `severity` | low/medium/high/critical |
| `status` | `status` | new/alert_sent/in_review/resolved |
| `location.name` | `location` | Extract name from location object |
| `camera_id` | `cameraId` | Direct mapping |
| `license_plates[0]` | `plate` | Use first plate if multiple |
| `confidence` | `confidence` | Direct mapping (0-1 scale) |
| `evidence_image` | `thumbnail` | Use api.getEvidenceUrl(filename) |

### Example Transformation:
```typescript
// Backend response
{
  incident_id: "INC-20260618-1234",
  violation_type: "helmet",
  severity: "medium",
  location: { name: "Delhi, India", lat: 28.6, lng: 77.2 },
  license_plates: ["DL3C1234"],
  evidence_image: "violation_20260618.jpg"
}

// Transform to frontend format
{
  id: "INC-20260618-1234",
  type: "No Helmet",
  severity: "medium",
  location: "Delhi, India",
  plate: "DL3C1234",
  thumbnail: api.getEvidenceUrl("violation_20260618.jpg")
}
```

## 🔄 Fallback Strategy

To keep demo working during integration:

### Option 1: Feature Flag
```typescript
const USE_REAL_API = import.meta.env.VITE_USE_REAL_API === 'true';

function usePosts() {
  const apiData = useIncidents();
  const mockData = { data: incidents, isLoading: false };
  
  return USE_REAL_API ? apiData : mockData;
}
```

### Option 2: Gradual Migration
1. Keep mock data as fallback
2. Try API first, fall back to mock on error
3. Remove mock once stable

```typescript
function useIncidentsWithFallback() {
  const { data, isLoading, error } = useIncidents();
  
  if (error) {
    console.warn('API error, using mock data');
    return { data: mockIncidents, isLoading: false };
  }
  
  return { data, isLoading };
}
```

## 🎨 Loading States

Add nice loading states:

```typescript
function Page() {
  const { data, isLoading } = useIncidents();
  
  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
      </div>
    );
  }
  
  return <div>{/* render data */}</div>
}
```

## 🚨 Error Handling

Add user-friendly error messages:

```typescript
function Page() {
  const { data, error } = useIncidents();
  
  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-rust/30 bg-rust/10 p-4">
          <h3 className="font-semibold text-rust">Unable to load data</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Please check if the backend is running at http://localhost:8000
          </p>
        </div>
      </div>
    );
  }
  
  return <div>{/* render data */}</div>
}
```

## ⏱️ Estimated Time

- **Reading this guide**: 10 minutes
- **Updating route files**: 30-45 minutes
- **Testing integration**: 15 minutes
- **Total**: ~1 hour

## ✅ Completion Checklist

- [ ] Backend running on port 8000
- [ ] Frontend .env file created
- [ ] API client imported in files
- [ ] Route files updated with hooks
- [ ] Loading states added
- [ ] Error handling added
- [ ] Data transformations correct
- [ ] All pages tested
- [ ] Alerts working
- [ ] Status updates working
- [ ] Search working
- [ ] Heatmap displaying

## 🎯 Priority Order

Do in this order for fastest demo-ready state:

1. **Dashboard** (`index.tsx`) - Most important
2. **Violations** (`violations.tsx`) - Core feature
3. **Alerts** (`alerts.tsx`) - Show alert system
4. **Incident Detail** (`incidents.$id.tsx`) - Detail view
5. **Heatmap** (`heatmap.tsx`) - Visual impact
6. **Vehicles** (`vehicles.tsx`) - Repeat offenders
7. **Others** - Nice to have

## 💡 Pro Tips

1. **Start Simple**: Get dashboard working first
2. **Use Browser DevTools**: Check Network tab for API calls
3. **Console Logs**: Add logs to debug data flow
4. **Incremental**: Update one page at a time
5. **Test Each**: Test each page before moving to next

## 🆘 Troubleshooting

### "Cannot connect to API"
- Check backend is running
- Check `.env` file exists
- Check CORS settings in backend

### "Data not displaying"
- Check data transformation
- Log API response in console
- Verify field names match

### "Type errors"
- Add proper TypeScript types
- Use `any` temporarily if needed
- Fix types after functionality works

---

**Integration is straightforward - just replace mock imports with API hooks!**
