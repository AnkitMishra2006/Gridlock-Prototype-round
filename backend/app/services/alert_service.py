from datetime import datetime
from typing import List, Dict, Any, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from ..models.schemas import AlertType, AlertStatus, SeverityLevel
from ..utils.helpers import generate_id, get_alert_message


class AlertService:
    """Service for alert management"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.alerts
    
    async def create_alert(
        self,
        incident: Dict[str, Any],
        alert_type: AlertType,
        recipient: str
    ) -> Dict[str, Any]:
        """Create and send an alert"""
        
        message = get_alert_message(incident, alert_type.value)
        
        alert_doc = {
            "alert_id": generate_id("ALR"),
            "incident_id": incident.get("incident_id"),
            "type": alert_type.value,
            "severity": incident.get("severity", "medium"),
            "recipient": recipient,
            "message": message,
            "status": AlertStatus.SENT.value,
            "sent_at": datetime.now(),
            "acknowledged_at": None,
            "created_at": datetime.now(),
        }
        
        result = await self.collection.insert_one(alert_doc)
        alert_doc["_id"] = str(result.inserted_id)
        
        # Mock sending alert (in production, integrate Twilio/WhatsApp)
        await self._send_alert_mock(alert_doc)
        
        # Update incident to track alert was sent
        await self.db.incidents.update_one(
            {"incident_id": incident.get("incident_id")},
            {
                "$set": {"alert_sent": True, "updated_at": datetime.now()},
                "$push": {"alerts": alert_doc["_id"]}
            }
        )
        
        return alert_doc
    
    async def get_all_alerts(
        self,
        skip: int = 0,
        limit: int = 100,
        alert_type: Optional[str] = None,
        status: Optional[str] = None,
        severity: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get all alerts with filters"""
        
        query = {}
        if alert_type:
            query["type"] = alert_type
        if status:
            query["status"] = status
        if severity:
            query["severity"] = severity
        
        cursor = self.collection.find(query).sort("sent_at", -1).skip(skip).limit(limit)
        alerts = await cursor.to_list(length=limit)
        
        for alert in alerts:
            alert["_id"] = str(alert["_id"])
        
        return alerts
    
    async def get_alert_by_id(self, alert_id: str) -> Optional[Dict[str, Any]]:
        """Get single alert by ID"""
        
        alert = await self.collection.find_one({"alert_id": alert_id})
        
        if alert:
            alert["_id"] = str(alert["_id"])
        
        return alert
    
    async def update_alert_status(
        self,
        alert_id: str,
        status: AlertStatus
    ) -> Optional[Dict[str, Any]]:
        """Update alert status"""
        
        update_data = {
            "status": status.value
        }
        
        if status == AlertStatus.ACKNOWLEDGED:
            update_data["acknowledged_at"] = datetime.now()
        
        result = await self.collection.find_one_and_update(
            {"alert_id": alert_id},
            {"$set": update_data},
            return_document=True
        )
        
        if result:
            result["_id"] = str(result["_id"])
        
        return result
    
    async def get_pending_alerts(self) -> int:
        """Get count of pending alerts"""
        return await self.collection.count_documents({
            "status": {"$in": [AlertStatus.SENT.value, AlertStatus.PENDING.value]}
        })
    
    async def get_alerts_by_type(self, alert_type: AlertType) -> int:
        """Count alerts by type"""
        return await self.collection.count_documents({"type": alert_type.value})
    
    async def _send_alert_mock(self, alert: Dict[str, Any]):
        """Mock alert sending (replace with real implementation)"""
        # In production, integrate with:
        # - Twilio for SMS
        # - WhatsApp Business API
        # - Email service
        # - Push notifications
        
        print(f"📤 Mock Alert Sent:")
        print(f"   Type: {alert['type']}")
        print(f"   To: {alert['recipient']}")
        print(f"   Severity: {alert['severity']}")
        print(f"   ID: {alert['alert_id']}")
