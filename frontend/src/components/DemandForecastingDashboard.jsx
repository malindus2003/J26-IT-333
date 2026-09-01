import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, CloudRain, Calendar, ShoppingBag, Sparkles, CheckCircle, 
  BarChart3, AlertCircle, ArrowUpRight, ArrowDownRight, RefreshCw, Cpu, 
  Database, Sliders, Layers, Plus, Check, X, Printer, ChefHat, ShieldCheck, 
  Flame, Scale, PieChart, Info, HelpCircle, Activity, ChevronRight, ChevronLeft, ChevronDown, Eye, Play,
  Zap, Clock, Award, FileText, ToggleLeft, ToggleRight, Sun, Droplets, Utensils,
  Users
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
  const [userRole, setUserRole] = useState(currentRole === 'staff' ? 'staff' : 'admin');
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
      setUserRole('staff');
      setActiveTab('overview');
    } else {
      setUserRole('admin');
    }
  }, [currentRole]);
  
  // Search & Filter
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPrepSheetModal, setShowPrepSheetModal] = useState(false);
  const [selectedItemIngredients, setSelectedItemIngredients] = useState(null);

  // New Item Form State
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Main Course');
  const [newItemPrice, setNewItemPrice] = useState('1250');
  const [newItemBaseAvg, setNewItemBaseAvg] = useState('60');

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

  // Retraining State
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainProgress, setRetrainProgress] = useState(0);
  const [retrainLogs, setRetrainLogs] = useState([]);
  const [retrainResult, setRetrainResult] = useState(null);
  const [selectedTrainingWindow, setSelectedTrainingWindow] = useState(90);

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
        researcher: "Nanayakkara K.A.J.Y (IT23314542)",
        module: "Component 1: AI Food Demand Prediction",
        model_performance: {
          algorithm: "Hybrid Random Forest + Prophet Multi-Source Time-Series",
          rmse: 4.12,
          mae: 3.05,
          mape: "4.8%",
          training_window_days: 90
        },
        contextual_factors: {
          weather_condition: "Heavy Evening Rain (24°C)",
          weather_impact: "+18% delivery & comfort food surge",
          active_promotions: "10% Family Dinner Flash Deal",
          reservations_booked: 64,
          local_events: "Inter-University Rugby Match (Nearby Venue)"
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
        data_pipeline_health: {
          total_pos_records_ingested: 18450,
          clean_records_pct: 99.4,
          missing_values_imputed: 38,
          outliers_handled: 12,
          engineered_features_count: 28,
          features_list: ["Lag-1 Day", "Lag-7 Day", "Lag-14 Day", "7-Day Moving Avg", "14-Day Moving Avg", "Precipitation_mm", "Temp_C", "Is_Holiday", "Promo_Discount_Pct", "Pax_Reservations", "Food_Category_Code", "Waste_Feedback_Index"]
        },
        retraining_history: [
          {
            id: "train-log-1",
            timestamp: "2026-08-25 04:30 AM",
            records_ingested: 18450,
            training_window: "90 Days POS Data",
            rmse_before: 4.62,
            rmse_after: 4.12,
            mae_before: 3.48,
            mae_after: 3.05,
            mape_before: "5.7%",
            mape_after: "4.8%",
            status: "Success",
            trigger: "Scheduled Automated Weekly Retraining"
          }
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
        setData(prev => ({
          ...prev,
          items: prev.items.map(item => 
            item.id === itemId ? { ...item, status: res.data.new_status } : item
          )
        }));
      }
    } catch (err) {
      console.error("Failed to toggle item status:", err);
    }
  };

  const handleAddNewItem = async (e) => {
    e.preventDefault();
    if (!newItemName) return;
    try {
      const res = await axios.post("http://localhost:8000/api/demand/menu/add", {
        name: newItemName,
        category: newItemCategory,
        price: parseFloat(newItemPrice) || 1000,
        historical_avg: parseInt(newItemBaseAvg) || 50,
        prep_lead_time_mins: 25
      });
      if (res.data.status === 'success') {
        setShowAddModal(false);
        setNewItemName('');
        fetchDemandData();
      }
    } catch (err) {
      console.error("Failed to add menu item:", err);
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

  const handleTriggerRetraining = async () => {
    setIsRetraining(true);
    setRetrainProgress(15);
    setRetrainLogs(["Initializing POS sales ingestion pipeline...", "Connecting to restaurant POS database..."]);
    setRetrainResult(null);

    setTimeout(() => {
      setRetrainProgress(45);
      setRetrainLogs(prev => [...prev, "Ingesting 18,450 historical transaction records across 90 days...", "Running missing record imputation and Winsorization outlier smoothing..."]);
    }, 900);

    setTimeout(() => {
      setRetrainProgress(75);
      setRetrainLogs(prev => [...prev, "Feature engineering: Lag-1, Lag-7, Lag-14, 7-day Rolling Averages...", "Training Random Forest Regressor (150 estimators) & Facebook Prophet seasonality model..."]);
    }, 1800);

    setTimeout(async () => {
      try {
        const res = await axios.post(`http://localhost:8000/api/demand/retrain?training_window_days=${selectedTrainingWindow}`);
        setRetrainProgress(100);
        setRetrainResult(res.data);
        setRetrainLogs(res.data.pipeline_steps);
        fetchDemandData();
      } catch (err) {
        console.error("Retraining failed:", err);
      } finally {
        setIsRetraining(false);
      }
    }, 2800);
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

  const categories = ['All', ...new Set(data.items.map(i => i.category))];
  const filteredItems = data.items.filter(item => {
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
      shortLabel: 'XAI Drivers',
      description: 'Feature importance rankings, SHAP values, holiday effects & weather impact weights',
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
    },
    { 
      id: 'retraining', 
      label: 'Data Pipeline & Continuous Model Retraining', 
      shortLabel: 'Retraining',
      description: 'POS sales ingestion pipelines, automated model retraining logs & drift monitors',
      badge: 'MLOps',
      badgeColor: 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-700',
      icon: <Database className="h-4 w-4" />, 
      roles: ['admin'] 
    },
    { 
      id: 'closed_loop', 
      label: 'Closed Feedback Loop & Cross-Module Intelligence', 
      shortLabel: 'Feedback Loop',
      description: 'Cross-module sync connecting leftover plate waste metrics directly into future demand targets',
      badge: 'Closed-Loop',
      badgeColor: 'bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-300 border-teal-300 dark:border-teal-700',
      icon: <Sparkles className="h-4 w-4" />, 
      roles: ['admin'] 
    }
  ];

  const visibleTabs = allTabs;

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
      
      {/* Research Header Banner */}
      <div className="glass-panel p-3.5 sm:p-6 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-[#cbdad0] dark:border-slate-800 shadow-sm relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-5">
          <div className="space-y-1.5 sm:space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black bg-emerald-700 text-white shadow-sm flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Component 1: AI Demand Prediction
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Multi-Source Time-Series
              </span>
            </div>
            
            <h2 className="text-base sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Multi-Source Food Demand Forecasting & Kitchen Preparation Sizing
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Multi-source time-series forecasting integrating 60–90 days POS records, live weather APIs, holiday calendars, reservations, and promotions to produce item-level prep targets and dynamic safety buffers while eliminating overproduction waste.
            </p>
          </div>

          {/* Key Metric Highlight */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#f4f8f5] dark:bg-slate-800/90 border border-[#d5e2d9] dark:border-slate-700 shadow-sm w-full sm:w-auto min-w-0 sm:min-w-[210px]">
            <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Model Accuracy (MAPE)</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{data.model_performance.mape} (95.2%)</div>
            <div className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 font-semibold mt-0.5 sm:mt-1 flex items-center gap-1">
              <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-600" />
              <span>RMSE: {data.model_performance.rmse} • MAE: {data.model_performance.mae}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Standalone Subcategory Navigation & Dropdown Bar (No Parent Clipping, High Z-Index) */}
      <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-[#cbdad0] dark:border-slate-800 shadow-sm relative z-30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Main Dropdown Selector */}
          <div className="relative w-full lg:w-96" ref={demandDropdownRef}>
            <div className="flex items-center justify-between gap-2 mb-1.5 lg:hidden">
              <span className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400">
                Select Demand Subcategory:
              </span>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                6 Subcategories Available
              </span>
            </div>

            {(() => {
              const currentTabObj = allTabs.find(t => t.id === activeTab) || allTabs[0];
              return (
                <>
                  <button
                    type="button"
                    onClick={() => setDemandDropdownOpen(!demandDropdownOpen)}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-emerald-600/30 hover:border-emerald-600 dark:border-emerald-500/40 dark:hover:border-emerald-500 bg-[#f8faf9] dark:bg-slate-800 flex items-center justify-between gap-3 shadow-2xs transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-emerald-700 text-white shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                        {currentTabObj.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[9px] uppercase font-black text-emerald-700 dark:text-emerald-400 leading-tight tracking-wider">
                          Active Demand Subcategory
                        </div>
                        <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                          {currentTabObj.label}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={`hidden sm:inline-block text-[9px] font-black px-2 py-0.5 rounded-full border ${currentTabObj.badgeColor}`}>
                        {currentTabObj.badge}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-emerald-700 dark:text-emerald-400 transition-transform duration-200 ${demandDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* Dropdown Options Popup with High Z-Index & No Clipping */}
                  {demandDropdownOpen && (
                    <div className="absolute left-0 right-0 lg:left-0 lg:right-auto mt-2 w-full lg:w-[420px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-2 z-50 space-y-1.5 animate-fade-in max-h-[420px] overflow-y-auto no-scrollbar">
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">
                          6 Demand Subcategories
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                          Tap to switch
                        </span>
                      </div>

                      {allTabs.map((tab) => {
                        const isSelected = tab.id === activeTab;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                              setActiveTab(tab.id);
                              setDemandDropdownOpen(false);
                            }}
                            className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start gap-3 cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 shadow-2xs'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                            }`}
                          >
                            <div className={`p-2 rounded-xl flex-shrink-0 mt-0.5 border ${
                              isSelected
                                ? 'bg-emerald-700 text-white border-emerald-700'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}>
                              {tab.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className={`text-xs font-black truncate ${isSelected ? 'text-emerald-950 dark:text-emerald-200' : 'text-slate-900 dark:text-white'}`}>
                                  {tab.label}
                                </span>
                                {isSelected ? (
                                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-700 text-white flex-shrink-0 flex items-center gap-1">
                                    <Check className="h-3 w-3" /> Active
                                  </span>
                                ) : (
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0 ${tab.badgeColor}`}>
                                    {tab.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                                {tab.description}
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

          {/* Stepper & Quick Pills Toolbar */}
          <div className="flex items-center justify-between sm:justify-end gap-2 w-full lg:w-auto">
            {/* Previous / Next Stepper */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={handlePrevTab}
                title="Previous Subcategory"
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-[10px] font-mono font-bold px-2.5 text-slate-600 dark:text-slate-400 select-none">
                {currentTabIdx + 1}/{allTabs.length}
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

            {/* Quick 1-Tap Pills */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {allTabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap border cursor-pointer ${
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
      </div>

      {/* Multi-Source Live Contextual Drivers Bar (Always visible for quick situational awareness) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Weather Driver */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#cbdad0] dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20 flex-shrink-0">
            <CloudRain className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Weather Intelligence</span>
            <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{data.contextual_factors.weather_condition}</div>
            <div className="text-[11px] text-sky-700 dark:text-sky-400 font-bold truncate">{data.contextual_factors.weather_impact}</div>
          </div>
        </div>

        {/* Reservations Driver */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#cbdad0] dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 flex-shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Customer Bookings</span>
            <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{data.contextual_factors.reservations_booked} Table Reservations</div>
            <div className="text-[11px] text-amber-700 dark:text-amber-400 font-bold truncate">High dinner pre-orders</div>
          </div>
        </div>

        {/* Local Events Driver */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#cbdad0] dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 flex-shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Local Event Radar</span>
            <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{data.contextual_factors.local_events}</div>
            <div className="text-[11px] text-purple-700 dark:text-purple-400 font-bold truncate">+22% evening takeaway surge</div>
          </div>
        </div>

        {/* Active Promotions Driver */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#cbdad0] dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 flex-shrink-0">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Active Campaign</span>
            <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{data.contextual_factors.active_promotions}</div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold truncate">+12% dining conversion</div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & DAILY KITCHEN PREP GUIDANCE */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Quick Sizing Metric KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#cbdad0] dark:border-slate-800 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Total Projected Demand</span>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{data.kpi_summary.total_projected_orders} Orders</div>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                <ArrowUpRight className="h-3.5 w-3.5" /> +24% vs weekday avg
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#cbdad0] dark:border-slate-800 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Recommended Prep Target</span>
              <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{data.kpi_summary.total_prep_recommended} Portions</div>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-0.5">Includes meal shift split</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#cbdad0] dark:border-slate-800 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Dynamic Safety Buffer</span>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">+{data.kpi_summary.total_safety_buffer} Portions</div>
              <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold mt-0.5">Prevents mid-shift stockouts</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#cbdad0] dark:border-slate-800 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Waste Prevented Today</span>
              <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{data.kpi_summary.waste_prevented_est_kg} kg</div>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold mt-0.5">~ LKR 14,200 saved</span>
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
                  Exact shift prep volumes and safety buffers generated by Random Forest + Prophet time-series models
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowPrepSheetModal(true)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#f0f5f2] hover:bg-[#e4ece7] text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-[#d5e2d9] dark:border-slate-700 flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Printer className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                  Export Chef Prep Sheet
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add POS Menu Item
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
                <thead className="bg-[#f4f8f5] dark:bg-slate-950 text-slate-800 dark:text-slate-300 uppercase font-bold border-b border-[#cbdad0] dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Menu Dish</th>
                    <th className="py-3.5 px-3">Category</th>
                    <th className="py-3.5 px-3">Predicted Demand</th>
                    <th className="py-3.5 px-4">Prep Guidance</th>
                    <th className="py-3.5 px-3">Safety Buffer</th>
                    <th className="py-3.5 px-4">Demand Influencers (XAI)</th>
                    <th className="py-3.5 px-3 text-center">POS Status</th>
                    <th className="py-3.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4ece7] dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className={`hover:bg-[#f8faf9] dark:hover:bg-slate-800/40 transition-colors ${item.status === 'Unavailable' ? 'opacity-50' : ''}`}>
                      
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-semibold">LKR {item.price.toFixed(2)}</span>
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                            {item.confidence}% Conf.
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                        {item.category}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="text-base font-black text-slate-900 dark:text-white">{item.predicted_demand_today} <span className="text-xs font-normal text-slate-500">portions</span></div>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">
                          {item.trend} vs 90d avg ({item.historical_avg})
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 font-extrabold border border-emerald-300 dark:border-emerald-700 shadow-sm inline-block">
                          Prepare {item.prep_recommendation} portions
                        </span>
                      </td>

                      <td className="py-3.5 px-3 font-mono font-bold text-amber-700 dark:text-amber-400">
                        +{item.buffer_quantity} ready
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside font-medium">
                          {item.key_drivers.map((d, idx) => (
                            <li key={idx} className="leading-snug">{d}</li>
                          ))}
                        </ul>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border ${
                          item.status === 'Available'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-700'
                            : 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedItemIngredients(item)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                            title="View Ingredient Calculation"
                          >
                            <Scale className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(item.id)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                            title={item.status === 'Available' ? "Mark as Unavailable" : "Mark as Available"}
                          >
                            {item.status === 'Available' ? (
                              <ToggleRight className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-rose-500" />
                            )}
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
      {activeTab === 'analytics' && (
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
                  Comparing actual POS historical orders vs Prophet + Random Forest predicted volumes
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-700">
                  Today (Friday): 480 Projected
                </span>
                <span className="text-xs font-bold text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-xl border border-purple-200 dark:border-purple-700">
                  Weekend Peak: 560 Projected
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
                        data={data.category_breakdown}
                        dataKey="projected_orders"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={45}
                        paddingAngle={4}
                      >
                        {data.category_breakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2">
                  {data.category_breakdown.map((cat, idx) => (
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
      {activeTab === 'xai' && (
        <div className="space-y-6">
          
          <div className="glass-panel p-6 rounded-2xl bg-white dark:bg-slate-900 border border-[#cbdad0] dark:border-slate-800 shadow-sm space-y-4">
            <div className="border-b border-[#e2ece5] dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Cpu className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                Explainable AI (XAI): Multi-Source Factor Decomposition (SHAP-Style)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Explaining WHY demand is predicted to rise or fall for each menu item using feature attribution values
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {data.items.map((item) => (
                <div key={item.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-[#cbdad0] dark:border-slate-700 space-y-3 shadow-sm">
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</h4>
                      <span className="text-xs text-slate-500 font-medium">{item.category}</span>
                    </div>
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-700">
                      Total: {item.predicted_demand_today}
                    </span>
                  </div>

                  {/* Factor Breakdown Bars */}
                  <div className="space-y-2 text-xs pt-1">
                    
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">90-Day Baseline Sales:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{item.shap_breakdown.base_value} portions</span>
                    </div>

                    <div className="flex items-center justify-between text-sky-700 dark:text-sky-400">
                      <span className="flex items-center gap-1"><CloudRain className="h-3.5 w-3.5" /> Weather Impact:</span>
                      <span className="font-mono font-bold">+{item.shap_breakdown.weather_effect} portions</span>
                    </div>

                    <div className="flex items-center justify-between text-purple-700 dark:text-purple-400">
                      <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5" /> Holiday / Event Lift:</span>
                      <span className="font-mono font-bold">+{item.shap_breakdown.holiday_event_effect} portions</span>
                    </div>

                    <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Table Reservations:</span>
                      <span className="font-mono font-bold">+{item.shap_breakdown.reservation_effect} portions</span>
                    </div>

                    {item.shap_breakdown.promo_effect > 0 && (
                      <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
                        <span className="flex items-center gap-1"><ShoppingBag className="h-3.5 w-3.5" /> Active Promotion:</span>
                        <span className="font-mono font-bold">+{item.shap_breakdown.promo_effect} portions</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 border-t border-slate-200 dark:border-slate-700 pt-1.5">
                      <span className="flex items-center gap-1"><Scale className="h-3.5 w-3.5" /> Closed-Loop Waste Dampener:</span>
                      <span className="font-mono font-bold">{item.shap_breakdown.waste_feedback_dampener} portions</span>
                    </div>

                  </div>

                  {/* Summary Narrative */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Primary Model Rationale:</span>
                    {item.key_drivers.join(" • ")}
                  </div>

                </div>
              ))}
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: "WHAT-IF" SCENARIO SIMULATION SANDBOX */}
      {/* ========================================================================= */}
      {activeTab === 'simulator' && (
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
      {/* TAB 5: DATA PREPROCESSING & CONTINUOUS MODEL RETRAINING */}
      {/* ========================================================================= */}
      {activeTab === 'retraining' && (
        <div className="space-y-6">
          
          {/* Data Validation Pipeline Telemetry */}
          <div className="glass-panel p-6 rounded-2xl bg-white dark:bg-slate-900 border border-[#cbdad0] dark:border-slate-800 shadow-sm space-y-4">
            <div className="border-b border-[#e2ece5] dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                Data Ingestion, Validation & Feature Engineering Pipeline
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Real-time data quality monitoring across 60–90 days SME restaurant POS records
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">POS Records Ingested</span>
                <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{data.data_pipeline_health.total_pos_records_ingested.toLocaleString()} Rows</div>
                <span className="text-[10px] text-emerald-600 font-bold">90-Day Rolling Window</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Clean Records Health</span>
                <div className="text-lg font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{data.data_pipeline_health.clean_records_pct}%</div>
                <span className="text-[10px] text-slate-500">Validation Passed</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Imputations & Outliers</span>
                <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{data.data_pipeline_health.missing_values_imputed} Imputed</div>
                <span className="text-[10px] text-slate-500">{data.data_pipeline_health.outliers_handled} Winsorized spikes</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Engineered Features</span>
                <div className="text-lg font-black text-purple-700 dark:text-purple-400 mt-0.5">{data.data_pipeline_health.engineered_features_count} Features</div>
                <span className="text-[10px] text-purple-600 font-bold">Lags, Rolling Avg, Weather</span>
              </div>
            </div>

            {/* Feature List Tags */}
            <div className="p-4 rounded-xl bg-[#f8faf9] dark:bg-slate-800/50 border border-[#d5e2d9] dark:border-slate-700 space-y-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Active Multi-Source Model Features:</span>
              <div className="flex flex-wrap gap-1.5">
                {data.data_pipeline_health.features_list.map(f => (
                  <span key={f} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Retraining Console */}
          <div className="glass-panel p-6 rounded-2xl bg-white dark:bg-slate-900 border border-[#cbdad0] dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e2ece5] dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                  Continuous Model Retraining & Performance Evaluation
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Trigger automated model retraining as newly available POS transactions arrive
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedTrainingWindow}
                  onChange={e => setSelectedTrainingWindow(parseInt(e.target.value))}
                  className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-[#d5e2d9] dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                >
                  <option value={60}>60 Days Training Window</option>
                  <option value={90}>90 Days Training Window</option>
                </select>

                <button
                  onClick={handleTriggerRetraining}
                  disabled={isRetraining}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm flex items-center gap-1.5 disabled:opacity-50 transition-all"
                >
                  {isRetraining ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  <span>Trigger Auto-Retraining</span>
                </button>
              </div>
            </div>

            {/* Retraining Progress Bar */}
            {isRetraining && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Executing 5-Fold Cross Validation & Model Refitting...</span>
                  <span>{retrainProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full transition-all duration-300" style={{ width: `${retrainProgress}%` }}></div>
                </div>
              </div>
            )}

            {/* Retraining Logs Terminal View */}
            <div className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs space-y-1.5 overflow-x-auto max-h-48 overflow-y-auto border border-slate-800">
              <div className="text-slate-500 font-bold mb-2">// Automated Model Training & Evaluation Engine Log</div>
              {retrainLogs.length > 0 ? (
                retrainLogs.map((log, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-slate-600 select-none">&gt;</span>
                    <span>{log}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500">// System ready. Click "Trigger Auto-Retraining" to simulate new POS batch ingestion.</div>
              )}
            </div>

            {/* Retraining Evaluation Comparison Cards */}
            {retrainResult && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase">Evaluation Metrics Comparison</span>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-700">
                    {retrainResult.metrics.improvement_pct}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-700/60">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">RMSE Error</span>
                    <div className="text-sm font-black text-slate-800 dark:text-white mt-0.5">
                      4.12 <span className="text-emerald-600 font-bold">→ {retrainResult.metrics.rmse}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-700/60">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">MAE Error</span>
                    <div className="text-sm font-black text-slate-800 dark:text-white mt-0.5">
                      3.05 <span className="text-emerald-600 font-bold">→ {retrainResult.metrics.mae}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-700/60">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">MAPE (Accuracy)</span>
                    <div className="text-sm font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                      4.8% <span className="font-bold">→ {retrainResult.metrics.mape}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Retraining History Table */}
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">Model Version Retraining History</span>
              <div className="overflow-x-auto rounded-xl border border-[#cbdad0] dark:border-slate-800">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-[#f4f8f5] dark:bg-slate-950 text-slate-800 dark:text-slate-300 uppercase font-bold border-b border-[#cbdad0] dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Records Ingested</th>
                      <th className="py-2.5 px-3">RMSE</th>
                      <th className="py-2.5 px-3">MAE</th>
                      <th className="py-2.5 px-3">MAPE</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e4ece7] dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {data.retraining_history.map(log => (
                      <tr key={log.id}>
                        <td className="py-2.5 px-3 font-semibold">{log.timestamp}</td>
                        <td className="py-2.5 px-3 font-mono">{log.records_ingested.toLocaleString()}</td>
                        <td className="py-2.5 px-3 font-mono">{log.rmse_after}</td>
                        <td className="py-2.5 px-3 font-mono">{log.mae_after}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">{log.mape_after}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold">
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: CLOSED FEEDBACK LOOP & CROSS-MODULE INTELLIGENCE */}
      {/* ========================================================================= */}
      {activeTab === 'closed_loop' && (
        <div className="space-y-6">
          
          <div className="glass-panel p-6 rounded-2xl bg-white dark:bg-slate-900 border border-[#cbdad0] dark:border-slate-800 shadow-sm space-y-4">
            <div className="border-b border-[#e2ece5] dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                Cross-Component Closed Feedback Mechanism (Demand ⇄ Waste & Spoilage)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Demonstrates how waste measurements and spoilage alerts dynamically adjust food demand preparation parameters
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Waste Feedback Loop Card */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-[#cbdad0] dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 border border-rose-200 dark:border-rose-500/20">
                    <Scale className="h-4 w-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Waste Feedback Dampening</h4>
                    <span className="text-[11px] text-slate-500">Connected to Component 4: Smart Waste Bin</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">7-Day Overproduction Waste:</span>
                    <span className="font-bold text-rose-600">14.2 kg recorded</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Most Overproduced Item:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">Leftover Keeri Rice & Fried Rice</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-0.5">Automated Demand Adjustment:</span>
                    The AI demand engine applied an automatic <strong>-4% safety buffer dampener</strong> on Keeri Rice portions today, preventing repeated kitchen over-portioning and food discard.
                  </div>
                </div>
              </div>

              {/* Spoilage Feedback Loop Card */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-[#cbdad0] dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 border border-amber-200 dark:border-amber-500/20">
                    <Flame className="h-4 w-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Spoilage FIFO Recipe Push</h4>
                    <span className="text-[11px] text-slate-500">Connected to Component 3: Food Spoilage & RSL</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Flagged Expiring Batch:</span>
                    <span className="font-bold text-amber-600">Papaya & Melon (#B-402)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Remaining Shelf-Life:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">14 Hours (FIFO Priority)</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-0.5">Automated Demand Adjustment:</span>
                    The demand prediction engine elevated <strong>Tropical Fruit Salad with Honey prep recommendations by +50%</strong> and scheduled a 15% flash pairing discount to consume ripe batches before spoilage.
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW POS MENU ITEM */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel bg-white dark:bg-slate-900 max-w-md w-full p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-emerald-600" />
                Add New POS Menu Item
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Sri Lankan Chicken Biryani"
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={e => setNewItemCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Main Course">Main Course</option>
                    <option value="Short Eats & Kottu">Short Eats & Kottu</option>
                    <option value="Italian">Italian</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Price (LKR)</label>
                  <input
                    type="number"
                    required
                    value={newItemPrice}
                    onChange={e => setNewItemPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Initial Daily Baseline Sales Avg (Portions)</label>
                <input
                  type="number"
                  value={newItemBaseAvg}
                  onChange={e => setNewItemBaseAvg(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
                >
                  Add to Forecasting Engine
                </button>
              </div>
            </form>
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
                <span className="text-[11px] text-slate-500">Date: Friday Shift • Generated by AI Food Demand Prediction Module</span>
              </div>
              <button onClick={() => setShowPrepSheetModal(false)} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Shift Window: Lunch (11:30) & Dinner (18:30)</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Special Note: Monsoon rain forecast (+18% comfort food surge)</p>
                </div>
                <div className="text-right">
                  <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm">{data.kpi_summary.total_prep_recommended} Total Portions</span>
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
                    {data.items.filter(i => i.status === 'Available').map(item => (
                      <tr key={item.id}>
                        <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">{item.name}</td>
                        <td className="py-2.5 px-3 font-mono font-black text-emerald-700 dark:text-emerald-400">{item.prep_recommendation} portions</td>
                        <td className="py-2.5 px-3 font-mono text-amber-600 font-bold">+{item.buffer_quantity} ready</td>
                        <td className="py-2.5 px-3 text-slate-500">{item.key_drivers[0]}</td>
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

