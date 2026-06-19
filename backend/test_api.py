#!/usr/bin/env python3
"""
Test script to verify backend API functionality
"""
import requests
import json
import sys
from pathlib import Path

API_BASE = "http://localhost:8000/api"
MODEL_OUTPUT_DIR = Path("../model/evidence")


def test_health():
    """Test if backend is running"""
    print("🔍 Testing backend health...")
    try:
        response = requests.get("http://localhost:8000/health")
        data = response.json()
        print(f"✅ Backend is {data['status']}")
        print(f"   Database: {data['database']}")
        return True
    except requests.exceptions.ConnectionError:
        print("❌ Backend is not running!")
        print("   Start it with: uvicorn app.main:app --reload")
        return False


def test_create_incident():
    """Test creating an incident from model output"""
    print("\n🔍 Testing incident creation...")
    
    # Load a sample model output
    sample_file = MODEL_OUTPUT_DIR / "final_output.json"
    
    if not sample_file.exists():
        print(f"❌ Sample file not found: {sample_file}")
        return False
    
    with open(sample_file, 'r') as f:
        detection = json.load(f)
    
    try:
        response = requests.post(f"{API_BASE}/incidents/", json=detection)
        response.raise_for_status()
        data = response.json()
        
        print(f"✅ Incident created successfully!")
        print(f"   Incident ID: {data['incident_id']}")
        print(f"   Total violations: {len(detection['violations'])}")
        
        return data['incident_id']
    except Exception as e:
        print(f"❌ Failed to create incident: {e}")
        return False


def test_get_incidents():
    """Test getting all incidents"""
    print("\n🔍 Testing get incidents...")
    
    try:
        response = requests.get(f"{API_BASE}/incidents?limit=10")
        response.raise_for_status()
        incidents = response.json()
        
        print(f"✅ Retrieved {len(incidents)} incidents")
        if incidents:
            print(f"   Latest: {incidents[0]['incident_id']} - {incidents[0]['violation_type']}")
        
        return True
    except Exception as e:
        print(f"❌ Failed to get incidents: {e}")
        return False


def test_dashboard_stats():
    """Test dashboard statistics"""
    print("\n🔍 Testing dashboard stats...")
    
    try:
        response = requests.get(f"{API_BASE}/dashboard/stats")
        response.raise_for_status()
        stats = response.json()
        
        print(f"✅ Dashboard stats retrieved!")
        print(f"   Violations today: {stats['violations_today']}")
        print(f"   Active accidents: {stats['active_accidents']}")
        print(f"   City safety score: {stats['city_safety_score']}")
        print(f"   Active cameras: {stats['active_cameras']}/{stats['total_cameras']}")
        
        return True
    except Exception as e:
        print(f"❌ Failed to get dashboard stats: {e}")
        return False


def test_send_alert(incident_id):
    """Test sending a police alert"""
    if not incident_id:
        print("\n⏭️  Skipping alert test (no incident ID)")
        return False
    
    print("\n🔍 Testing police alert...")
    
    try:
        response = requests.post(f"{API_BASE}/alerts/send-police?incident_id={incident_id}")
        response.raise_for_status()
        data = response.json()
        
        print(f"✅ Police alert sent!")
        print(f"   Alert ID: {data['alert_id']}")
        
        return True
    except Exception as e:
        print(f"❌ Failed to send alert: {e}")
        return False


def test_get_cameras():
    """Test getting cameras"""
    print("\n🔍 Testing get cameras...")
    
    try:
        response = requests.get(f"{API_BASE}/cameras")
        response.raise_for_status()
        cameras = response.json()
        
        print(f"✅ Retrieved {len(cameras)} cameras")
        if cameras:
            print(f"   Camera: {cameras[0]['camera_id']} - {cameras[0].get('name', 'Unknown')}")
        
        return True
    except Exception as e:
        print(f"❌ Failed to get cameras: {e}")
        return False


def main():
    """Run all tests"""
    print("=" * 60)
    print("  GuardianEye Backend API Tests")
    print("=" * 60)
    
    # Test 1: Health check
    if not test_health():
        sys.exit(1)
    
    # Test 2: Get incidents (should work even with empty DB)
    test_get_incidents()
    
    # Test 3: Get dashboard stats
    test_dashboard_stats()
    
    # Test 4: Get cameras
    test_get_cameras()
    
    # Test 5: Create incident
    incident_id = test_create_incident()
    
    # Test 6: Send alert
    test_send_alert(incident_id)
    
    print("\n" + "=" * 60)
    print("  ✅ All tests completed!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Check the dashboard stats again to see the new incident")
    print("2. Open http://localhost:8000/docs to explore all endpoints")
    print("3. Integrate these APIs with your frontend")


if __name__ == "__main__":
    main()
