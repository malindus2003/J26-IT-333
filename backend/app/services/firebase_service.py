"""
==================================================================================SLIIT IT4010 Research Project - SST (J26-IT-333)
Component 3: AI-Based Multi-Modal Food Spoilage Prediction & Quality Assessment
Author: Maddumage M. S. (IT23348820)

Firebase Realtime Database Integration Service
==================================================================================Manages high-frequency streaming of:
  - ESP32 Environmental Telemetry (Temp, Humidity, NH3, CO2, VOC)
  - Real-Time Storage Zone States
  - Early Spoilage & Risk Level Alerts
  - Cross-Component Culinary Recommendations

Features:
  - Auto-discovery of `firebase_service_account.json` credentials
  - Environment variable support (FIREBASE_DATABASE_URL, FIREBASE_CREDENTIALS_PATH)
  - Seamless offline fallback: Runs without crashing if Firebase is not yet configured
=================================================================================="""

import os
import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional, List

try:
    from dotenv import load_dotenv
    DOTENV_AVAILABLE = True
except ImportError:
    DOTENV_AVAILABLE = False

logger = logging.getLogger("FirebaseService")

try:
    import firebase_admin
    from firebase_admin import credentials, db
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False
    logger.warning("[FirebaseService] firebase-admin package is not installed.")

