import React from 'react';
import { 
  Layers, 
  Activity, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  RotateCw,
  Cpu,
  Package,
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  ChefHat,
  Eye,
  XCircle,
  Truck
} from 'lucide-react';
import ActionRecommendations from './ActionRecommendations';

export default function CentralExecutiveDashboard({ 
  stats, 
  recommendations, 
  onNavigateModule, 
  onOpenAlertsCenter, 
  onRefresh, 
  isDarkMode,
  onNavigateToSpoilage
}) {
  const safeCount = stats?.safe_batches ?? 8;
  const highPriorityCount = stats?.high_priority_batches ?? 3;
  const criticalCount = stats?.critical_batches ?? 1;
  const avgSpoilage = stats?.avg_spoilage_probability ?? 32.5;
  const zonesWarning = stats?.zones_needing_attention ?? 1;
  const totalZones = stats?.total_storage_zones ?? 4;

  return (
    <div className="space-y-6">
      
      {/* Executive Hero Banner */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl relative overflow-hidden space-y-3 sm:space-y-4 bg-white dark:bg-slate-900 border border-[#d1ded5] dark:border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1.5 shadow-sm">
                <RotateCw className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin text-emerald-700 dark:text-emerald-400" /> Closed Feedback Loop Active
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-2 sm:mt-3 leading-tight">
              Operational Intelligence & Waste Reduction Hub
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 mt-1.5 sm:mt-2 leading-relaxed font-medium">
              Unified operational decision-support ecosystem integrating Demand Forecasting, Kitchen Workflow Optimization, Multi-Modal Food Spoilage Detection, and Automated Smart Waste Categorization.
            </p>
          </div>

          {/* Quick Pillar Health Summary */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 bg-[#f8faf9] dark:bg-slate-800/80 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[#d1ded5] dark:border-slate-700 shadow-sm">
            <div>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Demand Target</span>
              <div className="text-base sm:text-lg font-black text-emerald-800 dark:text-emerald-400">
                {stats?.today_predicted_orders || 480} Orders
              </div>
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Kitchen Efficiency</span>
              <div className="text-base sm:text-lg font-black text-emerald-800 dark:text-emerald-400">
                {stats?.kitchen_efficiency_pct || 88.5}%
              </div>
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Cold Storage Nodes</span>
              <div className="text-base sm:text-lg font-black text-emerald-800 dark:text-emerald-400">
                {totalZones} Chambers Active
              </div>
              <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 block">
                {zonesWarning > 0 ? `${zonesWarning} Thermal Drift` : 'All Sensors Optimal'}
              </span>
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Daily Food Waste</span>
              <div className="text-base sm:text-lg font-black text-rose-700 dark:text-rose-400">
                {stats?.daily_food_waste_kg || 28.5} kg
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Intelligent Alert Directives (Executive Incident Section) */}
      <ActionRecommendations
        recommendations={recommendations}
        onOpenAlertsCenter={onOpenAlertsCenter}
        onRefresh={onRefresh}
      />

      {/* DEDICATED CROSS-COMPONENT SECTION: Cold Storage & Food Spoilage Closed Feedback Bridge */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e1eae4] dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  Perishable Cold Chain & Multi-Modal Spoilage Integration
                </h3>
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live IoT & CV Sync
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Continuous IoT microclimate telemetry & optical vision analysis feeding Smart FIFO inventory rotation and culinary diversion.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateModule('inventory')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#f4f8f5] dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-[#d1ded5] dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Package className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>Inventory Table</span>
            </button>
            <button
              onClick={() => onNavigateModule('spoilage')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Chamber Inspector</span>
            </button>
          </div>
        </div>

        {/* 4 Storage Chamber Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Storage 1 */}
          <div className="p-3.5 rounded-xl bg-[#f8faf9] dark:bg-slate-800/80 border border-[#d1ded5] dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                ESP32-NODE-01
              </span>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Optimal
              </span>
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Storage 1: Tropical Chiller</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Target Setpoint: 11.0°C • Fruits</div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-[#e1eae4] dark:border-slate-700 text-[10px]">
              <div>
                <span className="text-slate-400 block font-medium">Temperature</span>
                <span className="font-bold text-slate-900 dark:text-white">11.4°C</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Humidity</span>
                <span className="font-bold text-slate-900 dark:text-white">90.2%</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">VOC / Ethylene</span>
                <span className="font-bold text-slate-900 dark:text-white">0.32 ppm</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">CO₂</span>
                <span className="font-bold text-slate-900 dark:text-white">415 ppm</span>
              </div>
            </div>
          </div>

          {/* Storage 2 */}
          <div className="p-3.5 rounded-xl bg-[#f8faf9] dark:bg-slate-800/80 border border-[#d1ded5] dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300">
                ESP32-NODE-02
              </span>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Optimal
              </span>
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Storage 2: Crisper Vault</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Target Setpoint: 5.0°C • Leafy Veg</div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-[#e1eae4] dark:border-slate-700 text-[10px]">
              <div>
                <span className="text-slate-400 block font-medium">Temperature</span>
                <span className="font-bold text-slate-900 dark:text-white">5.2°C</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Humidity</span>
                <span className="font-bold text-slate-900 dark:text-white">94.0%</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">VOC / Ethylene</span>
                <span className="font-bold text-slate-900 dark:text-white">0.18 ppm</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">CO₂</span>
                <span className="font-bold text-slate-900 dark:text-white">580 ppm</span>
              </div>
            </div>
          </div>

          {/* Storage 3 */}
          <div className="p-3.5 rounded-xl bg-[#f8faf9] dark:bg-slate-800/80 border border-[#d1ded5] dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                VAULT-ROOT-03
              </span>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Optimal
              </span>
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Storage 3: Root Crop Vault</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Target Setpoint: 3.5°C • Carrots/Roots</div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-[#e1eae4] dark:border-slate-700 text-[10px]">
              <div>
                <span className="text-slate-400 block font-medium">Temperature</span>
                <span className="font-bold text-slate-900 dark:text-white">3.8°C</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Humidity</span>
                <span className="font-bold text-slate-900 dark:text-white">91.5%</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">VOC / Ethylene</span>
                <span className="font-bold text-slate-900 dark:text-white">0.12 ppm</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">CO₂</span>
                <span className="font-bold text-slate-900 dark:text-white">440 ppm</span>
              </div>
            </div>
          </div>

          {/* Storage 4 */}
          <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                RACK-AMB-04
              </span>
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Respiration Warning
              </span>
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Storage 4: Ambient Kitchen Rack</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Target Setpoint: 28.0°C • Fast-Prep</div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-amber-200 dark:border-amber-900 text-[10px]">
              <div>
                <span className="text-amber-900/60 dark:text-amber-400/70 block font-medium">Temperature</span>
                <span className="font-bold text-amber-950 dark:text-amber-200">30.5°C (High)</span>
              </div>
              <div>
                <span className="text-amber-900/60 dark:text-amber-400/70 block font-medium">Humidity</span>
                <span className="font-bold text-amber-950 dark:text-amber-200">81.0%</span>
              </div>
              <div>
                <span className="text-amber-900/60 dark:text-amber-400/70 block font-medium">VOC / Ethylene</span>
                <span className="font-bold text-amber-950 dark:text-amber-200">1.45 ppm</span>
              </div>
              <div>
                <span className="text-amber-900/60 dark:text-amber-400/70 block font-medium">CO₂</span>
                <span className="font-bold text-amber-950 dark:text-amber-200">1250 ppm</span>
              </div>
            </div>
          </div>

        </div>

        {/* Live Spoilage Risk Distribution & Quick Directives */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
          
          <div className="p-3.5 rounded-xl bg-[#f8faf9] dark:bg-slate-800/80 border border-[#d1ded5] dark:border-slate-700 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-black text-slate-900 dark:text-white">{safeCount} Batches</div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">Safe & Fresh (RSL &gt; 24h)</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Normal FIFO kitchen rotation active.</div>
            </div>
          </div>

          <div 
            onClick={() => onNavigateToSpoilage ? onNavigateToSpoilage('Red Lady Papaya', 'assessor') : onNavigateModule('spoilage')}
            className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 flex items-center gap-3 cursor-pointer hover:shadow-sm transition-all group"
          >
            <div className="h-10 w-10 rounded-xl bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 flex items-center justify-center flex-shrink-0 font-bold">
              <ChefHat className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-amber-900 dark:text-amber-300">{highPriorityCount} Batches</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">FIFO Alert</span>
              </div>
              <div className="text-[11px] text-amber-800 dark:text-amber-400 font-bold truncate">Near Spoilage (~75%) Priority</div>
              <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                <span>View AI Chef Directives</span>
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

          <div 
            onClick={() => onNavigateModule('inventory')}
            className="p-3.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800/60 flex items-center gap-3 cursor-pointer hover:shadow-sm transition-all group"
          >
            <div className="h-10 w-10 rounded-xl bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 flex items-center justify-center flex-shrink-0 font-bold">
              <XCircle className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-rose-900 dark:text-rose-300">{criticalCount} Batch</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200">Quarantined</span>
              </div>
              <div className="text-[11px] text-rose-800 dark:text-rose-400 font-bold truncate">Food Safety Quarantine</div>
              <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                <span>Review & Dispatch in Inventory</span>
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 4 Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Demand Forecasting */}
        <div
          onClick={() => onNavigateModule('demand')}
          className="glass-panel p-5 rounded-2xl border border-[#d1ded5] dark:border-slate-800 hover:border-emerald-600 dark:hover:border-emerald-500 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between group bg-white dark:bg-slate-900"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 uppercase">
                Forecasting
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
              Demand Prediction
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Multi-source time-series sales forecasting & kitchen prep sizing.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#e1eae4] dark:border-slate-800 text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
            <span>Open Demand Module</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Kitchen & Staff */}
        <div
          onClick={() => onNavigateModule('kitchen')}
          className="glass-panel p-5 rounded-2xl border border-[#d1ded5] dark:border-slate-800 hover:border-emerald-600 dark:hover:border-emerald-500 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between group bg-white dark:bg-slate-900"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 uppercase">
                Workflow
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
              Kitchen & Staff
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Peak-hour prediction, line workload balancing, and staff career pathways.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#e1eae4] dark:border-slate-800 text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
            <span>Open Kitchen Module</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Food Spoilage & Quality */}
        <div
          onClick={() => onNavigateModule('spoilage')}
          className="glass-panel p-5 rounded-2xl border border-emerald-300 dark:border-emerald-500/50 hover:border-emerald-600 dark:hover:border-emerald-400 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between group bg-white dark:bg-slate-900 ring-1 ring-emerald-400/30"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-700 text-white border border-emerald-800 uppercase">
                Cold Chain
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
              Food Spoilage & Quality
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              IoT Gas/Temp sensors & Optical ripeness/spoilage detection with Remaining Shelf-Life.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#e1eae4] dark:border-slate-800 text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
            <span>Open Spoilage Module</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Smart Waste Bin */}
        <div
          onClick={() => onNavigateModule('waste')}
          className="glass-panel p-5 rounded-2xl border border-[#d1ded5] dark:border-slate-800 hover:border-emerald-600 dark:hover:border-emerald-500 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between group bg-white dark:bg-slate-900"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 uppercase">
                Waste Tracking
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
              Smart Waste Bin
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Real-time load cell monitoring, CV waste sorting, and financial loss tracking.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#e1eae4] dark:border-slate-800 text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
            <span>Open Waste Bin Module</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* Closed Feedback Loop Architecture Workflow */}
      <div className="glass-panel p-6 rounded-2xl space-y-4 bg-white dark:bg-slate-900 border border-[#d1ded5] dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Cross-Component Closed Feedback Mechanism</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          How real-time sensor streams and predictions flow across the 4 modules to eliminate restaurant food loss:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-xl bg-[#f8faf9] dark:bg-slate-800/80 border border-[#d1ded5] dark:border-slate-700 space-y-1 shadow-sm">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase">1. Demand Module</span>
            <p className="text-slate-600 dark:text-slate-300 text-xs font-medium">
              Predicts daily portion targets & passes recipe requirements to Kitchen and Cold Storage inventory.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#f8faf9] dark:bg-slate-800/80 border border-[#d1ded5] dark:border-slate-700 space-y-1 shadow-sm">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase">2. Kitchen Optimization</span>
            <p className="text-slate-600 dark:text-slate-300 text-xs font-medium">
              Allocates chefs dynamically based on demand volume & preps items before peak rush periods.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#f8faf9] dark:bg-slate-800/80 border border-[#d1ded5] dark:border-slate-700 space-y-1 shadow-sm">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase">3. Spoilage Detection</span>
            <p className="text-slate-600 dark:text-slate-300 text-xs font-medium">
              Scans batch shelf-life & routes expiring produce to today's kitchen menu recipes (FIFO).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#f8faf9] dark:bg-slate-800/80 border border-[#d1ded5] dark:border-slate-700 space-y-1 shadow-sm">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase">4. Smart Waste Bin</span>
            <p className="text-slate-600 dark:text-slate-300 text-xs font-medium">
              Measures leftover plates & feeds historical waste metrics back into Demand Forecasting to refine future targets.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
