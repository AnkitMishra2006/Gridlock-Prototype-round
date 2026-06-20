"""
GuardianEye Model API Server

This creates a REST API endpoint for the YOLOv8 models
so the backend can send images and receive detections.

Run with: python model_api.py
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import base64
import io
import cv2
import numpy as np
from PIL import Image
from ultralytics import YOLO
import os
from datetime import datetime
import json

app = FastAPI(
    title="GuardianEye Model API",
    description="AI Model Service for Traffic Violation Detection",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model paths
MODEL_DIR = "./models"
EVIDENCE_DIR = "./evidence"

# Load models (lazy loading)
MODELS = {}

def load_model(model_name: str):
    """Load a YOLO model if not already loaded"""
    if model_name not in MODELS:
        model_path = os.path.join(MODEL_DIR, model_name, "weights", "best.pt")
        if not os.path.exists(model_path):
            # Try alternative path
            model_path = os.path.join(MODEL_DIR, model_name, "best.pt")
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found: {model_path}")
        MODELS[model_name] = YOLO(model_path)
    return MODELS[model_name]


class DetectionRequest(BaseModel):
    image: str  # base64 encoded image
    camera_id: str
    timestamp: Optional[str] = None
    return_evidence: bool = True


class DetectionResponse(BaseModel):
    violations: List[Dict[str, Any]]
    camera_id: str
    timestamp: str
    license_plates: List[str]
    evidence_image: Optional[str]
    detected_objects: List[Dict[str, Any]]
    model_version: str
    inference_time: float
    device: str


@app.get("/")
def root():
    return {
        "name": "GuardianEye Model API",
        "status": "running",
        "models_loaded": list(MODELS.keys()),
        "available_models": os.listdir(MODEL_DIR) if os.path.exists(MODEL_DIR) else []
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "models_loaded": len(MODELS),
        "device": "cuda" if os.environ.get("CUDA_VISIBLE_DEVICES") else "cpu"
    }


@app.post("/detect", response_model=DetectionResponse)
async def detect_violations(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    camera_id: str = Form(...),
    timestamp: Optional[str] = Form(None),
    return_evidence: bool = Form(True)
):
    """
    Detect violations in an image
    
    Can accept either:
    - Uploaded file (multipart/form-data)
    - Base64 encoded image (form field)
    """
    start_time = datetime.now()
    
    try:
        # Load image
        if file:
            image_bytes = await file.read()
            image = Image.open(io.BytesIO(image_bytes))
        elif image_base64:
            image_bytes = base64.b64decode(image_base64)
            image = Image.open(io.BytesIO(image_bytes))
        else:
            raise HTTPException(status_code=400, detail="No image provided")
        
        # Convert to numpy array
        img_array = np.array(image)
        if len(img_array.shape) == 2:  # Grayscale
            img_array = cv2.cvtColor(img_array, cv2.COLOR_GRAY2RGB)
        elif img_array.shape[2] == 4:  # RGBA
            img_array = cv2.cvtColor(img_array, cv2.COLOR_RGBA2RGB)
        
        # Run detection with multiple models
        violations = []
        all_detections = []
        license_plates = []
        
        # 1. Vehicle detection (base model)
        try:
            vehicle_model = load_model("vehicle_model")
            vehicle_results = vehicle_model(img_array, conf=0.5)
            for r in vehicle_results:
                for box in r.boxes:
                    all_detections.append({
                        "class": r.names[int(box.cls)],
                        "confidence": float(box.conf),
                        "bbox": box.xyxy[0].tolist()
                    })
        except Exception as e:
            print(f"Vehicle detection error: {e}")
        
        # 2. Helmet detection
        try:
            helmet_model = load_model("helmet_model")
            helmet_results = helmet_model(img_array, conf=0.5)
            for r in helmet_results:
                for box in r.boxes:
                    class_name = r.names[int(box.cls)]
                    if class_name == "driver" or "no" in class_name.lower():
                        violations.append({
                            "type": "no_helmet",
                            "confidence": float(box.conf),
                            "bbox": box.xyxy[0].tolist()
                        })
        except Exception as e:
            print(f"Helmet detection error: {e}")
        
        # 3. Red light detection
        try:
            redlight_model = load_model("redlight_model")
            redlight_results = redlight_model(img_array, conf=0.6)
            red_light_detected = False
            vehicle_in_intersection = False
            
            for r in redlight_results:
                for box in r.boxes:
                    class_name = r.names[int(box.cls)]
                    if "red" in class_name.lower():
                        red_light_detected = True
                    if "vehicle" in class_name.lower() or "motorcycle" in class_name.lower():
                        vehicle_in_intersection = True
            
            if red_light_detected and vehicle_in_intersection:
                violations.append({
                    "type": "red_light",
                    "confidence": 0.85,
                    "bbox": [0, 0, 0, 0]
                })
        except Exception as e:
            print(f"Red light detection error: {e}")
        
        # 4. Wrong way detection
        try:
            wrong_way_model = load_model("wrong_way_model")
            wrong_way_results = wrong_way_model(img_array, conf=0.6)
            for r in wrong_way_results:
                for box in r.boxes:
                    class_name = r.names[int(box.cls)]
                    if "wrong" in class_name.lower():
                        violations.append({
                            "type": "wrong_way",
                            "confidence": float(box.conf),
                            "bbox": box.xyxy[0].tolist()
                        })
        except Exception as e:
            print(f"Wrong way detection error: {e}")
        
        # 5. Accident detection
        try:
            accident_model = load_model("accident_model")
            accident_results = accident_model(img_array, conf=0.5)
            for r in accident_results:
                if len(r.boxes) > 0:
                    violations.append({
                        "type": "accident",
                        "confidence": float(r.boxes[0].conf),
                        "bbox": r.boxes[0].xyxy[0].tolist()
                    })
        except Exception as e:
            print(f"Accident detection error: {e}")
        
        # 6. License plate detection and OCR
        try:
            plate_model = load_model("license_plate_model")
            plate_results = plate_model(img_array, conf=0.5)
            for r in plate_results:
                for box in r.boxes:
                    # Extract plate region
                    bbox = box.xyxy[0].int().tolist()
                    plate_img = img_array[bbox[1]:bbox[3], bbox[0]:bbox[2]]
                    
                    # Simple OCR placeholder (you'd use EasyOCR or Tesseract here)
                    # For demo, generate mock plate
                    plate_number = f"KA{np.random.randint(1,10):02d}{chr(65+np.random.randint(0,26))}{chr(65+np.random.randint(0,26))}{np.random.randint(1000,9999)}"
                    license_plates.append(plate_number)
        except Exception as e:
            print(f"License plate detection error: {e}")
        
        # Generate evidence image
        evidence_filename = None
        if return_evidence and violations:
            evidence_img = img_array.copy()
            
            # Draw bounding boxes for violations
            for violation in violations:
                if violation.get("bbox"):
                    bbox = [int(x) for x in violation["bbox"]]
                    cv2.rectangle(evidence_img, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (0, 0, 255), 2)
                    cv2.putText(evidence_img, violation["type"], (bbox[0], bbox[1]-10),
                               cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
            
            # Save evidence
            os.makedirs(EVIDENCE_DIR, exist_ok=True)
            evidence_filename = f"{camera_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
            evidence_path = os.path.join(EVIDENCE_DIR, evidence_filename)
            cv2.imwrite(evidence_path, cv2.cvtColor(evidence_img, cv2.COLOR_RGB2BGR))
        
        # Calculate inference time
        inference_time = (datetime.now() - start_time).total_seconds()
        
        return DetectionResponse(
            violations=violations,
            camera_id=camera_id,
            timestamp=timestamp or datetime.now().isoformat(),
            license_plates=license_plates,
            evidence_image=evidence_filename,
            detected_objects=all_detections,
            model_version="YOLOv8-1.0",
            inference_time=inference_time,
            device="cpu"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detection error: {str(e)}")


@app.post("/detect-simple")
async def detect_simple(file: UploadFile = File(...)):
    """
    Simplified detection endpoint that just returns violations
    Good for quick testing
    """
    try:
        result = await detect_violations(
            file=file,
            camera_id="TEST",
            return_evidence=False
        )
        return {
            "violations_detected": len(result.violations),
            "violations": result.violations,
            "inference_time": result.inference_time
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    print("🚀 Starting GuardianEye Model API Server...")
    print(f"📁 Model directory: {MODEL_DIR}")
    print(f"📁 Evidence directory: {EVIDENCE_DIR}")
    print("🌐 Server will be available at: http://localhost:8001")
    print("📖 API docs at: http://localhost:8001/docs")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,
        log_level="info"
    )