class FirebaseRealtimeDBService:
    """Singleton service managing Firebase Realtime Database connections & telemetry streaming."""

    def __init__(self):
        self.is_connected = False
        self.credentials_found = False
        self.credentials_path = None
        self.database_url = None
        self.app = None
        self._initialize_firebase()

    def _initialize_firebase(self):
        """Attempts to initialize Firebase Admin SDK using service account credentials."""
        if not FIREBASE_AVAILABLE:
            return

        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

        # Load environment variables from backend/.env if present
        if DOTENV_AVAILABLE:
            env_file = os.path.join(base_dir, ".env")
            if os.path.exists(env_file):
                load_dotenv(env_file, override=True)
            else:
                load_dotenv()

        # 1. Resolve Credentials Path
        env_cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")

        possible_paths = [
            env_cred_path if env_cred_path else None,
            os.path.join(base_dir, "firebase_service_account.json"),
            os.path.join(base_dir, "firebase-credentials.json"),
            os.path.join(base_dir, "serviceAccountKey.json"),
            os.path.join(os.path.dirname(base_dir), "firebase_service_account.json")
        ]

        resolved_path = None
        for path in possible_paths:
            if path and os.path.exists(path):
                resolved_path = path
                break

        # 2. Resolve Database URL
        self.database_url = os.getenv("FIREBASE_DATABASE_URL")

        if resolved_path:
            self.credentials_found = True
            self.credentials_path = resolved_path

            # If database URL not explicitly in env, try to inspect the service account or standard pattern
            if not self.database_url:
                try:
                    with open(resolved_path, "r", encoding="utf-8") as f:
                        key_data = json.load(f)
                        project_id = key_data.get("project_id")
                        if project_id:
                            # Standard default Firebase Realtime DB URL pattern
                            self.database_url = f"https://{project_id}-default-rtdb.firebaseio.com"
                except Exception as e:
                    logger.debug(f"[FirebaseService] Could not parse project_id: {e}")

        if not self.credentials_found:
            print("[FirebaseService] Running in Local Standalone Mode (No Firebase credentials detected).")
            print("[FirebaseService] To connect to Firebase, place 'firebase_service_account.json' in 'backend/' and set FIREBASE_DATABASE_URL in .env.")
            return

        if not self.database_url:
            print("[FirebaseService] Credentials found, but FIREBASE_DATABASE_URL is not set.")
            return

        # 3. Initialize Firebase Admin App
        try:
            if not firebase_admin._apps:
                cred = credentials.Certificate(self.credentials_path)
                self.app = firebase_admin.initialize_app(cred, {
                    'databaseURL': self.database_url
                })
            else:
                self.app = firebase_admin.get_app()

            self.is_connected = True
            print(f"[FirebaseService] Successfully connected to Firebase Realtime Database: {self.database_url}")
        except Exception as e:
            self.is_connected = False
            print(f"[FirebaseService] Failed to initialize Firebase connection: {e}")

    def get_status(self) -> Dict[str, Any]:
        """Returns the current connection status of Firebase Realtime DB."""
        return {
            "connected": self.is_connected,
            "database_url": self.database_url,
            "credentials_found": self.credentials_found,
            "credentials_path": os.path.basename(self.credentials_path) if self.credentials_path else None,
            "mode": "Live Firebase Realtime Database" if self.is_connected else "Local Standalone (Offline Fallback)",
            "setup_hint": "Place 'firebase_service_account.json' in the backend directory and set FIREBASE_DATABASE_URL to enable live cloud sync." if not self.is_connected else "Connected and operational."
        }

    def publish_telemetry(self, zone_id: str, telemetry: Dict[str, Any]) -> bool:
        """
        Publishes real-time ESP32 sensor telemetry to Firebase Realtime Database:
        Path: /telemetry/{zone_id}/latest
        Appends to: /telemetry/{zone_id}/history
        """
        if not self.is_connected:
            return False

        try:
            timestamp_str = datetime.now().isoformat()
            payload = {
                **telemetry,
                "timestamp": timestamp_str,
                "unix_epoch": int(datetime.now().timestamp() * 1000)
            }

            # Update latest reading
            ref_latest = db.reference(f"telemetry/{zone_id}/latest")
            ref_latest.set(payload)

            # Append to history node (push unique auto-key)
            ref_history = db.reference(f"telemetry/{zone_id}/history")
            ref_history.push(payload)

            return True
        except Exception as e:
            logger.error(f"[FirebaseService] Error publishing telemetry for {zone_id}: {e}")
            return False

    def get_latest_telemetry(self, zone_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Reads the latest telemetric reading directly from Firebase."""
        if not self.is_connected:
            return None

        try:
            path = f"telemetry/{zone_id}/latest" if zone_id else "telemetry"
            ref = db.reference(path)
            return ref.get()
        except Exception as e:
            logger.error(f"[FirebaseService] Error reading telemetry from Firebase: {e}")
            return None

    def publish_spoilage_alert(self, alert_id: str, alert_data: Dict[str, Any]) -> bool:
        """
        Publishes a food spoilage or high-risk alert to Firebase:
        Path: /alerts/{alert_id}
        """
        if not self.is_connected:
            return False

        try:
            ref = db.reference(f"alerts/{alert_id}")
            payload = {
                **alert_data,
                "created_at": datetime.now().isoformat(),
                "active": True
            }
            ref.set(payload)
            return True
        except Exception as e:
            logger.error(f"[FirebaseService] Error publishing alert: {e}")
            return False

    def sync_storage_zones(self, zones: List[Dict[str, Any]]) -> bool:
        """Syncs all storage zone statuses and baselines to Firebase."""
        if not self.is_connected:
            return False

        try:
            ref = db.reference("storage_zones")
            # Map zones list by zone id as keys
            zones_map = {z["id"]: z for z in zones}
            ref.set(zones_map)
            return True
        except Exception as e:
            logger.error(f"[FirebaseService] Error syncing storage zones to Firebase: {e}")
            return False

    def get_restaurant_profile(self) -> Optional[Dict[str, Any]]:
        """Reads the centralized restaurant profile & multi-branch configuration from Firebase."""
        if not self.is_connected:
            return None
        try:
            ref = db.reference("restaurant_profile")
            return ref.get()
        except Exception as e:
            logger.error(f"[FirebaseService] Error reading restaurant profile from Firebase: {e}")
            return None

    def update_restaurant_profile(self, profile_data: Dict[str, Any]) -> bool:
        """Persists restaurant identity, branch locations, and active coordinates to Firebase."""
        if not self.is_connected:
            return False
        try:
            ref = db.reference("restaurant_profile")
            ref.set(profile_data)
            return True
        except Exception as e:
            logger.error(f"[FirebaseService] Error updating restaurant profile in Firebase: {e}")
            return False

    def get_menu_items(self) -> Dict[str, Any]:
        """Reads all menu items from Firebase Realtime Database at /menu_items."""
        if not self.is_connected:
            return {}
        try:
            ref = db.reference("menu_items")
            return ref.get() or {}
        except Exception as e:
            logger.error(f"[FirebaseService] Error reading menu_items from Firebase: {e}")
            return {}

    def save_menu_item(self, item_id: str, item_data: Dict[str, Any]) -> bool:
        """Persists a new or updated menu item to Firebase at /menu_items/{item_id}."""
        if not self.is_connected:
            return False
        try:
            ref = db.reference(f"menu_items/{item_id}")
            ref.set(item_data)
            return True
        except Exception as e:
            logger.error(f"[FirebaseService] Error saving menu item {item_id} to Firebase: {e}")
            return False

    def get_reservations(self) -> Dict[str, Any]:
        """Reads all customer table reservations from Firebase Realtime Database at /reservations."""
        if not self.is_connected:
            return {}
        try:
            ref = db.reference("reservations")
            return ref.get() or {}
        except Exception as e:
            logger.error(f"[FirebaseService] Error reading reservations from Firebase: {e}")
            return {}

    def save_reservation(self, res_id: str, res_data: Dict[str, Any]) -> bool:
        """Persists a new or updated table reservation to Firebase at /reservations/{res_id}."""
        if not self.is_connected:
            return False
        try:
            ref = db.reference(f"reservations/{res_id}")
            ref.set(res_data)
            return True
        except Exception as e:
            logger.error(f"[FirebaseService] Error saving reservation {res_id} to Firebase: {e}")
            return False

    def sync_kitchen_staff(self, staff_list: List[Dict[str, Any]]) -> bool:
        """
        Syncs all 30 kitchen staff members from staff_database.csv to Firebase Realtime Database:
        Path: /kitchen_staff/{emp_id}
        """
        if not self.is_connected:
            return False

        try:
            ref = db.reference("kitchen_staff")
            staff_map = {}
            for s in staff_list:
                emp_id = str(s.get("emp_id") or s.get("id"))
                clean_s = {k: v for k, v in s.items() if not str(k).startswith("_")}
                staff_map[emp_id] = clean_s
            ref.set(staff_map)
            return True
        except Exception as e:
            logger.error(f"[FirebaseService] Error syncing kitchen staff to Firebase: {e}")
            return False

    def get_kitchen_staff(self) -> Optional[Dict[str, Any]]:
        """Reads all kitchen staff members directly from Firebase Realtime Database."""
        if not self.is_connected:
            return None

        try:
            ref = db.reference("kitchen_staff")
            return ref.get()
        except Exception as e:
            logger.error(f"[FirebaseService] Error reading kitchen staff from Firebase: {e}")
            return None


# Global singleton instance
firebase_service = FirebaseRealtimeDBService()

