import React, { useState } from 'react';
import { 
  AlertTriangle, 
  XCircle, 
  ShieldAlert, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  Sparkles, 
  Check, 
  Flame, 
  Trash2, 
  TrendingUp, 
  Users, 
  Cpu, 
  Plus, 
  Filter, 
  CheckCheck,
  Volume2,
  VolumeX,
  Clock,
  Package,
  Camera,
  ChefHat,
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Eye
} from 'lucide-react';
import axios from 'axios';

const getItemThumbnail = (name = "", category = "") => {
  const n = name.toLowerCase();
  if (n.includes("strawberr")) return "/images/specimens/strawberries_mould.jpg";
  if (n.includes("papaya") || n.includes("papol")) return "/images/specimens/peach_softening.jpg";
  if (n.includes("banana") || n.includes("kesel")) return "/images/specimens/banana_overripe.jpg";
  if (n.includes("mango")) return "/images/specimens/mango_ripe.jpg";
  if (n.includes("tomato") || n.includes("thakkali")) return "/images/specimens/tomato_overripe.jpg";
  if (n.includes("spinach") || n.includes("kankun") || n.includes("gotukola")) return "/images/specimens/spinach_wilted.jpg";
  if (n.includes("lettuce") || n.includes("salad")) return "/images/specimens/lettuce_crisp.jpg";
  if (n.includes("avocado")) return "/images/specimens/avocado_butter.jpg";
  if (n.includes("apple")) return "/images/specimens/apple_fresh.jpg";

  if (category === "Fruits") return "/images/specimens/apple_fresh.jpg";
  return "/images/specimens/lettuce_crisp.jpg";
};

