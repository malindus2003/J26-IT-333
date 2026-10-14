import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, Clock, Flame, Award, AlertTriangle, ArrowRight, ShieldCheck, CheckCircle2,
  TrendingUp, Utensils, X, Lock, LogIn, Key, Smartphone, Coffee, ChefHat, Send,
  CheckSquare, Pizza, Plus, Minus, Hash, Search, Cpu, Sparkles, Database, Layers,
  CheckCheck, Armchair, PackageCheck, RefreshCw, Filter, ArrowUpRight, ShoppingBag, Check
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ReferenceArea } from 'recharts';
import axios from 'axios';

export default function KitchenStaffDashboard({
  isDarkMode,
  currentRole = 'admin',
  refreshTrigger,
  onRefresh,
  onNavigateModule
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showSeasonalRush, setShowSeasonalRush] = useState(true);
  const [showLunchRush, setShowLunchRush] = useState(true);
  const [showBreakfastRush, setShowBreakfastRush] = useState(true);
  const [showDinnerRush, setShowDinnerRush] = useState(true);
  const [simulateLowEfficiency, setSimulateLowEfficiency] = useState(false);
  const [dismissedToast, setDismissedToast] = useState("");
  const [last4HourUpdate, setLast4HourUpdate] = useState("Shift Sync Active (Live Queue Computed)");

  const [directives, setDirectives] = useState([]);

  // --- Real-Time Orders & KDS Live Sync State (Linked with Orders & POS) ---
  const [liveOrders, setLiveOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [lastOrderSyncTime, setLastOrderSyncTime] = useState("");
  const [activeKitchenTab, setActiveKitchenTab] = useState('all'); // Default to Full Kitchen Ops (All Views)
  const [kdsSearchQuery, setKdsSearchQuery] = useState("");
  const [kdsStationFilter, setKdsStationFilter] = useState("all");
  const [clearedCompletedIds, setClearedCompletedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('kds_cleared_completed_orders');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      return new Set();
    }
  });

  const fetchLiveOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await axios.get("http://localhost:8000/api/orders");
      if (res?.data?.orders) {
        setLiveOrders(res.data.orders);
        setLastOrderSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
      try {
        const metricsRes = await axios.get("http://localhost:8000/api/kitchen/metrics");
        if (metricsRes?.data) {
          setData(metricsRes.data);
        }
      } catch (mErr) { }
    } catch (err) {
      console.warn("Could not fetch live orders from /api/orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleRefreshTickets = async () => {
    try {
      setOrdersLoading(true);
      // Dismiss completed orders on backend
      try {
        await axios.post("http://localhost:8000/api/orders/clear-completed");
      } catch (postErr) {
        console.warn("Could not post to /api/orders/clear-completed:", postErr);
      }

      // Collect all currently completed orders to clear them immediately from KDS view
      const completedIds = liveOrders.filter(o => o.status === 'completed').map(o => o.id);
      if (completedIds.length > 0) {
        setClearedCompletedIds(prev => {
          const updated = new Set([...prev, ...completedIds]);
          try {
            localStorage.setItem('kds_cleared_completed_orders', JSON.stringify(Array.from(updated)));
          } catch (e) { }
          return updated;
        });
      }

      // Fetch fresh orders
      const res = await axios.get("http://localhost:8000/api/orders");
      if (res?.data?.orders) {
        setLiveOrders(res.data.orders);
        setLastOrderSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
      setDismissedToast("✅ Tickets refreshed — Completed orders cleared from KDS.");
      setTimeout(() => setDismissedToast(""), 3500);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Error refreshing tickets:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleClearCompletedOrders = async () => {
    try {
      try {
        await axios.post("http://localhost:8000/api/orders/clear-completed");
      } catch (e) { }
      const completedIds = liveOrders.filter(o => o.status === 'completed').map(o => o.id);
      setClearedCompletedIds(prev => {
        const updated = new Set([...prev, ...completedIds]);
        try {
          localStorage.setItem('kds_cleared_completed_orders', JSON.stringify(Array.from(updated)));
        } catch (e) { }
        return updated;
      });
      setDismissedToast("✅ Completed orders cleared from KDS.");
      setTimeout(() => setDismissedToast(""), 3000);
      await fetchLiveOrders();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to clear completed orders:", err);
    }
  };

  // Auto-sync polling every 4 seconds + on refreshTrigger
  useEffect(() => {
    fetchLiveOrders();
    const interval = setInterval(fetchLiveOrders, 4000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`http://localhost:8000/api/orders/${orderId}/status`, { status: newStatus });
      // If order had previously been cleared and was reopened or changed, ensure it's un-cleared
      if (clearedCompletedIds.has(orderId)) {
        setClearedCompletedIds(prev => {
          const nextSet = new Set(prev);
          nextSet.delete(orderId);
          try {
            localStorage.setItem('kds_cleared_completed_orders', JSON.stringify(Array.from(nextSet)));
          } catch (e) { }
          return nextSet;
        });
      }
      const statusLabels = {
        'in_prep': 'Cooking Started',
        'ready': 'Marked Ready on Pass',
        'completed': 'Served to Customer'
      };
      setDismissedToast(`✅ Order #${orderId} status: ${statusLabels[newStatus] || newStatus}! Synced with Orders & POS.`);
      setTimeout(() => setDismissedToast(""), 4000);
      await fetchLiveOrders();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to update order status:", err);
    }
  };

  const handleFreeTable = async (tableNo) => {
    try {
      await axios.post(`http://localhost:8000/api/orders/tables/${encodeURIComponent(tableNo)}/free`);
      setDismissedToast(`✅ ${tableNo} is now cleared, sanitized & ready for new guests!`);
      setTimeout(() => setDismissedToast(""), 4000);
      await fetchLiveOrders();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to free table:", err);
    }
  };

  const getStationForDish = (dishName = "") => {
    const nl = dishName.toLowerCase();
    if (nl.includes("pizza") || nl.includes("margherita") || nl.includes("calzone")) return "Pizza";
    if (nl.includes("salmon") || nl.includes("steak") || nl.includes("beef") || nl.includes("sirloin") || nl.includes("grill") || nl.includes("charbroil") || nl.includes("platter")) return "Grill";
    if (nl.includes("salad") || nl.includes("smoothie") || nl.includes("avocado") || nl.includes("feta") || nl.includes("bowl")) return "Cold Salad";
    if (nl.includes("cuttlefish") || nl.includes("calamari") || nl.includes("fry") || nl.includes("samosa") || nl.includes("fries") || nl.includes("crispy")) return "Fryer";
    if (nl.includes("juice") || nl.includes("tea") || nl.includes("coke") || nl.includes("sprite") || nl.includes("beverage") || nl.includes("coffee") || nl.includes("cola")) return "Beverages";
    return "Hot Kitchen";
  };

  const getStaffForStation = (station) => {
    switch (station) {
      case 'Hot Kitchen': return 'K. Perera (Senior Line Chef)';
      case 'Grill': return 'T. Silva (Prep Cook)';
      case 'Cold Salad': return 'S. Fernando (Junior Chef)';
      case 'Pizza': return 'A. Jayasinghe (Station Lead)';
      case 'Fryer': return 'M. Wickramasinghe (Kitchen Trainee)';
      case 'Beverages':
      default: return 'Beverage Counter';
    }
  };

  const filteredOrders = liveOrders.filter(ord => {
    const matchesSearch = !kdsSearchQuery ||
      ord.order_number?.toString().includes(kdsSearchQuery) ||
      ord.table_no?.toLowerCase().includes(kdsSearchQuery.toLowerCase()) ||
      ord.items?.some(i => i.name.toLowerCase().includes(kdsSearchQuery.toLowerCase()));

    const matchesStation = kdsStationFilter === 'all' ||
      ord.station_name?.toLowerCase().includes(kdsStationFilter.toLowerCase());

    return matchesSearch && matchesStation;
  });

  const pendingOrders = filteredOrders.filter(o => o.status === 'pending');
  const inPrepOrders = filteredOrders.filter(o => o.status === 'in_prep');
  const readyOrders = filteredOrders.filter(o => o.status === 'ready');
  const completedOrders = filteredOrders.filter(o => o.status === 'completed' && !o.kds_dismissed && !clearedCompletedIds.has(o.id));

  // Dynamic Real-Time Kitchen KPIs directly responsive to live order volume increases & decreases
  const dynamicKPIs = useMemo(() => {
    const activeQueueCount = pendingOrders.length + inPrepOrders.length;

    // 1. Avg Ticket Fulfillment Time (dynamically stretches with queue backlog)
    let calculatedPrepMins;
    if (activeQueueCount === 0) {
      calculatedPrepMins = 5.4;
    } else {
      const activeTickets = [...pendingOrders, ...inPrepOrders];
      const avgTarget = activeTickets.reduce((acc, o) => acc + (o.target_prep_mins || 8), 0) / activeTickets.length;
      calculatedPrepMins = Math.round((avgTarget * 0.60 + activeQueueCount * 0.42) * 10) / 10;
    }

    // 2. Kitchen Overall Efficiency (scales dynamically with queue pressure)
    let effNumber;
    let paceLabel;
    let paceColor;

    if (activeQueueCount <= 3) {
      effNumber = Math.round((98.5 - activeQueueCount * 1.2) * 10) / 10;
      paceLabel = "Optimal Flow • Fast Turnaround";
      paceColor = "text-emerald-700 dark:text-emerald-400";
    } else if (activeQueueCount <= 6) {
      effNumber = Math.round((95.0 - (activeQueueCount - 3) * 2.2) * 10) / 10;
      paceLabel = "Line Pace Balanced • Normal Flow";
      paceColor = "text-emerald-700 dark:text-emerald-400";
    } else if (activeQueueCount <= 10) {
      effNumber = Math.round((88.4 - (activeQueueCount - 6) * 2.6) * 10) / 10;
      paceLabel = "Active Queue Surge • Busy Pass";
      paceColor = "text-amber-700 dark:text-amber-400";
    } else if (activeQueueCount <= 15) {
      effNumber = Math.round((78.0 - (activeQueueCount - 10) * 2.5) * 10) / 10;
      paceLabel = "Workload Surge • High Station Load";
      paceColor = "text-orange-700 dark:text-orange-400";
    } else {
      effNumber = Math.max(38.0, Math.round((65.5 - (activeQueueCount - 15) * 2.8) * 10) / 10);
      paceLabel = "Critical Backlog • Staff Reallocation Required";
      paceColor = "text-rose-700 dark:text-rose-400";
    }

    if (simulateLowEfficiency) {
      effNumber = 43.8;
      calculatedPrepMins = 14.6;
      paceLabel = "Critical Operational Floor (<50%)";
      paceColor = "text-rose-700 dark:text-rose-400";
    }

    return {
      efficiency: `${effNumber}%`,
      efficiencyNum: effNumber,
      isCritical: effNumber < 50,
      prepTime: `${calculatedPrepMins} mins`,
      paceLabel,
      paceColor
    };
  }, [pendingOrders, inPrepOrders, simulateLowEfficiency]);

  const shiftEfficiency = dynamicKPIs.efficiency;
  const shiftPrepTime = dynamicKPIs.prepTime;
  const rawEfficiency = shiftEfficiency;
  const efficiencyNum = dynamicKPIs.efficiencyNum;
  const isCriticalEfficiency = dynamicKPIs.isCritical;

  // Dynamic Real-Time 5-Station Workload Capacity derived from live incoming and completed orders
  const dynamicStations = useMemo(() => {
    const baseConfig = [
      { id: "station-1", name: "Hot Kitchen", baseShift: 4.0, targetPrep: 8.0, defaultCooks: 3, thresh: 76.5 },
      { id: "station-2", name: "Grill", baseShift: 0.0, targetPrep: 10.0, defaultCooks: 2, thresh: 17.9 },
      { id: "station-3", name: "Cold Salad", baseShift: 0.0, targetPrep: 4.0, defaultCooks: 1, thresh: 17.6 },
      { id: "station-4", name: "Pizza", baseShift: 0.0, targetPrep: 7.0, defaultCooks: 2, thresh: 16.3 },
      { id: "station-5", name: "Fryer", baseShift: 1.0, targetPrep: 5.0, defaultCooks: 1, thresh: 10.0 }
    ];

    const currentDataStations = data?.stations || [];

    return baseConfig.map(cfg => {
      const existingStation = currentDataStations.find(s => s.name === cfg.name || s.id === cfg.id) || {};

      // Match live orders targeting this station
      const activeStationOrders = liveOrders.filter(o =>
        (o.status === 'pending' || o.status === 'in_prep') &&
        (
          (o.station_name && o.station_name.toLowerCase().includes(cfg.name.toLowerCase())) ||
          (o.items && o.items.some(it => getStationForDish(it.name) === cfg.name))
        )
      );

      const completedStationOrders = liveOrders.filter(o =>
        (o.status === 'ready' || o.status === 'completed') &&
        !clearedCompletedIds.has(o.id) &&
        (
          (o.station_name && o.station_name.toLowerCase().includes(cfg.name.toLowerCase())) ||
          (o.items && o.items.some(it => getStationForDish(it.name) === cfg.name))
        )
      );

      const liveQueue = activeStationOrders.length;
      const liveCompleted = completedStationOrders.length;

      // Actual load: base shift baseline + active queue + completed orders
      const actualLoad = Number((cfg.baseShift + liveQueue + liveCompleted).toFixed(1));

      // Predicted load from ML regression formula (0.94 factor)
      const predictedLoad = actualLoad > 0 ? Number((actualLoad * 0.94 + 0.1).toFixed(1)) : 0.0;

      // Load vs capacity percentage
      const loadPercentage = actualLoad > 0 ? Math.min(100, Math.round((actualLoad / cfg.thresh) * 80)) : 0;
      const isBottleneck = actualLoad >= cfg.thresh || liveQueue >= 6;

      // Avg prep time dynamically stretches with queue pressure
      const dynamicPrep = Number((cfg.targetPrep + liveQueue * 0.45).toFixed(1));

      // Active cooks (preserve any reallocation updates from existingStation)
      const activeCooks = existingStation.active_cooks !== undefined ? existingStation.active_cooks : cfg.defaultCooks;
      const recCooks = isBottleneck ? Math.max(activeCooks + 1, cfg.defaultCooks + 1) : cfg.defaultCooks;

      const status = isBottleneck ? "High Delay Risk" : (loadPercentage > 65 ? "Moderate Load" : "Smooth Flow");
      const action = existingStation.action && existingStation.action.includes("reallocated")
        ? existingStation.action
        : (isBottleneck ? `Add +1 Cook to ${cfg.name} due to peak backlog` : `Maintain current ${cfg.name} line staffing`);

      return {
        ...existingStation,
        id: cfg.id,
        name: cfg.name,
        actual_load: actualLoad,
        predicted_load: predictedLoad,
        load_level: loadPercentage,
        predicted_load_level: Math.max(0, loadPercentage - 5),
        active_cooks: activeCooks,
        recommended_cooks: recCooks,
        avg_prep_time_mins: dynamicPrep,
        target_prep_time_mins: cfg.targetPrep,
        queue_length: liveQueue,
        bottleneck_status: status,
        action: action
      };
    });
  }, [liveOrders, clearedCompletedIds, data?.stations]);

  const stationsList = dynamicStations && dynamicStations.length > 0 ? dynamicStations : (data.stations || []);

  // Fetch metrics data dynamically from FastAPI backend
  useEffect(() => {
    fetchKitchenData();
  }, []);

  const fetchKitchenData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/api/kitchen/metrics");
      const backendData = res.data;

      setData(backendData);

      // Generate directives from backend AI suggestions
      if (backendData.ai_allocation_suggestions && backendData.ai_allocation_suggestions.length > 0) {
        const dynamicDirectives = backendData.ai_allocation_suggestions.map((sug, idx) => ({
          id: `dir-backend-${idx}`,
          stationId: idx === 0 ? "station-1" : (idx === 1 ? "station-2" : "station-4"),
          priority: idx === 0 ? "CRITICAL" : (idx === 1 ? "HIGH" : "MEDIUM"),
          title: sug,
          actionText: sug.replace(/⚠️|⚡|🔥/g, '').trim(),
          targetStaff: idx === 0 ? "S. Fernando" : (idx === 1 ? "T. Silva" : "A. Jayasinghe"),
          targetStation: idx === 0 ? "Hot Kitchen" : (idx === 1 ? "Grill" : "Pizza"),
          mitigatedLoad: 50,
          mitigatedQueue: 3,
          resolved: false
        }));
        setDirectives(dynamicDirectives);
      }

      console.log("✅ Backend API connected successfully:", backendData);
    } catch (err) {
      console.error("❌ Failed to load kitchen metrics, using fallback:", err);
      setData({
        researcher: "Pahesara H.H.D.S (IT23349292)",
        module: "Component 2: Kitchen Efficiency and Staff Optimization Analytics",
        overall_kitchen_efficiency: "98.2%",
        avg_ticket_fulfillment_time: "6.8 mins",
        actual_total_load: 121.0,
        predicted_total_load: 114.6,
        active_bottlenecks_count: 2,
        ml_model_evaluation: {
          model_name: "Random Forest Regressor (Multi-Output)",
          mae: 1.42,
          rmse: 2.18,
          r2_score: 0.941,
          mape: "5.9%",
          cross_val_accuracy: "94.1%",
          dataset_days_trained: 92,
          features_used: ["Hour", "DayOfWeek", "IsWeekend", "HistoricalQueue", "StationType"]
        },
        stations: [
          { id: "station-1", name: "Hot Kitchen", actual_load: 64.1, predicted_load: 60.7, active_cooks: 2, recommended_cooks: 3, avg_prep_time_mins: 8.5, target_prep_time_mins: 6.0, queue_length: 14, load_level: 92, predicted_load_level: 87, bottleneck_status: "High Delay Risk", action: "Reallocate S. Fernando from Cold Salad to Hot Kitchen based on skill matching" },
          { id: "station-2", name: "Grill", actual_load: 18.2, predicted_load: 17.2, active_cooks: 1, recommended_cooks: 2, avg_prep_time_mins: 14.0, target_prep_time_mins: 10.0, queue_length: 9, load_level: 84, predicted_load_level: 79, bottleneck_status: "Moderate Queue Load", action: "Reallocate T. Silva to Grill & prep protein cuts based on skill matching" },
          { id: "station-3", name: "Cold Salad", actual_load: 16.9, predicted_load: 16.0, active_cooks: 2, recommended_cooks: 1, avg_prep_time_mins: 3.0, target_prep_time_mins: 4.0, queue_length: 2, load_level: 30, predicted_load_level: 28, bottleneck_status: "Underutilized", action: "Reassign S. Fernando to Hot Kitchen during peak rush" },
          { id: "station-4", name: "Pizza", actual_load: 14.5, predicted_load: 13.8, active_cooks: 2, recommended_cooks: 2, avg_prep_time_mins: 5.2, target_prep_time_mins: 5.0, queue_length: 4, load_level: 55, predicted_load_level: 52, bottleneck_status: "Smooth Flow", action: "Maintain current deck oven line pacing" },
          { id: "station-5", name: "Fryer", actual_load: 7.3, predicted_load: 6.9, active_cooks: 1, recommended_cooks: 1, avg_prep_time_mins: 3.5, target_prep_time_mins: 4.0, queue_length: 2, load_level: 40, predicted_load_level: 38, bottleneck_status: "Smooth Flow", action: "Maintain current line staffing & prep batch oil temperature" }
        ],
        staff: [
          { id: "staff-1", name: "K. Perera (Senior Line Chef)", assigned_station: "Hot Kitchen", shift: "11:00 AM - 09:30 PM", efficiency_rating: 94, skill_level: "Expert (Level 4)", speed_score: "4.8 / 5.0", skill_gap: "Advanced Pastry & Bakery", training_recommendation: "Executive Kitchen Leadership & Precision Temperature Control", career_progression: "Ready for Sous-Chef Promotion (88% Milestones Complete)" },
          { id: "staff-2", name: "S. Fernando (Junior Chef)", assigned_station: "Cold Salad", shift: "03:00 PM - 11:00 PM", efficiency_rating: 78, skill_level: "Intermediate (Level 2)", speed_score: "3.9 / 5.0", skill_gap: "High-Heat Saute & Wok Handling", training_recommendation: "Enrolled in 'High-Volume Stir-Fry Optimization' (Module 3)", career_progression: "Target: Line Cook Specialist (62% Completed)" },
          { id: "staff-3", name: "T. Silva (Prep Cook)", assigned_station: "Grill", shift: "10:00 AM - 07:00 PM", efficiency_rating: 85, skill_level: "Intermediate (Level 3)", speed_score: "4.2 / 5.0", skill_gap: "HACCP Seafood Core Temperature Monitoring", training_recommendation: "Seafood Freshness Grading & Quick-Sear Techniques", career_progression: "Grill Master Track (74% Completed)" },
          { id: "staff-4", name: "A. Jayasinghe (Station Lead)", assigned_station: "Pizza", shift: "07:00 AM - 04:00 PM", efficiency_rating: 91, skill_level: "Expert (Level 4)", speed_score: "4.7 / 5.0", skill_gap: "High-Volume Batch Inventory Planning", training_recommendation: "Wood-Fired Pizza Deck Oven Management & Crust Proofing", career_progression: "Head of Pizza Track (82% Completed)" },
          { id: "staff-5", name: "M. Wickramasinghe (Kitchen Trainee)", assigned_station: "Fryer", shift: "11:00 AM - 08:00 PM", efficiency_rating: 64, skill_level: "Trainee (Level 1)", speed_score: "3.1 / 5.0", skill_gap: "Knife Handling, Prep Hygiene & Portion Control", training_recommendation: "Foundation Kitchen Safety, Deep Fryer Safety & Oil Filtering", career_progression: "Apprentice Onboarding (35% Completed)" },
          { id: "staff-6", name: "R. Dissanayake (Kitchen Trainee)", assigned_station: "Hot Kitchen", shift: "01:00 PM - 10:00 PM", efficiency_rating: 58, skill_level: "Trainee (Level 1)", speed_score: "2.8 / 5.0", skill_gap: "Station Setup & Order Ticket Flow", training_recommendation: "Basic Line Cooking Fundamentals & Ticket Dispatching", career_progression: "Junior Line Apprentice (25% Completed)" }
        ],
        hourly_peak_forecast: [
          { hour: "07:00", predicted_orders: 28, staff_required: 4, actual_staff: 4 },
          { hour: "08:00 (Breakfast Peak)", predicted_orders: 76, staff_required: 6, actual_staff: 6 },
          { hour: "09:00", predicted_orders: 58, staff_required: 5, actual_staff: 5 },
          { hour: "10:00", predicted_orders: 32, staff_required: 4, actual_staff: 4 },
          { hour: "11:00", predicted_orders: 24, staff_required: 4, actual_staff: 4 },
          { hour: "12:00", predicted_orders: 68, staff_required: 7, actual_staff: 6 },
          { hour: "13:00 (Lunch Peak)", predicted_orders: 95, staff_required: 8, actual_staff: 8 },
          { hour: "14:00", predicted_orders: 45, staff_required: 5, actual_staff: 5 },
          { hour: "15:00", predicted_orders: 18, staff_required: 3, actual_staff: 3 },
          { hour: "16:00", predicted_orders: 22, staff_required: 3, actual_staff: 3 },
          { hour: "17:00", predicted_orders: 38, staff_required: 5, actual_staff: 4 },
          { hour: "18:00", predicted_orders: 74, staff_required: 7, actual_staff: 7 },
          { hour: "19:00 (Dinner Peak)", predicted_orders: 115, staff_required: 9, actual_staff: 7 },
          { hour: "20:00 (Dinner Rush)", predicted_orders: 105, staff_required: 9, actual_staff: 8 },
          { hour: "21:00", predicted_orders: 52, staff_required: 5, actual_staff: 6 }
        ],
        ai_allocation_suggestions: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteDirective = (directive) => {
    setDirectives(prev => prev.map(d => d.id === directive.id ? { ...d, resolved: true } : d));

    if (data && data.stations) {
      const updatedStations = data.stations.map(st => {
        if (st.id === directive.stationId) {
          const targetCooks = st.recommended_cooks || 3;
          return {
            ...st,
            active_cooks: targetCooks,
            load_level: directive.mitigatedLoad,
            queue_length: directive.mitigatedQueue,
            avg_prep_time_mins: "4.2",
            bottleneck_status: "Smooth Flow",
            action: `Optimal staffing restored — ${directive.targetStaff} reallocated based on skill matching`
          };
        }
        return st;
      });

      const updatedStaff = data.staff.map(s => {
        if (s.name.includes(directive.targetStaff)) {
          return {
            ...s,
            assigned_station: `${directive.targetStation} (Reallocated via AI)`,
            isReallocated: true,
            reallocatedTo: directive.targetStation
          };
        }
        return s;
      });

      setData({ ...data, stations: updatedStations, staff: updatedStaff });
    }

    setDismissedToast(`⚡ Dynamic Reallocation Triggered: ${directive.targetStaff} reassigned to ${directive.targetStation}! Staff Skill Matrix updated in real time.`);
    setTimeout(() => setDismissedToast(""), 4500);

    setTimeout(() => {
      setDirectives(prev => prev.filter(d => d.id !== directive.id));
    }, 1200);
  };

  const handleSimulateSurge = () => {
    const newId = `dir-surge-${Date.now()}`;
    const newDirective = {
      id: newId,
      stationId: "station-1",
      priority: "REAL-TIME SURGE",
      title: `🚨 REAL-TIME QUEUE SURGE (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}): Ticket queue at Hot Kitchen surged to 18 tickets!`,
      actionText: "Reallocate S. Fernando from Cold Salad to Hot Kitchen immediately to clear queue overload",
      targetStaff: "S. Fernando",
      targetStation: "Hot Kitchen",
      mitigatedLoad: 50,
      mitigatedQueue: 3,
      resolved: false
    };

    setDirectives(prev => [newDirective, ...prev]);

    if (data && data.stations) {
      const updatedStations = data.stations.map(st => {
        if (st.id === "station-1" || st.name === "Hot Kitchen") {
          return {
            ...st,
            load_level: 98,
            actual_load: Number(((st.actual_load || 64.1) + 12).toFixed(1)),
            queue_length: 18,
            bottleneck_status: "Critical Queue Surge",
            action: "Reallocate S. Fernando from Cold Salad immediately based on skill matching"
          };
        }
        return st;
      });
      setData({ ...data, stations: updatedStations });
    }

    setDismissedToast("🚨 New real-time queue alert popped up! High order volume detected at Hot Kitchen.");
    setTimeout(() => setDismissedToast(""), 4000);
  };

  const [showOrderSimulatorModal, setShowOrderSimulatorModal] = useState(false);
  const [nextOrderNumCounter, setNextOrderNumCounter] = useState(1044);
  const [selectedTableNo, setSelectedTableNo] = useState("Table 05");
  const [selectedPriority, setSelectedPriority] = useState("Normal");
  const [menuSearchQuery, setMenuSearchQuery] = useState("");

  const [menuItems, setMenuItems] = useState([
    { id: "hk-1", name: "Chicken Fried Rice", category: "Hot Kitchen", station: "Hot Kitchen", icon: "🍳", checked: true, size: "Medium", qty: 2, defaultStaff: "K. Perera (Senior Line Chef)" },
    { id: "hk-2", name: "Chicken Kottu", category: "Hot Kitchen", station: "Hot Kitchen", icon: "🍳", checked: true, size: "Medium", qty: 1, defaultStaff: "R. Dissanayake (Kitchen Trainee)" },
    { id: "hk-3", name: "Cheese Kottu Special", category: "Hot Kitchen", station: "Hot Kitchen", icon: "🍳", checked: false, size: "Large", qty: 1, defaultStaff: "K. Perera (Senior Line Chef)" },
    { id: "hk-4", name: "Sri Lankan Fish Curry & Rice", category: "Hot Kitchen", station: "Hot Kitchen", icon: "🍲", checked: false, size: "Regular", qty: 1, defaultStaff: "K. Perera (Senior Line Chef)" },
    { id: "gr-1", name: "Jumbo Grilled Seafood Platter", category: "Grill", station: "Grill", icon: "🥩", checked: true, size: "Regular", qty: 1, defaultStaff: "T. Silva (Prep Cook)" },
    { id: "gr-2", name: "Charbroiled BBQ Chicken Steak", category: "Grill", station: "Grill", icon: "🥩", checked: false, size: "Large", qty: 1, defaultStaff: "T. Silva (Prep Cook)" },
    { id: "cs-1", name: "Cold Avocado Garden Salad", category: "Cold Salad", station: "Cold Salad", icon: "🥗", checked: false, size: "Regular", qty: 1, defaultStaff: "S. Fernando (Junior Chef)" },
    { id: "cs-2", name: "Mediterranean Feta Salad", category: "Cold Salad", station: "Cold Salad", icon: "🥗", checked: false, size: "Medium", qty: 1, defaultStaff: "S. Fernando (Junior Chef)" },
    { id: "pz-1", name: "Devilled Chicken Pizza", category: "Pizza", station: "Pizza", icon: "🍕", checked: true, size: "Large (15\")", qty: 1, defaultStaff: "A. Jayasinghe (Station Lead)" },
    { id: "pz-2", name: "BBQ Chicken Pizza", category: "Pizza", station: "Pizza", icon: "🍕", checked: false, size: "Medium (12\")", qty: 1, defaultStaff: "A. Jayasinghe (Station Lead)" },
    { id: "pz-3", name: "Seafood Supreme Pizza", category: "Pizza", station: "Pizza", icon: "🍕", checked: false, size: "Large (15\")", qty: 1, defaultStaff: "A. Jayasinghe (Station Lead)" },
    { id: "fy-1", name: "Hot Butter Cuttlefish", category: "Fryer", station: "Fryer", icon: "🍤", checked: true, size: "Medium", qty: 1, defaultStaff: "M. Wickramasinghe (Kitchen Trainee)" },
    { id: "fy-2", name: "Crispy Vegetable Samosas", category: "Fryer", station: "Fryer", icon: "🥟", checked: false, size: "Portion (6 pcs)", qty: 1, defaultStaff: "M. Wickramasinghe (Kitchen Trainee)" },
    { id: "bv-1", name: "Coca-Cola / Sprite", category: "Beverages", station: "Beverage Station", icon: "🥤", checked: true, size: "500ml", qty: 2, defaultStaff: "Beverage Counter" },
    { id: "bv-2", name: "Fresh Mango Iced Tea", category: "Beverages", station: "Beverage Station", icon: "🥤", checked: false, size: "Regular Glass", qty: 2, defaultStaff: "Beverage Counter" }
  ]);

  const toggleMenuItem = (id) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const updateItemSize = (id, size) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, size } : item));
  };

  const updateItemQty = (id, delta) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item));
  };

  const [kitchenOrders, setKitchenOrders] = useState([
    {
      id: "ord-1042",
      orderNo: "1042",
      table: "Table 04",
      timestamp: "7:05 PM",
      waiterApp: "Waiter Mobile Terminal #2",
      priority: "Normal",
      cookingTasks: [
        { item: "2 × Chicken Fried Rice (Medium)", assignedStaff: "K. Perera (Senior Line Chef)", status: "In Prep" },
        { item: "1 × Chicken Kottu (Medium)", assignedStaff: "R. Dissanayake (Kitchen Trainee)", status: "In Prep" }
      ],
      beverageTasks: [
        { item: "2 × Coke (500ml)", assignedStaff: "Beverage Counter", status: "Ready" }
      ],
      grillTasks: [],
      coldTasks: [],
      pizzaTasks: [],
      fryerTasks: []
    },
    {
      id: "ord-1043",
      orderNo: "1043",
      table: "Table 09",
      timestamp: "7:08 PM",
      waiterApp: "Waiter Mobile Terminal #1",
      priority: "Rush / High",
      cookingTasks: [
        { item: "1 × Cheese Kottu Special (Large)", assignedStaff: "K. Perera (Senior Line Chef)", status: "In Prep" }
      ],
      pizzaTasks: [
        { item: "1 × Devilled Chicken Pizza (Large 15\")", assignedStaff: "A. Jayasinghe (Station Lead)", status: "In Prep" }
      ],
      beverageTasks: [
        { item: "3 × Fresh Mango Iced Tea", assignedStaff: "Beverage Counter", status: "In Prep" }
      ],
      grillTasks: [
        { item: "1 × Jumbo Grilled Seafood Platter", assignedStaff: "T. Silva (Prep Cook)", status: "In Prep" }
      ],
      coldTasks: [],
      fryerTasks: [
        { item: "1 × Hot Butter Cuttlefish (Medium)", assignedStaff: "M. Wickramasinghe (Kitchen Trainee)", status: "In Prep" }
      ]
    }
  ]);

  const activeRoutedOrders = liveOrders
    .filter(o => o.status === 'pending' || o.status === 'in_prep')
    .map(ord => {
      const cookingTasks = [];
      const grillTasks = [];
      const coldTasks = [];
      const pizzaTasks = [];
      const fryerTasks = [];
      const beverageTasks = [];

      (ord.items || []).forEach(it => {
        const station = getStationForDish(it.name);
        const taskObj = {
          item: `${it.quantity} × ${it.name}`,
          assignedStaff: getStaffForStation(station),
          status: ord.status === 'in_prep' ? 'In Prep' : 'Queued'
        };

        if (station === 'Hot Kitchen') cookingTasks.push(taskObj);
        else if (station === 'Grill') grillTasks.push(taskObj);
        else if (station === 'Cold Salad') coldTasks.push(taskObj);
        else if (station === 'Pizza') pizzaTasks.push(taskObj);
        else if (station === 'Fryer') fryerTasks.push(taskObj);
        else beverageTasks.push(taskObj);
      });

      return {
        id: ord.id,
        orderNo: `${ord.order_number}`,
        table: ord.table_no,
        timestamp: ord.created_at,
        waiterApp: ord.order_type === 'Dine-In' ? 'Waiter Mobile Terminal' : `${ord.order_type} Channel`,
        priority: ord.customer_note?.toLowerCase().includes('rush') || ord.customer_note?.toLowerCase().includes('urgent') ? 'Rush / High' : 'Normal',
        status: ord.status,
        cookingTasks,
        grillTasks,
        coldTasks,
        pizzaTasks,
        fryerTasks,
        beverageTasks
      };
    });

  const displayKitchenOrders = activeRoutedOrders.length > 0 ? activeRoutedOrders : kitchenOrders;

  const handleCreateMobileOrder = async (e) => {
    e.preventDefault();
    const timestampNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const currentOrderNo = nextOrderNumCounter;

    const selectedItems = menuItems.filter(i => i.checked);
    if (selectedItems.length === 0) {
      setDismissedToast("⚠️ Please select at least one menu item to place the order.");
      setTimeout(() => setDismissedToast(""), 3500);
      return;
    }

    // Submit order to FastAPI backend so it reflects across POS & Kitchen
    try {
      const allItemsPayload = selectedItems.map(i => ({
        menu_id: i.id.startsWith("menu-") ? i.id : (
          i.name.includes("Kottu") ? "menu-01" :
            i.name.includes("Salmon") ? "menu-02" :
              i.name.includes("Waffle") ? "menu-03" :
                i.name.includes("Salad") ? "menu-04" :
                  i.name.includes("Steak") ? "menu-05" :
                    i.name.includes("Smoothie") || i.name.includes("Tea") ? "menu-06" :
                      i.name.includes("Pizza") ? "menu-07" : "menu-08"
        ),
        quantity: i.qty
      }));

      const payload = {
        table_no: selectedTableNo,
        order_type: "Dine-In",
        items: allItemsPayload,
        customer_note: `Mobile Waiter Terminal Order (${selectedPriority} Priority)`
      };

      const res = await axios.post("http://localhost:8000/api/orders", payload);
      const createdOrder = res.data?.order;
      setDismissedToast(`📱 Order #${createdOrder?.order_number || currentOrderNo} received & synced across Orders & POS + KDS!`);
      setTimeout(() => setDismissedToast(""), 4500);
      await fetchLiveOrders();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.warn("Could not post to /api/orders, fallback:", err);
      setDismissedToast(`📱 Order #${currentOrderNo} placed locally.`);
      setTimeout(() => setDismissedToast(""), 4500);
    }

    const newCookingTasks = selectedItems
      .filter(i => i.station === "Hot Kitchen" || i.category === "Hot Kitchen")
      .map(i => ({ item: `${i.qty} × ${i.name} (${i.size})`, assignedStaff: i.defaultStaff, status: "In Prep" }));

    const newGrillTasks = selectedItems
      .filter(i => i.station === "Grill" || i.category === "Grill")
      .map(i => ({ item: `${i.qty} × ${i.name} (${i.size})`, assignedStaff: i.defaultStaff, status: "In Prep" }));

    const newColdTasks = selectedItems
      .filter(i => i.station === "Cold Salad" || i.category === "Cold Salad")
      .map(i => ({ item: `${i.qty} × ${i.name} (${i.size})`, assignedStaff: i.defaultStaff, status: "In Prep" }));

    const newPizzaTasks = selectedItems
      .filter(i => i.station === "Pizza" || i.category === "Pizza")
      .map(i => ({ item: `${i.qty} × ${i.name} (${i.size})`, assignedStaff: i.defaultStaff, status: "In Prep" }));

    const newFryerTasks = selectedItems
      .filter(i => i.station === "Fryer" || i.category === "Fryer")
      .map(i => ({ item: `${i.qty} × ${i.name} (${i.size})`, assignedStaff: i.defaultStaff, status: "In Prep" }));

    const newBevTasks = selectedItems
      .filter(i => i.category === "Beverages" || i.station === "Beverage Station")
      .map(i => ({ item: `${i.qty} × ${i.name} (${i.size})`, assignedStaff: i.defaultStaff, status: "In Prep" }));

    const newOrder = {
      id: `ord-${currentOrderNo}-${Date.now()}`,
      orderNo: `${currentOrderNo}`,
      table: selectedTableNo,
      timestamp: timestampNow,
      waiterApp: "Waiter Mobile Terminal",
      priority: selectedPriority,
      cookingTasks: newCookingTasks,
      grillTasks: newGrillTasks,
      coldTasks: newColdTasks,
      pizzaTasks: newPizzaTasks,
      fryerTasks: newFryerTasks,
      beverageTasks: newBevTasks
    };

    setKitchenOrders(prev => [newOrder, ...prev]);
    setNextOrderNumCounter(prev => prev + 1);
    setShowOrderSimulatorModal(false);

    if (data && data.stations) {
      const updatedStations = data.stations.map(st => {
        let addedCount = 0;
        if (st.name === "Hot Kitchen" || st.id === "station-1") addedCount = newCookingTasks.length;
        else if (st.name === "Grill" || st.id === "station-2") addedCount = newGrillTasks.length;
        else if (st.name === "Cold Salad" || st.id === "station-3") addedCount = newColdTasks.length;
        else if (st.name === "Pizza" || st.id === "station-4") addedCount = newPizzaTasks.length;
        else if (st.name === "Fryer" || st.id === "station-5") addedCount = newFryerTasks.length;

        if (addedCount > 0) {
          const newQueue = st.queue_length + addedCount;
          const newPrepTime = (newQueue * 0.7 + 0.5).toFixed(1);
          const newLoad = Math.min(98, Math.max(30, Math.round((newQueue / 15) * 100)));
          const targetCooks = newQueue >= 15 ? 4 : (newQueue >= 10 ? 3 : (newQueue >= 5 ? 2 : 1));
          const newActualLoad = Number(((st.actual_load || 15) + addedCount * 1.5).toFixed(1));

          return {
            ...st,
            queue_length: newQueue,
            actual_load: newActualLoad,
            avg_prep_time_mins: newPrepTime,
            recommended_cooks: targetCooks,
            load_level: newLoad,
            bottleneck_status: newLoad >= 85 ? "Critical Queue Surge" : (newLoad >= 70 ? "High Delay Risk" : "Smooth Flow")
          };
        }
        return st;
      });
      setData({ ...data, stations: updatedStations });
    }
  };

  const handleCompleteOrderTask = (orderId, taskType, taskIdx) => {
    setKitchenOrders(prev => {
      const updated = prev.map(ord => {
        if (ord.id === orderId) {
          const updatedTasks = [...(ord[taskType] || [])];
          if (updatedTasks[taskIdx]) {
            updatedTasks[taskIdx] = { ...updatedTasks[taskIdx], status: "Prepared" };
          }
          return { ...ord, [taskType]: updatedTasks };
        }
        return ord;
      });

      return updated.filter(ord => {
        const cookDone = !ord.cookingTasks || ord.cookingTasks.length === 0 || ord.cookingTasks.every(t => t.status === "Prepared");
        const bevDone = !ord.beverageTasks || ord.beverageTasks.length === 0 || ord.beverageTasks.every(t => t.status === "Prepared");
        const grillDone = !ord.grillTasks || ord.grillTasks.length === 0 || ord.grillTasks.every(t => t.status === "Prepared");
        const coldDone = !ord.coldTasks || ord.coldTasks.length === 0 || ord.coldTasks.every(t => t.status === "Prepared");
        const pizzaDone = !ord.pizzaTasks || ord.pizzaTasks.length === 0 || ord.pizzaTasks.every(t => t.status === "Prepared");
        const fryerDone = !ord.fryerTasks || ord.fryerTasks.length === 0 || ord.fryerTasks.every(t => t.status === "Prepared");

        return !(cookDone && bevDone && grillDone && coldDone && pizzaDone && fryerDone);
      });
    });

    setDismissedToast("✨ Order task prepared & served! Completed orders automatically disappear from active dispatch.");
    setTimeout(() => setDismissedToast(""), 4000);

    if (data && data.stations) {
      const targetStationName =
        taskType === "cookingTasks" ? "Hot Kitchen" :
          taskType === "grillTasks" ? "Grill" :
            taskType === "coldTasks" ? "Cold Salad" :
              taskType === "pizzaTasks" ? "Pizza" :
                taskType === "fryerTasks" ? "Fryer" : "";

      if (targetStationName) {
        const updatedStations = data.stations.map(st => {
          if (st.name === targetStationName) {
            const newQueue = Math.max(1, st.queue_length - 1);
            const newPrepTime = (newQueue * 0.6).toFixed(1);
            const newLoad = Math.max(25, Math.round((newQueue / 15) * 100));
            const targetCooks = newQueue >= 15 ? 4 : (newQueue >= 10 ? 3 : (newQueue >= 5 ? 2 : 1));

            return {
              ...st,
              queue_length: newQueue,
              avg_prep_time_mins: newPrepTime,
              recommended_cooks: targetCooks,
              load_level: newLoad,
              bottleneck_status: newLoad >= 80 ? "High Delay Risk" : "Smooth Flow"
            };
          }
          return st;
        });
        setData({ ...data, stations: updatedStations });
      }
    }
  };

  const handleCompleteEntireOrder = async (orderId, orderNo) => {
    try {
      await axios.patch(`http://localhost:8000/api/orders/${orderId}/status`, { status: "ready" });
      await fetchLiveOrders();
      if (onRefresh) onRefresh();
    } catch (e) {
      // Local fallback
    }
    setKitchenOrders(prev => prev.filter(ord => ord.id !== orderId));
    setDismissedToast(`✨ Order #${orderNo} marked ready on pass! Dispatched to pickup pass.`);
    setTimeout(() => setDismissedToast(""), 4000);

    if (data && data.stations) {
      const updatedStations = data.stations.map(st => ({
        ...st,
        queue_length: Math.max(1, st.queue_length - 2),
        load_level: Math.max(25, st.load_level - 12)
      }));
      setData({ ...data, stations: updatedStations });
    }
  };

  const [showSelfAssessmentModal, setShowSelfAssessmentModal] = useState(false);
  const [showStaffLoginModal, setShowStaffLoginModal] = useState(false);
  const [loginStaffInput, setLoginStaffInput] = useState("M. Wickramasinghe (Kitchen Trainee)");
  const [loginPasscode, setLoginPasscode] = useState("1234");
  const [loginErrorMsg, setLoginErrorMsg] = useState("");
  const [assessmentSuccessMsg, setAssessmentSuccessMsg] = useState("");
  const [formData, setFormData] = useState({
    staffId: "staff-1",
    name: "K. Perera (Senior Line Chef)",
    assigned_station: "Hot Kitchen",
    skill_level: "Expert (Level 4)",
    efficiency_rating: 94,
    skills: ["High-Volume Saute Handling & Stir-Fry", "Kottu Speed & Line Cooking"],
    skill_gap: "Advanced Pastry & Bakery",
    training_request: "Executive Kitchen Leadership & Precision Temperature Control"
  });

  const handleStaffLogin = (e) => {
    e.preventDefault();
    if (!loginPasscode || loginPasscode.trim() === "") {
      setLoginErrorMsg("Please enter your staff passcode.");
      return;
    }

    const query = loginStaffInput.trim().toLowerCase();
    const member = data.staff.find(s =>
      s.id.toLowerCase() === query ||
      s.name.toLowerCase().includes(query) ||
      query.includes(s.name.toLowerCase())
    ) || data.staff[0];

    if (member) {
      setFormData({
        staffId: member.id,
        name: member.name,
        assigned_station: member.assigned_station,
        skill_level: member.skill_level,
        efficiency_rating: member.efficiency_rating,
        skills: member.self_assessed_skills || [],
        skill_gap: member.skill_gap,
        training_request: member.training_recommendation
      });
      setLoginErrorMsg("");
      setAssessmentSuccessMsg("");
      setShowStaffLoginModal(false);
      setShowSelfAssessmentModal(true);
    }
  };

  const handleAssessmentSubmit = (e) => {
    e.preventDefault();
    if (!data) return;

    const updatedStaff = data.staff.map((member) => {
      if (member.id === formData.staffId) {
        return {
          ...member,
          name: formData.name,
          assigned_station: formData.assigned_station,
          skill_level: formData.skill_level,
          efficiency_rating: Number(formData.efficiency_rating),
          skill_gap: formData.skill_gap,
          training_recommendation: formData.training_request,
          self_assessed_skills: formData.skills
        };
      }
      return member;
    });

    setData({ ...data, staff: updatedStaff });
    setAssessmentSuccessMsg(`Self-assessment submitted successfully for ${formData.name}!`);
    setTimeout(() => {
      setAssessmentSuccessMsg("");
      setShowSelfAssessmentModal(false);
    }, 1800);
  };

  if (loading || !data) {
    return (
      <div className="glass-panel p-12 text-center text-slate-500 rounded-2xl">
        <div className="animate-spin h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-xs font-bold font-mono">Loading Kitchen & Staff Metrics from Server...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Critical Efficiency Floor Alert (Below 50%) */}
      {isCriticalEfficiency && (
        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-500 dark:bg-rose-950/60 dark:border-rose-500/80 text-rose-950 dark:text-rose-100 shadow-xl flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-600 text-white font-bold flex-shrink-0 shadow-md">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  CRITICAL ALERT: Low Kitchen Overall Efficiency ({rawEfficiency})
                </h4>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white uppercase tracking-wider">
                  Below 50% Threshold
                </span>
              </div>
              <p className="text-xs font-semibold text-rose-900 dark:text-rose-200 mt-1">
                Kitchen overall efficiency has dropped to {rawEfficiency} (below the required 50% operational floor)! Immediate staff reallocation and line queue intervention required.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW NAVIGATION & ORDERS SYNC BANNER                                 */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveKitchenTab('optimization')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeKitchenTab === 'optimization'
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
          >
            <Users className="h-4 w-4" />
            <span>Staff Optimization & Workload AI</span>
          </button>

          <button
            onClick={() => setActiveKitchenTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeKitchenTab === 'all'
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
          >
            <Layers className="h-4 w-4" />
            <span>Full Kitchen Ops (All Views)</span>
          </button>
        </div>

        {/* Sync Status Badge & Cross-Module Shortcut */}
        <div className="flex items-center gap-3 pr-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Orders & POS Live Sync Active
            </span>
          </div>

          {onNavigateModule && (
            <button
              onClick={() => onNavigateModule('orders')}
              className="hidden lg:flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              <span>Go to Orders & POS</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* KITCHEN DISPLAY SYSTEM (KDS) LIVE TICKETS VIEW                            */}
      {/* ========================================================================= */}
      {(activeKitchenTab === 'kds' || activeKitchenTab === 'all') && (
        <div className="space-y-5 animate-fade-in">

          {/* Kitchen Live KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Kitchen Overall Efficiency</span>
              <div className={`text-2xl font-black mt-0.5 ${isCriticalEfficiency ? 'text-rose-600 dark:text-rose-400 animate-pulse' : (efficiencyNum >= 85 ? 'text-emerald-600 dark:text-emerald-400' : efficiencyNum >= 70 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400')}`}>
                {shiftEfficiency}
              </div>
              <span className={`text-[10px] font-bold ${dynamicKPIs.paceColor}`}>{dynamicKPIs.paceLabel}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Avg Ticket Fulfillment</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{shiftPrepTime}</div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Target: ~6.0 mins</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Cooking / Intake Queue</span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                {pendingOrders.length + inPrepOrders.length} <span className="text-xs font-medium text-slate-500 dark:text-slate-400">tickets</span>
              </div>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">{pendingOrders.length} new • {inPrepOrders.length} cooking</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Ready for Pickup / Pass</span>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                {readyOrders.length} <span className="text-xs font-medium text-slate-500 dark:text-slate-400">plates</span>
              </div>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">{completedOrders.length} served today</span>
            </div>
          </div>

          {/* KDS Live Ticket Board Container */}
          <div className="glass-panel p-6 rounded-2xl bg-white dark:bg-slate-900 border border-[#d1ded5] dark:border-slate-800 space-y-4 shadow-sm">

            {/* Top Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#e1eae4] dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                  Kitchen Display System (KDS) Live Tickets
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Real-time kitchen ticket flow from intake to pass • Synced with Orders & POS
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2.5 py-1 rounded bg-[#f0f5f2] dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-[#d1ded5] dark:border-slate-700">
                  {pendingOrders.length + inPrepOrders.length} Cooking / Incoming
                </span>

                <button
                  onClick={handleRefreshTickets}
                  disabled={ordersLoading}
                  className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
                  title="Force refresh live tickets & clear completed orders"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${ordersLoading ? 'animate-spin text-emerald-600' : ''}`} />
                  <span>{ordersLoading ? 'Syncing...' : 'Refresh Tickets'}</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {['all', 'Hot Kitchen', 'Grill', 'Cold Salad', 'Pizza', 'Fryer'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setKdsStationFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${kdsStationFilter === st
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                      : 'bg-[#f0f5f2] dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-[#d1ded5] dark:border-slate-700'
                      }`}
                  >
                    {st === 'all' ? 'All Stations' : st}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[200px]">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={kdsSearchQuery}
                  onChange={(e) => setKdsSearchQuery(e.target.value)}
                  placeholder="Filter by Order # or Table..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* 4-Column Ticket Flow Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">

              {/* Column 1: Pending (New Incoming Orders) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> NEW INCOMING ORDERS ({pendingOrders.length})
                  </span>
                </div>

                <div className="space-y-3">
                  {pendingOrders.length === 0 ? (
                    <div className="p-8 rounded-xl border border-dashed border-[#d1ded5] dark:border-slate-800 text-center text-xs text-slate-400 font-medium space-y-1">
                      <ChefHat className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto" />
                      <p>No new pending orders</p>
                      <p className="text-[10px] text-slate-400">All incoming tickets have been started</p>
                    </div>
                  ) : (
                    pendingOrders.map(ord => (
                      <div key={ord.id} className="p-4 rounded-xl bg-[#f8faf9] dark:bg-slate-800/90 border border-[#d1ded5] dark:border-slate-700 shadow-sm space-y-2.5">
                        <div className="flex items-center justify-between border-b border-[#e1eae4] dark:border-slate-700 pb-2">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">#{ord.order_number} ({ord.table_no})</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300">
                            {ord.created_at}
                          </span>
                        </div>

                        <div className="space-y-1">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                              <span>{it.quantity}x {it.name}</span>
                              <span className="text-slate-500 font-mono">Rs. {it.unit_price * it.quantity}</span>
                            </div>
                          ))}
                        </div>

                        {/* FIFO Ingredients Breakdown */}
                        {ord.ingredients_deducted?.length > 0 && (
                          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[10px] space-y-1 text-emerald-950 dark:text-emerald-300">
                            <span className="font-bold flex items-center gap-1">
                              <PackageCheck className="h-3 w-3 text-emerald-600" /> Smart FIFO Batches Used:
                            </span>
                            {ord.ingredients_deducted.map((ing, i) => (
                              <div key={i} className="text-slate-600 dark:text-slate-400 font-medium">
                                • {ing.amount_kg}kg {ing.item.split('(')[0]} ({ing.batch})
                              </div>
                            ))}
                          </div>
                        )}

                        {ord.customer_note && (
                          <p className="text-[10px] text-blue-900 dark:text-blue-300 italic bg-blue-50 dark:bg-blue-950/50 p-1.5 rounded">
                            "{ord.customer_note}"
                          </p>
                        )}

                        <div className="pt-2 border-t border-[#e1eae4] dark:border-slate-700 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500">{ord.station_name?.split('&')[0] || 'Hot Kitchen'}</span>
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'in_prep')}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                          >
                            <Flame className="h-3.5 w-3.5" /> Start Cooking
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Column 2: Ongoing / In Prep (Cooking) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" /> ONGOING COOKING ({inPrepOrders.length})
                  </span>
                </div>

                <div className="space-y-3">
                  {inPrepOrders.length === 0 ? (
                    <div className="p-8 rounded-xl border border-dashed border-[#d1ded5] dark:border-slate-800 text-center text-xs text-slate-400 font-medium space-y-1">
                      <Flame className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto" />
                      <p>No tickets currently cooking</p>
                      <p className="text-[10px] text-slate-400">Select a new order from left to start cooking</p>
                    </div>
                  ) : (
                    inPrepOrders.map(ord => (
                      <div key={ord.id} className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700/60 shadow-sm space-y-2.5">
                        <div className="flex items-center justify-between border-b border-amber-200 dark:border-amber-800 pb-2">
                          <span className="font-extrabold text-sm text-amber-950 dark:text-amber-200">#{ord.order_number} ({ord.table_no})</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {ord.elapsed_mins || 0}m / {ord.target_prep_mins || 8}m
                          </span>
                        </div>

                        <div className="space-y-1">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="text-xs font-bold text-slate-900 dark:text-white">
                              {it.quantity}x {it.name}
                            </div>
                          ))}
                        </div>

                        {ord.customer_note && (
                          <p className="text-[10px] text-amber-900 dark:text-amber-300 italic bg-amber-100/60 dark:bg-amber-950/60 p-1.5 rounded">
                            "{ord.customer_note}"
                          </p>
                        )}

                        <div className="pt-2 border-t border-amber-200 dark:border-amber-800 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400">{ord.station_name || 'Hot Kitchen'}</span>
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'ready')}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" /> Mark Ready on Pass
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Column 3: Ready for Pickup / Pass */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> READY FOR PICKUP ({readyOrders.length})
                  </span>
                </div>

                <div className="space-y-3">
                  {readyOrders.length === 0 ? (
                    <div className="p-8 rounded-xl border border-dashed border-[#d1ded5] dark:border-slate-800 text-center text-xs text-slate-400 font-medium space-y-1">
                      <CheckCircle2 className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto" />
                      <p>No plates waiting on pass</p>
                      <p className="text-[10px] text-slate-400">Plates will appear here once marked ready</p>
                    </div>
                  ) : (
                    readyOrders.map(ord => (
                      <div key={ord.id} className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700/60 shadow-sm space-y-2.5">
                        <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800 pb-2">
                          <span className="font-extrabold text-sm text-emerald-950 dark:text-emerald-200">#{ord.order_number} ({ord.table_no})</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">
                            {ord.order_type || 'Dine-In'}
                          </span>
                        </div>

                        <div className="space-y-1">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="text-xs font-bold text-slate-900 dark:text-white">
                              {it.quantity}x {it.name}
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300">Rs. {ord.total_amount_lkr}</span>
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'completed')}
                            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-black dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Served
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Column 4: Completed Orders */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-400" /> COMPLETED ORDERS ({completedOrders.length})
                  </span>
                  {completedOrders.length > 0 && (
                    <button
                      onClick={handleClearCompletedOrders}
                      className="text-[10px] text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 font-bold underline cursor-pointer"
                      title="Clear completed orders from screen"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {completedOrders.length === 0 ? (
                    <div className="p-8 rounded-xl border border-dashed border-[#d1ded5] dark:border-slate-800 text-center text-xs text-slate-400 font-medium space-y-1">
                      <CheckCheck className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto" />
                      <p>No completed orders</p>
                      <p className="text-[10px] text-slate-400">Served orders will display here</p>
                    </div>
                  ) : (
                    completedOrders.slice(0, 6).map(ord => {
                      const isDineIn = ord.order_type === 'Dine-In';
                      const isTableOccupied = ord.table_status === 'dining' || ord.table_status === 'occupied';

                      return (
                        <div key={ord.id} className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-[#d1ded5] dark:border-slate-700 shadow-sm space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-900 dark:text-white">#{ord.order_number} ({ord.table_no})</span>
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                              <CheckCheck className="h-3 w-3" /> Served
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                            {ord.items.map(it => `${it.quantity}x ${it.name}`).join(', ')}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-[#e1eae4] dark:border-slate-700 text-[10px]">
                            <span className="text-slate-500 font-mono font-bold">Rs. {ord.total_amount_lkr}</span>

                            {isDineIn && (
                              isTableOccupied ? (
                                <button
                                  onClick={() => handleFreeTable(ord.table_no)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1 shadow-sm transition-all hover:scale-105 cursor-pointer"
                                  title="Customers departed. Click to mark table free."
                                >
                                  <Armchair className="h-3 w-3" /> Clear & Free Table
                                </button>
                              ) : (
                                <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                                  ✓ Table Cleared
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Top Banner (Staff Optimization & Directives) */}
      {(activeKitchenTab === 'optimization' || activeKitchenTab === 'all') && (
        <div className="glass-panel p-6 rounded-2xl space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Kitchen Efficiency & Dynamic Staff Optimization</h2>
                <span className="text-xs px-2.5 py-0.5 rounded bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20 font-bold">
                  Workflow & Queue AI
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Real-time station queue monitoring, peak-hour staff allocation, and staff progression
              </p>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-4 flex-wrap justify-end">
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase">Kitchen Overall Efficiency</span>
                  <div className={`text-xl font-black ${isCriticalEfficiency ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {shiftEfficiency}
                  </div>
                </div>
                <div className="text-right border-l border-slate-200 dark:border-slate-800 pl-4">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase">Avg Prep Time</span>
                  <div className="text-xl font-black text-slate-900 dark:text-white">{shiftPrepTime}</div>
                </div>
                <div className="text-right border-l border-slate-200 dark:border-slate-800 pl-4">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase">Actual Total Load</span>
                  <div className="text-xl font-black text-orange-600 dark:text-orange-400">
                    {data?.actual_total_load || 121.0}
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">orders</span>
                  </div>
                </div>
                <div className="text-right border-l border-slate-200 dark:border-slate-800 pl-4">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase">Predicted Total Load</span>
                  <div className="text-xl font-black text-sky-600 dark:text-sky-400">
                    {data?.predicted_total_load || 114.6}
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">orders</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                <Clock className="h-3 w-3 text-orange-500" />
                <span>⏰ Dynamic API Connected • {last4HourUpdate}</span>
              </div>
            </div>
          </div>

          {/* Toast Notification */}
          {dismissedToast && (
            <div className="p-3.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-lg flex items-center justify-between gap-2 animate-bounce">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>{dismissedToast}</span>
              </div>
              <button onClick={() => setDismissedToast("")} className="text-white hover:text-slate-200 text-xs font-black cursor-pointer">✕</button>
            </div>
          )}

          {/* AI Actionable Directives */}
          <div className="p-5 rounded-2xl bg-orange-50 border border-orange-200 dark:bg-orange-950/40 dark:border-orange-500/30 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-orange-200 dark:border-orange-800/60 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                <div>
                  <h3 className="text-xs font-black text-orange-900 dark:text-orange-200 uppercase tracking-wider">
                    AI Dynamic Staff Allocation Directives
                  </h3>
                  <p className="text-[11px] text-orange-800 dark:text-orange-300 font-medium">
                    Updates dynamically based on real-time order queue surges and staff skill matching
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span> Live Kitchen Engine
                </span>
                <button
                  onClick={handleSimulateSurge}
                  className="px-3 py-1 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  title="Simulate sudden order queue spike"
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Simulate Order Queue Surge</span>
                </button>
              </div>
            </div>

            {directives.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span>All line queues balanced! Kitchen staffing operating at optimal efficiency.</span>
                </div>
                <button
                  onClick={() => fetchKitchenData()}
                  className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  Reset Directives
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {directives.map((dir, index) => (
                  <div
                    key={dir.id}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${dir.resolved
                      ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800 opacity-60'
                      : (index === 0
                        ? 'bg-white dark:bg-slate-900 border-2 border-orange-400 dark:border-orange-500/60 shadow-sm'
                        : 'bg-white/80 dark:bg-slate-900/60 border-orange-200 dark:border-orange-900/40 opacity-85')
                      }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md text-white ${dir.priority.includes('SURGE') || dir.priority === 'CRITICAL'
                          ? 'bg-rose-600 animate-pulse'
                          : (dir.priority === 'HIGH' ? 'bg-amber-600' : 'bg-blue-600')
                          }`}>
                          {index === 0 ? `TOP PRIORITY: ${dir.priority}` : `PRIORITY ${index + 1}: ${dir.priority}`}
                        </span>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{dir.title}</p>
                      </div>
                      <p className="text-xs text-orange-950 dark:text-orange-200 font-semibold flex items-center gap-1 pt-0.5">
                        <ArrowRight className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                        <span>Action: <span className="font-extrabold text-orange-900 dark:text-orange-100 underline">{dir.actionText}</span></span>
                      </p>
                    </div>

                    {dir.resolved ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 whitespace-nowrap self-start sm:self-auto">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Reassigned & Resolved</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleExecuteDirective(dir)}
                        className={`px-3.5 py-2 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap self-start sm:self-auto ${index === 0
                          ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/30 ring-2 ring-orange-400'
                          : 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600'
                          }`}
                      >
                        <ShieldCheck className="h-4 w-4" />
                        <span>Reallocate {dir.targetStaff}</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}



      {/* Research ML Model Performance & Evaluation Card */}
      {(activeKitchenTab === 'optimization' || activeKitchenTab === 'all') && (
        <>
          {(() => {
            const mlEval = data?.ml_model_evaluation || {
              model_name: "Random Forest Regressor (Multi-Output)",
              mae: 1.42,
              rmse: 2.18,
              r2_score: 0.941,
              mape: "5.9%",
              cross_val_accuracy: "94.1%",
              dataset_days_trained: 92,
              features_used: ["Hour", "DayOfWeek", "IsWeekend", "HistoricalQueue", "StationType"]
            };

            const r2Pct = (Number(mlEval.r2_score || 0.941) * 100).toFixed(1);

            return (
              <div className="glass-panel p-6 rounded-2xl space-y-5 border border-indigo-200/80 dark:border-indigo-500/30 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/30 dark:from-slate-900/90 dark:via-indigo-950/20 dark:to-slate-900/90 shadow-sm">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-indigo-100 dark:border-indigo-900/50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25">
                      <Cpu className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          Research ML Model Performance & Evaluation
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-indigo-500" />
                          {mlEval.model_name || "Random Forest Regressor (Multi-Output)"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        Supervised Multi-Output regression pipeline forecasting station loads across Hot Kitchen, Grill, Cold Salad, Pizza & Fryer
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                      <Database className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Trained on {mlEval.dataset_days_trained || 92} Days of Historical Kitchen Workload Data</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/60 text-purple-800 dark:text-purple-300 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                      <ShieldCheck className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                      <span>CV Accuracy: {mlEval.cross_val_accuracy || "94.1%"}</span>
                    </div>
                  </div>
                </div>

                {/* Metrics Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Metric 1: MAE */}
                  <div className="p-4 rounded-xl bg-white/90 dark:bg-slate-900/80 border border-indigo-100 dark:border-slate-800 shadow-2xs space-y-2 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        MAE (Mean Absolute Error)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                        Low Bias
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {mlEval.mae ?? 1.42}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        orders
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      Average deviation between model forecast and real-time kitchen order tickets.
                    </p>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>

                  {/* Metric 2: RMSE */}
                  <div className="p-4 rounded-xl bg-white/90 dark:bg-slate-900/80 border border-indigo-100 dark:border-slate-800 shadow-2xs space-y-2 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        RMSE (Root Mean Squared Error)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300">
                        Peak Safe
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {mlEval.rmse ?? 2.18}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        orders
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      Penalizes peak rush-hour outliers to avoid catastrophic kitchen queue backlogs.
                    </p>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                      <div className="bg-sky-500 h-full rounded-full" style={{ width: '88%' }}></div>
                    </div>
                  </div>

                  {/* Metric 3: R² Score */}
                  <div className="p-4 rounded-xl bg-white/90 dark:bg-slate-900/80 border border-indigo-100 dark:border-slate-800 shadow-2xs space-y-2 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        R² Score (Goodness of Fit)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300">
                        High Fit
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                        {mlEval.r2_score ?? 0.941}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        ({r2Pct}%)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      Proportion of variance explained by temporal patterns & queue factors.
                    </p>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${Math.min(100, r2Pct)}%` }}></div>
                    </div>
                  </div>

                  {/* Metric 4: MAPE */}
                  <div className="p-4 rounded-xl bg-white/90 dark:bg-slate-900/80 border border-indigo-100 dark:border-slate-800 shadow-2xs space-y-2 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        MAPE (Mean Absolute % Error)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                        &lt; 10% Benchmark
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
                        {mlEval.mape ?? "5.9%"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      Tight percentage error ensuring reliable prep-line staffing decisions across shifts.
                    </p>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: '94.1%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Feature Inputs & Dataset Scope Bar */}
                <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5 text-indigo-500" />
                      Model Feature Inputs:
                    </span>
                    {(mlEval.features_used || ["Hour", "DayOfWeek", "IsWeekend", "HistoricalQueue", "StationType"]).map((feat, fIdx) => (
                      <span
                        key={fIdx}
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-indigo-100 dark:border-slate-700 font-mono text-[11px] font-semibold"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
                    <Award className="h-3.5 w-3.5 text-amber-500" />
                    <span>
                      Validated on <strong>{mlEval.dataset_days_trained || 92} days</strong> of historical kitchen workload data across <strong>5 stations</strong> (Hot Kitchen, Grill, Cold Salad, Pizza, Fryer)
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Peak-Hour Workload & Staffing Demand Chart */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Peak-Hour Workload & Staffing Forecast (07:00 - 22:30)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Hourly projected kitchen orders and dynamic cook allocation requirements</p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setShowBreakfastRush(!showBreakfastRush)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border transition-all cursor-pointer shadow-sm flex items-center gap-1 ${showBreakfastRush
                    ? 'bg-amber-600 text-white border-amber-600 shadow-amber-500/30'
                    : 'text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/20'
                    }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>Breakfast Rush: 07:30 – 09:30</span>
                </button>
                <button
                  onClick={() => setShowLunchRush(!showLunchRush)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border transition-all cursor-pointer shadow-sm flex items-center gap-1 ${showLunchRush
                    ? 'bg-sky-600 text-white border-sky-600 shadow-sky-500/30'
                    : 'text-sky-800 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20 hover:bg-sky-100 dark:hover:bg-sky-500/20'
                    }`}
                >
                  <Utensils className="h-3.5 w-3.5" />
                  <span>Lunch Rush: 12:00 – 14:00</span>
                </button>
                <button
                  onClick={() => setShowDinnerRush(!showDinnerRush)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border transition-all cursor-pointer shadow-sm flex items-center gap-1 ${showDinnerRush
                    ? 'bg-orange-600 text-white border-orange-600 shadow-orange-500/30'
                    : 'text-orange-800 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20 hover:bg-orange-100 dark:hover:bg-orange-500/20'
                    }`}
                >
                  <Flame className="h-3.5 w-3.5" />
                  <span>Dinner Rush: 19:00 – 20:30</span>
                </button>
                <button
                  onClick={() => setShowSeasonalRush(!showSeasonalRush)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border transition-all cursor-pointer shadow-sm flex items-center gap-1 ${showSeasonalRush
                    ? 'bg-purple-600 text-white border-purple-600 shadow-purple-500/30'
                    : 'text-purple-800 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20 hover:bg-purple-100 dark:hover:bg-purple-500/20'
                    }`}
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Seasonal Rush</span>
                </button>
              </div>
            </div>

            {/* Breakfast Rush Period Section */}
            {showBreakfastRush && (
              <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 shadow-sm space-y-3 mt-3">
                <div className="flex items-center justify-between border-b border-amber-200 dark:border-amber-800/50 pb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">Breakfast Rush Period Details</h4>
                  </div>
                  <span className="text-[11px] font-extrabold text-amber-700 dark:text-amber-300 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                    Peak: 76 Orders/Hr at 08:00
                  </span>
                </div>
                <div className="space-y-2 text-xs text-slate-800 dark:text-slate-200 font-medium">
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-amber-100 dark:border-amber-900/50 shadow-2xs">
                    <span className="font-bold text-amber-950 dark:text-amber-200">Breakfast Rush Window:</span> 07:30 AM – 09:30 AM (Morning takeaway & breakfast dining surge)
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-amber-100 dark:border-amber-900/50 shadow-2xs">
                    <span className="font-bold text-amber-900 dark:text-amber-300">Staff Allocation Required:</span> 6 Line Chefs (2 Hoppers/Roti Bay, 2 Beverage Station, 2 Assembly)
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-amber-100 dark:border-amber-900/50 shadow-2xs">
                    <span className="font-bold text-amber-900 dark:text-amber-300">Menu Demand Focus:</span> String Hoppers, Egg Hoppers, Pol Roti with Lunu Miris, Ceylon Tea & Coffee
                  </div>
                </div>
              </div>
            )}

            {/* Lunch Rush Period Section */}
            {showLunchRush && (
              <div className="p-4 rounded-xl bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-500/30 shadow-sm space-y-3 mt-3">
                <div className="flex items-center justify-between border-b border-sky-200 dark:border-sky-800/50 pb-2">
                  <div className="flex items-center gap-2">
                    <Utensils className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-sky-900 dark:text-sky-200">Lunch Rush Period Details</h4>
                  </div>
                  <span className="text-[11px] font-extrabold text-sky-700 dark:text-sky-300 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
                    Peak: 95 Orders/Hr at 13:00
                  </span>
                </div>
                <div className="space-y-2 text-xs text-slate-800 dark:text-slate-200 font-medium">
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-sky-100 dark:border-sky-900/50 shadow-2xs">
                    <span className="font-bold text-sky-950 dark:text-sky-200">Lunch Rush Window:</span> 12:00 PM – 02:00 PM (Highest daily dine-in & corporate rush)
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-sky-100 dark:border-sky-900/50 shadow-2xs">
                    <span className="font-bold text-sky-900 dark:text-sky-300">Staff Allocation Required:</span> 8 Line Chefs (2 Wok, 2 Curry Bay, 2 Grill, 2 Assembly)
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-sky-100 dark:border-sky-900/50 shadow-2xs">
                    <span className="font-bold text-sky-900 dark:text-sky-300">Menu Demand Focus:</span> Rice & Curry Express Thali, Wok Fried Rice & Seafood Combos
                  </div>
                </div>
              </div>
            )}

            {/* Dinner Rush Period Section */}
            {showDinnerRush && (
              <div className="p-4 rounded-xl bg-orange-50/80 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-500/30 shadow-sm space-y-3 mt-3">
                <div className="flex items-center justify-between border-b border-orange-200 dark:border-orange-800/50 pb-2">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-orange-900 dark:text-orange-200">Dinner Rush Period Details</h4>
                  </div>
                  <span className="text-[11px] font-extrabold text-orange-700 dark:text-orange-300 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-full border border-orange-200 dark:border-orange-800">
                    Peak: 115 Orders/Hr at 19:00
                  </span>
                </div>
                <div className="space-y-2 text-xs text-slate-800 dark:text-slate-200 font-medium">
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-orange-100 dark:border-orange-900/50 shadow-2xs">
                    <span className="font-bold text-orange-950 dark:text-orange-200">Dinner Rush Window:</span> 07:00 PM – 08:30 PM (Highest daily revenue & family dining surge)
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-orange-100 dark:border-orange-900/50 shadow-2xs">
                    <span className="font-bold text-orange-900 dark:text-orange-300">Staff Allocation Required:</span> 9 Line Chefs (3 Hot Kitchen, 2 Grill, 2 Cold Salad, 1 Pizza, 1 Fryer)
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-orange-100 dark:border-orange-900/50 shadow-2xs">
                    <span className="font-bold text-orange-900 dark:text-orange-300">Menu Demand Focus:</span> Kottu Specials, Grilled Steaks, Fresh Salads, Artisan Pizzas & Crispy Fryer Starters
                  </div>
                </div>
              </div>
            )}

            {/* Seasonal Rush Periods Section */}
            {showSeasonalRush && (
              <div className="p-4 rounded-xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/30 shadow-sm space-y-3 mt-3">
                <div className="flex items-center gap-2 border-b border-purple-200 dark:border-purple-800/50 pb-2">
                  <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-200">Seasonal Rush Periods</h4>
                </div>
                <div className="space-y-2 text-xs text-slate-800 dark:text-slate-200 font-medium">
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-purple-100 dark:border-purple-900/50 shadow-2xs">
                    <span className="font-bold text-purple-950 dark:text-purple-200">Festive / Holiday Season:</span> December – Early January (Christmas / New Year rush)
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-purple-100 dark:border-purple-900/50 shadow-2xs">
                    <span className="font-bold text-amber-900 dark:text-amber-300">New Year / Spring Festival:</span> Mid-April (Sinhala & Tamil New Year season)
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-purple-100 dark:border-purple-900/50 shadow-2xs">
                    <span className="font-bold text-sky-900 dark:text-sky-300">Summer / Tourist Peak Season:</span> July – August (Travel & vacation rush)
                  </div>
                </div>
              </div>
            )}

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.hourly_peak_forecast}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#1e293b" : "#e2e8f0"} />
                  <XAxis dataKey="hour" stroke={isDarkMode ? "#64748b" : "#475569"} fontSize={11} />
                  <YAxis stroke={isDarkMode ? "#64748b" : "#475569"} fontSize={11} yAxisId="left" />
                  <YAxis stroke={isDarkMode ? "#64748b" : "#475569"} fontSize={11} yAxisId="right" orientation="right" domain={[0, 12]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                      borderColor: isDarkMode ? '#334155' : '#cbd5e1',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: isDarkMode ? '#f8fafc' : '#0f172a',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                  <ReferenceArea
                    yAxisId="left"
                    x1="07:00"
                    x2="09:00"
                    fill={isDarkMode ? "#d97706" : "#f59e0b"}
                    fillOpacity={isDarkMode ? 0.2 : 0.12}
                    stroke="#d97706"
                    strokeDasharray="3 3"
                    label={{
                      value: "Breakfast Rush (07:30 – 09:30)",
                      fill: isDarkMode ? "#fbbf24" : "#d97706",
                      fontSize: 11,
                      fontWeight: "bold",
                      position: "insideTop"
                    }}
                  />

                  <ReferenceArea
                    yAxisId="left"
                    x1="12:00"
                    x2="14:00"
                    fill={isDarkMode ? "#0284c7" : "#0284c7"}
                    fillOpacity={isDarkMode ? 0.2 : 0.12}
                    stroke="#0284c7"
                    strokeDasharray="3 3"
                    label={{
                      value: "Lunch Rush (12:00 – 14:00)",
                      fill: isDarkMode ? "#38bdf8" : "#0284c7",
                      fontSize: 11,
                      fontWeight: "bold",
                      position: "insideTop"
                    }}
                  />

                  <ReferenceArea
                    yAxisId="left"
                    x1="18:00"
                    x2="21:00"
                    fill={isDarkMode ? "#ea580c" : "#f97316"}
                    fillOpacity={isDarkMode ? 0.2 : 0.12}
                    stroke="#f97316"
                    strokeDasharray="3 3"
                    label={{
                      value: "Dinner Rush (19:00 – 20:30)",
                      fill: isDarkMode ? "#fb923c" : "#ea580c",
                      fontSize: 11,
                      fontWeight: "bold",
                      position: "insideTop"
                    }}
                  />

                  <Line yAxisId="left" type="monotone" dataKey="predicted_orders" stroke="#f97316" strokeWidth={3} name="Predicted Orders" dot={{ r: 3 }} />
                  <Line yAxisId="right" type="stepAfter" dataKey="staff_required" stroke="#10b981" strokeWidth={2.5} name="Chefs Required" />
                  <Line yAxisId="right" type="stepAfter" dataKey="actual_staff" stroke="#64748b" strokeWidth={2} strokeDasharray="4 4" name="Scheduled Chefs" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Kitchen Station Workload & Queue Monitors */}
          <div className="glass-panel p-6 rounded-2xl space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Real-Time Kitchen Station Workload & Queue Status</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20 font-bold">
                    5 Stations Monitored
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Monitoring queue latency, cooks assigned, actual load vs predicted load across all 5 production stations
                </p>
              </div>
            </div>

            {/* Shift Workload Capacity: Actual Total Load & Predicted Total Load Overview Banner */}
            {(() => {
              const actualTotal = Number(stationsList.reduce((acc, s) => acc + (Number(s.actual_load) || 0), 0).toFixed(1));
              const predictedTotal = Number(stationsList.reduce((acc, s) => acc + (Number(s.predicted_load) || 0), 0).toFixed(1));
              const delta = Number((actualTotal - predictedTotal).toFixed(1));
              const deltaPct = predictedTotal > 0 ? (((actualTotal - predictedTotal) / predictedTotal) * 100).toFixed(1) : "0.0";
              const accuracyPct = Math.max(0, Math.min(100, 100 - Math.abs(Number(deltaPct)))).toFixed(1);
              const totalCooks = stationsList.reduce((acc, s) => acc + (s.active_cooks || 0), 0);
              const targetCooks = stationsList.reduce((acc, s) => acc + (s.recommended_cooks || 0), 0);

              const totalLoadForProportion = stationsList.reduce((acc, s) => acc + (Number(s.actual_load) || 0), 0);
              let hotKitchenPct = 20, grillPct = 20, coldSaladPct = 20, pizzaPct = 20, fryerPct = 20;
              if (totalLoadForProportion > 0) {
                const rawHot = ((Number(stationsList.find(s => s.name === "Hot Kitchen")?.actual_load) || 0) / totalLoadForProportion) * 100;
                const rawGrill = ((Number(stationsList.find(s => s.name === "Grill")?.actual_load) || 0) / totalLoadForProportion) * 100;
                const rawSalad = ((Number(stationsList.find(s => s.name === "Cold Salad")?.actual_load) || 0) / totalLoadForProportion) * 100;
                const rawPizza = ((Number(stationsList.find(s => s.name === "Pizza")?.actual_load) || 0) / totalLoadForProportion) * 100;
                const rawFryer = ((Number(stationsList.find(s => s.name === "Fryer")?.actual_load) || 0) / totalLoadForProportion) * 100;

                hotKitchenPct = Math.round(rawHot);
                grillPct = Math.round(rawGrill);
                coldSaladPct = Math.round(rawSalad);
                pizzaPct = Math.round(rawPizza);
                fryerPct = Math.max(0, 100 - (hotKitchenPct + grillPct + coldSaladPct + pizzaPct));
              }

              return (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50/80 via-amber-50/60 to-emerald-50/80 dark:from-slate-900/90 dark:via-orange-950/20 dark:to-slate-900/90 border border-orange-200/80 dark:border-orange-500/30 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-orange-200/60 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-orange-600 text-white shadow-xs">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                          Shift Workload Capacity: Actual vs Predicted Total Loads
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          ML Random Forest Regressor vs Live Dispatch Workload Pipeline
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{accuracyPct}% Forecast Accuracy</span>
                      </span>
                    </div>
                  </div>

                  {/* KPI Cards: Actual Total Load & Predicted Total Load */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Actual Total Load
                        </span>
                        <span className="h-2 w-2 rounded-full bg-orange-500 animate-ping"></span>
                      </div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-orange-600 dark:text-orange-400">
                          {actualTotal}
                        </span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">orders / shift</span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1 block">
                        Sum of actual orders across all 5 stations
                      </span>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                        Predicted Total Load
                      </span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-sky-600 dark:text-sky-400">
                          {predictedTotal}
                        </span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">orders / shift</span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1 block">
                        ML predicted total demand forecast
                      </span>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                        Variance Delta (Actual − Pred)
                      </span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className={`text-2xl font-black ${delta >= 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {delta >= 0 ? `+${delta}` : delta}
                        </span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">({deltaPct > 0 ? `+${deltaPct}` : deltaPct}%)</span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1 block">
                        {delta >= 0 ? 'Surge volume exceeding model' : 'Within operational ceiling'}
                      </span>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                        Total Cooks Assigned
                      </span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                          {totalCooks}
                        </span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          / {targetCooks} target cooks
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1 block">
                        Active across 5 production lines
                      </span>
                    </div>
                  </div>

                  {/* Station Workload Share Proportion Bar */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                      <span>5-Station Workload Share Proportion:</span>
                      <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                        Hot Kitchen ({hotKitchenPct}%) • Grill ({grillPct}%) • Cold Salad ({coldSaladPct}%) • Pizza ({pizzaPct}%) • Fryer ({fryerPct}%)
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                      <div style={{ width: `${hotKitchenPct}%` }} className="bg-orange-500 h-full transition-all duration-500" title={`Hot Kitchen: ${hotKitchenPct}%`} />
                      <div style={{ width: `${grillPct}%` }} className="bg-amber-500 h-full transition-all duration-500" title={`Grill: ${grillPct}%`} />
                      <div style={{ width: `${coldSaladPct}%` }} className="bg-emerald-500 h-full transition-all duration-500" title={`Cold Salad: ${coldSaladPct}%`} />
                      <div style={{ width: `${pizzaPct}%` }} className="bg-rose-500 h-full transition-all duration-500" title={`Pizza: ${pizzaPct}%`} />
                      <div style={{ width: `${fryerPct}%` }} className="bg-purple-500 h-full transition-all duration-500" title={`Fryer: ${fryerPct}%`} />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* High Workload & Queue Alerts Panel */}
            {stationsList.some(st => st.load_level >= 80) && (
              <div className="p-4 rounded-2xl bg-rose-50/90 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-500/40 shadow-sm space-y-3">
                <div className="flex items-center gap-2 border-b border-rose-200 dark:border-rose-800/60 pb-2">
                  <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 flex-shrink-0 animate-pulse" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-rose-900 dark:text-rose-200">
                    High Workload & Line Queue Alerts
                  </h4>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-600 text-white ml-auto">
                    {stationsList.filter(st => st.load_level >= 80).length} Stations Critical
                  </span>
                </div>

                <div className="space-y-2.5">
                  {stationsList.filter(st => st.load_level >= 80).map((st) => (
                    <div
                      key={st.id}
                      className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-900/60 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            🚨 {st.name}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${st.load_level >= 90
                            ? 'bg-rose-600 text-white'
                            : 'bg-amber-500 text-white'
                            }`}>
                            {st.load_level}% Load ({st.bottleneck_status})
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                          Current Queue: <span className="font-bold text-slate-900 dark:text-white">{st.queue_length} orders</span> • Avg Prep Time: <span className="font-bold text-slate-900 dark:text-white">{st.avg_prep_time_mins} mins</span> • Actual: <span className="font-bold text-orange-600 dark:text-orange-400">{st.actual_load || Math.round(st.load_level * 0.7)} orders</span> • Predicted: <span className="font-bold text-sky-600 dark:text-sky-400">{st.predicted_load || Math.round(st.load_level * 0.65)} orders</span>
                        </p>
                        <div className="text-xs text-rose-800 dark:text-rose-300 font-bold flex items-center gap-1.5 pt-0.5">
                          <ArrowRight className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                          <span>Recommended Action: <span className="text-rose-950 dark:text-rose-100 font-extrabold underline">{st.action}</span></span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const targetStaffName = st.name === "Hot Kitchen" ? "S. Fernando" : (st.name === "Grill" ? "T. Silva" : (st.name === "Pizza" ? "A. Jayasinghe" : "Kitchen Staff"));
                          const targetStationName = st.name;

                          const updatedStations = data.stations.map(s => {
                            if (s.id === st.id) {
                              const newQueue = Math.max(2, s.queue_length - 8);
                              const newPrepTime = (newQueue * 0.5 + 0.2).toFixed(1);
                              const newActiveCooks = s.recommended_cooks || 3;

                              return {
                                ...s,
                                active_cooks: newActiveCooks,
                                queue_length: newQueue,
                                avg_prep_time_mins: newPrepTime,
                                load_level: Math.max(45, s.load_level - 35),
                                bottleneck_status: "Smooth Flow",
                                action: `Optimal staffing restored — ${targetStaffName} reallocated based on skill matching`
                              };
                            }
                            return s;
                          });

                          const updatedStaff = data.staff.map(s => {
                            if (s.name.includes(targetStaffName)) {
                              return {
                                ...s,
                                assigned_station: `${targetStationName} (Reallocated via AI)`,
                                isReallocated: true,
                                reallocatedTo: targetStationName
                              };
                            }
                            return s;
                          });

                          setData({ ...data, stations: updatedStations, staff: updatedStaff });
                          setDismissedToast(`⚡ Dynamic Line Balancing Applied: ${targetStaffName} reallocated to ${targetStationName}! Staff Matrix updated.`);
                          setTimeout(() => setDismissedToast(""), 4500);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs whitespace-nowrap self-start sm:self-auto cursor-pointer transition-all flex items-center gap-1"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Apply Reallocation & Balance Line</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5-Station Workload Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {stationsList.map((st) => {
                const isHighWorkload = st.load_level >= 80;
                return (
                  <div
                    key={st.id}
                    className={`p-4 rounded-2xl border flex flex-col justify-between shadow-sm transition-all ${isHighWorkload
                      ? (st.load_level >= 90
                        ? 'bg-rose-50 border-2 border-rose-400 dark:bg-rose-950/40 dark:border-rose-500/60 shadow-rose-500/10'
                        : 'bg-amber-50 border-2 border-amber-400 dark:bg-amber-950/40 dark:border-amber-500/60 shadow-amber-500/10')
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
                      }`}
                  >
                    <div>
                      {isHighWorkload && (
                        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase text-rose-700 dark:text-rose-400">
                          <AlertTriangle className="h-3.5 w-3.5 animate-pulse" />
                          <span>High Workload & Delay Risk Alert</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">{st.name}</span>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${st.load_level >= 90
                          ? 'bg-rose-600 text-white'
                          : (st.load_level >= 80 ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300')
                          }`}>
                          {st.load_level}% Load
                        </span>
                      </div>

                      {/* Actual Load & Predicted Load Details */}
                      <div className="mt-3 p-2.5 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 dark:text-slate-400 font-bold">Actual Load:</span>
                          <span className="font-extrabold text-orange-600 dark:text-orange-400">
                            {st.actual_load !== undefined ? `${st.actual_load} orders` : `${Math.round(st.load_level * 0.7)} orders`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 dark:text-slate-400 font-bold">Predicted Load:</span>
                          <span className="font-extrabold text-sky-600 dark:text-sky-400">
                            {st.predicted_load !== undefined ? `${st.predicted_load} orders` : `${Math.round((st.predicted_load_level || st.load_level) * 0.65)} orders`}
                          </span>
                        </div>

                        {/* Visual Comparison Progress Bar */}
                        <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center justify-between text-[9px] font-bold text-slate-400">
                            <span>Load vs Capacity</span>
                            <span>{st.load_level}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                            <div
                              style={{ width: `${Math.min(100, st.load_level)}%` }}
                              className={`h-full ${st.load_level >= 90 ? 'bg-rose-500' : (st.load_level >= 80 ? 'bg-amber-500' : 'bg-emerald-500')}`}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Current Queue:</span>
                          <span className="font-extrabold text-slate-900 dark:text-white px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            {st.queue_length} orders
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Avg Prep Time:</span>
                          <span className="font-extrabold text-slate-900 dark:text-white px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            {st.avg_prep_time_mins} mins
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Cooks Assigned:</span>
                          <span className={`font-extrabold px-2 py-0.5 rounded border transition-all ${st.active_cooks < st.recommended_cooks
                            ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                            }`}>
                            {st.active_cooks < st.recommended_cooks ? '⚠️ ' : '✓ '}
                            {st.active_cooks} (Target: {st.recommended_cooks})
                          </span>
                        </div>
                      </div>
                    </div>

                    {st.load_level > 50 && (
                      <div className={`mt-3.5 p-3 rounded-xl border ${isHighWorkload
                        ? 'bg-rose-100/70 border-rose-300 dark:bg-rose-950/80 dark:border-rose-900/80'
                        : 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/60 dark:border-amber-900/80'
                        }`}>
                        <span className="text-[10px] uppercase font-black text-rose-800 dark:text-rose-400 flex items-center gap-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" /> Recommended Action:
                        </span>
                        <p className="text-xs text-slate-900 dark:text-white mt-1 font-extrabold leading-tight">{st.action}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </>
      )}

      {/* Waiter Mobile Order Entry Modal */}
      {showOrderSimulatorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 space-y-5 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-orange-600 text-white shadow-md shadow-orange-600/20">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Waiter Mobile App Order Entry</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Select Sri Lankan dishes & Pizza items with sizes, quantities & table assignment</p>
                </div>
              </div>
              <button
                onClick={() => setShowOrderSimulatorModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMobileOrder} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Hash className="h-3.5 w-3.5 text-orange-600" />
                    Order Number (Auto)
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`#${nextOrderNumCounter}`}
                    className="w-full px-3.5 py-2 rounded-xl border border-orange-200 dark:border-orange-900/60 bg-orange-50/50 dark:bg-orange-950/30 text-orange-900 dark:text-orange-200 font-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Table Number
                  </label>
                  <select
                    value={selectedTableNo}
                    onChange={(e) => setSelectedTableNo(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  >
                    <option value="Table 01">Table 01</option>
                    <option value="Table 02">Table 02</option>
                    <option value="Table 03">Table 03</option>
                    <option value="Table 04">Table 04</option>
                    <option value="Table 05">Table 05</option>
                    <option value="Table 06">Table 06</option>
                    <option value="Table 08">Table 08</option>
                    <option value="Table 12">Table 12</option>
                    <option value="VIP Suite 1">VIP Suite 1</option>
                    <option value="Outdoor Terrace 3">Outdoor Terrace 3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Order Priority
                  </label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  >
                    <option value="Normal">Normal Priority</option>
                    <option value="Rush / High">🔥 Rush / High Priority</option>
                    <option value="VIP Urgent">👑 VIP Urgent</option>
                  </select>
                </div>
              </div>

              {/* Menu Search Bar */}
              <div className="relative pt-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Search Menu Items
                </label>
                <div className="relative">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={menuSearchQuery}
                    onChange={(e) => setMenuSearchQuery(e.target.value)}
                    placeholder="🔍 Search Sri Lankan dishes, pizzas, drinks..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden text-xs"
                  />
                  {menuSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setMenuSearchQuery("")}
                      className="absolute right-3 top-2.5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Render Menu Items by Production Station */}
              {[
                { cat: "Hot Kitchen", label: "🍳 Hot Kitchen Specialties", icon: "🍳" },
                { cat: "Grill", label: "🥩 Grill & Charbroil Station", icon: "🥩" },
                { cat: "Cold Salad", label: "🥗 Cold Salad & Fresh Prep", icon: "🥗" },
                { cat: "Pizza", label: "🍕 Artisan Pizza Variety", icon: "🍕" },
                { cat: "Fryer", label: "🍤 Fryer & Crispy Appetizers", icon: "🍤" },
                { cat: "Beverages", label: "🥤 Beverages & Refreshers", icon: "🥤" }
              ].map(({ cat, label }) => {
                const filtered = menuItems.filter(i => (i.category === cat || i.station === cat) && (
                  !menuSearchQuery.trim() ||
                  i.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
                  i.category.toLowerCase().includes(menuSearchQuery.toLowerCase())
                ));

                if (filtered.length === 0) return null;

                return (
                  <div key={cat} className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        {label}
                      </h4>
                    </div>

                    <div className="space-y-2">
                      {filtered.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${item.checked
                            ? (cat === 'Hot Kitchen' ? 'bg-orange-50/70 border-orange-300 dark:bg-orange-950/40 dark:border-orange-800'
                              : cat === 'Grill' ? 'bg-amber-50/70 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800'
                                : cat === 'Pizza' ? 'bg-rose-50/70 border-rose-300 dark:bg-rose-950/40 dark:border-rose-800'
                                  : cat === 'Fryer' ? 'bg-purple-50/70 border-purple-300 dark:bg-purple-950/40 dark:border-purple-800'
                                    : cat === 'Cold Salad' ? 'bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800'
                                      : 'bg-sky-50/70 border-sky-300 dark:bg-sky-950/40 dark:border-sky-800')
                            : "bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800"
                            }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={item.checked}
                              onChange={() => toggleMenuItem(item.id)}
                              className="h-4 w-4 rounded accent-orange-600 cursor-pointer"
                            />
                            <div>
                              <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                                <span>{item.icon}</span> {item.name}
                              </span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                                Target Station: <span className="font-bold text-slate-700 dark:text-slate-300">{item.station}</span>
                              </span>
                            </div>
                          </div>

                          {item.checked && (
                            <div className="flex items-center gap-3">
                              <select
                                value={item.size}
                                onChange={(e) => updateItemSize(item.id, e.target.value)}
                                className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                              >
                                {cat === 'Pizza' ? (
                                  <>
                                    <option value="Small (9&quot;)">Small (9")</option>
                                    <option value="Medium (12&quot;)">Medium (12")</option>
                                    <option value="Large (15&quot;)">Large (15")</option>
                                  </>
                                ) : cat === 'Beverages' ? (
                                  <>
                                    <option value="500ml">500ml</option>
                                    <option value="1.5L">1.5L Bottle</option>
                                    <option value="Regular Glass">Regular Glass</option>
                                  </>
                                ) : (
                                  <>
                                    <option value="Small">Small Portion</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Large">Large</option>
                                    <option value="Regular">Regular</option>
                                  </>
                                )}
                              </select>

                              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-0.5">
                                <button
                                  type="button"
                                  onClick={() => updateItemQty(item.id, -1)}
                                  className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="font-black text-xs px-1.5">{item.qty}</span>
                                <button
                                  type="button"
                                  onClick={() => updateItemQty(item.id, 1)}
                                  className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowOrderSimulatorModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-md shadow-orange-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="h-4 w-4" /> Place Order #{nextOrderNumCounter} via Mobile App
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Self-Assessment Portal Login Modal */}
      {showStaffLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-orange-600 text-white shadow-md shadow-orange-600/20">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Staff Self-Assessment Portal</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Authentication required to fill skill profile</p>
                </div>
              </div>
              <button
                onClick={() => setShowStaffLoginModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleStaffLogin} className="space-y-4 text-xs">
              {loginErrorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-500/10 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 text-xs font-bold">
                  {loginErrorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Staff Member ID / Name
                </label>
                <input
                  type="text"
                  list="staff-members-datalist"
                  value={loginStaffInput}
                  onChange={(e) => setLoginStaffInput(e.target.value)}
                  placeholder="Type staff member name or ID..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden text-xs"
                />
                <datalist id="staff-members-datalist">
                  {data.staff.map((s) => (
                    <option key={s.id} value={`${s.name} — (${s.assigned_station})`} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Staff Passcode / Security PIN
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={loginPasscode}
                    onChange={(e) => setLoginPasscode(e.target.value)}
                    placeholder="Enter 4-digit passcode (e.g. 1234)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden pr-10"
                  />
                  <Key className="h-4 w-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowStaffLoginModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-md shadow-orange-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="h-4 w-4" /> Authenticate & Open Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Skill Self-Assessment Modal */}
      {showSelfAssessmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full p-6 space-y-5 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Kitchen Staff Skill Self-Assessment</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Assess your cooking proficiencies, station preferences & skill gap requests</p>
                </div>
              </div>
              <button
                onClick={() => setShowSelfAssessmentModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {assessmentSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span>{assessmentSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleAssessmentSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Staff Member
                  </label>
                  <input
                    type="text"
                    list="staff-form-datalist"
                    value={formData.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      const selected = data.staff.find(s =>
                        s.name.toLowerCase() === val.toLowerCase() ||
                        val.toLowerCase().includes(s.name.toLowerCase())
                      );
                      if (selected) {
                        setFormData({
                          ...formData,
                          staffId: selected.id,
                          name: selected.name,
                          assigned_station: selected.assigned_station,
                          skill_level: selected.skill_level,
                          efficiency_rating: selected.efficiency_rating,
                          skill_gap: selected.skill_gap,
                          training_request: selected.training_recommendation
                        });
                      } else {
                        setFormData({
                          ...formData,
                          name: val
                        });
                      }
                    }}
                    placeholder="Type staff member name or select from list..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden text-xs"
                  />
                  <datalist id="staff-form-datalist">
                    {data.staff.map((s) => (
                      <option key={s.id} value={`${s.name} — ${s.assigned_station}`} />
                    ))}
                  </datalist>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Assigned Station / Primary Bay
                    </label>
                    <select
                      value={formData.assigned_station}
                      onChange={(e) => setFormData({ ...formData, assigned_station: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    >
                      <option value="Hot Kitchen">Hot Kitchen</option>
                      <option value="Grill">Grill</option>
                      <option value="Cold Salad">Cold Salad</option>
                      <option value="Pizza">Pizza</option>
                      <option value="Fryer">Fryer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Self-Assessed Skill Level
                    </label>
                    <select
                      value={formData.skill_level}
                      onChange={(e) => setFormData({ ...formData, skill_level: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    >
                      <option value="Trainee (Level 1)">Trainee (Level 1)</option>
                      <option value="Intermediate (Level 2)">Intermediate (Level 2)</option>
                      <option value="Intermediate (Level 3)">Intermediate (Level 3)</option>
                      <option value="Expert (Level 4)">Expert (Level 4)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Self-Efficiency Rating ({formData.efficiency_rating}%)
                  </label>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={formData.efficiency_rating}
                    onChange={(e) => setFormData({ ...formData, efficiency_rating: e.target.value })}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Identified Skill Gap
                  </label>
                  <input
                    type="text"
                    value={formData.skill_gap}
                    onChange={(e) => setFormData({ ...formData, skill_gap: e.target.value })}
                    placeholder="e.g. High-Heat Wok Handling & Kottu Speed"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Requested Training Program / Progression Path
                  </label>
                  <textarea
                    rows="2"
                    value={formData.training_request}
                    onChange={(e) => setFormData({ ...formData, training_request: e.target.value })}
                    placeholder="Describe specific modules or mentorship desired..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowSelfAssessmentModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-md shadow-orange-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Save Self-Assessment
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}