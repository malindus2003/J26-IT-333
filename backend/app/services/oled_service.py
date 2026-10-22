from datetime import datetime
from typing import Dict, Any, Optional

class OLEDStateService:
    """
    Centralized service tracking the active OLED display payload broadcast to 
    physical ESP32 microcontrollers and the hardware bridge.
    Updated directly upon every Computer Vision image upload/scan or Web UI sync.
    """
    def __init__(self):
        self._current_state: Dict[str, Any] = {
            "produce": "Apple",
            "status": "FRESH",
            "spoilage_level": "Fresh",
            "visual_score": 22.0,
            "is_spoiled": False,
            "is_warning": False,
            "reason": "Produce Quality: Safe",
            "temperature": 11.4,
            "humidity": 90.0,
            "co2": 415.0,
            "voc": 0.18,
            "rsl_hours": 72.0,
            "source": "Initial Baseline",
            "updated_at": datetime.now().isoformat(),
            "sequence": 1
        }

    def get_state(self) -> Dict[str, Any]:
        return dict(self._current_state)

    def update_from_vision_result(
        self,
        produce_name: str,
        visual_score: float,
        risk_level: str = "Low",
        mould_detected: bool = False,
        rsl_hours: float = 72.0,
        source: str = "Image Upload",
        temperature: Optional[float] = None,
        humidity: Optional[float] = None,
        co2: Optional[float] = None,
        voc: Optional[float] = None,
        custom_reason: Optional[str] = None
    ) -> Dict[str, Any]:
        is_spoil = (
            risk_level in ["Critical", "High"] or
            visual_score >= 60.0 or
            bool(mould_detected)
        )
        is_warn = not is_spoil and (
            risk_level == "Medium" or
            visual_score >= 45.0
        )

        if is_spoil:
            status = "SPOILED"
            spoilage_level = "Spoiled"
            def_temp = 20.9
            def_humidity = 73.0
            def_co2 = 1250.0
            def_voc = 0.88
            def_reason = "Mould Colony Spoil" if mould_detected else "Thermal & Spoil Peak"
        elif is_warn:
            status = "WARNING"
            spoilage_level = "Warning"
            def_temp = 15.2
            def_humidity = 79.0
            def_co2 = 780.0
            def_voc = 0.45
            def_reason = "Warm Drift / Respire"
        else:
            status = "FRESH"
            spoilage_level = "Fresh"
            def_temp = 11.4
            def_humidity = 90.0
            def_co2 = 415.0
            def_voc = 0.18
            def_reason = "Produce Quality: Safe"

        temp = round(float(temperature), 1) if temperature is not None else def_temp
        hum = round(float(humidity), 1) if humidity is not None else def_humidity
        c2 = round(float(co2), 1) if co2 is not None else def_co2
        vc = round(float(voc), 2) if voc is not None else def_voc
        res = custom_reason if custom_reason else def_reason

        seq = self._current_state.get("sequence", 0) + 1
        self._current_state = {
            "produce": produce_name or "Produce",
            "status": status,
            "spoilage_level": spoilage_level,
            "visual_score": round(float(visual_score), 1),
            "is_spoiled": is_spoil,
            "is_warning": is_warn,
            "reason": res,
            "temperature": temp,
            "humidity": hum,
            "co2": c2,
            "voc": vc,
            "rsl_hours": round(float(rsl_hours), 1),
            "source": source,
            "updated_at": datetime.now().isoformat(),
            "sequence": seq
        }

        # Sync to Firebase Realtime Database
        try:
            from .firebase_service import firebase_service
            if firebase_service and firebase_service.is_connected:
                firebase_service.publish_oled_display(self._current_state)
        except Exception:
            pass

        return dict(self._current_state)

oled_service = OLEDStateService()
