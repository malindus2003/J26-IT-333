import React, { useState } from 'react';
import { TrendingUp, Sparkles, Calendar, CloudRain, ShieldCheck } from 'lucide-react';

export default function DemandForecastingDashboard() {
  const [activeTab, setActiveTab] = useState('prep');
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-emerald-600" /> Component 1: Multi-Source AI Food Demand Prediction
        </h2>
        <p className="text-sm text-slate-500 mt-1">Multi-Source meal forecasting, XAI explainability, and What-If simulation engine.</p>
      </div>
    </div>
  );
}

export function XAIFactorCards({ shapData }) {
  return (
    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 mt-4">
      <h4 className="font-bold text-emerald-900 dark:text-emerald-300">Weather & Temperature Boost</h4>
    </div>
  );
}

export function WhatIfSimulator() {
  return (
    <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 mt-4">
      <h3 className="font-bold text-slate-900 dark:text-white">What-If Sensitivity Simulation</h3>
    </div>
  );
}
