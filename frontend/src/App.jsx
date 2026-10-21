import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { StatusBar, Style } from '@capacitor/status-bar';
import Header, { getModulesForRole } from './components/Header';
import MobileBottomNav from './components/MobileBottomNav';
import StorageZoneTelemetry from './components/StorageZoneTelemetry';
import VisionInspector from './components/VisionInspector';
import MultiModalAssessor from './components/MultiModalAssessor';
import InventoryHealthTable from './components/InventoryHealthTable';
import ActionRecommendations from './components/ActionRecommendations';
import AlertNotificationCenter from './components/AlertNotificationCenter';
import ESP32Simulator from './components/ESP32Simulator';
import ErrorBoundary from './components/ErrorBoundary';
import DemandForecastingDashboard from './components/DemandForecastingDashboard';
import KitchenStaffDashboard from './components/KitchenStaffDashboard';
import SmartWasteBinDashboard from './components/SmartWasteBinDashboard';
import CentralExecutiveDashboard from './components/CentralExecutiveDashboard';
import OrderManagementDashboard from './components/OrderManagementDashboard';
import LoginScreen, { DEMO_CREDENTIALS } from './components/LoginScreen';
import { ChefHat, Activity, LayoutDashboard, Camera, Cpu, ListFilter, AlertTriangle, Sparkles, X, TrendingUp, Users, Trash2, Layers, Check, ShoppingBag, Package, Truck, ShieldCheck, DollarSign, ChevronDown } from 'lucide-react';
import { DEFAULT_ZONES, DEFAULT_INVENTORY, DEFAULT_RECOMMENDATIONS, DEFAULT_DASHBOARD_STATS } from './data/mockData';

// 4 Subparts of the Food Spoilage & Quality System for Dropdown Navigation
const SPOILAGE_SUBPARTS = [
  {
    id: 'vision',
    title: 'Integrated Vision & IoT Chamber Quality Inspector',
    shortTitle: 'Vision + IoT Chamber',
    description: 'Unified camera inspection & 5-parameter IoT sensor telemetry in Storage 1, cross-checking both units to output Fresh vs Spoiled status & RSL',
    icon: Camera,
    badge: 'Multi-Modal Fusion',
    badgeColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
  },
  {
    id: 'assessor',
    title: 'AI Culinary Divert & Recipe Directives',
    shortTitle: 'AI Recipe Directives',
    description: 'Zero-waste recipe recommendations, kitchen prep directives, and culinary divert for near-spoilage produce',
    icon: ChefHat,
    badge: 'Zero-Waste Chef AI',
    badgeColor: 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700'
  },
  {
    id: 'simulator',
    title: 'ESP32 Hardware Telemetry Simulator',
    shortTitle: 'ESP32 Simulator',
    description: 'Hardware simulation tool to test gas thresholds, anomaly alerts & sensor spikes',
    icon: Sparkles,
    badge: 'Hardware Test',
    badgeColor: 'bg-teal-100 dark:bg-teal-950/60 text-teal-900 dark:text-teal-300 border-teal-300 dark:border-teal-700'
  }
];

