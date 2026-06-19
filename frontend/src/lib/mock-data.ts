export type Severity = "low" | "medium" | "high" | "critical";
export type IncidentStatus = "new" | "alert_sent" | "in_review" | "resolved";
export type ViolationType =
  | "No Helmet"
  | "Triple Riding"
  | "Red Light Jump"
  | "Wrong-Side Driving"
  | "Seatbelt Missing"
  | "Overspeeding"
  | "Accident Detected"
  | "Pedestrian Risk"
  | "Emergency Vehicle Blocked";

export interface Incident {
  id: string;
  type: ViolationType;
  severity: Severity;
  status: IncidentStatus;
  location: string;
  cameraId: string;
  cameraName: string;
  timestamp: string;
  plate: string;
  confidence: number;
  vehicles: number;
  people: number;
  thumbnail: string;
  notes?: string;
}

export interface Camera {
  id: string;
  name: string;
  zone: string;
  status: "active" | "offline" | "warning";
  lat: number;
  lng: number;
  detections24h: number;
  feedUrl: string;
}

export interface AlertItem {
  id: string;
  kind:
    | "violation"
    | "high_violation"
    | "accident"
    | "repeat_offender"
    | "camera_offline";
  title: string;
  severity: Severity;
  location: string;
  timestamp: string;
  assignee: string;
  status: "open" | "acknowledged" | "dispatched" | "escalated" | "resolved";
  message: string;
  incidentId?: string;
}

const now = Date.now();
const ago = (m: number) => new Date(now - m * 60_000).toISOString();

const thumbs = [
  "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=70",
  "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=70",
  "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=600&q=70",
  "https://images.unsplash.com/photo-1518306727298-4c17e1bf6943?w=600&q=70",
  "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=70",
  "https://images.unsplash.com/photo-1597007030739-6d2e7172ee27?w=600&q=70",
  "https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?w=600&q=70",
  "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?w=600&q=70",
];

export const cameras: Camera[] = [
  { id: "CAM-014", name: "MG Road × Brigade", zone: "Central", status: "active", lat: 38, lng: 42, detections24h: 312, feedUrl: thumbs[0] },
  { id: "CAM-021", name: "Silk Board Junction", zone: "South", status: "active", lat: 62, lng: 71, detections24h: 488, feedUrl: thumbs[1] },
  { id: "CAM-008", name: "Hebbal Flyover N", zone: "North", status: "warning", lat: 24, lng: 18, detections24h: 207, feedUrl: thumbs[2] },
  { id: "CAM-033", name: "Electronic City Toll", zone: "South", status: "active", lat: 72, lng: 88, detections24h: 519, feedUrl: thumbs[3] },
  { id: "CAM-002", name: "Trinity Circle", zone: "Central", status: "active", lat: 44, lng: 38, detections24h: 178, feedUrl: thumbs[4] },
  { id: "CAM-049", name: "Marathahalli Bridge", zone: "East", status: "offline", lat: 58, lng: 56, detections24h: 0, feedUrl: thumbs[5] },
  { id: "CAM-052", name: "Whitefield Main Rd", zone: "East", status: "active", lat: 74, lng: 48, detections24h: 263, feedUrl: thumbs[6] },
  { id: "CAM-061", name: "KR Puram Underpass", zone: "East", status: "active", lat: 66, lng: 36, detections24h: 144, feedUrl: thumbs[7] },
];

const plates = ["KA 05 MJ 7821", "KA 03 HX 4412", "KA 51 PQ 9007", "KA 09 BC 1188", "KA 14 ZZ 0099", "TN 22 AL 6610", "KL 07 BG 2334", "AP 09 BL 7711"];

const types: ViolationType[] = [
  "No Helmet", "Triple Riding", "Red Light Jump", "Wrong-Side Driving",
  "Seatbelt Missing", "Overspeeding", "Accident Detected", "Pedestrian Risk", "Emergency Vehicle Blocked",
];

const sevs: Severity[] = ["low", "medium", "high", "critical"];

export const incidents: Incident[] = Array.from({ length: 24 }).map((_, i) => {
  const cam = cameras[i % cameras.length];
  const type = types[i % types.length];
  const sev: Severity =
    type === "Accident Detected" ? (i % 3 === 0 ? "critical" : "high")
    : type === "Red Light Jump" || type === "Overspeeding" ? "high"
    : type === "Wrong-Side Driving" ? "high"
    : sevs[i % 3];
  return {
    id: `INC-${String(2480 + i)}`,
    type,
    severity: sev,
    status: (["new", "alert_sent", "in_review", "resolved"] as IncidentStatus[])[i % 4],
    location: cam.name,
    cameraId: cam.id,
    cameraName: cam.name,
    timestamp: ago(i * 7 + 2),
    plate: plates[i % plates.length],
    confidence: 0.78 + ((i * 17) % 21) / 100,
    vehicles: 1 + (i % 3),
    people: type === "Accident Detected" ? 2 + (i % 3) : 1 + (i % 2),
    thumbnail: thumbs[i % thumbs.length],
  };
});

