import React, { useState } from 'react';
import { Users, ChefHat, Activity, Clock } from 'lucide-react';

export default function KitchenStaffDashboard() {
  return (
    <div className="space-y-6">
      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ChefHat className="h-6 w-6 text-emerald-600" /> Component 2: Kitchen Efficiency & Staff Optimization
        </h2>
      </div>
    </div>
  );
}
