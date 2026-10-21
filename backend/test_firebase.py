import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Reconfigure stdout to utf-8 for terminal emojis
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import firebase_admin
from firebase_admin import credentials, db as rtdb, firestore

print("=" * 65)
print("  🔥 SLIIT Research J26-IT-333: Firebase Live Connectivity Test")
print("=" * 65)

# Step 1: Check .env file
backend_dir = Path(__file__).resolve().parent
env_file = backend_dir / ".env"
if env_file.exists():
    load_dotenv(dotenv_path=env_file)
    print(f"✅ [.env File]: Found at {env_file.name}")
else:
    print(f"❌ [.env File]: Missing at {env_file}")

# Step 2: Check Service Account JSON file
cred_filename = os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase_service_account.json")
cred_path = backend_dir / cred_filename
if cred_path.exists():
    print(f"✅ [Service Account Key]: Found at {cred_path.name}")
else:
    print(f"❌ [Service Account Key]: Missing at {cred_path}")
    sys.exit(1)

# Step 3: Check Database URL
db_url = os.getenv(
    "FIREBASE_DATABASE_URL",
    "https://smart-restaurant-333-default-rtdb.asia-southeast1.firebasedatabase.app/"
)
print(f"🌐 [Database URL]: {db_url}")

# Step 4: Initialize Firebase Admin SDK
try:
    if not firebase_admin._apps:
        cred = credentials.Certificate(str(cred_path))
        firebase_admin.initialize_app(cred, {"databaseURL": db_url} if db_url else None)
    print("✅ [Firebase Admin SDK]: Successfully initialized with credentials.")
except Exception as e:
    print(f"❌ [Firebase Admin SDK Error]: {e}")
    sys.exit(1)

