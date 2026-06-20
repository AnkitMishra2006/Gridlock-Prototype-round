import requests
import sys

API_BASE = "http://localhost:8000/api"

def check_endpoint(name, url, method="GET", json_data=None, params=None, expected_keys=None):
    print(f"\n🔍 Testing: {name} ({method} {url})")
    try:
        if method == "GET":
            response = requests.get(url, params=params, timeout=5)
        elif method == "POST":
            response = requests.post(url, json=json_data, params=params, timeout=5)
        else:
            print("❌ Unknown method")
            return False

        if response.status_code != 200:
            print(f"❌ Failed! Status code: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False

        res_json = response.json()
        print(f"✅ Status Code: 200 OK")
        
        # Verify keys
        if expected_keys:
            missing_keys = [k for k in expected_keys if k not in res_json]
            if missing_keys:
                print(f"❌ Envelope validation failed! Missing keys: {missing_keys}")
                print(f"   Actual response keys: {list(res_json.keys())}")
                return False
            print(f"✅ Envelope validation passed! Keys verified: {expected_keys}")
            
            # Print preview
            for k in expected_keys:
                val = res_json[k]
                if isinstance(val, list):
                    print(f"   - key '{k}': List of {len(val)} items")
                elif isinstance(val, dict):
                    print(f"   - key '{k}': Dict with {len(val)} keys")
                else:
                    print(f"   - key '{k}': {val}")
        else:
            print(f"   Response keys: {list(res_json.keys())}")

        return True
    except Exception as e:
        print(f"❌ Connection error or parsing failed: {e}")
        return False

def main():
    print("=" * 70)
    print("🎯 GuardianEye Backend Full Route Verification")
    print("=" * 70)

    # 1. Health check
    try:
        r = requests.get("http://localhost:8000/health", timeout=5)
        if r.status_code == 200:
            print("✅ Health Check: PASSED")
            print(f"   Response: {r.json()}")
        else:
            print(f"❌ Health Check: FAILED (status {r.status_code})")
    except Exception as e:
        print(f"❌ Health Check: FAILED ({e})")
        sys.exit(1)

    tests = [
        # Incidents routes
        ("Get Incidents List", f"{API_BASE}/incidents", "GET", None, {"limit": 5}, ["incidents", "total"]),
        ("Get Recent Incidents", f"{API_BASE}/incidents/recent", "GET", None, {"limit": 5}, ["incidents", "total"]),
        ("Get Incidents Trend Stats", f"{API_BASE}/incidents/stats/trend", "GET", None, None, ["trend"]),
        ("Get Top Violation Stats", f"{API_BASE}/incidents/stats/top-violations", "GET", None, None, ["violations"]),

        # Alerts routes
        ("Get Alerts List", f"{API_BASE}/alerts", "GET", None, {"limit": 5}, ["alerts", "total"]),
        ("Get Pending Alerts Stats", f"{API_BASE}/alerts/stats/pending", "GET", None, None, ["pending"]),

        # Cameras routes
        ("Get Cameras List", f"{API_BASE}/cameras", "GET", None, None, ["cameras"]),

        # Dashboard routes
        ("Get Dashboard Stats", f"{API_BASE}/dashboard/stats", "GET", None, None, [
            "total_incidents_today", "safety_score", "active_accidents", 
            "high_severity_alerts", "pending_police_alerts", "pending_hospital_alerts"
        ]),

        # Processing & model health routes
        ("Get Model Health", f"{API_BASE}/process/model-health", "GET", None, None, ["status", "model_url"])
    ]

    passed = 0
    for name, url, method, json_data, params, expected_keys in tests:
        if check_endpoint(name, url, method, json_data, params, expected_keys):
            passed += 1

    # Dynamically verify get single incident
    print("\n🔍 Querying database to verify single incident route...")
    try:
        incidents_res = requests.get(f"{API_BASE}/incidents", params={"limit": 1}, timeout=5)
        if incidents_res.status_code == 200:
            incidents_data = incidents_res.json()
            inc_list = incidents_data.get("incidents", [])
            if inc_list:
                first_id = inc_list[0].get("incident_id")
                print(f"✅ Found incident: {first_id}")
                single_url = f"{API_BASE}/incidents/{first_id}"
                if check_endpoint("Get Single Incident Details", single_url, "GET", None, None, ["incident", "incident_id"]):
                    passed += 1
                    tests.append(("Get Single Incident Details", single_url, "GET", None, None, ["incident", "incident_id"]))
                else:
                    tests.append(("Get Single Incident Details", single_url, "GET", None, None, ["incident", "incident_id"]))
            else:
                print("⏭️ Skipping single incident route check (no incidents in database)")
        else:
            print("❌ Failed to query incidents list for ID check")
    except Exception as e:
        print(f"❌ Error while checking single incident route: {e}")

    print("\n" + "=" * 70)
    print("📊 API Route Summary")
    print("=" * 70)
    print(f"🎯 Score: {passed}/{len(tests)} endpoints passed envelope validation")
    if passed == len(tests):
        print("\n🎉 All backend routes are fully functional and return correct frontend envelopes!")
    else:
        print("\n❌ Some routes failed. Please inspect logs above.")

if __name__ == "__main__":
    main()
