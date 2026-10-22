import React, { useState, useEffect } from 'react';
import {
  Scale,
  Layers,
  AlertTriangle,
  ArrowRight,
  Building2,
  Cpu,
  Plus,
  Trash2,
  Wifi,
  CheckCircle2,
  Clock3,
  Calendar,
  TrendingUp,
  BarChart3,
  Sparkles,
  Recycle,
  LayoutDashboard,
  Info,
  Sliders,
  DollarSign,
  Package
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import axios from 'axios';
import WasteRegistrationModal from './WasteRegistrationModal';
import WasteBinDetailsModal from './WasteBinDetailsModal';
import RecyclingCompanyModal from './RecyclingCompanyModal';
import FoodWasteRecognition from './FoodWasteRecognition';

function formatSensorTime(timestamp) {
  if (!timestamp) return 'No data';
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? timestamp : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function getBinTelemetryState(comp) {
  if (!comp) {
    return {
      badge: 'Not connected',
      statusText: 'NOT CONNECTED',
      fillText: 'No data',
      weightText: 'No data',
      dotClass: 'bg-slate-400',
      badgeClass: 'text-slate-500 dark:text-slate-400',
      isStale: false,
      noEcho: false,
    };
  }

  // Food bin (Real ESP32 ultrasonic hardware target)
  if (comp.id === 'food') {
    const hasUpdate = Boolean(comp.last_sensor_update);
    const updateTime = hasUpdate ? new Date(comp.last_sensor_update).getTime() : 0;
    const isStale = hasUpdate && (Date.now() - updateTime > 15000);
    const isNoEcho = comp.sensor_status === 'no_echo' || (hasUpdate && comp.fill_level_percent == null && comp.status === 'Sensor Unavailable');

    if (!hasUpdate) {
      return {
        badge: comp.connection_status || 'Awaiting ESP32 hardware connection...',
        statusText: 'AWAITING ESP32',
        fillText: 'No data',
        weightText: 'No data',
        dotClass: 'bg-slate-400',
        badgeClass: 'text-slate-500 dark:text-slate-400',
        isStale: false,
        noEcho: false,
      };
    }

    if (isStale) {
      return {
        badge: 'Telemetry Stale (>15s)',
        statusText: 'STALE (>15S)',
        fillText: comp.fill_level_percent != null ? `${comp.fill_level_percent}% (Stale)` : 'No data',
        weightText: comp.current_weight_kg != null ? `${comp.current_weight_kg} kg` : 'No data',
        dotClass: 'bg-amber-500',
        badgeClass: 'text-amber-700 dark:text-amber-400 font-bold',
        isStale: true,
        noEcho: false,
      };
    }

    if (isNoEcho) {
      return {
        badge: 'ESP32 Online (Sensor: No Echo)',
        statusText: 'NO ECHO',
        fillText: 'No data (No echo)',
        weightText: comp.current_weight_kg != null ? `${comp.current_weight_kg} kg` : 'No data',
        dotClass: 'bg-amber-500 animate-pulse',
        badgeClass: 'text-amber-700 dark:text-amber-400 font-bold',
        isStale: false,
        noEcho: true,
      };
    }

    return {
      badge: 'Live Hardware Connected (ESP32)',
      statusText: (comp.status || 'NORMAL').toUpperCase(),
      fillText: comp.fill_level_percent != null ? `${comp.fill_level_percent}%` : 'No data',
      weightText: comp.current_weight_kg != null ? `${comp.current_weight_kg} kg` : 'No data',
      dotClass: 'bg-emerald-500 animate-pulse',
      badgeClass: 'text-emerald-700 dark:text-emerald-400 font-bold',
      isStale: false,
      noEcho: false,
    };
  }

  // General waste
  if (comp.id === 'general' || comp.status === 'Not connected') {
    return {
      badge: 'Not connected',
      statusText: 'NOT CONNECTED',
      fillText: 'No data',
      weightText: 'No data',
      dotClass: 'bg-slate-400',
      badgeClass: 'text-slate-500 dark:text-slate-400',
      isStale: false,
      noEcho: false,
    };
  }

  // Plastic & Paper (Demo compartments)
  return {
    badge: comp.connection_status || 'Demo data — hardware connection not verified',
    statusText: (comp.status || 'NORMAL').toUpperCase(),
    fillText: comp.fill_level_percent != null ? `${comp.fill_level_percent}%` : 'No data',
    weightText: comp.current_weight_kg != null ? `${comp.current_weight_kg} kg` : 'No data',
    dotClass: 'bg-slate-400',
    badgeClass: 'text-slate-500 dark:text-slate-400',
    isStale: false,
    noEcho: false,
  };
}

export default function SmartWasteBinDashboard({ isDarkMode }) {
  // Navigation internal tabs: 'overview', 'recognition', 'analytics', 'recycling'
  const [activeTab, setActiveTab] = useState('overview');
  // Analytics date filter: 7, 14, 30 days
  const [daysFilter, setDaysFilter] = useState(7);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [selectedCompartment, setSelectedCompartment] = useState(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isCompanyRegistrationOpen, setIsCompanyRegistrationOpen] = useState(false);
  const [recyclingCompanies, setRecyclingCompanies] = useState([]);

  useEffect(() => {
    fetchWasteData(daysFilter, false);
    fetchRecyclingCompanies();

    const intervalId = setInterval(() => {
      fetchWasteData(daysFilter, true);
    }, 2000);

    return () => clearInterval(intervalId);
  }, [daysFilter]);

  const fetchWasteData = async (days = 7, isPolling = false) => {
    try {
      if (!isPolling) setLoading(true);
      const res = await axios.get(`http://localhost:8000/api/waste/metrics?days=${days}`);
      setData(res.data);
      setApiError(null);
    } catch (err) {
      console.error('Failed to load waste metrics from API:', err);
      if (!isPolling) {
        setApiError('Unable to reach backend waste service. Real-time telemetry is currently unavailable.');
        setData(null);
      }
    } finally {
      if (!isPolling) setLoading(false);
    }
  };

  const fetchRecyclingCompanies = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/waste/recycling-companies');
      setRecyclingCompanies(res.data.companies || []);
    } catch (err) {
      console.warn('Could not fetch recycling companies:', err);
    }
  };

  if (loading && !data) {
    return (
      <div className="glass-panel p-12 text-center text-slate-500 rounded-2xl">
        <div className="animate-spin h-8 w-8 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-xs font-bold font-mono">Loading Smart Waste Management Telemetry...</p>
      </div>
    );
  }

  if (apiError && !data) {
    return (
      <div className="glass-panel p-10 text-center rounded-2xl space-y-4">
        <div className="h-12 w-12 rounded-full bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center mx-auto text-rose-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Backend Connection Error</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            {apiError}
          </p>
        </div>
        <p className="text-[11px] text-slate-400 font-mono">
          Academic Integrity Rule: Demo values are not silently substituted when an API fails.
        </p>
        <button
          type="button"
          onClick={() => fetchWasteData(daysFilter)}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition shadow-sm"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Top Banner & Module Header */}
      <div className="glass-panel p-6 rounded-2xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Smart Waste Management</h2>
              <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 font-bold">
                Component 4 Prototype
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Multi-bin IoT telemetry, YOLOv8 optical food waste recognition, and circular recycling logistics
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCompanyRegistrationOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
            >
              <Building2 className="h-4 w-4" /> Register Recycling Partner
            </button>
            <button
              type="button"
              onClick={() => setIsRegistrationOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500"
            >
              <Plus className="h-4 w-4" /> Add Manual Wastage
            </button>
          </div>
        </div>

        {/* Internal Module Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('recognition')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'recognition'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Food Recognition (YOLO)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Analytics & Waste Trends</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('recycling')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'recycling'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Recycle className="h-4 w-4" />
            <span>Recycling Logistics</span>
          </button>
        </div>

        {/* Honest Hardware Telemetry Integrity Banner */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-sm">
            <Cpu className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            MCU: {data.hardware_status?.mcu || 'ESP32 Controller (Demo Telemetry)'}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-sm">
            <Layers className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            Bin Topology: {data.hardware_status?.bin_array || '3 Configured / 1 Unconfigured'}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 font-medium flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" />
            Telemetry Mode: {data.is_demo_data ? 'Demo Simulation Feed' : 'Live Hardware Stream'}
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: OVERVIEW (Four Bins & Key Telemetry Cards) */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">

          {/* Daily Aggregate KPI Cards (Distinguishing Current vs Cumulative) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase block">
                Food Bin Current Weight
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {data.compartments.find(c => c.id === 'food')?.current_weight_kg != null
                  ? `${data.compartments.find(c => c.id === 'food')?.current_weight_kg} kg`
                  : 'No data'}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 block">
                {data.compartments.find(c => c.id === 'food')?.current_weight_kg != null
                  ? 'Inside bin container now'
                  : 'Load cell not yet integrated'}
              </span>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase block">
                Cumulative Food Waste Today <span className="text-amber-600 dark:text-amber-400 font-normal text-[10px]">(Demo)</span>
              </span>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                {data.total_food_waste_today_kg != null ? `${data.total_food_waste_today_kg} kg` : 'No data'}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 block">
                Total recorded dumps today
              </span>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase block">
                Est. Direct Cost Loss <span className="text-amber-600 dark:text-amber-400 font-normal text-[10px]">(Demo)</span>
              </span>
              <div className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">
                {data.total_cost_loss_today || 'No data'}
              </div>
              <span className="text-[10px] text-amber-800 dark:text-amber-400 font-medium mt-0.5 block">
                *Estimated valuation (Demo)
              </span>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase block">
                Registered Recycling Partners
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {recyclingCompanies.length || data.registered_recycling_company_count}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 block">
                Plastic & Paper collectors
              </span>
            </div>
          </div>

          {/* Four Bins Grid Display */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Smart Compartment Status (Four Dedicated Bins):
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Click any bin card to inspect load cell and ultrasonic telemetry
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.compartments.map((comp) => {
                const tState = getBinTelemetryState(comp);
                const hasFill = comp.fill_level_percent != null && !tState.noEcho;

                return (
                  <button
                    type="button"
                    key={comp.id}
                    onClick={() => setSelectedCompartment(comp)}
                    className={`glass-panel p-5 rounded-2xl border flex flex-col justify-between text-left transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                      tState.isStale
                        ? 'border-amber-400/80 bg-amber-50/10 dark:border-amber-500/30 dark:bg-amber-950/10'
                        : comp.status === 'Full'
                          ? 'border-rose-400 bg-rose-50/20 dark:border-rose-500/40 dark:bg-rose-950/10'
                          : comp.status === 'Almost Full'
                            ? 'border-amber-400 bg-amber-50/20 dark:border-amber-500/40 dark:bg-amber-950/10'
                            : comp.status === 'Not connected'
                              ? 'border-dashed border-slate-300 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/30 opacity-80'
                              : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {comp.name}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          tState.isStale
                            ? 'bg-amber-500 text-white'
                            : tState.noEcho
                              ? 'bg-amber-500 text-white'
                              : comp.status === 'Full'
                                ? 'bg-rose-600 text-white animate-pulse'
                                : comp.status === 'Almost Full'
                                  ? 'bg-amber-500 text-white'
                                  : comp.status === 'Not connected'
                                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                    : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400'
                        }`}>
                          {tState.statusText}
                        </span>
                      </div>

                      {/* Connection Status Badge */}
                      <div className="mt-2 flex items-center gap-1.5 text-[11px]">
                        <span className={`h-2 w-2 rounded-full ${tState.dotClass}`} />
                        <span className={tState.badgeClass}>
                          {tState.badge}
                        </span>
                      </div>

                      {/* Visual Fill Gauge */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-1 font-bold">
                          <span>Fill Level:</span>
                          <span className={tState.isStale || tState.noEcho ? 'text-amber-600 dark:text-amber-400' : ''}>
                            {tState.fillText}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                          {hasFill ? (
                            <div
                              className={`h-2.5 rounded-full transition-all duration-500 ${
                                tState.isStale
                                  ? 'bg-amber-500'
                                  : comp.status === 'Full'
                                    ? 'bg-rose-500'
                                    : comp.status === 'Almost Full'
                                      ? 'bg-amber-500'
                                      : 'bg-emerald-500'
                              }`}
                              style={{ width: `${comp.fill_level_percent}%` }}
                            />
                          ) : (
                            <div className="h-2.5 bg-slate-300 dark:bg-slate-700/50 w-full" />
                          )}
                        </div>
                      </div>

                      {/* Weight Readings */}
                      <div className="mt-4 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Current Weight:</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {tState.weightText}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Cumulative Today:</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {comp.cumulative_waste_today_kg != null ? `${comp.cumulative_waste_today_kg} kg` : 'No data'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Timestamp & Action */}
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Updated: {formatSensorTime(comp.last_sensor_update)}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                        Details <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Shortcuts to other tabs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 dark:bg-emerald-950/10 dark:border-emerald-500/20 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase">
                  AI Optical Waste Scanner
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Run YOLOv8 inference on food waste photos using our 7-class prototype model.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('recognition')}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
              >
                Launch Scanner <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase">
                  Analytics & Waste Trends
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Inspect 7, 14, and 30-day recorded waste trends and financial loss breakdowns.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('analytics')}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1"
              >
                View Analytics <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: FOOD RECOGNITION (Embedded YOLOv8 Subsystem) */}
      {/* ======================================================== */}
      {activeTab === 'recognition' && (
        <FoodWasteRecognition isDarkMode={isDarkMode} />
      )}

      {/* ======================================================== */}
      {/* TAB 3: ANALYTICS & TRENDS */}
      {/* ======================================================== */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">

          {/* Filter Controls Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Waste Loss Analytics & Trend Horizons
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Calendar-anchored load cell measurements and estimated financial loss in Sri Lankan Rupees (LKR)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Horizon:
              </span>
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setDaysFilter(days)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    daysFilter === days
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>

          {/* Trends Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Waste Weight Chart */}
            <div className="lg:col-span-7 glass-panel p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Food Waste Weight (kg) — {daysFilter}-Day Horizon
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Recorded load-cell measurements (Demo Data)
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                  Unit: kg
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.daily_trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#1e293b' : '#e2e8f0'} />
                    <XAxis dataKey="day" stroke={isDarkMode ? '#64748b' : '#475569'} fontSize={10} />
                    <YAxis
                      stroke={isDarkMode ? '#64748b' : '#475569'}
                      fontSize={11}
                      label={{ value: 'Waste (kg)', angle: -90, position: 'insideLeft', style: { fontSize: '11px', fill: '#64748b' } }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                        borderColor: isDarkMode ? '#334155' : '#cbd5e1',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: isDarkMode ? '#f8fafc' : '#0f172a',
                      }}
                    />
                    <Bar dataKey="total_food_waste_kg" fill="#10b981" name="Food Waste (kg)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Estimated Cost Loss Chart */}
            <div className="lg:col-span-5 glass-panel p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Estimated Cost Loss (LKR)
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    *Estimated unit valuation (LKR/kg)
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
                  Unit: LKR
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.daily_trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#1e293b' : '#e2e8f0'} />
                    <XAxis dataKey="day" stroke={isDarkMode ? '#64748b' : '#475569'} fontSize={10} />
                    <YAxis
                      stroke={isDarkMode ? '#64748b' : '#475569'}
                      fontSize={11}
                      label={{ value: 'Cost (LKR)', angle: -90, position: 'insideLeft', style: { fontSize: '11px', fill: '#64748b' } }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                        borderColor: isDarkMode ? '#334155' : '#cbd5e1',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: isDarkMode ? '#f8fafc' : '#0f172a',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cost_loss_rs"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#f59e0b' }}
                      name="Cost Loss (LKR)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Waste Composition & Distinction Notice */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            <div className="lg:col-span-7 glass-panel p-6 rounded-2xl space-y-4">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Recorded Kitchen Food Waste Breakdown
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Manual kitchen station registration logs vs. AI optical categories
                </p>
              </div>

              <div className="space-y-3">
                {data.waste_composition.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">{item.category}</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {item.weight_kg} kg ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                      <span>Source: {item.source || 'Manual Kitchen Audit Log'}</span>
                      <span>
                        Direct Loss: <strong className="text-amber-700 dark:text-amber-400 font-bold">LKR {item.cost_rs.toLocaleString()}</strong> (Est.)
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Categorization Separation Notice */}
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-200 block">Methodological Distinction:</span>
                <p>
                  The categories above reflect manual station waste registration logs. The 7-class YOLO AI optical detector specifically recognizes plated rice, kottu, noodles, chicken, whole mango, mango flesh, and mango peel.
                </p>
              </div>
            </div>

            {/* Operational Scenarios / Recommendations */}
            <div className="lg:col-span-5 glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-4">
              <div>
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Simulated Waste Reduction Scenarios
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Demonstration operational recommendations (Prototype Simulation)
                  </p>
                </div>

                <div className="space-y-3">
                  {data.waste_reduction_recommendations.map((rec, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200/60 dark:border-emerald-500/20 text-xs space-y-1">
                      <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                        <span>Scenario {i + 1}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-[11px]">
                        {rec}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/30 text-[11px] text-amber-800 dark:text-amber-300">
                <span className="font-bold block">Academic Integrity Notice:</span>
                These recommendations represent prototype simulations and are not claimed as verified live AI closed-loop feedback until full restaurant deployment is validated.
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: RECYCLING LOGISTICS */}
      {/* ======================================================== */}
      {activeTab === 'recycling' && (
        <div className="space-y-6">

          {/* Header */}
          <div className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Circular Waste Recycling Logistics
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Monitoring dry recyclable bins (Plastic & Paper) and registered collection partners
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCompanyRegistrationOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Building2 className="h-4 w-4" /> Register New Partner
            </button>
          </div>

          {/* Plastic and Paper Bins Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.compartments.filter(c => c.id === 'plastic' || c.id === 'paper').map((bin) => (
              <div
                key={bin.id}
                className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{bin.name}</h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Capacity: {bin.capacity_kg} kg | Material: {bin.waste_type}
                    </span>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                    bin.status === 'Full'
                      ? 'bg-rose-600 text-white'
                      : bin.status === 'Almost Full'
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400'
                  }`}>
                    {bin.status.toUpperCase()}
                  </span>
                </div>

                {/* Fill bar */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Fill Level:</span>
                    <span>{bin.fill_level_percent}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        bin.status === 'Full' ? 'bg-rose-500' : (bin.status === 'Almost Full' ? 'bg-amber-500' : 'bg-emerald-500')
                      }`}
                      style={{ width: `${bin.fill_level_percent}%` }}
                    />
                  </div>
                </div>

                {/* Weight & Collection Threshold */}
                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 font-medium block text-[10px] uppercase">Current Weight</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">{bin.current_weight_kg} kg</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 font-medium block text-[10px] uppercase">Alert Threshold</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">{data.full_bin_threshold_percent}%</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                  <span>Connection: {bin.connection_status || (bin.status !== 'Not connected' ? 'Demo data — hardware connection not verified' : 'Not connected')}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedCompartment(bin)}
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Email Quotation Dispatch Notice */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <Info className="h-4 w-4 text-sky-500 flex-shrink-0" />
              <span>Quotation Request & Email Dispatch Status:</span>
            </div>
            <p className="pl-6 text-[11px] text-slate-500 dark:text-slate-400">
              Automated external quotation email dispatches are suspended during prototype testing. Alerts are logged internally and are not marked as sent without a verified delivery result.
            </p>
          </div>

          {/* Registered Recycling Companies List */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Registered Recycling Partners ({recyclingCompanies.length})
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Third-party collection services for plastic and paper recycling
                </p>
              </div>
            </div>

            {recyclingCompanies.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No recycling companies registered yet. Click &quot;Register New Partner&quot; above to add one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold">
                      <th className="py-2.5 px-3">Company Name</th>
                      <th className="py-2.5 px-3">Accepted Waste</th>
                      <th className="py-2.5 px-3">Email Address</th>
                      <th className="py-2.5 px-3">Contact</th>
                      <th className="py-2.5 px-3">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {recyclingCompanies.map((c, i) => (
                      <tr key={c.id || i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{c.name}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                            {c.accepted_waste_types}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">{c.email}</td>
                        <td className="py-3 px-3 text-slate-500">{c.contact_number || 'N/A'}</td>
                        <td className="py-3 px-3 text-[11px] text-slate-400 capitalize">{c.source || 'Registered'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Modal Dialogs */}
      <WasteBinDetailsModal
        bin={selectedCompartment ? (data?.compartments?.find(c => c.id === selectedCompartment.id) || selectedCompartment) : null}
        onClose={() => setSelectedCompartment(null)}
      />

      <WasteRegistrationModal
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
      />

      <RecyclingCompanyModal
        isOpen={isCompanyRegistrationOpen}
        onClose={() => setIsCompanyRegistrationOpen(false)}
        onRegistered={() => {
          fetchWasteData(daysFilter);
          fetchRecyclingCompanies();
        }}
      />

    </div>
  );
}
