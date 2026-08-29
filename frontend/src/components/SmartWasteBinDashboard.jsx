import React, { useState } from 'react';
import { Trash2, AlertTriangle, RefreshCw } from 'lucide-react';

export default function SmartWasteBinDashboard() {
  const [bins, setBins] = useState([
    { id: 'bin-1', name: 'Kitchen Main Bin', fill_level_pct: 82.5, current_weight_kg: 24.8, status: 'warning' }
  ]);
  return (
    <div className="space-y-6">
      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Trash2 className="h-6 w-6 text-emerald-600" /> Component 4: Smart Waste Bin Monitoring
        </h2>
      </div>
    </div>
  );
}
