import React, { useState } from 'react';
import { Sparkles, AlertTriangle, ShieldAlert, CheckCircle2, ChevronRight, XCircle, ArrowRight, Check, ExternalLink, Clock, Package } from 'lucide-react';
import axios from 'axios';

export default function ActionRecommendations({ recommendations, onOpenAlertsCenter, onRefresh }) {
  const [actionLoading, setActionLoading] = useState(null);

  if (!recommendations || recommendations.length === 0) return null;

  const activeRecommendations = recommendations.filter(r => r.status !== 'resolved').slice(0, 3);
  if (activeRecommendations.length === 0) return null;

  const handleQuickResolve = async (alertId, suggestedAction) => {
    setActionLoading(alertId);
    try {
      await axios.post(`http://localhost:8000/api/recommendations/${alertId}/resolve`, {
        action_note: `Executed: ${suggestedAction}`
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to resolve alert:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'critical':
        return {
          border: 'border-rose-300 dark:border-rose-700/60',
          bg: 'bg-rose-50/70 dark:bg-rose-950/20',
          badge: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700 font-bold',
          itemBadge: 'bg-rose-100 dark:bg-rose-950/80 text-rose-950 dark:text-rose-200 border-rose-300 dark:border-rose-700',
          title: 'text-rose-950 dark:text-white',
          body: 'text-rose-900 dark:text-slate-300',
          actionText: 'text-rose-950 dark:text-rose-200',
          icon: <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 animate-pulse" />
        };
      case 'high':
        return {
          border: 'border-amber-300 dark:border-amber-700/60',
          bg: 'bg-amber-50/70 dark:bg-amber-950/20',
          badge: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700 font-bold',
          itemBadge: 'bg-amber-100 dark:bg-amber-950/80 text-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-700',
          title: 'text-amber-950 dark:text-white',
          body: 'text-amber-900 dark:text-slate-300',
          actionText: 'text-amber-950 dark:text-amber-200',
          icon: <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        };
      case 'medium':
      default:
        return {
          border: 'border-emerald-300 dark:border-emerald-700/60',
          bg: 'bg-emerald-50/70 dark:bg-emerald-950/20',
          badge: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700 font-bold',
          itemBadge: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700',
          title: 'text-emerald-950 dark:text-white',
          body: 'text-emerald-900 dark:text-slate-300',
          actionText: 'text-emerald-950 dark:text-emerald-200',
          icon: <AlertTriangle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        };
    }
  };

  return (
    <div className="glass-panel p-3.5 sm:p-6 rounded-xl sm:rounded-2xl space-y-3.5 sm:space-y-5 bg-white dark:bg-slate-900 border border-[#d1ded5] dark:border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 border-b border-[#e1eae4] dark:border-slate-800 pb-3 sm:pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">Active Intelligent Alert Directives</h2>
            <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold flex items-center gap-1">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Real-Time Decision Support
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium leading-relaxed">
            Automated recommendations for culinary ingredient routing, temperature stabilization, and batch isolation
          </p>
        </div>

        {onOpenAlertsCenter && (
          <button
            onClick={onOpenAlertsCenter}
            className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-300 dark:border-slate-700 shadow-sm"
          >
            <span>Open Alert Center</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        {activeRecommendations.map((rec) => {
          const style = getSeverityStyle(rec.severity);
          return (
            <div
              key={rec.id}
              className={`p-4 rounded-2xl border ${style.border} ${style.bg} flex flex-col justify-between transition-all hover:shadow-md shadow-sm`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase flex items-center gap-1 ${style.badge}`}>
                    {style.icon} {rec.type?.replace('_', ' ') || rec.category}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{rec.zone?.split(':')[0]}</span>
                </div>

                {/* PROMINENT ITEM NAME BADGE */}
                {rec.item_name && (
                  <div className="mt-2.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black border shadow-xs ${style.itemBadge}`}>
                      <Package className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>Item: {rec.item_name}</span>
                    </span>
                  </div>
                )}

                <h3 className={`text-sm font-bold mt-2 ${style.title}`}>{rec.title}</h3>
                <p className={`text-xs mt-1 font-medium leading-relaxed ${style.body}`}>{rec.message}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2.5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Required Action:</span>
                  <p className={`text-xs font-bold mt-0.5 flex items-start gap-1 ${style.actionText}`}>
                    <ArrowRight className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{rec.suggested_action}</span>
                  </p>
                </div>

                <button
                  onClick={() => handleQuickResolve(rec.id, rec.suggested_action)}
                  disabled={actionLoading === rec.id}
                  className="w-full py-1.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <Check className="h-3.5 w-3.5" /> Execute & Resolve
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
