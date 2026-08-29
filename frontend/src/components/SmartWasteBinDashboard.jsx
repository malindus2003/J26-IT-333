import React, { useState, useEffect } from 'react';
import { Scale, Layers, AlertTriangle, ArrowRight, Building2, Cpu, Plus } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import axios from 'axios';
import WasteRegistrationModal from './WasteRegistrationModal';
import WasteBinDetailsModal from './WasteBinDetailsModal';
import RecyclingCompanyModal from './RecyclingCompanyModal';

export default function SmartWasteBinDashboard({ isDarkMode }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCompartment, setSelectedCompartment] = useState(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isCompanyRegistrationOpen, setIsCompanyRegistrationOpen] = useState(false);

  useEffect(() => {
    fetchWasteData();
  }, []);

  const fetchWasteData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/api/waste/metrics");
      setData(res.data);
    } catch (err) {
      console.error("Failed to load waste metrics, using fallback:", err);
      setData({
        researcher: "Pathirana P.R.T (IT23324060)",
        module: "Component 4: Three-Bin Waste Identification and Monitoring",
        description: "Dedicated Food, Plastic, and Paper bins with IoT fill-level and weight monitoring.",
        hardware_status: {
          mcu: "ESP32 Wi-Fi / MQTT Controller (Online)",
          bin_array: "3 Dedicated Bins: Food / Plastic / Paper",
          load_cells: "3x HX711 Load Cells Calibrated",
          ultrasonic_sensors: "3x HC-SR04 Fill Sensors Active"
        },
        full_bin_threshold_percent: 90,
        registered_recycling_company_count: 0,
        total_food_waste_today_kg: 28.5,
        total_cost_loss_today: "LKR 10,900.00",
        estimated_monthly_saving_potential: "LKR 84,500.00",
        compartments: [
          { id: "food", name: "Food Waste Bin", waste_type: "Food", fill_level_percent: 78.5, current_weight_kg: 18.2, capacity_kg: 25.0, ultrasonic_distance_cm: 8.5, status: "Almost Full", last_sensor_update: new Date().toISOString(), frequent_items: ["Leftover Cooked Rice (6.2 kg)", "Vegetable Peelings (4.8 kg)", "Chicken Bones (3.5 kg)", "Plate Scraps (3.7 kg)"], cost_loss_today: "LKR 7,450.00" },
          { id: "plastic", name: "Plastic Waste Bin", waste_type: "Plastic", fill_level_percent: 42.0, current_weight_kg: 4.1, capacity_kg: 12.0, status: "Normal", last_sensor_update: new Date().toISOString() },
          { id: "paper", name: "Paper Waste Bin", waste_type: "Paper", fill_level_percent: 35.0, current_weight_kg: 3.8, capacity_kg: 15.0, status: "Normal", last_sensor_update: new Date().toISOString() }
        ],
        waste_composition: [
          { category: "Leftover Rice & Grains", weight_kg: 7.4, percentage: 34.5, cost_rs: 2800, color: "#f59e0b" },
          { category: "Vegetable Cuttings & Trimmings", weight_kg: 5.2, percentage: 24.2, cost_rs: 1850, color: "#10b981" },
          { category: "Meat & Seafood Bones/Trimmings", weight_kg: 3.8, percentage: 17.7, cost_rs: 3200, color: "#ef4444" },
          { category: "Bakery & Bread Waste", weight_kg: 2.6, percentage: 12.1, cost_rs: 950, color: "#8b5cf6" },
          { category: "Spoiled / Overripe Produce", weight_kg: 2.5, percentage: 11.5, cost_rs: 1100, color: "#ec4899" }
        ],
        daily_trend: [
          { day: "Mon", total_food_waste_kg: 21.4, cost_loss_rs: 8200 },
          { day: "Tue", total_food_waste_kg: 19.8, cost_loss_rs: 7600 },
          { day: "Wed", total_food_waste_kg: 24.5, cost_loss_rs: 9400 },
          { day: "Thu", total_food_waste_kg: 18.2, total_cost_loss: 7100 },
          { day: "Fri (Today)", total_food_waste_kg: 28.5, cost_loss_rs: 10900 },
          { day: "Sat (Projected)", total_food_waste_kg: 34.0, cost_loss_rs: 13200 },
          { day: "Sun (Projected)", total_food_waste_kg: 31.5, cost_loss_rs: 12100 }
        ],
        waste_reduction_recommendations: [
          "Rice Portioning Notice: Cooked rice accounts for 34.5% of daily food waste. Reduce the default plate portion by 15% and offer free refills on request.",
          "Vegetable Trim Optimization: 5.2 kg vegetable cuttings detected today. Shift clean carrot/onion scraps to stock pot simmering.",
          "Closed Feedback to Component 1: Excessive Seafood Rice waste on Thursdays (-8% demand adjustment recommended for next cycle)."
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="glass-panel p-12 text-center text-slate-500 rounded-2xl">
        <div className="animate-spin h-8 w-8 border-2 border-rose-500 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-xs font-bold font-mono">Loading Smart Waste Bin Telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="glass-panel p-3.5 sm:p-6 rounded-xl sm:rounded-2xl space-y-3.5 sm:space-y-5 bg-white dark:bg-slate-900 border border-[#d1ded5] dark:border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 dark:border-slate-800 pb-3 sm:pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Three-Bin Waste Identification & Monitoring</h2>
              <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 font-bold">
                Food Analytics & Recycling Alerts
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Dedicated Food, Plastic, and Paper bins with IoT weight sensing, fill-level monitoring, and full-bin quotation alerts
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCompanyRegistrationOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 shadow-2xs transition hover:bg-emerald-100 focus:outline-none dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 cursor-pointer"
              >
                <Building2 className="h-3.5 w-3.5" /> Register Recycler
              </button>
              <button
                type="button"
                onClick={() => setIsRegistrationOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white shadow-md shadow-rose-600/20 transition hover:bg-rose-500 focus:outline-none cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Add Wastage
              </button>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Total Food Waste</span>
                <div className="text-base sm:text-xl font-black text-rose-600 dark:text-rose-400">{data.total_food_waste_today_kg} kg</div>
              </div>
              <div className="border-l border-slate-200 dark:border-slate-800 pl-3">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Cost Loss</span>
                <div className="text-base sm:text-xl font-black text-amber-600 dark:text-amber-400">{data.total_cost_loss_today}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Hardware Status */}
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-sm">
            <Cpu className="h-4 w-4 text-sky-600 dark:text-sky-400" /> {data.hardware_status.mcu}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-sm">
            <Scale className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> {data.hardware_status.load_cells}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-sm">
            <Layers className="h-4 w-4 text-purple-600 dark:text-purple-400" /> {data.hardware_status.bin_array}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-sm">
            <Layers className="h-4 w-4 text-amber-600 dark:text-amber-400" /> {data.hardware_status.ultrasonic_sensors}
          </span>
        </div>
      </div>

      {/* Three Smart Bins - Real-Time Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.compartments.map((comp) => (
          <button
            type="button"
            key={comp.id}
            onClick={() => setSelectedCompartment(comp)}
            className={`glass-panel p-5 rounded-2xl border flex flex-col justify-between text-left transition-all duration-200 hover:-translate-y-1 hover:border-rose-400/60 hover:shadow-lg hover:shadow-rose-500/10 focus:outline-none focus:ring-2 focus:ring-rose-500/70 ${
              comp.status === 'Full'
                ? 'border-rose-400 bg-rose-50/30 dark:border-rose-500/50 dark:bg-rose-950/20'
                : comp.status === 'Almost Full'
                  ? 'border-amber-400 bg-amber-50/30 dark:border-amber-500/50 dark:bg-amber-950/20'
                : 'border-slate-200 dark:border-slate-800'
            }`}
            aria-label={`View live telemetry for ${comp.name}`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">{comp.name}</span>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                  comp.status === 'Full'
                    ? 'bg-rose-600 text-white animate-pulse'
                    : comp.status === 'Almost Full'
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  {comp.status.toUpperCase()}
                </span>
              </div>

              {/* Visual Fill Gauge */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-1 font-bold">
                  <span>Fill Level:</span>
                  <span>{comp.fill_level_percent}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      comp.status === 'Full' ? 'bg-rose-500' : (comp.status === 'Almost Full' ? 'bg-amber-500' : 'bg-emerald-500')
                    }`}
                    style={{ width: `${comp.fill_level_percent}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Measured Weight:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {comp.current_weight_kg} kg{comp.id === 'food' ? ` / ${comp.capacity_kg} kg` : ''}
                  </span>
                </div>
                {comp.id === 'food' && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Est. Cost Loss:</span>
                    <span className="font-bold text-amber-700 dark:text-amber-400">{comp.cost_loss_today}</span>
                  </div>
                )}
              </div>
            </div>

            {comp.id === 'food' && (
              <>
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Frequent Food Items Discarded:</span>
                  <ul className="text-xs text-slate-700 dark:text-slate-300 list-disc list-inside mt-1 space-y-0.5 font-medium">
                    {comp.frequent_items.slice(0, 2).map((item, idx) => (
                      <li key={idx} className="truncate">{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-3 text-[11px] font-semibold text-rose-400 flex items-center gap-1">
                  View food-waste details <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </>
            )}
          </button>
        ))}
      </div>

      <WasteBinDetailsModal
        bin={selectedCompartment}
        onClose={() => setSelectedCompartment(null)}
      />

      <WasteRegistrationModal
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
      />

      <RecyclingCompanyModal
        isOpen={isCompanyRegistrationOpen}
        onClose={() => setIsCompanyRegistrationOpen(false)}
        onRegistered={() => setData((current) => ({
          ...current,
          registered_recycling_company_count: current.registered_recycling_company_count + 1,
        }))}
      />

      {/* Food Waste Category Breakdown & Daily Financial Loss Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Waste Composition Breakdown */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Food Waste Category Breakdown</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Identified through AI Computer Vision classifier</p>
            </div>
          </div>

          <div className="space-y-3">
            {data.waste_composition.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">{item.category}</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{item.weight_kg} kg ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                  <span>Direct Loss: <strong className="text-amber-700 dark:text-amber-400 font-bold">LKR {item.cost_rs.toLocaleString()}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Day Waste Trend Chart */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Daily Food Waste & Cost Loss Trend</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">7-day Food Waste Bin load-cell measurements</p>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.daily_trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#1e293b" : "#e2e8f0"} />
                  <XAxis dataKey="day" stroke={isDarkMode ? "#64748b" : "#475569"} fontSize={11} />
                  <YAxis stroke={isDarkMode ? "#64748b" : "#475569"} fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                      borderColor: isDarkMode ? '#334155' : '#cbd5e1',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: isDarkMode ? '#f8fafc' : '#0f172a',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="total_food_waste_kg" fill="#f43f5e" name="Food Waste (kg)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Waste Reduction Recommendations */}
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30 shadow-sm">
            <span className="text-xs font-black text-rose-800 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" /> AI Waste Reduction Interventions:
            </span>
            <ul className="space-y-1.5 text-xs text-rose-950 dark:text-slate-200 font-medium">
              {data.waste_reduction_recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <ArrowRight className="h-4 w-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
}