export const alerts: AlertItem[] = [
  { id: "ALR-9912", kind: "accident", title: "Critical accident — 2 vehicles involved", severity: "critical", location: "Silk Board Junction", timestamp: ago(3), assignee: "Madiwala PS · Apollo Hospital", status: "dispatched", message: "Two-vehicle collision detected with high-impact signature. Pedestrian proximity confirmed.", incidentId: "INC-2480" },
  { id: "ALR-9908", kind: "high_violation", title: "Red light jump — confidence 0.96", severity: "high", location: "MG Road × Brigade", timestamp: ago(8), assignee: "Cubbon Park PS", status: "acknowledged", message: "Black sedan KA 05 MJ 7821 ran red signal at 64 km/h.", incidentId: "INC-2483" },
  { id: "ALR-9904", kind: "repeat_offender", title: "Repeat offender — 4th violation this month", severity: "high", location: "Hebbal Flyover N", timestamp: ago(22), assignee: "Hebbal PS", status: "open", message: "Vehicle KA 03 HX 4412 flagged for repeated overspeeding pattern.", incidentId: "INC-2486" },
  { id: "ALR-9899", kind: "camera_offline", title: "Camera CAM-049 offline > 14 min", severity: "medium", location: "Marathahalli Bridge", timestamp: ago(34), assignee: "Ops · Field Team B", status: "escalated", message: "Connection lost. Last frame at 14:22. Auto-failover not available.", },
  { id: "ALR-9891", kind: "violation", title: "No helmet — 2-wheeler", severity: "medium", location: "Trinity Circle", timestamp: ago(51), assignee: "Halasuru PS", status: "resolved", message: "Rider without helmet, e-challan recommended.", incidentId: "INC-2487" },
  { id: "ALR-9882", kind: "violation", title: "Wrong-side driving — auto-rickshaw", severity: "high", location: "KR Puram Underpass", timestamp: ago(73), assignee: "KR Puram PS", status: "open", message: "Three-wheeler entered against flow for 80m.", incidentId: "INC-2489" },
];

export const trendData = [
  { hour: "00", violations: 12, accidents: 0 },
  { hour: "02", violations: 8, accidents: 1 },
  { hour: "04", violations: 5, accidents: 0 },
  { hour: "06", violations: 18, accidents: 0 },
  { hour: "08", violations: 64, accidents: 2 },
  { hour: "10", violations: 78, accidents: 1 },
  { hour: "12", violations: 71, accidents: 0 },
  { hour: "14", violations: 88, accidents: 3 },
  { hour: "16", violations: 102, accidents: 2 },
  { hour: "18", violations: 134, accidents: 4 },
  { hour: "20", violations: 96, accidents: 1 },
  { hour: "22", violations: 47, accidents: 1 },
];

export const topViolations = [
  { type: "No Helmet", count: 412 },
  { type: "Red Light Jump", count: 287 },
  { type: "Overspeeding", count: 241 },
  { type: "Wrong-Side", count: 168 },
  { type: "Seatbelt", count: 134 },
  { type: "Triple Riding", count: 98 },
];

export const hotspots = [
  { name: "Silk Board Junction", risk: 94, incidents: 41 },
  { name: "Hebbal Flyover N", risk: 88, incidents: 33 },
  { name: "Electronic City Toll", risk: 82, incidents: 29 },
  { name: "MG Road × Brigade", risk: 76, incidents: 22 },
  { name: "KR Puram Underpass", risk: 71, incidents: 18 },
];

export const repeatOffenders = [
  { plate: "KA 03 HX 4412", violations: 12, top: "Overspeeding", lastSeen: "Hebbal Flyover N", risk: 91, history: [
    { date: ago(22), type: "Overspeeding", location: "Hebbal Flyover N", severity: "high" as Severity },
    { date: ago(60 * 8), type: "Red Light Jump", location: "MG Road", severity: "high" as Severity },
    { date: ago(60 * 26), type: "Overspeeding", location: "ORR Outer", severity: "medium" as Severity },
    { date: ago(60 * 80), type: "Wrong-Side Driving", location: "KR Puram", severity: "high" as Severity },
  ]},
  { plate: "KA 05 MJ 7821", violations: 7, top: "Red Light Jump", lastSeen: "MG Road × Brigade", risk: 78, history: [] },
  { plate: "TN 22 AL 6610", violations: 5, top: "Seatbelt Missing", lastSeen: "Electronic City Toll", risk: 64, history: [] },
];

export const severityClass: Record<Severity, string> = {
  low: "bg-[color:var(--color-sev-low)]/15 text-[color:var(--color-sev-low)] border-[color:var(--color-sev-low)]/30",
  medium: "bg-[color:var(--color-sev-med)]/15 text-[oklch(0.45_0.14_75)] border-[color:var(--color-sev-med)]/40",
  high: "bg-[color:var(--color-rust)]/12 text-[color:var(--color-rust)] border-[color:var(--color-rust)]/30",
  critical: "bg-[color:var(--color-sev-crit)]/15 text-[color:var(--color-sev-crit)] border-[color:var(--color-sev-crit)]/40",
};

export const severityDot: Record<Severity, string> = {
  low: "bg-[color:var(--color-sev-low)]",
  medium: "bg-[color:var(--color-sev-med)]",
  high: "bg-[color:var(--color-rust)]",
  critical: "bg-[color:var(--color-sev-crit)]",
};

export function timeAgo(iso: string) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function statusLabel(s: IncidentStatus) {
  return ({ new: "New", alert_sent: "Alert Sent", in_review: "In Review", resolved: "Resolved" } as const)[s];
}
