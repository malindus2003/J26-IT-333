import React, { useState, useEffect, useRef } from 'react';
import { Users, Clock, Flame, Award, AlertTriangle, ArrowRight, ShieldCheck, CheckCircle2, TrendingUp, Utensils, X, Lock, LogIn, Key, Smartphone, Coffee, ChefHat, Send, CheckSquare, Pizza, Plus, Minus, Hash, Search, ChevronDown, ChevronLeft, ChevronRight, LayoutDashboard, Check } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ReferenceArea } from 'recharts';
import axios from 'axios';

// 5 Kitchen Operational Subparts for Dropdown Navigation
const KITCHEN_PARTS = [
  {
    id: 'stations',
    title: 'Kitchen Station Workload & Queue Status',
    shortTitle: 'Station Monitors',
    description: 'Real-time queue load, active cooks, bottlenecks & capacity alerts across all 5 stations',
    icon: Utensils,
    badge: '5 Stations',
    badgeColor: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
  },
  {
    id: 'routing',
    title: 'Real-Time Order Routing & Task Dispatch',
    shortTitle: 'Order Routing',
    description: 'Active order queue split across cooking, grill & beverage lines with waiter simulator',
    icon: Send,
    badge: 'Live Routing',
    badgeColor: 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-700'
  },
  {
    id: 'directives',
    title: 'AI Staff Allocation & Directives',
    shortTitle: 'AI Directives',
    description: 'Real-time dynamic queue directives, shift efficiency floor & surge simulation',
    icon: Flame,
    badge: 'AI Engine',
    badgeColor: 'bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-300 border-orange-300 dark:border-orange-700'
  },
  {
    id: 'rush',
    title: 'Peak-Hour Workload & Staffing Forecast',
    shortTitle: 'Peak-Hour Rush',
    description: 'Hourly staffing curves (07:00-22:30) with breakfast, lunch, dinner & seasonal rush overlays',
    icon: TrendingUp,
    badge: 'Demand Curve',
    badgeColor: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-700'
  },
  {
    id: 'staff',
    title: 'Staff Skill-Gap Analysis & Progression',
    shortTitle: 'Staff Skills',
    description: 'Staff skill matrices, cross-station training paths & staff self-assessment portal',
    icon: Users,
    badge: 'Line Staff',
    badgeColor: 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-700'
  },
  {
    id: 'all',
    title: 'Full Kitchen System (All Sections)',
    shortTitle: 'All Sections',
    description: 'Complete view across stations, live routing, rush charts, staff skills & directives',
    icon: LayoutDashboard,
    badge: 'All Views',
    badgeColor: 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
  }
];

