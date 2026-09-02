import React, { useEffect, useState } from 'react';
import { Clock3, Scale, Trash2, X } from 'lucide-react';

const STATUS_STYLES = {
  Normal: {
    fill: 'bg-emerald-500',
    soft: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30',
  },
  'Almost Full': {
    fill: 'bg-orange-500',
    soft: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/30',
  },
  Full: {
    fill: 'bg-red-500',
    soft: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30',
  },
};

function formatSensorTime(timestamp) {
  if (!timestamp) return 'Not available';
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? timestamp : date.toLocaleString();
}

export default function WasteBinDetailsModal({ bin, onClose }) {
  const [animatedFill, setAnimatedFill] = useState(0);

  useEffect(() => {
    if (!bin) return undefined;

    setAnimatedFill(0);
    let fillAnimationFrame;
    const animationFrame = requestAnimationFrame(() => {
      fillAnimationFrame = requestAnimationFrame(() => setAnimatedFill(Math.min(100, Math.max(0, bin.fill_level_percent))));
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

  const statusStyle = STATUS_STYLES[bin.status] || STATUS_STYLES.Normal;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/75 px-3 py-5 backdrop-blur-sm sm:items-center sm:px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="waste-bin-details-title"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-black/40 dark:border-slate-700 dark:bg-slate-900 sm:p-6">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white" aria-label="Close bin details">
          <X className="h-5 w-5" />
        </button>

        <div className="pr-12">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Live bin telemetry</span>
          <h3 id="waste-bin-details-title" className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{bin.name}</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Sensor-measured capacity, weight, and fill status.</p>
        </div>

        <div className="mt-6 grid grid-cols-1 items-center gap-7 md:grid-cols-2">
          <div className="flex min-h-80 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/80 p-6 dark:border-slate-800 dark:bg-slate-950/50">
            <div className="relative pt-7">
              <div className="absolute left-1/2 top-0 h-4 w-20 -translate-x-1/2 rounded-t-xl bg-slate-600 dark:bg-slate-400" />
              <div className="absolute left-1/2 top-3 h-5 w-52 -translate-x-1/2 rounded-lg bg-slate-700 shadow-lg dark:bg-slate-300" />
              <div className="relative h-64 w-44 overflow-hidden rounded-b-[2.5rem] rounded-t-lg border-[7px] border-slate-700 bg-white shadow-xl dark:border-slate-300 dark:bg-slate-900">
                <div
                  className={`absolute inset-x-0 bottom-0 ${statusStyle.fill} transition-[height] duration-1000 ease-out`}
                  style={{ height: `${animatedFill}%` }}
                  aria-hidden="true"
                >
                  <div className="absolute inset-x-0 top-0 h-2 -translate-y-1 rounded-[50%] bg-white/30" />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <Trash2 className="h-8 w-8 text-slate-700 drop-shadow dark:text-white" />
                  <span className="mt-2 text-3xl font-black text-slate-900 drop-shadow-sm dark:text-white">{bin.fill_level_percent}%</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-700 dark:text-slate-100">filled</span>
                </div>
              </div>
              <div className="mx-auto mt-1 flex w-36 justify-between px-2">
                <span className="h-3 w-5 rounded-b bg-slate-700 dark:bg-slate-300" />
                <span className="h-3 w-5 rounded-b bg-slate-700 dark:bg-slate-300" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${statusStyle.soft}`}>{bin.status}</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Fill level</span>
                <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">{bin.fill_level_percent}%</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Current weight</span>
                <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">{bin.current_weight_kg} kg</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Maximum capacity</span>
                <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">{bin.capacity_kg} kg</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Bin status</span>
                <p className="mt-1 text-base font-black text-slate-900 dark:text-white">{bin.status}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-slate-200 px-3.5 py-3 dark:border-slate-800">
              <Clock3 className="mt-0.5 h-4 w-4 flex-shrink-0 text-sky-500" />
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Last sensor update</span>
                <p className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-200">{formatSensorTime(bin.last_sensor_update)}</p>
              </div>
            </div>
          </div>
        </div>

        {bin.id === 'food' && (
          <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Food-waste identification</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">AI-identified food categories currently recorded.</p>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-bold text-amber-700 dark:text-amber-400">
                <Scale className="h-4 w-4" /> {bin.cost_loss_today}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {bin.frequent_items?.map((item, index) => (
                <div key={`${bin.id}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200">{item}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
