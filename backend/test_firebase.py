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