export default function KitchenStaffDashboard({ isDarkMode, currentRole = 'admin' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showSeasonalRush, setShowSeasonalRush] = useState(true);
  const [showLunchRush, setShowLunchRush] = useState(true);
  const [showBreakfastRush, setShowBreakfastRush] = useState(true);
  const [showDinnerRush, setShowDinnerRush] = useState(true);
  const [simulateLowEfficiency, setSimulateLowEfficiency] = useState(false);
  const [dismissedToast, setDismissedToast] = useState("");

  const [shiftEfficiency, setShiftEfficiency] = useState("88.5%");
  const [shiftPrepTime, setShiftPrepTime] = useState("7.4 mins");
  const [last4HourUpdate, setLast4HourUpdate] = useState("Shift Sync Active (Auto-updates every 4 Hours)");

  // Kitchen Subpart Navigation State ('stations', 'routing', 'directives', 'rush', 'staff', 'all')
  const [activeKitchenPart, setActiveKitchenPart] = useState('stations');
  const [kitchenDropdownOpen, setKitchenDropdownOpen] = useState(false);
  const kitchenDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (kitchenDropdownRef.current && !kitchenDropdownRef.current.contains(e.target)) {
        setKitchenDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentKitchenIndex = KITCHEN_PARTS.findIndex(p => p.id === activeKitchenPart);
  const handlePrevKitchenPart = () => {
    const prevIdx = (currentKitchenIndex - 1 + KITCHEN_PARTS.length) % KITCHEN_PARTS.length;
    setActiveKitchenPart(KITCHEN_PARTS[prevIdx].id);
  };
  const handleNextKitchenPart = () => {
    const nextIdx = (currentKitchenIndex + 1) % KITCHEN_PARTS.length;
    setActiveKitchenPart(KITCHEN_PARTS[nextIdx].id);
  };

  // 4-Hour Shift Cycle Metric Auto-Update Engine
  useEffect(() => {
    // 4 hours in milliseconds = 4 * 60 * 60 * 1000 = 14,400,000 ms
    const FOUR_HOURS_MS = 14400000;

    const performFourHourSync = () => {
      const timestampNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      // Realistic 4-hour shift efficiency variations (87% - 94%)
      const newEfficiency = (87 + Math.random() * 7).toFixed(1) + "%";
      // Realistic 4-hour average prep time variations (6.2m - 8.1m)
      const newPrepTime = (6.2 + Math.random() * 1.9).toFixed(1) + " mins";

      setShiftEfficiency(newEfficiency);
      setShiftPrepTime(newPrepTime);
      setLast4HourUpdate(`Last 4h Sync: ${timestampNow} (Next in 4 Hours)`);
    };

    const interval4h = setInterval(performFourHourSync, FOUR_HOURS_MS);

    return () => clearInterval(interval4h);
  }, []);

  const rawEfficiency = shiftEfficiency;
  const efficiencyNum = parseFloat(rawEfficiency);
  const isCriticalEfficiency = efficiencyNum < 50;

  const [directives, setDirectives] = useState([
    {
      id: "dir-1",
      stationId: "station-1",
      priority: "CRITICAL",
      title: "⚠️ DINNER RUSH ALERT: Station 1 (Hot Wok) requires +1 Cook at 7:00 PM due to 115 projected orders.",
      actionText: "Reallocate S. Fernando from Cold Prep to Hot Wok Station based on skill matching (Stir-Fry Optimization)",
      targetStaff: "S. Fernando",
      targetStation: "Hot Wok & Kottu Station",
      mitigatedLoad: 55,
      mitigatedQueue: 4,
      resolved: false
    },
    {
      id: "dir-2",
      stationId: "station-3",
      priority: "HIGH",
      title: "🔥 GRILL QUEUE ALERT: Grill & Seafood Station prep latency spiked to 14.0 mins (9 orders queue).",
      actionText: "Reallocate T. Silva to Grill Station & prep protein cuts based on skill matching (Seafood Freshness Grading)",
      targetStaff: "T. Silva",
      targetStation: "Grill & Seafood Station",
      mitigatedLoad: 48,
      mitigatedQueue: 3,
      resolved: false
    },
    {
      id: "dir-3",
      stationId: "station-2",
      priority: "MEDIUM",
      title: "⚡ PREP OPTIMIZATION: Pre-portion 50x Curry bases at 5:30 PM to bypass assembly queue delays.",
      actionText: "Pre-portion 50x Curry bases at 5:30 PM at Curry & Rice Assembly Bay",
      targetStaff: "K. Perera",
      targetStation: "Curry & Rice Assembly Bay",
      mitigatedLoad: 35,
      mitigatedQueue: 2,
      resolved: false
    }
  ]);

  const handleExecuteDirective = (directive) => {
    // 1. Mark directive resolved
    setDirectives(prev => prev.map(d => d.id === directive.id ? { ...d, resolved: true } : d));

    // 2. Update kitchen station load and queue dynamically
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

      // 3. Dynamically reassign target staff member in Staff Skill-Gap Analysis matrix in real time
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

    // 4. Auto dismiss directive after short delay to slide next priority directive up
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
      title: `🚨 REAL-TIME QUEUE SURGE (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}): Ticket queue at Hot Wok & Kottu Station surged to 18 tickets!`,
      actionText: "Reallocate S. Fernando from Cold Prep to Hot Wok Station immediately to clear queue overload",
      targetStaff: "S. Fernando",
      targetStation: "Hot Wok & Kottu Station",
      mitigatedLoad: 50,
      mitigatedQueue: 3,
      resolved: false
    };

    setDirectives(prev => [newDirective, ...prev]);

    if (data && data.stations) {
      const updatedStations = data.stations.map(st => {
        if (st.id === "station-1") {
          return {
            ...st,
            load_level: 98,
            queue_length: 18,
            bottleneck_status: "Critical Queue Surge",
            action: "Reallocate S. Fernando from Salad & Cold Prep Station immediately based on skill matching"
          };
        }
        return st;
      });
      setData({ ...data, stations: updatedStations });
    }

    setDismissedToast("🚨 New real-time queue alert popped up! High order volume detected at Hot Wok Station.");
    setTimeout(() => setDismissedToast(""), 4000);
  };

  const [showOrderSimulatorModal, setShowOrderSimulatorModal] = useState(false);
  const [nextOrderNumCounter, setNextOrderNumCounter] = useState(1044);
  const [selectedTableNo, setSelectedTableNo] = useState("Table 05");
  const [selectedPriority, setSelectedPriority] = useState("Normal");
  const [menuSearchQuery, setMenuSearchQuery] = useState("");

  // Interactive Waiter Menu Items State (Sri Lankan & Pizza Items)
  const [menuItems, setMenuItems] = useState([
    // Sri Lankan Cuisine
    { id: "sl-1", name: "Chicken Fried Rice", category: "Sri Lankan", station: "Cooking Station", icon: "🍳", checked: true, size: "Medium", qty: 2, defaultStaff: "K. Perera (Senior Line Chef)" },
    { id: "sl-2", name: "Chicken Kottu", category: "Sri Lankan", station: "Cooking Station", icon: "🍳", checked: true, size: "Medium", qty: 1, defaultStaff: "S. Fernando (Junior Chef)" },
    { id: "sl-3", name: "Cheese Kottu Special", category: "Sri Lankan", station: "Cooking Station", icon: "🍳", checked: false, size: "Large", qty: 1, defaultStaff: "K. Perera (Senior Line Chef)" },
    { id: "sl-4", name: "Sri Lankan Fish Curry & Rice", category: "Sri Lankan", station: "Curry & Rice Assembly Bay", icon: "🍲", checked: false, size: "Regular", qty: 1, defaultStaff: "A. Jayasinghe (Station Lead)" },

    // Pizza Variety
    { id: "pz-1", name: "Devilled Chicken Pizza", category: "Pizza", station: "Cooking Station", icon: "🍕", checked: true, size: "Large (15\")", qty: 1, defaultStaff: "S. Fernando (Junior Chef)" },
    { id: "pz-2", name: "BBQ Chicken Pizza", category: "Pizza", station: "Cooking Station", icon: "🍕", checked: false, size: "Medium (12\")", qty: 1, defaultStaff: "K. Perera (Senior Line Chef)" },
    { id: "pz-3", name: "Seafood Supreme Pizza", category: "Pizza", station: "Grill & Seafood Station", icon: "🍕", checked: false, size: "Large (15\")", qty: 1, defaultStaff: "T. Silva (Prep Cook)" },
    { id: "pz-4", name: "Spicy Mutton Kottu Pizza", category: "Pizza", station: "Cooking Station", icon: "🍕", checked: false, size: "Medium (12\")", qty: 1, defaultStaff: "K. Perera (Senior Line Chef)" },

    // Beverages
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
        { item: "1 × Chicken Kottu (Medium)", assignedStaff: "S. Fernando (Junior Chef)", status: "In Prep" }
      ],
      beverageTasks: [
        { item: "2 × Coke (500ml)", assignedStaff: "Beverage Station Counter", status: "Ready" }
      ],
      grillTasks: [],
      coldTasks: []
    },
    {
      id: "ord-1043",
      orderNo: "1043",
      table: "Table 09",
      timestamp: "7:08 PM",
      waiterApp: "Waiter Mobile Terminal #1",
      priority: "Rush / High",
      cookingTasks: [
        { item: "1 × Cheese Kottu Special (Large)", assignedStaff: "K. Perera (Senior Line Chef)", status: "In Prep" },
        { item: "1 × Devilled Chicken Pizza (Large 15\")", assignedStaff: "S. Fernando (Junior Chef)", status: "In Prep" }
      ],
      beverageTasks: [
        { item: "3 × Fresh Mango Iced Tea", assignedStaff: "Beverage Station Counter", status: "In Prep" }
      ],
      grillTasks: [
        { item: "1 × Jumbo Grilled Seafood Platter", assignedStaff: "T. Silva (Prep Cook)", status: "In Prep" }
      ],
      coldTasks: []
    }
  ]);

  const handleCreateMobileOrder = (e) => {
    e.preventDefault();
    const timestampNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const currentOrderNo = nextOrderNumCounter;

    const selectedItems = menuItems.filter(i => i.checked);
    if (selectedItems.length === 0) {
      setDismissedToast("⚠️ Please select at least one menu item to place the order.");
      setTimeout(() => setDismissedToast(""), 3500);
      return;
    }

    const newCookingTasks = selectedItems
      .filter(i => i.station === "Cooking Station" || i.category === "Sri Lankan")
      .map(i => ({ item: `${i.qty} × ${i.name} (${i.size})`, assignedStaff: i.defaultStaff, status: "In Prep" }));

    const newBevTasks = selectedItems
      .filter(i => i.category === "Beverages" || i.station === "Beverage Station")
      .map(i => ({ item: `${i.qty} × ${i.name} (${i.size})`, assignedStaff: i.defaultStaff, status: "In Prep" }));

    const newGrillTasks = selectedItems
      .filter(i => i.station === "Grill & Seafood Station")
      .map(i => ({ item: `${i.qty} × ${i.name} (${i.size})`, assignedStaff: i.defaultStaff, status: "In Prep" }));

    const newOrder = {
      id: `ord-${currentOrderNo}-${Date.now()}`,
      orderNo: `${currentOrderNo}`,
      table: selectedTableNo,
      timestamp: timestampNow,
      waiterApp: "Waiter Mobile Terminal",
      priority: selectedPriority,
      cookingTasks: newCookingTasks,
      beverageTasks: newBevTasks,
      grillTasks: newGrillTasks,
      coldTasks: []
    };

    setKitchenOrders(prev => [newOrder, ...prev]);
    setNextOrderNumCounter(prev => prev + 1);
    setShowOrderSimulatorModal(false);
    setDismissedToast(`📱 Order #${currentOrderNo} received! Real-Time Kitchen Station Workloads & Queue Status updated live.`);
    setTimeout(() => setDismissedToast(""), 4500);

    // Dynamic real-time update across ALL station workloads & line queues
    if (data && data.stations) {
      const updatedStations = data.stations.map(st => {
        if (st.id === "station-1" && newCookingTasks.length > 0) {
          const newQueue = st.queue_length + newCookingTasks.length;
          const newPrepTime = (newQueue * 0.6 + 0.5).toFixed(1);
          const newLoad = Math.min(98, Math.max(30, Math.round((newQueue / 15) * 100)));
          const targetCooks = newQueue >= 15 ? 4 : (newQueue >= 10 ? 3 : (newQueue >= 5 ? 2 : 1));

          return {
            ...st,
            queue_length: newQueue,
            avg_prep_time_mins: newPrepTime,
            recommended_cooks: targetCooks,
            load_level: newLoad,
            bottleneck_status: newLoad >= 85 ? "Critical Queue Surge" : (newLoad >= 70 ? "High Delay Risk" : "Smooth Flow"),
            action: newLoad >= 80
              ? "Reallocate S. Fernando from Salad & Cold Prep Station to Hot Wok & Kottu Station based on skill matching"
              : "Maintain current line pacing"
          };
        }
        if (st.id === "station-3" && newGrillTasks.length > 0) {
          const newQueue = st.queue_length + newGrillTasks.length;
          const newPrepTime = (newQueue * 1.5 + 0.5).toFixed(1);
          const newLoad = Math.min(98, Math.max(30, Math.round((newQueue / 10) * 100)));
          const targetCooks = newQueue >= 12 ? 3 : (newQueue >= 6 ? 2 : 1);

          return {
            ...st,
            queue_length: newQueue,
            avg_prep_time_mins: newPrepTime,
            recommended_cooks: targetCooks,
            load_level: newLoad,
            bottleneck_status: newLoad >= 80 ? "High Delay Risk" : "Smooth Flow",
            action: newLoad >= 80
              ? "Reallocate T. Silva to Grill & Seafood Station & prep protein cuts based on skill matching"
              : "Maintain current line staffing"
          };
        }
        return st;
      });
      setData({ ...data, stations: updatedStations });
    }
  };

  // Complete a station task & dynamically lower station queue and workload
  const handleCompleteOrderTask = (orderId, taskType, taskIdx) => {
    let orderNumCompleted = "";

    setKitchenOrders(prev => {
      const updated = prev.map(ord => {
        if (ord.id === orderId) {
          orderNumCompleted = ord.orderNo;
          const updatedTasks = [...ord[taskType]];
          updatedTasks[taskIdx] = { ...updatedTasks[taskIdx], status: "Prepared" };
          return { ...ord, [taskType]: updatedTasks };
        }
        return ord;
      });

      // Filter out orders where all station tasks are fully prepared
      return updated.filter(ord => {
        const cookDone = ord.cookingTasks.length === 0 || ord.cookingTasks.every(t => t.status === "Prepared");
        const bevDone = ord.beverageTasks.length === 0 || ord.beverageTasks.every(t => t.status === "Prepared");
        const grillDone = ord.grillTasks.length === 0 || ord.grillTasks.every(t => t.status === "Prepared");
        const coldDone = ord.coldTasks.length === 0 || ord.coldTasks.every(t => t.status === "Prepared");

        const isFullyPrepared = cookDone && bevDone && grillDone && coldDone;
        return !isFullyPrepared;
      });
    });

    setDismissedToast("✨ Order task prepared & served! Completed orders automatically disappear from active dispatch.");
    setTimeout(() => setDismissedToast(""), 4000);

    if (data && data.stations) {
      const updatedStations = data.stations.map(st => {
        if (st.id === "station-1" && taskType === "cookingTasks") {
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
            bottleneck_status: newLoad >= 80 ? "High Delay Risk" : "Smooth Flow",
            action: newLoad < 80 ? "Optimal line pacing restored — queue delay eliminated" : st.action
          };
        }
        if (st.id === "station-3" && taskType === "grillTasks") {
          const newQueue = Math.max(1, st.queue_length - 1);
          const newPrepTime = (newQueue * 1.4).toFixed(1);
          const newLoad = Math.max(20, Math.round((newQueue / 10) * 100));
          const targetCooks = newQueue >= 12 ? 3 : (newQueue >= 6 ? 2 : 1);

          return {
            ...st,
            queue_length: newQueue,
            avg_prep_time_mins: newPrepTime,
            recommended_cooks: targetCooks,
            load_level: newLoad,
            bottleneck_status: newLoad >= 80 ? "High Delay Risk" : "Smooth Flow",
            action: newLoad < 80 ? "Optimal line pacing restored" : st.action
          };
        }
        return st;
      });
      setData({ ...data, stations: updatedStations });
    }
  };

  // 1-Click Complete & Disappear Entire Order
  const handleCompleteEntireOrder = (orderId, orderNo) => {
    setKitchenOrders(prev => prev.filter(ord => ord.id !== orderId));
    setDismissedToast(`✨ Order #${orderNo} fully prepared! Automatically disappeared from kitchen dashboard.`);
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
    assigned_station: "Hot Wok & Kottu Station",
    skill_level: "Expert (Level 4)",
    efficiency_rating: 94,
    skills: ["High-Volume Wok Handling & Stir-Fry", "Kottu Speed & Roti Shredding"],
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

  useEffect(() => {
    fetchKitchenData();
  }, []);

  const fetchKitchenData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/api/kitchen/metrics");
      setData(res.data);
    } catch (err) {
      console.error("Failed to load kitchen metrics, using fallback:", err);
      setData({
        researcher: "Pahesara H.H.D.S (IT23349292)",
        module: "Component 2: Kitchen Efficiency and Staff Optimization Analytics",
        overall_kitchen_efficiency: "88.5%",
        avg_ticket_fulfillment_time: "7.4 mins",
        active_bottlenecks_count: 1,
        stations: [
          { id: "station-1", name: "Hot Wok & Kottu Station", active_cooks: 2, recommended_cooks: 3, avg_prep_time_mins: 8.5, target_prep_time_mins: 6.0, queue_length: 14, load_level: 92, bottleneck_status: "High Delay Risk", action: "Reallocate S. Fernando from Salad & Cold Prep Station to Hot Wok & Kottu Station based on skill matching (Enrolled in 'High-Volume Stir-Fry Optimization')" },
          { id: "station-2", name: "Curry & Rice Assembly Bay", active_cooks: 2, recommended_cooks: 2, avg_prep_time_mins: 4.2, target_prep_time_mins: 4.5, queue_length: 4, load_level: 55, bottleneck_status: "Smooth Flow", action: "Maintain current line staffing" },
          { id: "station-3", name: "Grill & Seafood Station", active_cooks: 1, recommended_cooks: 2, avg_prep_time_mins: 14.0, target_prep_time_mins: 10.0, queue_length: 9, load_level: 84, bottleneck_status: "Moderate Queue Load", action: "Reallocate T. Silva to Grill Station & prep protein cuts based on skill matching (Seafood Freshness Grading & Quick-Sear Techniques)" },
          { id: "station-4", name: "Salad & Cold Prep Station", active_cooks: 2, recommended_cooks: 1, avg_prep_time_mins: 3.0, target_prep_time_mins: 4.0, queue_length: 2, load_level: 30, bottleneck_status: "Underutilized", action: "Reassign S. Fernando to Hot Wok & Kottu Station during 7 PM rush based on skill matching" }
        ],
        staff: [
          { id: "staff-1", name: "K. Perera (Senior Line Chef)", assigned_station: "Hot Wok & Kottu Station", shift: "11:00 AM - 09:30 PM", efficiency_rating: 94, skill_level: "Expert (Level 4)", speed_score: "4.8 / 5.0", skill_gap: "Advanced Pastry & Bakery", training_recommendation: "Executive Kitchen Leadership & Precision Temperature Control", career_progression: "Ready for Sous-Chef Promotion (88% Milestones Complete)" },
          { id: "staff-2", name: "S. Fernando (Junior Chef)", assigned_station: "Salad & Cold Prep Station", shift: "03:00 PM - 11:00 PM", efficiency_rating: 78, skill_level: "Intermediate (Level 2)", speed_score: "3.9 / 5.0", skill_gap: "High-Heat Wok Handling & Kottu Speed", training_recommendation: "Enrolled in 'High-Volume Stir-Fry Optimization' (Module 3)", career_progression: "Target: Line Cook Specialist (62% Completed)" },
          { id: "staff-3", name: "T. Silva (Prep Cook)", assigned_station: "Grill & Seafood Station", shift: "10:00 AM - 07:00 PM", efficiency_rating: 85, skill_level: "Intermediate (Level 3)", speed_score: "4.2 / 5.0", skill_gap: "HACCP Seafood Core Temperature Monitoring", training_recommendation: "Seafood Freshness Grading & Quick-Sear Techniques", career_progression: "Grill Master Track (74% Completed)" },
          { id: "staff-4", name: "A. Jayasinghe (Station Lead)", assigned_station: "Curry & Rice Assembly Bay", shift: "07:00 AM - 04:00 PM", efficiency_rating: 91, skill_level: "Expert (Level 4)", speed_score: "4.7 / 5.0", skill_gap: "High-Volume Batch Inventory Planning", training_recommendation: "Mastering Sri Lankan Spice Ratios & Fast Assembly Lines", career_progression: "Head of Curry Bay Track (82% Completed)" },
          { id: "staff-5", name: "M. Wickramasinghe (Kitchen Trainee)", assigned_station: "Salad & Cold Prep Station", shift: "11:00 AM - 08:00 PM", efficiency_rating: 64, skill_level: "Trainee (Level 1)", speed_score: "3.1 / 5.0", skill_gap: "Knife Handling, Prep Hygiene & Portion Control", training_recommendation: "Foundation Kitchen Safety, Knife Skills & Hygiene Protocols", career_progression: "Apprentice Onboarding (35% Completed)" },
          { id: "staff-6", name: "R. Dissanayake (Kitchen Trainee)", assigned_station: "Hot Wok & Assembly Support", shift: "01:00 PM - 10:00 PM", efficiency_rating: 58, skill_level: "Trainee (Level 1)", speed_score: "2.8 / 5.0", skill_gap: "Station Setup & Order Ticket Flow", training_recommendation: "Basic Line Cooking Fundamentals & Ticket Dispatching", career_progression: "Junior Line Apprentice (25% Completed)" }
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
        ai_allocation_suggestions: [
          "⚠️ DINNER RUSH ALERT: Station 1 (Hot Wok) requires +1 Cook at 7:00 PM due to 115 projected orders.",
          "Reallocate S. Fernando from Cold Prep to Hot Wok during 7:00 PM - 9:00 PM window.",
          "Pre-portion 50x Curry bases at 5:30 PM to bypass assembly queue delays."
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="glass-panel p-12 text-center text-slate-500 rounded-2xl">
        <div className="animate-spin h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-xs font-bold font-mono">Loading Kitchen & Staff Metrics...</p>
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

      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Kitchen Efficiency & Staff Optimization</h2>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20 font-bold">
                  Workflow & Queue AI
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Real-time station queue monitoring, peak-hour staff allocation, and staff progression
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-1.5 w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase">Efficiency</span>
                  <div className={`text-lg sm:text-xl font-black ${isCriticalEfficiency ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {shiftEfficiency}
                  </div>
                </div>
                <div className="text-right border-l border-slate-200 dark:border-slate-800 pl-4">
                  <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase">Avg Prep Time</span>
                  <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">{shiftPrepTime}</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 sm:px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                <Clock className="h-3 w-3 text-orange-500" />
                <span>⏰ {last4HourUpdate}</span>
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

          {/* Kitchen Subpart Dropdown & Quick Navigation Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            
            {/* Dropdown Selector */}
            <div className="relative w-full lg:w-96" ref={kitchenDropdownRef}>
              <div className="flex items-center justify-between gap-2 mb-1 lg:hidden">
                <span className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400">
                  Select Kitchen Subpart:
                </span>
                <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">
                  {KITCHEN_PARTS.length} Available
                </span>
              </div>

              {(() => {
                const currentPart = KITCHEN_PARTS.find(p => p.id === activeKitchenPart) || KITCHEN_PARTS[0];
                const PartIcon = currentPart.icon;
                return (
                  <>
                    <button
                      type="button"
                      onClick={() => setKitchenDropdownOpen(!kitchenDropdownOpen)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 hover:border-orange-500 dark:hover:border-orange-500 flex items-center justify-between gap-2.5 shadow-2xs transition-all text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-700 flex-shrink-0 group-hover:scale-105 transition-transform">
                          <PartIcon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[9px] uppercase font-black text-slate-400 leading-tight">
                            Active Kitchen View
                          </div>
                          <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {currentPart.title}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={`hidden sm:inline-block text-[9px] font-black px-2 py-0.5 rounded-full border ${currentPart.badgeColor}`}>
                          {currentPart.badge}
                        </span>
                        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${kitchenDropdownOpen ? 'rotate-180 text-orange-600' : ''}`} />
                      </div>
                    </button>

                    {/* Dropdown Options Popup */}
                    {kitchenDropdownOpen && (
                      <div className="absolute right-0 left-0 lg:left-0 lg:right-auto mt-2 w-full lg:w-96 rounded-2xl bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 space-y-1 animate-fade-in">
                        <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">
                            Kitchen System Parts
                          </span>
                          <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">
                            Tap to focus view
                          </span>
                        </div>

                        {KITCHEN_PARTS.map((part) => {
                          const IconComp = part.icon;
                          const isSelected = part.id === activeKitchenPart;
                          return (
                            <button
                              key={part.id}
                              type="button"
                              onClick={() => {
                                setActiveKitchenPart(part.id);
                                setKitchenDropdownOpen(false);
                              }}
                              className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start gap-3 cursor-pointer ${
                                isSelected
                                  ? 'bg-orange-50 dark:bg-orange-950/60 border border-orange-300 dark:border-orange-700/60 shadow-2xs'
                                  : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent'
                              }`}
                            >
                              <div className={`p-2 rounded-xl flex-shrink-0 mt-0.5 border ${
                                isSelected
                                  ? 'bg-orange-600 text-white border-orange-600'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                              }`}>
                                <IconComp className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className={`text-xs font-black truncate ${isSelected ? 'text-orange-950 dark:text-orange-200' : 'text-slate-900 dark:text-white'}`}>
                                    {part.title}
                                  </span>
                                  {isSelected ? (
                                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-orange-600 text-white flex-shrink-0 flex items-center gap-1">
                                      <Check className="h-3 w-3" /> Active
                                    </span>
                                  ) : (
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0 ${part.badgeColor}`}>
                                      {part.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                                  {part.description}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Quick Pill Tabs + Previous/Next Stepper */}
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full lg:w-auto">
              {/* Stepper Buttons */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={handlePrevKitchenPart}
                  title="Previous Kitchen Section"
                  className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-[10px] font-mono font-bold px-2 text-slate-600 dark:text-slate-400 select-none">
                  {currentKitchenIndex + 1}/{KITCHEN_PARTS.length}
                </span>
                <button
                  type="button"
                  onClick={handleNextKitchenPart}
                  title="Next Kitchen Section"
                  className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Quick Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                {KITCHEN_PARTS.map((kp) => (
                  <button
                    key={kp.id}
                    type="button"
                    onClick={() => setActiveKitchenPart(kp.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap border cursor-pointer ${
                      activeKitchenPart === kp.id
                        ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-orange-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {kp.shortTitle}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* AI Actionable Directives (Real-Time Dynamic Queue) */}
        {(activeKitchenPart === 'all' || activeKitchenPart === 'directives') && (
          <div className="glass-panel p-6 rounded-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">AI Staff Allocation Directives</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Real-time dynamic queue directives and surge simulation</p>
                </div>
              </div>
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border border-orange-300 dark:border-orange-800">
                AI Directives Engine
              </span>
            </div>

            <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-orange-50 border border-orange-200 dark:bg-orange-950/40 dark:border-orange-500/30 shadow-sm space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-orange-200 dark:border-orange-800/60 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                <div>
                  <h3 className="text-xs font-black text-orange-900 dark:text-orange-200 uppercase tracking-wider">
                    AI Staff Allocation Directives
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-orange-800 dark:text-orange-300 font-medium">
                    Updates dynamically based on real-time order queue surges
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[9px] sm:text-[10px] font-black px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live Engine
                </span>
                <button
                  onClick={handleSimulateSurge}
                  className="px-2.5 sm:px-3 py-1 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-[11px] sm:text-xs shadow-xs transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  title="Simulate sudden order queue spike"
                >
                  <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span>Simulate Surge</span>
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
                  onClick={() => {
                    setDirectives([
                      {
                        id: `dir-${Date.now()}-1`,
                        stationId: "station-1",
                        priority: "CRITICAL",
                        title: "⚠️ DINNER RUSH ALERT: Station 1 (Hot Wok) requires +1 Cook at 7:00 PM due to 115 projected orders.",
                        actionText: "Reallocate S. Fernando from Cold Prep to Hot Wok Station based on skill matching",
                        targetStaff: "S. Fernando",
                        targetStation: "Hot Wok & Kottu Station",
                        mitigatedLoad: 55,
                        mitigatedQueue: 4,
                        resolved: false
                      },
                      {
                        id: `dir-${Date.now()}-2`,
                        stationId: "station-3",
                        priority: "HIGH",
                        title: "🔥 GRILL QUEUE ALERT: Grill & Seafood Station prep latency spiked to 14.0 mins.",
                        actionText: "Reallocate T. Silva to Grill Station & prep protein cuts based on skill matching",
                        targetStaff: "T. Silva",
                        targetStation: "Grill & Seafood Station",
                        mitigatedLoad: 48,
                        mitigatedQueue: 3,
                        resolved: false
                      }
                    ]);
                  }}
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

      {/* Real-Time Mobile Order Dispatch & Station Task Routing Section */}
      {(activeKitchenPart === 'all' || activeKitchenPart === 'routing') && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-5 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20">
                  <Smartphone className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Real-Time Mobile Order Routing & Station Task Dispatch
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Waiter notes order on mobile app → Order enters system → Auto-split into Cooking, Beverage & Grill station tasks with timestamps & assigned staff
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                onClick={() => setShowOrderSimulatorModal(true)}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Smartphone className="h-4 w-4" />
                <span>📱 Simulate Waiter Mobile Order</span>
              </button>
            </div>
          </div>

          {/* Active Routed Orders Stream */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {kitchenOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      Order #{ord.orderNo}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
                      {ord.table}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${ord.priority.includes("Rush") || ord.priority.includes("VIP")
                        ? "bg-rose-600 text-white animate-pulse"
                        : "bg-emerald-600 text-white"
                      }`}>
                      Priority: {ord.priority}
                    </span>
                    <span className="text-[11px] sm:text-xs font-extrabold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {ord.timestamp}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCompleteEntireOrder(ord.id, ord.orderNo)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] sm:text-xs cursor-pointer shadow-xs transition-all flex items-center gap-1 sm:ml-auto"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Mark Prepared</span>
                    </button>
                  </div>
                </div>

                {/* Split Station Tasks */}
                <div className="space-y-3">
                  {/* Cooking Station Split */}
                  {ord.cookingTasks.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-orange-50/90 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-500/30 text-xs space-y-2">
                      <div className="flex items-center justify-between border-b border-orange-200 dark:border-orange-900/50 pb-1.5">
                        <span className="font-extrabold text-orange-900 dark:text-orange-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                          🍳 Cooking Station Task (Order #{ord.orderNo})
                        </span>
                        <span className="text-[10px] font-bold text-orange-800 dark:text-orange-300">
                          Received: {ord.timestamp}
                        </span>
                      </div>

                      <ul className="space-y-1 font-bold text-slate-900 dark:text-white">
                        {ord.cookingTasks.map((t, idx) => (
                          <li key={idx} className="flex items-center justify-between text-xs py-0.5">
                            <span className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>
                              {t.item}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                Assigned: <span className="font-bold text-orange-700 dark:text-orange-300">{t.assignedStaff}</span>
                              </span>
                              {t.status === "Prepared" ? (
                                <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                                  ✓ Prepared
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleCompleteOrderTask(ord.id, "cookingTasks", idx)}
                                  className="px-2 py-0.5 rounded bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-bold cursor-pointer transition-all"
                                >
                                  Mark Prepared
                                </button>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Beverage Station Split */}
                  {ord.beverageTasks.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-sky-50/90 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-500/30 text-xs space-y-2">
                      <div className="flex items-center justify-between border-b border-sky-200 dark:border-sky-900/50 pb-1.5">
                        <span className="font-extrabold text-sky-900 dark:text-sky-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                          🥤 Beverage Station Task (Order #{ord.orderNo})
                        </span>
                        <span className="text-[10px] font-bold text-sky-800 dark:text-sky-300">
                          Received: {ord.timestamp}
                        </span>
                      </div>

                      <ul className="space-y-1 font-bold text-slate-900 dark:text-white">
                        {ord.beverageTasks.map((t, idx) => (
                          <li key={idx} className="flex items-center justify-between text-xs py-0.5">
                            <span className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-sky-500"></span>
                              {t.item}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                Assigned: <span className="font-bold text-sky-700 dark:text-sky-300">{t.assignedStaff}</span>
                              </span>
                              {t.status === "Prepared" ? (
                                <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                                  ✓ Prepared
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleCompleteOrderTask(ord.id, "beverageTasks", idx)}
                                  className="px-2 py-0.5 rounded bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-bold cursor-pointer transition-all"
                                >
                                  Mark Prepared
                                </button>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Grill & Seafood Station Split */}
                  {ord.grillTasks.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 text-xs space-y-2">
                      <div className="flex items-center justify-between border-b border-amber-200 dark:border-amber-900/50 pb-1.5">
                        <span className="font-extrabold text-amber-900 dark:text-amber-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                          🥩 Grill & Seafood Station Task (Order #{ord.orderNo})
                        </span>
                        <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300">
                          Received: {ord.timestamp}
                        </span>
                      </div>

                      <ul className="space-y-1 font-bold text-slate-900 dark:text-white">
                        {ord.grillTasks.map((t, idx) => (
                          <li key={idx} className="flex items-center justify-between text-xs py-0.5">
                            <span className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                              {t.item}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                Assigned: <span className="font-bold text-amber-700 dark:text-amber-300">{t.assignedStaff}</span>
                              </span>
                              {t.status === "Prepared" ? (
                                <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                                  ✓ Prepared
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleCompleteOrderTask(ord.id, "grillTasks", idx)}
                                  className="px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold cursor-pointer transition-all"
                                >
                                  Mark Prepared
                                </button>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Peak-Hour Workload & Staffing Demand Chart */}
      {(activeKitchenPart === 'all' || activeKitchenPart === 'rush') && (
        <div className="glass-panel p-6 rounded-2xl space-y-4 animate-fade-in">
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
                  <span className="font-bold text-orange-900 dark:text-orange-300">Staff Allocation Required:</span> 9 Line Chefs (3 Wok, 2 Curry Bay, 2 Grill & Seafood, 2 Delivery Prep)
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-orange-100 dark:border-orange-900/50 shadow-2xs">
                  <span className="font-bold text-orange-900 dark:text-orange-300">Menu Demand Focus:</span> Cheese Kottu Specials, Jumbo Seafood Fried Rice, Grilled Meats & Desserts
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

                {/* Highlighted Breakfast Section on Diagram */}
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

                {/* Highlighted Lunch Section on Diagram */}
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

                {/* Highlighted Dinner Section on Diagram */}
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
      )}

      {/* Kitchen Station Workload & Queue Monitors */}
      {(activeKitchenPart === 'all' || activeKitchenPart === 'stations') && (
        <div className="glass-panel p-6 rounded-2xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Real-Time Kitchen Station Workload & Queue Status</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Monitoring queue latency and load balancing across all 4 production stations</p>
          </div>
        </div>

        {/* High Workload & Queue Alerts Panel */}
        {data.stations.some(st => st.load_level >= 80) && (
          <div className="p-4 rounded-2xl bg-rose-50/90 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-500/40 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-rose-200 dark:border-rose-800/60 pb-2">
              <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 flex-shrink-0 animate-pulse" />
              <h4 className="text-xs font-black uppercase tracking-wider text-rose-900 dark:text-rose-200">
                High Workload & Line Queue Alerts
              </h4>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-600 text-white ml-auto">
                {data.stations.filter(st => st.load_level >= 80).length} Stations Critical
              </span>
            </div>

            <div className="space-y-2.5">
              {data.stations.filter(st => st.load_level >= 80).map((st) => (
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
                      Current Queue: <span className="font-bold text-slate-900 dark:text-white">{st.queue_length} orders</span> • Avg Prep Time: <span className="font-bold text-slate-900 dark:text-white">{st.avg_prep_time_mins} mins</span>
                    </p>
                    <div className="text-xs text-rose-800 dark:text-rose-300 font-bold flex items-center gap-1.5 pt-0.5">
                      <ArrowRight className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                      <span>Recommended Action: <span className="text-rose-950 dark:text-rose-100 font-extrabold underline">{st.action}</span></span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const targetStaffName = st.id === "station-1" ? "S. Fernando" : (st.id === "station-3" ? "T. Silva" : "Staff Member");
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.stations.map((st) => {
            const isHighWorkload = st.load_level >= 80;
            return (
              <div
                key={st.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between shadow-sm transition-all ${isHighWorkload
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
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">{st.name}</span>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${st.load_level >= 90
                        ? 'bg-rose-600 text-white'
                        : (st.load_level >= 80 ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300')
                      }`}>
                      {st.load_level}% Load
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
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
                  <div className={`mt-4 p-3 rounded-xl border ${isHighWorkload
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
    )}

      {/* Staff Skill Matrix & Progression Paths */}
      {(activeKitchenPart === 'all' || activeKitchenPart === 'staff') && (
        <div className="glass-panel p-6 rounded-2xl space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Staff Skill-Gap Analysis & Progression Paths</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Personalized training recommendations and succession planning for kitchen personnel</p>
            </div>
            <button
              onClick={() => {
                setLoginErrorMsg("");
                setShowStaffLoginModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap w-fit"
            >
              <LogIn className="h-4 w-4" />
              <span>Staff Self-Assessment</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.staff.map((member) => {
              const hotWokHigh = data.stations.some(st => st.id === "station-1" && st.load_level >= 80);
              const grillHigh = data.stations.some(st => st.id === "station-3" && st.load_level >= 80);

              let recommendedStation = "";
              if (member.name.includes("S. Fernando")) recommendedStation = "Hot Wok & Kottu Station";
              else if (member.name.includes("T. Silva")) recommendedStation = "Grill & Seafood Station";
              else if (member.name.includes("K. Perera")) recommendedStation = "Curry & Rice Assembly Bay";
              else if (member.name.includes("A. Jayasinghe")) recommendedStation = "Hot Wok & Kottu Station";
              else if (member.name.includes("Wickramasinghe") || member.name.includes("Dissanayake")) recommendedStation = "Hot Wok & Assembly Support";

              const isRecommendedForReallocation =
                (hotWokHigh && member.name.includes("S. Fernando")) ||
                (grillHigh && member.name.includes("T. Silva"));

              return (
                <div
                  key={member.id}
                  className={`p-5 rounded-2xl border shadow-sm space-y-3 transition-all ${member.isReallocated
                      ? "bg-emerald-50/90 dark:bg-emerald-950/40 border-2 border-emerald-500 shadow-emerald-500/20 ring-2 ring-emerald-400/40"
                      : (isRecommendedForReallocation
                        ? "bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-500 shadow-amber-500/20 ring-2 ring-amber-400/40 animate-pulse"
                        : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800")
                    }`}
                >
                  {/* Reallocation Status Badge */}
                  {member.isReallocated && (
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700">
                      <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      <span>⚡ Reallocated: Reassigned to {member.reallocatedTo || member.assigned_station}</span>
                    </div>
                  )}

                  {/* Specific Station Recommendation Badge */}
                  {isRecommendedForReallocation && !member.isReallocated && (
                    <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-700 space-y-1.5 animate-pulse">
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-900 dark:text-amber-200">
                        <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                        <span>⚡ WORKLOAD SURGE RECOMMENDATION:</span>
                      </div>
                      <p className="text-xs font-black text-amber-950 dark:text-amber-100 leading-tight">
                        Reallocate <span className="underline font-black">{member.name}</span> from <span className="font-bold">{member.assigned_station}</span> ➔ <span className="text-orange-700 dark:text-orange-300 font-extrabold underline">{recommendedStation}</span> based on skill matching.
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          const updatedStaff = data.staff.map(s => {
                            if (s.id === member.id) {
                              return {
                                ...s,
                                assigned_station: `${recommendedStation} (Reallocated via AI)`,
                                isReallocated: true,
                                reallocatedTo: recommendedStation
                              };
                            }
                            return s;
                          });

                          const updatedStations = data.stations.map(st => {
                            if (st.name.includes(recommendedStation.split(' ')[0]) || (st.id === "station-1" && recommendedStation.includes("Hot Wok")) || (st.id === "station-3" && recommendedStation.includes("Grill"))) {
                              const newActiveCooks = st.recommended_cooks || 3;
                              return {
                                ...st,
                                active_cooks: newActiveCooks,
                                load_level: Math.max(45, st.load_level - 35),
                                queue_length: Math.max(2, st.queue_length - 6),
                                avg_prep_time_mins: "4.2",
                                bottleneck_status: "Smooth Flow",
                                action: `Optimal staffing restored — ${member.name} reallocated based on skill matching`
                              };
                            }
                            return st;
                          });

                          setData({ ...data, staff: updatedStaff, stations: updatedStations });
                          setDismissedToast(`⚡ ${member.name} reallocated to ${recommendedStation} based on skill matching!`);
                          setTimeout(() => setDismissedToast(""), 4500);
                        }}
                        className="w-full mt-1 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-black text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Reallocate {member.name.split(' ')[0]} to {recommendedStation}</span>
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{member.name}</h4>
                      <span className={`text-[10px] font-extrabold ${member.isReallocated ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400'}`}>
                        {member.assigned_station}
                      </span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${member.skill_level.includes("Trainee")
                        ? "bg-sky-50 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300 border-sky-200 dark:border-sky-500/30"
                        : (member.skill_level.includes("Expert")
                          ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30"
                          : "bg-purple-50 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 border-purple-200 dark:border-purple-500/30")
                      }`}>
                      {member.skill_level}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Efficiency Rating:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{member.efficiency_rating}%</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Identified Skill-Gap: <span className="text-amber-700 dark:text-amber-300 font-bold">{member.skill_gap}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-50 dark:bg-slate-950/60 border border-purple-100 dark:border-slate-800/80 text-xs">
                    <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1">
                      <Award className="h-3.5 w-3.5" /> Personalized Training:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 text-xs mt-1 font-medium">{member.training_recommendation}</p>
                  </div>

                  <div className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 pt-1">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{member.career_progression}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile Waiter Order Entry Simulation Modal with Sri Lankan & Pizza Menu */}
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
                {/* Auto-Sequential Order Number */}
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

                {/* Table Number Selector */}
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

                {/* Priority Selection */}
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
                    placeholder="🔍 Search Sri Lankan dishes, pizzas, drinks (e.g. Kottu, Devilled Chicken, Rice, Coke)..."
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

              {/* Sri Lankan Dishes Category */}
              {menuItems.filter(i => i.category === "Sri Lankan" && (
                !menuSearchQuery.trim() ||
                i.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
                i.category.toLowerCase().includes(menuSearchQuery.toLowerCase())
              )).length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🇱🇰</span>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        Authentic Sri Lankan Dishes
                      </h4>
                    </div>

                    <div className="space-y-2">
                      {menuItems.filter(i => i.category === "Sri Lankan" && (
                        !menuSearchQuery.trim() ||
                        i.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
                        i.category.toLowerCase().includes(menuSearchQuery.toLowerCase())
                      )).map((item) => (
                        <div
                          key={item.id}
                          className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${item.checked
                              ? "bg-orange-50/70 border-orange-300 dark:bg-orange-950/40 dark:border-orange-800"
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
                                Target: {item.station}
                              </span>
                            </div>
                          </div>

                          {item.checked && (
                            <div className="flex items-center gap-3">
                              {/* Size Selector */}
                              <select
                                value={item.size}
                                onChange={(e) => updateItemSize(item.id, e.target.value)}
                                className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                              >
                                <option value="Small">Small</option>
                                <option value="Medium">Medium</option>
                                <option value="Large">Large</option>
                                <option value="Regular">Regular Portion</option>
                              </select>

                              {/* Quantity Selector */}
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
                )}

              {/* Pizza Variety Category */}
              {menuItems.filter(i => i.category === "Pizza" && (
                !menuSearchQuery.trim() ||
                i.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
                i.category.toLowerCase().includes(menuSearchQuery.toLowerCase())
              )).length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Pizza className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        Artisan Pizza Variety
                      </h4>
                    </div>

                    <div className="space-y-2">
                      {menuItems.filter(i => i.category === "Pizza" && (
                        !menuSearchQuery.trim() ||
                        i.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
                        i.category.toLowerCase().includes(menuSearchQuery.toLowerCase())
                      )).map((item) => (
                        <div
                          key={item.id}
                          className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${item.checked
                              ? "bg-amber-50/70 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800"
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
                                Target: {item.station}
                              </span>
                            </div>
                          </div>

                          {item.checked && (
                            <div className="flex items-center gap-3">
                              {/* Pizza Size Selector */}
                              <select
                                value={item.size}
                                onChange={(e) => updateItemSize(item.id, e.target.value)}
                                className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                              >
                                <option value="Small (9&quot;)">Small (9")</option>
                                <option value="Medium (12&quot;)">Medium (12")</option>
                                <option value="Large (15&quot;)">Large (15")</option>
                              </select>

                              {/* Quantity Selector */}
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
                )}

              {/* Beverages Category */}
              {menuItems.filter(i => i.category === "Beverages" && (
                !menuSearchQuery.trim() ||
                i.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
                i.category.toLowerCase().includes(menuSearchQuery.toLowerCase())
              )).length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🥤</span>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        Beverages & Refreshers
                      </h4>
                    </div>

                    <div className="space-y-2">
                      {menuItems.filter(i => i.category === "Beverages" && (
                        !menuSearchQuery.trim() ||
                        i.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
                        i.category.toLowerCase().includes(menuSearchQuery.toLowerCase())
                      )).map((item) => (
                        <div
                          key={item.id}
                          className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${item.checked
                              ? "bg-sky-50/70 border-sky-300 dark:bg-sky-950/40 dark:border-sky-800"
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
                                Target: {item.station}
                              </span>
                            </div>
                          </div>

                          {item.checked && (
                            <div className="flex items-center gap-3">
                              {/* Size Selector */}
                              <select
                                value={item.size}
                                onChange={(e) => updateItemSize(item.id, e.target.value)}
                                className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                              >
                                <option value="500ml">500ml</option>
                                <option value="1.5L">1.5L Bottle</option>
                                <option value="Regular Glass">Regular Glass</option>
                                <option value="Large Pitcher">Large Pitcher</option>
                              </select>

                              {/* Quantity Selector */}
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
                )}

              {/* Empty Search Result State */}
              {menuSearchQuery.trim() && menuItems.filter(i => i.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) || i.category.toLowerCase().includes(menuSearchQuery.toLowerCase())).length === 0 && (
                <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <Search className="h-6 w-6 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    No menu items match "{menuSearchQuery}"
                  </p>
                  <button
                    type="button"
                    onClick={() => setMenuSearchQuery("")}
                    className="text-xs text-orange-600 dark:text-orange-400 font-bold hover:underline cursor-pointer"
                  >
                    Clear Search Query
                  </button>
                </div>
              )}

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
                  placeholder="Type staff member name or ID (e.g. M. Wickramasinghe, S. Fernando, K. Perera)..."
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
                    placeholder="Enter 4-digit staff passcode (e.g. 1234)"
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
                      <option value="Hot Wok & Kottu Station">Hot Wok & Kottu Station</option>
                      <option value="Curry & Rice Assembly Bay">Curry & Rice Assembly Bay</option>
                      <option value="Grill & Seafood Station">Grill & Seafood Station</option>
                      <option value="Salad & Cold Prep Station">Salad & Cold Prep Station</option>
                      <option value="Pastry & Bakery Bay">Pastry & Bakery Bay</option>
                      <option value="Hot Wok & Assembly Support">Hot Wok & Assembly Support</option>
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
