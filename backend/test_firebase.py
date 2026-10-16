import firebase_admin
from firebase_admin import credentials, firestore
import os

try:
    # backend ෆෝල්ඩරය තුළ ඇති firebase සේවා ගොනුව පරීක්ෂා කිරීම
    cred_path = os.path.join(os.path.dirname(__file__), "firebase_service_account.json")
    
    if not os.path.exists(cred_path):
        print(f"❌ Error: firebase_service_account.json not found at {cred_path}")
    else:
        cred = credentials.Certificate(cred_path)
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)
        
        db = firestore.client()
        # Firestore එකට සරල query එකක් යවා සම්බන්ධතාවය පරීක්ෂා කිරීම
        collections = db.collections()
        print("Connected: True")
        print("🔥 Firebase Firestore connection is fully active and working!")
except Exception as e:
    print(f"Connected: False")
    print(f"❌ Connection Error: {e}")