export default function App() {
  const [stats, setStats] = useState(DEFAULT_DASHBOARD_STATS);
  const [zones, setZones] = useState(DEFAULT_ZONES);
  const [selectedZoneId, setSelectedZoneId] = useState("zone-fruit");
  const [inventoryItems, setInventoryItems] = useState(DEFAULT_INVENTORY);
  const [recommendations, setRecommendations] = useState(DEFAULT_RECOMMENDATIONS);
  
  // Theme state: defaults to false (Light Mode) for bright, clear visibility
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Authenticated User Session: loaded from localStorage or null (prompts LoginScreen)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_restaurant_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Active User Role: 'admin' (Executive/All), 'cashier' (POS/Billing), 'staff' (Kitchen KDS/Ops)
  const [currentRole, setCurrentRole] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_restaurant_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.role) return parsed.role;
      }
    } catch {
      // fallback
    }
    return 'admin';
  });
  
  // Top Level Navigation Module: 'executive', 'orders', 'inventory', 'spoilage', 'kitchen', 'demand', 'waste', 'pos_menu', 'kds'
  const [activeModule, setActiveModule] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_restaurant_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.defaultModule) return parsed.defaultModule;
        if (parsed?.role === 'cashier') return 'pos_menu';
        if (parsed?.role === 'staff') return 'kds';
      }
    } catch {
      // fallback
    }
    return 'executive';
  });
  
  // Spoilage Sub-Tabs: 'vision', 'assessor', 'sensors', 'simulator'
  const [spoilageSubTab, setSpoilageSubTab] = useState('vision');
  const [spoilageDropdownOpen, setSpoilageDropdownOpen] = useState(false);
  const [targetProduceToInspect, setTargetProduceToInspect] = useState(null);
  const spoilageDropdownRef = useRef(null);

  const handleNavigateToSpoilage = (produceName, subTab = 'vision') => {
    setTargetProduceToInspect(produceName);
    setSpoilageSubTab(subTab);
    setActiveModule('spoilage');
  };
  
  const [currentVisionFeatures, setCurrentVisionFeatures] = useState(null);
  const [showAlertsCenter, setShowAlertsCenter] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (spoilageDropdownRef.current && !spoilageDropdownRef.current.contains(e.target)) {
        setSpoilageDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Sync Android system status bar icons & background with the current app theme
    const syncStatusBar = async () => {
      try {
        if (isDarkMode) {
          // Dark theme → light icons (white time/signal/battery visible on dark bg)
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#020617' }); // slate-950
        } else {
          // Light theme → dark icons (dark time/signal/battery visible on light bg)
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: '#ffffff' }); // white
        }
      } catch {
        // StatusBar API only available in native Android — silently ignore on web/PWA
      }
    };
    syncStatusBar();
  }, [isDarkMode]);


  const fetchAllData = async () => {
    try {
      const [statsRes, zonesRes, invRes, recsRes] = await Promise.all([
        axios.get("http://localhost:8000/api/dashboard/stats"),
        axios.get("http://localhost:8000/api/sensors/zones"),
        axios.get("http://localhost:8000/api/inventory/items"),
        axios.get("http://localhost:8000/api/recommendations/")
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (zonesRes.data?.zones?.length > 0) setZones(zonesRes.data.zones);
      if (invRes.data?.items?.length > 0) setInventoryItems(invRes.data.items);
      if (recsRes.data?.recommendations?.length > 0) setRecommendations(recsRes.data.recommendations);
    } catch (err) {
      console.warn("Backend server not reachable on localhost:8000, using comprehensive built-in offline data:", err);
      setStats(prev => prev || DEFAULT_DASHBOARD_STATS);
      setZones(prev => (prev && prev.length > 0 ? prev : DEFAULT_ZONES));
      setInventoryItems(prev => (prev && prev.length > 0 ? prev : DEFAULT_INVENTORY));
      setRecommendations(prev => (prev && prev.length > 0 ? prev : DEFAULT_RECOMMENDATIONS));
    } finally {
      setLoading(false);
    }
  };

  const selectedZone = zones.find(z => z.id === selectedZoneId) || zones[0];

  const handleVisionInspectionComplete = (features) => {
    setCurrentVisionFeatures(features);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('smart_restaurant_user', JSON.stringify(user));
    } catch (e) {
      console.error("Failed to save auth session to localStorage", e);
    }
    const role = user.role || 'admin';
    setCurrentRole(role);
    const targetModule = user.defaultModule || (
      role === 'cashier' ? 'pos_menu' :
      role === 'staff' ? 'kds' : 'executive'
    );
    setActiveModule(targetModule);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('smart_restaurant_user');
    } catch (e) {
      console.error("Failed to remove auth session from localStorage", e);
    }
    setCurrentUser(null);
    setCurrentRole('admin');
    setActiveModule('executive');
  };

  const activeCriticalCount = recommendations.filter(
    r => r.severity === 'critical' && r.status !== 'resolved'
  ).length;

  const totalActiveAlertCount = recommendations.filter(
    r => r.status !== 'resolved'
  ).length;

  // If not authenticated, display the dedicated login screen with role credentials
  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-200`}>
      
      {/* Clean Navigation Header with Live Alert Counter, Role Switcher & Theme Toggle */}
      <Header
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        currentRole={currentRole}
        stats={stats}
        onRefresh={fetchAllData}
        activeAlertCount={totalActiveAlertCount}
        onOpenAlerts={() => setShowAlertsCenter(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Container with generous bottom safe clearance */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-6 pt-2 sm:pt-4 pb-32 sm:py-6 space-y-3.5 sm:space-y-6">
        
        {/* Module 1: Executive Integration Hub */}
        {activeModule === 'executive' && (
          <CentralExecutiveDashboard
            stats={stats}
            recommendations={recommendations}
            onNavigateModule={setActiveModule}
            onNavigateToSpoilage={handleNavigateToSpoilage}
            onOpenAlertsCenter={() => setShowAlertsCenter(true)}
            onRefresh={fetchAllData}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Module 2: Order Management Single Views & Combined Admin POS */}
        {(activeModule === 'orders' || activeModule === 'pos_menu' || activeModule === 'tables_map' || activeModule === 'orders_ledger' || activeModule === 'kds') && (
          <OrderManagementDashboard
            onRefresh={fetchAllData}
            isDarkMode={isDarkMode}
            currentRole={currentRole}
            viewMode={activeModule === 'orders' ? 'all' : activeModule}
          />
        )}

        {/* Module 3: Dedicated Inventory & Stock Management */}
        {activeModule === 'inventory' && (
          <div className="space-y-6">
            
            {/* Inventory Overview Summary Banner */}
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden bg-white dark:bg-slate-900 border border-[#d1ded5] dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1.5 shadow-sm">
                      <Package className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" /> Perishable Inventory & Cold Storage
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">• Smart FIFO Auto-Prioritization</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
                    Perishable Inventory & Stock Valuation Matrix
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium max-w-2xl leading-relaxed">
                    Continuous monitoring of perishable produce batches across 4 climate-controlled chambers (Fruits & Vegetables) with automated Smart FIFO consumption for orders.
                  </p>
                </div>
              </div>

              {/* Inventory Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#e1eae4] dark:border-slate-800">
                <div className="p-3.5 rounded-xl bg-[#f8faf9] dark:bg-slate-800/80 border border-[#d1ded5] dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Total Active Batches</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{inventoryItems.length}</div>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">Monitored 24/7 across 4 chambers</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#f8faf9] dark:bg-slate-800/80 border border-[#d1ded5] dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Smart FIFO Targets (Low RSL)</span>
                  <div className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-0.5">
                    {inventoryItems.filter(i => i.is_smart_fifo_target || i.risk_level === 'High').length}
                  </div>
                  <span className="text-[10px] text-amber-800 dark:text-amber-400 font-medium">Prioritized for incoming kitchen orders</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#f8faf9] dark:bg-slate-800/80 border border-[#d1ded5] dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Critical Quarantine Batches</span>
                  <div className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-0.5">
                    {inventoryItems.filter(i => i.risk_level === 'Critical').length}
                  </div>
                  <span className="text-[10px] text-rose-800 dark:text-rose-400 font-medium">Locked / Cannot be used in recipes</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#f8faf9] dark:bg-slate-800/80 border border-[#d1ded5] dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Estimated Stock Valuation</span>
                  <div className="text-2xl font-black text-emerald-800 dark:text-emerald-400 mt-0.5">
                    Rs. {inventoryItems.reduce((acc, it) => acc + (it.stock_valuation_lkr || 4500), 0).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Live inventory asset worth</span>
                </div>
              </div>
            </div>

            {/* Inventory Health Matrix Table */}
            <InventoryHealthTable
              items={inventoryItems}
              zones={zones}
              onRefresh={fetchAllData}
              isDarkMode={isDarkMode}
              onUpdateItems={setInventoryItems}
              onNavigateToSpoilage={handleNavigateToSpoilage}
              onNavigateModule={setActiveModule}
            />
          </div>
        )}

        {/* Module 4: Food Spoilage & Quality Assessment */}
        {activeModule === 'spoilage' && (
          <div className="space-y-4 sm:space-y-6">
            
            {/* Redesigned Spoilage Module Sub-Header & 3-Subpart Navigation */}
            <div className="glass-panel p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
              
              {/* Header: Clean Title & Live Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 flex-shrink-0">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                        Food Spoilage & Quality Assessment
                      </h2>
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Analysis Engine
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Multi-modal sensor fusion, optical rot classification, and remaining shelf-life (RSL) tracking.
                    </p>
                  </div>
                </div>

                {/* Active Subpart Badge */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 hidden md:inline">
                    Active View:
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                    {(() => {
                      const cur = SPOILAGE_SUBPARTS.find(s => s.id === spoilageSubTab) || SPOILAGE_SUBPARTS[0];
                      const CurIcon = cur.icon;
                      return (
                        <>
                          <CurIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>{cur.title}</span>
                        </>
                      );
                    })()}
                  </span>
                </div>
              </div>

              {/* 4 Interactive Subpart Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
                {SPOILAGE_SUBPARTS.map((part) => {
                  const PartIcon = part.icon;
                  const isSelected = part.id === spoilageSubTab;
                  return (
                    <button
                      key={part.id}
                      type="button"
                      onClick={() => setSpoilageSubTab(part.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all duration-200 relative overflow-hidden group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                        isSelected
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-600 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                          : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {/* Active indicator bar along top edge */}
                      {isSelected && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                      )}

                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className={`p-2 rounded-xl transition-transform group-hover:scale-105 ${
                          isSelected
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}>
                          <PartIcon className="h-4 w-4" />
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${part.badgeColor}`}>
                          {part.badge}
                        </span>
                      </div>

                      <div className={`text-xs font-black truncate ${
                        isSelected ? 'text-emerald-950 dark:text-emerald-200' : 'text-slate-900 dark:text-white'
                      }`}>
                        {part.shortTitle}
                      </div>

                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                        {part.description}
                      </p>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Sub-View 1: Optical Camera Scanner & CV Bounding Box Inspector */}
            {spoilageSubTab === 'vision' && (
              <div className="space-y-4 sm:space-y-6 animate-fade-in">
                <ErrorBoundary fallbackTitle="Optical Camera CV Scanner Issue">
                  <VisionInspector 
                    zones={zones}
                    onRefreshTelemetry={fetchAllData}
                    onInspectionComplete={handleVisionInspectionComplete} 
                    isDarkMode={isDarkMode} 
                    targetProduce={targetProduceToInspect}
                  />
                </ErrorBoundary>
              </div>
            )}

            {/* Sub-View 2: Multi-Modal Sensor + Vision Fusion Assessor */}
            {spoilageSubTab === 'assessor' && (
              <div className="space-y-4 sm:space-y-6 animate-fade-in">

                <MultiModalAssessor
                  currentVisionFeatures={currentVisionFeatures}
                  selectedZone={selectedZone}
                  isDarkMode={isDarkMode}
                  targetProduce={targetProduceToInspect}
                />
              </div>
            )}

            {/* Sub-View 3: ESP32 Hardware Simulator */}
            {spoilageSubTab === 'simulator' && (
              <div className="space-y-4 sm:space-y-6 animate-fade-in">
                <ESP32Simulator
                  zones={zones}
                  onTelemetrySent={fetchAllData}
                  isDarkMode={isDarkMode}
                />
              </div>
            )}

          </div>
        )}

        {/* Module 5: Kitchen & Staff */}
        {activeModule === 'kitchen' && (
          <KitchenStaffDashboard isDarkMode={isDarkMode} currentRole={currentRole} />
        )}

        {/* Module 6: Demand Prediction */}
        {activeModule === 'demand' && (
          <DemandForecastingDashboard isDarkMode={isDarkMode} currentRole={currentRole} />
        )}

        {/* Module 7: Smart Waste Bin */}
        {activeModule === 'waste' && (
          <SmartWasteBinDashboard isDarkMode={isDarkMode} />
        )}

      </main>

      {/* Advanced Interactive Alert Notification Center Drawer */}
      <AlertNotificationCenter
        isOpen={showAlertsCenter}
        onClose={() => setShowAlertsCenter(false)}
        recommendations={recommendations}
        onRefresh={fetchAllData}
        onNavigateToSpoilage={handleNavigateToSpoilage}
        onNavigateModule={setActiveModule}
      />

      {/* Clean Footer (hidden on mobile to make room for bottom dock) */}
      <footer className="hidden sm:block border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-500 transition-colors">
        <p className="font-medium">
          Smart Restaurant Analytics • Real-Time AI & IoT Operational Decision Support
        </p>
      </footer>

      {/* Floating Native Bottom Navigation Dock for Mobile Phones */}
      <MobileBottomNav
        modules={getModulesForRole(currentRole, stats)}
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        currentRole={currentRole}
        onRefresh={fetchAllData}
        activeAlertCount={totalActiveAlertCount}
        onOpenAlerts={() => setShowAlertsCenter(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

    </div>
  );
}
