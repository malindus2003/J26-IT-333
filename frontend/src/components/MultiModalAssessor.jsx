import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Zap, 
  Sliders, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldAlert, 
  Sparkles, 
  Apple, 
  Carrot, 
  Milk, 
  Fish, 
  Beef,
  Clock,
  Hourglass,
  TrendingDown
} from 'lucide-react';
import axios from 'axios';

const QUICK_PRESETS = [
  { name: "Fresh Strawberries", category: "Fruits", temp: 9.5, humidity: 91, nh3: 0.04, co2: 1050, voc: 0.52, hours: 80, dis: 20, mould: false },
  { name: "Cavendish Bananas", category: "Fruits", temp: 9.0, humidity: 88, nh3: 0.03, co2: 980, voc: 0.48, hours: 90, dis: 25, mould: false },
  { name: "Romaine Lettuce", category: "Vegetables", temp: 5.0, humidity: 90, nh3: 0.04, co2: 600, voc: 0.20, hours: 40, dis: 5, mould: false },
  { name: "Baby Spinach Leaves", category: "Vegetables", temp: 5.8, humidity: 92, nh3: 0.06, co2: 740, voc: 0.35, hours: 75, dis: 22, mould: false },
  { name: "Pasteurized Milk", category: "Dairy", temp: 3.2, humidity: 66, nh3: 0.04, co2: 420, voc: 0.10, hours: 48, dis: 2, mould: false },
  { name: "Fresh Chicken Breast", category: "Meat", temp: 4.1, humidity: 79, nh3: 0.32, co2: 580, voc: 0.38, hours: 64, dis: 15, mould: false },
  { name: "Yellowfin Tuna", category: "Fish", temp: 1.1, humidity: 86, nh3: 0.08, co2: 440, voc: 0.14, hours: 18, dis: 4, mould: false }
];

