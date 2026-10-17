import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, Clock, Flame, Award, AlertTriangle, ArrowRight, ShieldCheck, CheckCircle2,
  TrendingUp, Utensils, X, Lock, LogIn, Key, Smartphone, Coffee, ChefHat, Send,
  CheckSquare, Pizza, Plus, Minus, Hash, Search, Cpu, Sparkles, Database, Layers,
  CheckCheck, Armchair, PackageCheck, RefreshCw, Filter, ArrowUpRight, ShoppingBag, Check, Zap,
  ChevronDown, Bell, Calendar, BarChart2, Target, Sunrise, Sun, Moon, UserPlus, Star, BadgeCheck,
  GraduationCap, BookOpen, Edit3, Trash2, Save
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ReferenceArea } from 'recharts';
import axios from 'axios';
import { DEFAULT_STAFF_30 } from '../data/staffData';

export default function KitchenStaffDashboard({
  isDarkMode,
  currentRole = 'admin',
  refreshTrigger,
  onRefresh,
  onNavigateModule
}) {
  const isAdmin = String(currentRole || '').toLowerCase() === 'admin';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulateLowEfficiency, setSimulateLowEfficiency] = useState(false);
  const [dismissedToast, setDismissedToast] = useState("");
  const [last4HourUpdate, setLast4HourUpdate] = useState("Shift Sync Active (Live Queue Computed)");

  const [directives, setDirectives] = useState([]);
  const [customSurges, setCustomSurges] = useState([]);
  const [resolvedDirectiveIds, setResolvedDirectiveIds] = useState(new Set());

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

  const [upskillingData, setUpskillingData] = useState([]);
  const [upskillProgramFilter, setUpskillProgramFilter] = useState('ALL'); // 'ALL' | 'Supervised Apprenticeship' | 'Targeted Culinary Course' | 'Cross-Station Training' | 'CRITICAL'
  const [upskillStationFilter, setUpskillStationFilter] = useState('ALL');
  const [upskillSearchQuery, setUpskillSearchQuery] = useState('');
  const [upskillPageSize, setUpskillPageSize] = useState(12);
  const [firebaseStatus, setFirebaseStatus] = useState({ connected: true, status: 'connected' });
  const [enrolledPathways, setEnrolledPathways] = useState(() => {
    try {
      const saved = localStorage.getItem('upskilling_enrolled_pathways');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const [isAuditingUpskill, setIsAuditingUpskill] = useState(false);
  const [isSimulatingEfficiencyDrop, setIsSimulatingEfficiencyDrop] = useState(false);
  const [simulatedStaffEmpId, setSimulatedStaffEmpId] = useState('EMP30'); // Trainee Kaveen
  const [staffSearchQuery, setStaffSearchQuery] = useState("");
  const [staffStationFilter, setStaffStationFilter] = useState("all");
  // --- Dynamic Staff Reallocation Rotation & Fair-Share Pool State ---
  const [staffReallocationHistory, setStaffReallocationHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('kds_staff_reallocation_history');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const [candidateRotationOffsets, setCandidateRotationOffsets] = useState({});
  const [proactiveScheduleActive, setProactiveScheduleActive] = useState(false);
  const [proactiveRosterList, setProactiveRosterList] = useState([]);
  const [simulatingSurge, setSimulatingSurge] = useState(false);
  const [simulatingSurgeStation, setSimulatingSurgeStation] = useState(null);
  const [showSurgeModal, setShowSurgeModal] = useState(false);
  const [dismissedSurgeStations, setDismissedSurgeStations] = useState(new Set());
  const [stationSurgeFulfillment, setStationSurgeFulfillment] = useState({}); // { [stationName]: { active: bool, chefName, fromStation, targetStation, reassignedAt, initialCompletedIds: [], fulfilledCount: 0, targetCount: 2, stabilized: bool } }
  const [stabilizedStations, setStabilizedStations] = useState(new Set()); // Set of station names whose workload normalized & returned to normal
  const [showStationSurgeMenu, setShowStationSurgeMenu] = useState(false);
  const [workloadAnalytics, setWorkloadAnalytics] = useState(null);
  const [analyticsViewTab, setAnalyticsViewTab] = useState('daily'); // 'daily' | 'weekly' | 'summary'
  const [stationShiftFilter, setStationShiftFilter] = useState({}); // { [stationName]: 'all' | 'morning' | 'afternoon' | 'night' }

  // --- 3-Day Demand-Driven Staff Allocation State ---
  const [selected3DayTab, setSelected3DayTab] = useState('today'); // 'today' | 'tomorrow' | 'day_after'
  const [demandForecastData, setDemandForecastData] = useState(null);
  const [demandItemSearch, setDemandItemSearch] = useState('');
  const [demandStationFilter, setDemandStationFilter] = useState('all');
  const [showItemPrepTable, setShowItemPrepTable] = useState(true);

  // --- Staff Sub-Tab State & Admin Onboarding State ---
  const [staffSubTab, setStaffSubTab] = useState('directory'); // 'directory' | 'onboard'
  const [adminStaffView, setAdminStaffView] = useState('onboard'); // 'onboard' | 'matrix'

  // Restrict non-admin users to directory view only
  useEffect(() => {
    if (!isAdmin && staffSubTab !== 'directory') {
      setStaffSubTab('directory');
    }
  }, [isAdmin, staffSubTab]);
  const [isSubmittingStaff, setIsSubmittingStaff] = useState(false);
  const [lastAddedStaff, setLastAddedStaff] = useState(null);
  const [newStaffForm, setNewStaffForm] = useState({
    emp_id: '',
    name: '',
    role: 'Chef de Partie (Level 3)',
    base_station: 'Hot Kitchen',
    shift: '07:00 AM - 04:00 PM',
    hot_kitchen: 4,
    grill_station: 3,
    cold_salad: 3,
    pizza_station: 3,
    fryer_station: 3,
    efficiency_rating: 81,
    skill_gap: 'Cold Salad Presentation & Fast Dressing Emulsions',
    training_recommendation: 'Cold Chain Hygiene & Fast Garde Manger Dressing Emulsions',
    career_progression: 'Target: Line Specialist Track (72% Milestones Complete)',
    contact_phone: '+94 77 123 4567',
    join_date: new Date().toISOString().split('T')[0]
  });

  // --- Admin Staff Update Profile & Delete Modal State ---
  const [editingStaff, setEditingStaff] = useState(null);
  const [editStaffForm, setEditStaffForm] = useState({
    emp_id: '',
    name: '',
    role: 'Chef de Partie (Level 3)',
    base_station: 'Hot Kitchen',
    shift: '07:00 AM - 04:00 PM',
    hot_kitchen: 4,
    grill_station: 3,
    cold_salad: 3,
    pizza_station: 3,
    fryer_station: 3,
    efficiency_rating: 85,
    skill_gap: '',
    training_recommendation: '',
    career_progression: '',
    contact_phone: ''
  });
  const [isUpdatingStaff, setIsUpdatingStaff] = useState(false);
  const [deletingStaff, setDeletingStaff] = useState(null);
  const [isDeletingStaff, setIsDeletingStaff] = useState(false);

  const fetchLiveOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await axios.get("http://localhost:8000/api/orders");
      if (res?.data?.orders) {
        setLiveOrders(res.data.orders);
        setLastOrderSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }

      try {
        const trendsRes = await axios.get("http://localhost:8000/api/kitchen/workload-analytics-trends");
        if (trendsRes?.data?.success) {
          setWorkloadAnalytics(trendsRes.data);
        }
      } catch (tErr) { }

      try {
        const upskillRes = await axios.get("http://localhost:8000/api/kitchen/upskilling-recommendations");
        if (upskillRes?.data && Array.isArray(upskillRes.data)) {
          setUpskillingData(upskillRes.data);
        }
      } catch (uErr) {
        // silent fallback
      }
      try {
        const demandRes = await axios.get("http://localhost:8000/api/demand/forecasts");
        if (demandRes?.data) {
          setDemandForecastData(demandRes.data);
        }
      } catch (dErr) { }
      try {
        const metricsRes = await axios.get("http://localhost:8000/api/kitchen/metrics");
        if (metricsRes?.data) {
          setData(prev => {
            if (!prev) return metricsRes.data;
            const reallocatedMap = new Map();
            if (prev.staff) {
              prev.staff.forEach(s => {
                if (s.isReallocated) {
                  reallocatedMap.set(s.id || s.name, s);
                }
              });
            }
            const mergedStaff = (metricsRes.data.staff || []).map(s => {
              const match = reallocatedMap.get(s.id) || reallocatedMap.get(s.name);
              return match ? { ...s, ...match } : s;
            });
            return {
              ...metricsRes.data,
              staff: mergedStaff
            };
          });
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

  // Real-Time Today Order Intake & Meal Period Aggregation (Updates Reactively on Incoming Orders)
  const todayMealStats = useMemo(() => {
    let liveMorning = 0;
    let liveAfternoon = 0;
    let liveEvening = 0;

    liveOrders.forEach(o => {
      const timeStr = o.created_at || "";
      const [hStr, mStr] = timeStr.split(":");
      const h = parseInt(hStr, 10);
      const m = parseInt(mStr, 10) || 0;
      const t = isNaN(h) ? 13 : h + m / 60;
      if (t < 11.5) liveMorning++;
      else if (t < 16.5) liveAfternoon++;
      else liveEvening++;
    });

    const morningBase = 92;
    const afternoonBase = 124;
    const eveningBase = 28;

    const morningTotal = morningBase + liveMorning;
    const afternoonTotal = afternoonBase + liveAfternoon;
    const eveningTotal = eveningBase + liveEvening;
    const totalActualToday = morningTotal + afternoonTotal + eveningTotal;

    const predictedToday = workloadAnalytics?.predicted_daily_orders?.[0]?.predicted_orders || 417;
    const progressPct = Math.min(100, Math.round((totalActualToday / predictedToday) * 100));

    const now = new Date();
    const curTime = now.getHours() + now.getMinutes() / 60;
    const activeShift = curTime < 11.5 ? 'morning' : (curTime < 16.5 ? 'afternoon' : 'evening');

    return {
      totalActualToday,
      predictedToday,
      progressPct,
      activeShift,
      liveTicketsCount: liveOrders.length,
      periods: [
        {
          key: 'morning',
          name: 'Morning',
          shiftLabel: 'Breakfast Shift',
          timeRange: '06:00 – 11:30',
          orders: morningTotal,
          dishes: Math.round(morningTotal * 0.21),
          status: curTime >= 11.5 ? 'Completed' : 'Active Now',
          isCurrent: activeShift === 'morning',
          icon: '🌅',
          popularItems: 'Fresh Berry Smoothie Bowl, Belgian Waffle'
        },
        {
          key: 'afternoon',
          name: 'Afternoon/Lunch',
          shiftLabel: 'Lunch Rush Peak',
          timeRange: '11:30 – 16:30',
          orders: afternoonTotal,
          dishes: Math.round(afternoonTotal * 0.22),
          status: curTime >= 16.5 ? 'Completed' : (curTime >= 11.5 ? 'Active Now' : 'Upcoming'),
          isCurrent: activeShift === 'afternoon',
          icon: '☀️',
          popularItems: 'Chicken Kottu Roti, Salmon Steak, Garden Salad'
        },
        {
          key: 'evening',
          name: 'Evening/Night',
          shiftLabel: 'Dinner & Late Service',
          timeRange: '16:30 – 23:00',
          orders: eveningTotal,
          dishes: Math.round(eveningTotal * 0.24),
          status: curTime >= 16.5 ? 'Active Now' : 'Upcoming',
          isCurrent: activeShift === 'evening',
          icon: '🌙',
          popularItems: 'Prime Beef Sirloin, Woodfired Pizza, Calamari'
        }
      ]
    };
  }, [liveOrders, workloadAnalytics]);

  const handleSimulateQuickOrder = async () => {
    try {
      const res = await axios.post("http://localhost:8000/api/kitchen/simulate-quick-order");
      if (res?.data?.success) {
        setDismissedToast(`⚡ Live incoming order #${res.data.order?.order_number} received (${res.data.order?.items?.[0]?.name})! Real-time intake updated.`);
        setTimeout(() => setDismissedToast(""), 4000);
        await fetchLiveOrders();
      }
    } catch (e) {
      setLiveOrders(prev => [
        {
          id: `ORD-${Date.now().toString().slice(-4)}`,
          order_number: prev.length + 85,
          table_no: "Table 08",
          order_type: "Dine-In",
          items: [{ menu_id: "sim-quick", name: "Chicken Kottu Roti Supreme", quantity: 1, unit_price: 1450 }],
          total_amount_lkr: 1450,
          status: "in_prep",
          created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          target_prep_mins: 8
        },
        ...prev
      ]);
      setDismissedToast("⚡ Live order received! Real-time intake updated.");
      setTimeout(() => setDismissedToast(""), 3500);
    }
  };

  const filteredStaffList = useMemo(() => {
    const list = data?.staff || [];
    return list.filter(m => {
      const q = staffSearchQuery.toLowerCase();
      const matchesSearch = !staffSearchQuery ||
        (m.name && m.name.toLowerCase().includes(q)) ||
        (m.id && m.id.toLowerCase().includes(q)) ||
        (m.assigned_station && m.assigned_station.toLowerCase().includes(q)) ||
        (m.skill_gap && m.skill_gap.toLowerCase().includes(q)) ||
        (m.training_recommendation && m.training_recommendation.toLowerCase().includes(q)) ||
        (m.career_progression && m.career_progression.toLowerCase().includes(q));

      const matchesStation = staffStationFilter === 'all' ||
        (m.assigned_station && m.assigned_station.toLowerCase().includes(staffStationFilter.toLowerCase()));

      return matchesSearch && matchesStation;
    });
  }, [data?.staff, staffSearchQuery, staffStationFilter]);

  const handleApplyProactiveSchedule = async () => {
    try {
      const res = await axios.post("http://localhost:8000/api/kitchen/schedule/proactive");
      if (res?.data?.success) {
        setProactiveScheduleActive(true);
        if (res.data.proactive_roster) setProactiveRosterList(res.data.proactive_roster);
        setDismissedToast("✅ Proactive peak-hour staffing successfully applied across all rush intervals!");
        setTimeout(() => setDismissedToast(""), 4000);
      }
    } catch (err) {
      setProactiveScheduleActive(true);
      setDismissedToast("✅ Proactive peak-hour staffing applied locally.");
      setTimeout(() => setDismissedToast(""), 4000);
    }
  };

  const handleResetProactiveSchedule = async () => {
    try {
      await axios.post("http://localhost:8000/api/kitchen/schedule/reset");
    } catch (e) { }
    setProactiveScheduleActive(false);
    setProactiveRosterList([]);
    setDismissedToast("✅ Roster reset to standard kitchen shift allocation.");
    setTimeout(() => setDismissedToast(""), 3500);
  };

  const computeDerivedStaffMetrics = (scores, role, baseStation) => {
    const avg = ((Number(scores.hot_kitchen) || 3) + 
                 (Number(scores.grill_station) || 3) + 
                 (Number(scores.cold_salad) || 3) + 
                 (Number(scores.pizza_station) || 3) + 
                 (Number(scores.fryer_station) || 3)) / 5.0;
    const eff = Math.min(98, Math.max(55, Math.round(avg * 17.5 + 11.0)));
    
    const stationKeys = ['hot_kitchen', 'grill_station', 'cold_salad', 'pizza_station', 'fryer_station'];
    const minKey = stationKeys.reduce((min, k) => (Number(scores[k]) || 3) < (Number(scores[min]) || 3) ? k : min, stationKeys[0]);
    
    const gapMap = {
      hot_kitchen: {
        gap: "High-Heat Saute & Fast Wok Stir-Fry Control",
        training: "High-Volume Stir-Fry Optimization & Saucier Temperature Control",
        progression: "Target: Line Specialist Track (72% Milestones Complete)"
      },
      grill_station: {
        gap: "HACCP Core Seafood & Meat Temperature Monitoring",
        training: "Seafood Freshness Grading & Quick-Sear Precision Techniques",
        progression: "Target: Grill Master Track (74% Milestones Complete)"
      },
      cold_salad: {
        gap: "Cold Salad Presentation & Fast Dressing Emulsions",
        training: "Cold Chain Hygiene & Fast Garde Manger Dressing Emulsions",
        progression: "Target: Pantry Operations Specialist (70% Milestones Complete)"
      },
      pizza_station: {
        gap: "Wood-Fired Pizza Deck Oven Proofing & Stretch Pacing",
        training: "Wood-Fired Pizza Deck Oven Management & Crust Proofing",
        progression: "Target: Head of Pizza Track (75% Milestones Complete)"
      },
      fryer_station: {
        gap: "Deep Fryer Temperature Recovery & Oil Filtration",
        training: "Foundation Deep Fryer Safety & Continuous Oil Filtering",
        progression: "Target: Fryer Line Lead Track (68% Milestones Complete)"
      }
    };

    let prog = gapMap[minKey]?.progression || "Station Line Lead Track";
    if (role && (role.includes("Head") || role.includes("Level 5"))) {
      prog = "Executive Chef Certification (92% Milestones Complete)";
    } else if (role && (role.includes("Sous") || role.includes("Level 4"))) {
      prog = "Ready for Head Chef Promotion (86% Milestones Complete)";
    } else if (role && role.includes("Trainee")) {
      prog = "Apprentice Onboarding & Basics (35% Completed)";
    }

    return {
      efficiency: eff,
      speedScore: `${Math.min(5.0, Math.round((avg * 0.85 + 0.65) * 10) / 10).toFixed(1)} / 5.0`,
      derivedGap: gapMap[minKey]?.gap || "Line Cooking Fundamentals",
      derivedTraining: gapMap[minKey]?.training || "Enrolled in Foundation Line Cook Safety",
      derivedProgression: prog
    };
  };

  const handleStaffRatingChange = (stationKey, newRating) => {
    setNewStaffForm(prev => {
      const updatedScores = {
        ...prev,
        [stationKey]: newRating
      };
      const derived = computeDerivedStaffMetrics(updatedScores, prev.role, prev.base_station);
      return {
        ...updatedScores,
        efficiency_rating: derived.efficiency,
        skill_gap: derived.derivedGap,
        training_recommendation: derived.derivedTraining,
        career_progression: derived.derivedProgression
      };
    });
  };

  const handlePrefillSampleStaff = (customSample) => {
    const samples = [
      {
        name: "Chef Nuwan Bandara",
        role: "Chef de Partie (Level 3)",
        base_station: "Hot Kitchen",
        shift: "07:00 AM - 04:00 PM",
        hot_kitchen: 5,
        grill_station: 4,
        cold_salad: 2,
        pizza_station: 3,
        fryer_station: 4,
        contact_phone: "+94 77 482 9102"
      },
      {
        name: "Chef Sandun Wickrema",
        role: "Station Line Specialist (Level 3)",
        base_station: "Grill",
        shift: "11:00 AM - 09:30 PM",
        hot_kitchen: 4,
        grill_station: 5,
        cold_salad: 3,
        pizza_station: 2,
        fryer_station: 4,
        contact_phone: "+94 71 839 2011"
      },
      {
        name: "Chef Dilshan Jayawardena",
        role: "Chef de Partie (Level 3)",
        base_station: "Pizza",
        shift: "01:00 PM - 10:00 PM",
        hot_kitchen: 3,
        grill_station: 2,
        cold_salad: 4,
        pizza_station: 5,
        fryer_station: 3,
        contact_phone: "+94 76 991 3840"
      },
      {
        name: "Chef Malsha Weerasinghe",
        role: "Demi Chef de Partie (Level 3)",
        base_station: "Cold Salad",
        shift: "07:00 AM - 04:00 PM",
        hot_kitchen: 3,
        grill_station: 2,
        cold_salad: 5,
        pizza_station: 3,
        fryer_station: 2,
        contact_phone: "+94 72 314 8890"
      }
    ];

    const pick = customSample || samples[Math.floor(Math.random() * samples.length)];
    const derived = computeDerivedStaffMetrics(pick, pick.role, pick.base_station);
    const nextNum = (data?.staff?.length || 30) + 1;
    const generatedId = `EMP${nextNum < 10 ? '0' + nextNum : nextNum}`;

    setNewStaffForm({
      ...pick,
      emp_id: generatedId,
      efficiency_rating: derived.efficiency,
      skill_gap: derived.derivedGap,
      training_recommendation: derived.derivedTraining,
      career_progression: derived.derivedProgression,
      join_date: new Date().toISOString().split('T')[0]
    });

    setDismissedToast(`⚡ Sample chef profile prefilled for ${pick.name}!`);
    setTimeout(() => setDismissedToast(""), 3500);
  };

  const handleResetStaffForm = () => {
    const nextNum = (data?.staff?.length || 30) + 1;
    setNewStaffForm({
      emp_id: `EMP${nextNum < 10 ? '0' + nextNum : nextNum}`,
      name: '',
      role: 'Chef de Partie (Level 3)',
      base_station: 'Hot Kitchen',
      shift: '07:00 AM - 04:00 PM',
      hot_kitchen: 4,
      grill_station: 3,
      cold_salad: 3,
      pizza_station: 3,
      fryer_station: 3,
      efficiency_rating: 81,
      skill_gap: 'Cold Salad Presentation & Fast Dressing Emulsions',
      training_recommendation: 'Cold Chain Hygiene & Fast Garde Manger Dressing Emulsions',
      career_progression: 'Target: Line Specialist Track (72% Milestones Complete)',
      contact_phone: '',
      join_date: new Date().toISOString().split('T')[0]
    });
  };

  const handleRegisterStaff = async (e) => {
    if (e) e.preventDefault();
    if (!newStaffForm.name.trim()) {
      setDismissedToast("⚠️ Please enter the chef's full name to register.");
      setTimeout(() => setDismissedToast(""), 3500);
      return;
    }

    setIsSubmittingStaff(true);
    try {
      const payload = {
        emp_id: newStaffForm.emp_id.trim() || undefined,
        name: newStaffForm.name.trim(),
        role: newStaffForm.role,
        base_station: newStaffForm.base_station,
        shift: newStaffForm.shift,
        hot_kitchen: Number(newStaffForm.hot_kitchen),
        grill_station: Number(newStaffForm.grill_station),
        cold_salad: Number(newStaffForm.cold_salad),
        pizza_station: Number(newStaffForm.pizza_station),
        fryer_station: Number(newStaffForm.fryer_station),
        efficiency_rating: Number(newStaffForm.efficiency_rating),
        skill_gap: newStaffForm.skill_gap,
        training_recommendation: newStaffForm.training_recommendation,
        career_progression: newStaffForm.career_progression,
        contact_phone: newStaffForm.contact_phone
      };

      const res = await axios.post("http://localhost:8000/api/kitchen/staff", payload);
      if (res?.data?.status === 'success' && res.data.staff_member) {
        const newMember = res.data.staff_member;
        setLastAddedStaff(newMember);

        // Update state in data so that Directory, Roster Matrix, and Filters instantly update
        setData(prev => {
          if (!prev) return prev;
          const currStaff = prev.staff || [];
          return {
            ...prev,
            staff: [...currStaff.filter(s => (s.id !== newMember.id && s.emp_id !== newMember.emp_id)), newMember]
          };
        });

        // Also refresh upskilling data from backend if needed
        try {
          const upRes = await axios.get("http://localhost:8000/api/kitchen/upskilling-recommendations");
          if (upRes?.data && Array.isArray(upRes.data)) {
            setUpskillingData(upRes.data);
          }
        } catch (uErr) { }

        setDismissedToast(`🎉 Success: ${newMember.name} (${newMember.emp_id}) onboarded to ${newMember.assigned_station}!`);
        setTimeout(() => setDismissedToast(""), 5000);

        // Re-initialize the form for next entry
        const nextNum = (data?.staff?.length || 30) + 2;
        setNewStaffForm({
          emp_id: `EMP${nextNum < 10 ? '0' + nextNum : nextNum}`,
          name: '',
          role: 'Chef de Partie (Level 3)',
          base_station: 'Hot Kitchen',
          shift: '07:00 AM - 04:00 PM',
          hot_kitchen: 4,
          grill_station: 3,
          cold_salad: 3,
          pizza_station: 3,
          fryer_station: 3,
          efficiency_rating: 81,
          skill_gap: 'Cold Salad Presentation & Fast Dressing Emulsions',
          training_recommendation: 'Cold Chain Hygiene & Fast Garde Manger Dressing Emulsions',
          career_progression: 'Target: Line Specialist Track (72% Milestones Complete)',
          contact_phone: '',
          join_date: new Date().toISOString().split('T')[0]
        });
      }
    } catch (err) {
      console.error("Staff registration failed:", err);
      setDismissedToast("❌ Failed to register staff member. Please check backend connection.");
      setTimeout(() => setDismissedToast(""), 4000);
    } finally {
      setIsSubmittingStaff(false);
    }
  };

  const handleOpenEditStaff = (staffMember) => {
    if (!staffMember) return;
    setEditingStaff(staffMember);
    setEditStaffForm({
      emp_id: staffMember.emp_id || staffMember.id || '',
      name: staffMember.name || '',
      role: staffMember.role || staffMember.skill_level || 'Chef de Partie (Level 3)',
      base_station: staffMember.base_station || staffMember.assigned_station?.split('(')[0]?.trim() || 'Hot Kitchen',
      shift: staffMember.shift || '07:00 AM - 04:00 PM',
      hot_kitchen: Number(staffMember.hot_kitchen || 3),
      grill_station: Number(staffMember.grill_station || 3),
      cold_salad: Number(staffMember.cold_salad || 3),
      pizza_station: Number(staffMember.pizza_station || 3),
      fryer_station: Number(staffMember.fryer_station || 3),
      efficiency_rating: Number(staffMember.efficiency_rating ?? 85),
      skill_gap: staffMember.skill_gap || '',
      training_recommendation: staffMember.training_recommendation || '',
      career_progression: staffMember.career_progression || '',
      contact_phone: staffMember.contact_phone || ''
    });
  };

  const handleSaveEditStaff = async (e) => {
    if (e) e.preventDefault();
    if (!editingStaff) return;
    const targetId = editingStaff.emp_id || editingStaff.id;
    if (!editStaffForm.name.trim()) {
      setDismissedToast("⚠️ Staff member name cannot be blank.");
      setTimeout(() => setDismissedToast(""), 3500);
      return;
    }

    setIsUpdatingStaff(true);
    try {
      const payload = {
        name: editStaffForm.name.trim(),
        role: editStaffForm.role,
        base_station: editStaffForm.base_station,
        assigned_station: editStaffForm.base_station,
        shift: editStaffForm.shift,
        hot_kitchen: Number(editStaffForm.hot_kitchen),
        grill_station: Number(editStaffForm.grill_station),
        cold_salad: Number(editStaffForm.cold_salad),
        pizza_station: Number(editStaffForm.pizza_station),
        fryer_station: Number(editStaffForm.fryer_station),
        efficiency_rating: Number(editStaffForm.efficiency_rating),
        skill_gap: editStaffForm.skill_gap,
        training_recommendation: editStaffForm.training_recommendation,
        career_progression: editStaffForm.career_progression,
        contact_phone: editStaffForm.contact_phone
      };

      const res = await axios.put(`http://localhost:8000/api/kitchen/staff/${targetId}`, payload);
      const updated = res.data?.staff_member || { ...editingStaff, ...payload };

      setData(prev => {
        if (!prev) return prev;
        const updatedStaff = (prev.staff || []).map(s => {
          if ((s.emp_id && s.emp_id === targetId) || (s.id && s.id === targetId) || s.name === editingStaff.name) {
            return { ...s, ...updated };
          }
          return s;
        });
        return { ...prev, staff: updatedStaff };
      });

      setDismissedToast(`✅ Profile for ${updated.name || targetId} successfully updated!`);
      setTimeout(() => setDismissedToast(""), 4500);
      setEditingStaff(null);
    } catch (err) {
      console.error("Failed to update staff profile:", err);
      setDismissedToast("❌ Failed to update staff profile. Please try again.");
      setTimeout(() => setDismissedToast(""), 4000);
    } finally {
      setIsUpdatingStaff(false);
    }
  };

  const handleConfirmDeleteStaff = async () => {
    if (!deletingStaff) return;
    const targetId = deletingStaff.emp_id || deletingStaff.id;
    const targetName = deletingStaff.name || targetId;

    setIsDeletingStaff(true);
    try {
      await axios.delete(`http://localhost:8000/api/kitchen/staff/${targetId}`);

      setData(prev => {
        if (!prev) return prev;
        const filtered = (prev.staff || []).filter(s =>
          s.emp_id !== targetId && s.id !== targetId && s.name !== targetName
        );
        return { ...prev, staff: filtered };
      });

      setDismissedToast(`🗑️ ${targetName} (${targetId}) removed from kitchen workforce.`);
      setTimeout(() => setDismissedToast(""), 4500);
      setDeletingStaff(null);
    } catch (err) {
      console.error("Failed to delete staff member:", err);
      setDismissedToast("❌ Failed to remove staff member. Please check backend connection.");
      setTimeout(() => setDismissedToast(""), 4000);
    } finally {
      setIsDeletingStaff(false);
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

  // Periodic Firebase Realtime Database health-check poll
  useEffect(() => {
    const checkFirebase = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/firebase/status");
        if (res?.data) {
          setFirebaseStatus(res.data);
        }
      } catch (e) {
        setFirebaseStatus({ connected: false, status: 'disconnected' });
      }
    };
    checkFirebase();
    const fbInterval = setInterval(checkFirebase, 15000);
    return () => clearInterval(fbInterval);
  }, []);

  const getStationForDish = (dishName = "") => {
    const nl = (dishName || "").toLowerCase();
    if (nl.includes("pizza") || nl.includes("margherita") || nl.includes("calzone") || nl.includes("diavola") || nl.includes("pepperoni") || nl.includes("garlic pizza")) return "Pizza";
    if (nl.includes("salad") || nl.includes("greens") || nl.includes("avocado") || nl.includes("feta") || nl.includes("bowl") || nl.includes("fruit") || nl.includes("harvest")) return "Cold Salad";
    if (nl.includes("waffle") || nl.includes("dessert") || nl.includes("cake") || nl.includes("pastry") || nl.includes("ice cream") || nl.includes("pancake") || nl.includes("pudding")) return "Dessert";
    if (nl.includes("juice") || nl.includes("tea") || nl.includes("coke") || nl.includes("sprite") || nl.includes("beverage") || nl.includes("coffee") || nl.includes("cola") || nl.includes("smoothie") || nl.includes("shake") || nl.includes("drink")) return "Beverages";
    // Seafood station covers seafood (salmon, cuttlefish, calamari, prawns, crab) as well as general line cooking
    return "Seafood";
  };

  const getStationsForOrder = (ord) => {
    if (!ord) return [];
    const stations = new Set();
    const normalizeStation = (s) => {
      const sl = (s || "").toLowerCase();
      if (sl.includes("pizza")) return "Pizza";
      if (sl.includes("salad") || sl.includes("cold")) return "Cold Salad";
      if (sl.includes("dessert") || sl.includes("pastry") || sl.includes("waffle")) return "Dessert";
      if (sl.includes("beverage") || sl.includes("bar") || sl.includes("juice") || sl.includes("tea") || sl.includes("coffee") || sl.includes("drink")) return "Beverages";
      if (sl.includes("seafood") || sl.includes("fish") || sl.includes("grill") || sl.includes("fryer") || sl.includes("hot") || sl.includes("wok") || sl.includes("main")) return "Seafood";
      return "Seafood";
    };

    if (ord.station_name) {
      stations.add(normalizeStation(ord.station_name));
    }
    (ord.items || []).forEach(it => {
      const st = getStationForDish(it.name);
      if (st) stations.add(st);
    });
    return Array.from(stations);
  };

  const registerStationReassignment = (targetStation, chefName, fromStation) => {
    if (!targetStation) return;
    const cleanTarget = targetStation.replace(" (Reallocated via AI)", "").trim();
    const cleanChef = (chefName || "Chef").split('(')[0].trim();
    const cleanFrom = (fromStation || "Prep Station").replace(" (Reallocated via AI)", "").trim();

    // Snapshot existing completed order IDs for this station
    const existingCompleted = liveOrders
      .filter(o => o.status === 'completed' && getStationsForOrder(o).includes(cleanTarget))
      .map(o => o.id);

    setStationSurgeFulfillment(prev => ({
      ...prev,
      [cleanTarget]: {
        active: true,
        chefName: cleanChef,
        fromStation: cleanFrom,
        targetStation: cleanTarget,
        reassignedAt: Date.now(),
        initialCompletedIds: existingCompleted,
        fulfilledCount: 0,
        targetCount: 2,
        stabilized: false
      }
    }));

    // Remove from stabilized stations so fresh surge tracking begins
    setStabilizedStations(prev => {
      const next = new Set(prev);
      next.delete(cleanTarget);
      return next;
    });
  };

  const triggerStationStabilization = async (targetStation, tracker) => {
    const cleanStation = targetStation.replace(" (Reallocated via AI)", "").trim();
    const chefName = tracker?.chefName || "Assigned Cook";
    const fromStation = tracker?.fromStation || "Prep Station";

    // 1. Mark station as stabilized and active=false
    setStabilizedStations(prev => new Set([...prev, cleanStation]));
    setStationSurgeFulfillment(prev => ({
      ...prev,
      [cleanStation]: {
        ...prev[cleanStation],
        active: false,
        stabilized: true,
        fulfilledCount: Math.max(2, prev[cleanStation]?.fulfilledCount || 2)
      }
    }));

    // 2. Dismiss this station's pop-up alert in dismissedSurgeStations
    setDismissedSurgeStations(prev => new Set([...prev, cleanStation]));

    // 3. Remove directives targeting this station so the 'Reallocate' section/button disappears
    setDirectives(prev => prev.filter(d => d.targetStation !== cleanStation));
    setCustomSurges(prev => prev.filter(d => d.targetStation !== cleanStation));
    setResolvedDirectiveIds(prev => {
      const next = new Set(prev);
      directives.forEach(d => {
        if (d.targetStation === cleanStation || d.stationId === `station-${cleanStation}`) {
          next.add(d.id);
        }
      });
      return next;
    });

    // 4. Return station's card in "Workload & Station Capacity" to normal status
    setData(prev => {
      if (!prev) return prev;
      const updatedStations = (prev.stations || []).map(st => {
        if (st.name === cleanStation) {
          return {
            ...st,
            bottleneck_status: "Smooth Flow",
            load_level: Math.min(st.load_level || 30, 35),
            queue_length: Math.max(0, (st.queue_length || 2) - 2),
            action: `Optimal staffing restored — Workload normalized. ${chefName} returned to ${fromStation}.`,
            surge_alert: null
          };
        }
        return st;
      });

      // Revert staff back to original station
      const updatedStaff = (prev.staff || []).map(s => {
        if (s.name && (s.name.includes(chefName) || chefName.includes(s.name.split('(')[0].trim()))) {
          return {
            ...s,
            assigned_station: fromStation,
            isReallocated: false,
            reallocatedTo: undefined
          };
        }
        return s;
      });

      return {
        ...prev,
        stations: updatedStations,
        staff: updatedStaff
      };
    });

    // 5. Notify backend to normalize station workload & revert staff allocations
    try {
      await axios.post("http://localhost:8000/api/kitchen/normalize-station-workload", {
        station_name: cleanStation
      });
    } catch (apiErr) {
      console.warn("Could not post to /api/kitchen/normalize-station-workload:", apiErr);
    }

    // 6. Real-time toast confirmation
    setDismissedToast(`🎉 Station (${cleanStation}) Workload Normalized! 2 surge orders fulfilled & moved to Completed Orders. Pop-up alert dismissed & ${chefName} returned to ${fromStation}.`);
    setTimeout(() => setDismissedToast(""), 5000);
  };

  const handleFastFulfillStationOrder = async (targetStation) => {
    const cleanStation = targetStation.replace(" (Reallocated via AI)", "").trim();

    // Find an active order for this station in liveOrders
    const candidateOrder = liveOrders.find(o =>
      o.status !== 'completed' &&
      getStationsForOrder(o).includes(cleanStation)
    );

    if (candidateOrder) {
      await handleUpdateOrderStatus(candidateOrder.id, 'completed');
    } else {
      // If no active ticket exists for this station, generate and complete one
      const newCompId = `sim-comp-${cleanStation.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      const cfg = stationSurgeConfigs.find(c => c.station === cleanStation) || stationSurgeConfigs[0];
      const newOrder = {
        id: newCompId,
        order_number: 950 + Math.floor(Math.random() * 40),
        table_no: `Table 0${Math.floor(Math.random() * 8) + 1}`,
        status: "completed",
        order_type: "Dine-In",
        station_name: cleanStation,
        created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        items: [{ name: cfg.defaultDish, quantity: 1, unit_price: 2400 }]
      };

      setLiveOrders(prev => [newOrder, ...prev]);

      const tracker = stationSurgeFulfillment[cleanStation];
      if (tracker && tracker.active && !tracker.stabilized) {
        const nextCount = (tracker.fulfilledCount || 0) + 1;
        setStationSurgeFulfillment(prev => ({
          ...prev,
          [cleanStation]: { ...prev[cleanStation], fulfilledCount: nextCount }
        }));
        if (nextCount >= (tracker.targetCount || 2)) {
          await triggerStationStabilization(cleanStation, tracker);
        }
      }
    }
  };

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

      // Check if this fulfilled order belongs to any station tracking surge reassignment
      if (newStatus === 'completed') {
        const targetOrder = liveOrders.find(o => o.id === orderId);
        if (targetOrder) {
          const affectedStations = getStationsForOrder(targetOrder);
          affectedStations.forEach(stName => {
            const tracker = stationSurgeFulfillment[stName];
            if (tracker && tracker.active && !tracker.stabilized) {
              const nextCount = (tracker.fulfilledCount || 0) + 1;
              setStationSurgeFulfillment(prev => ({
                ...prev,
                [stName]: { ...prev[stName], fulfilledCount: nextCount }
              }));
              if (nextCount >= (tracker.targetCount || 2)) {
                triggerStationStabilization(stName, tracker);
              }
            }
          });
        }
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

  const getStaffForStation = (station) => {
    switch (station) {
      case 'Seafood': return 'Chef Samantha (Lead Seafood Master)';
      case 'Pizza': return 'Chef Amara (Italian Pizza Lead)';
      case 'Cold Salad': return 'Chef Priyantha (Pantry & Salad In-Charge)';
      case 'Dessert': return 'Chef Nimal (Senior Pastry Chef)';
      case 'Beverages':
      default: return 'Beverage & Bar Counter';
    }
  };

  const stationSkillColumnMap = {
    "Seafood": "grill_station",
    "Pizza": "pizza_station",
    "Cold Salad": "cold_salad",
    "Dessert": "hot_kitchen",
    "Beverages": "cold_salad"
  };

  // Dynamically classify staff shift into 'Morning' | 'Afternoon' | 'Night'
  const classifyStaffShift = (shiftStr = "") => {
    if (!shiftStr) return "Morning";
    const s = shiftStr.toLowerCase();

    if (s.includes("morning") || s.includes("breakfast")) return "Morning";
    if (s.includes("night") || s.includes("dinner") || s.includes("late") || s.includes("closing")) return "Night";
    if (s.includes("afternoon") || s.includes("lunch")) return "Afternoon";

    const match = shiftStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      let hour = parseInt(match[1], 10);
      const meridiem = (match[3] || "").toUpperCase();
      if (meridiem === "PM" && hour < 12) hour += 12;
      if (meridiem === "AM" && hour === 12) hour = 0;

      if (hour >= 5 && hour < 10) return "Morning";
      if (hour >= 10 && hour < 15) return "Afternoon";
      return "Night";
    }

    if (s.startsWith("07:") || s.startsWith("08:") || s.startsWith("06:")) return "Morning";
    if (s.startsWith("10:") || s.startsWith("11:") || s.startsWith("12:") || s.startsWith("01:") || s.startsWith("02:")) return "Afternoon";
    return "Night";
  };

  // Dynamic station matching for staff members across base and assigned stations
  const doesStaffBelongToStation = (staffMember, stationName) => {
    if (!staffMember || !stationName) return false;
    const currentAssigned = (staffMember.assigned_station || staffMember.base_station || "").toLowerCase();
    const st = stationName.toLowerCase();

    if (st.includes("hot") && (currentAssigned.includes("hot") || currentAssigned.includes("saute"))) return true;
    if (st.includes("grill") && currentAssigned.includes("grill")) return true;
    if (st.includes("salad") && (currentAssigned.includes("salad") || currentAssigned.includes("cold") || currentAssigned.includes("pantry"))) return true;
    if (st.includes("pizza") && (currentAssigned.includes("pizza") || currentAssigned.includes("deck") || currentAssigned.includes("italian"))) return true;
    if (st.includes("fryer") && (currentAssigned.includes("fryer") || currentAssigned.includes("fast food"))) return true;

    return currentAssigned.includes(st);
  };

  // Identify morning shift staff who are off-duty/free at night and qualified in this station
  const getOffDutyMorningStaffCandidates = (targetStationName, allStaffList = []) => {
    const staffList = allStaffList.length > 0 ? allStaffList : (data?.staff || []);
    const skillCol = stationSkillColumnMap[targetStationName] || "hot_kitchen";

    return staffList.filter(s => {
      // 1. Must have worked in the Morning shift (ends around 16:00/17:00, off-duty at night)
      const shiftCategory = classifyStaffShift(s.shift);
      if (shiftCategory !== "Morning") return false;

      // 2. Check if already called in to this station for night surge
      if (s.isReallocated && (s.reallocatedTo || "").toLowerCase() === targetStationName.toLowerCase()) {
        return false;
      }

      // 3. Must have good skill rating (>= 2 stars)
      const rating = Number(s[skillCol]) || 0;
      return rating >= 2;
    }).map(s => ({
      ...s,
      stationSkillRating: Number(s[skillCol]) || 3,
      cleanName: (s.name || "Chef").split('(')[0].trim()
    })).sort((a, b) => {
      if (b.stationSkillRating !== a.stationSkillRating) {
        return b.stationSkillRating - a.stationSkillRating;
      }
      return (Number(b.efficiency_rating) || 80) - (Number(a.efficiency_rating) || 80);
    });
  };

  // Assign an off-duty morning staff member to relieve a night workload surge
  const handleAssignOffDutyMorningStaff = async (staffCandidate, targetStationName) => {
    const staffName = staffCandidate.name || staffCandidate.cleanName;
    const cleanTo = targetStationName.replace(" (Reallocated via AI)", "").trim();

    registerStationReassignment(cleanTo, staffName, "Off-Duty Morning Shift");

    try {
      await axios.post("http://localhost:8000/api/kitchen/reallocate", {
        staff_name: staffName,
        chef_name: staffName,
        from_station: "Off-Duty (Morning Shift)",
        to_station: cleanTo,
        reason: `Night workload surge on-call relief for ${cleanTo} (${staffCandidate.stationSkillRating || 4}★ skill)`
      });
    } catch (apiErr) {
      console.warn("Backend reallocation call failed, applying client update:", apiErr);
    }

    setData(prev => {
      if (!prev) return prev;
      const updatedStaff = (prev.staff || []).map(s => {
        const match = s.id === staffCandidate.id || s.emp_id === staffCandidate.emp_id || s.name === staffName || s.name.includes(staffCandidate.cleanName);
        if (match) {
          return {
            ...s,
            assigned_station: `${cleanTo} (Reallocated via AI)`,
            isReallocated: true,
            reallocatedTo: cleanTo,
            isOffDutyNightSupport: true,
            originalShift: s.shift,
            originalStation: s.assigned_station || s.base_station || "Morning Shift"
          };
        }
        return s;
      });

      const updatedStations = (prev.stations || []).map(st => {
        if (st.name === cleanTo) {
          return {
            ...st,
            active_cooks: (st.active_cooks || 2) + 1,
            bottleneck_status: "Relieved — Off-Duty Morning Staff Assigned",
            action: `Night rush relief active — ${staffCandidate.cleanName} called in from morning shift (${staffCandidate.stationSkillRating || 4}★ skill)`
          };
        }
        return st;
      });

      return {
        ...prev,
        staff: updatedStaff,
        stations: updatedStations
      };
    });

    setDismissedToast(`🌙 Off-Duty Morning Staff Called In: ${staffCandidate.cleanName} (${staffCandidate.stationSkillRating || 4}★) assigned to ${cleanTo} to support night workload surge!`);
    setTimeout(() => setDismissedToast(""), 5000);
  };

  // Relieve off-duty morning staff member and return them to off-duty status
  const handleRelieveOffDutyMorningStaff = async (staffCandidate, targetStationName) => {
    const staffName = staffCandidate.name || staffCandidate.cleanName;
    const cleanTo = targetStationName.replace(" (Reallocated via AI)", "").trim();

    setData(prev => {
      if (!prev) return prev;
      const updatedStaff = (prev.staff || []).map(s => {
        const match = s.id === staffCandidate.id || s.emp_id === staffCandidate.emp_id || s.name === staffName || s.name.includes(staffCandidate.cleanName);
        if (match) {
          return {
            ...s,
            assigned_station: s.originalStation || s.base_station || "Hot Kitchen",
            isReallocated: false,
            reallocatedTo: undefined,
            isOffDutyNightSupport: false
          };
        }
        return s;
      });

      const updatedStations = (prev.stations || []).map(st => {
        if (st.name === cleanTo) {
          return {
            ...st,
            active_cooks: Math.max(1, (st.active_cooks || 2) - 1),
            action: "Shift normalized. Off-duty staff relieved."
          };
        }
        return st;
      });

      return {
        ...prev,
        staff: updatedStaff,
        stations: updatedStations
      };
    });

    setDismissedToast(`✅ ${staffCandidate.cleanName || 'Chef'} relieved and returned to off-duty status.`);
    setTimeout(() => setDismissedToast(""), 4000);
  };

  // Real-time automated observer: detects when 2 orders are fulfilled & moved to 'COMPLETED ORDERS' for reassigned stations
  useEffect(() => {
    Object.entries(stationSurgeFulfillment).forEach(([stName, tracker]) => {
      if (!tracker?.active || tracker?.stabilized) return;

      const completedOrdersForStation = liveOrders.filter(o =>
        o.status === 'completed' &&
        getStationsForOrder(o).includes(stName) &&
        !clearedCompletedIds.has(o.id)
      );

      const newlyCompleted = completedOrdersForStation.filter(
        o => !tracker.initialCompletedIds?.includes(o.id)
      );

      const count = newlyCompleted.length;
      if (count !== tracker.fulfilledCount) {
        setStationSurgeFulfillment(prev => ({
          ...prev,
          [stName]: { ...prev[stName], fulfilledCount: count }
        }));
      }

      if (count >= (tracker.targetCount || 2)) {
        triggerStationStabilization(stName, tracker);
      }
    });
  }, [liveOrders, stationSurgeFulfillment, clearedCompletedIds]);

  const filteredOrders = liveOrders.filter(ord => {
    const matchesSearch = !kdsSearchQuery ||
      ord.order_number?.toString().includes(kdsSearchQuery) ||
      ord.table_no?.toLowerCase().includes(kdsSearchQuery.toLowerCase()) ||
      ord.items?.some(i => i.name.toLowerCase().includes(kdsSearchQuery.toLowerCase()));

    const orderStations = getStationsForOrder(ord);
    const matchesStation = kdsStationFilter === 'all' ||
      orderStations.includes(kdsStationFilter) ||
      (ord.station_name && ord.station_name.toLowerCase().includes(kdsStationFilter.toLowerCase()));

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
      { id: "station-1", name: "Seafood", baseShift: 3.0, targetPrep: 10.0, defaultCooks: 2, thresh: 20.0 },
      { id: "station-2", name: "Pizza", baseShift: 0.0, targetPrep: 7.0, defaultCooks: 3, thresh: 16.3 },
      { id: "station-3", name: "Cold Salad", baseShift: 0.0, targetPrep: 4.0, defaultCooks: 1, thresh: 17.6 },
      { id: "station-4", name: "Dessert", baseShift: 1.0, targetPrep: 6.0, defaultCooks: 1, thresh: 15.0 },
      { id: "station-5", name: "Beverages", baseShift: 1.0, targetPrep: 4.0, defaultCooks: 1, thresh: 25.0 }
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
      const rawLoadPercentage = actualLoad > 0 ? Math.min(100, Math.round((actualLoad / cfg.thresh) * 80)) : 0;
      const isStabilized = stabilizedStations.has(cfg.name);
      const isBottleneck = !isStabilized && (actualLoad >= cfg.thresh || liveQueue >= 6);
      const loadPercentage = isStabilized ? Math.min(rawLoadPercentage, 35) : rawLoadPercentage;

      // Avg prep time dynamically stretches with queue pressure
      const dynamicPrep = Number((cfg.targetPrep + (isStabilized ? 0 : liveQueue * 0.45)).toFixed(1));

      // Active cooks (preserve any reallocation updates from existingStation)
      const activeCooks = existingStation.active_cooks !== undefined ? existingStation.active_cooks : cfg.defaultCooks;
      const recCooks = isBottleneck ? Math.max(activeCooks + 1, cfg.defaultCooks + 1) : cfg.defaultCooks;

      const status = isStabilized ? "Smooth Flow" : (isBottleneck ? "High Delay Risk" : (loadPercentage > 65 ? "Moderate Load" : "Smooth Flow"));
      const action = isStabilized
        ? `Optimal staffing restored — Workload normalized`
        : (existingStation.action && existingStation.action.includes("reallocated")
          ? existingStation.action
          : (isBottleneck ? `Add +1 Cook to ${cfg.name} due to peak backlog` : `Maintain current ${cfg.name} line staffing`));

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
        queue_length: isStabilized ? Math.min(liveQueue, 1) : liveQueue,
        bottleneck_status: status,
        action: action
      };
    });
  }, [liveOrders, clearedCompletedIds, data?.stations, stabilizedStations]);

  const stationsList = dynamicStations && dynamicStations.length > 0 ? dynamicStations : (data?.stations || []);
  const dynamicActualTotal = Number(stationsList.reduce((acc, s) => acc + (Number(s.actual_load) || 0), 0).toFixed(1));
  const dynamicPredictedTotal = Number(stationsList.reduce((acc, s) => acc + (Number(s.predicted_load) || 0), 0).toFixed(1));

  // Dynamic Real-Time Dish Types Analysis & Skill-Based Staff Reallocation Engine
  const stationDishAnalysis = useMemo(() => {
    const stationNames = ["Seafood", "Pizza", "Cold Salad", "Dessert", "Beverages"];
    const skillCols = {
      "Seafood": "grill_station",
      "Pizza": "pizza_station",
      "Cold Salad": "cold_salad",
      "Dessert": "hot_kitchen",
      "Beverages": "cold_salad"
    };

    const stats = {};
    stationNames.forEach(st => {
      stats[st] = {
        stationName: st,
        pendingDishes: 0,
        activeDishes: 0,
        pendingTickets: 0,
        dishMap: {},
        isOverloaded: false,
        severity: "NORMAL",
        recommendedStaff: [],
        neededStaffCount: 0
      };
    });

    const activeTickets = liveOrders.filter(o => o.status === 'pending' || o.status === 'in_prep');

    activeTickets.forEach(ord => {
      const isPending = ord.status === 'pending';
      const stationsInOrder = new Set();

      (ord.items || []).forEach(it => {
        const qty = it.quantity || 1;
        const dishName = it.name || "Dish";
        const st = getStationForDish(dishName);
        if (stats[st]) {
          stationsInOrder.add(st);
          stats[st].activeDishes += qty;
          if (isPending) {
            stats[st].pendingDishes += qty;
            stats[st].dishMap[dishName] = (stats[st].dishMap[dishName] || 0) + qty;
          }
        }
      });

      if (isPending) {
        stationsInOrder.forEach(st => {
          stats[st].pendingTickets += 1;
        });
      }
    });

    const allStaff = data?.staff || [];
    const staffDirectivesMap = new Map();
    const surgeAlertsList = [];
    const claimedStaffInCycle = new Set();

    stationNames.forEach(st => {
      if (stabilizedStations.has(st)) {
        stats[st].isOverloaded = false;
        stats[st].severity = "NORMAL";
        stats[st].recommendedStaff = [];
        return;
      }
      const stationObj = (dynamicStations || []).find(s => s.name === st) || {};
      const currentCooks = stationObj.active_cooks || (st === "Pizza" ? 3 : (st === "Seafood" ? 2 : 1));
      const pendingCount = stats[st].pendingDishes;
      const ratio = Number((pendingCount / Math.max(1, currentCooks)).toFixed(1));

      // Overload surge condition: e.g. 10 pizza orders arriving at once with 3 cooks
      const isOverloaded = (pendingCount >= 5) || (pendingCount >= 3 && ratio >= 1.4) || (stats[st].pendingTickets >= 4);

      stats[st].currentCooks = currentCooks;
      stats[st].ratio = ratio;
      stats[st].isOverloaded = isOverloaded;

      if (isOverloaded) {
        const neededCooks = pendingCount >= 8 ? 2 : 1;
        stats[st].neededStaffCount = neededCooks;
        stats[st].severity = pendingCount >= 8 ? "CRITICAL" : "HIGH";

        const skillCol = skillCols[st];

        const candidates = [];
        allStaff.forEach(s => {
          const sId = s.id || s.emp_id;
          const sName = s.name || "";
          const assigned = (s.assigned_station || "").toLowerCase();

          // 1. Never reallocate staff already assigned to this station
          if (assigned.includes(st.toLowerCase())) return;
          // 2. Never reallocate staff who are already actively reallocated to another station
          if (s.isReallocated) return;
          // 3. Never double-assign a staff member who was already recommended for another station in this surge cycle
          if (claimedStaffInCycle.has(sId) || claimedStaffInCycle.has(sName) || claimedStaffInCycle.has(sName.split('(')[0].trim())) return;

          const skillScore = Number(s[skillCol]) || 0;
          if (skillScore >= 3) {
            let fromSt = "Seafood";
            for (const sn of stationNames) {
              if (assigned.includes(sn.toLowerCase())) {
                fromSt = sn;
                break;
              }
            }
            const sourcePending = stats[fromSt]?.pendingDishes || 0;
            // If the source station is heavily overloaded, do not strip cooks from it
            if (stats[fromSt]?.isOverloaded && sourcePending >= 4) return;

            const isFloat = sName.toLowerCase().includes("float") || (s.role || "").toLowerCase().includes("float");
            const isExecutive = sName.toLowerCase().includes("head chef") || sName.toLowerCase().includes("senior sous chef") || (s.role || "").toLowerCase().includes("executive");
            const cleanName = sName.split('(')[0].trim();
            const prevAllocs = Number(staffReallocationHistory[sId] || staffReallocationHistory[sName] || staffReallocationHistory[cleanName] || 0);

            // Dynamic Suitability Score:
            // 1. Base skill (weight: 20 per star)
            // 2. Float specialist boost (+18) -> Designated line-balancing floaters
            // 3. Efficiency bonus (efficiency / 10)
            // 4. Source workload penalty (-8 per order)
            // 5. Fair rotation penalty (-30 per previous reallocation) -> automatically cycles through the 30 staff members!
            // 6. Executive protection penalty (-45) -> Prevents Head Chef Kamal & Senior Sous Chef Nimal from being constantly assigned when line chefs are available
            const suitabilityScore = (skillScore * 20)
              + (isFloat ? 18 : 0)
              + ((Number(s.efficiency_rating) || 75) / 10)
              - (sourcePending * 8)
              - (prevAllocs * 30)
              - (isExecutive ? 45 : 0);

            candidates.push({
              staff: s,
              skillScore,
              fromStation: fromSt,
              sourceWorkload: sourcePending,
              efficiency: Number(s.efficiency_rating) || 80,
              isFloat,
              isExecutive,
              suitabilityScore
            });
          }
        });

        candidates.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

        // Apply rotation offset if manager clicked [Rotate Candidate]
        const rotOffset = (candidateRotationOffsets[st] || 0) % Math.max(1, candidates.length);
        const rotatedCandidates = candidates.length > 0
          ? [...candidates.slice(rotOffset), ...candidates.slice(0, rotOffset)]
          : [];

        // Offer up to 2-3 distinct qualified candidates from the real staff dataset
        const displayCount = Math.max(neededCooks, Math.min(3, rotatedCandidates.length));
        const selected = rotatedCandidates.slice(0, displayCount);

        // Claim the primary assigned cooks so other stations in this cycle get DIFFERENT staff!
        selected.slice(0, neededCooks).forEach(c => {
          const sObj = c.staff;
          if (sObj.id || sObj.emp_id) claimedStaffInCycle.add(sObj.id || sObj.emp_id);
          if (sObj.name) {
            claimedStaffInCycle.add(sObj.name);
            claimedStaffInCycle.add(sObj.name.split('(')[0].trim());
          }
        });

        const dishSummary = Object.entries(stats[st].dishMap)
          .map(([name, count]) => `${count}x ${name}`)
          .join(', ') || `${pendingCount}x incoming dishes`;

        stats[st].dishSummary = dishSummary;

        const recommendedStaffItems = selected.map(c => {
          const staffObj = c.staff;
          const staffName = staffObj.name || "Chef";
          const staffId = staffObj.id || staffObj.emp_id;

          const rec = {
            staffId,
            staffName,
            station: st,
            stationName: st,
            targetStation: st,
            currentStation: c.fromStation,
            fromStation: c.fromStation,
            stationSkillScore: c.skillScore,
            skillRating: c.skillScore,
            skillStars: `${c.skillScore}★`,
            skillLevel: staffObj.skill_level || (c.isFloat ? "Float Specialist" : "Station Chef"),
            efficiency: c.efficiency,
            pendingDishes: pendingCount,
            currentCooks,
            reason: `Qualified with ${c.skillScore}★ rating in ${st}; currently assigned to ${c.fromStation} (${c.sourceWorkload} pending orders).`,
            notificationMessage: `🚨 URGENT STATION TRANSFER DIRECTIVE: Report to ${st} Station immediately! High volume surge of ${pendingCount} incoming ${st.toLowerCase()} orders detected. Station currently has only ${currentCooks} cooks assigned. Qualified skill rating: ${c.skillScore}★.`,
            message: `Surge of ${pendingCount} incoming orders detected at ${st}! You have a ${c.skillScore}★ skill rating in ${st}. Reassign now to support the surge.`,
            stationCardMessage: `Surge of ${pendingCount} ${st} orders detected. Recommend reallocating ${staffName} (${c.skillScore}★) from ${c.fromStation} to ${st} to handle the surge.`
          };

          if (staffId) staffDirectivesMap.set(staffId, rec);
          if (staffName) {
            staffDirectivesMap.set(staffName, rec);
            staffDirectivesMap.set(staffName.split('(')[0].trim(), rec);
          }
          return rec;
        });

        stats[st].recommendedStaff = recommendedStaffItems;

        surgeAlertsList.push({
          station: st,
          stationName: st,
          pendingDishes: pendingCount,
          activeDishes: stats[st].activeDishes,
          pendingTickets: stats[st].pendingTickets,
          currentCooks,
          recommendedCooks: currentCooks + recommendedStaffItems.length,
          neededStaffCount: recommendedStaffItems.length,
          ratio,
          dishSummary,
          severity: stats[st].severity,
          recommendedStaff: recommendedStaffItems,
          alertTitle: `🔥 ${st.toUpperCase()} STATION SURGE: ${pendingCount} Incoming Orders (${currentCooks} Cooks Assigned)`,
          alertDescription: `Queue load is ${ratio} dishes/cook. Reallocate ${recommendedStaffItems.length} qualified staff (${recommendedStaffItems.map(s => s.staffName.split('(')[0].trim()).join(', ')}) to ${st} to handle the surge.`
        });
      }
    });

    return {
      stationStats: stats,
      surgeAlerts: surgeAlertsList,
      staffDirectivesMap
    };
  }, [liveOrders, dynamicStations, data?.staff, stabilizedStations, staffReallocationHistory, candidateRotationOffsets]);

  // Dynamic 3-Day Demand-Driven Staff Allocation Engine (Integrated with Demand Forecasting Item-Level Prep Sizing)
  const threeDayStaffAllocationData = useMemo(() => {
    const rawDemandItems = (demandForecastData?.items && demandForecastData.items.length > 0)
      ? demandForecastData.items
      : [
          {
            id: "menu-1",
            name: "Sri Lankan Chicken Rice & Curry",
            category: "Main Course",
            station: "Seafood",
            predicted_demand_today: 120,
            prep_recommendation: 125,
            buffer_quantity: 15,
            price: 1200.0,
            confidence: 94.2,
            trend: "+26%",
            status: "Available"
          },
          {
            id: "menu-2",
            name: "Seafood Fried Rice (Jumbo)",
            category: "Seafood",
            station: "Seafood",
            predicted_demand_today: 85,
            prep_recommendation: 90,
            buffer_quantity: 10,
            price: 1850.0,
            confidence: 91.5,
            trend: "+21%",
            status: "Available"
          },
          {
            id: "menu-3",
            name: "Grilled Atlantic Salmon Steak",
            category: "Seafood",
            station: "Seafood",
            predicted_demand_today: 75,
            prep_recommendation: 82,
            buffer_quantity: 8,
            price: 2850.0,
            confidence: 93.8,
            trend: "+18%",
            status: "Available"
          },
          {
            id: "menu-4",
            name: "Woodfired Margherita Pizza",
            category: "Pizza",
            station: "Pizza",
            predicted_demand_today: 80,
            prep_recommendation: 88,
            buffer_quantity: 10,
            price: 2100.0,
            confidence: 95.4,
            trend: "+15%",
            status: "Available"
          },
          {
            id: "menu-5",
            name: "Cheese & Vegetable Kottu",
            category: "Main Course",
            station: "Seafood",
            predicted_demand_today: 110,
            prep_recommendation: 115,
            buffer_quantity: 12,
            price: 1400.0,
            confidence: 96.0,
            trend: "+25%",
            status: "Available"
          },
          {
            id: "menu-6",
            name: "Creamy Tomato & Basil Pasta",
            category: "Pizza",
            station: "Pizza",
            predicted_demand_today: 45,
            prep_recommendation: 50,
            buffer_quantity: 5,
            price: 1650.0,
            confidence: 89.0,
            trend: "+7%",
            status: "Available"
          },
          {
            id: "menu-7",
            name: "Artisan Garden Harvest Salad",
            category: "Cold Salad",
            station: "Cold Salad",
            predicted_demand_today: 65,
            prep_recommendation: 72,
            buffer_quantity: 8,
            price: 980.0,
            confidence: 92.5,
            trend: "+12%",
            status: "Available"
          },
          {
            id: "menu-8",
            name: "Tropical Fruit Salad with Honey",
            category: "Dessert",
            station: "Dessert",
            predicted_demand_today: 60,
            prep_recommendation: 65,
            buffer_quantity: 8,
            price: 850.0,
            confidence: 93.4,
            trend: "+50%",
            status: "Available"
          },
          {
            id: "menu-9",
            name: "Belgian Berry & Banana Waffle",
            category: "Dessert",
            station: "Dessert",
            predicted_demand_today: 55,
            prep_recommendation: 60,
            buffer_quantity: 6,
            price: 1150.0,
            confidence: 91.0,
            trend: "+14%",
            status: "Available"
          },
          {
            id: "menu-10",
            name: "Fresh Berry Smoothie Bowl",
            category: "Beverages",
            station: "Beverages",
            predicted_demand_today: 70,
            prep_recommendation: 78,
            buffer_quantity: 10,
            price: 850.0,
            confidence: 94.0,
            trend: "+20%",
            status: "Available"
          },
          {
            id: "menu-11",
            name: "Lion Beer & Chilled Beverages",
            category: "Beverages",
            station: "Beverages",
            predicted_demand_today: 65,
            prep_recommendation: 72,
            buffer_quantity: 8,
            price: 750.0,
            confidence: 95.0,
            trend: "+18%",
            status: "Available"
          }
        ];

    const mapCategoryToStation = (item) => {
      if (item.station) return item.station;
      const cat = (item.category || "").toLowerCase();
      const name = (item.name || "").toLowerCase();
      if (cat.includes("pizza") || name.includes("pizza") || cat.includes("italian") || name.includes("pasta")) return "Pizza";
      if (cat.includes("salad") || name.includes("salad") || name.includes("greens")) return "Cold Salad";
      if (cat.includes("dessert") || name.includes("waffle") || name.includes("cake") || name.includes("sweet")) return "Dessert";
      if (cat.includes("beverage") || name.includes("smoothie") || name.includes("beer") || name.includes("juice") || name.includes("tea") || name.includes("coffee") || name.includes("water") || name.includes("cola")) return "Beverages";
      return "Seafood";
    };

    const daysConfig = [
      {
        id: "today",
        key: "today",
        daySinhala: "Today (අද)",
        dayLabel: "Today",
        dateStr: "17 Oct 2026",
        shiftHighlight: "Active Shift • Peak Dinner & Delivery Surge",
        factor: 1.0,
        weather: "Coastal Heavy Rain (24°C)",
        weatherImpact: "+18% comfort meal & delivery surge",
        targetConfidence: "95.1%",
        stationChefs: {
          "Seafood": [
            { name: "Chef Samantha", role: "Lead Seafood Master", shift: "07:00 AM - 04:00 PM", eff: "94%", isLead: true },
            { name: "Chef Nimal", role: "Senior Sous Chef", shift: "03:30 PM - 11:30 PM", eff: "96%", isLead: false },
            { name: "Chef Dilshan", role: "CDP - Grill & Saute", shift: "11:00 AM - 08:30 PM", eff: "91%", isLead: false }
          ],
          "Pizza": [
            { name: "Chef Amara", role: "Italian Pizza Lead", shift: "10:00 AM - 08:30 PM", eff: "93%", isLead: true },
            { name: "Chef Nuwan", role: "Pizza Baker", shift: "02:00 PM - 10:30 PM", eff: "89%", isLead: false }
          ],
          "Cold Salad": [
            { name: "Chef Priyantha", role: "Pantry & Salad In-Charge", shift: "07:00 AM - 04:30 PM", eff: "92%", isLead: true }
          ],
          "Dessert": [
            { name: "Chef Roshan", role: "Senior Pastry Chef", shift: "08:00 AM - 05:00 PM", eff: "90%", isLead: true },
            { name: "Chef Lahiru", role: "Commis I", shift: "03:00 PM - 10:30 PM", eff: "87%", isLead: false }
          ],
          "Beverages": [
            { name: "Chef Tharindu", role: "Beverage Bar Lead", shift: "09:00 AM - 06:00 PM", eff: "88%", isLead: true },
            { name: "Trainee Janith", role: "Bar Prep Assistant", shift: "04:30 PM - 11:30 PM", eff: "85%", isLead: false }
          ]
        }
      },
      {
        id: "tomorrow",
        key: "tomorrow",
        daySinhala: "Tomorrow (හෙට)",
        dayLabel: "Tomorrow",
        dateStr: "18 Oct 2026",
        shiftHighlight: "Weekend Peak Surge • High Reservation Volume",
        factor: 1.16,
        weather: "Monsoon Showers & Evening Breeze",
        weatherImpact: "+24% weekend dine-in & family platters surge",
        targetConfidence: "94.8%",
        stationChefs: {
          "Seafood": [
            { name: "Chef Samantha", role: "Lead Seafood Master", shift: "07:00 AM - 04:00 PM", eff: "94%", isLead: true },
            { name: "Chef Nimal", role: "Senior Sous Chef", shift: "03:00 PM - 11:30 PM", eff: "96%", isLead: false },
            { name: "Chef Dilshan", role: "CDP - Grill & Saute", shift: "11:00 AM - 08:30 PM", eff: "91%", isLead: false },
            { name: "Chef Malith", role: "Commis III", shift: "04:00 PM - 11:30 PM", eff: "86%", isLead: false }
          ],
          "Pizza": [
            { name: "Chef Amara", role: "Italian Pizza Lead", shift: "09:30 AM - 07:30 PM", eff: "93%", isLead: true },
            { name: "Chef Nuwan", role: "Pizza Baker", shift: "01:30 PM - 10:30 PM", eff: "89%", isLead: false },
            { name: "Chef Dinesh", role: "Float Senior", shift: "04:30 PM - 11:00 PM", eff: "92%", isLead: false }
          ],
          "Cold Salad": [
            { name: "Chef Priyantha", role: "Pantry & Salad In-Charge", shift: "07:00 AM - 04:00 PM", eff: "92%", isLead: true },
            { name: "Chef Danushka", role: "Commis I", shift: "02:00 PM - 10:00 PM", eff: "88%", isLead: false }
          ],
          "Dessert": [
            { name: "Chef Roshan", role: "Senior Pastry Chef", shift: "08:00 AM - 05:30 PM", eff: "90%", isLead: true },
            { name: "Chef Sandun", role: "Commis II", shift: "03:30 PM - 11:00 PM", eff: "86%", isLead: false }
          ],
          "Beverages": [
            { name: "Chef Tharindu", role: "Beverage Bar Lead", shift: "09:00 AM - 06:00 PM", eff: "88%", isLead: true },
            { name: "Trainee Kaveen", role: "Bar Prep Assistant", shift: "04:00 PM - 11:30 PM", eff: "84%", isLead: false }
          ]
        }
      },
      {
        id: "day_after",
        key: "day_after",
        daySinhala: "Day After Tomorrow (අනිද්දා)",
        dayLabel: "Day After Tomorrow",
        dateStr: "19 Oct 2026",
        shiftHighlight: "Post-Weekend Normalized Service",
        factor: 0.92,
        weather: "Clear Skies & Sunny Coastal Heat (29°C)",
        weatherImpact: "+16% chilled beverages, salads & light meals",
        targetConfidence: "95.6%",
        stationChefs: {
          "Seafood": [
            { name: "Chef Samantha", role: "Lead Seafood Master", shift: "08:00 AM - 04:30 PM", eff: "94%", isLead: true },
            { name: "Chef Dilshan", role: "CDP - Grill", shift: "02:30 PM - 10:30 PM", eff: "91%", isLead: false },
            { name: "Chef Lahiru", role: "Commis I", shift: "11:00 AM - 07:30 PM", eff: "87%", isLead: false }
          ],
          "Pizza": [
            { name: "Chef Amara", role: "Italian Pizza Lead", shift: "10:30 AM - 08:30 PM", eff: "93%", isLead: true },
            { name: "Chef Chathura", role: "Commis II", shift: "02:00 PM - 10:00 PM", eff: "88%", isLead: false }
          ],
          "Cold Salad": [
            { name: "Chef Anura", role: "Salad Specialist", shift: "07:30 AM - 04:30 PM", eff: "93%", isLead: true }
          ],
          "Dessert": [
            { name: "Chef Nimal", role: "Senior Pastry Chef", shift: "08:00 AM - 05:00 PM", eff: "95%", isLead: true },
            { name: "Chef Roshan", role: "Pastry Line Chef", shift: "01:30 PM - 09:30 PM", eff: "90%", isLead: false }
          ],
          "Beverages": [
            { name: "Chef Tharindu", role: "Beverage Bar Lead", shift: "09:00 AM - 06:00 PM", eff: "88%", isLead: true },
            { name: "Trainee Sachith", role: "Bar Prep Assistant", shift: "02:30 PM - 10:30 PM", eff: "85%", isLead: false }
          ]
        }
      }
    ];

    return daysConfig.map(dayCfg => {
      const dayItems = rawDemandItems.map(item => {
        const station = mapCategoryToStation(item);
        const baseDemand = item.predicted_demand_today || 60;
        const basePrep = item.prep_recommendation || (baseDemand + 5);
        const baseBuffer = item.buffer_quantity || Math.max(3, basePrep - baseDemand);

        const dayDemand = Math.round(baseDemand * dayCfg.factor);
        const dayPrep = Math.round(basePrep * dayCfg.factor);
        const dayBuffer = Math.max(3, dayPrep - dayDemand);

        return {
          ...item,
          station,
          dayDemand,
          dayPrep,
          dayBuffer
        };
      });

      const totalPortionsDemand = dayItems.reduce((acc, it) => acc + it.dayDemand, 0);
      const totalPortionsPrep = dayItems.reduce((acc, it) => acc + it.dayPrep, 0);
      const totalBufferPortions = dayItems.reduce((acc, it) => acc + it.dayBuffer, 0);

      const stationLoads = {
        "Seafood": { portions: 0, prep: 0, buffer: 0, icon: "🐟", color: "#0284c7" },
        "Pizza": { portions: 0, prep: 0, buffer: 0, icon: "🍕", color: "#ea580c" },
        "Cold Salad": { portions: 0, prep: 0, buffer: 0, icon: "🥗", color: "#059669" },
        "Dessert": { portions: 0, prep: 0, buffer: 0, icon: "🍰", color: "#db2777" },
        "Beverages": { portions: 0, prep: 0, buffer: 0, icon: "🍹", color: "#7c3aed" }
      };

      dayItems.forEach(it => {
        const st = it.station;
        if (stationLoads[st]) {
          stationLoads[st].portions += it.dayDemand;
          stationLoads[st].prep += it.dayPrep;
          stationLoads[st].buffer += it.dayBuffer;
        }
      });

      let totalCooksCount = 0;
      Object.keys(dayCfg.stationChefs).forEach(st => {
        totalCooksCount += dayCfg.stationChefs[st].length;
      });

      return {
        ...dayCfg,
        items: dayItems,
        totalPortionsDemand,
        totalPortionsPrep,
        totalBufferPortions,
        totalCooksCount,
        stationLoads
      };
    });
  }, [demandForecastData]);

  // Dynamic AI Staff Allocation Directives Engine: updates in real-time based on station queues & load surges
  const generateDynamicDirectives = (currentStations = [], currentStaff = [], customSurges = [], resolvedSet = new Set(), dishSurgeAlerts = [], stabilizedSet = new Set()) => {
    const results = [];

    // 0. Top Priority: Real-time Dish Surges from KDS live tickets analysis
    for (const surge of dishSurgeAlerts) {
      const surgeSt = surge.station || surge.stationName || "Pizza";
      if (stabilizedSet.has(surgeSt)) continue; // Automatically skip stabilized stations

      for (const rec of (surge.recommendedStaff || [])) {
        const staffCleanName = (rec.staffName || "Chef").split('(')[0].trim();
        const dirId = `dir-dish-surge-${surgeSt}-${rec.staffId || staffCleanName}`;
        if (!resolvedSet.has(dirId)) {
          results.push({
            id: dirId,
            stationId: `station-${surgeSt}`,
            priority: "CRITICAL",
            title: surge.alertTitle,
            actionText: `Reassign ${staffCleanName} (${rec.stationSkillScore || rec.skillRating || 4}★ skill) from ${rec.currentStation || rec.fromStation || "Prep Station"} to ${surgeSt} to handle surge of ${surge.pendingDishes} incoming orders.`,
            targetStaff: staffCleanName,
            fromStation: rec.currentStation || rec.fromStation || "Prep Station",
            targetStation: surgeSt,
            mitigatedLoad: 50,
            mitigatedQueue: 2,
            resolved: false,
            isDishSurge: true,
            dishSummary: surge.dishSummary,
            staffScore: rec.stationSkillScore || rec.skillRating || 4
          });
        }
      }
    }

    // Next append active custom surges
    for (const d of customSurges) {
      if (stabilizedSet.has(d.targetStation)) continue; // Skip stabilized stations
      if (!resolvedSet.has(d.id)) {
        results.push(d);
      }
    }

    // Night Surge Off-Duty Morning Staff Directives
    const isNightRushHour = (todayMealStats?.activeShift === 'evening') || (new Date().getHours() >= 16);
    for (const st of currentStations) {
      if (stabilizedSet.has(st.name)) continue;
      const isBusy = (st.queue_length || 0) >= 2 || (st.load_level || 0) >= 60;
      if (isBusy && isNightRushHour) {
        const offDutyCands = getOffDutyMorningStaffCandidates(st.name, currentStaff);
        if (offDutyCands.length > 0) {
          const topCand = offDutyCands[0];
          const dirId = `dir-night-offduty-${st.name}-${topCand.emp_id || topCand.cleanName}`;
          if (!resolvedSet.has(dirId) && !results.some(r => r.id === dirId || r.targetStation === st.name)) {
            results.push({
              id: dirId,
              stationId: st.id || `station-${st.name}`,
              priority: "CRITICAL",
              title: `🌙 NIGHT SURGE ALERT: ${st.name} Queue Surging! Free Off-Duty Staff Available`,
              actionText: `Call in ${topCand.cleanName} (${topCand.stationSkillRating}★ ${st.name} skill, worked morning shift, off-duty tonight) to support ${st.name} night rush.`,
              targetStaff: topCand.name,
              fromStation: "Off-Duty (Morning Shift)",
              targetStation: st.name,
              isNightOffDutySupport: true,
              candidate: topCand,
              mitigatedLoad: 50,
              mitigatedQueue: 2,
              resolved: false
            });
          }
        }
      }
    }

    // Priority sorting of stations: queue_length first, then load_level
    const sortedStations = [...currentStations].sort((a, b) => {
      const qA = a.queue_length || 0;
      const qB = b.queue_length || 0;
      if (qB !== qA) return qB - qA;
      return (b.load_level || 0) - (a.load_level || 0);
    });

    const staffMapping = {
      "Hot Kitchen": {
        staff: "S. Fernando",
        fromStation: "Cold Salad",
        altStaff: "R. Dissanayake",
        altFromStation: "Trainee Pool",
        action: (s, staff, from) => `Reallocate ${staff} from ${from} to Hot Kitchen to clear line queue (${s.avg_prep_time_mins}m avg prep).`
      },
      "Grill": {
        staff: "T. Silva",
        fromStation: "Prep Station",
        altStaff: "M. Wickramasinghe",
        altFromStation: "Fryer",
        action: (s, staff, from) => `Deploy ${staff} from ${from} to Grill station for expedited protein searing & ticket fulfillment.`
      },
      "Pizza": {
        staff: "A. Jayasinghe",
        fromStation: "Line Assembly",
        altStaff: "Chef Isuru",
        altFromStation: "Kitchen Float",
        action: (s, staff, from) => `Assign ${staff} to Pizza station for expedited crust stretching & oven line pacing.`
      },
      "Fryer": {
        staff: "M. Wickramasinghe",
        fromStation: "Apprentice Line",
        altStaff: "T. Silva",
        altFromStation: "Grill",
        action: (s, staff, from) => `Deploy ${staff} from ${from} to Fryer station to run batch frying for crispy cuttlefish & appetizers.`
      },
      "Cold Salad": {
        staff: "S. Fernando",
        fromStation: "Pantry Line",
        altStaff: "R. Dissanayake",
        altFromStation: "Hot Kitchen",
        action: (s, staff, from) => `Assign ${staff} to Cold Salad station to speed up fresh salad bowl assembly & dressing prep.`
      }
    };

    // 1. Generate queue surge / active load directives for busy stations
    for (const st of sortedStations) {
      if (results.length >= 3) break;
      if (stabilizedSet.has(st.name)) continue; // Station workload already normalized

      const q = st.queue_length || 0;
      const load = st.actual_load || 0;
      const loadPct = st.load_level || 0;
      const cfg = staffMapping[st.name] || staffMapping["Hot Kitchen"];

      const isPrimaryAssigned = currentStaff.some(s => s.name?.includes(cfg.staff) && s.assigned_station?.includes(st.name));
      const targetStaff = isPrimaryAssigned ? cfg.altStaff : cfg.staff;
      const fromStation = isPrimaryAssigned ? cfg.altFromStation : cfg.fromStation;

      const dirId = `dir-live-${st.id}-${isPrimaryAssigned ? 'alt' : 'pri'}`;
      if (resolvedSet.has(dirId)) continue;

      if (q >= 3 || loadPct >= 75) {
        results.push({
          id: dirId,
          stationId: st.id,
          priority: "CRITICAL",
          title: `🔥 CRITICAL QUEUE SURGE: Station (${st.name}) has ${q} active tickets queued (${st.avg_prep_time_mins}m avg prep)!`,
          actionText: cfg.action(st, targetStaff, fromStation),
          targetStaff,
          fromStation,
          targetStation: st.name,
          mitigatedLoad: Math.max(35, loadPct - 30),
          mitigatedQueue: Math.max(1, q - 2),
          resolved: false
        });
      } else if (q > 0) {
        results.push({
          id: dirId,
          stationId: st.id,
          priority: q >= 2 ? "HIGH" : "MEDIUM",
          title: `⚡ ACTIVE TICKET FLOW: Station (${st.name}) has ${q} active orders queued (${load} orders shift load).`,
          actionText: cfg.action(st, targetStaff, fromStation),
          targetStaff,
          fromStation,
          targetStation: st.name,
          mitigatedLoad: Math.max(25, loadPct - 20),
          mitigatedQueue: 0,
          resolved: false
        });
      }
    }

    // 2. Line balancing directive if an overloaded station exists alongside an underutilized station
    const busySt = sortedStations.find(s => ((s.queue_length || 0) > 0 || (s.load_level || 0) >= 20) && !stabilizedSet.has(s.name));
    const idleSt = sortedStations.slice().reverse().find(s => (s.queue_length || 0) === 0 && (s.load_level || 0) < 15);

    if (busySt && idleSt && busySt.name !== idleSt.name && results.length < 3) {
      const cfg = staffMapping[busySt.name] || staffMapping["Hot Kitchen"];
      const dirId = `dir-balance-${busySt.id}-${idleSt.id}`;
      if (!resolvedSet.has(dirId)) {
        results.push({
          id: dirId,
          stationId: busySt.id,
          priority: "HIGH",
          title: `⚖️ DYNAMIC LINE BALANCING: ${idleSt.name} is clear (${idleSt.load_level}% load) while ${busySt.name} has active queue.`,
          actionText: `Temporarily reallocate ${cfg.staff} from ${idleSt.name} to ${busySt.name} to balance pass throughput.`,
          targetStaff: cfg.staff,
          targetStation: busySt.name,
          mitigatedLoad: 35,
          mitigatedQueue: 1,
          resolved: false
        });
      }
    }

    // 3. Peak preparation / forward-looking directives based on ML shift rush forecast
    const fallbackDirectives = [
      {
        id: "dir-rush-hotkitchen",
        stationId: "station-1",
        priority: "HIGH",
        title: "⚠️ DINNER RUSH ALERT: Station 1 (Hot Kitchen) requires +1 Cook at 7:00 PM due to 115 projected orders.",
        actionText: "Reallocate S. Fernando from Cold Salad to Hot Kitchen during 7:00 PM - 9:00 PM peak rush window.",
        targetStaff: "S. Fernando",
        fromStation: "Cold Salad",
        targetStation: "Hot Kitchen",
        mitigatedLoad: 50,
        mitigatedQueue: 2,
        resolved: false
      },
      {
        id: "dir-grill-sear",
        stationId: "station-2",
        priority: "HIGH",
        title: "🥩 GRILL & PROTEIN LINE SYNC: Station 2 (Grill) requires +1 Prep Cook for forecasted dinner protein orders (18.2 load).",
        actionText: "Deploy T. Silva to Grill station for expedited steak & seafood sear pacing.",
        targetStaff: "T. Silva",
        fromStation: "Prep Station",
        targetStation: "Grill",
        mitigatedLoad: 45,
        mitigatedQueue: 1,
        resolved: false
      },
      {
        id: "dir-prep-pizza-fryer",
        stationId: "station-4",
        priority: "MEDIUM",
        title: "🍕 PIZZA DECK PREPARATION: Station 4 (Pizza) requires line lead support for 30x forecasted dinner pizza orders.",
        actionText: "Assign A. Jayasinghe to Pizza station for pre-rush dough stretching & deck oven management.",
        targetStaff: "A. Jayasinghe",
        fromStation: "Line Assembly",
        targetStation: "Pizza",
        mitigatedLoad: 40,
        mitigatedQueue: 1,
        resolved: false
      },
      {
        id: "dir-fryer-batch",
        stationId: "station-5",
        priority: "MEDIUM",
        title: "🍤 FRYER BATCH PREP: Station 5 (Fryer) oil temperature recovery and appetizer batching sync.",
        actionText: "Deploy M. Wickramasinghe to Fryer station to pre-portion cuttlefish & samosa baskets.",
        targetStaff: "M. Wickramasinghe",
        fromStation: "Apprentice Pool",
        targetStation: "Fryer",
        mitigatedLoad: 30,
        mitigatedQueue: 1,
        resolved: false
      },
      {
        id: "dir-relief-hotkitchen",
        stationId: "station-1",
        priority: "MEDIUM",
        title: "👨‍🍳 LINE RELIEF SYNC: Station 1 (Hot Kitchen) requires relief line trainee for continuous ticket pass.",
        actionText: "Deploy R. Dissanayake to Hot Kitchen line as relief cook for high-volume wok handling.",
        targetStaff: "R. Dissanayake",
        fromStation: "Trainee Pool",
        targetStation: "Hot Kitchen",
        mitigatedLoad: 40,
        mitigatedQueue: 1,
        resolved: false
      }
    ];

    for (const fb of fallbackDirectives) {
      if (results.length >= 3) break;
      if (stabilizedSet.has(fb.targetStation)) continue; // Skip stabilized stations
      if (!resolvedSet.has(fb.id) && !results.some(r => r.id === fb.id || r.targetStation === fb.targetStation)) {
        results.push(fb);
      }
    }

    return results.slice(0, 3);
  };

  // Dynamically auto-update directives whenever stationsList, staff, custom surges, resolved directives, dish surges, or stabilized stations change
  useEffect(() => {
    const dyn = generateDynamicDirectives(
      stationsList,
      data?.staff || [],
      customSurges,
      resolvedDirectiveIds,
      stationDishAnalysis?.surgeAlerts || [],
      stabilizedStations
    );
    setDirectives(dyn);
  }, [stationsList, customSurges, resolvedDirectiveIds, data?.staff, stationDishAnalysis?.surgeAlerts, stabilizedStations]);

  // Auto-pop up alert modal as soon as high volume of orders arrives for ANY station/category
  useEffect(() => {
    if (stationDishAnalysis?.surgeAlerts?.length > 0) {
      const hasUndismissed = stationDishAnalysis.surgeAlerts.some(
        a => !dismissedSurgeStations.has(a.station || a.stationName) && !stabilizedStations.has(a.station || a.stationName)
      );
      if (hasUndismissed) {
        setShowSurgeModal(true);
      } else {
        setShowSurgeModal(false);
      }
    } else {
      setShowSurgeModal(false);
    }
  }, [stationDishAnalysis?.surgeAlerts, dismissedSurgeStations, stabilizedStations]);

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

      try {
        const trendsRes = await axios.get("http://localhost:8000/api/kitchen/workload-analytics-trends");
        if (trendsRes?.data?.success) {
          setWorkloadAnalytics(trendsRes.data);
        }
      } catch (trendErr) {
        console.warn("⚠️ Workload analytics trends endpoint offline, using local model:", trendErr);
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
        staff: DEFAULT_STAFF_30,
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

  const handleExecuteDirective = async (directive) => {
    // If this is a night surge off-duty morning staff directive, assign via dedicated off-duty handler
    if (directive.isNightOffDutySupport && directive.candidate) {
      await handleAssignOffDutyMorningStaff(directive.candidate, directive.targetStation);
      setDirectives(prev => prev.filter(d => d.id !== directive.id));
      setResolvedDirectiveIds(prev => new Set([...prev, directive.id]));
      return;
    }

    // 1. Register station reassignment for automated 2-order fulfillment tracking
    registerStationReassignment(directive.targetStation, directive.targetStaff, directive.fromStation || "Cold Salad");

    // 2. Mark this directive as in-progress fulfillment
    setDirectives(prev => prev.map(d => d.id === directive.id ? { ...d, inProgressFulfillment: true } : d));

    // 3. Persist reallocation to backend CSV logger
    try {
      await axios.post("http://localhost:8000/api/kitchen/reallocate", {
        chef_name: directive.targetStaff,
        staff_name: directive.targetStaff,
        from_station: directive.fromStation || "Cold Salad",
        to_station: directive.targetStation,
        reason: directive.title
      });
    } catch (apiErr) {
      console.warn("Could not post to /api/kitchen/reallocate:", apiErr);
    }

    // 4. Update stations capacity and staff matrices dynamically
    if (data && data.stations) {
      const updatedStations = data.stations.map(st => {
        if (st.id === directive.stationId || st.name === directive.targetStation) {
          const currentCooks = st.active_cooks || 2;
          return {
            ...st,
            active_cooks: currentCooks + 1,
            bottleneck_status: "Relieved — Extra Cook Assigned",
            action: `Optimal staffing restored — ${directive.targetStaff} reallocated based on skill matching`
          };
        }
        return st;
      });

      const updatedStaff = (data.staff || []).map(s => {
        if (s.name && s.name.includes(directive.targetStaff)) {
          return {
            ...s,
            assigned_station: `${directive.targetStation} (Reallocated via AI)`,
            isReallocated: true,
            reallocatedTo: directive.targetStation
          };
        }
        return s;
      });

      setData(prev => ({
        ...prev,
        stations: updatedStations,
        staff: updatedStaff
      }));
    }

    setDismissedToast(`⚡ Dynamic Reallocation Triggered: ${directive.targetStaff} reassigned to ${directive.targetStation}! Complete 2 orders on KDS to normalize.`);
    setTimeout(() => setDismissedToast(""), 4500);
  };

  const handleSimulateSurge = () => {
    const newId = `dir-surge-${Date.now()}`;
    const newDirective = {
      id: newId,
      stationId: "station-1",
      priority: "CRITICAL",
      title: `🚨 REAL-TIME QUEUE SURGE (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}): Ticket queue at Hot Kitchen surged to 18 tickets!`,
      actionText: "Reallocate S. Fernando from Cold Salad to Hot Kitchen immediately to clear queue overload",
      targetStaff: "S. Fernando",
      targetStation: "Hot Kitchen",
      mitigatedLoad: 50,
      mitigatedQueue: 3,
      resolved: false
    };

    setStabilizedStations(prev => {
      const next = new Set(prev);
      next.delete("Hot Kitchen");
      return next;
    });
    setStationSurgeFulfillment(prev => {
      const next = { ...prev };
      delete next["Hot Kitchen"];
      return next;
    });

    setCustomSurges(prev => [newDirective, ...prev]);

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

  const handleResetDirectives = () => {
    setResolvedDirectiveIds(new Set());
    setCustomSurges([]);
    setStabilizedStations(new Set());
    setStationSurgeFulfillment({});
    setData(prev => {
      if (!prev || !prev.staff) return prev;
      const resetStaff = prev.staff.map(s => ({
        ...s,
        assigned_station: s.assigned_station ? s.assigned_station.replace(" (Reallocated via AI)", "") : s.assigned_station,
        isReallocated: false,
        reallocatedTo: undefined
      }));
      return { ...prev, staff: resetStaff };
    });
    setDismissedToast("✅ Directives & Staff Allocations reset to standard kitchen roster.");
    setTimeout(() => setDismissedToast(""), 3500);
  };

  // Dynamic staff reallocation handler linked with backend
  const handleExecuteStaffReallocation = async (targetStaffName, fromStation, targetStation, reason = "Surge reallocation") => {
    const cleanStaffName = (targetStaffName || "").split('(')[0].trim();
    const cleanFrom = (fromStation || "Prep Station").split('(')[0].replace(" (Reallocated via AI)", "").trim();
    const cleanTo = (targetStation || "Hot Kitchen").trim();

    registerStationReassignment(cleanTo, cleanStaffName, cleanFrom);

    try {
      // 1. Send to backend reallocation endpoint
      await axios.post("http://localhost:8000/api/kitchen/reallocate", {
        staff_name: cleanStaffName,
        from_station: cleanFrom,
        to_station: cleanTo,
        reason: reason
      });
    } catch (err) {
      console.warn("Backend reallocation call failed, applying client-side state update:", err);
    }

    // 2. Update local staff state
    setData(prev => {
      if (!prev || !prev.staff) return prev;
      const updatedStaff = prev.staff.map(member => {
        if (member.name.toLowerCase().includes(cleanStaffName.toLowerCase()) || cleanStaffName.toLowerCase().includes(member.name.toLowerCase())) {
          return {
            ...member,
            assigned_station: `${cleanTo} (Reallocated via AI)`,
            isReallocated: true,
            reallocatedTo: cleanTo,
            originalStation: member.originalStation || cleanFrom
          };
        }
        return member;
      });

      // Update station cook count in local state
      const updatedStations = (prev.stations || []).map(st => {
        if (st.name === cleanTo) {
          return { ...st, active_cooks: (st.active_cooks || 3) + 1 };
        }
        if (st.name === cleanFrom && (st.active_cooks || 3) > 1) {
          return { ...st, active_cooks: Math.max(1, (st.active_cooks || 3) - 1) };
        }
        return st;
      });

      return { ...prev, staff: updatedStaff, stations: updatedStations };
    });

    // Update dynamic reallocation fair-share history so candidate automatically rotates to next staff
    setStaffReallocationHistory(prev => {
      const updated = {
        ...prev,
        [cleanStaffName]: (prev[cleanStaffName] || 0) + 1,
        [targetStaffName]: (prev[targetStaffName] || 0) + 1
      };
      try {
        localStorage.setItem('kds_staff_reallocation_history', JSON.stringify(updated));
      } catch (e) { }
      return updated;
    });

    setDismissedToast(`⚡ Staff Reallocation Executed: ${cleanStaffName} reassigned to ${cleanTo} station! Staff Matrix updated.`);
    setTimeout(() => setDismissedToast(""), 4500);

    // Refresh metrics and orders from backend to sync state
    setTimeout(() => {
      fetchKitchenData();
      fetchLiveOrders();
    }, 600);
  };

  const handleRotateCandidate = (stationName) => {
    setCandidateRotationOffsets(prev => ({
      ...prev,
      [stationName]: (prev[stationName] || 0) + 1
    }));
    setDismissedToast(`🔄 Rotated candidate pool for ${stationName}. Displaying next qualified staff from roster.`);
    setTimeout(() => setDismissedToast(""), 3000);
  };

  const handleRevertStaffStation = async (targetStaffName, originalStation) => {
    const cleanStaffName = (targetStaffName || "").split('(')[0].trim();
    const revertTarget = (originalStation || "Hot Kitchen").replace(" (Reallocated via AI)", "").trim();

    try {
      await axios.post("http://localhost:8000/api/kitchen/reallocate", {
        staff_name: cleanStaffName,
        from_station: "Reallocated",
        to_station: revertTarget,
        reason: "Reverting staff assignment back to home station"
      });
    } catch (err) {
      console.warn("Backend revert call failed:", err);
    }

    setData(prev => {
      if (!prev || !prev.staff) return prev;
      const updatedStaff = prev.staff.map(member => {
        if (member.name.toLowerCase().includes(cleanStaffName.toLowerCase()) || cleanStaffName.toLowerCase().includes(member.name.toLowerCase())) {
          return {
            ...member,
            assigned_station: revertTarget,
            isReallocated: false,
            reallocatedTo: undefined
          };
        }
        return member;
      });
      return { ...prev, staff: updatedStaff };
    });

    setDismissedToast(`✓ Staff Assignment Reverted: ${cleanStaffName} returned to ${revertTarget}.`);
    setTimeout(() => setDismissedToast(""), 3500);

    setTimeout(() => {
      fetchKitchenData();
      fetchLiveOrders();
    }, 600);
  };

  // --- Automated AI Upskilling System Handlers & Calculations ---
  const handleRunUpskillAudit = async () => {
    setIsAuditingUpskill(true);
    try {
      const res = await axios.get("http://localhost:8000/api/kitchen/upskilling-recommendations");
      if (res?.data && Array.isArray(res.data)) {
        setUpskillingData(res.data);
        setDismissedToast(`🤖 Automated AI Audit Complete: ${res.data.length} personalized pathways updated! (<50% Threshold Rules Active)`);
      } else {
        setDismissedToast("🤖 Upskilling recommendations refreshed.");
      }
    } catch (e) {
      console.error("Failed to run upskill audit:", e);
      setDismissedToast("⚠️ Could not refresh upskilling data. Check backend connection.");
    } finally {
      setIsAuditingUpskill(false);
      setTimeout(() => setDismissedToast(""), 4500);
    }
  };

  const handleSimulateEfficiencyDrop = async (targetId = simulatedStaffEmpId || 'EMP30', effScore = 42) => {
    setIsSimulatingEfficiencyDrop(true);
    try {
      const res = await axios.post("http://localhost:8000/api/kitchen/simulate-low-efficiency", {
        emp_id: targetId,
        efficiency_rating: effScore
      });
      if (res.data?.success) {
        if (Array.isArray(res.data.all_recommendations)) {
          setUpskillingData(res.data.all_recommendations);
        }
        // Also update local staff data so UI matrix reflects the dropped efficiency immediately
        setData(prev => {
          if (!prev || !prev.staff) return prev;
          const updatedStaff = prev.staff.map(s => {
            if (s.emp_id === targetId || s.id === targetId) {
              return { ...s, efficiency_rating: effScore };
            }
            return s;
          });
          return { ...prev, staff: updatedStaff };
        });
        setDismissedToast(`🚨 Automated Alert: ${targetId} efficiency dropped to ${effScore}% (< 50% Threshold)! Emergency 3-Month Supervised Apprenticeship triggered.`);
      }
    } catch (e) {
      console.error("Simulation error:", e);
      setDismissedToast("⚠️ Simulation failed. Check backend connection.");
    } finally {
      setTimeout(() => setDismissedToast(""), 5500);
    }
  };

  const handleResetSimulatedEfficiency = async () => {
    setIsSimulatingEfficiencyDrop(false);
    try {
      const res = await axios.post("http://localhost:8000/api/kitchen/reset-simulated-efficiency", {});
      if (res.data?.success) {
        if (Array.isArray(res.data.all_recommendations)) {
          setUpskillingData(res.data.all_recommendations);
        }
        const metricsRes = await axios.get("http://localhost:8000/api/kitchen/metrics");
        if (metricsRes?.data) setData(metricsRes.data);
        setDismissedToast("✅ Efficiency drop simulation reset. Baseline staff efficiency restored.");
      }
    } catch (e) {
      console.error("Reset error:", e);
      setDismissedToast("⚠️ Failed to reset simulation.");
    } finally {
      setTimeout(() => setDismissedToast(""), 4000);
    }
  };

  const handleEnrollUpskillPathway = async (rec) => {
    const enrollId = rec.Enrollment_Id || `${rec.Chef_ID}-${rec.Target_Station}`;
    try {
      await axios.post("http://localhost:8000/api/kitchen/upskilling/enroll", {
        enrollment_id: enrollId,
        chef_id: rec.Chef_ID,
        chef_name: rec.Chef_Name,
        program_title: rec.Program_Title,
        target_station: rec.Target_Station
      });
      const newEntry = {
        enrolledAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'Enrolled & In Progress',
        mentor: rec.Mentor,
        programTitle: rec.Program_Title
      };
      setEnrolledPathways(prev => {
        const updated = { ...prev, [enrollId]: newEntry };
        try {
          localStorage.setItem('upskilling_enrolled_pathways', JSON.stringify(updated));
        } catch (e) { }
        return updated;
      });
      setDismissedToast(`🎉 Success: ${rec.Chef_Name} enrolled in "${rec.Program_Title}"! Mentor: ${rec.Mentor}`);
    } catch (e) {
      console.error("Enrollment error:", e);
      setEnrolledPathways(prev => ({
        ...prev,
        [enrollId]: {
          enrolledAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: 'Enrolled & In Progress',
          mentor: rec.Mentor,
          programTitle: rec.Program_Title
        }
      }));
      setDismissedToast(`🎉 ${rec.Chef_Name} enrolled locally in "${rec.Program_Title}"!`);
    } finally {
      setTimeout(() => setDismissedToast(""), 5000);
    }
  };

  const filteredUpskillingData = useMemo(() => {
    return (upskillingData || []).filter(u => {
      // Program filter
      if (upskillProgramFilter !== 'ALL') {
        if (upskillProgramFilter === 'CRITICAL') {
          if (u.Station_Risk_Level !== 'CRITICAL' && u.Priority !== 'CRITICAL') return false;
        } else if (u.Program_Type !== upskillProgramFilter) {
          return false;
        }
      }
      // Station filter
      if (upskillStationFilter !== 'ALL') {
        const targetClean = (u.Target_Station || '').toLowerCase();
        const filterClean = upskillStationFilter.toLowerCase();
        if (!targetClean.includes(filterClean)) return false;
      }
      // Search query
      if (upskillSearchQuery.trim()) {
        const q = upskillSearchQuery.toLowerCase();
        const nameMatch = (u.Chef_Name || '').toLowerCase().includes(q);
        const idMatch = (u.Chef_ID || '').toLowerCase().includes(q);
        const stationMatch = (u.Target_Station || '').toLowerCase().includes(q);
        const actionMatch = (u.Recommended_Action || '').toLowerCase().includes(q);
        const mentorMatch = (u.Mentor || '').toLowerCase().includes(q);
        const progMatch = (u.Program_Title || '').toLowerCase().includes(q);
        if (!nameMatch && !idMatch && !stationMatch && !actionMatch && !mentorMatch && !progMatch) return false;
      }
      return true;
    });
  }, [upskillingData, upskillProgramFilter, upskillStationFilter, upskillSearchQuery]);

  const upskillStats = useMemo(() => {
    let below50Count = 0;
    let apprenticeshipCount = 0;
    let targetedCourseCount = 0;
    let crossStationCount = 0;
    let criticalCount = 0;

    (upskillingData || []).forEach(u => {
      const score = Number(u.Current_Skill_Score) || 0;
      if (score <= 2.5 || (u.Trigger_Reason || '').includes('< 50%') || (u.Proficiency_Pct && parseInt(u.Proficiency_Pct) < 50)) {
        below50Count++;
      }
      if (u.Program_Type === 'Supervised Apprenticeship') apprenticeshipCount++;
      if (u.Program_Type === 'Targeted Culinary Course') targetedCourseCount++;
      if (u.Program_Type === 'Cross-Station Training') crossStationCount++;
      if (u.Station_Risk_Level === 'CRITICAL' || u.Priority === 'CRITICAL') criticalCount++;
    });

    return {
      total: upskillingData?.length || 0,
      below50Count,
      apprenticeshipCount,
      targetedCourseCount,
      crossStationCount,
      criticalCount,
      enrolledCount: Object.keys(enrolledPathways || {}).length
    };
  }, [upskillingData, enrolledPathways]);

  const stationSurgeConfigs = [
    {
      station: "Pizza",
      icon: "🍕",
      label: "Pizza Station",
      defaultDish: "Artisan Wood-Fired Margherita Pizza",
      badgeColor: "bg-orange-500",
      textColor: "text-orange-600 dark:text-orange-400",
      borderColor: "border-orange-500",
      bgSoft: "bg-orange-50 dark:bg-orange-950/40",
      description: "Woodfired oven pizza orders"
    },
    {
      station: "Hot Kitchen",
      icon: "🍳",
      label: "Hot Kitchen",
      defaultDish: "Chicken Kottu Roti Supreme",
      badgeColor: "bg-red-500",
      textColor: "text-red-600 dark:text-red-400",
      borderColor: "border-red-500",
      bgSoft: "bg-red-50 dark:bg-red-950/40",
      description: "Wok, Kottu & Rice cooking orders"
    },
    {
      station: "Grill",
      icon: "🥩",
      label: "Grill Station",
      defaultDish: "Prime Beef Sirloin Medallion",
      badgeColor: "bg-rose-500",
      textColor: "text-rose-600 dark:text-rose-400",
      borderColor: "border-rose-500",
      bgSoft: "bg-rose-50 dark:bg-rose-950/40",
      description: "Steak & charbroiled grill orders"
    },
    {
      station: "Cold Salad",
      icon: "🥗",
      label: "Cold Salad Station",
      defaultDish: "Cold Avocado Garden Salad",
      badgeColor: "bg-emerald-500",
      textColor: "text-emerald-600 dark:text-emerald-400",
      borderColor: "border-emerald-500",
      bgSoft: "bg-emerald-50 dark:bg-emerald-950/40",
      description: "Fresh bowls, greens & cold salads"
    },
    {
      station: "Fryer",
      icon: "🍤",
      label: "Fryer Station",
      defaultDish: "Crispy Salt & Pepper Calamari",
      badgeColor: "bg-amber-500",
      textColor: "text-amber-600 dark:text-amber-400",
      borderColor: "border-amber-500",
      bgSoft: "bg-amber-50 dark:bg-amber-950/40",
      description: "Deep fryer basket & crispy appetizers"
    }
  ];

  const handleSimulateStationSurge = async (targetStation = "Pizza", count = 10, customDish = null) => {
    try {
      setSimulatingSurge(true);
      setSimulatingSurgeStation(targetStation);
      setShowStationSurgeMenu(false);

      // Un-dismiss and un-stabilize this station so pop-up alert appears
      setDismissedSurgeStations(prev => {
        const next = new Set(prev);
        next.delete(targetStation);
        return next;
      });
      setStabilizedStations(prev => {
        const next = new Set(prev);
        next.delete(targetStation);
        return next;
      });
      setStationSurgeFulfillment(prev => {
        const next = { ...prev };
        delete next[targetStation];
        return next;
      });

      await axios.post("http://localhost:8000/api/kitchen/simulate-dish-surge", {
        station: targetStation,
        order_count: count,
        count: count,
        dish_name: customDish
      });

      setDismissedToast(`🚨 ${targetStation} Surge Simulation: ${count} incoming orders injected! Alert monitoring active.`);
      setTimeout(() => setDismissedToast(""), 5000);

      await fetchLiveOrders();
      await fetchKitchenData();
      setShowSurgeModal(true);
    } catch (err) {
      console.error("Failed to simulate dish surge:", err);
      const cfg = stationSurgeConfigs.find(c => c.station === targetStation) || stationSurgeConfigs[0];
      const dish = customDish || cfg.defaultDish;
      const surgeTickets = Array.from({ length: count }).map((_, i) => ({
        id: `sim-${targetStation.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${i}`,
        order_number: 900 + i,
        table_no: `Table ${(i % 8) + 1}`,
        status: "pending",
        order_type: "Dine-in",
        station_name: targetStation,
        created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        items: [
          { name: dish, quantity: 1, unit_price: 2400 }
        ]
      }));
      setLiveOrders(prev => [...surgeTickets, ...prev]);
      setShowSurgeModal(true);
      setDismissedToast(`⚡ Local Surge Fallback: ${count} ${targetStation} orders added!`);
      setTimeout(() => setDismissedToast(""), 4500);
    } finally {
      setSimulatingSurge(false);
      setSimulatingSurgeStation(null);
    }
  };

  const handleSimulatePizzaSurge = () => handleSimulateStationSurge("Pizza", 10);

  const handleResetSurgeOrders = async () => {
    try {
      await axios.post("http://localhost:8000/api/kitchen/reset-dish-surge");
      await axios.post("http://localhost:8000/api/kitchen/reset-reallocations");
      setLiveOrders(prev => prev.filter(o => !String(o.order_number).startsWith("9") && !String(o.id).includes("sim-")));
      setDismissedSurgeStations(new Set());
      setStabilizedStations(new Set());
      setStationSurgeFulfillment({});
      setShowSurgeModal(false);
      setDismissedToast("✓ All station surge orders and active staff transfers cleared successfully.");
      setTimeout(() => setDismissedToast(""), 3500);
      await fetchLiveOrders();
      await fetchKitchenData();
    } catch (err) {
      console.warn("Reset surge error:", err);
      setLiveOrders(prev => prev.filter(o => !String(o.order_number).startsWith("9") && !String(o.id).includes("sim-")));
      setDismissedSurgeStations(new Set());
      setStabilizedStations(new Set());
      setStationSurgeFulfillment({});
      setShowSurgeModal(false);
      setDismissedToast("✓ Cleared surge tickets locally.");
      setTimeout(() => setDismissedToast(""), 3000);
    }
  };

  const handleResetPizzaSurge = handleResetSurgeOrders;

  const handleDismissSurgeModal = () => {
    if (stationDishAnalysis?.surgeAlerts) {
      setDismissedSurgeStations(prev => {
        const next = new Set(prev);
        stationDishAnalysis.surgeAlerts.forEach(a => next.add(a.station || a.stationName));
        return next;
      });
    }
    setShowSurgeModal(false);
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
            onClick={() => setActiveKitchenTab('kds')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeKitchenTab === 'kds'
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
          >
            <Utensils className="h-4 w-4" />
            <span>Kitchen Display System</span>
          </button>

          <button
            onClick={() => setActiveKitchenTab('workload')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeKitchenTab === 'workload' || activeKitchenTab === 'optimization'
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Workload & Station Capacity</span>
          </button>

          <button
            onClick={() => {
              setActiveKitchenTab('staff');
              setTimeout(() => {
                const el = document.getElementById('staff-optimization-section');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 50);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeKitchenTab === 'staff'
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20 ring-2 ring-emerald-500'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            title="Manage kitchen staff, view skill competencies, update profiles and delete staff"
          >
            <Users className="h-4 w-4" />
            <span>Staff Optimization & Skill Development</span>
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

        {/* Cross-Module Shortcut */}
        {onNavigateModule && (
          <div className="flex items-center pr-2">
            <button
              onClick={() => onNavigateModule('orders')}
              className="hidden lg:flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              <span>Go to Orders & POS</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
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
                  Kitchen Display System Live Tickets
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Real-time kitchen ticket flow from intake to pass • Synced with Orders & POS
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2.5 py-1 rounded bg-[#f0f5f2] dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-[#d1ded5] dark:border-slate-700">
                  {pendingOrders.length + inPrepOrders.length} Cooking / Incoming
                </span>

                {/* Pop-Up Surge Alert Opener Badge (when surge is active) */}
                {stationDishAnalysis?.surgeAlerts?.length > 0 && (
                  <button
                    onClick={() => setShowSurgeModal(true)}
                    className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 cursor-pointer transition-all animate-pulse hover:scale-105 active:scale-95"
                    title="Open Surge Alert modal to inspect overloaded stations and qualified staff reassignments"
                  >
                    <Flame className="h-3.5 w-3.5 animate-bounce" />
                    <span>🚨 View Surge Alert ({stationDishAnalysis.surgeAlerts.length})</span>
                  </button>
                )}

                {/* Clear Surge Button */}
                {(stationDishAnalysis?.surgeAlerts?.length > 0 || liveOrders.some(o => String(o.order_number).startsWith("9") || String(o.id).includes("sim-"))) && (
                  <button
                    onClick={handleResetSurgeOrders}
                    className="px-3 py-1 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950/60 dark:hover:text-rose-300 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 cursor-pointer transition-colors"
                    title="Clear simulated surge orders and reset staff reallocations"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Clear Surge</span>
                  </button>
                )}

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
                {['all', 'Seafood', 'Pizza', 'Cold Salad', 'Dessert', 'Beverages'].map((st) => (
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

            {/* KDS Real-Time Station Dish & Surge Monitor */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <span>Real-Time Dish Volume & Station Load Monitor</span>
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Dynamically categorizes incoming orders by dish type, tracks cooks vs queue ratio, and recommends skilled chefs
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                    Surge Threshold: &gt; 2.5 dishes/cook
                  </span>
                </div>
              </div>

              {/* 5-Station Real-Time Dish Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {[
                  { name: "Seafood", icon: "🐟", label: "Seafood Station" },
                  { name: "Pizza", icon: "🍕", label: "Pizza Station" },
                  { name: "Cold Salad", icon: "🥗", label: "Cold Salad" },
                  { name: "Dessert", icon: "🍰", label: "Dessert Station" },
                  { name: "Beverages", icon: "🍹", label: "Beverages" }
                ].map(stCfg => {
                  const stStats = stationDishAnalysis?.stationStats?.[stCfg.name] || {
                    pendingDishes: 0,
                    activeCooks: 3,
                    isOverloaded: false,
                    ratio: 0
                  };
                  const isOver = stStats.isOverloaded;

                  return (
                    <div
                      key={stCfg.name}
                      className={`p-3 rounded-xl border transition-all ${
                        isOver
                          ? 'bg-rose-50/90 dark:bg-rose-950/50 border-2 border-rose-500 shadow-sm animate-pulse'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                          <span>{stCfg.icon}</span>
                          <span>{stCfg.name}</span>
                        </span>
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase ${
                            isOver
                              ? 'bg-rose-600 text-white'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}
                        >
                          {isOver ? 'Surge Overload' : 'Normal'}
                        </span>
                      </div>

                      <div className="mt-2 flex items-baseline justify-between">
                        <div className="text-xl font-black text-slate-900 dark:text-white">
                          {stStats.pendingDishes} <span className="text-[10px] font-medium text-slate-500">dishes</span>
                        </div>
                        <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          {stStats.activeCooks} {stStats.activeCooks === 1 ? 'cook' : 'cooks'}
                        </div>
                      </div>

                      <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between font-mono">
                        <span>Ratio:</span>
                        <span className={isOver ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                          {stStats.ratio} / cook
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Station Surge Alert Banner with One-Click Staff Reassignment */}
              {stationDishAnalysis?.surgeAlerts?.map((alert, alertIdx) => {
                const targetStation = alert.station || alert.stationName || "Pizza";
                return (
                  <div
                    key={alert.station || alert.stationName || alertIdx}
                    className="p-4 rounded-xl bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-950/60 dark:to-amber-950/40 border-2 border-rose-500 shadow-md space-y-3"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-rose-200 dark:border-rose-900/60 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-rose-600 text-white font-bold animate-bounce">
                          <Flame className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black uppercase text-rose-900 dark:text-rose-200 tracking-wider">
                              🚨 SURGE ALERT: {(targetStation || "PIZZA").toUpperCase()} STATION OVERLOADED ({alert.pendingDishes || 0} Incoming Dishes)
                            </h4>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white">
                              Load Ratio: {alert.ratio} dishes / cook
                            </span>
                          </div>
                          <p className="text-xs text-rose-800 dark:text-rose-300 font-semibold mt-0.5">
                            Incoming dish queue: <span className="font-extrabold">{alert.dishSummary}</span> • Assigned cooks: {alert.currentCooks} (Needs +{alert.neededStaffCount || 1} skilled cooks)
                          </p>
                        </div>
                      </div>

                      {alert.recommendedStaff?.length > 1 && (
                        <button
                          onClick={async () => {
                            for (const cand of alert.recommendedStaff) {
                              await handleExecuteStaffReallocation(
                                cand.staffName,
                                cand.currentStation || cand.fromStation || "Prep Station",
                                targetStation,
                                `Multi-staff surge deployment to ${targetStation}`
                              );
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md cursor-pointer flex items-center gap-1.5 self-start md:self-auto shrink-0 transition-transform active:scale-95"
                        >
                          <Zap className="h-4 w-4" />
                          <span>Reassign All Qualified Staff ({alert.recommendedStaff.length})</span>
                        </button>
                      )}
                    </div>

                    {/* Qualified Candidates Recommendation Cards */}
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                        <span className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                          Qualified Staff Recommended for Immediate Transfer ({alert.recommendedStaff?.length || 0} Options):
                        </span>
                        <button
                          onClick={() => handleRotateCandidate(targetStation)}
                          className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[11px] font-extrabold text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 cursor-pointer flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 self-start sm:self-auto"
                          title="Rotate through other qualified candidates from our real staff dataset"
                        >
                          <RefreshCw className="h-3 w-3 text-purple-600" />
                          <span>Rotate Candidate Pool</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {alert.recommendedStaff?.map((cand, idx) => {
                          const candName = (cand.staffName || "Chef").split('(')[0].trim();
                          const candFrom = cand.currentStation || cand.fromStation || "Prep Station";
                          const candScore = cand.stationSkillScore || cand.skillRating || 4;
                          const isFloat = (cand.staffName || "").toLowerCase().includes("float") || (cand.skillLevel || "").toLowerCase().includes("float");

                          return (
                            <div
                              key={cand.staffId || idx}
                              className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-900/80 shadow-2xs flex flex-col justify-between gap-2.5 hover:border-purple-300 transition-colors"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1.5">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${
                                      isFloat ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                                    }`}>
                                      {isFloat ? 'FL' : 'CH'}
                                    </div>
                                    <span className="text-xs font-black text-slate-900 dark:text-white">
                                      {candName}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shrink-0">
                                    {candScore}★ {targetStation}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                  Base: <span className="font-semibold text-slate-700 dark:text-slate-300">{candFrom}</span> • <span className="text-emerald-700 dark:text-emerald-400 font-bold">{cand.efficiency || 80}% Eff</span>
                                </div>
                                <p className="text-[10px] text-rose-700 dark:text-rose-400 font-semibold line-clamp-2 leading-tight">
                                  {cand.reason}
                                </p>
                              </div>

                              <button
                                onClick={() => handleExecuteStaffReallocation(cand.staffName, candFrom, targetStation, `Direct surge reallocation to ${targetStation}`)}
                                className="w-full px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center justify-center gap-1 transition-transform"
                                title={`Reassign ${candName} from ${candFrom} to ${targetStation}`}
                              >
                                <Zap className="h-3.5 w-3.5" />
                                <span>Reassign to {targetStation}</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
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

      {/* Workload & Station Capacity View */}
      {(activeKitchenTab === 'workload' || activeKitchenTab === 'optimization' || activeKitchenTab === 'all') && (
        <div className="glass-panel p-6 rounded-2xl space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Kitchen Efficiency & Dynamic Staff Optimization</h2>
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
                    {dynamicActualTotal}
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">orders</span>
                  </div>
                </div>
                <div className="text-right border-l border-slate-200 dark:border-slate-800 pl-4">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase">Predicted Total Load</span>
                  <div className="text-xl font-black text-sky-600 dark:text-sky-400">
                    {dynamicPredictedTotal}
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">orders</span>
                  </div>
                </div>
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

          {/* ========================================================================= */}
          {/* 3-MONTH WORKLOAD MONITORING & WEEKLY / DAILY PREDICTIVE ORDER TRENDS       */}
          {/* ========================================================================= */}
          {(() => {
            const defaultWorkloadAnalytics = {
              three_month_analysis: {
                total_days_analyzed: 92,
                date_range: "01 Jan 2026 – 07 Apr 2026",
                total_raw_line_items: 13642,
                total_kitchen_food_dishes: 7223,
                total_period_revenue_lkr: 24960600.0,
                avg_daily_kitchen_dishes: 78.5,
                peak_day_dishes: 163,
                busiest_station: "Seafood (38.5%)",
                station_distribution: {
                  "Seafood": { name: "Seafood Station", dishes: 2840, pct: 38.5, color: "#0284c7", icon: "🐟" },
                  "Pizza": { name: "Pizza Station", dishes: 1850, pct: 25.1, color: "#ea580c", icon: "🍕" },
                  "Cold Salad": { name: "Cold Salad Station", dishes: 1120, pct: 15.2, color: "#059669", icon: "🥗" },
                  "Dessert": { name: "Dessert Station", dishes: 810, pct: 11.0, color: "#db2777", icon: "🍰" },
                  "Beverages": { name: "Beverages", dishes: 750, pct: 10.2, color: "#7c3aed", icon: "🍹" }
                }
              },
              predicted_weekly_orders: {
                expected_total_orders: 3140,
                expected_kitchen_dishes: 582,
                expected_weekly_revenue_lkr: 3698000.0,
                weekly_trend_direction: "UPWARD (+4.8%)",
                weekly_growth_pct: 4.8,
                confidence_level_pct: 94.6,
                confidence_interval: "2,980 – 3,290 orders",
                busiest_projected_day: "Friday (510 orders)",
                recommended_cook_hours_weekly: 336,
                recommended_full_time_cooks: 7,
                station_expected_dishes: {
                  "Seafood": 225,
                  "Pizza": 145,
                  "Cold Salad": 95,
                  "Dessert": 65,
                  "Beverages": 52
                }
              },
              predicted_daily_orders: [
                { day_name: "Today", date: "2026-10-15", formatted_date: "15 Oct", predicted_orders: 417, predicted_kitchen_dishes: 84, revenue_lkr: 497040.0, bar_height_pct: 77, efficiency_rate: "95.1%", top_selling_dish: "Chicken Kottu Roti Supreme", station_lead: "Hot Kitchen", required_cooks: 6, rush_peak: "19:00 Dinner Rush (115 orders/hr)", status: "Active Today" },
                { day_name: "Tomorrow", date: "2026-10-16", formatted_date: "16 Oct", predicted_orders: 465, predicted_kitchen_dishes: 92, revenue_lkr: 562000.0, bar_height_pct: 87, efficiency_rate: "94.8%", top_selling_dish: "Grilled Atlantic Salmon Steak", station_lead: "Grill", required_cooks: 7, rush_peak: "13:00 Lunch Rush (98 orders/hr)", status: "Predicted" },
                { day_name: "Sat", date: "2026-10-17", formatted_date: "17 Oct", predicted_orders: 510, predicted_kitchen_dishes: 108, revenue_lkr: 645000.0, bar_height_pct: 100, efficiency_rate: "95.1%", top_selling_dish: "Prime Beef Sirloin Medallion", station_lead: "Grill & Wok", required_cooks: 9, rush_peak: "19:30 Weekend Dinner Surge (125 orders/hr)", status: "Predicted" },
                { day_name: "Sun", date: "2026-10-18", formatted_date: "18 Oct", predicted_orders: 490, predicted_kitchen_dishes: 102, revenue_lkr: 612400.0, bar_height_pct: 95, efficiency_rate: "93.8%", top_selling_dish: "Artisan Wood-Fired Margherita Pizza", station_lead: "Pizza & Grill", required_cooks: 8, rush_peak: "18:30 Family Dinner Rush (110 orders/hr)", status: "Predicted" },
                { day_name: "Mon", date: "2026-10-19", formatted_date: "19 Oct", predicted_orders: 442, predicted_kitchen_dishes: 89, revenue_lkr: 538900.0, bar_height_pct: 83, efficiency_rate: "95.1%", top_selling_dish: "Belgian Berry & Banana Waffle", station_lead: "Hot Kitchen", required_cooks: 7, rush_peak: "08:30 Sunday Brunch Surge (88 orders/hr)", status: "Predicted" },
                { day_name: "Tue", date: "2026-10-20", formatted_date: "20 Oct", predicted_orders: 380, predicted_kitchen_dishes: 76, revenue_lkr: 440200.0, bar_height_pct: 68, efficiency_rate: "93.8%", top_selling_dish: "Chicken Kottu Roti Supreme", station_lead: "Hot Kitchen", required_cooks: 5, rush_peak: "13:00 Corporate Lunch (75 orders/hr)", status: "Predicted" },
                { day_name: "Wed", date: "2026-10-21", formatted_date: "21 Oct", predicted_orders: 428, predicted_kitchen_dishes: 86, revenue_lkr: 512000.0, bar_height_pct: 79, efficiency_rate: "95.1%", top_selling_dish: "Prime Beef Sirloin Medallion", station_lead: "Grill & Saute", required_cooks: 6, rush_peak: "19:00 Mid-Week Dinner (84 orders/hr)", status: "Predicted" }
              ],
              weekly_order_trends: [
                { week_number: 1, week_label: "Wk 1", period: "01 Jan – 07 Jan", kitchen_dishes: 763, total_orders: 4120, avg_daily_orders: 588.6, wow_growth_pct: 0.0, status: "Historical" },
                { week_number: 2, week_label: "Wk 2", period: "08 Jan – 14 Jan", kitchen_dishes: 626, total_orders: 3380, avg_daily_orders: 482.9, wow_growth_pct: -18.0, status: "Historical" },
                { week_number: 3, week_label: "Wk 3", period: "15 Jan – 21 Jan", kitchen_dishes: 631, total_orders: 3410, avg_daily_orders: 487.1, wow_growth_pct: +0.8, status: "Historical" },
                { week_number: 4, week_label: "Wk 4", period: "22 Jan – 28 Jan", kitchen_dishes: 685, total_orders: 3700, avg_daily_orders: 528.6, wow_growth_pct: +8.6, status: "Historical" },
                { week_number: 5, week_label: "Wk 5", period: "29 Jan – 04 Feb", kitchen_dishes: 652, total_orders: 3520, avg_daily_orders: 502.9, wow_growth_pct: -4.8, status: "Historical" },
                { week_number: 6, week_label: "Wk 6", period: "05 Feb – 11 Feb", kitchen_dishes: 706, total_orders: 3810, avg_daily_orders: 544.3, wow_growth_pct: +8.3, status: "Historical" },
                { week_number: 7, week_label: "Wk 7", period: "12 Feb – 18 Feb", kitchen_dishes: 637, total_orders: 3440, avg_daily_orders: 491.4, wow_growth_pct: -9.8, status: "Historical" },
                { week_number: 8, week_label: "Wk 8", period: "19 Feb – 25 Feb", kitchen_dishes: 652, total_orders: 3520, avg_daily_orders: 502.9, wow_growth_pct: +2.4, status: "Historical" },
                { week_number: 9, week_label: "Wk 9", period: "26 Feb – 04 Mar", kitchen_dishes: 670, total_orders: 3620, avg_daily_orders: 517.1, wow_growth_pct: +2.8, status: "Historical" },
                { week_number: 10, week_label: "Wk 10", period: "05 Mar – 11 Mar", kitchen_dishes: 615, total_orders: 3320, avg_daily_orders: 474.3, wow_growth_pct: -8.2, status: "Historical" },
                { week_number: 11, week_label: "Wk 11", period: "12 Mar – 18 Mar", kitchen_dishes: 590, total_orders: 3190, avg_daily_orders: 455.7, wow_growth_pct: -4.1, status: "Historical" },
                { week_number: 12, week_label: "Wk 12", period: "19 Mar – 25 Mar", kitchen_dishes: 605, total_orders: 3270, avg_daily_orders: 467.1, wow_growth_pct: +2.5, status: "Historical" },
                { week_number: 13, week_label: "Wk 13", period: "26 Mar – 01 Apr", kitchen_dishes: 580, total_orders: 3130, avg_daily_orders: 447.1, wow_growth_pct: -4.1, status: "Historical" },
                { week_number: 14, week_label: "Wk 14", period: "02 Apr – 07 Apr", kitchen_dishes: 560, total_orders: 3020, avg_daily_orders: 431.4, wow_growth_pct: -3.4, status: "Historical" },
                { week_number: 15, week_label: "Wk 15 (Forecast)", period: "Upcoming 7 Days", kitchen_dishes: 582, total_orders: 3140, avg_daily_orders: 448.6, wow_growth_pct: +4.8, status: "Predicted" }
              ],
              day_of_week_seasonality: [
                { day: "Monday", avg_orders: 380, avg_dishes: 76, multiplier: 0.88, note: "Moderate start of week" },
                { day: "Tuesday", avg_orders: 405, avg_dishes: 81, multiplier: 0.94, note: "Steady mid-week lunch" },
                { day: "Wednesday", avg_orders: 428, avg_dishes: 86, multiplier: 0.99, note: "Balanced dining flow" },
                { day: "Thursday", avg_orders: 435, avg_dishes: 87, multiplier: 1.01, note: "Evening dining uptick" },
                { day: "Friday", avg_orders: 510, avg_dishes: 108, multiplier: 1.18, note: "Weekly peak dinner rush" },
                { day: "Saturday", avg_orders: 490, avg_dishes: 102, multiplier: 1.14, note: "High family & takeaway rush" },
                { day: "Sunday", avg_orders: 442, avg_dishes: 89, multiplier: 1.02, note: "Brunch & relaxed dinner" }
              ]
            };

            const wa = workloadAnalytics || defaultWorkloadAnalytics;
            const t3m = wa.three_month_analysis || defaultWorkloadAnalytics.three_month_analysis;
            const predWeek = wa.predicted_weekly_orders || defaultWorkloadAnalytics.predicted_weekly_orders;
            const dailyPreds = wa.predicted_daily_orders || defaultWorkloadAnalytics.predicted_daily_orders;
            const weeklyTrends = wa.weekly_order_trends || defaultWorkloadAnalytics.weekly_order_trends;
            const dowSeasonality = wa.day_of_week_seasonality || defaultWorkloadAnalytics.day_of_week_seasonality;
            const stationDist = t3m.station_distribution || defaultWorkloadAnalytics.three_month_analysis.station_distribution;

            const maxDailyOrders = Math.max(...dailyPreds.map(d => d.predicted_orders || 0), 1);

            return (
              <div className="glass-panel p-6 rounded-2xl space-y-5 border border-emerald-200/80 dark:border-emerald-500/30 bg-gradient-to-br from-emerald-50/30 via-white to-orange-50/20 dark:from-slate-900/95 dark:via-emerald-950/15 dark:to-slate-900/95 shadow-sm">
                
                {/* Section Header with Mode Toggles */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-emerald-100 dark:border-emerald-900/50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25">
                      <BarChart2 className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                          3-Month Workload Analytics & Predictive Order Forecasting
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                          <Database className="h-3 w-3 text-emerald-600" />
                          92 Days Workload CSV Analyzed
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        Historical workload data ({t3m.date_range}) • Weekly order trend calculation & daily demand predictions
                      </p>
                    </div>
                  </div>

                  {/* Mode Selector Tabs */}
                  <div className="flex items-center gap-1.5 bg-[#f0f5f2] dark:bg-slate-800 p-1 rounded-xl border border-[#d1ded5] dark:border-slate-700 self-start lg:self-auto overflow-x-auto no-scrollbar">
                    <button
                      onClick={() => setAnalyticsViewTab('daily')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        analyticsViewTab === 'daily'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Daily Prediction (7 Days)</span>
                    </button>

                    <button
                      onClick={() => setAnalyticsViewTab('weekly')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        analyticsViewTab === 'weekly'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>Weekly Trends & Forecast</span>
                    </button>

                    <button
                      onClick={() => setAnalyticsViewTab('summary')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        analyticsViewTab === 'summary'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Layers className="h-3.5 w-3.5" />
                      <span>3-Month Workload Summary</span>
                    </button>
                  </div>
                </div>

                {/* 4 Summary KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="p-3.5 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase">
                      <span>3-Month Workload Analyzed</span>
                      <span className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-600">92 Days</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                      {t3m.total_raw_line_items?.toLocaleString() || "13,642"}
                      <span className="text-xs font-bold text-slate-500 ml-1.5">items ({t3m.total_kitchen_food_dishes?.toLocaleString() || "7,223"} dishes)</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      Date Range: <span className="font-semibold text-slate-700 dark:text-slate-300">{t3m.date_range}</span>
                    </p>
                  </div>

                  <div className="p-3.5 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase">
                      <span>Historical Daily Average</span>
                      <span className="p-1 rounded-md bg-orange-50 dark:bg-orange-950 text-orange-600">Per Day</span>
                    </div>
                    <div className="text-2xl font-black text-orange-600 dark:text-orange-400 mt-1">
                      {t3m.avg_daily_kitchen_dishes || "78.5"}
                      <span className="text-xs font-bold text-slate-500 ml-1.5">dishes (~425 orders)</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      Peak Historical Day: <span className="font-bold text-rose-600">{t3m.peak_day_dishes || 163} dishes</span>
                    </p>
                  </div>

                  <div className="p-3.5 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase">
                      <span>Expected Orders Per Week</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black">
                        +{predWeek.weekly_growth_pct}% WoW
                      </span>
                    </div>
                    <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                      {predWeek.expected_total_orders?.toLocaleString() || "3,140"}
                      <span className="text-xs font-bold text-slate-500 ml-1.5">orders ({predWeek.expected_kitchen_dishes || 582} dishes)</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      Projected Kitchen Load: <span className="font-bold text-emerald-700 dark:text-emerald-400">~{Math.round((predWeek.expected_kitchen_dishes || 582) / 7)} dishes/day avg</span>
                    </p>
                  </div>

                  <div className="p-3.5 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase">
                      <span>Kitchen Capacity Forecast</span>
                      <span className="p-1 rounded-md bg-purple-50 dark:bg-purple-950 text-purple-600">Model: RF</span>
                    </div>
                    <div className="text-2xl font-black text-purple-700 dark:text-purple-400 mt-1">
                      {predWeek.recommended_full_time_cooks || 7}
                      <span className="text-xs font-bold text-slate-500 ml-1.5">Cooks Required</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      Weekly Cook Hours: <span className="font-bold">{predWeek.recommended_cook_hours_weekly || 336} hrs</span> • {predWeek.confidence_level_pct || "94.6"}% Conf.
                    </p>
                  </div>
                </div>

                {/* VIEW 1: DAILY PREDICTION (7 DAYS) & REAL-TIME TODAY INTAKE */}
                {analyticsViewTab === 'daily' && (
                  <div className="space-y-4 pt-1">
                    {/* Header with Live Status & Test Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                          Daily Workload & Expected Order Breakdown (7 Days):
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          Predictive daily order volume & real-time intake tracking across Morning, Lunch, and Evening meal periods
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSimulateQuickOrder}
                          title="Click to simulate an arriving customer order in real-time"
                          className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] flex items-center gap-1.5 transition-all border border-emerald-300 dark:border-emerald-700 cursor-pointer shadow-2xs hover:scale-102"
                        >
                          <Zap className="h-3 w-3 text-emerald-600 animate-bounce" />
                          <span>+ Simulate Live Incoming Order</span>
                        </button>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          Expected Daily Avg: ~448 orders/day
                        </span>
                      </div>
                    </div>

                    {/* REAL-TIME TODAY INTAKE & MEAL PERIODS BREAKDOWN PANEL */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/8 via-white to-teal-500/8 dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-900 border-2 border-emerald-500/30 dark:border-emerald-600/30 shadow-xs space-y-3.5">
                      {/* Top Row: Live Sync Header & KPI Comparison */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-emerald-200/60 dark:border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
                            <Clock className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                Today's Real-Time Order Intake vs Expected Demand
                              </h5>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black flex items-center gap-1 border border-emerald-300 dark:border-emerald-800">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                                Real-Time Active
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                              Live order stream syncing every 4s • Tracking orders received so far today vs 3-month predicted target
                            </p>
                          </div>
                        </div>

                        {/* Today's Dual Comparison Stats */}
                        <div className="flex items-center gap-3">
                          <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300/80 dark:border-emerald-700/60 shadow-2xs text-right">
                            <div className="text-[10px] uppercase font-bold text-slate-400">Actual Received Today</div>
                            <div className="text-lg font-black text-emerald-700 dark:text-emerald-400 font-mono flex items-center justify-end gap-1">
                              <span>{todayMealStats.totalActualToday}</span>
                              <span className="text-[11px] font-bold text-slate-500 font-sans">orders</span>
                            </div>
                          </div>

                          <div className="text-slate-300 dark:text-slate-700 font-bold text-lg">/</div>

                          <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                            <div className="text-[10px] uppercase font-bold text-slate-400">Predicted Target</div>
                            <div className="text-lg font-black text-slate-800 dark:text-slate-200 font-mono">
                              {todayMealStats.predictedToday} <span className="text-[11px] font-bold text-slate-500 font-sans">orders</span>
                            </div>
                          </div>

                          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 shadow-2xs text-center">
                            <div className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">Fulfillment</div>
                            <div className="text-lg font-black text-emerald-700 dark:text-emerald-400 font-mono">
                              {todayMealStats.progressPct}%
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Overall Today Target Fulfillment Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            Daily Target Fulfillment Progress ({todayMealStats.totalActualToday} of {todayMealStats.predictedToday} expected orders)
                          </span>
                          <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            {todayMealStats.progressPct}% • {Math.round(todayMealStats.totalActualToday * 0.2)} kitchen food dishes cooked
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-700 shadow-xs"
                            style={{ width: `${todayMealStats.progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* 3 MEAL PERIODS BREAKDOWN: Morning, Afternoon/Lunch, Evening/Night */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <Utensils className="h-3 w-3 text-emerald-600" />
                            Meal Period Breakdown (Actual Orders Received):
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            Categorized automatically by order receipt timestamp
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {todayMealStats.periods.map(period => (
                            <div
                              key={period.key}
                              className={`p-3 rounded-xl border transition-all ${
                                period.isCurrent
                                  ? 'bg-white dark:bg-slate-900 border-2 border-emerald-500 ring-2 ring-emerald-500/10 shadow-sm'
                                  : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-base">{period.icon}</span>
                                  <div>
                                    <h6 className="text-xs font-bold text-slate-900 dark:text-white">
                                      {period.name}
                                    </h6>
                                    <span className="text-[10px] text-slate-400 font-medium">{period.timeRange}</span>
                                  </div>
                                </div>
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                    period.status === 'Active Now'
                                      ? 'bg-emerald-600 text-white animate-pulse'
                                      : period.status === 'Completed'
                                      ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                      : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                                  }`}
                                >
                                  {period.status}
                                </span>
                              </div>

                              <div className="mt-2.5 flex items-baseline justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                                <div>
                                  <div className="text-xl font-mono font-black text-slate-900 dark:text-white">
                                    {period.orders}{' '}
                                    <span className="text-[11px] font-semibold text-slate-500 font-sans">orders</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    ~{period.dishes} food dishes prepared
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                                    {Math.round((period.orders / Math.max(1, todayMealStats.totalActualToday)) * 100)}%
                                  </span>
                                  <span className="text-[9px] text-slate-400 block">of day's total</span>
                                </div>
                              </div>

                              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 truncate" title={period.popularItems}>
                                🌟 <span className="font-medium text-slate-600 dark:text-slate-300">{period.popularItems}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Demand-Driven 3-Day Kitchen Staff Allocation & Item-Level Preparation Sizing */}
                    {(() => {
                      const activeDayAllocation = threeDayStaffAllocationData.find(d => d.id === selected3DayTab) || threeDayStaffAllocationData[0];
                      const stationKeys = ["Seafood", "Pizza", "Cold Salad", "Dessert", "Beverages"];
                      
                      const filteredTableItems = (activeDayAllocation?.items || []).filter(item => {
                        const matchesSearch = !demandItemSearch || 
                          item.name.toLowerCase().includes(demandItemSearch.toLowerCase()) ||
                          (item.category && item.category.toLowerCase().includes(demandItemSearch.toLowerCase()));
                        const matchesStation = demandStationFilter === 'all' || item.station === demandStationFilter;
                        return matchesSearch && matchesStation;
                      });

                      return (
                        <div className="space-y-4 pt-2">
                          {/* 3-Day Allocation Header & Day Switcher Tabs */}
                          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/60 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-900 border border-emerald-200/80 dark:border-slate-800 shadow-sm space-y-3">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-sm">
                                    <ChefHat className="h-4 w-4" />
                                  </span>
                                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                    Item-Level Demand Sizing & 3-Day Kitchen Staff Allocation
                                  </h3>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                    Connected to Demand Forecasting
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                                  Exact shift prep sizing, safety buffers, and station chef assignments computed dynamically for <b>Ada (Today)</b>, <b>Heta (Tomorrow)</b>, and <b>Anidda (Day After Tomorrow)</b>.
                                </p>
                              </div>

                              {/* 3-Day Selector Buttons */}
                              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-inner">
                                {threeDayStaffAllocationData.map(dayCfg => {
                                  const isActive = selected3DayTab === dayCfg.id;
                                  return (
                                    <button
                                      key={dayCfg.id}
                                      onClick={() => setSelected3DayTab(dayCfg.id)}
                                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                        isActive
                                          ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20'
                                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/60'
                                      }`}
                                    >
                                      <Calendar className="h-3.5 w-3.5" />
                                      <span>{dayCfg.daySinhala}</span>
                                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                                        isActive ? 'bg-emerald-700/80 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                      }`}>
                                        {dayCfg.dateStr}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Selected Day KPI & Context Pills Banner */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Predicted Demand</span>
                                <div className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">
                                  {activeDayAllocation.totalPortionsDemand} <span className="text-xs font-normal text-slate-500">portions</span>
                                </div>
                                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                                  {activeDayAllocation.targetConfidence} Model Confidence
                                </span>
                              </div>

                              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Prep Target + Safety Buffer</span>
                                <div className="text-lg font-black text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">
                                  {activeDayAllocation.totalPortionsPrep} <span className="text-xs font-normal text-slate-500">portions</span>
                                </div>
                                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                                  +{activeDayAllocation.totalBufferPortions} buffer (prevents stockout)
                                </span>
                              </div>

                              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Scheduled Kitchen Staff</span>
                                <div className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">
                                  {activeDayAllocation.totalCooksCount} <span className="text-xs font-normal text-slate-500">chefs & assistants</span>
                                </div>
                                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                                  Across 5 active kitchen stations
                                </span>
                              </div>

                              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Weather & Shift Context</span>
                                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5" title={activeDayAllocation.weather}>
                                  ⛅ {activeDayAllocation.weather}
                                </div>
                                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate block" title={activeDayAllocation.weatherImpact}>
                                  {activeDayAllocation.weatherImpact}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 5-Station Staff Allocation Cards Grid */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5 text-emerald-600" />
                                Station Staff Allocation for {activeDayAllocation.daySinhala} ({activeDayAllocation.shiftHighlight}):
                              </span>
                              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                5 Kitchen Stations • {activeDayAllocation.totalCooksCount} Chefs Allocated
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                              {stationKeys.map(stName => {
                                const load = activeDayAllocation.stationLoads[stName] || { portions: 0, prep: 0, buffer: 0, icon: "🍳", color: "#0284c7" };
                                const chefs = activeDayAllocation.stationChefs[stName] || [];
                                const prepPerCook = chefs.length > 0 ? Math.round(load.prep / chefs.length) : load.prep;

                                return (
                                  <div
                                    key={stName}
                                    className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-[#d7e5dc] dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all shadow-sm flex flex-col justify-between space-y-3"
                                  >
                                    {/* Station Card Header */}
                                    <div>
                                      <div className="flex items-center justify-between">
                                        <span className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                                          <span className="text-base">{load.icon}</span>
                                          <span>{stName}</span>
                                        </span>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                                          {chefs.length} {chefs.length === 1 ? 'cook' : 'cooks'}
                                        </span>
                                      </div>

                                      {/* Station Portions Progress */}
                                      <div className="mt-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-baseline justify-between text-[11px]">
                                          <span className="text-slate-500 font-medium">Prep Target:</span>
                                          <span className="font-mono font-black text-slate-900 dark:text-white">
                                            {load.prep} <span className="text-[10px] font-normal text-slate-400">portions</span>
                                          </span>
                                        </div>
                                        <div className="flex items-baseline justify-between text-[10px] text-slate-400 mt-0.5">
                                          <span>Demand: {load.portions}</span>
                                          <span className="text-amber-700 dark:text-amber-400 font-bold">+{load.buffer} buffer</span>
                                        </div>
                                        <div className="mt-1.5 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800 pt-1">
                                          <span>Load / Cook:</span>
                                          <span className="font-mono font-black">~{prepPerCook} portions</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Assigned Chefs List */}
                                    <div className="space-y-1.5">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                        Allocated Chefs:
                                      </span>
                                      <div className="space-y-1.5">
                                        {chefs.map((chef, cIdx) => (
                                          <div
                                            key={cIdx}
                                            className={`p-1.5 rounded-lg border text-left transition-all ${
                                              chef.isLead
                                                ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                                            }`}
                                          >
                                            <div className="flex items-center justify-between">
                                              <span className="font-extrabold text-[11px] text-slate-900 dark:text-white flex items-center gap-1">
                                                {chef.isLead && <Star className="h-3 w-3 text-amber-600 fill-amber-600" />}
                                                {chef.name}
                                              </span>
                                              <span className="text-[9px] font-bold px-1 rounded bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-mono">
                                                {chef.eff}
                                              </span>
                                            </div>
                                            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                                              {chef.role}
                                            </div>
                                            <div className="text-[9px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                                              <Clock className="h-2.5 w-2.5 text-slate-400" />
                                              <span>{chef.shift}</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Item-Level Kitchen Preparation Sizing Table (From Demand Forecasting) */}
                          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#cbdad0] dark:border-slate-800 shadow-sm space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e2ece5] dark:border-slate-800 pb-3">
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                  <ChefHat className="h-4 w-4 text-emerald-600" />
                                  Item-Level Kitchen Preparation Sizing Table ({activeDayAllocation.daySinhala})
                                </h4>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                  ML-forecasted portions, batch prep guidance & safety buffers linked to station chef workloads
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setShowItemPrepTable(!showItemPrepTable)}
                                  className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                                >
                                  {showItemPrepTable ? 'Hide Table' : 'Show Table'}
                                </button>
                              </div>
                            </div>

                            {showItemPrepTable && (
                              <div className="space-y-3">
                                {/* Table Filters */}
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
                                  <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
                                    {['all', 'Seafood', 'Pizza', 'Cold Salad', 'Dessert', 'Beverages'].map(st => (
                                      <button
                                        key={st}
                                        onClick={() => setDemandStationFilter(st)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                          demandStationFilter === st
                                            ? 'bg-emerald-600 text-white shadow-sm'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                      >
                                        {st === 'all' ? 'All Stations' : st}
                                      </button>
                                    ))}
                                  </div>

                                  <div className="relative w-full sm:w-64">
                                    <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                                    <input
                                      type="text"
                                      placeholder="Filter menu dishes..."
                                      value={demandItemSearch}
                                      onChange={e => setDemandItemSearch(e.target.value)}
                                      className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                                    />
                                  </div>
                                </div>

                                {/* Table Content */}
                                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                                  <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                                    <thead className="bg-[#f4f8f5] dark:bg-slate-950 text-slate-800 dark:text-slate-300 uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                                      <tr>
                                        <th className="py-2.5 px-3">Menu Dish</th>
                                        <th className="py-2.5 px-2.5">Kitchen Station</th>
                                        <th className="py-2.5 px-3">Predicted Demand</th>
                                        <th className="py-2.5 px-3">Prep Guidance</th>
                                        <th className="py-2.5 px-2.5">Safety Buffer</th>
                                        <th className="py-2.5 px-3">Allocated Station Chefs</th>
                                        <th className="py-2.5 px-2.5 text-center">Status</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                                      {filteredTableItems.length === 0 ? (
                                        <tr>
                                          <td colSpan={7} className="py-6 text-center text-slate-400 italic">
                                            No dishes match your filter criteria.
                                          </td>
                                        </tr>
                                      ) : (
                                        filteredTableItems.map(item => {
                                          const chefs = activeDayAllocation.stationChefs[item.station] || [];
                                          return (
                                            <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                                              <td className="py-2.5 px-3">
                                                <div className="font-bold text-slate-900 dark:text-white text-xs">{item.name}</div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                  <span className="text-[10px] text-slate-400 font-mono">LKR {Number(item.price || 1200).toFixed(2)}</span>
                                                  <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-1 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                                                    {item.confidence || 93}% Conf.
                                                  </span>
                                                </div>
                                              </td>

                                              <td className="py-2.5 px-2.5">
                                                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                                                  {item.station}
                                                </span>
                                              </td>

                                              <td className="py-2.5 px-3">
                                                <div className="text-sm font-black text-slate-900 dark:text-white font-mono">
                                                  {item.dayDemand} <span className="text-[10px] font-normal text-slate-400">portions</span>
                                                </div>
                                                <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-bold block">
                                                  {item.trend || '+15%'} trend
                                                </span>
                                              </td>

                                              <td className="py-2.5 px-3">
                                                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 font-extrabold border border-emerald-300 dark:border-emerald-700 shadow-sm inline-block">
                                                  Prepare {item.dayPrep} portions
                                                </span>
                                              </td>

                                              <td className="py-2.5 px-2.5 font-mono font-bold text-amber-700 dark:text-amber-400">
                                                +{item.dayBuffer} ready
                                              </td>

                                              <td className="py-2.5 px-3">
                                                <div className="flex flex-wrap items-center gap-1">
                                                  {chefs.map((c, ci) => (
                                                    <span
                                                      key={ci}
                                                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${
                                                        c.isLead
                                                          ? 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-700'
                                                          : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                                      }`}
                                                      title={`${c.name} (${c.role}) • ${c.shift}`}
                                                    >
                                                      {c.isLead ? '★ ' : ''}{c.name}
                                                    </span>
                                                  ))}
                                                </div>
                                              </td>

                                              <td className="py-2.5 px-2.5 text-center">
                                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-700">
                                                  Available
                                                </span>
                                              </td>
                                            </tr>
                                          );
                                        })
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* VIEW 2: WEEKLY ORDER TRENDS & FORECAST */}
                {analyticsViewTab === 'weekly' && (
                  <div className="space-y-4 pt-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                          Weekly Order Trends Across 3 Months & Upcoming Week Forecast:
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          Visual trend of kitchen dishes prepared and total restaurant orders week-over-week
                        </p>
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        15 Historical Weeks + 1 Forecast Week
                      </span>
                    </div>

                    {/* Interactive Recharts Weekly Chart */}
                    <div className="h-64 w-full bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyTrends}>
                          <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#1e293b" : "#e2e8f0"} />
                          <XAxis dataKey="week_label" stroke={isDarkMode ? "#64748b" : "#475569"} fontSize={10} />
                          <YAxis yAxisId="left" stroke={isDarkMode ? "#64748b" : "#475569"} fontSize={10} label={{ value: 'Kitchen Dishes', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                          <YAxis yAxisId="right" orientation="right" stroke={isDarkMode ? "#64748b" : "#475569"} fontSize={10} label={{ value: 'Total Orders', angle: 90, position: 'insideRight', fontSize: 10, fill: '#64748b' }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                              borderColor: isDarkMode ? '#334155' : '#cbd5e1',
                              borderRadius: '8px',
                              fontSize: '11px',
                              color: isDarkMode ? '#f8fafc' : '#0f172a',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                          <Bar yAxisId="left" dataKey="kitchen_dishes" name="Kitchen Dishes Prepared" fill="#10b981" radius={[4, 4, 0, 0]} />
                          <Line yAxisId="right" type="monotone" dataKey="total_orders" name="Total Orders (Est)" stroke="#ea580c" strokeWidth={2.5} dot={{ r: 3 }} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Weekly Breakdown Table */}
                    <div className="overflow-x-auto no-scrollbar rounded-xl border border-slate-200 dark:border-slate-800">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-[#f0f5f2] dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-extrabold uppercase border-b border-slate-200 dark:border-slate-700">
                          <tr>
                            <th className="py-2.5 px-3">Week</th>
                            <th className="py-2.5 px-3">Date Range</th>
                            <th className="py-2.5 px-3 text-right">Kitchen Dishes</th>
                            <th className="py-2.5 px-3 text-right">Daily Avg Dishes</th>
                            <th className="py-2.5 px-3 text-right">Total Orders</th>
                            <th className="py-2.5 px-3 text-right">WoW Growth %</th>
                            <th className="py-2.5 px-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                          {weeklyTrends.map((w, idx) => (
                            <tr
                              key={w.week_number || idx}
                              className={w.status === 'Predicted' ? 'bg-emerald-50/70 dark:bg-emerald-950/40 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}
                            >
                              <td className="py-2 px-3 font-extrabold text-slate-900 dark:text-white">
                                {w.week_label}
                              </td>
                              <td className="py-2 px-3 text-slate-500 dark:text-slate-400">
                                {w.period}
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                                {w.kitchen_dishes?.toLocaleString()}
                              </td>
                              <td className="py-2 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                                {w.avg_daily_kitchen_dishes}
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-orange-600 dark:text-orange-400">
                                {w.total_orders?.toLocaleString()}
                              </td>
                              <td className="py-2 px-3 text-right font-mono">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                                  w.wow_growth_pct > 0
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : (w.wow_growth_pct < 0 ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'text-slate-500')
                                }`}>
                                  {w.wow_growth_pct > 0 ? `+${w.wow_growth_pct}%` : `${w.wow_growth_pct}%`}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-center">
                                {w.status === 'Predicted' ? (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[9px] uppercase shadow-xs animate-pulse">
                                    ★ Forecast
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-medium">Historical</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* VIEW 3: 3-MONTH WORKLOAD SUMMARY & STATION DISTRIBUTION */}
                {analyticsViewTab === 'summary' && (
                  <div className="space-y-4 pt-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5 text-emerald-600" />
                          3-Month Production Workload Distribution Across 5 Kitchen Stations:
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          Analysis of 7,223 food items prepared from {t3m.date_range} (Source: {t3m.source_file})
                        </p>
                      </div>
                      <span className="text-[11px] font-bold text-slate-500">
                        Total Prepared Dishes: <span className="font-extrabold text-emerald-700 dark:text-emerald-400">{t3m.total_kitchen_food_dishes?.toLocaleString() || "7,223"} dishes</span>
                      </span>
                    </div>

                    {/* Station Workload Progress Bars */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                      {Object.entries(stationDist).map(([stKey, info]) => (
                        <div
                          key={stKey}
                          className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                              <span>{info.icon || "🍳"}</span>
                              <span>{info.name || stKey}</span>
                            </span>
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800" style={{ color: info.color }}>
                              {info.pct}%
                            </span>
                          </div>

                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${info.pct}%`, backgroundColor: info.color }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            <span>{info.dishes?.toLocaleString()} dishes</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              ~{Math.round((info.dishes || 0) / (t3m.total_days_analyzed || 92))} / day
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Day-of-Week Seasonality Table */}
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Day-of-Week Demand Seasonality Index (3-Month Aggregated Mean)
                        </span>
                        <span className="text-[10px] text-slate-400">Baseline = 1.00 (Neutral)</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                        {dowSeasonality.map((d) => (
                          <div
                            key={d.day}
                            className={`p-2.5 rounded-lg border text-center space-y-1 ${
                              d.multiplier >= 1.10
                                ? 'bg-orange-50/70 border-orange-200 dark:bg-orange-950/40 dark:border-orange-800'
                                : 'bg-slate-50/70 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700'
                            }`}
                          >
                            <span className="text-[11px] font-bold text-slate-900 dark:text-white block">
                              {d.day}
                            </span>
                            <div className="text-sm font-black text-slate-800 dark:text-slate-200">
                              {d.avg_orders} <span className="text-[10px] font-normal text-slate-400">ord</span>
                            </div>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full inline-block ${
                              d.multiplier >= 1.10
                                ? 'bg-orange-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}>
                              x{d.multiplier}
                            </span>
                            <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                              {d.note}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            );
          })()}

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

            {(() => {
              const visibleDirectives = directives.filter(dir => !stabilizedStations.has(dir.targetStation));

              if (visibleDirectives.length === 0) {
                return (
                  <div className="p-4 rounded-xl bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      <span>All line queues balanced! Kitchen staffing operating at optimal efficiency.</span>
                    </div>
                    <button
                      onClick={handleResetDirectives}
                      className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      Reset Directives
                    </button>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {visibleDirectives.map((dir, index) => {
                    const tracker = stationSurgeFulfillment[dir.targetStation];
                    const isReassigned = tracker?.active;
                    const fulfilledCount = tracker?.fulfilledCount || 0;

                    return (
                      <div
                        key={dir.id}
                        className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isReassigned
                          ? 'bg-amber-50/80 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800'
                          : (index === 0
                            ? 'bg-white dark:bg-slate-900 border-2 border-orange-400 dark:border-orange-500/60 shadow-sm'
                            : 'bg-white/80 dark:bg-slate-900/60 border-orange-200 dark:border-orange-900/40 opacity-85')
                          }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md text-white ${isReassigned
                              ? 'bg-amber-600'
                              : (dir.priority?.includes('SURGE') || dir.priority === 'CRITICAL'
                                ? 'bg-rose-600 animate-pulse'
                                : (dir.priority === 'HIGH' ? 'bg-amber-600' : 'bg-blue-600'))
                              }`}>
                              {isReassigned
                                ? `IN PROGRESS: ${fulfilledCount}/2 FULFILLED`
                                : (index === 0 ? `TOP PRIORITY: ${dir.priority}` : `PRIORITY ${index + 1}: ${dir.priority}`)}
                            </span>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{dir.title}</p>
                          </div>
                          <p className="text-xs text-orange-950 dark:text-orange-200 font-semibold flex items-center gap-1 pt-0.5">
                            <ArrowRight className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                            <span>Action: <span className="font-extrabold text-orange-900 dark:text-orange-100 underline">{dir.actionText}</span></span>
                          </p>
                        </div>

                        {isReassigned ? (
                          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                            <span className="px-3 py-1.5 rounded-xl bg-amber-500 text-white font-black text-xs flex items-center gap-1.5 shadow-xs whitespace-nowrap">
                              <span className="h-2 w-2 rounded-full bg-white animate-ping"></span>
                              <span>Reassigned • {fulfilledCount}/2 Orders Fulfilled</span>
                            </span>
                            <button
                              onClick={() => handleFastFulfillStationOrder(dir.targetStation)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs transition-all whitespace-nowrap"
                              title="Fulfill next station order to move to Completed Orders"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Fulfill Order ({fulfilledCount}/2)</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleExecuteDirective(dir)}
                            className={`px-3.5 py-2 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap self-start sm:self-auto ${index === 0
                              ? (dir.isNightOffDutySupport ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30 ring-2 ring-indigo-400' : 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/30 ring-2 ring-orange-400')
                              : 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600'
                              }`}
                          >
                            {dir.isNightOffDutySupport ? (
                              <>
                                <Moon className="h-4 w-4 text-amber-300" />
                                <span>Assign Off-Duty Support ({dir.targetStaff?.split('(')[0]?.trim()})</span>
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="h-4 w-4" />
                                <span>Reallocate {dir.targetStaff}</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}



      {(activeKitchenTab === 'optimization' || activeKitchenTab === 'all') && (
        <>
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
              let seafoodPct = 20, pizzaPct = 20, coldSaladPct = 20, dessertPct = 20, beveragesPct = 20;
              if (totalLoadForProportion > 0) {
                const rawSeafood = ((Number(stationsList.find(s => s.name === "Seafood")?.actual_load) || 0) / totalLoadForProportion) * 100;
                const rawPizza = ((Number(stationsList.find(s => s.name === "Pizza")?.actual_load) || 0) / totalLoadForProportion) * 100;
                const rawSalad = ((Number(stationsList.find(s => s.name === "Cold Salad")?.actual_load) || 0) / totalLoadForProportion) * 100;
                const rawDessert = ((Number(stationsList.find(s => s.name === "Dessert")?.actual_load) || 0) / totalLoadForProportion) * 100;
                const rawBev = ((Number(stationsList.find(s => s.name === "Beverages")?.actual_load) || 0) / totalLoadForProportion) * 100;

                seafoodPct = Math.round(rawSeafood);
                pizzaPct = Math.round(rawPizza);
                coldSaladPct = Math.round(rawSalad);
                dessertPct = Math.round(rawDessert);
                beveragesPct = Math.max(0, 100 - (seafoodPct + pizzaPct + coldSaladPct + dessertPct));
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
                        Seafood ({seafoodPct}%) • Pizza ({pizzaPct}%) • Cold Salad ({coldSaladPct}%) • Dessert ({dessertPct}%) • Beverages ({beveragesPct}%)
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                      <div style={{ width: `${seafoodPct}%` }} className="bg-sky-500 h-full transition-all duration-500" title={`Seafood: ${seafoodPct}%`} />
                      <div style={{ width: `${pizzaPct}%` }} className="bg-orange-500 h-full transition-all duration-500" title={`Pizza: ${pizzaPct}%`} />
                      <div style={{ width: `${coldSaladPct}%` }} className="bg-emerald-500 h-full transition-all duration-500" title={`Cold Salad: ${coldSaladPct}%`} />
                      <div style={{ width: `${dessertPct}%` }} className="bg-pink-500 h-full transition-all duration-500" title={`Dessert: ${dessertPct}%`} />
                      <div style={{ width: `${beveragesPct}%` }} className="bg-purple-500 h-full transition-all duration-500" title={`Beverages: ${beveragesPct}%`} />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* High Workload & Queue Alerts Panel */}
            {stationsList.some(st => st.load_level >= 80 && !stabilizedStations.has(st.name)) && (
              <div className="p-4 rounded-2xl bg-rose-50/90 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-500/40 shadow-sm space-y-3">
                <div className="flex items-center gap-2 border-b border-rose-200 dark:border-rose-800/60 pb-2">
                  <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 flex-shrink-0 animate-pulse" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-rose-900 dark:text-rose-200">
                    High Workload & Line Queue Alerts
                  </h4>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-600 text-white ml-auto">
                    {stationsList.filter(st => st.load_level >= 80 && !stabilizedStations.has(st.name)).length} Stations Critical
                  </span>
                </div>

                <div className="space-y-2.5">
                  {stationsList.filter(st => st.load_level >= 80 && !stabilizedStations.has(st.name)).map((st) => (
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
                const stationStaff = (data?.staff || []).filter(s => doesStaffBelongToStation(s, st.name));
                const morningStaff = stationStaff.filter(s => classifyStaffShift(s.shift) === 'Morning');
                const afternoonStaff = stationStaff.filter(s => classifyStaffShift(s.shift) === 'Afternoon');
                const nightStaff = stationStaff.filter(s => classifyStaffShift(s.shift) === 'Night');

                const assignedNightRelief = (data?.staff || []).filter(s =>
                  s.isOffDutyNightSupport &&
                  (s.reallocatedTo || '').toLowerCase() === st.name.toLowerCase()
                );

                const offDutyMorningCandidates = getOffDutyMorningStaffCandidates(st.name, data?.staff || []);
                const currentStationShift = stationShiftFilter[st.name] || 'all';

                const isNightTime = todayMealStats?.activeShift === 'evening' || new Date().getHours() >= 16;
                const isStationOverloaded = (st.load_level >= 60) || (st.queue_length >= 2) || (stationDishAnalysis?.stationStats?.[st.name]?.isOverloaded);
                const isNightSurgeEligible = (isNightTime || currentStationShift === 'night' || isStationOverloaded) && !stabilizedStations.has(st.name);

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

                      {/* Dynamic Shift Roster & Staff by Shift Section */}
                      <div className="mt-3.5 pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Staff by Shift</span>
                          </span>
                          <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {stationStaff.length + assignedNightRelief.length} Cooks
                          </span>
                        </div>

                        {/* Shift Filter Navigation Pills */}
                        <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-[10px] font-bold">
                          <button
                            type="button"
                            onClick={() => setStationShiftFilter(prev => ({ ...prev, [st.name]: 'all' }))}
                            className={`py-1 px-1 rounded-lg text-center transition-all cursor-pointer ${
                              currentStationShift === 'all'
                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-black'
                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                            }`}
                            title="Show all shifts"
                          >
                            All
                          </button>
                          <button
                            type="button"
                            onClick={() => setStationShiftFilter(prev => ({ ...prev, [st.name]: 'morning' }))}
                            className={`py-1 px-0.5 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
                              currentStationShift === 'morning'
                                ? 'bg-amber-500 text-white shadow-2xs font-black'
                                : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'
                            }`}
                            title="Morning Shift (Breakfast & Prep)"
                          >
                            <Sunrise className="h-2.5 w-2.5" />
                            <span>Morn ({morningStaff.length})</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setStationShiftFilter(prev => ({ ...prev, [st.name]: 'afternoon' }))}
                            className={`py-1 px-0.5 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
                              currentStationShift === 'afternoon'
                                ? 'bg-emerald-600 text-white shadow-2xs font-black'
                                : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                            }`}
                            title="Afternoon Shift (Lunch Peak)"
                          >
                            <Sun className="h-2.5 w-2.5" />
                            <span>Aft ({afternoonStaff.length})</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setStationShiftFilter(prev => ({ ...prev, [st.name]: 'night' }))}
                            className={`py-1 px-0.5 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
                              currentStationShift === 'night'
                                ? 'bg-indigo-600 text-white shadow-2xs font-black'
                                : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600'
                            }`}
                            title="Night Shift (Dinner Rush & Late)"
                          >
                            <Moon className="h-2.5 w-2.5" />
                            <span>Night ({nightStaff.length + assignedNightRelief.length})</span>
                          </button>
                        </div>

                        {/* Staff Members List by Shift */}
                        <div className="mt-2 space-y-1.5 max-h-44 overflow-y-auto pr-0.5 text-[11px]">
                          {/* MORNING SHIFT LIST */}
                          {(currentStationShift === 'all' || currentStationShift === 'morning') && (
                            <div>
                              {currentStationShift === 'all' && (
                                <div className="flex items-center justify-between text-[9px] font-black uppercase text-amber-700 dark:text-amber-400 py-0.5 border-b border-amber-200/50 dark:border-amber-900/40">
                                  <span className="flex items-center gap-1">
                                    <Sunrise className="h-3 w-3" /> Morning ({morningStaff.length})
                                  </span>
                                  <span className="text-[8px] bg-amber-100 dark:bg-amber-950 px-1 rounded text-amber-800 dark:text-amber-300">
                                    Off-duty tonight
                                  </span>
                                </div>
                              )}
                              {morningStaff.length === 0 ? (
                                <p className="text-[10px] text-slate-400 italic py-0.5">No morning staff</p>
                              ) : (
                                morningStaff.map(s => {
                                  const cleanName = (s.name || "Chef").split('(')[0].trim();
                                  const skillScore = Number(s[stationSkillColumnMap[st.name]] || 3);
                                  return (
                                    <div key={s.id || s.emp_id || s.name} className="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 shadow-2xs my-1">
                                      <div className="truncate pr-1">
                                        <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-white truncate">
                                          <span className="truncate">{cleanName}</span>
                                          <span className="text-amber-500 text-[10px]">{skillScore}★</span>
                                        </div>
                                        <div className="text-[9px] text-slate-400 dark:text-slate-500 truncate">
                                          {s.shift || "07:00 AM - 04:00 PM"}
                                        </div>
                                      </div>
                                      <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 whitespace-nowrap">
                                        Morn
                                      </span>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}

                          {/* AFTERNOON SHIFT LIST */}
                          {(currentStationShift === 'all' || currentStationShift === 'afternoon') && (
                            <div>
                              {currentStationShift === 'all' && (
                                <div className="flex items-center justify-between text-[9px] font-black uppercase text-emerald-700 dark:text-emerald-400 py-0.5 mt-1 border-b border-emerald-200/50 dark:border-emerald-900/40">
                                  <span className="flex items-center gap-1">
                                    <Sun className="h-3 w-3" /> Afternoon ({afternoonStaff.length})
                                  </span>
                                  <span className="text-[8px] bg-emerald-100 dark:bg-emerald-950 px-1 rounded text-emerald-800 dark:text-emerald-300">
                                    Lunch Rush
                                  </span>
                                </div>
                              )}
                              {afternoonStaff.length === 0 ? (
                                <p className="text-[10px] text-slate-400 italic py-0.5">No afternoon staff</p>
                              ) : (
                                afternoonStaff.map(s => {
                                  const cleanName = (s.name || "Chef").split('(')[0].trim();
                                  const skillScore = Number(s[stationSkillColumnMap[st.name]] || 3);
                                  return (
                                    <div key={s.id || s.emp_id || s.name} className="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 shadow-2xs my-1">
                                      <div className="truncate pr-1">
                                        <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-white truncate">
                                          <span className="truncate">{cleanName}</span>
                                          <span className="text-amber-500 text-[10px]">{skillScore}★</span>
                                        </div>
                                        <div className="text-[9px] text-slate-400 dark:text-slate-500 truncate">
                                          {s.shift || "11:00 AM - 09:30 PM"}
                                        </div>
                                      </div>
                                      <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 whitespace-nowrap">
                                        Aft
                                      </span>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}

                          {/* NIGHT SHIFT LIST */}
                          {(currentStationShift === 'all' || currentStationShift === 'night') && (
                            <div>
                              {currentStationShift === 'all' && (
                                <div className="flex items-center justify-between text-[9px] font-black uppercase text-indigo-700 dark:text-indigo-400 py-0.5 mt-1 border-b border-indigo-200/50 dark:border-indigo-900/40">
                                  <span className="flex items-center gap-1">
                                    <Moon className="h-3 w-3" /> Night ({nightStaff.length + assignedNightRelief.length})
                                  </span>
                                  <span className="text-[8px] bg-indigo-100 dark:bg-indigo-950 px-1 rounded text-indigo-800 dark:text-indigo-300">
                                    Dinner Rush
                                  </span>
                                </div>
                              )}
                              {nightStaff.length === 0 && assignedNightRelief.length === 0 ? (
                                <p className="text-[10px] text-slate-400 italic py-0.5">No night staff</p>
                              ) : (
                                <>
                                  {nightStaff.map(s => {
                                    const cleanName = (s.name || "Chef").split('(')[0].trim();
                                    const skillScore = Number(s[stationSkillColumnMap[st.name]] || 3);
                                    return (
                                      <div key={s.id || s.emp_id || s.name} className="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 shadow-2xs my-1">
                                        <div className="truncate pr-1">
                                          <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-white truncate">
                                            <span className="truncate">{cleanName}</span>
                                            <span className="text-amber-500 text-[10px]">{skillScore}★</span>
                                          </div>
                                          <div className="text-[9px] text-slate-400 dark:text-slate-500 truncate">
                                            {s.shift || "03:00 PM - 11:00 PM"}
                                          </div>
                                        </div>
                                        <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800 whitespace-nowrap">
                                          Night
                                        </span>
                                      </div>
                                    );
                                  })}

                                  {/* Assigned Off-Duty Morning Staff Supporting Night Surge */}
                                  {assignedNightRelief.map(s => {
                                    const cleanName = (s.name || "Chef").split('(')[0].trim();
                                    const skillScore = Number(s[stationSkillColumnMap[st.name]] || 4);
                                    return (
                                      <div key={s.id || s.emp_id || s.name} className="flex items-center justify-between p-1.5 rounded-lg bg-gradient-to-r from-emerald-50 to-indigo-50 dark:from-emerald-950/80 dark:to-indigo-950/80 border-2 border-emerald-400 dark:border-emerald-600 shadow-xs my-1">
                                        <div className="truncate pr-1">
                                          <div className="flex items-center gap-1 font-black text-emerald-900 dark:text-emerald-100 truncate">
                                            <span className="truncate">🌙 {cleanName}</span>
                                            <span className="text-amber-500 text-[10px]">{skillScore}★</span>
                                          </div>
                                          <div className="text-[9px] text-emerald-700 dark:text-emerald-300 truncate font-semibold">
                                            Morning Shift Support (On-Call Relief)
                                          </div>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handleRelieveOffDutyMorningStaff(s, st.name)}
                                          className="px-1.5 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[9px] cursor-pointer whitespace-nowrap shadow-2xs"
                                          title="Relieve and return to off-duty"
                                        >
                                          Relieve
                                        </button>
                                      </div>
                                    );
                                  })}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* NIGHT SURGE OFF-DUTY MORNING STAFF SUGGESTION & ASSIGNMENT BOX */}
                      {isNightSurgeEligible && assignedNightRelief.length === 0 && offDutyMorningCandidates.length > 0 && (
                        <div className="mt-3.5 p-2.5 rounded-xl bg-gradient-to-br from-indigo-50 via-purple-50 to-sky-50 dark:from-indigo-950/80 dark:via-purple-950/70 dark:to-sky-950/80 border-2 border-indigo-400 dark:border-indigo-500 shadow-sm space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-indigo-900 dark:text-indigo-300 flex items-center gap-1">
                              <Moon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                              <span>Night Surge • Free Off-Duty Staff</span>
                            </span>
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100">
                              Off-Duty Tonight
                            </span>
                          </div>

                          <div className="text-[11px] leading-snug">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-slate-900 dark:text-white">
                                👨‍🍳 {offDutyMorningCandidates[0].cleanName}
                              </span>
                              <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-300 dark:border-amber-700">
                                {offDutyMorningCandidates[0].stationSkillRating}★ {st.name} Skill
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-1">
                              Worked morning shift ({offDutyMorningCandidates[0].shift || '07:00–16:00'}) and is off-duty tonight. Ready to be assigned to support this station.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAssignOffDutyMorningStaff(offDutyMorningCandidates[0], st.name)}
                            className="w-full py-1.5 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
                          >
                            <Zap className="h-3.5 w-3.5 text-amber-300" />
                            <span>Assign {offDutyMorningCandidates[0].cleanName} to Support Surge (+1 Cook)</span>
                          </button>

                          {offDutyMorningCandidates.length > 1 && (
                            <div className="pt-1 border-t border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-between text-[10px]">
                              <span className="text-slate-500 dark:text-slate-400">Also off-duty & qualified:</span>
                              <button
                                type="button"
                                onClick={() => handleAssignOffDutyMorningStaff(offDutyMorningCandidates[1], st.name)}
                                className="text-indigo-700 dark:text-indigo-300 font-extrabold hover:underline cursor-pointer flex items-center gap-1"
                              >
                                <span>{offDutyMorningCandidates[1].cleanName} ({offDutyMorningCandidates[1].stationSkillRating}★)</span>
                                <ArrowRight className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Dynamic Dish Surge Alert for Target Station Card */}
                      {stationDishAnalysis?.stationStats?.[st.name]?.isOverloaded && !stabilizedStations.has(st.name) && (
                        <div className="mt-3.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/70 border-2 border-rose-500 text-rose-950 dark:text-rose-100 space-y-2 shadow-xs animate-pulse">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-rose-700 dark:text-rose-400 flex items-center gap-1">
                              <Flame className="h-3.5 w-3.5 text-rose-600 animate-bounce" />
                              SURGE ALERT ({stationDishAnalysis.stationStats[st.name].pendingDishes} Orders)
                            </span>
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100">
                              Ratio: {stationDishAnalysis.stationStats[st.name].ratio}/cook
                            </span>
                          </div>
                          <p className="text-[11px] font-medium leading-tight text-slate-700 dark:text-slate-300">
                            Incoming: <span className="font-bold text-slate-900 dark:text-white">{stationDishAnalysis.stationStats[st.name].dishSummary}</span>
                          </p>
                          <div className="pt-1.5 border-t border-rose-200 dark:border-rose-900/60">
                            <span className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                              Recommended Skilled Staff:
                            </span>
                            <div className="space-y-1.5">
                              {stationDishAnalysis.stationStats[st.name].recommendedStaff.map((cand, idx) => (
                                <div key={idx} className="flex items-center justify-between text-[11px] bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-rose-200 dark:border-rose-800 shadow-2xs">
                                  <div>
                                    <span className="font-extrabold text-slate-900 dark:text-white">{cand.staffName.split('(')[0].trim()}</span>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1">
                                      ({cand.currentStation} • <span className="text-amber-600 dark:text-amber-400 font-bold">{cand.stationSkillScore}★</span>)
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handleExecuteStaffReallocation(cand.staffName, cand.currentStation, st.name, `Surge response reallocation to ${st.name}`)}
                                    className="px-2 py-0.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] cursor-pointer flex items-center gap-1 shadow-xs"
                                  >
                                    <Zap className="h-3 w-3" />
                                    <span>Reassign</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Active Reassignment Progress Pill for Station Card */}
                      {stationSurgeFulfillment[st.name]?.active && !stabilizedStations.has(st.name) && (
                        <div className="mt-3.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 space-y-2 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
                              <span>Staff Reassigned: {stationSurgeFulfillment[st.name].chefName}</span>
                            </span>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
                              {stationSurgeFulfillment[st.name].fulfilledCount}/2 Orders Fulfilled
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-amber-200 dark:border-amber-800">
                            <span className="text-[10px] text-amber-900 dark:text-amber-200 font-semibold">
                              Complete 2 orders to normalize
                            </span>
                            <button
                              onClick={() => handleFastFulfillStationOrder(st.name)}
                              className="px-2 py-0.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] cursor-pointer flex items-center gap-1 shadow-xs"
                              title="Advance & fulfill next station order"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Fulfill Order ({stationSurgeFulfillment[st.name].fulfilledCount}/2)</span>
                            </button>
                          </div>
                        </div>
                      )}
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

      {/* ========================================================================= */}
      {/* STAFF OPTIMIZATION & SKILL DEVELOPMENT VIEW                                */}
      {/* ========================================================================= */}
      {(activeKitchenTab === 'staff' || activeKitchenTab === 'all') && (
        <div id="staff-optimization-section" className="space-y-6 animate-fade-in scroll-mt-20">

          {/* Sub-Tab Navigation Bar inside Staff Optimization & Skill Development */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setStaffSubTab('directory')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  staffSubTab === 'directory'
                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Staff Directory & Skill Analytics</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  staffSubTab === 'directory' ? 'bg-emerald-900/60 text-emerald-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  {data?.staff?.length || 30} Staff
                </span>
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setStaffSubTab('onboard');
                    setAdminStaffView('onboard');
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    staffSubTab === 'onboard' && adminStaffView === 'onboard'
                      ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Add New Staff Member</span>
                </button>
              )}

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setStaffSubTab('onboard');
                    setAdminStaffView('matrix');
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    staffSubTab === 'onboard' && adminStaffView === 'matrix'
                      ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Database className="h-4 w-4" />
                  <span>Staff Skill & Station Allocation Matrix</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 pr-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isAdmin ? 'Admin Personnel Management & Competency Hub' : 'Kitchen Personnel & Competency Hub'}</span>
            </div>
          </div>

          {/* SUB-TAB 1: STAFF DIRECTORY & SKILL ANALYTICS */}
          {staffSubTab === 'directory' && (
            <>
              {/* Section 1: Staff Skill-Gap Analysis & Progression Paths (Header & Cards Grid matching screenshot) */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xs space-y-6">
                
                {/* Header with Title, Description, Onboard Button, and Staff Self-Assessment Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                      Staff Skill-Gap Analysis & Progression Paths
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                      Personalized training recommendations and succession planning for kitchen personnel
                    </p>
                  </div>
                </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* Search input */}
                <div className="relative min-w-[240px] flex-1 max-w-md">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    value={staffSearchQuery}
                    onChange={(e) => setStaffSearchQuery(e.target.value)}
                    placeholder="Search chef by name, station, skill-gap..."
                    className="w-full pl-9 pr-9 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  {staffSearchQuery && (
                    <button
                      onClick={() => setStaffSearchQuery("")}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5 rounded cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Station Filter */}
                <div className="flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5 text-slate-400" />
                  <select
                    value={staffStationFilter}
                    onChange={(e) => setStaffStationFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
                  >
                    <option value="all">All Kitchen Stations ({data?.staff?.length || 30})</option>
                    <option value="Hot Kitchen">Hot Kitchen / Saute</option>
                    <option value="Grill">Grill Station</option>
                    <option value="Cold Salad">Cold Salad & Garde Manger</option>
                    <option value="Pizza">Pizza Station</option>
                    <option value="Fryer">Fryer Station</option>
                  </select>
                </div>
              </div>

              {/* Staff Count Badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  Showing {filteredStaffList.length} of {data?.staff?.length || 30} Staff
                </span>
              </div>
            </div>

            {/* Staff Skill-Gap Cards Grid (3 Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStaffList.map((member) => (
                <div
                  key={member.id || member.emp_id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700/60 shadow-xs hover:shadow-md transition-all space-y-3"
                >
                  {/* Top Row: Chef Name and Standard/Reallocated Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">
                        {member.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        <span className="font-bold text-slate-700 dark:text-slate-300">{member.emp_id || member.id}</span>
                        <span>•</span>
                        <span>{member.assigned_station}</span>
                        {member.shift && <span>• {member.shift}</span>}
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        member.isReallocated
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                      }`}
                    >
                      {member.isReallocated ? 'Reallocated' : 'Standard'}
                    </span>
                  </div>

                  {/* Active Station Surge Directive Notification for Qualified Candidate */}
                  {(() => {
                    const directive = stationDishAnalysis?.staffDirectivesMap?.get(member.id) ||
                                      stationDishAnalysis?.staffDirectivesMap?.get(member.emp_id) ||
                                      stationDishAnalysis?.staffDirectivesMap?.get(member.name) ||
                                      stationDishAnalysis?.staffDirectivesMap?.get(member.name?.split('(')[0]?.trim());
                    if (!directive) return null;

                    const targetSt = directive.station || directive.targetStation || "Pizza";
                    const fromSt = directive.currentStation || directive.fromStation || member.assigned_station?.split('(')[0]?.trim() || "Prep Station";
                    const score = directive.stationSkillScore || directive.skillRating || 4;

                    return (
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-500 text-amber-950 dark:text-amber-100 space-y-2 animate-pulse shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                            SURGE REALLOCATION DIRECTIVE
                          </span>
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
                            Move to {targetSt}
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold leading-relaxed">
                          {directive.message || `Surge of ${directive.pendingDishes || 10} incoming orders detected at ${targetSt}! You have a ${score}★ skill rating in ${targetSt}. Reassign now to support the surge.`}
                        </p>
                        <div className="pt-1 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                            From: {fromSt}
                          </span>
                          <button
                            onClick={() => handleExecuteStaffReallocation(member.name, member.assigned_station, targetSt, `Direct surge response to ${targetSt}`)}
                            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[10px] shadow-xs cursor-pointer flex items-center gap-1 shrink-0 transition-transform active:scale-95"
                          >
                            <Zap className="h-3 w-3" />
                            <span>Acknowledge & Move</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {member.isReallocated && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-400 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Reallocated to {member.reallocatedTo || member.assigned_station?.replace(" (Reallocated via AI)", "")}</span>
                      </span>
                      <button
                        onClick={() => handleRevertStaffStation(member.name, member.originalStation || member.base_station || "Hot Kitchen")}
                        className="text-[10px] font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white underline cursor-pointer"
                      >
                        Revert Station
                      </button>
                    </div>
                  )}

                  {/* Efficiency Rating & Skill Gap */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                      <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">Efficiency Rating:</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">
                        {member.efficiency_rating ?? 85}%
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          (member.efficiency_rating || 85) >= 80
                            ? 'bg-emerald-500'
                            : (member.efficiency_rating || 85) >= 65
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(15, member.efficiency_rating || 85))}%` }}
                      />
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5 leading-snug">
                      Identified Skill-Gap: <span className="font-semibold text-amber-700 dark:text-amber-400">{member.skill_gap || 'High-Heat Line Precision'}</span>
                    </div>
                  </div>

                  {/* Personalized Training Box (Matching purple box in screenshot & connected to AI recommendations) */}
                  {(() => {
                    const memberRec = (upskillingData || []).find(u => u.Chef_ID === (member.emp_id || member.id) || (u.Chef_Name || '').toLowerCase().includes((member.name || '').toLowerCase()));
                    const isLowEff = (member.efficiency_rating ?? 85) < 50;

                    return (
                      <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                        isLowEff
                          ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 animate-pulse'
                          : 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900/50'
                      }`}>
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <span className={`text-[10px] font-bold flex items-center gap-1.5 ${
                            isLowEff ? 'text-rose-700 dark:text-rose-300' : 'text-purple-700 dark:text-purple-300'
                          }`}>
                            <Award className="h-3.5 w-3.5 shrink-0" />
                            {isLowEff ? '🚨 Emergency AI Pathway (<50% Eff):' : 'AI Personalized Upskilling Pathway:'}
                          </span>
                          {memberRec?.Program_Type && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200">
                              {memberRec.Program_Type}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-[11px] font-semibold leading-relaxed">
                          {memberRec ? memberRec.Program_Title : (member.training_recommendation || 'Continuous Cross-Station Rotation & Speed Drills')}
                        </p>
                        {memberRec && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800">
                            <span>⏱️ {memberRec.Duration}</span>
                            <span className="font-semibold text-purple-700 dark:text-purple-300 truncate max-w-[180px]">👨‍🏫 {memberRec.Mentor}</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Career Progression & Milestones */}
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span className="truncate">{member.career_progression || 'Executive Station Lead Track'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Staff Skill & Station Allocation Matrix (Admin Restricted Notice) */}
          {isAdmin && (
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-center gap-3.5 text-slate-600 dark:text-slate-300">
                <div className="p-3 rounded-2xl bg-orange-100 dark:bg-orange-950/70 text-orange-700 dark:text-orange-400 shrink-0">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Staff Skill & Station Allocation Matrix
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                      Admin Only
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Workforce skill ratings across all 5 bays, shift rosters, and staff profile editing/deletion are strictly restricted to the Admin Portal.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStaffSubTab('onboard');
                  setAdminStaffView('matrix');
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Database className="h-4 w-4" />
                <span>Access Admin Matrix →</span>
              </button>
            </div>
          )}

          {/* Section 3: Automated AI Recommendation System — Staff Upskilling & Competency Pathways */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-lg space-y-6 animate-fade-in">
            {/* Header & Automated Trigger Description */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1.5 shadow-xs">
                    <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
                    Automated AI Recommendation Engine Active
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1.5 shadow-xs">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                    Automated Trigger Rule: Proficiency &lt; 50% (1★/2★) OR Efficiency &lt; 50%
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
                  <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  Staff Competency &amp; Upskilling Pathway Matrix
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
                  The AI continuously audits staff station proficiencies and shift efficiency. If any score drops below 50%, personalized interventions are automatically generated: <strong className="text-purple-700 dark:text-purple-300 font-semibold">Multi-Month Supervised Apprenticeships</strong>, <strong className="text-blue-700 dark:text-blue-300 font-semibold">Targeted Culinary Courses</strong>, or <strong className="text-emerald-700 dark:text-emerald-300 font-semibold">Cross-Station Rotations</strong>.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handleRunUpskillAudit}
                  disabled={isAuditingUpskill}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-purple-500/20 cursor-pointer flex items-center gap-2 transition-all disabled:opacity-50"
                  title="Run real-time automated AI audit across all staff competency metrics"
                >
                  <RefreshCw className={`h-4 w-4 ${isAuditingUpskill ? 'animate-spin' : ''}`} />
                  <span>{isAuditingUpskill ? 'Auditing Matrix...' : 'Run Automated AI Audit'}</span>
                </button>
              </div>
            </div>

            {/* AI Automated Simulation Sandbox (< 50% Threshold Drop Tester) */}
            <div className="p-4 sm:p-5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-linear-to-r from-rose-50/70 via-amber-50/50 to-purple-50/40 dark:from-rose-950/30 dark:via-slate-900/40 dark:to-purple-950/20 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-rose-500 text-white shadow-xs">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                      Interactive Threshold Simulation Sandbox
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200">
                        &lt; 50% Drop Trigger
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Simulate a live efficiency drop below 50% to test immediate generation of emergency Supervised Apprenticeship recommendations.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    <select
                      value={simulatedStaffEmpId}
                      onChange={(e) => setSimulatedStaffEmpId(e.target.value)}
                      className="bg-transparent font-bold text-slate-800 dark:text-slate-200 outline-hidden cursor-pointer text-xs"
                    >
                      {(data?.staff || [
                        { emp_id: 'EMP30', name: 'Trainee Kaveen' },
                        { emp_id: 'EMP29', name: 'Trainee Sachith' },
                        { emp_id: 'EMP28', name: 'Trainee Janith' },
                        { emp_id: 'EMP27', name: 'Trainee Bimsara' },
                        { emp_id: 'EMP26', name: 'Trainee Oshada' },
                        { emp_id: 'EMP22', name: 'Chef Sandun (Commis II)' },
                        { emp_id: 'EMP23', name: 'Chef Chathura (Commis II)' },
                        { emp_id: 'EMP13', name: 'Chef Anura (Salad Specialist)' }
                      ]).map(s => (
                        <option key={s.emp_id || s.id} value={s.emp_id || s.id} className="dark:bg-slate-900">
                          {s.name} ({s.emp_id || s.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => handleSimulateEfficiencyDrop(simulatedStaffEmpId, 42)}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-xs shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Simulate &lt; 50% Efficiency (42%)</span>
                  </button>

                  {isSimulatingEfficiencyDrop && (
                    <button
                      onClick={handleResetSimulatedEfficiency}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Reset Baseline</span>
                    </button>
                  )}
                </div>
              </div>

              {isSimulatingEfficiencyDrop && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-400 dark:border-rose-700 flex items-center justify-between text-xs animate-pulse">
                  <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-300">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                    <span>Emergency Simulation Active: {simulatedStaffEmpId} efficiency dropped to 42% (&lt; 50% Threshold). Immediate 3-Month Supervised Apprenticeship triggered on matrix!</span>
                  </div>
                  <button
                    onClick={handleResetSimulatedEfficiency}
                    className="text-xs font-black text-rose-700 dark:text-rose-300 underline cursor-pointer hover:text-rose-900"
                  >
                    Dismiss Simulation
                  </button>
                </div>
              )}
            </div>

            {/* KPI Metric Analytics Ribbon (5 Cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {/* Card 1: Critical Gaps (< 50%) */}
              <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                    &lt; 50% Threshold Gaps
                  </span>
                  <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-rose-900 dark:text-rose-100">
                    {upskillStats.below50Count}
                  </span>
                  <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                    Identified Alerts
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Proficiency &le; 2★ or Eff &lt; 50%
                </div>
              </div>

              {/* Card 2: Supervised Apprenticeships */}
              <div className="p-4 rounded-2xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
                    Supervised Apprenticeships
                  </span>
                  <ChefHat className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-purple-900 dark:text-purple-100">
                    {upskillStats.apprenticeshipCount}
                  </span>
                  <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                    2–3 Months Mentorship
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Critical Gaps (1★ / 20% &amp; &lt;50% Eff)
                </div>
              </div>

              {/* Card 3: Targeted Culinary Courses */}
              <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                    Targeted Culinary Courses
                  </span>
                  <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-blue-900 dark:text-blue-100">
                    {upskillStats.targetedCourseCount}
                  </span>
                  <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                    3–6 Weeks Masterclasses
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Accredited Certification &amp; HACCP
                </div>
              </div>

              {/* Card 4: Cross-Station Training */}
              <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                    Cross-Station Training
                  </span>
                  <RefreshCw className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-900 dark:text-emerald-100">
                    {upskillStats.crossStationCount}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    10–21 Days Line Agility
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Multi-Bay Shift Flexibility
                </div>
              </div>

              {/* Card 5: Active Enrolled Staff */}
              <div className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-xs col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                    Active Enrolled
                  </span>
                  <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-indigo-900 dark:text-indigo-100">
                    {upskillStats.enrolledCount}
                  </span>
                  <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                    In Progress
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Actively Tracked Pathways
                </div>
              </div>
            </div>

            {/* Filter Pills, Search Bar & Station Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
              {/* Program Type Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setUpskillProgramFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    upskillProgramFilter === 'ALL'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  All Pathways ({upskillStats.total})
                </button>
                <button
                  onClick={() => setUpskillProgramFilter('Supervised Apprenticeship')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    upskillProgramFilter === 'Supervised Apprenticeship'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 hover:bg-purple-100'
                  }`}
                >
                  <ChefHat className="h-3.5 w-3.5" />
                  <span>Supervised Apprenticeships ({upskillStats.apprenticeshipCount})</span>
                </button>
                <button
                  onClick={() => setUpskillProgramFilter('Targeted Culinary Course')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    upskillProgramFilter === 'Targeted Culinary Course'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 hover:bg-blue-100'
                  }`}
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>Targeted Courses ({upskillStats.targetedCourseCount})</span>
                </button>
                <button
                  onClick={() => setUpskillProgramFilter('Cross-Station Training')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    upskillProgramFilter === 'Cross-Station Training'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Cross-Station ({upskillStats.crossStationCount})</span>
                </button>
                <button
                  onClick={() => setUpskillProgramFilter('CRITICAL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    upskillProgramFilter === 'CRITICAL'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 hover:bg-rose-100'
                  }`}
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Critical Only ({upskillStats.criticalCount})</span>
                </button>
              </div>

              {/* Station Filter & Search */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={upskillSearchQuery}
                    onChange={(e) => setUpskillSearchQuery(e.target.value)}
                    placeholder="Search chef, ID, course..."
                    className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-hidden w-44 sm:w-52 placeholder:text-slate-400"
                  />
                  {upskillSearchQuery && (
                    <button
                      onClick={() => setUpskillSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>

                <select
                  value={upskillStationFilter}
                  onChange={(e) => setUpskillStationFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-hidden cursor-pointer"
                >
                  <option value="ALL">All Kitchen Stations</option>
                  <option value="Hot Kitchen">Hot Kitchen / Saute</option>
                  <option value="Grill">Grill Station</option>
                  <option value="Cold">Cold &amp; Salad Station</option>
                  <option value="Pizza">Pizza Station</option>
                  <option value="Fryer">Fryer Station</option>
                </select>

                <select
                  value={upskillPageSize}
                  onChange={(e) => setUpskillPageSize(Number(e.target.value))}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-hidden cursor-pointer"
                >
                  <option value={10}>Show 10</option>
                  <option value={20}>Show 20</option>
                  <option value={50}>Show 50</option>
                  <option value={100}>Show All ({filteredUpskillingData.length})</option>
                </select>
              </div>
            </div>

            {/* The Enhanced Upskilling & Cross-Training Target Priority Matrix Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Staff Member</th>
                    <th className="py-3.5 px-3">Target Station</th>
                    <th className="py-3.5 px-3 text-center">Current Score</th>
                    <th className="py-3.5 px-3 text-center">Target Score</th>
                    <th className="py-3.5 px-3 text-center">Skill Gap</th>
                    <th className="py-3.5 px-3 text-center">Risk Level</th>
                    <th className="py-3.5 px-3 text-center">Priority</th>
                    <th className="py-3.5 px-4 min-w-[320px]">Personalized AI Upskilling Pathway</th>
                    <th className="py-3.5 px-4 text-center min-w-[140px]">Enrollment &amp; Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredUpskillingData.slice(0, upskillPageSize).map((u, idx) => {
                    const isEnrolled = !!enrolledPathways[u.Enrollment_Id];
                    const isLowEfficiencyTrigger = (u.Trigger_Reason || '').includes('Efficiency') || (u.Enrollment_Id || '').includes('EFF');
                    const score = Number(u.Current_Skill_Score) || 1;

                    return (
                      <tr
                        key={u.Enrollment_Id || idx}
                        className={`transition-colors ${
                          isLowEfficiencyTrigger
                            ? 'bg-rose-50/60 dark:bg-rose-950/30 border-l-4 border-l-rose-500'
                            : isEnrolled
                              ? 'bg-emerald-50/40 dark:bg-emerald-950/20'
                              : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        {/* Staff Member */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              (u.Chef_Name || '').toLowerCase().includes('trainee')
                                ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                                : 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-700'
                            }`}>
                              {(u.Chef_Name || '').toLowerCase().includes('trainee') ? 'TR' : 'CH'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>{u.Chef_Name}</span>
                                {isLowEfficiencyTrigger && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-rose-600 text-white animate-pulse">
                                    EFF &lt; 50%
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-mono font-semibold">
                                {u.Chef_ID}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Target Station */}
                        <td className="py-3.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                            {u.Target_Station?.includes('Hot Kitchen') && '🔥'}
                            {u.Target_Station?.includes('Grill') && '🥩'}
                            {u.Target_Station?.includes('Cold') && '🥗'}
                            {u.Target_Station?.includes('Pizza') && '🍕'}
                            {u.Target_Station?.includes('Fryer') && '🍟'}
                            <span>{u.Target_Station}</span>
                          </span>
                        </td>

                        {/* Current Score & < 50% Alert */}
                        <td className="py-3.5 px-3 text-center">
                          <div className="font-extrabold text-slate-900 dark:text-white text-xs">
                            {score} / 5
                          </div>
                          <div className="mt-0.5">
                            {score === 1 && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                                20% (&lt;50% Critical)
                              </span>
                            )}
                            {score === 2 && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                40% (&lt;50% Alert)
                              </span>
                            )}
                            {score > 2 && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse">
                                Eff Drop (&lt;50%)
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Target Score */}
                        <td className="py-3.5 px-3 text-center font-black text-emerald-600 dark:text-emerald-400 text-sm">
                          {u.Target_Skill_Score} / 5
                        </td>

                        {/* Skill Gap */}
                        <td className="py-3.5 px-3 text-center">
                          <span className="px-2.5 py-1 rounded-full font-black text-xs bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shadow-2xs">
                            +{u.Skill_Gap} pts
                          </span>
                        </td>

                        {/* Risk Level */}
                        <td className="py-3.5 px-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase shadow-2xs ${
                            u.Station_Risk_Level === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                              : u.Station_Risk_Level === 'HIGH'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          }`}>
                            {u.Station_Risk_Level}
                          </span>
                        </td>

                        {/* Priority */}
                        <td className="py-3.5 px-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase shadow-2xs ${
                            u.Priority === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                              : u.Priority === 'HIGH'
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {u.Priority}
                          </span>
                        </td>

                        {/* AI Upskilling Recommendation & Pathway */}
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                                u.Program_Type === 'Supervised Apprenticeship'
                                  ? 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200 border border-purple-300 dark:border-purple-800'
                                  : u.Program_Type === 'Targeted Culinary Course'
                                    ? 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border border-blue-300 dark:border-blue-800'
                                    : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                              }`}>
                                {u.Program_Type === 'Supervised Apprenticeship' && <ChefHat className="h-3 w-3" />}
                                {u.Program_Type === 'Targeted Culinary Course' && <GraduationCap className="h-3 w-3" />}
                                {u.Program_Type === 'Cross-Station Training' && <RefreshCw className="h-3 w-3" />}
                                <span>{u.Program_Type}</span>
                              </span>
                              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                ⏱️ {u.Duration}
                              </span>
                            </div>

                            <div className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                              {u.Program_Title || u.Recommended_Action}
                            </div>

                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
                              <span className="font-medium">👨‍🏫 Mentor: <strong className="text-slate-700 dark:text-slate-300 font-bold">{u.Mentor}</strong></span>
                              <span className="text-slate-300 dark:text-slate-700">•</span>
                              <span className="text-[10px] text-purple-700 dark:text-purple-300 font-semibold">{u.Trigger_Reason}</span>
                            </div>
                          </div>
                        </td>

                        {/* Action / Enrollment Button */}
                        <td className="py-3.5 px-4 text-center">
                          {isEnrolled ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-extrabold text-[11px] shadow-2xs">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Enrolled</span>
                              </span>
                              <span className="block text-[9px] text-slate-400 font-medium">
                                Active In Progress
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEnrollUpskillPathway(u)}
                              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-extrabold text-[11px] shadow-xs cursor-pointer flex items-center justify-center gap-1.5 mx-auto transition-transform w-full max-w-[130px]"
                            >
                              <Zap className="h-3 w-3" />
                              <span>Enroll Now</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredUpskillingData.length === 0 && (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400 space-y-2">
                  <p className="text-sm font-bold">No pathways match your current filter or search criteria.</p>
                  <button
                    onClick={() => { setUpskillProgramFilter('ALL'); setUpskillStationFilter('ALL'); setUpskillSearchQuery(''); }}
                    className="text-xs font-bold text-purple-600 dark:text-purple-400 underline cursor-pointer"
                  >
                    Reset all filters
                  </button>
                </div>
              )}
            </div>

            {/* Table Footer with Pathway Count & Show More Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                Showing <strong className="text-slate-800 dark:text-slate-200 font-bold">{Math.min(filteredUpskillingData.length, upskillPageSize)}</strong> of <strong className="text-slate-800 dark:text-slate-200 font-bold">{filteredUpskillingData.length}</strong> identified pathways
                {filteredUpskillingData.length !== upskillingData.length && ` (filtered from ${upskillingData.length} total)`}
              </div>

              {filteredUpskillingData.length > upskillPageSize && (
                <button
                  onClick={() => setUpskillPageSize(prev => prev + 15)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer transition-all self-start sm:self-auto"
                >
                  Load Next 15 Pathways ({filteredUpskillingData.length - upskillPageSize} remaining)
                </button>
              )}
            </div>
          </div>
          </>
          )}

          {/* ========================================================================= */}
          {/* SUB-TAB 2: ADD NEW STAFF MEMBER (ADMIN ONBOARDING VIEW)                    */}
          {/* ========================================================================= */}
          {isAdmin && staffSubTab === 'onboard' && (
            <div className="space-y-6 animate-fade-in">
              {/* Header Banner */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-700/25 shrink-0">
                      {adminStaffView === 'matrix' ? <Database className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                          Admin Portal
                        </span>
                        <span className="text-xs text-slate-400">
                          {adminStaffView === 'matrix' ? '• Staff Skill & Station Allocation Matrix (View, Edit & Delete)' : '• New Culinary Personnel Onboarding'}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                        {adminStaffView === 'matrix' ? 'Staff Skill & Station Allocation Matrix' : 'Register & Assess New Kitchen Staff Member'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl font-medium">
                        {adminStaffView === 'matrix'
                          ? 'Strictly restricted admin workforce roster: complete station skill ratings, shift allocations, efficiency benchmarks, and inline profile editing & deletion.'
                          : 'Add newly joined culinary staff, assign baseline station & shift schedules, evaluate multi-station competencies (1–5★), and configure AI-guided succession milestones.'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    {/* View Switcher Buttons */}
                    <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setAdminStaffView('onboard')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                          adminStaffView === 'onboard'
                            ? 'bg-emerald-700 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>Add New Staff Member</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdminStaffView('matrix')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                          adminStaffView === 'matrix'
                            ? 'bg-emerald-700 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Database className="h-3.5 w-3.5" />
                        <span>Staff Skill & Station Allocation Matrix</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStaffSubTab('directory')}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Users className="h-4 w-4" />
                      <span>View Directory ({data?.staff?.length || 30})</span>
                    </button>
                  </div>
                </div>

                {/* Banner when a staff member was just added */}
                {lastAddedStaff && (
                  <div className="mt-5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
                        <CheckCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                          {lastAddedStaff.name} ({lastAddedStaff.emp_id}) was successfully registered!
                        </div>
                        <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                          Assigned to <span className="font-bold">{lastAddedStaff.assigned_station}</span> • Shift: {lastAddedStaff.shift} • Efficiency: {lastAddedStaff.efficiency_rating}%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setStaffSubTab('directory')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        View in Directory →
                      </button>
                      <button
                        type="button"
                        onClick={() => setLastAddedStaff(null)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* VIEW 1: STAFF SKILL & STATION ALLOCATION MATRIX (ADMIN VIEW) */}
              {adminStaffView === 'matrix' && (
                <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xs space-y-4 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Database className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        Staff Skill & Station Allocation Matrix
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Complete workforce roster with station skill ratings, shift allocations, and efficiency benchmarks
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase text-[10px]">
                        <tr>
                          <th className="py-3 px-4">Staff Member</th>
                          <th className="py-3 px-3">Primary Bay</th>
                          <th className="py-3 px-3">Shift Hours</th>
                          <th className="py-3 px-3 text-center">Efficiency</th>
                          <th className="py-3 px-2 text-center">Hot Kitchen</th>
                          <th className="py-3 px-2 text-center">Grill</th>
                          <th className="py-3 px-2 text-center">Cold Salad</th>
                          <th className="py-3 px-2 text-center">Pizza</th>
                          <th className="py-3 px-2 text-center">Fryer</th>
                          <th className="py-3 px-4">Identified Skill-Gap</th>
                          <th className="py-3 px-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                        {filteredStaffList.map((m) => (
                          <tr key={m.id || m.emp_id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                  {m.emp_id || m.id}
                                </span>
                                <div>
                                  <div className="font-bold text-slate-900 dark:text-white">{m.name}</div>
                                  <div className="text-[10px] text-slate-500 dark:text-slate-400">{m.skill_level}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">{m.assigned_station}</td>
                            <td className="py-3 px-3 text-slate-500 dark:text-slate-400 text-[11px]">{m.shift || '10:00 AM - 08:30 PM'}</td>
                            <td className="py-3 px-3 text-center">
                              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{m.efficiency_rating ?? 85}%</span>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span className="px-2 py-0.5 rounded font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">{m.hot_kitchen || 4}★</span>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span className="px-2 py-0.5 rounded font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">{m.grill_station || 4}★</span>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span className="px-2 py-0.5 rounded font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">{m.cold_salad || 4}★</span>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span className="px-2 py-0.5 rounded font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">{m.pizza_station || 4}★</span>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span className="px-2 py-0.5 rounded font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">{m.fryer_station || 4}★</span>
                            </td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-[11px]">
                              {m.skill_gap || 'Foundation Line Pace'}
                            </td>
                            <td className="py-3 px-3 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleOpenEditStaff(m)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 dark:bg-slate-800 dark:hover:bg-emerald-950/60 text-slate-600 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-400 transition-colors cursor-pointer shadow-2xs"
                                  title={`Edit profile for ${m.name}`}
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeletingStaff(m)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950/60 text-slate-600 hover:text-rose-700 dark:text-slate-300 dark:hover:text-rose-400 transition-colors cursor-pointer shadow-2xs"
                                  title={`Delete ${m.name}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* VIEW 2: ADD NEW STAFF MEMBER (ADMIN ONBOARDING VIEW) */}
              {adminStaffView === 'onboard' && (
              /* Form & Live Preview Grid */
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                
                {/* LEFT: Onboarding Form (7 Columns) */}
                <form onSubmit={handleRegisterStaff} className="xl:col-span-7 space-y-6">
                  
                  {/* Card 1: Staff Identification & Role */}
                  <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xs space-y-4">
                    <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
                      <ChefHat className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                        1. Staff Identification & Culinary Role
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Chef / Staff Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={newStaffForm.name}
                          onChange={(e) => setNewStaffForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g. Chef Nuwan Bandara"
                          className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        />
                      </div>

                      {/* Employee ID */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Employee ID
                          </label>
                          <span className="text-[10px] text-slate-400">Auto-assigned</span>
                        </div>
                        <input
                          type="text"
                          value={newStaffForm.emp_id}
                          onChange={(e) => setNewStaffForm(prev => ({ ...prev, emp_id: e.target.value }))}
                          placeholder={`EMP${(data?.staff?.length || 30) + 1}`}
                          className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        />
                      </div>

                      {/* Role / Designation */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Kitchen Role / Designation
                        </label>
                        <select
                          value={newStaffForm.role}
                          onChange={(e) => {
                            const newRole = e.target.value;
                            setNewStaffForm(prev => {
                              const derived = computeDerivedStaffMetrics(prev, newRole, prev.base_station);
                              return {
                                ...prev,
                                role: newRole,
                                career_progression: derived.derivedProgression
                              };
                            });
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
                        >
                          <option value="Executive Chef (Level 5)">Executive Chef (Level 5)</option>
                          <option value="Executive Sous Chef (Level 4)">Executive Sous Chef (Level 4)</option>
                          <option value="Chef de Partie (Level 3)">Chef de Partie - CDP (Level 3)</option>
                          <option value="Demi Chef de Partie (Level 3)">Demi Chef de Partie (Level 3)</option>
                          <option value="Station Line Specialist (Level 3)">Station Line Specialist (Level 3)</option>
                          <option value="Commis I (Level 2)">Commis I (Level 2)</option>
                          <option value="Commis II (Level 2)">Commis II (Level 2)</option>
                          <option value="Kitchen Trainee (Level 1)">Kitchen Trainee / Apprentice (Level 1)</option>
                        </select>
                      </div>

                      {/* Phone Contact */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Contact / Mobile Number
                        </label>
                        <input
                          type="text"
                          value={newStaffForm.contact_phone}
                          onChange={(e) => setNewStaffForm(prev => ({ ...prev, contact_phone: e.target.value }))}
                          placeholder="+94 77 123 4567"
                          className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        />
                      </div>

                      {/* Joining Date */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Joining / Effective Date
                        </label>
                        <input
                          type="date"
                          value={newStaffForm.join_date}
                          onChange={(e) => setNewStaffForm(prev => ({ ...prev, join_date: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Primary Station & Shift Assignment */}
                  <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xs space-y-4">
                    <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
                      <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                        2. Station Assignment & Shift Schedule
                      </h4>
                    </div>

                    {/* Primary Station Tiles */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Primary Base Station
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                        {[
                          { key: 'Hot Kitchen', label: 'Hot Kitchen', sub: 'Saute & Wok', icon: Flame, color: 'text-amber-500' },
                          { key: 'Grill', label: 'Grill Station', sub: 'Sear & Steaks', icon: Award, color: 'text-rose-500' },
                          { key: 'Cold Salad', label: 'Cold Salad', sub: 'Pantry & Prep', icon: Coffee, color: 'text-emerald-500' },
                          { key: 'Pizza', label: 'Pizza Station', sub: 'Deck Oven', icon: Pizza, color: 'text-purple-500' },
                          { key: 'Fryer', label: 'Fryer Station', sub: 'Crispy Line', icon: Zap, color: 'text-yellow-500' }
                        ].map((st) => {
                          const isSelected = newStaffForm.base_station.toLowerCase().includes(st.key.toLowerCase());
                          const StIcon = st.icon;
                          return (
                            <button
                              key={st.key}
                              type="button"
                              onClick={() => setNewStaffForm(prev => ({ ...prev, base_station: st.key }))}
                              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 dark:border-emerald-500 shadow-xs ring-2 ring-emerald-500/20'
                                  : 'bg-slate-50/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                              }`}
                            >
                              <StIcon className={`h-4 w-4 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : st.color}`} />
                              <div className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">
                                {st.label}
                              </div>
                              <span className="text-[9px] text-slate-400">{st.sub}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Shift Hours */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Work Shift Schedule
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { shift: "07:00 AM - 04:00 PM", label: "Morning Prep Shift (07:00 – 16:00)" },
                          { shift: "10:00 AM - 07:00 PM", label: "Mid-Day Peak Shift (10:00 – 19:00)" },
                          { shift: "11:00 AM - 09:30 PM", label: "Lunch & Dinner Split (11:00 – 21:30)" },
                          { shift: "01:00 PM - 10:00 PM", label: "Afternoon & Dinner (13:00 – 22:00)" },
                          { shift: "03:00 PM - 11:00 PM", label: "Late Night Closing (15:00 – 23:00)" }
                        ].map((s) => (
                          <button
                            key={s.shift}
                            type="button"
                            onClick={() => setNewStaffForm(prev => ({ ...prev, shift: s.shift }))}
                            className={`px-3 py-2 rounded-xl text-left text-xs transition-all flex items-center justify-between border cursor-pointer ${
                              newStaffForm.shift === s.shift
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold ring-1 ring-emerald-500'
                                : 'bg-slate-50/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:border-slate-300'
                            }`}
                          >
                            <span>{s.label}</span>
                            {newStaffForm.shift === s.shift && <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Station Competency Star Ratings (1-5★) */}
                  <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2.5">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                            3. Station Competency Star Ratings (1 – 5 Stars ★)
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Click stars to evaluate chef's skill proficiency across all 5 kitchen stations
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full font-bold">
                        1=Novice • 3=Competent • 5=Master
                      </span>
                    </div>

                    <div className="space-y-3.5">
                      {[
                        { key: 'hot_kitchen', label: 'Hot Kitchen / Saute', icon: Flame, color: 'text-amber-500', desc: 'Saute, curries, fast wok stir-fry and high-heat pacing' },
                        { key: 'grill_station', label: 'Grill Station', icon: Award, color: 'text-rose-500', desc: 'Steak doneness, seafood charbroil and HACCP core temps' },
                        { key: 'cold_salad', label: 'Cold Salad & Garde Manger', icon: Coffee, color: 'text-emerald-500', desc: 'Salad prep, fresh bowls, pantry dressing emulsions' },
                        { key: 'pizza_station', label: 'Pizza Station', icon: Pizza, color: 'text-purple-500', desc: 'Deck oven proofing, dough stretching and woodfire bake' },
                        { key: 'fryer_station', label: 'Fryer Station', icon: Zap, color: 'text-yellow-500', desc: 'Deep fryer oil temperature recovery and appetizer batches' }
                      ].map((station) => {
                        const score = Number(newStaffForm[station.key]) || 3;
                        const ratingLabels = ["", "1★ Novice", "2★ Developing", "3★ Competent", "4★ Advanced Lead", "5★ Master Specialist"];
                        const badgeColors = [
                          "",
                          "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
                          "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
                          "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
                          "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
                          "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        ];

                        return (
                          <div
                            key={station.key}
                            className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <station.icon className={`h-4 w-4 ${station.color}`} />
                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                  {station.label}
                                </span>
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${badgeColors[score]}`}>
                                  {ratingLabels[score]}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                {station.desc}
                              </p>
                            </div>

                            {/* Clickable 5 Stars */}
                            <div className="flex items-center gap-1.5 shrink-0 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                              {[1, 2, 3, 4, 5].map((starNum) => (
                                <button
                                  key={starNum}
                                  type="button"
                                  onClick={() => handleStaffRatingChange(station.key, starNum)}
                                  className="p-1 hover:scale-125 transition-transform cursor-pointer"
                                  title={`Rate ${starNum} Stars for ${station.label}`}
                                >
                                  <Star
                                    className={`h-4 w-4 transition-colors ${
                                      starNum <= score
                                        ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                                        : 'text-slate-200 dark:text-slate-700 hover:text-amber-200'
                                    }`}
                                  />
                                </button>
                              ))}
                              <span className="text-xs font-black text-slate-700 dark:text-slate-300 ml-1">
                                {score} / 5
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card 4: AI Skill-Gap & Succession Planning */}
                  <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xs space-y-4">
                    <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
                      <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                        4. Performance Benchmarks & Succession Planning
                      </h4>
                    </div>

                    <div className="space-y-4">
                      {/* Efficiency Rating Slider */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Baseline Efficiency Benchmark
                          </label>
                          <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                            {newStaffForm.efficiency_rating}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="98"
                          value={newStaffForm.efficiency_rating}
                          onChange={(e) => setNewStaffForm(prev => ({ ...prev, efficiency_rating: Number(e.target.value) }))}
                          className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                          <span>50% (Trainee Entry)</span>
                          <span>75% (Standard Line)</span>
                          <span>98% (Master Specialist)</span>
                        </div>
                      </div>

                      {/* Identified Skill-Gap */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Identified Skill-Gap (Auto-Derived from Lowest Bay)
                        </label>
                        <input
                          type="text"
                          value={newStaffForm.skill_gap}
                          onChange={(e) => setNewStaffForm(prev => ({ ...prev, skill_gap: e.target.value }))}
                          placeholder="e.g. Cold Salad Presentation & Fast Dressing Emulsions"
                          className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        />
                      </div>

                      {/* Training Recommendation */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Personalized Training Recommendation
                        </label>
                        <input
                          type="text"
                          value={newStaffForm.training_recommendation}
                          onChange={(e) => setNewStaffForm(prev => ({ ...prev, training_recommendation: e.target.value }))}
                          placeholder="e.g. Enrolled in High-Volume Stir-Fry Optimization Module"
                          className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        />
                      </div>

                      {/* Career Progression */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Career Progression Pathway
                        </label>
                        <input
                          type="text"
                          value={newStaffForm.career_progression}
                          onChange={(e) => setNewStaffForm(prev => ({ ...prev, career_progression: e.target.value }))}
                          placeholder="e.g. Target: Line Specialist Track (72% Milestones Complete)"
                          className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Actions Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <button
                      type="button"
                      onClick={handleResetStaffForm}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Reset Form</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmittingStaff}
                      className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-700/25 transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                    >
                      {isSubmittingStaff ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Registering Staff Member...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          <span>Register & Onboard Staff Member</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* RIGHT: Live Profile Preview (5 Columns) */}
                <div className="xl:col-span-5 space-y-4">
                  <div className="sticky top-20 space-y-4">
                    
                    {/* Preview Card Header */}
                    <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <BadgeCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                            Real-Time Profile Preview
                          </h4>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live Card
                        </span>
                      </div>

                      {/* Mirror of the Staff Directory Card */}
                      <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border-2 border-emerald-500/40 shadow-md space-y-4">
                        {/* Top: Name & Badges */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
                              {(newStaffForm.name || "Chef").split(" ").map(w => w[0]).slice(0, 2).join("")}
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                                {newStaffForm.name || "Chef Full Name"}
                              </h4>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                <span className="font-bold text-slate-700 dark:text-slate-300">{newStaffForm.role}</span>
                                <span>•</span>
                                <span>{newStaffForm.base_station}</span>
                              </div>
                            </div>
                          </div>
                          
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-black bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shrink-0">
                            {newStaffForm.emp_id || `EMP${(data?.staff?.length || 30) + 1}`}
                          </span>
                        </div>

                        {/* Shift and Assigned Station */}
                        <div className="flex items-center justify-between text-[11px] p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 font-semibold">
                          <span className="text-slate-500 dark:text-slate-400">Assigned Shift:</span>
                          <span className="text-slate-800 dark:text-slate-200 font-bold">{newStaffForm.shift}</span>
                        </div>

                        {/* Efficiency & Speed Benchmark */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/80">
                            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                              Efficiency Rating
                            </span>
                            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                              {newStaffForm.efficiency_rating}%
                            </div>
                            <span className="text-[9px] text-emerald-700 dark:text-emerald-300 font-medium">
                              Optimal Line Performance
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                              Speed Score
                            </span>
                            <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                              {((Number(newStaffForm.hot_kitchen || 3) + Number(newStaffForm.grill_station || 3) + Number(newStaffForm.cold_salad || 3) + Number(newStaffForm.pizza_station || 3) + Number(newStaffForm.fryer_station || 3)) / 5.0 * 0.85 + 0.65).toFixed(1)} / 5.0
                            </div>
                            <span className="text-[9px] text-slate-400 font-medium">
                              5-Bay Mean Index
                            </span>
                          </div>
                        </div>

                        {/* Station Competencies (5 Bars) */}
                        <div className="space-y-2 pt-1">
                          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                            Evaluated Station Competencies
                          </span>
                          <div className="space-y-1.5">
                            {[
                              { label: 'Hot Kitchen', val: newStaffForm.hot_kitchen, color: 'bg-amber-500' },
                              { label: 'Grill Station', val: newStaffForm.grill_station, color: 'bg-rose-500' },
                              { label: 'Cold Salad', val: newStaffForm.cold_salad, color: 'bg-emerald-500' },
                              { label: 'Pizza Station', val: newStaffForm.pizza_station, color: 'bg-purple-500' },
                              { label: 'Fryer Station', val: newStaffForm.fryer_station, color: 'bg-yellow-500' }
                            ].map(s => (
                              <div key={s.label} className="flex items-center justify-between text-[10px] font-bold">
                                <span className="text-slate-600 dark:text-slate-400">{s.label}</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full ${s.color} rounded-full`}
                                      style={{ width: `${(Number(s.val || 3) / 5) * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="w-6 text-right font-mono text-slate-900 dark:text-white">
                                    {s.val}★
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Identified Skill Gap & Training Alert */}
                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-1">
                          <span className="text-[10px] font-black uppercase text-amber-800 dark:text-amber-400 flex items-center gap-1">
                            <AlertTriangle className="h-3.5 w-3.5" /> Identified Skill Gap:
                          </span>
                          <p className="text-xs text-slate-900 dark:text-white font-bold leading-tight">
                            {newStaffForm.skill_gap || "General Line Speed & Temperature Recovery"}
                          </p>
                        </div>

                        {/* Training Recommendation */}
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                          <span className="font-extrabold text-slate-900 dark:text-white block">
                            Recommended Training:
                          </span>
                          <p className="italic leading-tight">
                            "{newStaffForm.training_recommendation || "Cross-station training module"}"
                          </p>
                        </div>

                        {/* Career Progression */}
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          <span className="truncate">{newStaffForm.career_progression}</span>
                        </div>
                      </div>
                    </div>

                    {/* Admin Onboarding Checklist Info */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        Admin Auto-Provisioning Checklist:
                      </div>
                      <ul className="space-y-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-emerald-500" /> Automatically records into workforce CSV database.
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-emerald-500" /> Enters Roster Matrix & Station Skill Balance.
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-emerald-500" /> Logs mandatory cross-training if any station is ≤ 2★.
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-emerald-500" /> Enables dynamic AI surge reallocation recommendations.
                        </li>
                      </ul>
                    </div>

                  </div>
                </div>

              </div>
              )}
            </div>
          )}

        </div>
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

                {/* Staff Member Active Surge Reallocation Directive Banner */}
                {(() => {
                  const staffDir = stationDishAnalysis?.staffDirectivesMap?.get(formData.staffId) ||
                                   stationDishAnalysis?.staffDirectivesMap?.get(formData.name) ||
                                   stationDishAnalysis?.staffDirectivesMap?.get(formData.name?.split('(')[0]?.trim());
                  if (!staffDir) return null;
                  const targetSt = staffDir.station || staffDir.targetStation || "Pizza";
                  const fromSt = staffDir.currentStation || staffDir.fromStation || formData.assigned_station || "Prep Station";
                  const score = staffDir.stationSkillScore || staffDir.skillRating || 4;

                  return (
                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border-2 border-amber-500 text-amber-950 dark:text-amber-100 space-y-2.5 animate-pulse shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                          ACTIVE STATION SURGE DIRECTIVE
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
                          Target: {targetSt} Station
                        </span>
                      </div>
                      <p className="text-xs font-semibold leading-relaxed">
                        {staffDir.message || `Surge of ${staffDir.pendingDishes || 10} orders detected at ${targetSt}. Move from ${fromSt} to ${targetSt}. Qualified skill: ${score}★.`}
                      </p>
                      <div className="pt-1 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                          Assigned: {fromSt} → {targetSt}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            handleExecuteStaffReallocation(formData.name, formData.assigned_station, targetSt, `Direct profile transfer to ${targetSt}`);
                            setShowSelfAssessmentModal(false);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5 transition-transform active:scale-95"
                        >
                          <Zap className="h-3.5 w-3.5" />
                          <span>Acknowledge & Transfer to {targetSt}</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}

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

      {/* 🚨 DYNAMIC POP-UP ALERT MODAL: Triggers automatically for ANY station experiencing a high volume of orders */}
      {showSurgeModal && stationDishAnalysis?.surgeAlerts?.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border-2 border-rose-500 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-rose-100 dark:border-rose-950 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/30 animate-bounce">
                  <Flame className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                      🚨 Real-Time High Volume Alert
                    </span>
                    <span className="text-xs text-slate-400">• Dynamic Station Monitoring</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                    Station Overload Surge Detected
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    A large volume of orders has arrived. Skilled staff members from less busy stations are recommended below for immediate reallocation.
                  </p>
                </div>
              </div>

              <button
                onClick={handleDismissSurgeModal}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="Acknowledge and close alert pop-up"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Overloaded Stations & Staff Recommendations List */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {stationDishAnalysis.surgeAlerts
                .filter(alert => {
                  const targetStation = alert.station || alert.stationName || "Pizza";
                  return !stabilizedStations.has(targetStation) && !dismissedSurgeStations.has(targetStation);
                })
                .map((alert, alertIdx) => {
                const targetStation = alert.station || alert.stationName || "Pizza";
                const stationIcon = targetStation === "Pizza" ? "🍕"
                  : targetStation === "Hot Kitchen" ? "🍳"
                  : targetStation === "Grill" ? "🥩"
                  : targetStation === "Cold Salad" ? "🥗"
                  : "🍤";

                return (
                  <div
                    key={targetStation || alertIdx}
                    className="p-4 rounded-xl bg-gradient-to-r from-rose-50/80 via-amber-50/50 to-rose-50/80 dark:from-rose-950/60 dark:via-amber-950/40 dark:to-rose-950/60 border-2 border-rose-500 shadow-md space-y-3.5"
                  >
                    {/* Station Alert Summary Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-200 dark:border-rose-900/60 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{stationIcon}</span>
                          <h4 className="text-sm font-black text-rose-900 dark:text-rose-100 uppercase tracking-wide">
                            {targetStation} Station Overloaded ({alert.pendingDishes || 0} Incoming Orders)
                          </h4>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white shadow-xs">
                            Load Ratio: {alert.ratio} dishes/cook
                          </span>
                        </div>
                        <p className="text-xs text-rose-800 dark:text-rose-300 font-semibold mt-1">
                          Incoming dish queue: <span className="font-extrabold">{alert.dishSummary}</span>
                        </p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                          Currently staffed: <span className="font-bold">{alert.currentCooks} cook(s)</span> • Target capacity needed: <span className="font-bold text-rose-700 dark:text-rose-400">+{alert.neededStaffCount || 1} skilled cook(s)</span>
                        </p>
                      </div>

                      {alert.recommendedStaff?.length > 1 && (
                        <button
                          onClick={async () => {
                            for (const cand of alert.recommendedStaff) {
                              await handleExecuteStaffReallocation(
                                cand.staffName,
                                cand.currentStation || cand.fromStation || "Prep Station",
                                targetStation,
                                `Surge emergency multi-reallocation to ${targetStation}`
                              );
                            }
                            setDismissedSurgeStations(prev => new Set([...prev, targetStation]));
                          }}
                          className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md cursor-pointer flex items-center gap-1.5 self-start sm:self-auto shrink-0 transition-all hover:scale-105 active:scale-95"
                        >
                          <Zap className="h-4 w-4" />
                          <span>Reassign All ({alert.recommendedStaff.length})</span>
                        </button>
                      )}
                    </div>

                    {/* Skill-Based Candidates */}
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                        <span className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                          Qualified Staff Recommended For Immediate Reassignment ({alert.recommendedStaff?.length || 0} Options):
                        </span>
                        <button
                          onClick={() => handleRotateCandidate(targetStation)}
                          className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[11px] font-extrabold text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 cursor-pointer flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 self-start sm:self-auto"
                          title="Rotate through other qualified candidates from our real staff dataset"
                        >
                          <RefreshCw className="h-3 w-3 text-purple-600" />
                          <span>Rotate Candidate Pool</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {alert.recommendedStaff?.map((cand, idx) => {
                          const candName = (cand.staffName || "Chef").split('(')[0].trim();
                          const candFrom = cand.currentStation || cand.fromStation || "Prep Station";
                          const candScore = cand.stationSkillScore || cand.skillRating || 4;
                          const isFloat = (cand.staffName || "").toLowerCase().includes("float") || (cand.skillLevel || "").toLowerCase().includes("float");

                          return (
                            <div
                              key={cand.staffId || idx}
                              className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-900 shadow-xs flex flex-col justify-between gap-2.5 hover:border-purple-300 transition-colors"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1.5">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${
                                      isFloat ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                                    }`}>
                                      {isFloat ? 'FL' : 'CH'}
                                    </div>
                                    <span className="text-xs font-black text-slate-900 dark:text-white">
                                      {candName}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shrink-0">
                                    {candScore}★ {targetStation} Skill
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                  Currently at: <span className="font-semibold text-slate-700 dark:text-slate-300">{candFrom}</span> • <span className="text-emerald-700 dark:text-emerald-400 font-bold">{cand.efficiency || 85}% Eff</span>
                                </div>
                                {cand.reason && (
                                  <p className="text-[10px] text-rose-700 dark:text-rose-400 font-semibold line-clamp-2 leading-tight">
                                    {cand.reason}
                                  </p>
                                )}
                              </div>

                              <button
                                onClick={async () => {
                                  await handleExecuteStaffReallocation(
                                    cand.staffName,
                                    candFrom,
                                    targetStation,
                                    `Direct surge reallocation to ${targetStation}`
                                  );
                                  setDismissedSurgeStations(prev => new Set([...prev, targetStation]));
                                }}
                                className="w-full px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center justify-center gap-1.5 shrink-0 transition-transform active:scale-95"
                                title={`Reassign ${candName} from ${candFrom} to ${targetStation}`}
                              >
                                <Zap className="h-3.5 w-3.5" />
                                <span>Acknowledge & Transfer to {targetStation}</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                💡 Reassignments also display on staff profiles & station cards in real-time.
              </span>
              <button
                onClick={handleDismissSurgeModal}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer transition-colors"
              >
                Dismiss Alert Pop-Up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADMIN EDIT STAFF PROFILE MODAL                                             */}
      {/* ========================================================================= */}
      {isAdmin && editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                  <Edit3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Update Staff Profile & Competencies
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                    Editing profile for <span className="font-bold text-slate-800 dark:text-slate-200">{editingStaff.name}</span> ({editingStaff.emp_id || editingStaff.id})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSaveEditStaff} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Staff Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editStaffForm.name}
                    onChange={(e) => setEditStaffForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>

                {/* Role / Skill Level */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kitchen Role & Level
                  </label>
                  <select
                    value={editStaffForm.role}
                    onChange={(e) => setEditStaffForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden cursor-pointer"
                  >
                    <option value="Executive Chef (Level 5)">Executive Chef (Level 5)</option>
                    <option value="Executive Sous Chef (Level 4)">Executive Sous Chef (Level 4)</option>
                    <option value="Station Specialist (Level 3)">Station Specialist (Level 3)</option>
                    <option value="Chef de Partie (Level 3)">Chef de Partie (Level 3)</option>
                    <option value="Float Specialist">Float Specialist (Cross-Station Lead)</option>
                    <option value="Commis Chef (Level 2)">Commis Chef (Level 2)</option>
                    <option value="Kitchen Trainee (Level 1)">Kitchen Trainee (Level 1)</option>
                  </select>
                </div>

                {/* Primary Station */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Kitchen Station
                  </label>
                  <select
                    value={editStaffForm.base_station}
                    onChange={(e) => setEditStaffForm(prev => ({ ...prev, base_station: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden cursor-pointer"
                  >
                    <option value="Hot Kitchen">Hot Kitchen / Saute</option>
                    <option value="Grill">Grill Station</option>
                    <option value="Cold Salad">Cold Salad & Garde Manger</option>
                    <option value="Pizza">Pizza Station</option>
                    <option value="Fryer">Fryer Station</option>
                  </select>
                </div>

                {/* Shift Hours */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Shift Assignment
                  </label>
                  <select
                    value={editStaffForm.shift}
                    onChange={(e) => setEditStaffForm(prev => ({ ...prev, shift: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden cursor-pointer"
                  >
                    <option value="07:00 AM - 04:00 PM">Morning Shift (07:00 AM - 04:00 PM)</option>
                    <option value="01:00 PM - 10:00 PM">Afternoon Shift (01:00 PM - 10:00 PM)</option>
                    <option value="03:00 PM - 11:00 PM">Night Rush Shift (03:00 PM - 11:00 PM)</option>
                    <option value="10:00 AM - 08:30 PM">All-Day Executive (10:00 AM - 08:30 PM)</option>
                    <option value="11:00 AM - 09:30 PM">Mid-Day Flex (11:00 AM - 09:30 PM)</option>
                  </select>
                </div>
              </div>

              {/* Efficiency Rating Slider */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span>Efficiency Benchmark Rating:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                    editStaffForm.efficiency_rating >= 80 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                    editStaffForm.efficiency_rating >= 60 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                    'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    {editStaffForm.efficiency_rating}%
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="1"
                  value={editStaffForm.efficiency_rating}
                  onChange={(e) => setEditStaffForm(prev => ({ ...prev, efficiency_rating: Number(e.target.value) }))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Station Star Ratings */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Station Skill Competency Ratings (1★ to 5★):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { key: 'hot_kitchen', label: 'Hot Kitchen' },
                    { key: 'grill_station', label: 'Grill' },
                    { key: 'cold_salad', label: 'Cold Salad' },
                    { key: 'pizza_station', label: 'Pizza' },
                    { key: 'fryer_station', label: 'Fryer' }
                  ].map(st => (
                    <div key={st.key} className="bg-slate-50 dark:bg-slate-800/80 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-center space-y-1">
                      <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{st.label}</div>
                      <select
                        value={editStaffForm[st.key]}
                        onChange={(e) => setEditStaffForm(prev => ({ ...prev, [st.key]: Number(e.target.value) }))}
                        className="w-full text-center text-xs font-black py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-amber-600 dark:text-amber-400 cursor-pointer"
                      >
                        <option value="1">1★ Basic</option>
                        <option value="2">2★ Novice</option>
                        <option value="3">3★ Skilled</option>
                        <option value="4">4★ Advanced</option>
                        <option value="5">5★ Master</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skill Gap & Training */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Identified Skill Gap
                  </label>
                  <input
                    type="text"
                    value={editStaffForm.skill_gap}
                    onChange={(e) => setEditStaffForm(prev => ({ ...prev, skill_gap: e.target.value }))}
                    placeholder="e.g. High-Volume Wood Oven Proofing"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    AI Training Recommendation
                  </label>
                  <input
                    type="text"
                    value={editStaffForm.training_recommendation}
                    onChange={(e) => setEditStaffForm(prev => ({ ...prev, training_recommendation: e.target.value }))}
                    placeholder="e.g. Foundation Deep Fryer Safety & Oil Filtration"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white outline-hidden"
                  />
                </div>
              </div>

              {/* Career Progression Pathway */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Career Progression Track
                </label>
                <input
                  type="text"
                  value={editStaffForm.career_progression}
                  onChange={(e) => setEditStaffForm(prev => ({ ...prev, career_progression: e.target.value }))}
                  placeholder="e.g. Head of Pizza Track (82% Completed)"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStaff}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 cursor-pointer flex items-center gap-2 transition-all disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  <span>{isUpdatingStaff ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADMIN DELETE STAFF MEMBER CONFIRMATION MODAL                               */}
      {/* ========================================================================= */}
      {isAdmin && deletingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-rose-200 dark:border-rose-900/80 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950/80">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Remove Staff Member?
                </h3>
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                  Permanent Kitchen Roster Action
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-900 dark:text-white">{deletingStaff.name}</strong> ({deletingStaff.emp_id || deletingStaff.id}) from the active kitchen workforce?
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Primary Bay:</span>
                <span className="font-bold text-slate-900 dark:text-white">{deletingStaff.assigned_station}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Shift Hours:</span>
                <span className="font-bold text-slate-900 dark:text-white">{deletingStaff.shift || 'Standard Shift'}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Efficiency Rating:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{deletingStaff.efficiency_rating ?? 85}%</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingStaff(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingStaff}
                onClick={handleConfirmDeleteStaff}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-rose-600/20 cursor-pointer flex items-center gap-1.5 transition-all disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                <span>{isDeletingStaff ? 'Removing...' : 'Confirm Remove'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}