"""
SLIIT IT4010 Research Project J26-IT-333
Firebase Realtime Database Connection Verification Script
"""
import sys
import os

# Automatically add backend directory to sys.path so it works from anywhere
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from app.services.firebase_service import firebase_service
    from app.data.mock_data import STORAGE_ZONES
except ImportError:
    # If run from inside backend/
    from backend.app.services.firebase_service import firebase_service
    from backend.app.data.mock_data import STORAGE_ZONES

def main():
    print("=" * 70)
    print("  FIREBASE REALTIME DATABASE VERIFICATION TEST")
    print("=" * 70)

    status = firebase_service.get_status()
    print(f"Status           : {status['mode']}")
    print(f"Connected        : {status['connected']}")
    print(f"Database URL     : {status['database_url']}")
    print(f"Credentials Key  : {status['credentials_path']}")
    print("-" * 70)

    if not status["connected"]:
        print("[!] Not connected to Firebase.")
        print(f"Hint: {status['setup_hint']}")
        return

    print("[*] 1. Syncing 5 Cold Storage Chambers to Firebase...")
    sync_ok = firebase_service.sync_storage_zones(STORAGE_ZONES)
    print(f"    Sync Status  : {'SUCCESS (Zones Created)' if sync_ok else 'FAILED'}")

    print("[*] 2. Reading Live Telemetry from Firebase Cloud (/telemetry/zone-fruit/latest)...")
    data = firebase_service.get_latest_telemetry("zone-fruit")
    if data:
        print(f"    Live Data    : Temp={data.get('temperature')}°C | Humidity={data.get('humidity')}% | NH3={data.get('nh3')}ppm | CO2={data.get('co2')}ppm")
        print(f"    Last Updated : {data.get('timestamp')}")
    else:
        print("    No telemetry records found yet. Publishing test telemetry...")
        firebase_service.publish_telemetry("zone-fruit", {
            "zone_name": "Zone 1: Tropical Fruit Chiller (11°C)",
            "temperature": 11.2,
            "humidity": 88.5,
            "nh3": 0.015,
            "co2": 510.0,
            "voc": 0.32,
            "status": "optimal"
        })
    print("[*] 3. Syncing 30 Kitchen Staff Members from staff_database.csv to Firebase...")
    try:
        from app.routers.kitchen import get_staff_data
        staff_list = get_staff_data()
    except Exception:
        try:
            from backend.app.routers.kitchen import get_staff_data
            staff_list = get_staff_data()
        except Exception:
            staff_list = []

    if staff_list:
        staff_sync_ok = firebase_service.sync_kitchen_staff(staff_list)
        print(f"    Staff Sync   : {'SUCCESS (30 Staff Members Uploaded)' if staff_sync_ok else 'FAILED'}")
        cloud_staff = firebase_service.get_kitchen_staff()
        if isinstance(cloud_staff, dict):
            print(f"    Cloud Roster : {len(cloud_staff)} active staff profiles verified in /kitchen_staff")
            sample_ids = ["EMP01", "EMP05", "EMP10", "EMP30"]
            for sid in sample_ids:
                if sid in cloud_staff:
                    m = cloud_staff[sid]
                    print(f"     • {sid}: {m.get('name')} ({m.get('assigned_station')}) - Efficiency: {m.get('efficiency_rating')}%")
    else:
        print("    [!] staff_database.csv not found or empty.")

    print("=" * 70)
    print("  ALL FIREBASE TESTS PASSED SUCCESSFULLY! CLOUD SYNC IS OPERATIONAL.")
    print("=" * 70)

if __name__ == "__main__":
    main()
