from datetime import datetime, timedelta
from typing import Dict, Any, List
import random
import string


def generate_id(prefix: str = "INC") -> str:
    """Generate a unique ID with prefix"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_suffix = ''.join(random.choices(string.digits, k=4))
    return f"{prefix}-{timestamp}-{random_suffix}"


def calculate_severity(total_score: int, violations: List[Dict[str, Any]]) -> str:
    """Calculate overall severity based on score and violations"""
    # Check for critical violations
    critical_types = ["redlight", "accident", "wrong_way"]
    has_critical = any(v.get("type") in critical_types for v in violations)
    
    if has_critical or total_score >= 40:
        return "critical"
    elif total_score >= 25:
        return "high"
    elif total_score >= 10:
        return "medium"
    else:
        return "low"


def parse_severity_emoji(severity_str: str) -> str:
    """Parse severity from emoji string like '🔴 CRITICAL'"""
    if "CRITICAL" in severity_str.upper() or "🔴" in severity_str:
        return "critical"
    elif "HIGH" in severity_str.upper() or "🟠" in severity_str:
        return "high"
    elif "MEDIUM" in severity_str.upper() or "🟡" in severity_str:
        return "medium"
    else:
        return "low"


def get_violation_type(violations: List[Dict[str, Any]]) -> str:
    """Get primary violation type from violations list"""
    if not violations:
        return "unknown"
    
    # Priority order for violation types
    priority = ["accident", "redlight", "wrong_way", "helmet", "seatbelt", 
                "triple_riding", "stopline", "illegal_parking", "vehicle"]
    
    violation_types = [v.get("type", "") for v in violations]
    
    for vtype in priority:
        if vtype in violation_types:
            return vtype
    
    return violations[0].get("type", "unknown")


def format_timestamp(timestamp_str: str) -> datetime:
    """Parse timestamp string to datetime"""
    try:
        # Try ISO format first
        return datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
    except:
        try:
            # Try common format: "2026-06-18 06:48:46"
            return datetime.strptime(timestamp_str, "%Y-%m-%d %H:%M:%S")
        except:
            # Fallback to current time
            return datetime.now()


def get_alert_message(incident: Dict[str, Any], alert_type: str) -> str:
    """Generate alert message based on incident and type"""
    incident_type = incident.get("violation_type", "Unknown")
    location = incident.get("location", {}).get("name", "Unknown location")
    plates = incident.get("license_plates", [])
    severity = incident.get("severity", "unknown").upper()
    timestamp = incident.get("timestamp", datetime.now())
    
    plate_str = plates[0] if plates else "Not captured"
    
    if alert_type == "police":
        return f"""🚨 GUARDIANEYE ALERT - {severity}

Incident Type: {incident_type}
Location: {location}
Vehicle: {plate_str}
Time: {timestamp.strftime("%Y-%m-%d %H:%M:%S")}
Severity: {severity}

Recommended Action: Dispatch nearest patrol unit. Issue e-challan. 
Confirm receipt within 60 seconds.

Evidence attached. Incident ID: {incident.get("incident_id", "N/A")}
"""
    
    elif alert_type == "hospital":
        return f"""🚑 GUARDIANEYE EMERGENCY - ACCIDENT DETECTED

Location: {location}
Time: {timestamp.strftime("%Y-%m-%d %H:%M:%S")}
Severity: {severity}

IMMEDIATE ACTION REQUIRED:
- Dispatch ambulance to location
- Prepare emergency room
- Alert trauma team

This is an automated alert from GuardianEye traffic monitoring system.
Visual confirmation attached.

Incident ID: {incident.get("incident_id", "N/A")}
"""
    
    else:  # ambulance
        return f"""🚨 EMERGENCY DISPATCH REQUEST

Accident detected at: {location}
Time: {timestamp.strftime("%Y-%m-%d %H:%M:%S")}
Coordinates: Available in system

Route optimization: Navigate via fastest route.
Expected severity: {severity}

Incident ID: {incident.get("incident_id", "N/A")}
"""


def mock_location_coordinates(location_name: str) -> Dict[str, float]:
    """Generate mock coordinates for location names (for demo)"""
    # Common Delhi locations with approximate coordinates
    locations = {
        "Delhi": {"lat": 28.6139, "lng": 77.2090},
        "Connaught Place": {"lat": 28.6315, "lng": 77.2167},
        "Rajiv Chowk": {"lat": 28.6328, "lng": 77.2197},
        "India Gate": {"lat": 28.6129, "lng": 77.2295},
        "Red Fort": {"lat": 28.6562, "lng": 77.2410},
        "Qutub Minar": {"lat": 28.5244, "lng": 77.1855},
    }
    
    # Default to Delhi center with small random offset
    default = locations.get("Delhi", {"lat": 28.6139, "lng": 77.2090})
    
    if location_name in locations:
        return locations[location_name]
    else:
        # Add small random offset for variety
        return {
            "lat": default["lat"] + random.uniform(-0.1, 0.1),
            "lng": default["lng"] + random.uniform(-0.1, 0.1)
        }


def calculate_avg_response_time(alerts: List[Dict[str, Any]]) -> str:
    """Calculate average response time from alerts"""
    if not alerts:
        return "N/A"
    
    total_seconds = 0
    count = 0
    
    for alert in alerts:
        sent_at = alert.get("sent_at")
        ack_at = alert.get("acknowledged_at")
        
        if sent_at and ack_at:
            diff = (ack_at - sent_at).total_seconds()
            if diff > 0:
                total_seconds += diff
                count += 1
    
    if count == 0:
        return "N/A"
    
    avg_seconds = int(total_seconds / count)
    minutes = avg_seconds // 60
    seconds = avg_seconds % 60
    
    return f"{minutes}m {seconds}s"
