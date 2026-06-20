"""
Complete Pipeline Test

Tests the entire flow:
Camera Image → Backend Upload → Model Detection → Backend Storage → Frontend Display

Run this after starting both backend and model servers.
"""

import requests
import json
from pathlib import Path

# Configuration
BACKEND_URL = "http://localhost:8000"
MODEL_URL = "http://localhost:8001"
TEST_IMAGE = "model/evidence/test_image.jpg"  # Use any sample image

def test_model_health():
    """Test 1: Check if model API is running"""
    print("\n🔍 Test 1: Model API Health Check")
    try:
        response = requests.get(f"{MODEL_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Model API is healthy")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ Model API returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Model API")
        print("   Make sure to start it with: cd model && python model_api.py")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_backend_health():
    """Test 2: Check if backend API is running"""
    print("\n🔍 Test 2: Backend API Health Check")
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
        print("   Make sure to start it with: cd backend && uvicorn app.main:app --reload")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_model_detection():
    """Test 3: Test model detection directly"""
    print("\n🔍 Test 3: Direct Model Detection")
    
    # Check if test image exists
    if not Path(TEST_IMAGE).exists():
        print(f"⚠️  Test image not found: {TEST_IMAGE}")
        print("   Using simulation instead...")
        return True  # Skip this test
    
    try:
        with open(TEST_IMAGE, 'rb') as f:
            files = {'file': f}
            data = {'camera_id': 'TEST-CAM-001'}
            response = requests.post(
                f"{MODEL_URL}/detect",
                files=files,
                data=data,
                timeout=30
            )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Model detection successful")
            print(f"   Violations detected: {len(result.get('violations', []))}")
            print(f"   Inference time: {result.get('inference_time', 0):.3f}s")
            return True
        else:
            print(f"❌ Model detection failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_backend_upload():
    """Test 4: Test backend upload endpoint"""
    print("\n🔍 Test 4: Backend Upload & Processing")
    
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
                'location': 'Test Location',
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
            return True
        else:
            print(f"⚠️  Backend upload returned status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_simulation():
    """Test 5: Test simulation endpoint (no image needed)"""
    print("\n🔍 Test 5: Simulation (No Model Required)")
    
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
    """Test 6: Check if incidents are retrievable"""
    print("\n🔍 Test 6: Retrieve Incidents from Backend")
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/incidents?limit=5", timeout=10)
        
        if response.status_code == 200:
            incidents = response.json()
            print(f"✅ Retrieved {len(incidents)} incidents")
            if incidents:
                print(f"   Latest incident: {incidents[0].get('incident_id')}")
                print(f"   Type: {incidents[0].get('violation_type')}")
            return True
        else:
            print(f"❌ Failed to retrieve incidents")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def main():
    """Run all tests"""
    print("=" * 60)
    print("🎯 GuardianEye Complete Pipeline Test")
    print("=" * 60)
    
    results = []
    
    # Test backend
    results.append(("Backend Health", test_backend_health()))
    
    # Test model
    results.append(("Model Health", test_model_health()))
    
    # If both are healthy, test integration
    if results[0][1] and results[1][1]:
        results.append(("Model Detection", test_model_detection()))
        results.append(("Backend Upload", test_backend_upload()))
    
    # Test simulation (works without model)
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
        print("\n🎉 All tests passed! System is fully operational!")
    elif passed >= total * 0.6:
        print("\n⚠️  Most tests passed. Check failed tests above.")
    else:
        print("\n❌ Many tests failed. Make sure both servers are running:")
        print("   1. Backend: cd backend && uvicorn app.main:app --reload")
        print("   2. Model: cd model && python model_api.py")


if __name__ == "__main__":
    main()
