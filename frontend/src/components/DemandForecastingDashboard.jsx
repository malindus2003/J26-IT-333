import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, CloudRain, Calendar, ShoppingBag, Sparkles, CheckCircle, 
  BarChart3, AlertCircle, ArrowUpRight, ArrowDownRight, RefreshCw, Cpu, 
  Database, Sliders, Layers, Plus, Check, X, Printer, ChefHat, ShieldCheck, 
  Flame, Scale, PieChart, Info, HelpCircle, Activity, ChevronRight, ChevronLeft, ChevronDown, Eye, Play,
  Zap, Clock, Award, FileText, Sun, Droplets, Utensils,
  Users, MapPin
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  Tooltip, CartesianGrid, Legend, AreaChart, Area, Cell, PieChart as RechartsPie, Pie
} from 'recharts';
import axios from 'axios';

export default function DemandForecastingDashboard({ isDarkMode, currentRole = 'admin' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'analytics', 'xai', 'simulator', 'retraining', 'closed_loop'
  const userRole = currentRole === 'staff' ? 'staff' : 'admin';
  const [demandDropdownOpen, setDemandDropdownOpen] = useState(false);
  const demandDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (demandDropdownRef.current && !demandDropdownRef.current.contains(e.target)) {
        setDemandDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  useEffect(() => {
    if (currentRole === 'staff') {
      setActiveTab('overview');
    }
  }, [currentRole]);
  
  // Search & Filter
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showPrepSheetModal, setShowPrepSheetModal] = useState(false);
  const [selectedItemIngredients, setSelectedItemIngredients] = useState(null);

  // Multi-Horizon Planning (today | tomorrow | day_after)
  const [selectedHorizon, setSelectedHorizon] = useState('today');

  // Simulation State
  const [simWeather, setSimWeather] = useState('Thunderstorm Monsoon');
  const [simTemp, setSimTemp] = useState(24);
  const [simReservations, setSimReservations] = useState(75);
  const [simHoliday, setSimHoliday] = useState(true);
  const [simPromo, setSimPromo] = useState(15);
  const [simDay, setSimDay] = useState('Friday');
  const [simShift, setSimShift] = useState('Dinner');
  const [simResult, setSimResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    fetchDemandData();
  }, []);

  const fetchDemandData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/api/demand/forecasts");
      setData(res.data);
    } catch (err) {
      console.error("Failed to load demand forecasts, using fallback:", err);
      setData({
        module: "AI Food Demand Prediction",
        model_performance: {
          reliability: "High Confidence",
          training_window_days: 90
        },
        contextual_factors: {
          weather_condition: "Coastal Rain Showers (25.0°C) • Hikkaduwa",
          weather_impact: "+16% hot soups, kottu & comfort meal surge",
          active_promotions: "No Active Campaigns (Regular Menu Rates)",
          promo_impact: "Standard regular pricing (0% surge)",
          has_active_promo: false,
          reservations_booked: 0,
          reservations_pax: 0,
          reservations_text: "0 Table Reservations (0 Guests)",
          reservations_impact: "Standard walk-in customer flow (0% reservation lift)",
          reservations_live: true,
          local_events: "No Events Scheduled Today",
          event_impact: "Standard regular dining (0% surge)",
          weather_live: true,
          calendar_live: true
        },
        kpi_summary: {
          total_projected_orders: 420,
          total_prep_recommended: 445,
          total_safety_buffer: 50,
          waste_prevented_est_kg: 18.4,
          cost_saved_today_lkr: 14200.00
        },
        category_breakdown: [
          { category: "Main Course", projected_orders: 205, share_pct: 48.8 },
          { category: "Short Eats & Kottu", projected_orders: 110, share_pct: 26.2 },
          { category: "Italian", projected_orders: 45, share_pct: 10.7 },
          { category: "Dessert", projected_orders: 60, share_pct: 14.3 }
        ],
        items: [
          {
            id: "menu-1",
            name: "Sri Lankan Chicken Rice & Curry",
            category: "Main Course",
            current_stock: 45,
            predicted_demand_today: 120,
            prep_recommendation: 125,
            buffer_quantity: 15,
            price: 1200.0,
            historical_avg: 95,
            confidence: 94.2,
            trend: "+26%",
            key_drivers: ["Rainy afternoon forecast (+18%)", "Public Holiday Eve (+8%)"],
            ingredients: [
              { name: "Samba/Keeri Rice", qty_per_portion: "200g", total_prep_req: "25.0 kg" },
              { name: "Curry Chicken (Bone-in)", qty_per_portion: "180g", total_prep_req: "22.5 kg" },
              { name: "Coconut Milk & Spices", qty_per_portion: "80ml", total_prep_req: "10.0 L" },
              { name: "Dhal / Lentils", qty_per_portion: "60g", total_prep_req: "7.5 kg" }
            ],
            shap_breakdown: { base_value: 95, weather_effect: 17, holiday_event_effect: 8, reservation_effect: 4, promo_effect: 0, waste_feedback_dampener: -4 },
            status: "Available"
          },
          {
            id: "menu-2",
            name: "Seafood Fried Rice (Jumbo)",
            category: "Main Course",
            current_stock: 20,
            predicted_demand_today: 85,
            prep_recommendation: 90,
            buffer_quantity: 10,
            price: 1850.0,
            historical_avg: 70,
            confidence: 91.5,
            trend: "+21%",
            key_drivers: ["Friday Dinner Rush", "Promotion Campaign 10% Off"],
            ingredients: [
              { name: "Basmati Rice", qty_per_portion: "220g", total_prep_req: "19.8 kg" },
              { name: "Calamari & Prawns Mix", qty_per_portion: "150g", total_prep_req: "13.5 kg" },
              { name: "Egg & Spring Onions", qty_per_portion: "1.5 eggs", total_prep_req: "135 eggs" },
              { name: "Soy & Sesame Seasoning", qty_per_portion: "30ml", total_prep_req: "2.7 L" }
            ],
            shap_breakdown: { base_value: 70, weather_effect: 6, holiday_event_effect: 3, reservation_effect: 2, promo_effect: 8, waste_feedback_dampener: -4 },
            status: "Available"
          },
          {
            id: "menu-3",
            name: "Cheese & Vegetable Kottu",
            category: "Short Eats & Kottu",
            current_stock: 15,
            predicted_demand_today: 110,
            prep_recommendation: 115,
            buffer_quantity: 12,
            price: 1400.0,
            historical_avg: 88,
            confidence: 96.0,
            trend: "+25%",
            key_drivers: ["Evening sports match live broadcast", "High reservation volume (42 pax)"],
            ingredients: [
              { name: "Godamba Roti Shreds", qty_per_portion: "250g", total_prep_req: "28.8 kg" },
              { name: "Mozzarella / Fresh Cheese", qty_per_portion: "70g", total_prep_req: "8.1 kg" },
              { name: "Mixed Leeks, Carrot & Cabbage", qty_per_portion: "140g", total_prep_req: "16.1 kg" },
              { name: "Spiced Kottu Gravy", qty_per_portion: "100ml", total_prep_req: "11.5 L" }
            ],
            shap_breakdown: { base_value: 88, weather_effect: 8, holiday_event_effect: 12, reservation_effect: 5, promo_effect: 0, waste_feedback_dampener: -3 },
            status: "Available"
          },
          {
            id: "menu-4",
            name: "Creamy Tomato & Basil Pasta",
            category: "Italian",
            current_stock: 10,
            predicted_demand_today: 45,
            prep_recommendation: 50,
            buffer_quantity: 5,
            price: 1650.0,
            historical_avg: 42,
            confidence: 89.0,
            trend: "+7%",
            key_drivers: ["Stable weekday lunch demand"],
            ingredients: [
              { name: "Penne Pasta", qty_per_portion: "160g", total_prep_req: "8.0 kg" },
              { name: "Fresh Tomato Puree", qty_per_portion: "120g", total_prep_req: "6.0 kg" },
              { name: "Cooking Cream & Parmesan", qty_per_portion: "60g", total_prep_req: "3.0 kg" },
              { name: "Fresh Basil & Olive Oil", qty_per_portion: "20g", total_prep_req: "1.0 kg" }
            ],
            shap_breakdown: { base_value: 42, weather_effect: 2, holiday_event_effect: 1, reservation_effect: 3, promo_effect: 0, waste_feedback_dampener: -3 },
            status: "Available"
          },
          {
            id: "menu-5",
            name: "Tropical Fruit Salad with Honey",
            category: "Dessert",
            current_stock: 8,
            predicted_demand_today: 60,
            prep_recommendation: 65,
            buffer_quantity: 8,
            price: 850.0,
            historical_avg: 40,
            confidence: 93.4,
            trend: "+50%",
            key_drivers: ["Overripe fruit batch inventory alert (FIFO priority push)"],
            ingredients: [
              { name: "Papaya, Pineapple & Melon", qty_per_portion: "180g", total_prep_req: "11.7 kg" },
              { name: "Wild Bee Honey", qty_per_portion: "25ml", total_prep_req: "1.6 L" },
              { name: "Vanilla Bean Ice Cream Scoop", qty_per_portion: "1 scoop", total_prep_req: "65 scoops" }
            ],
            shap_breakdown: { base_value: 40, weather_effect: 3, holiday_event_effect: 2, reservation_effect: 2, promo_effect: 15, waste_feedback_dampener: -2 },
            status: "Available"
          }
        ],
        multi_day_forecast: [
          { day: "Mon", predicted_orders: 310, actual_orders: 305, weather: "Sunny", event: "Normal", lunch_demand: 130, dinner_demand: 148, evening_snacks: 32 },
          { day: "Tue", predicted_orders: 340, actual_orders: 348, weather: "Sunny", event: "Normal", lunch_demand: 142, dinner_demand: 163, evening_snacks: 35 },
          { day: "Wed", predicted_orders: 365, actual_orders: 360, weather: "Cloudy", event: "Normal", lunch_demand: 153, dinner_demand: 175, evening_snacks: 37 },
          { day: "Thu", predicted_orders: 390, actual_orders: 385, weather: "Cloudy", event: "Normal", lunch_demand: 163, dinner_demand: 187, evening_snacks: 40 },
          { day: "Fri (Today)", predicted_orders: 480, actual_orders: null, weather: "Thunderstorm", event: "Weekend Rush", lunch_demand: 201, dinner_demand: 230, evening_snacks: 49 },
          { day: "Sat", predicted_orders: 560, actual_orders: null, weather: "Cloudy", event: "Weekend Rush", lunch_demand: 235, dinner_demand: 268, evening_snacks: 57 },
          { day: "Sun", predicted_orders: 520, actual_orders: null, weather: "Sunny", event: "Weekend Rush", lunch_demand: 218, dinner_demand: 249, evening_snacks: 53 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (itemId) => {
    try {
      const res = await axios.patch(`http://localhost:8000/api/demand/menu/${itemId}/toggle-status`);
      if (res.data.status === 'success') {
        setData(prev => {
          const updatedItems = prev.items.map(item => 
            item.id === itemId ? { 
              ...item, 
              status: res.data.new_status,
              prep_recommendation: res.data.new_prep_recommendation !== undefined ? res.data.new_prep_recommendation : (res.data.new_status === 'Unavailable' ? 0 : item.prep_recommendation),
              buffer_quantity: res.data.new_buffer_quantity !== undefined ? res.data.new_buffer_quantity : (res.data.new_status === 'Unavailable' ? 0 : item.buffer_quantity)
            } : item
          );
          const totalProjected = updatedItems.filter(i => i.status === 'Available').reduce((acc, curr) => acc + (curr.predicted_demand_today || 0), 0);
          const totalPrep = updatedItems.filter(i => i.status === 'Available').reduce((acc, curr) => acc + (curr.prep_recommendation || 0), 0);
          const totalBuf = updatedItems.filter(i => i.status === 'Available').reduce((acc, curr) => acc + (curr.buffer_quantity || 0), 0);
          return {
            ...prev,
            items: updatedItems,
            kpi_summary: {
              ...prev.kpi_summary,
              total_projected_orders: totalProjected,
              total_prep_recommended: totalPrep,
              total_safety_buffer: totalBuf
            }
          };
        });
      }
    } catch (err) {
      console.error("Failed to toggle item status:", err);
    }
  };

  const handleRunSimulation = async () => {
    try {
      setSimulating(true);
      const res = await axios.post("http://localhost:8000/api/demand/simulate", {
        weather_condition: simWeather,
        temperature_c: simTemp,
        reservations_count: simReservations,
        is_holiday: simHoliday,
        active_promo_pct: simPromo,
        day_of_week: simDay,
        meal_shift: simShift
      });
      setSimResult(res.data);
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setSimulating(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="glass-panel p-16 text-center text-slate-500 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="animate-spin h-10 w-10 border-3 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">Initializing AI Food Demand Prediction Engine...</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ingesting multi-source weather, POS records, and reservation signals</p>
      </div>
    );
  }

  const currentHorizonData = data.daily_item_forecasts?.[selectedHorizon] || {
    formatted_label: selectedHorizon === 'tomorrow' ? 'Tomorrow' : selectedHorizon === 'day_after' ? 'Day After Tomorrow' : 'Today',
    date: data.contextual_factors?.date || new Date().toISOString().slice(0, 10),
    day_name: selectedHorizon === 'tomorrow' ? 'Tomorrow' : selectedHorizon === 'day_after' ? 'Day After' : 'Today',
    weather: data.contextual_factors ? {
      weather_condition: data.contextual_factors.weather_condition,
      weather_impact: data.contextual_factors.weather_impact,
      rainfall_mm: data.contextual_factors.rainfall_mm || 0,
      temperature_c: data.contextual_factors.temperature_c || 25,
      is_live_api: data.contextual_factors.weather_live
    } : {},
    calendar: {
      local_events: data.contextual_factors?.local_events,
      event_impact: data.contextual_factors?.event_impact,
      is_live_calendar: data.contextual_factors?.calendar_live
    },
    reservations: {
      reservations_booked: data.contextual_factors?.reservations_booked || 0,
      total_pax: data.contextual_factors?.reservations_pax || 0,
      status_text: data.contextual_factors?.reservations_text,
      impact_text: data.contextual_factors?.reservations_impact,
      is_live_db: data.contextual_factors?.reservations_live
    },
    promotions: {
      active_promotions: data.contextual_factors?.active_promotions,
      promo_impact: data.contextual_factors?.promo_impact,
      has_active_promo: data.contextual_factors?.has_active_promo
    },
    kpi_summary: data.kpi_summary,
    items: data.items
  };

  const activeItems = currentHorizonData.items || data.items || [];
  const activeKpis = currentHorizonData.kpi_summary || data.kpi_summary || {};
  const activeWeather = currentHorizonData.weather || data.contextual_factors || {};
  const activeCalendar = currentHorizonData.calendar || data.contextual_factors || {};
  const activeReservations = currentHorizonData.reservations || data.contextual_factors || {};
  const activePromotions = currentHorizonData.promotions || {
    active_promotions: data.contextual_factors?.active_promotions,
    promo_impact: data.contextual_factors?.promo_impact,
    has_active_promo: data.contextual_factors?.has_active_promo
  };
  const activeCategoryBreakdown = currentHorizonData.category_breakdown || data.category_breakdown || [];

  const categories = ['All', ...new Set(activeItems.map(i => i.category))];
  const filteredItems = activeItems.filter(item => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  const allTabs = [
    { 
      id: 'overview', 
      label: 'Daily Prep Guidance', 
      shortLabel: 'Daily Prep',
      description: 'Item-level kitchen prep sizing, safety buffer recommendations & stock alerts',
      badge: 'Operational',
      badgeColor: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
      icon: <Utensils className="h-4 w-4" />, 
      roles: ['staff', 'admin'] 
    },
    { 
      id: 'analytics', 
      label: '7-Day & Shift Demand Analytics', 
      shortLabel: '7-Day Trends',
      description: 'Weekly order trends, lunch/dinner peak breakdowns, weather effects & revenue projections',
      badge: 'Time-Series',
      badgeColor: 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-700',
      icon: <BarChart3 className="h-4 w-4" />, 
      roles: ['admin'] 
    },
    { 
      id: 'xai', 
      label: 'Explainable AI (XAI) & Factor Attribution', 
      shortLabel: 'Explainable AI',
      description: 'Transparent attribution breakdown explaining key factors and real-time conditions driving customer dish demand',
      badge: 'Explainable AI',
      badgeColor: 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-700',
      icon: <Cpu className="h-4 w-4" />, 
      roles: ['admin'] 
    },
    { 
      id: 'simulator', 
      label: '"What-If" Scenario Simulation Sandbox', 
      shortLabel: 'Simulation',
      description: 'Interactive parameter sliders to simulate weather shifts, discounts & event surges',
      badge: 'Interactive',
      badgeColor: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-700',
      icon: <Sliders className="h-4 w-4" />, 
      roles: ['admin'] 
    }
  ];

  const visibleTabs = allTabs.filter(t => t.roles.includes(userRole));
  const activeTabToRender = userRole === 'staff' ? 'overview' : activeTab;

  const currentTabIdx = visibleTabs.findIndex(t => t.id === activeTab);
  const handlePrevTab = () => {
    if (visibleTabs.length <= 1) return;
    const prevIdx = (currentTabIdx - 1 + visibleTabs.length) % visibleTabs.length;
    setActiveTab(visibleTabs[prevIdx].id);
  };
  const handleNextTab = () => {
    if (visibleTabs.length <= 1) return;
    const nextIdx = (currentTabIdx + 1) % visibleTabs.length;
    setActiveTab(visibleTabs[nextIdx].id);
  };

  return (
    <div className="space-y-6">
      
      {/* Research Header Banner with Role-Adaptive View */}
      <div className="glass-panel p-3.5 sm:p-6 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-[#cbdad0] dark:border-slate-800 shadow-sm relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-5">
          <div className="space-y-1.5 sm:space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              {userRole === 'staff' ? (
                <>
                  <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black bg-emerald-700 text-white shadow-sm flex items-center gap-1.5">
                    <ChefHat className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Kitchen Prep Station Mode
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Live Shift Prep Guidance
                  </span>
                </>
              ) : (
                <>
                  
                  <span className="px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    <span>{data?.active_branch?.name || "Hikkaduwa Beachfront (Main Branch)"}</span>
                  </span>
                </>
              )}
            </div>
            
            <h2 className="text-base sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {userRole === 'staff' 
                ? "Kitchen Food Preparation & Batch Sizing"
                : "Food Demand & Kitchen Prep Forecast"
              }
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {userRole === 'staff'
                ? "Shift prep quantities and safety buffers for line cooks, or print daily kitchen prep sheets."
                : "Item-level demand predictions and kitchen prep guidance calibrated with live weather and dining reservations."
              }
            </p>
          </div>
        </div>
      </div>

      {/* Subcategory Navigation: Shown for Admin/Manager with clean selecting tabs */}
      {userRole === 'admin' ? (
        <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-[#cbdad0] dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            
            {/* Previous / Next Stepper */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-0.5 shadow-2xs flex-shrink-0">
              <button
                type="button"
                onClick={handlePrevTab}
                title="Previous Subcategory"
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-[10px] font-mono font-bold px-2.5 text-slate-600 dark:text-slate-400 select-none">
                {currentTabIdx + 1}/{visibleTabs.length}
              </span>
              <button
                type="button"
                onClick={handleNextTab}
                title="Next Subcategory"
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Selecting Pills (Tabs) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1 justify-start sm:justify-end">
              {visibleTabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border cursor-pointer ${
                    activeTab === t.id
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-[#d5e2d9] dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {t.shortLabel || t.label}
                </button>
              ))}
            </div>

          </div>
        </div>
      ) : (
        /* Focused Clean Kitchen Station Header Bar for Chef */
        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-700 text-white shadow-sm flex-shrink-0">
              <ChefHat className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-black text-emerald-950 dark:text-emerald-200 uppercase tracking-wide">
                Daily Shift Prep Station • Kitchen Service Active
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                Review batch sizes below, or print the checklist for line cooks.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowPrepSheetModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Printer className="h-4 w-4" />
            Print Shift Prep Sheet
          </button>
        </div>
      )}

      {/* Multi-Source Live Contextual Drivers Bar (Always visible for quick situational awareness) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* Weather Driver */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#cbdad0] dark:border-slate-800 shadow-sm flex items-start gap-3.5 min-h-[90px]">
          <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20 flex-shrink-0 mt-0.5">
            <CloudRain className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1.5 mb-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Weather Intelligence</span>
              <span className="text-[9px] font-black uppercase text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-950/60 px-1.5 py-0.5 rounded">
                {currentHorizonData.day_name || (selectedHorizon === 'tomorrow' ? 'Tomorrow' : selectedHorizon === 'day_after' ? 'Day After' : 'Today')}
              </span>
            </div>
            <div className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug break-words">
              {activeWeather.weather_condition || data.contextual_factors?.weather_condition}
            </div>
          </div>
        </div>

        {/* Reservations Driver */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#cbdad0] dark:border-slate-800 shadow-sm flex items-start gap-3.5 min-h-[90px]">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 flex-shrink-0 mt-0.5">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1.5 mb-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Customer Bookings</span>
              <span className="text-[9px] font-black uppercase text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded">
                {currentHorizonData.day_name || (selectedHorizon === 'tomorrow' ? 'Tomorrow' : selectedHorizon === 'day_after' ? 'Day After' : 'Today')}
              </span>
            </div>
            <div className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug break-words">
              {activeReservations.status_text || activeReservations.reservations_text || `${activeReservations.reservations_booked ?? 0} Table Reservations`}
            </div>
          </div>
        </div>

        {/* Local Events Driver */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#cbdad0] dark:border-slate-800 shadow-sm flex items-start gap-3.5 min-h-[90px]">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 flex-shrink-0 mt-0.5">
            <Award className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1.5 mb-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Local Event Radar</span>
              <span className="text-[9px] font-black uppercase text-purple-800 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-1.5 py-0.5 rounded">
                {currentHorizonData.day_name || (selectedHorizon === 'tomorrow' ? 'Tomorrow' : selectedHorizon === 'day_after' ? 'Day After' : 'Today')}
              </span>
            </div>
            <div className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug break-words">
              {activeCalendar.local_events || data.contextual_factors?.local_events}
            </div>
          </div>
        </div>

        {/* Active Promotions Driver */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#cbdad0] dark:border-slate-800 shadow-sm flex items-start gap-3.5 min-h-[90px]">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 flex-shrink-0 mt-0.5">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1.5 mb-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Active Campaign</span>
              <span className="text-[9px] font-black uppercase text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                {currentHorizonData.day_name || (selectedHorizon === 'tomorrow' ? 'Tomorrow' : selectedHorizon === 'day_after' ? 'Day After' : 'Today')}
              </span>
            </div>
            <div className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug break-words">
              {activePromotions.active_promotions || data.contextual_factors?.active_promotions}
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & DAILY KITCHEN PREP GUIDANCE */}
      {/* ========================================================================= */}
      {activeTabToRender === 'overview' && (
        <div className="space-y-6">
          
          {/* 3-Day Planning Horizon Switcher Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#cbdad0] dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  Multi-Horizon Forecasting Horizon
                </h4>
            
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Switch planning horizon to preview dynamic item-level demand, kitchen prep guidance, and ingredient requirements
              </p>
            </div>

            {/* 3 Horizon Buttons */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-[#d5e2d9] dark:border-slate-700 self-start md:self-auto">
              <button
                onClick={() => setSelectedHorizon('today')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedHorizon === 'today'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Today</span>
                {data.daily_item_forecasts?.today?.date && (
                  <span className="text-[10px] opacity-80 font-mono font-normal">
                    {data.daily_item_forecasts.today.date.slice(5)}
                  </span>
                )}
              </button>

              <button
                onClick={() => setSelectedHorizon('tomorrow')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedHorizon === 'tomorrow'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Tomorrow</span>
                {data.daily_item_forecasts?.tomorrow?.date && (
                  <span className="text-[10px] opacity-80 font-mono font-normal">
                    {data.daily_item_forecasts.tomorrow.date.slice(5)}
                  </span>
                )}
              </button>

              <button
                onClick={() => setSelectedHorizon('day_after')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedHorizon === 'day_after'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Day After</span>
                {data.daily_item_forecasts?.day_after?.date && (
                  <span className="text-[10px] opacity-80 font-mono font-normal">
                    {data.daily_item_forecasts.day_after.date.slice(5)}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Dynamic Horizon Context Banner */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 via-sky-50 to-amber-50 dark:from-emerald-950/30 dark:via-sky-950/30 dark:to-amber-950/30 border border-emerald-200 dark:border-emerald-800/50 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-700 text-white">
                {currentHorizonData.formatted_label || selectedHorizon.toUpperCase()}
              </span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200">
                {currentHorizonData.date} ({currentHorizonData.day_name})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1 font-semibold text-sky-800 dark:text-sky-300">
                <CloudRain className="h-3.5 w-3.5 text-sky-600" />
                {activeWeather.weather_condition || "Live Meteorological Context"}
              </span>
              <span className="text-slate-400">•</span>
              <span className="font-semibold text-amber-800 dark:text-amber-300">
                {activeReservations.status_text || `${activeReservations.reservations_booked || 0} Bookings`}
              </span>
              <span className="text-slate-400">•</span>
              <span className="font-semibold text-purple-800 dark:text-purple-300">
                {activeCalendar.local_events || "Regular Service"}
              </span>
            </div>
          </div>

          {/* Quick Sizing Metric KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#cbdad0] dark:border-slate-800 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Total Projected Demand</span>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{activeKpis.total_projected_orders ?? data.kpi_summary.total_projected_orders} Orders</div>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                <ArrowUpRight className="h-3.5 w-3.5" /> For {currentHorizonData.day_name || 'Selected Day'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#cbdad0] dark:border-slate-800 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Recommended Prep Target</span>
              <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{activeKpis.total_prep_recommended ?? data.kpi_summary.total_prep_recommended} Portions</div>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-0.5">Includes meal shift split</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#cbdad0] dark:border-slate-800 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Dynamic Safety Buffer</span>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">+{activeKpis.total_safety_buffer ?? data.kpi_summary.total_safety_buffer} Portions</div>
              <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold mt-0.5">Prevents mid-shift stockouts</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#cbdad0] dark:border-slate-800 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Waste Prevented Today</span>
              <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{activeKpis.waste_prevented_est_kg ?? data.kpi_summary.waste_prevented_est_kg} kg</div>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold mt-0.5">~ LKR {activeKpis.cost_saved_today_lkr ? activeKpis.cost_saved_today_lkr.toLocaleString() : '14,200'} saved</span>
            </div>
          </div>

          {/* Item-Level Prep Recommendations Table */}
          <div className="glass-panel p-6 rounded-2xl bg-white dark:bg-slate-900 border border-[#cbdad0] dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2ece5] dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                  Item-Level Kitchen Preparation Sizing Table
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Batch prep guidance and safety buffers calibrated for {currentHorizonData.formatted_label || 'Today'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowPrepSheetModal(true)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#f0f5f2] hover:bg-[#e4ece7] text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-[#d5e2d9] dark:border-slate-700 flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                  Export Chef Prep Sheet
                </button>
              </div>
            </div>

            {/* Category Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Search dish or category..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 px-3.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-[#d5e2d9] dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-[#cbdad0] dark:border-slate-800">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-[#f4f8f5] dark:bg-slate-950 text-slate-800 dark:text-slate-300 uppercase font-bold border-b border-[#cbdad0] dark:border-slate-800 text-[11px] tracking-wider">
                  <tr>
                    <th className="py-4 px-6">Menu Dish</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Predicted Demand</th>
                    <th className="py-4 px-5">Prep Guidance</th>
                    <th className="py-4 px-4">Safety Buffer</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4ece7] dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-[#f8faf9] dark:hover:bg-slate-800/40 transition-colors">
                      
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</div>
                        <div className="mt-0.5">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-semibold">LKR {item.price.toFixed(2)}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200/80 dark:border-slate-700 inline-block">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-base font-black text-slate-900 dark:text-white">{item.predicted_demand_today} <span className="text-xs font-normal text-slate-500">portions</span></div>
                      </td>

                      <td className="py-4 px-5">
                        <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 font-extrabold border border-emerald-300 dark:border-emerald-700 shadow-xs inline-block">
                          Prepare {item.prep_recommendation} portions
                        </span>
                      </td>

                      <td className="py-4 px-4 font-mono font-bold">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 inline-block">
                          +{item.buffer_quantity} ready
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => setSelectedItemIngredients(item)}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                            title="View Ingredient Calculation"
                          >
                            <Scale className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: 7-DAY & SHIFT DEMAND ANALYTICS */}
      {/* ========================================================================= */}
      {activeTabToRender === 'analytics' && (
        <div className="space-y-6">
          
          {/* Multi-Day Projection Chart */}
          <div className="glass-panel p-6 rounded-2xl bg-white dark:bg-slate-900 border border-[#cbdad0] dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e2ece5] dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                  7-Day Multi-Day Restaurant Food Demand Forecast
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Comparing actual POS historical orders vs XGBoost Regressor predicted volumes
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-700">
                  {data.multi_day_forecast?.find(d => d.day?.includes('Today'))?.day || 'Today'}: {data.multi_day_forecast?.find(d => d.day?.includes('Today'))?.predicted_orders || 480} Projected
                </span>
                <span className="text-xs font-bold text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-xl border border-purple-200 dark:border-purple-700">
                  Weekend Peak: {Math.max(...(data.multi_day_forecast?.map(d => d.predicted_orders) || [560]))} Projected
                </span>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.multi_day_forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#1e293b" : "#e2e8f0"} />
                  <XAxis dataKey="day" stroke={isDarkMode ? "#94a3b8" : "#64748b"} fontSize={11} />
                  <YAxis stroke={isDarkMode ? "#94a3b8" : "#64748b"} fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                      borderColor: isDarkMode ? '#334155' : '#cbd5e1',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: isDarkMode ? '#f8fafc' : '#0f172a',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="actual_orders" fill="#3b82f6" name="Actual POS Sales" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="predicted_orders" fill="#059669" name="AI Predicted Demand" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Shift-Level Split & Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Shift Breakdown (Lunch vs Dinner vs Late Night) */}
            <div className="glass-panel p-6 rounded-2xl bg-white dark:bg-slate-900 border border-[#cbdad0] dark:border-slate-800 shadow-sm space-y-4">
              <div className="border-b border-[#e2ece5] dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                  Meal Shift Demand Split (Lunch vs Dinner vs Snacks)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Assists kitchen shift scheduling and batch preparation timing
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.multi_day_forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#1e293b" : "#e2e8f0"} />
                    <XAxis dataKey="day" stroke={isDarkMode ? "#94a3b8" : "#64748b"} fontSize={11} />
                    <YAxis stroke={isDarkMode ? "#94a3b8" : "#64748b"} fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                        borderColor: isDarkMode ? '#334155' : '#cbd5e1',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="dinner_demand" stackId="1" stroke="#059669" fill="#10b981" fillOpacity={0.6} name="Dinner Rush (18:30-22:30)" />
                    <Area type="monotone" dataKey="lunch_demand" stackId="1" stroke="#3b82f6" fill="#60a5fa" fillOpacity={0.6} name="Lunch Rush (11:30-15:00)" />
                    <Area type="monotone" dataKey="evening_snacks" stackId="1" stroke="#f59e0b" fill="#fbbf24" fillOpacity={0.6} name="Snacks & Beverages" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Share Distribution */}
            <div className="glass-panel p-6 rounded-2xl bg-white dark:bg-slate-900 border border-[#cbdad0] dark:border-slate-800 shadow-sm space-y-4">
              <div className="border-b border-[#e2ece5] dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                  Menu Category Demand Distribution
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Share of forecasted orders across restaurant menu groups
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={activeCategoryBreakdown}
                        dataKey="projected_orders"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={45}
                        paddingAngle={4}
                      >
                        {activeCategoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2">
                  {activeCategoryBreakdown.map((cat, idx) => (
                    <div key={cat.category} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{cat.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-slate-900 dark:text-white">{cat.projected_orders} orders</span>
                        <span className="text-[10px] text-slate-500 block">({cat.share_pct}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: EXPLAINABLE AI (XAI) & FACTOR ATTRIBUTION */}
      {/* ========================================================================= */}
      {activeTabToRender === 'xai' && (
        <div className="space-y-6">
          
         


            
       

          {/* ITEM-LEVEL DEMAND FACTOR BREAKDOWN */}
          <div className="glass-panel p-6 rounded-2xl bg-white dark:bg-slate-900 border border-[#cbdad0] dark:border-slate-800 shadow-sm space-y-4">
            <div className="border-b border-[#e2ece5] dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                Dish-by-Dish Demand Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Detailed breakdown explaining why each dish recommendation rises or falls based on weather, calendar, bookings, and waste reduction
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {activeItems.map((item) => {
                const weatherEff = item.shap_breakdown?.weather_effect ?? 0;
                const calEff = item.shap_breakdown?.holiday_event_effect ?? 0;
                const resEff = item.shap_breakdown?.reservation_effect ?? 0;
                const promoEff = item.shap_breakdown?.promo_effect ?? 0;
                const wasteEff = item.shap_breakdown?.waste_feedback_dampener ?? 0;

                const hasAdjustments = weatherEff !== 0 || calEff !== 0 || resEff !== 0 || promoEff !== 0 || wasteEff !== 0;

                return (
                  <div key={item.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-[#cbdad0] dark:border-slate-700 space-y-3 shadow-sm flex flex-col justify-between">
                    
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</h4>
                          <span className="text-xs text-slate-500 font-medium">{item.category}</span>
                        </div>
                        <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-700">
                          Target: {item.predicted_demand_today} portions
                        </span>
                      </div>

                      {/* Factor Breakdown */}
                      <div className="space-y-2 text-xs pt-2">
                        
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Average Daily Sales:</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                            {item.shap_breakdown?.base_value ?? item.historical_avg ?? item.predicted_demand_today} portions
                          </span>
                        </div>

                        {weatherEff !== 0 && (
                          <div className={`flex items-center justify-between ${weatherEff > 0 ? 'text-sky-700 dark:text-sky-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            <span className="flex items-center gap-1.5"><CloudRain className="h-3.5 w-3.5 flex-shrink-0" /> Weather Impact:</span>
                            <span className="font-mono font-bold">{weatherEff > 0 ? `+${weatherEff}` : weatherEff} portions</span>
                          </div>
                        )}

                        {calEff !== 0 && (
                          <div className={`flex items-center justify-between ${calEff > 0 ? 'text-purple-700 dark:text-purple-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            <span className="flex items-center gap-1.5"><Award className="h-3.5 w-3.5 flex-shrink-0" /> Day & Event Impact:</span>
                            <span className="font-mono font-bold">{calEff > 0 ? `+${calEff}` : calEff} portions</span>
                          </div>
                        )}

                        {resEff !== 0 && (
                          <div className={`flex items-center justify-between ${resEff > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 flex-shrink-0" /> Table Reservations:</span>
                            <span className="font-mono font-bold">{resEff > 0 ? `+${resEff}` : resEff} portions</span>
                          </div>
                        )}

                        {promoEff > 0 && (
                          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
                            <span className="flex items-center gap-1.5"><ShoppingBag className="h-3.5 w-3.5 flex-shrink-0" /> Active Promotion:</span>
                            <span className="font-mono font-bold">+{promoEff} portions</span>
                          </div>
                        )}

                        {wasteEff !== 0 && (
                          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 border-t border-slate-200 dark:border-slate-700 pt-1.5">
                            <span className="flex items-center gap-1.5" title="Portion reduction based on past waste to prevent spoilage">
                              <Scale className="h-3.5 w-3.5 flex-shrink-0" /> Waste Reduction:
                            </span>
                            <span className="font-mono font-bold">{wasteEff > 0 ? `+${wasteEff}` : wasteEff} portions</span>
                          </div>
                        )}

                        {!hasAdjustments && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1">
                            Standard baseline prep (no external adjustments today)
                          </div>
                        )}

                      </div>
                    </div>

                 

                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: "WHAT-IF" SCENARIO SIMULATION SANDBOX */}
      {/* ========================================================================= */}
      {activeTabToRender === 'simulator' && (
        <div className="space-y-6">
          
          <div className="glass-panel p-6 rounded-2xl bg-white dark:bg-slate-900 border border-[#cbdad0] dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e2ece5] dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                  Interactive "What-If" Demand Scenario Simulator
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Simulate custom weather, reservation surges, marketing flash discounts, and holidays to evaluate real-time demand impacts
                </p>
              </div>

              <button
                onClick={handleRunSimulation}
                disabled={simulating}
                className="px-5 py-2 rounded-xl text-xs font-black bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-700/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {simulating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                <span>Execute Scenario Simulation</span>
              </button>
            </div>

            {/* Simulation Controls Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-[#f8faf9] dark:bg-slate-800/60 p-5 rounded-2xl border border-[#d5e2d9] dark:border-slate-700">
              
              {/* Weather Condition */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Weather Forecast</label>
                <select
                  value={simWeather}
                  onChange={e => setSimWeather(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-[#d5e2d9] dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                >
                  <option value="Sunny & Hot (32°C)">Sunny & Hot (32°C)</option>
                  <option value="Thunderstorm Monsoon">Heavy Monsoon Rain (24°C)</option>
                  <option value="Overcast & Pleasant (27°C)">Overcast & Pleasant (27°C)</option>
                  <option value="Evening Light Drizzle (25°C)">Evening Light Drizzle (25°C)</option>
                </select>
              </div>

              {/* Table Reservations Count Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Table Reservations (Pax)</label>
                  <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">{simReservations} Pax</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="120"
                  value={simReservations}
                  onChange={e => setSimReservations(parseInt(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Active Promotion Discount % Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Marketing Promotion Discount</label>
                  <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-400">{simPromo}% Off</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="5"
                  value={simPromo}
                  onChange={e => setSimPromo(parseInt(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>

              {/* Day of the Week */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Day of the Week</label>
                <select
                  value={simDay}
                  onChange={e => setSimDay(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-[#d5e2d9] dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                >
                  <option value="Monday">Monday (Weekday Baseline)</option>
                  <option value="Wednesday">Wednesday (Midweek)</option>
                  <option value="Friday">Friday (Weekend Rush Starts)</option>
                  <option value="Saturday">Saturday (Peak Dine-In)</option>
                  <option value="Sunday">Sunday (Family Lunch Surge)</option>
                </select>
              </div>

              {/* Meal Shift */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Meal Shift</label>
                <select
                  value={simShift}
                  onChange={e => setSimShift(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-[#d5e2d9] dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                >
                  <option value="Lunch">Lunch Service (11:30 - 15:00)</option>
                  <option value="Dinner">Dinner Service (18:30 - 22:30)</option>
                  <option value="Full Day">Full Day Aggregated</option>
                </select>
              </div>

              {/* Public Holiday Flag */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-[#d5e2d9] dark:border-slate-700 mt-2">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Public Holiday / Festival</span>
                  <span className="text-[10px] text-slate-500">Poya / Long weekend traffic</span>
                </div>
                <input
                  type="checkbox"
                  checked={simHoliday}
                  onChange={e => setSimHoliday(e.target.checked)}
                  className="h-4 w-4 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

            </div>

            {/* Simulation Results Display */}
            {simResult && (
              <div className="space-y-4 pt-2 border-t border-[#e2ece5] dark:border-slate-800 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 gap-3">
                  <div>
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">Simulated Demand Outcome</span>
                    <div className="text-xl font-black text-emerald-950 dark:text-white mt-0.5">
                      {simResult.total_simulated_demand} Orders Forecasted • Recommended Prep: {simResult.total_simulated_prep} Portions
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 shadow-sm">
                      Composite Shift Multiplier: {simResult.composite_multiplier}x
                    </span>
                  </div>
                </div>

                {/* Scenario Rationale Bullet Points */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">AI Contextual Driver Adjustments:</span>
                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
                    {simResult.impact_reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                {/* Simulated Item Sizing Table */}
                <div className="overflow-x-auto rounded-2xl border border-[#cbdad0] dark:border-slate-800">
                  <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                    <thead className="bg-[#f4f8f5] dark:bg-slate-950 text-slate-800 dark:text-slate-300 uppercase font-bold border-b border-[#cbdad0] dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Menu Dish</th>
                        <th className="py-3 px-3">Original Forecast</th>
                        <th className="py-3 px-3">Simulated Demand</th>
                        <th className="py-3 px-3">Variance vs 90d Baseline</th>
                        <th className="py-3 px-4">Adjusted Kitchen Prep Recommendation</th>
                        <th className="py-3 px-3 text-right">Adjusted Buffer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e4ece7] dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {simResult.simulated_items.map(item => (
                        <tr key={item.id} className="hover:bg-[#f8faf9] dark:hover:bg-slate-800/40">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{item.name}</td>
                          <td className="py-3 px-3 text-slate-500 font-mono">{item.original_demand} portions</td>
                          <td className="py-3 px-3 font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">{item.simulated_demand} portions</td>
                          <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">{item.variance}</td>
                          <td className="py-3 px-4">
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-700">
                              Prepare {item.simulated_prep} portions
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">+{item.simulated_buffer} ready</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: INGREDIENT SIZING BREAKDOWN */}
      {/* ========================================================================= */}
      {selectedItemIngredients && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel bg-white dark:bg-slate-900 max-w-md w-full p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Scale className="h-4 w-4 text-emerald-600" />
                  Raw Ingredient Sizing: {selectedItemIngredients.name}
                </h3>
                <span className="text-[11px] text-slate-500">Calculated for {selectedItemIngredients.prep_recommendation} recommended portions</span>
              </div>
              <button onClick={() => setSelectedItemIngredients(null)} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {selectedItemIngredients.ingredients && selectedItemIngredients.ingredients.length > 0 ? (
                selectedItemIngredients.ingredients.map((ing, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">{ing.name}</span>
                      <span className="text-[10px] text-slate-500">{ing.qty_per_portion} per portion</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 text-sm">{ing.total_prep_req}</span>
                      <span className="text-[10px] text-slate-500 block">Total required</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-slate-500">No ingredient breakdown available for this item.</div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setSelectedItemIngredients(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CHEF PREP SHEET EXPORT */}
      {/* ========================================================================= */}
      {showPrepSheetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel bg-white dark:bg-slate-900 max-w-2xl w-full p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  Official Kitchen Preparation Sizing Sheet
                </h3>
                <span className="text-[11px] text-slate-500">
                  Target Planning Window: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{currentHorizonData.formatted_label || 'Today'}</strong> • {currentHorizonData.date || 'Today'} ({currentHorizonData.day_name || ''}) • Generated by AI Food Demand Module
                </span>
              </div>
              <button onClick={() => setShowPrepSheetModal(false)} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between gap-2">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Shift Window: Lunch (11:30) & Dinner (18:30)</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Live Context: {activeWeather.condition || activeWeather.weather_condition || 'Normal Weather'} ({activeWeather.precipitation_mm ?? 0}mm rain, {activeWeather.temperature_c ?? activeWeather.temperature_max ?? 26}°C) • {activeCalendar.holiday_name ? `${activeCalendar.holiday_name} Holiday` : 'Standard Trading Day'}
                  </p>
                </div>
                <div className="sm:text-right">
                  <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm">{activeKpis.total_prep_recommended ?? data.kpi_summary?.total_prep_recommended} Total Portions</span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Item Name</th>
                      <th className="py-2.5 px-3">Prep Target</th>
                      <th className="py-2.5 px-3">Safety Buffer</th>
                      <th className="py-2.5 px-3">Station / Chef Advice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {activeItems.filter(i => i.status === 'Available').map(item => (
                      <tr key={item.id}>
                        <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">{item.name}</td>
                        <td className="py-2.5 px-3 font-mono font-black text-emerald-700 dark:text-emerald-400">{item.prep_recommendation} portions</td>
                        <td className="py-2.5 px-3 font-mono text-amber-600 font-bold">+{item.buffer_quantity} ready</td>
                        <td className="py-2.5 px-3 text-slate-500">{item.key_drivers?.[0] || 'Standard baseline sizing'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowPrepSheetModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="h-3.5 w-3.5" />
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

