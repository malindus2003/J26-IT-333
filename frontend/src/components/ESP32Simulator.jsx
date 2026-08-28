import React, { useState } from 'react';
import { Cpu, Send, CheckCircle, RefreshCw, Flame, AlertOctagon, Radio, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import axios from 'axios';

export default function ESP32Simulator({ zones, onTelemetrySent, isDarkMode }) {
  const [selectedZone, setSelectedZone] = useState(zones[0]?.id || "zone-fruit");
  const [temp, setTemp] = useState(4.2);
  const [humidity, setHumidity] = useState(78.0);
  const [nh3, setNh3] = useState(0.35);
  const [co2, setCo2] = useState(650.0);
  const [voc, setVoc] = useState(0.40);
  const [statusMsg, setStatusMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [packetLogs, setPacketLogs] = useState([
    { id: 1, time: "10:14:22", zone: "Zone 1 (Fruits)", payload: "T:9.2°C, H:91%, CO2:980ppm", status: "200 OK" },
    { id: 2, time: "10:14:32", zone: "Zone 4 (Meat)", payload: "T:3.8°C, H:78%, NH3:0.28ppm", status: "200 OK" },
  ]);

  const handleSendTelemetry = async (customPayload = null) => {
    setSending(true);
    setStatusMsg("");
    try {
      const zoneObj = zones.find(z => z.id === selectedZone) || zones[0];
      const payload = customPayload || {
        storage_zone: zoneObj.name,
        temperature: Number(temp),
        humidity: Number(humidity),
        nh3: Number(nh3),
        co2: Number(co2),
        voc: Number(voc)
      };

      const res = await axios.post("http://localhost:8000/api/sensors/telemetry", payload);
      
      const newLog = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        zone: zoneObj.name.split(':')[0],
        payload: `T:${payload.temperature}°C, H:${payload.humidity}%, NH3:${payload.nh3}ppm, CO2:${payload.co2}ppm`,
        status: "200 OK (Processed)"
      };
      setPacketLogs(prev => [newLog, ...prev.slice(0, 5)]);

      setStatusMsg(`Telemetry Packet Successfully Transmitted to ${zoneObj.name.split(':')[0]}`);
      if (onTelemetrySent) onTelemetrySent();
    } catch (err) {
      console.error("Telemetry failed:", err);
      setStatusMsg("Failed to transmit telemetry");
    } finally {
      setSending(false);
    }
  };

  const simulatePreset = (type) => {
    if (type === "anomaly") {
      // Simulate cooling breakdown + gas spike
      setTemp(11.8);
      setHumidity(94.0);
      setNh3(0.65);
      setCo2(1150.0);
      setVoc(0.82);
      handleSendTelemetry({
        storage_zone: zones.find(z => z.id === selectedZone)?.name || zones[0].name,
        temperature: 11.8,
        humidity: 94.0,
        nh3: 0.65,
        co2: 1150.0,
        voc: 0.82
      });
    } else if (type === "normal") {
      // Restore normal baseline
      const z = zones.find(item => item.id === selectedZone) || zones[0];
      setTemp(z.target_temp);
      setHumidity(z.target_humidity);
      setNh3(0.04);
      setCo2(450.0);
      setVoc(0.12);
      handleSendTelemetry({
        storage_zone: z.name,
        temperature: z.target_temp,
        humidity: z.target_humidity,
        nh3: 0.04,
        co2: 450.0,
        voc: 0.12
      });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Node Control Unit */}
      <div className="glass-panel p-3.5 sm:p-6 rounded-xl sm:rounded-2xl space-y-3.5 sm:space-y-4 bg-white dark:bg-slate-900 border border-[#d1ded5] dark:border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 border-b border-[#e1eae4] dark:border-slate-800 pb-3 sm:pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">ESP32 Microcontroller Hardware Simulator</h2>
              <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20 font-mono font-bold">
                POST /api/sensors/telemetry
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Emulate real-time wireless packets transmitted by ESP32 sensor nodes in storage containers
            </p>
          </div>

          {/* Quick Trigger Presets */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => simulatePreset("anomaly")}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30 text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Flame className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-rose-600 dark:text-rose-400" /> Simulate Spoilage Anomaly
            </button>
            <button
              onClick={() => simulatePreset("normal")}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30 text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" /> Reset Baseline
            </button>
          </div>
        </div>

        {/* Input Parameters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mt-3 sm:mt-4 text-xs">
          <div>
            <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Target Storage Node</label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-sky-500 shadow-sm"
            >
              {zones.map(z => (
                <option key={z.id} value={z.id}>{z.name.split(':')[0]} ({z.category})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Temp (°C)</label>
            <input
              type="number"
              step="0.1"
              value={temp}
              onChange={(e) => setTemp(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-sky-500 shadow-sm"
            />
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Humidity (%)</label>
            <input
              type="number"
              step="0.5"
              value={humidity}
              onChange={(e) => setHumidity(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-sky-500 shadow-sm"
            />
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">NH₃ (ppm)</label>
            <input
              type="number"
              step="0.01"
              value={nh3}
              onChange={(e) => setNh3(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-sky-500 shadow-sm"
            />
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">CO₂ (ppm)</label>
            <input
              type="number"
              step="10"
              value={co2}
              onChange={(e) => setCo2(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-sky-500 shadow-sm"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => handleSendTelemetry()}
              disabled={sending}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/25 transition-colors cursor-pointer"
            >
              <Send className="h-4 w-4" /> Broadcast
            </button>
          </div>
        </div>

        {statusMsg && (
          <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-xl bg-sky-50 border border-sky-200 dark:bg-sky-500/10 dark:border-sky-500/30 text-[11px] sm:text-xs text-sky-800 dark:text-sky-300 font-mono flex items-center gap-2 font-bold shadow-2xs">
            <CheckCircle2 className="h-4 w-4 text-sky-600 dark:text-sky-400 flex-shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}
      </div>

      {/* Live Wireless Telemetry Packet Log Feed */}
      <div className="glass-panel p-3.5 sm:p-6 rounded-xl sm:rounded-2xl space-y-3 sm:space-y-4 bg-white dark:bg-slate-900 border border-[#d1ded5] dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Radio className="h-4 w-4 text-emerald-600 dark:text-emerald-400 animate-pulse" /> Live Telemetry Ingestion Activity Stream
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">Incoming sensor packets logged from connected ESP32 hardware</p>
          </div>
          <span className="text-[10px] sm:text-[11px] font-mono px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-slate-800 dark:text-emerald-400 dark:border-slate-700 font-bold self-start sm:self-auto">
            HTTP/REST Ingest: ACTIVE
          </span>
        </div>

        <div className="overflow-x-auto no-scrollbar rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-xs">
          <table className="w-full min-w-[550px] text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 uppercase font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 sm:py-3 px-3 sm:px-4">Timestamp</th>
                <th className="py-2.5 sm:py-3 px-3 sm:px-4">Target Node</th>
                <th className="py-2.5 sm:py-3 px-3 sm:px-4">Sensory Telemetry Payload</th>
                <th className="py-2.5 sm:py-3 px-3 sm:px-4 text-right">HTTP Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px] sm:text-xs">
              {packetLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-slate-500 dark:text-slate-400">{log.time}</td>
                  <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-bold text-slate-900 dark:text-white">{log.zone}</td>
                  <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-slate-700 dark:text-slate-300">{log.payload}</td>
                  <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-emerald-600 dark:text-emerald-400 font-black">{log.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
