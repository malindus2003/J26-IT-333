import React, { useEffect, useState } from 'react';
import { Clock3, Scale, Trash2, X, Wifi, Cpu, Layers } from 'lucide-react';

const STATUS_STYLES = {
  Normal: {
    fill: 'bg-emerald-500',
    soft: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30',
  },
  'Almost Full': {
    fill: 'bg-amber-500',
    soft: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
  },
  Full: {
    fill: 'bg-rose-500',
    soft: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30',
  },
  'Not connected': {
    fill: 'bg-slate-400',
    soft: 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  },
};

function formatSensorTime(timestamp) {
  if (!timestamp) return 'No data';
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? timestamp : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function getBinTelemetryState(bin) {
  if (!bin) {
    return {
      badge: 'Not connected',
      statusText: 'NOT CONNECTED',
      fillText: 'No data',
      weightText: 'No data',
      dotClass: 'bg-slate-400',
      badgeClass: 'border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400',
      isStale: false,
      noEcho: false,
    };
  }

  // Food bin (Real ESP32 hardware compartment)
  if (bin.id === 'food') {
    const hasTimestamp = Boolean(bin.last_sensor_update);
    const updateTime = hasTimestamp ? new Date(bin.last_sensor_update).getTime() : 0;
    const isStale = hasTimestamp && (Date.now() - updateTime > 15000);
    const isNoEcho = bin.sensor_status === 'no_echo' || (hasTimestamp && bin.fill_level_percent == null && bin.status === 'Sensor Unavailable');

    if (!hasTimestamp) {
      return {
        badge: bin.connection_status || 'Awaiting ESP32 hardware connection...',
        statusText: 'AWAITING ESP32',
        fillText: 'No data',
        weightText: 'No data',
        dotClass: 'bg-slate-400',
        badgeClass: 'border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400',
        isStale: false,
        noEcho: false,
      };
    }

    if (isStale) {
      return {
        badge: 'Telemetry Stale (>15s)',
        statusText: 'STALE (>15S)',
        fillText: bin.fill_level_percent != null ? `${bin.fill_level_percent}% (Stale)` : 'No data',
        weightText: bin.current_weight_kg != null ? `${bin.current_weight_kg} kg` : 'No data',
        dotClass: 'bg-amber-500',
        badgeClass: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-950/30 dark:text-amber-300',
        isStale: true,
        noEcho: false,
      };
    }

    if (isNoEcho) {
      return {
        badge: 'ESP32 Online (Sensor: No Echo)',
        statusText: 'NO ECHO',
        fillText: 'No data (No echo)',
        weightText: bin.current_weight_kg != null ? `${bin.current_weight_kg} kg` : 'No data',
        dotClass: 'bg-amber-500 animate-pulse',
        badgeClass: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-950/30 dark:text-amber-300',
        isStale: false,
        noEcho: true,
      };
    }

    return {
      badge: 'Live Hardware Connected (ESP32)',
      statusText: (bin.status || 'NORMAL').toUpperCase(),
      fillText: bin.fill_level_percent != null ? `${bin.fill_level_percent}%` : 'No data',
      weightText: bin.current_weight_kg != null ? `${bin.current_weight_kg} kg` : 'No data',
      dotClass: 'bg-emerald-500 animate-pulse',
      badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400',
      isStale: false,
      noEcho: false,
    };
  }

  // General waste
  if (bin.id === 'general' || bin.status === 'Not connected') {
    return {
      badge: 'Not connected',
      statusText: 'NOT CONNECTED',
      fillText: 'No data',
      weightText: 'No data',
      dotClass: 'bg-slate-400',
      badgeClass: 'border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400',
      isStale: false,
      noEcho: false,
    };
  }

  // Plastic & Paper (Demo)
  return {
    badge: bin.connection_status || 'Demo data — hardware connection not verified',
    statusText: (bin.status || 'NORMAL').toUpperCase(),
    fillText: bin.fill_level_percent != null ? `${bin.fill_level_percent}%` : 'No data',
    weightText: bin.current_weight_kg != null ? `${bin.current_weight_kg} kg` : 'No data',
    dotClass: 'bg-slate-400',
    badgeClass: 'border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400',
    isStale: false,
    noEcho: false,
  };
}

export default function WasteBinDetailsModal({ bin, onClose }) {
  const [animatedFill, setAnimatedFill] = useState(0);

  useEffect(() => {
    if (!bin) return undefined;

    setAnimatedFill(0);
    const targetFill = bin.fill_level_percent != null ? Math.min(100, Math.max(0, bin.fill_level_percent)) : 0;
    let fillAnimationFrame;
    const animationFrame = requestAnimationFrame(() => {
      fillAnimationFrame = requestAnimationFrame(() => setAnimatedFill(targetFill));
    });
    const originalOverflow = document.body.style.overflow;
    const handleEscape = (event) => event.key === 'Escape' && onClose();
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      cancelAnimationFrame(animationFrame);
      cancelAnimationFrame(fillAnimationFrame);
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [bin, onClose]);

  if (!bin) return null;

  const tState = getBinTelemetryState(bin);
  const statusStyle = STATUS_STYLES[bin.status] || STATUS_STYLES['Not connected'];
  const hasFill = bin.fill_level_percent != null && !tState.noEcho;
  const hasWeight = bin.current_weight_kg != null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/75 px-3 py-5 backdrop-blur-sm sm:items-center sm:px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="waste-bin-details-title"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-black/40 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label="Close bin details"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="pr-12">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Bin Hardware Telemetry & Compartment State
          </span>
          <h3 id="waste-bin-details-title" className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            {bin.name}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
            Load cell weight sensing, ultrasonic depth measurement, and physical connectivity status.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 items-center gap-7 md:grid-cols-2">
          {/* Cylinder Graphic */}
          <div className="flex min-h-80 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/80 p-6 dark:border-slate-800 dark:bg-slate-950/50">
            <div className="relative pt-7">
              <div className="absolute left-1/2 top-0 h-4 w-20 -translate-x-1/2 rounded-t-xl bg-slate-600 dark:bg-slate-400" />
              <div className="absolute left-1/2 top-3 h-5 w-52 -translate-x-1/2 rounded-lg bg-slate-700 shadow-lg dark:bg-slate-300" />
              <div className="relative h-64 w-44 overflow-hidden rounded-b-[2.5rem] rounded-t-lg border-[7px] border-slate-700 bg-white shadow-xl dark:border-slate-300 dark:bg-slate-900">
                {hasFill ? (
                  <div
                    className={`absolute inset-x-0 bottom-0 ${statusStyle.fill} transition-[height] duration-1000 ease-out`}
                    style={{ height: `${animatedFill}%` }}
                    aria-hidden="true"
                  >
                    <div className="absolute inset-x-0 top-0 h-2 -translate-y-1 rounded-[50%] bg-white/30" />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800/40 flex items-center justify-center p-3 text-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {tState.noEcho ? 'Sensor: No Echo' : 'Sensor Unmounted'}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <Trash2 className="h-8 w-8 text-slate-700 drop-shadow dark:text-white" />
                  <span className="mt-2 text-2xl font-black text-slate-900 drop-shadow-sm dark:text-white">
                    {tState.fillText}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-700 dark:text-slate-100">
                    {hasFill ? 'filled' : (tState.noEcho ? 'no echo' : 'sensor unmounted')}
                  </span>
                </div>
              </div>
              <div className="mx-auto mt-1 flex w-36 justify-between px-2">
                <span className="h-3 w-5 rounded-b bg-slate-700 dark:bg-slate-300" />
                <span className="h-3 w-5 rounded-b bg-slate-700 dark:bg-slate-300" />
              </div>
            </div>
          </div>

          {/* Telemetry Metrics Grid */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${
                tState.isStale
                  ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-950/30 dark:text-amber-300'
                  : tState.noEcho
                    ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-950/30 dark:text-amber-300'
                    : statusStyle.soft
              }`}>
                {tState.statusText}
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${tState.badgeClass}`}>
                <span className={`h-2 w-2 rounded-full ${tState.dotClass}`} />
                {tState.badge}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Fill level</span>
                <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                  {tState.fillText}
                </p>
                <span className="text-[10px] text-slate-400 font-medium">
                  {bin.ultrasonic_distance_cm != null ? `${bin.ultrasonic_distance_cm} cm height` : 'Ultrasonic height'}
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Current weight</span>
                <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                  {tState.weightText}
                </p>
                <span className="text-[10px] text-slate-400 font-medium">
                  {hasWeight ? 'Inside bin now' : 'Load cell not yet integrated'}
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Cumulative Today</span>
                <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                  {bin.cumulative_waste_today_kg != null ? `${bin.cumulative_waste_today_kg} kg` : 'No data'}
                </p>
                <span className="text-[10px] text-slate-400 font-medium">Total recorded today</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Rated Capacity</span>
                <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                  {bin.capacity_kg ? `${bin.capacity_kg} kg` : 'No data'}
                </p>
                <span className="text-[10px] text-slate-400 font-medium">Max compartment load</span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-slate-200 px-3.5 py-3 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
              <Clock3 className="mt-0.5 h-4 w-4 flex-shrink-0 text-sky-500" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Telemetry Stream</span>
                  {bin.ultrasonic_distance_cm != null && (
                    <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      HC-SR04: {bin.ultrasonic_distance_cm} cm
                    </span>
                  )}
                  {tState.noEcho && (
                    <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400">
                      HC-SR04: No Echo
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Updated: {formatSensorTime(bin.last_sensor_update)}
                </p>
                {bin.hardware_source && (
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                    Source: {bin.hardware_source}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {bin.id === 'food' && (
          <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Frequent Food Discards (Audit Log)</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Sample recorded food waste categories.</p>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-bold text-amber-700 dark:text-amber-400">
                <Scale className="h-4 w-4" /> {bin.cost_loss_today || 'LKR 7,450.00 (Est.)'}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {bin.frequent_items?.map((item, index) => (
                <div key={`${bin.id}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
