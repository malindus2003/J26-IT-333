import os
import logging
from typing import Optional, Dict, Any, List
from pathlib import Path
from dotenv import load_dotenv

import firebase_admin
from firebase_admin import credentials, db as rtdb, firestore

# Configure logger
logger = logging.getLogger("firebase")

# Load backend/.env
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

_firebase_initialized = False
_db_ref = None
_firestore_client = None

def init_firebase() -> bool:
    """
    Initializes the Firebase Admin SDK using the credentials and database URL
    configured in backend/.env.
    Supports both Firebase Realtime Database and Cloud Firestore.
    """
    global _firebase_initialized, _db_ref, _firestore_client

    if _firebase_initialized and firebase_admin._apps:
        return True

    backend_dir = Path(__file__).resolve().parent.parent
    cred_file = os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase_service_account.json")
    cred_path = backend_dir / cred_file

    if not cred_path.exists():
        logger.warning(f"Firebase credentials not found at: {cred_path}")
        return False

    database_url = os.getenv(
        "FIREBASE_DATABASE_URL",
        "https://smart-restaurant-333-default-rtdb.asia-southeast1.firebasedatabase.app/"
    )

    try:
        if not firebase_admin._apps:
            cred = credentials.Certificate(str(cred_path))
            firebase_admin.initialize_app(cred, {
                "databaseURL": database_url
            } if database_url else None)

        # Initialize Realtime Database root reference
        if database_url:
            _db_ref = rtdb.reference("/")

        # Initialize Cloud Firestore client
        try:
            _firestore_client = firestore.client()
        except Exception:
            _firestore_client = None

        _firebase_initialized = True
        logger.info("🔥 Firebase Admin SDK successfully initialized.")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize Firebase Admin SDK: {e}")
        return False

def get_realtime_db():
    """Returns the root reference to the Firebase Realtime Database."""
    if not _firebase_initialized:
        init_firebase()
    return _db_ref

def get_firestore_client():
    """Returns the Cloud Firestore client."""
    if not _firebase_initialized:
        init_firebase()
    return _firestore_client

def get_firebase_status() -> Dict[str, Any]:
    """Checks and returns the live connection status of Firebase."""
    is_init = init_firebase()
    if not is_init:
        return {
            "connected": False,
            "realtime_database": False,
            "firestore": False,
            "error": "Credentials not found or failed to initialize"
        }

    rtdb_ok = False
    rtdb_keys = []
    try:
        ref = get_realtime_db()
        if ref:
            # Shallow read to verify live connectivity
            snapshot = ref.get(shallow=True)
            if snapshot:
                rtdb_ok = True
                rtdb_keys = list(snapshot.keys()) if isinstance(snapshot, dict) else []
    except Exception as e:
        logger.warning(f"Realtime Database check error: {e}")

    firestore_ok = False
    try:
        fs = get_firestore_client()
        if fs:
            cols = [c.id for c in fs.collections()]
            firestore_ok = True
    except Exception:
        firestore_ok = False

    return {
        "connected": rtdb_ok or firestore_ok,
        "project_id": "smart-restaurant-333",
        "database_url": os.getenv("FIREBASE_DATABASE_URL", ""),
        "realtime_database": {
            "status": "connected" if rtdb_ok else "unreachable",
            "active_nodes": rtdb_keys
        },
        "firestore": {
            "status": "connected" if firestore_ok else "not_configured"
        }
    }

def sync_all_staff_to_firebase(staff_list: List[Dict[str, Any]]) -> bool:
    """Syncs all 30 kitchen staff members from staff_database.csv to Firebase Realtime Database."""
    try:
        ref = get_realtime_db()
        if ref:
            staff_map = {}
            for s in staff_list:
                emp_id = str(s.get("emp_id") or s.get("id"))
                clean_s = {k: v for k, v in s.items() if not str(k).startswith("_")}
                staff_map[emp_id] = clean_s
            ref.child("kitchen_staff").set(staff_map)
            logger.info(f"🔥 Successfully synced {len(staff_map)} kitchen staff members to Firebase.")
            return True
    except Exception as e:
        logger.error(f"Failed to sync staff list to Firebase: {e}")
    return False

def get_all_staff_from_firebase() -> Optional[Dict[str, Any]]:
    """Retrieves all kitchen staff profiles directly from Firebase Realtime Database."""
    try:
        ref = get_realtime_db()
        if ref:
            val = ref.child("kitchen_staff").get()
            return val if isinstance(val, dict) else None
    except Exception as e:
        logger.error(f"Failed to fetch staff from Firebase: {e}")
    return None