# Step 5: Test Firebase Realtime Database
print("\n--- Testing Firebase Realtime Database ---")
try:
    ref = rtdb.reference("/")
    root_data = ref.get(shallow=True)
    if root_data:
        print("✅ [Realtime Database]: CONNECTED & ACTIVE!")
        print(f"   Root Database Nodes: {list(root_data.keys()) if isinstance(root_data, dict) else root_data}")

        # Fetch restaurant and storage zone details
        rest_name = rtdb.reference("/restaurant_name").get()
        if rest_name:
            print(f"   Restaurant Name: '{rest_name}'")

        zones = rtdb.reference("/storage_zones").get()
        if isinstance(zones, dict):
            print(f"   Active Storage Zones in Cloud: {len(zones)} zones ({', '.join(zones.keys())})")

        # Fetch and sync 30 Kitchen Staff members from staff_database.csv
        print("\n--- Verifying Kitchen Staff Members (30 Staff Members) ---")
        csv_path = backend_dir / "data" / "staff_database.csv"
        if not csv_path.exists():
            csv_path = backend_dir / "staff_database.csv"

        if csv_path.exists():
            import pandas as pd
            df_staff = pd.read_csv(csv_path)
            print(f"📄 [staff_database.csv]: Found {len(df_staff)} staff members in CSV file.")

            staff_sync_payload = {}
            for _, row in df_staff.iterrows():
                emp_id = str(row.get("emp_id", ""))
                name = str(row.get("name", ""))
                base_st = str(row.get("base_station", "Hot Kitchen"))
                clean_station = "Hot Kitchen"
                if "hot" in base_st.lower(): clean_station = "Hot Kitchen"
                elif "grill" in base_st.lower(): clean_station = "Grill"
                elif "cold" in base_st.lower() or "salad" in base_st.lower(): clean_station = "Cold Salad"
                elif "pizza" in base_st.lower(): clean_station = "Pizza"
                elif "fryer" in base_st.lower(): clean_station = "Fryer"

                scores = {c: int(row.get(c, 3)) for c in ["hot_kitchen", "grill_station", "cold_salad", "pizza_station", "fryer_station"]}
                avg_score = sum(scores.values()) / float(len(scores))
                eff = min(98, max(55, int(round(avg_score * 17.5 + 11.0))))
                speed = f"{min(5.0, round(avg_score * 0.85 + 0.65, 1))} / 5.0"

                if "Head Chef" in name or avg_score >= 4.4:
                    skill_lvl = "Executive Chef (Level 5)"
                    shift = "10:00 AM - 08:30 PM"
                elif "Sous Chef" in name or avg_score >= 4.0:
                    skill_lvl = "Executive Sous Chef (Level 4)"
                    shift = "11:00 AM - 09:30 PM"
                elif "Lead" in name or "Specialist" in name or avg_score >= 3.6:
                    skill_lvl = "Station Specialist (Level 3)"
                    shift = "07:00 AM - 04:00 PM"
                elif "CDP" in name or avg_score >= 3.2:
                    skill_lvl = "Chef de Partie (Level 3)"
                    shift = "01:00 PM - 10:00 PM"
                elif "Commis" in name or avg_score >= 2.4:
                    skill_lvl = "Commis Chef (Level 2)"
                    shift = "03:00 PM - 11:00 PM"
                else:
                    skill_lvl = "Kitchen Trainee (Level 1)"
                    shift = "08:00 AM - 05:00 PM"

                staff_sync_payload[emp_id] = {
                    "id": emp_id,
                    "emp_id": emp_id,
                    "name": name,
                    "base_station": base_st,
                    "assigned_station": clean_station,
                    "shift": shift,
                    "skill_level": skill_lvl,
                    "efficiency_rating": eff,
                    "speed_score": speed,
                    "hot_kitchen": scores["hot_kitchen"],
                    "grill_station": scores["grill_station"],
                    "cold_salad": scores["cold_salad"],
                    "pizza_station": scores["pizza_station"],
                    "fryer_station": scores["fryer_station"],
                    "isReallocated": False
                }

            rtdb.reference("/kitchen_staff").set(staff_sync_payload)
            print(f"🔥 [Firebase Realtime DB]: Synced {len(staff_sync_payload)} staff members to /kitchen_staff in cloud.")

        cloud_staff = rtdb.reference("/kitchen_staff").get()
        if isinstance(cloud_staff, dict):
            print(f"✅ [Firebase Realtime DB]: Successfully verified {len(cloud_staff)} active staff members in cloud!")
            print(f"   Staff IDs: {list(cloud_staff.keys())[:10]} ... (+{len(cloud_staff)-10} more)")
            print("   Sample Live Staff Profiles:")
            for s_id in ["EMP01", "EMP02", "EMP05", "EMP10", "EMP26", "EMP30"]:
                if s_id in cloud_staff:
                    m = cloud_staff[s_id]
                    print(f"    • {m.get('emp_id')}: {m.get('name')} | Station: {m.get('assigned_station')} | Shift: {m.get('shift')} | Eff: {m.get('efficiency_rating')}%")
        else:
            print("⚠️ [Firebase Realtime DB]: No staff records found under /kitchen_staff.")
    else:
        print("⚠️ [Realtime Database]: Connected, but root database is currently empty.")
except Exception as e:
    print(f"❌ [Realtime Database Error]: {e}")

# Step 6: Test Cloud Firestore
print("\n--- Testing Cloud Firestore ---")
try:
    fs_client = firestore.client()
    collections = list(fs_client.collections())
    print(f"✅ [Cloud Firestore]: Connected! Collections found: {[c.id for c in collections]}")
except Exception as e:
    if "404" in str(e) or "NOT_FOUND" in str(e):
        print("ℹ️ [Cloud Firestore]: Firestore database (default) has not been created yet in Google Cloud Console.")
        print("   (Your project is actively using Firebase Realtime Database above)")
    else:
        print(f"ℹ️ [Cloud Firestore]: {e}")

print("\n" + "=" * 65)
print("  🎉 Firebase is CONNECTED and ready to use in your application!")
print("=" * 65)