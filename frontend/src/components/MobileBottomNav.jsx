import React, { useState } from 'react';
import { 
  Menu, X, Sparkles, Bell, RefreshCw, Sun, Moon, Check, 
  ChevronRight, Layers, ShoppingBag, Package, Cpu, Users, 
  TrendingUp, Trash2, Crown, CreditCard, ChefHat
} from 'lucide-react';
import { ROLES } from './Header';

export default function MobileBottomNav({ 
  modules = [], 
  activeModule, 
  onSelectModule,
  currentRole = 'admin',
  onSelectRole,
  onRefresh,
  activeAlertCount = 0,
  onOpenAlerts,
  isDarkMode,
  onToggleTheme
}) {
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);

  if (!modules || modules.length === 0) return null;

  // Determine Primary vs Secondary (Overflow) modules for current role
  let primaryModules = [];
  let overflowModules = [];

  if (modules.length <= 4) {
    primaryModules = modules;
    overflowModules = [];
  } else {
    // For 5+ modules (e.g. Admin which has 7), select top 4 primary
    const defaultPrimaryIds = ['executive', 'orders', 'spoilage', 'demand'];
    primaryModules = modules.filter(m => defaultPrimaryIds.includes(m.id));
    overflowModules = modules.filter(m => !defaultPrimaryIds.includes(m.id));
    
    // Fallback if role doesn't match default IDs
    if (primaryModules.length < 3) {
      primaryModules = modules.slice(0, 4);
      overflowModules = modules.slice(4);
    }
  }

  // Check if current active module is in overflow
  const activeOverflowModule = overflowModules.find(m => m.id === activeModule);

  const handleSelect = (moduleId) => {
    onSelectModule(moduleId);
    setMoreSheetOpen(false);
  };

  const handleRoleChange = (roleId) => {
    if (onSelectRole) {
      onSelectRole(roleId);
      const targetRole = ROLES.find(r => r.id === roleId);
      if (targetRole && targetRole.defaultModule) {
        onSelectModule(targetRole.defaultModule);
      }
    }
    setMoreSheetOpen(false);
  };

  return (
    <>
      {/* 1. Sleek Floating Native Bottom Dock (Optimized for Samsung Galaxy S10 5G) */}
      <nav 
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-t border-[#cbdad0] dark:border-slate-800/90 pb-[max(env(safe-area-inset-bottom),14px)] pt-1.5 px-2 shadow-[0_-8px_30px_rgba(0,0,0,0.15)] transition-all"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <div className="flex items-center justify-around gap-1 max-w-md mx-auto">
          
          {/* Primary Modules */}
          {primaryModules.map((m) => {
            const isActive = activeModule === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => handleSelect(m.id)}
                className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all relative select-none cursor-pointer ${
                  isActive
                    ? 'text-emerald-700 dark:text-emerald-400 font-black'
                    : 'text-slate-600 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-slate-200 active:scale-95'
                }`}
              >
                <div
                  className={`p-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/30 scale-105'
                      : 'bg-[#f0f5f2] dark:bg-slate-850 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {React.cloneElement(m.icon, { className: 'h-4 w-4' })}
                </div>
                
                <span className="text-[10px] mt-1 tracking-tight truncate max-w-[66px] leading-tight text-center">
                  {m.shortLabel || m.label}
                </span>

                {m.badge && (
                  <span
                    className={`absolute top-0.5 right-1.5 px-1.5 py-0.2 rounded-full text-[8px] font-black text-white ${
                      m.badgeColor || 'bg-rose-600'
                    } shadow-xs`}
                  >
                    {m.badge}
                  </span>
                )}

                {isActive && (
                  <span className="h-1 w-3 rounded-full bg-emerald-700 dark:bg-emerald-400 mt-0.5"></span>
                )}
              </button>
            );
          })}

          {/* 5th Slot: Overflow Module OR "More (☰)" Button */}
          {overflowModules.length > 0 && (
            <button
              type="button"
              onClick={() => setMoreSheetOpen(!moreSheetOpen)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all relative select-none cursor-pointer ${
                activeOverflowModule || moreSheetOpen
                  ? 'text-emerald-700 dark:text-emerald-400 font-black'
                  : 'text-slate-600 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-slate-200 active:scale-95'
              }`}
            >
              <div
                className={`p-2 rounded-xl transition-all relative ${
                  activeOverflowModule || moreSheetOpen
                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/30 scale-105'
                    : 'bg-[#f0f5f2] dark:bg-slate-850 text-slate-700 dark:text-slate-300'
                }`}
              >
                {activeOverflowModule ? (
                  React.cloneElement(activeOverflowModule.icon, { className: 'h-4 w-4' })
                ) : (
                  <Menu className="h-4 w-4" />
                )}

                {/* Dot badge on More button if an overflow module has active badge or alerts */}
                {(overflowModules.some(m => m.badge) || activeAlertCount > 0) && !activeOverflowModule && (
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-rose-500 border-2 border-white dark:border-slate-900" />
                )}
              </div>

              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[66px] leading-tight text-center">
                {activeOverflowModule ? (activeOverflowModule.shortLabel || activeOverflowModule.label) : 'More'}
              </span>

              {(activeOverflowModule || moreSheetOpen) && (
                <span className="h-1 w-3 rounded-full bg-emerald-700 dark:bg-emerald-400 mt-0.5"></span>
              )}
            </button>
          )}

        </div>
      </nav>

      {/* 2. Slide-Up "More Modules & Workspace Control" Sheet */}
      {moreSheetOpen && (
        <div className="sm:hidden fixed inset-0 z-50 flex flex-col justify-end animate-fade-in">
          
          {/* Backdrop with Blur */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMoreSheetOpen(false)}
          />

          {/* Sheet Body */}
          <div className="relative z-10 w-full bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl p-4 max-h-[85vh] overflow-y-auto no-scrollbar space-y-4 pb-[max(env(safe-area-inset-bottom),24px)] animate-slide-up">
            
            {/* Grab Handle & Close Bar */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                    Restaurant Modules & Tools
                  </h3>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    Switch module or workspace persona
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMoreSheetOpen(false)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* All System Modules Grid */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                All Available Modules ({modules.length})
              </span>
              <div className="grid grid-cols-1 gap-2">
                {modules.map((m) => {
                  const isCurrent = activeModule === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelect(m.id)}
                      className={`w-full p-3 rounded-2xl text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-600 dark:border-emerald-500 shadow-sm'
                          : 'bg-[#f7faf8] dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                          isCurrent
                            ? 'bg-emerald-700 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}>
                          {React.cloneElement(m.icon, { className: 'h-5 w-5' })}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-black truncate ${isCurrent ? 'text-emerald-950 dark:text-emerald-200' : 'text-slate-900 dark:text-white'}`}>
                              {m.label}
                            </span>
                            {m.badge && (
                              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black text-white ${m.badgeColor || 'bg-rose-500'}`}>
                                {m.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                            Tap to view {m.shortLabel || m.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {isCurrent ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-700 text-white text-[10px] font-bold flex items-center gap-1">
                            <Check className="h-3 w-3" /> Active
                          </span>
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Workspace Switcher & Utilities */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                Workspace Persona & Tools
              </span>

              {/* Persona Switcher Pills */}
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((role) => {
                  const isCurrentRole = role.id === currentRole;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleChange(role.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        isCurrentRole
                          ? 'border-emerald-600 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-200 font-black shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 font-bold'
                      }`}
                    >
                      <div className="flex justify-center mb-1">
                        {role.icon}
                      </div>
                      <div className="text-[11px] leading-tight truncate">{role.shortTitle}</div>
                    </button>
                  );
                })}
              </div>

              {/* Quick Actions Row: Alerts, Sync, Theme */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {/* Alerts */}
                <button
                  type="button"
                  onClick={() => {
                    setMoreSheetOpen(false);
                    if (onOpenAlerts) onOpenAlerts();
                  }}
                  className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-center flex flex-col items-center justify-center gap-1 cursor-pointer"
                >
                  <div className="relative">
                    <Bell className="h-4 w-4" />
                    {activeAlertCount > 0 && (
                      <span className="absolute -top-1 -right-2 h-3.5 min-w-[14px] px-0.5 rounded-full bg-rose-600 text-white text-[8px] font-black flex items-center justify-center">
                        {activeAlertCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold">Alerts</span>
                </button>

                {/* Refresh */}
                <button
                  type="button"
                  onClick={() => {
                    if (onRefresh) onRefresh();
                    setMoreSheetOpen(false);
                  }}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-center flex flex-col items-center justify-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                  <span className="text-[10px] font-bold">Sync Data</span>
                </button>

                {/* Theme Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    if (onToggleTheme) onToggleTheme();
                  }}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-center flex flex-col items-center justify-center gap-1 cursor-pointer"
                >
                  {isDarkMode ? (
                    <Sun className="h-4 w-4 text-amber-400" />
                  ) : (
                    <Moon className="h-4 w-4 text-emerald-800" />
                  )}
                  <span className="text-[10px] font-bold">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
}