export default function MultiModalAssessor({ currentVisionFeatures, selectedZone }) {
  const [itemName, setItemName] = useState("Fresh Strawberries");
  const [category, setCategory] = useState("Fruits");
  const [storageHours, setStorageHours] = useState(72);

  // Sensor inputs
  const [temp, setTemp] = useState(9.2);
  const [humidity, setHumidity] = useState(90);
  const [nh3, setNh3] = useState(0.04);
  const [co2, setCo2] = useState(980);
  const [voc, setVoc] = useState(0.48);

  // Vision inputs
  const [useVision, setUseVision] = useState(true);
  const [discoloration, setDiscoloration] = useState(15);
  const [mouldDetected, setMouldDetected] = useState(false);
  const [textureDegradation, setTextureDegradation] = useState(20);

  // Prediction State
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const applyPreset = (preset) => {
    setItemName(preset.name);
    setCategory(preset.category);
    setTemp(preset.temp);
    setHumidity(preset.humidity);
    setNh3(preset.nh3);
    setCo2(preset.co2);
    setVoc(preset.voc);
    setStorageHours(preset.hours);
    setDiscoloration(preset.dis);
    setMouldDetected(preset.mould);
  };

  useEffect(() => {
    if (selectedZone) {
      setTemp(selectedZone.current_temp);
      setHumidity(selectedZone.current_humidity);
      setNh3(selectedZone.nh3);
      setCo2(selectedZone.co2);
      setVoc(selectedZone.voc);
      setCategory(selectedZone.category);
    }
  }, [selectedZone]);

  useEffect(() => {
    if (currentVisionFeatures) {
      setCategory(currentVisionFeatures.category);
      setDiscoloration(currentVisionFeatures.discoloration_score);
      setMouldDetected(currentVisionFeatures.mould_detected);
      setTextureDegradation(currentVisionFeatures.texture_degradation);
      setUseVision(true);
    }
  }, [currentVisionFeatures]);

  useEffect(() => {
    runPrediction();
  }, [itemName, category, storageHours, temp, humidity, nh3, co2, voc, useVision, discoloration, mouldDetected, textureDegradation]);

  const runPrediction = async () => {
    try {
      setLoading(true);
      const payload = {
        item_name: itemName,
        category: category,
        storage_duration_hours: Number(storageHours),
        sensor_data: {
          storage_zone: selectedZone?.name || "Main Storage",
          temperature: Number(temp),
          humidity: Number(humidity),
          nh3: Number(nh3),
          co2: Number(co2),
          voc: Number(voc)
        },
        vision_data: useVision ? {
          discoloration_score: Number(discoloration),
          mould_detected: mouldDetected,
          mould_coverage: mouldDetected ? 12.0 : 0.0,
          texture_degradation: Number(textureDegradation),
          visual_spoilage_score: Number(discoloration) + (mouldDetected ? 50 : 0)
        } : null
      };

      const res = await axios.post("http://localhost:8000/api/predictions/assess", payload);
      setPrediction(res.data);
    } catch (err) {
      console.error("Prediction error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (level) => {
    switch (level) {
      case "Low":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> LOW RISK (FRESH)</span>;
      case "Medium":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> MEDIUM RISK</span>;
      case "High":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-50 dark:bg-orange-950/60 text-orange-900 dark:text-orange-300 border border-orange-300 dark:border-orange-700 flex items-center gap-1"><ShieldAlert className="h-3.5 w-3.5" /> HIGH RISK (PRIORITY)</span>;
      case "Critical":
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-300 border border-rose-300 dark:border-rose-700 flex items-center gap-1 animate-pulse"><XCircle className="h-3.5 w-3.5" /> CRITICAL (DISPOSE)</span>;
    }
  };

  return (
    <div className="glass-panel p-3.5 sm:p-6 rounded-xl sm:rounded-2xl space-y-3.5 sm:space-y-5 bg-white dark:bg-slate-900 border border-[#d1ded5] dark:border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-[#e1eae4] dark:border-slate-800 pb-3 sm:pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">Universal AI Spoilage & Shelf-Life Assessor</h2>
            <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold flex items-center gap-1">
              <Cpu className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Fusion Engine
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
            Merges physical gas & climate sensors with visual CV indicators across Fruits, Veg, Dairy, Fish & Meat
          </p>
        </div>
      </div>

      {/* Preset Quick Select Dropdown & Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-[#f8faf9] dark:bg-slate-800/60 border border-[#d1ded5] dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
            Quick Food Preset:
          </span>
          <select
            value={itemName}
            onChange={(e) => {
              const p = QUICK_PRESETS.find(item => item.name === e.target.value);
              if (p) applyPreset(p);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-[#c6d7cd] dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white shadow-2xs focus:outline-none focus:border-emerald-600"
          >
            {QUICK_PRESETS.map((p, idx) => (
              <option key={idx} value={p.name}>
                {p.name} ({p.category})
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {QUICK_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(p)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap border ${
                itemName === p.name
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                  : 'bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-slate-800 border-[#d1ded5] dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-6 mt-1 sm:mt-2">
        
        {/* Controls & Simulators */}
        <div className="lg:col-span-6 space-y-3.5 sm:space-y-4 bg-[#f8faf9] dark:bg-slate-800/80 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-[#d1ded5] dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sliders className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /> Multi-Source Input Parameters
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Food Item Name</label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-[#c6d7cd] dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-600 shadow-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Food Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-[#c6d7cd] dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-emerald-600 shadow-sm"
              >
                <option value="Fruits">Fruits (Bananas, Strawberries, Apples...)</option>
                <option value="Vegetables">Vegetables (Lettuce, Spinach, Tomatoes...)</option>
                <option value="Dairy">Dairy (Milk, Cheese, Yogurt...)</option>
                <option value="Fish">Fish & Seafood (Tuna, Salmon, Prawns...)</option>
                <option value="Meat">Meat & Poultry (Chicken, Beef, Pork...)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-400 font-bold">Storage Elapsed Duration:</span>
              <span className="font-bold text-emerald-800 dark:text-emerald-400">{storageHours} Hours ({(storageHours / 24.0).toFixed(1)} days)</span>
            </div>
            <input
              type="range"
              min="1"
              max="168"
              value={storageHours}
              onChange={(e) => setStorageHours(e.target.value)}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-700"
            />
          </div>

          {/* Sensor Parameter Sliders */}
          <div className="pt-3 border-t border-[#e1eae4] dark:border-slate-700 space-y-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">IoT Sensor Telemetry</span>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Temp:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{temp}°C</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="20"
                  step="0.5"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded appearance-none cursor-pointer accent-rose-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Humidity:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{humidity}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="98"
                  value={humidity}
                  onChange={(e) => setHumidity(e.target.value)}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded appearance-none cursor-pointer accent-sky-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-600 dark:text-slate-400">NH₃ (ppm):</span>
                  <span className="font-mono font-bold text-purple-700 dark:text-purple-400">{nh3}</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="1.0"
                  step="0.01"
                  value={nh3}
                  onChange={(e) => setNh3(e.target.value)}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-600 dark:text-slate-400">CO₂ (ppm):</span>
                  <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400">{co2}</span>
                </div>
                <input
                  type="range"
                  min="350"
                  max="2000"
                  step="25"
                  value={co2}
                  onChange={(e) => setCo2(e.target.value)}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded appearance-none cursor-pointer accent-emerald-700"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-600 dark:text-slate-400">VOC / Ethylene:</span>
                  <span className="font-mono font-bold text-amber-700 dark:text-amber-400">{voc}</span>
                </div>
                <input
                  type="range"
                  min="0.02"
                  max="1.5"
                  step="0.02"
                  value={voc}
                  onChange={(e) => setVoc(e.target.value)}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded appearance-none cursor-pointer accent-amber-600"
                />
              </div>
            </div>
          </div>

          {/* Computer Vision Toggle */}
          <div className="pt-3 border-t border-[#e1eae4] dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Vision Features</span>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={useVision}
                  onChange={(e) => setUseVision(e.target.checked)}
                  className="rounded bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-0"
                />
                Enable CV Fusion
              </label>
            </div>

            {useVision && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Browning / Bruise:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{discoloration}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={discoloration}
                    onChange={(e) => setDiscoloration(e.target.value)}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded appearance-none cursor-pointer accent-emerald-700"
                  />
                </div>
                <div className="flex items-center justify-center pt-2">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-rose-700 dark:text-rose-400">
                    <input
                      type="checkbox"
                      checked={mouldDetected}
                      onChange={(e) => setMouldDetected(e.target.checked)}
                      className="rounded bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-rose-600 focus:ring-0"
                    />
                    Fungal Spores / Mould
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Prediction Results & Remaining Shelf Life Breakdown */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-3 sm:space-y-4">
          {prediction && (
            <div className="bg-white dark:bg-slate-800/90 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-[#d1ded5] dark:border-slate-700 flex flex-col h-full justify-between shadow-xs space-y-3 sm:space-y-4">
              
              <div>
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                    {prediction.category} Spoilage & RSL Assessment
                  </span>
                  {getRiskBadge(prediction.risk_level)}
                </div>

                {/* Big Metric Gauges */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-3 sm:mt-4">
                  <div className="p-3 sm:p-4 rounded-xl bg-[#ecfdf5] dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                    <span className="text-[11px] sm:text-xs text-emerald-900 dark:text-emerald-300 font-bold flex items-center gap-1">
                      <Hourglass className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-700 dark:text-emerald-400" /> Remaining Shelf-Life
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-800 dark:text-emerald-400 mt-1">
                      {prediction.remaining_shelf_life_hours} <span className="text-xs sm:text-sm font-normal text-slate-600 dark:text-slate-400">hrs</span>
                    </div>
                    <span className="text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-400 mt-0.5 sm:mt-1 block font-semibold">
                      Approx. {(prediction.remaining_shelf_life_hours / 24.0).toFixed(1)} days usable
                    </span>
                  </div>

                  <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 shadow-2xs">
                    <span className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 font-bold">Spoilage Probability</span>
                    <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">
                      {prediction.spoilage_probability} <span className="text-xs sm:text-sm font-normal text-slate-500">%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 sm:h-2 mt-1.5 sm:mt-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-emerald-600 via-amber-500 to-rose-600 h-full rounded-full" 
                        style={{ width: `${Math.min(100, prediction.spoilage_probability)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Dominant Spoilage Factors */}
                <div className="mt-4">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Identified Spoilage Drivers:</span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {prediction.dominant_spoilage_factors.map((factor, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#f0f5f2] dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-[#d1ded5] dark:border-slate-600">
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="mt-4 pt-4 border-t border-[#e1eae4] dark:border-slate-700">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /> Culinary & Preservation Directive ({prediction.category})
                </span>
                <div className="mt-2 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 text-xs shadow-sm">
                  <strong className="block text-emerald-900 dark:text-emerald-300 font-bold mb-1">{prediction.storage_action}</strong>
                  <ul className="space-y-1 list-disc list-inside text-xs font-medium text-slate-700 dark:text-slate-300">
                    {prediction.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