export default function AlertNotificationCenter({ 
  isOpen, 
  onClose, 
  recommendations = [], 
  onRefresh,
  onNavigateToSpoilage,
  onNavigateModule
}) {
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // New alert form tailored to Food Spoilage simulation
  const [newAlert, setNewAlert] = useState({
    title: "Near Spoilage (~75%) FIFO Alert: Red Lady Papaya",
    category: "Spoilage",
    severity: "high",
    type: "SMART_FIFO_DIVERT",
    item_name: "Red Lady Papaya (Rathu Papol)",
    zone: "Storage 4: Ambient Kitchen Rack (29°C)",
    spoilage_prob: 78.5,
    rsl_hours: 8.5,
    cv_stage: "Senescent Softening (Grade D)",
    chamber_telemetry: "T: 30.5°C | H: 81.0% | VOC: 1.45ppm | CO2: 1250ppm",
    message: "Ambient thermal respiration accelerated softening (~78.5% spoilage). 8.5 hours remaining shelf-life.",
    suggested_action: "AI Culinary Directives: Divert 18.5kg batch immediately to juice bar smoothies and fruit coulis."
  });

  if (!isOpen) return null;

  const handleAcknowledge = async (alertId) => {
    setActionLoading(alertId);
    try {
      await axios.post(`http://localhost:8000/api/recommendations/${alertId}/acknowledge`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to acknowledge alert:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolve = async (alertId, note = "Action executed by staff") => {
    setActionLoading(alertId);
    try {
      await axios.post(`http://localhost:8000/api/recommendations/${alertId}/resolve`, {
        action_note: note
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to resolve alert:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolveAll = async () => {
    try {
      await axios.post("http://localhost:8000/api/recommendations/resolve-all");
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to resolve all alerts:", err);
    }
  };

  const handleTriggerCustomAlert = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/api/recommendations/trigger", newAlert);
      setShowCreateModal(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to trigger alert:", err);
    }
  };

  const handleInspectInChamber = (itemName) => {
    onClose();
    if (onNavigateToSpoilage) {
      onNavigateToSpoilage(itemName, 'vision');
    } else if (onNavigateModule) {
      onNavigateModule('spoilage');
    }
  };

  const handleOpenAiRecipes = (itemName) => {
    onClose();
    if (onNavigateToSpoilage) {
      onNavigateToSpoilage(itemName, 'assessor');
    } else if (onNavigateModule) {
      onNavigateModule('spoilage');
    }
  };

  const filteredAlerts = recommendations.filter(alert => {
    const matchesSeverity = selectedSeverity === 'all' || 
      (selectedSeverity === 'resolved' ? alert.status === 'resolved' : (alert.severity === selectedSeverity && alert.status !== 'resolved'));
    const matchesCategory = selectedCategory === 'all' || alert.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSeverity && matchesCategory;
  });

  const getSeverityStyle = (severity, status) => {
    if (status === 'resolved') {
      return {
        card: 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75',
        badge: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
        title: 'text-slate-700 dark:text-slate-400 line-through',
        icon: <CheckCircle2 className="h-4 w-4 text-slate-500" />
      };
    }

    switch (severity) {
      case 'critical':
        return {
          card: 'bg-rose-50/80 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/40 shadow-sm',
          badge: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30 font-black',
          title: 'text-rose-950 dark:text-white',
          icon: <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 animate-pulse" />
        };
      case 'high':
        return {
          card: 'bg-amber-50/80 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/40 shadow-sm',
          badge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30 font-bold',
          title: 'text-amber-950 dark:text-white',
          icon: <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        };
      case 'medium':
      default:
        return {
          card: 'bg-emerald-50/80 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/40 shadow-sm',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30 font-bold',
          title: 'text-emerald-950 dark:text-white',
          icon: <AlertTriangle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        };
    }
  };

  const activeCount = recommendations.filter(r => r.status !== 'resolved').length;
  const criticalCount = recommendations.filter(r => r.severity === 'critical' && r.status !== 'resolved').length;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col justify-between shadow-2xl overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                  Intelligent Alert & Incident Center
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {activeCount} active incident(s) • Connected to Food Spoilage & Cold Storage
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                title="Trigger a test anomaly alert"
              >
                <Plus className="h-3.5 w-3.5" /> Test Spoilage Alert
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Quick Stats Pill Strip */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            <div 
              onClick={() => setSelectedSeverity('all')}
              className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                selectedSeverity === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              <span className="text-[10px] uppercase block font-bold">All Active</span>
              <span className="text-base font-black">{activeCount}</span>
            </div>

            <div 
              onClick={() => setSelectedSeverity('critical')}
              className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                selectedSeverity === 'critical'
                  ? 'bg-rose-600 text-white font-bold shadow-sm'
                  : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30'
              }`}
            >
              <span className="text-[10px] uppercase block font-bold">Critical</span>
              <span className="text-base font-black">{criticalCount}</span>
            </div>

            <div 
              onClick={() => setSelectedSeverity('high')}
              className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                selectedSeverity === 'high'
                  ? 'bg-amber-600 text-white font-bold shadow-sm'
                  : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30'
              }`}
            >
              <span className="text-[10px] uppercase block font-bold">High / FIFO</span>
              <span className="text-base font-black">
                {recommendations.filter(r => r.severity === 'high' && r.status !== 'resolved').length}
              </span>
            </div>

            <div 
              onClick={() => setSelectedSeverity('resolved')}
              className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                selectedSeverity === 'resolved'
                  ? 'bg-emerald-700 text-white font-bold shadow-sm'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30'
              }`}
            >
              <span className="text-[10px] uppercase block font-bold">Resolved</span>
              <span className="text-base font-black">
                {recommendations.filter(r => r.status === 'resolved').length}
              </span>
            </div>
          </div>

          {/* Module Filter Pills */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto">
            {['all', 'spoilage', 'kitchen', 'demand', 'waste'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {cat === 'all' ? 'All Alerts' : cat === 'spoilage' ? 'Food Spoilage & Cold Chain' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts List Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto opacity-70" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No matching alerts</p>
              <p className="text-xs text-slate-500">All environmental parameters and cold storage chambers are operating within safety tolerances.</p>
            </div>
          ) : (
            filteredAlerts.map(alert => {
              const style = getSeverityStyle(alert.severity, alert.status);
              const isSpoilageAlert = alert.category?.toLowerCase() === 'spoilage' || alert.spoilage_prob !== undefined || alert.type?.includes('SPOIL') || alert.type?.includes('FIFO') || alert.type?.includes('QUARANTINE') || alert.type?.includes('TRANSPIRATION');
              const spoilageProb = alert.spoilage_prob ?? (alert.severity === 'critical' ? 97.5 : alert.severity === 'high' ? 78.5 : 48.0);
              const rslHours = alert.rsl_hours ?? (alert.severity === 'critical' ? 0.0 : alert.severity === 'high' ? 8.5 : 38.0);
              const isNearSpoilage = spoilageProb >= 70.0 && spoilageProb < 90.0;
              const isCriticalSpoilage = spoilageProb >= 90.0 || alert.severity === 'critical';

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl border ${style.card} transition-all space-y-3 shadow-xs`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase flex items-center gap-1 ${style.badge}`}>
                        {style.icon} {alert.category || 'Operations'} • {alert.severity}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {alert.timestamp || alert.created_at || 'Just now'}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-bold">
                      {alert.zone?.split('(')[0]?.trim()}
                    </span>
                  </div>

                  {/* Specimen Identity with Thumbnail */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex-shrink-0 shadow-2xs">
                      <img
                        src={getItemThumbnail(alert.item_name || "")}
                        alt={alert.item_name || "Specimen"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/images/specimens/apple_fresh.jpg";
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Specimen Target</span>
                      <span className="text-xs font-black text-slate-900 dark:text-white truncate block">
                        {alert.item_name || "Perishable Produce"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className={`text-sm font-extrabold mt-1 ${style.title}`}>{alert.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium leading-relaxed">
                      {alert.message}
                    </p>
                  </div>

                  {/* Multi-Modal Spoilage & Chamber IoT Telemetry Strip */}
                  {isSpoilageAlert && (
                    <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between font-extrabold text-[11px]">
                        <span className={isCriticalSpoilage ? 'text-rose-600 dark:text-rose-400' : isNearSpoilage ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>
                          {spoilageProb}% Spoilage {isNearSpoilage ? '• Near Spoilage (~75%) FIFO' : isCriticalSpoilage ? '• Critical Quarantine Hazard' : ''}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                          RSL: {rslHours}h
                        </span>
                      </div>

                      {/* Spoilage Probability Bar */}
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            isCriticalSpoilage 
                              ? 'bg-rose-600 animate-pulse' 
                              : isNearSpoilage 
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(5, spoilageProb))}%` }}
                        />
                      </div>

                      {alert.chamber_telemetry && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono pt-1 border-t border-slate-100 dark:border-slate-800">
                          {alert.chamber_telemetry}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Required Action Directive */}
                  <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs">
                    <span className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 tracking-wider block mb-0.5">
                      Recommended Action:
                    </span>
                    <p className="text-slate-900 dark:text-white font-bold flex items-start gap-1.5">
                      <ArrowRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{alert.suggested_action}</span>
                    </p>
                  </div>

                  {/* Food Spoilage Action Links & Resolve Buttons */}
                  {alert.status !== 'resolved' ? (
                    <div className="space-y-2 pt-1">
                      {/* Direct Spoilage Section Links */}
                      {isSpoilageAlert && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleInspectInChamber(alert.item_name)}
                            className="flex-1 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-300 dark:border-slate-700 transition-colors shadow-2xs"
                            title="Inspect produce in Food Spoilage Chamber & CV Inspector"
                          >
                            <Camera className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Inspect in Chamber</span>
                          </button>

                          {isNearSpoilage && (
                            <button
                              onClick={() => handleOpenAiRecipes(alert.item_name)}
                              className="py-1.5 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 border border-amber-300 dark:border-amber-700 transition-colors shadow-2xs"
                              title="Open Zero-Waste AI Culinary Directives"
                            >
                              <ChefHat className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
                              <span>AI Recipes</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Standard Execution Buttons */}
                      <div className="flex items-center justify-end gap-2">
                        {alert.status !== 'acknowledged' && (
                          <button
                            onClick={() => handleAcknowledge(alert.id)}
                            disabled={actionLoading === alert.id}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
                          >
                            👁️ Acknowledge
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleResolve(alert.id, `Action executed: ${alert.suggested_action}`)}
                          disabled={actionLoading === alert.id}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                        >
                          <Check className="h-3.5 w-3.5" /> Execute & Resolve
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-right text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Resolved at {alert.resolved_at || 'Earlier'}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between gap-3">
          <button
            onClick={handleResolveAll}
            disabled={activeCount === 0}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4 text-emerald-600" /> Resolve All Active ({activeCount})
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-700 dark:hover:bg-slate-600 text-xs font-bold transition-colors"
          >
            Close Panel
          </button>
        </div>

      </div>

      {/* Manual Anomaly Trigger Modal with Food Spoilage Presets */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 font-['Plus_Jakarta_Sans',sans-serif]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="h-5 w-5 text-rose-500" /> Trigger Spoilage Anomaly Alert
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleTriggerCustomAlert} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Alert Title</label>
                <input
                  type="text"
                  required
                  value={newAlert.title}
                  onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Target Produce</label>
                  <select
                    value={newAlert.item_name}
                    onChange={(e) => setNewAlert({ ...newAlert, item_name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="Red Lady Papaya (Rathu Papol)">Red Lady Papaya</option>
                    <option value="Embul Banana (Ambul Kesel)">Embul Banana</option>
                    <option value="Karthakolomban Mango (Ripe)">Karthakolomban Mango</option>
                    <option value="Rotten Strawberries (Botrytis Colony)">Rotten Strawberries</option>
                    <option value="Kankun (Water Spinach)">Water Spinach (Kankun)</option>
                    <option value="Local Tomatoes (Thakkali)">Local Tomatoes</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Storage Chamber</label>
                  <select
                    value={newAlert.zone}
                    onChange={(e) => setNewAlert({ ...newAlert, zone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="Storage 1: Tropical Chiller (11°C)">Storage 1 (11°C)</option>
                    <option value="Storage 2: Crisper Vault (5°C)">Storage 2 (5°C)</option>
                    <option value="Storage 3: Root Crop Vault (3.5°C)">Storage 3 (3.5°C)</option>
                    <option value="Storage 4: Ambient Kitchen Rack (29°C)">Storage 4 (29°C)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Pillar Module</label>
                  <select
                    value={newAlert.category}
                    onChange={(e) => setNewAlert({ ...newAlert, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="Spoilage">Spoilage & Cold Chain</option>
                    <option value="Kitchen">Kitchen Line & Queue</option>
                    <option value="Demand">Demand & Pre-Shift</option>
                    <option value="Waste">Smart Waste Bin</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Severity Level</label>
                  <select
                    value={newAlert.severity}
                    onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="critical">Critical (Immediate Quarantine)</option>
                    <option value="high">High Priority (~75% Spoilage FIFO)</option>
                    <option value="medium">Medium Warning</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Incident Description</label>
                <textarea
                  rows={2}
                  required
                  value={newAlert.message}
                  onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Required Culinary / Quarantine Action</label>
                <input
                  type="text"
                  required
                  value={newAlert.suggested_action}
                  onChange={(e) => setNewAlert({ ...newAlert, suggested_action: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md shadow-emerald-700/20"
                >
                  Broadcast Anomaly Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
