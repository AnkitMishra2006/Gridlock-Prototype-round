"""
Processing Routes - Image Upload and AI Processing

This module handles:
1. Image upload from cameras
2. Sending images to AI model
3. Processing model output
4. Creating incidents automatically
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional, List
import os
from datetime import datetime
import uuid
from ..database import get_database
from ..services.model_service import get_model_service
from ..services.incident_service import IncidentService
from ..config import settings
from ..models.schemas import DetectionInput

router = APIRouter(prefix="/api/process", tags=["processing"])


@router.post("/upload", response_model=dict)
async def upload_and_process(
    file: UploadFile = File(..., description="Image file from camera"),
    camera_id: str = Form(..., description="Camera ID"),
    location: Optional[str] = Form(None, description="Location name"),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Upload image from camera and process it through AI model
    
    **Complete Pipeline:**
    1. Receive image from camera
    2. Save image to uploads directory
    3. Send to AI model for processing
    4. Receive violation detection results
    5. Create incident in database
    6. Trigger alerts if needed
    
    **Usage:**
    ```bash
    curl -X POST http://localhost:8000/api/process/upload \
      -F "file=@camera_image.jpg" \
      -F "camera_id=CAM-001" \
      -F "location=Silk Board Junction"
    ```
    """
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=400,
            detail="File must be an image (JPEG, PNG, etc.)"
        )
    
    try:
        # Generate unique filename
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{camera_id}_{timestamp}_{uuid.uuid4().hex[:8]}{file_extension}"
        
        # Save uploaded file
        upload_dir = os.path.join(settings.base_dir, "uploads")
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, unique_filename)
        
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Prepare location data
        location_data = {
            "name": location or "Unknown Location",
        }
        if latitude and longitude:
            location_data["coordinates"] = {
                "lat": latitude,
                "lng": longitude
            }
        
        # Send to model for processing
        model_service = get_model_service()
        
        try:
            model_output = await model_service.detect_violations(
                image_path=file_path,
                camera_id=camera_id,
                timestamp=datetime.utcnow().isoformat()
            )
            
            # Check if violations were detected
            if not model_output.get("violations"):
                return {
                    "success": True,
                    "message": "No violations detected",
                    "violations_detected": 0,
                    "image_path": file_path
                }
            
            # Process model output into incident format
            incident_data = model_service.process_model_output(model_output)
            
            if not incident_data:
                return {
                    "success": True,
                    "message": "No violations detected",
                    "violations_detected": 0
                }
            
            # Add location data
            incident_data["location"] = location_data
            
            # Create detection input schema
            detection_input = DetectionInput(**incident_data)
            
            # Create incident
            incident_service = IncidentService(db)
            incident = await incident_service.create_from_detection(detection_input)
            
            return {
                "success": True,
                "message": "Image processed and incident created",
                "incident_id": incident["incident_id"],
                "violations_detected": len(model_output.get("violations", [])),
                "primary_violation": incident["violation_type"],
                "severity": incident["severity"],
                "confidence": incident["confidence"],
                "incident": incident
            }
            
        except Exception as model_error:
            # Model processing failed - save for manual review
            return {
                "success": False,
                "message": f"Model processing error: {str(model_error)}",
                "image_saved": file_path,
                "note": "Image saved for manual review"
            }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing upload: {str(e)}"
        )


@router.post("/upload-batch", response_model=dict)
async def upload_and_process_batch(
    files: List[UploadFile] = File(..., description="Multiple image files"),
    camera_ids: List[str] = Form(..., description="Camera IDs (comma-separated)"),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Upload and process multiple images in batch
    
    Useful for:
    - Processing queued camera captures
    - Bulk historical data processing
    - Testing with multiple samples
    """
    results = []
    
    for file, camera_id in zip(files, camera_ids):
        try:
            result = await upload_and_process(
                file=file,
                camera_id=camera_id,
                db=db
            )
            results.append(result)
        except Exception as e:
            results.append({
                "success": False,
                "error": str(e),
                "file": file.filename
            })
    
    successful = sum(1 for r in results if r.get("success"))
    
    return {
        "total_processed": len(files),
        "successful": successful,
        "failed": len(files) - successful,
        "results": results
    }


@router.get("/model-health", response_model=dict)
async def check_model_health():
    """
    Check if AI model service is reachable and healthy
    
    Use this to verify model integration before processing images
    """
    model_service = get_model_service()
    health = await model_service.health_check()
    
    if health["status"] != "healthy":
        raise HTTPException(
            status_code=503,
            detail=f"Model service unavailable: {health.get('error')}"
        )
    
    return health


@router.post("/simulate", response_model=dict)
async def simulate_detection(
    camera_id: str = Form(...),
    violation_type: str = Form(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Simulate a violation detection without actual image
    
    Useful for:
    - Testing the system
    - Demo purposes
    - Development without running model
    
    **Example:**
    ```bash
    curl -X POST http://localhost:8000/api/process/simulate \
      -F "camera_id=CAM-001" \
      -F "violation_type=red_light"
    ```
    """
    # Create mock detection data
    mock_detection = DetectionInput(
        violation_type=violation_type,
        confidence=0.85,
        severity="high" if violation_type in ["accident", "red_light"] else "medium",
        camera_id=camera_id,
        location={
            "name": "Test Location - Simulated",
            "coordinates": {"lat": 12.9716, "lng": 77.5946}
        },
        license_plates=["KA01AB1234"],
        evidence_image=f"simulated_{violation_type}.jpg",
        detected_objects=[
            {"class": "vehicle", "confidence": 0.92},
            {"class": violation_type, "confidence": 0.85}
        ]
    )
    
    # Create incident
    incident_service = IncidentService(db)
    incident = await incident_service.create_from_detection(mock_detection)
    
    return {
        "success": True,
        "message": "Simulated detection created",
        "mode": "simulation",
        "incident_id": incident["incident_id"],
        "incident": incident
    }
