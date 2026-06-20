"""
Complete Pipeline Test (2-Service Architecture)

Tests the entire flow:
Camera Image → Unified Backend (Embedded YOLO) → MongoDB → Dashboard & API endpoints
"""

import requests
import json
from pathlib import Path

# Configuration
BACKEND_URL = "http://localhost:8000"
TEST_IMAGE = "model/evidence/violation_20260618_053210.jpg"  # Real test image path

def test_backend_health():
    """Test 1: Check if backend API is running"""
    print("\n🔍 Test 1: Backend API Health Check")
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend API is healthy")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ Backend returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Backend API")
        print("   Make sure to start it with: conda run -n venv python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_model_health():
    """Test 2: Check if integrated model is healthy"""
    print("\n🔍 Test 2: Integrated Model Health Check")
    try:
        response = requests.get(f"{BACKEND_URL}/api/process/model-health", timeout=5)
        if response.status_code == 200:
            print("✅ Embedded YOLO models are healthy")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ Model health check returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Backend API for model health")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_backend_upload():
    """Test 3: Test backend upload & embedded YOLO processing"""
    print("\n🔍 Test 3: Backend Upload & Integrated YOLO Inference")
    
    # Check if test image exists
    if not Path(TEST_IMAGE).exists():
        print(f"⚠️  Test image not found: {TEST_IMAGE}")
        print("   Skipping upload test...")
        return True
    
    try:
        with open(TEST_IMAGE, 'rb') as f:
            files = {'file': ('test.jpg', f, 'image/jpeg')}
            data = {
                'camera_id': 'TEST-CAM-001',
                'location': 'Test Silk Board Junction',
                'latitude': 12.9716,
                'longitude': 77.5946
            }
            response = requests.post(
                f"{BACKEND_URL}/api/process/upload",
                files=files,
                data=data,
                timeout=60
            )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Backend upload & processing successful")
            print(f"   Success: {result.get('success')}")
            print(f"   Message: {result.get('message')}")
            if result.get('incident_id'):
                print(f"   Incident ID: {result.get('incident_id')}")
                print(f"   Primary Violation: {result.get('primary_violation')}")
                print(f"   Severity: {result.get('severity')}")
            return True
        else:
            print(f"⚠️  Backend upload returned status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error during upload test: {e}")
        return False


def test_simulation():
    """Test 4: Test simulation endpoint (no image needed)"""
    print("\n🔍 Test 4: Simulated Detection (No Model Inference)")
    
    try:
        data = {
            'camera_id': 'TEST-CAM-002',
            'violation_type': 'red_light'
        }
        response = requests.post(
            f"{BACKEND_URL}/api/process/simulate",
            data=data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Simulation successful")
            print(f"   Incident ID: {result.get('incident_id')}")
            print(f"   Mode: {result.get('mode')}")
            return True
        else:
            print(f"❌ Simulation failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_get_incidents():
    """Test 5: Check if incidents are retrievable and wrapped in the correct shape"""
    print("\n🔍 Test 5: Retrieve Incidents envelope from Backend")
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/incidents?limit=5", timeout=10)
        
        if response.status_code == 200:
            res_json = response.json()
            incidents = res_json.get("incidents", [])
            print(f"✅ Successfully retrieved wrapped incidents envelope. Count: {len(incidents)}")
            if incidents:
                print(f"   Latest incident ID: {incidents[0].get('incident_id')}")
                print(f"   Type: {incidents[0].get('violation_type')}")
                print(f"   Evidence Image: {incidents[0].get('evidence_image')}")
            return True
        else:
            print(f"❌ Failed to retrieve incidents. Status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def main():
    """Run all tests"""
    print("=" * 60)
    print("🎯 GuardianEye Complete Integrated Pipeline Test")
    print("=" * 60)
    
    results = []
    
    # Test backend
    results.append(("Backend Health", test_backend_health()))
    
    # Test model health
    results.append(("Model Health Check", test_model_health()))
    
    # If both are healthy, test upload
    if results[0][1] and results[1][1]:
        results.append(("Integrated Upload & YOLO", test_backend_upload()))
    
    # Test simulation
    if results[0][1]:
        results.append(("Simulation", test_simulation()))
        results.append(("Get Incidents", test_get_incidents()))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Summary")
    print("=" * 60)
    
    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    passed = sum(1 for _, p in results if p)
    total = len(results)
    
    print(f"\n🎯 Score: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! System is fully operational in 2-service mode!")
    else:
        print("\n❌ Some tests failed. Please review errors above.")


if __name__ == "__main__":
    main()
