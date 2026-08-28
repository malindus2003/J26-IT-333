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
  Package
} from 'lucide-react';
import axios from 'axios';

export default function AlertNotificationCenter({ 
  isOpen, 
  onClose, 
  recommendations = [], 
  onRefresh 
}) {
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // New alert form
  const [newAlert, setNewAlert] = useState({
    title: "Cold Storage Temperature Spike Alert",
    category: "Spoilage",
    severity: "critical",
    type: "THERMAL_ABUSE",
    item_name: "Walk-In Meat Chiller",
    zone: "Zone 4 (Meat)",
    message: "Thermostat temperature climbed to 11.8°C with high microbial growth risk.",
    suggested_action: "Calibrate compressor thermostat cooling by -3.0°C immediately."
  });

  if (!isOpen) return null;

  const handleAcknowledge = async (alertId) => {
    setActionLoading(alertId);
    try {
      await axios.post(`http://localhost:8000/api/recommendations/${alertId}/acknowledge`);
      onRefresh();
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
      onRefresh();
    } catch (err) {
      console.error("Failed to resolve alert:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolveAll = async () => {
    try {
      await axios.post("http://localhost:8000/api/recommendations/resolve-all");
      onRefresh();
    } catch (err) {
      console.error("Failed to resolve all alerts:", err);
    }
  };

  const handleTriggerCustomAlert = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/api/recommendations/trigger", newAlert);
      setShowCreateModal(false);
      onRefresh();
    } catch (err) {
      console.error("Failed to trigger alert:", err);
    }
  };

  const filteredAlerts = recommendations.filter(alert => {
    const matchesSeverity = selectedSeverity === 'all' || 
      (selectedSeverity === 'resolved' ? alert.status === 'resolved' : (alert.severity === selectedSeverity && alert.status !== 'resolved'));
    const matchesCategory = selectedCategory === 'all' || alert.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSeverity && matchesCategory;
  });

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'spoilage':
        return <Cpu className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />;
      case 'kitchen':
        return <Users className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />;
      case 'demand':
        return <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'waste':
        return <Trash2 className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />;
      default:
        return <Sparkles className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />;
    }
  };

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
          card: 'bg-orange-50/80 dark:bg-orange-500/10 border-orange-300 dark:border-orange-500/40 shadow-sm',
          badge: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30 font-bold',
          title: 'text-orange-950 dark:text-white',
          icon: <ShieldAlert className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        };
      case 'medium':
      default:
        return {
          card: 'bg-amber-50/80 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/40 shadow-sm',
          badge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30 font-bold',
          title: 'text-amber-950 dark:text-white',
          icon: <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        };
    }
  };

  const activeCount = recommendations.filter(r => r.status !== 'resolved').length;
  const criticalCount = recommendations.filter(r => r.severity === 'critical' && r.status !== 'resolved').length;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col justify-between shadow-2xl overflow-hidden">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                  Intelligent Alert & Incident Center
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {activeCount} active incident(s) • {criticalCount} critical hazard(s)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                title="Trigger a test anomaly alert"
              >
                <Plus className="h-3.5 w-3.5" /> Test Alert
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
                  ? 'bg-orange-600 text-white font-bold shadow-sm'
                  : 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30'
              }`}
            >
              <span className="text-[10px] uppercase block font-bold">High</span>
              <span className="text-base font-black">
                {recommendations.filter(r => r.severity === 'high' && r.status !== 'resolved').length}
              </span>
            </div>

            <div 
              onClick={() => setSelectedSeverity('resolved')}
              className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                selectedSeverity === 'resolved'
                  ? 'bg-emerald-600 text-white font-bold shadow-sm'
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
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {cat === 'all' ? 'All Modules' : cat}
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
              <p className="text-xs text-slate-500">All environmental parameters and kitchen stations are operating within safety tolerances.</p>
            </div>
          ) : (
            filteredAlerts.map(alert => {
              const style = getSeverityStyle(alert.severity, alert.status);
              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl border ${style.card} transition-all space-y-3`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase flex items-center gap-1 ${style.badge}`}>
                        {style.icon} {alert.category || 'Operations'} • {alert.severity}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {alert.timestamp || 'Just now'}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-bold">
                      {alert.zone}
                    </span>
                  </div>

                  {/* PROMINENT ITEM NAME BADGE */}
                  {alert.item_name && (
                    <div className="pt-0.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 shadow-xs">
                        <Package className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <span>Target Item: {alert.item_name}</span>
                      </span>
                    </div>
                  )}

                  <div>
                    <h4 className={`text-sm font-bold mt-1 ${style.title}`}>{alert.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium leading-relaxed">
                      {alert.message}
                    </p>
                  </div>

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

                  {/* Action Execution Buttons */}
                  {alert.status !== 'resolved' ? (
                    <div className="flex items-center justify-end gap-2 pt-1">
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
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" /> Execute & Resolve
                      </button>
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

      {/* Manual Anomaly Trigger Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="h-5 w-5 text-rose-500" /> Trigger Simulation Anomaly Alert
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
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-purple-500"
                />
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
                    <option value="Kitchen">Kitchen Line & Queue Status</option>
                    <option value="Demand">Demand & Pre-Shift Prep</option>
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
                    <option value="critical">Critical (Immediate)</option>
                    <option value="high">High Priority</option>
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
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Required Culinary/Hardware Action</label>
                <input
                  type="text"
                  required
                  value={newAlert.suggested_action}
                  onChange={(e) => setNewAlert({ ...newAlert, suggested_action: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-purple-500"
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
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md shadow-rose-600/20"
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
