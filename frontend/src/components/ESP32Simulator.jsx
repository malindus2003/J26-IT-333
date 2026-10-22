import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Cpu, 
  Send, 
  CheckCircle, 
  RefreshCw, 
  Flame, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Thermometer, 
  Droplets, 
  Wind, 
  Gauge, 
  Wifi, 
  Activity, 
  Play, 
  Square, 
  Sliders, 
  Sparkles, 
  Layers,
  Database
} from 'lucide-react';
import axios from 'axios';

export default function ESP32Simulator({ zones = [], onTelemetrySent, isDarkMode }) {
  // Load storages configured in the unified Vision + IoT inspector
  const [storagesList, setStoragesList] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_restaurant_storages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      { id: "storage-1", name: "Storage 1: Tropical Chiller", target_temp: 11.0, target_humidity: 89.0, node_id: "ESP32-NODE-01" },
      { id: "storage-2", name: "Storage 2: Crisper Vault", target_temp: 5.0, target_humidity: 93.0, node_id: "ESP32-NODE-02" }
    ];
  });

  // Active selected storage or zone
  const [selectedStorageId, setSelectedStorageId] = useState(() => storagesList[0]?.id || "storage-1");

  const activeStorage = storagesList.find(s => s.id === selectedStorageId) || storagesList[0];

  // 4 Core Environmental Parameters matching the rest of the application
  const [temp, setTemp] = useState(11.4);
  const [humidity, setHumidity] = useState(89.5);
  const [voc, setVoc] = useState(0.32);
  const [co2, setCo2] = useState(450.0);

  const [statusMsg, setStatusMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [autoStreaming, setAutoStreaming] = useState(false);
  const [streamIntervalMs, setStreamIntervalMs] = useState(5000);
  const autoStreamTimerRef = useRef(null);

  // Initial packet logs reflecting the 4 core parameters
  const [packetLogs, setPacketLogs] = useState([
    { id: 1, time: "22:45:10", node: "ESP32-NODE-01", chamber: "Storage 1: Tropical Chiller", payload: "T:11.4°C, H:90.2%, VOC:0.32ppm, CO2:415ppm", status: "200 OK (Processed)" },
    { id: 2, time: "22:45:15", node: "ESP32-NODE-02", chamber: "Storage 2: Crisper Vault", payload: "T:5.2°C, H:94.0%, VOC:0.18ppm, CO2:580ppm", status: "200 OK (Processed)" }
  ]);

  // Sync inputs when active storage changes
  useEffect(() => {
    if (activeStorage) {
      setTemp(activeStorage.current_temp !== undefined ? activeStorage.current_temp : (activeStorage.target_temp || 11.0));
      setHumidity(activeStorage.current_humidity !== undefined ? activeStorage.current_humidity : (activeStorage.target_humidity || 89.0));
      setVoc(activeStorage.voc !== undefined ? activeStorage.voc : 0.32);
      setCo2(activeStorage.co2 !== undefined ? activeStorage.co2 : 450.0);
    }
  }, [activeStorage?.id]);

  // Telemetry Dispatch Function
  const handleSendTelemetry = useCallback(async (customPayload = null) => {
    setSending(true);
    setStatusMsg("");
    try {
      const targetName = activeStorage?.name || (zones[0]?.name) || "Storage 1: Tropical Chiller";
      const targetNode = activeStorage?.node_id || "ESP32-NODE-01";

      const payload = customPayload || {
        storage_zone: targetName,
        temperature: Number(temp),
        humidity: Number(humidity),
        voc: Number(voc),
        co2: Number(co2),
        nh3: 0.015 // baseline backward-compatibility
      };

      const res = await axios.post("http://localhost:8000/api/sensors/telemetry", payload);
      
      const newLog = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        node: targetNode,
        chamber: targetName.split(':')[0],
        payload: `T:${payload.temperature}°C, H:${payload.humidity}%, VOC:${payload.voc}ppm, CO2:${payload.co2}ppm`,
        status: "200 OK (Processed)"
      };
      setPacketLogs(prev => [newLog, ...prev.slice(0, 9)]);

      setStatusMsg(`✓ Transmitted telemetry packet to ${targetName} (${payload.temperature}°C, ${payload.voc} ppm VOC)`);

      // Update local storage representation
      try {
        const saved = localStorage.getItem('smart_restaurant_storages');
        if (saved) {
          const list = JSON.parse(saved);
          const updated = list.map(s => {
            if (s.id === activeStorage.id) {
              return {
                ...s,
                current_temp: payload.temperature,
                current_humidity: payload.humidity,
                voc: payload.voc,
                co2: payload.co2,
                status: (Math.abs(payload.temperature - (s.target_temp || 11)) > 3.5 || payload.voc > 0.6) ? 'warning' : 'optimal'
              };
            }
            return s;
          });
          localStorage.setItem('smart_restaurant_storages', JSON.stringify(updated));
        }
      } catch (e) {}

      if (onTelemetrySent) onTelemetrySent();
    } catch (err) {
      console.error("Telemetry transmission failed:", err);
      setStatusMsg("Failed to transmit telemetry to backend server.");
    } finally {
      setSending(false);
    }
  }, [activeStorage, temp, humidity, voc, co2, zones, onTelemetrySent]);

  // Aligned Quick Simulation Presets
  const simulatePreset = (type) => {
    const targetName = activeStorage?.name || "Storage 1: Tropical Chiller";
    const targetT = activeStorage?.target_temp || 11.0;
    const targetH = activeStorage?.target_humidity || 89.0;

    if (type === "optimal") {
      setTemp(targetT);
      setHumidity(targetH);
      setVoc(0.22);
      setCo2(420.0);
      handleSendTelemetry({
        storage_zone: targetName,
        temperature: targetT,
        humidity: targetH,
        voc: 0.22,
        co2: 420.0,
        nh3: 0.012
      });
    } else if (type === "thermal_drift") {
      const elevatedT = Number((targetT + 9.5).toFixed(1));
      setTemp(elevatedT);
      setHumidity(74.0);
      setVoc(0.65);
      setCo2(880.0);
      handleSendTelemetry({
        storage_zone: targetName,
        temperature: elevatedT,
        humidity: 74.0,
        voc: 0.65,
        co2: 880.0,
        nh3: 0.028
      });
    } else if (type === "near_spoil") {
      setTemp(28.5);
      setHumidity(65.0);
      setVoc(1.85);
      setCo2(1380.0);
      handleSendTelemetry({
        storage_zone: targetName,
        temperature: 28.5,
        humidity: 65.0,
        voc: 1.85,
        co2: 1380.0,
        nh3: 0.065
      });
    }
  };

  // Auto-Broadcast Loop (Periodic Telemetry Streaming for live demonstrations)
  useEffect(() => {
    if (autoStreaming) {
      autoStreamTimerRef.current = setInterval(() => {
        // Apply realistic natural sensor jitter (±0.2°C, ±0.4% RH, ±0.02 VOC, ±10 CO2)
        const jitterTemp = Number((temp + (Math.random() * 0.4 - 0.2)).toFixed(1));
        const jitterHum = Number(Math.min(99, Math.max(40, humidity + (Math.random() * 0.8 - 0.4))).toFixed(1));
        const jitterVoc = Number(Math.max(0.05, voc + (Math.random() * 0.04 - 0.02)).toFixed(2));
        const jitterCo2 = Number(Math.max(350, co2 + Math.round(Math.random() * 16 - 8)).toFixed(0));

        handleSendTelemetry({
          storage_zone: activeStorage?.name || "Storage 1: Tropical Chiller",
          temperature: jitterTemp,
          humidity: jitterHum,
          voc: jitterVoc,
          co2: jitterCo2,
          nh3: 0.018
        });
      }, streamIntervalMs);
    } else {
      if (autoStreamTimerRef.current) {
        clearInterval(autoStreamTimerRef.current);
        autoStreamTimerRef.current = null;
      }
    }
    return () => {
      if (autoStreamTimerRef.current) {
        clearInterval(autoStreamTimerRef.current);
        autoStreamTimerRef.current = null;
      }
    };
  }, [autoStreaming, streamIntervalMs, handleSendTelemetry, temp, humidity, voc, co2, activeStorage]);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Node Control Unit & Hardware Transmitter */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 sm:space-y-5">
        
        {/* Header with Title and Mode Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 border-b border-slate-100 dark:border-slate-800 pb-3 sm:pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-400">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  ESP32 Microcontroller Hardware Simulator
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-mono">
                    POST /api/sensors/telemetry
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    DHT22 + MQ-135 4-Parameter Array
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Emulate wireless telemetry packets transmitted by ESP32 chamber nodes into the multi-modal fusion engine.
            </p>
          </div>

          {/* Quick Simulation Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => simulatePreset("optimal")}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Cold Chain Safe</span>
            </button>
            <button
              type="button"
              onClick={() => simulatePreset("thermal_drift")}
              className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>Temp Elevation</span>
            </button>
            <button
              type="button"
              onClick={() => simulatePreset("near_spoil")}
              className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-900 border border-rose-300 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              <Flame className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
              <span>Gas Spike (~75%)</span>
            </button>
          </div>
        </div>

        {/* Target Chamber Selector Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase">Target Chamber:</span>
            <select
              value={selectedStorageId}
              onChange={(e) => setSelectedStorageId(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-extrabold text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 shadow-2xs"
            >
              {storagesList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.node_id || 'ESP32 Node'})
                </option>
              ))}
            </select>
          </div>

          {/* Auto-Stream Toggle for Live Demos */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setAutoStreaming(!autoStreaming)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-2xs ${
                autoStreaming
                  ? 'bg-emerald-600 text-white border-emerald-500 animate-pulse'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {autoStreaming ? (
                <>
                  <Square className="h-3.5 w-3.5" />
                  <span>Stop Auto-Stream</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Auto-Stream (5s)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ESP32 Hardware 0.96" I2C OLED Screen (SSD1306 128x64 Emulation) */}
        {(() => {
          const isSpoiledState = voc > 0.60 || (temp - Number(activeStorage?.target_temp || 11.0) > 7.0) || co2 > 1100;
          const isWarningState = !isSpoiledState && (voc > 0.35 || (temp - Number(activeStorage?.target_temp || 11.0) > 3.0) || co2 > 800);

          return (
            <div className="p-4 rounded-2xl bg-black border-2 border-slate-700 shadow-xl relative overflow-hidden font-mono text-cyan-400 select-none">
              <div className="flex items-center justify-between pb-1.5 border-b border-cyan-900/60 text-[10px] uppercase font-bold text-cyan-300">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400/80" />
                  <span className="tracking-wide">PHYSICAL OLED 128x64 EMULATION (I2C 0x3C • GPIO 21/22)</span>
                </div>
                <span className="text-[9px] text-cyan-500 font-mono">SSD1306 • LIVE FIRMWARE DISPLAY</span>
              </div>

              <div className="pt-2 pb-1 space-y-2">
                <div className="flex items-center justify-between text-xs font-black tracking-widest text-cyan-200 border-b border-dashed border-cyan-800 pb-1">
                  <span>FRUIT &amp; VEG STORAGE</span>
                  <span className="text-[10px] text-cyan-400 font-semibold">{activeStorage?.node_id || "ESP32-NODE-01"}</span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-bold text-cyan-300">
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-500 font-medium">T :</span>
                    <span className="text-white font-mono font-black">{temp}&deg;C</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-500 font-medium">RH:</span>
                    <span className="text-white font-mono font-black">{humidity}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-500 font-medium">CO2:</span>
                    <span className="text-white font-mono font-black">{co2} ppm</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-500 font-medium">VOC:</span>
                    <span className="text-white font-mono font-black">{voc} ppm</span>
                  </div>
                </div>

                {isSpoiledState ? (
                  <div className="p-2 rounded bg-cyan-100 text-slate-950 font-black text-center text-xs tracking-wider animate-pulse shadow-lg">
                    <div className="text-[13px] leading-tight">!! SPOILED / RISK !!</div>
                    <div className="text-[10px] font-bold text-rose-950 tracking-normal pt-0.5">
                      Produce Spoilage &amp; Thermal Runaway Triggered
                    </div>
                  </div>
                ) : isWarningState ? (
                  <div className="p-2 rounded border border-amber-400 bg-amber-950/40 text-amber-300 font-bold text-center text-xs tracking-wider">
                    <div className="text-[12px]">[ WARN: DRIFT/RESPIRE ]</div>
                    <div className="text-[10px] font-medium text-amber-200 pt-0.5">Accelerated Microbial Decay Phase</div>
                  </div>
                ) : (
                  <div className="p-2 rounded border border-cyan-400/80 bg-cyan-950/40 text-cyan-300 font-bold text-center text-xs tracking-wider">
                    <div className="text-[12px]">[ FRESH / OPTIMAL ]</div>
                    <div className="text-[10px] font-medium text-cyan-200 pt-0.5">Produce Quality: Safe</div>
                  </div>
                )}
              </div>

              <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent opacity-30" />
            </div>
          );
        })()}

        {/* 4 Core Parameters Controls Grid (Matching Chamber Inspector) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          
          {/* 1. Temperature */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Thermometer className="h-4 w-4 text-rose-500" /> Temperature
              </span>
              <span className="font-mono text-xs font-black text-rose-600 dark:text-rose-400">
                {temp}°C
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="0.5"
              value={temp}
              onChange={(e) => setTemp(parseFloat(e.target.value))}
              className="w-full accent-rose-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span>0°C Min</span>
              <span className="text-slate-600 dark:text-slate-400 font-bold">Target: {activeStorage?.target_temp || 11.0}°C</span>
              <span>40°C Max</span>
            </div>
          </div>

          {/* 2. Humidity */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Droplets className="h-4 w-4 text-sky-500" /> Rel. Humidity
              </span>
              <span className="font-mono text-xs font-black text-sky-600 dark:text-sky-400">
                {humidity}%
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="100"
              step="1"
              value={humidity}
              onChange={(e) => setHumidity(parseFloat(e.target.value))}
              className="w-full accent-sky-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span>30% Dry</span>
              <span className="text-sky-700 dark:text-sky-400 font-bold">Target: {activeStorage?.target_humidity || 89}%</span>
              <span>100% Sat</span>
            </div>
          </div>

          {/* 3. VOC & Ethylene */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Wind className="h-4 w-4 text-amber-500" /> VOC & Ethylene
              </span>
              <span className="font-mono text-xs font-black text-amber-600 dark:text-amber-400">
                {voc} ppm
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="3.00"
              step="0.05"
              value={voc}
              onChange={(e) => setVoc(parseFloat(e.target.value))}
              className="w-full accent-amber-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span>0.05 Clean</span>
              <span className="text-amber-700 dark:text-amber-400 font-bold">&lt;0.40 Safe</span>
              <span>3.00 Rot</span>
            </div>
          </div>

          {/* 4. CO2 Respiration */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Gauge className="h-4 w-4 text-emerald-500" /> Respiration CO₂
              </span>
              <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400">
                {co2} ppm
              </span>
            </div>
            <input
              type="range"
              min="350"
              max="2000"
              step="25"
              value={co2}
              onChange={(e) => setCo2(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span>350 Ambient</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">&lt;1000 Baseline</span>
              <span>2000 Peak</span>
            </div>
          </div>

        </div>

        {/* Transmission Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {statusMsg ? (
            <div className="text-xs font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="h-4 w-4 text-sky-600 flex-shrink-0" />
              <span>{statusMsg}</span>
            </div>
          ) : (
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Ready to broadcast packet to {activeStorage?.name}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => handleSendTelemetry()}
            disabled={sending}
            className="px-5 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-sky-700/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {sending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Broadcasting...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Broadcast Live Telemetry Packet</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Hardware Node Specifications & Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1.5">
          <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Cpu className="h-4 w-4 text-sky-600" /> Target Microcontroller
          </span>
          <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
            ESP32 DevKit V1 (Xtensa Dual-Core 240MHz). Runs <code className="font-mono text-sky-600">iot_firmware/esp32_food_monitor.ino</code> with brownout protection.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1.5">
          <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Wifi className="h-4 w-4 text-emerald-600" /> Wireless Protocol
          </span>
          <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
            802.11 b/g/n Wi-Fi HTTP client. Transmits JSON packets via REST with automated fallback to Firebase Realtime Database.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1.5">
          <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Database className="h-4 w-4 text-purple-600" /> Sensors & Pinout Bus
          </span>
          <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
            DHT22 (DAT &rarr; GPIO 4), MQ-135 (AO &rarr; GPIO 35), 0.96&quot; OLED (I2C SDA:21, SCL:22), Spoilage Alarm Buzzer (GPIO 5).
          </p>
        </div>
      </div>

      {/* Live Wireless Telemetry Packet Log Feed */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Radio className="h-4 w-4 text-emerald-600 animate-pulse" />
              <span>Live Telemetry Ingestion Activity Stream</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Real-time incoming packets received by the FastAPI backend server
            </p>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold self-start sm:self-auto">
            REST Ingest: ACTIVE
          </span>
        </div>

        <div className="overflow-x-auto no-scrollbar rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <table className="w-full min-w-[550px] text-left text-xs text-slate-700 dark:text-slate-300 font-mono">
            <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Node ID</th>
                <th className="py-2.5 px-3">Target Chamber</th>
                <th className="py-2.5 px-3">Sensory Telemetry Payload</th>
                <th className="py-2.5 px-3 text-right">HTTP Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
              {packetLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white dark:hover:bg-slate-900/60 transition-colors">
                  <td className="py-2.5 px-3 text-slate-500">{log.time}</td>
                  <td className="py-2.5 px-3 font-bold text-sky-700 dark:text-sky-400">{log.node}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{log.chamber}</td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-medium">{log.payload}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-700 dark:text-emerald-400 font-black">{log.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
