import React from 'react';
import { Layers, Activity, TrendingUp, Users, AlertTriangle, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, RotateCw } from 'lucide-react';
import ActionRecommendations from './ActionRecommendations';

export default function CentralExecutiveDashboard({ 
  stats, 
  recommendations, 
  onNavigateModule, 
  onOpenAlertsCenter, 
  onRefresh, 
  isDarkMode 
}) {
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
              <div className="text-base sm:text-lg font-black text-emerald-800 dark:text-emerald-400">480 Orders</div>
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Kitchen Efficiency</span>
              <div className="text-base sm:text-lg font-black text-emerald-800 dark:text-emerald-400">88.5%</div>
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Cold Storage Nodes</span>
              <div className="text-base sm:text-lg font-black text-emerald-800 dark:text-emerald-400">5 Zones Active</div>
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Daily Food Waste</span>
              <div className="text-base sm:text-lg font-black text-rose-700 dark:text-rose-400">28.5 kg</div>
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
