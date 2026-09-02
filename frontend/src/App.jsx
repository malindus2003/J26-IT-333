import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { StatusBar, Style } from '@capacitor/status-bar';
import Header, { getModulesForRole } from './components/Header';
import MobileBottomNav from './components/MobileBottomNav';
import StatsCards from './components/StatsCards';
import StorageZoneTelemetry from './components/StorageZoneTelemetry';
import VisionInspector from './components/VisionInspector';
import MultiModalAssessor from './components/MultiModalAssessor';
import InventoryHealthTable from './components/InventoryHealthTable';
import ActionRecommendations from './components/ActionRecommendations';
import AlertNotificationCenter from './components/AlertNotificationCenter';
import ESP32Simulator from './components/ESP32Simulator';
import DemandForecastingDashboard from './components/DemandForecastingDashboard';
import KitchenStaffDashboard from './components/KitchenStaffDashboard';
import SmartWasteBinDashboard from './components/SmartWasteBinDashboard';
import CentralExecutiveDashboard from './components/CentralExecutiveDashboard';
import OrderManagementDashboard from './components/OrderManagementDashboard';
import { Activity, LayoutDashboard, Camera, Cpu, ListFilter, AlertTriangle, Sparkles, X, TrendingUp, Users, Trash2, Layers, Check, ShoppingBag, Package, Truck, ShieldCheck, DollarSign, ChevronDown } from 'lucide-react';
import { DEFAULT_ZONES, DEFAULT_INVENTORY, DEFAULT_RECOMMENDATIONS, DEFAULT_DASHBOARD_STATS } from './data/mockData';

// 4 Subparts of the Food Spoilage & Quality System for Dropdown Navigation
const SPOILAGE_SUBPARTS = [
  {
    id: 'vision',
    title: 'Optical Camera CV Scanner',
    shortTitle: 'Optical Camera CV',
    description: 'High-resolution photographic inspection, bounding box rot detection & visual ripeness scoring',
    icon: Camera,
    badge: 'Computer Vision',
    badgeColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
  },
  {
    id: 'assessor',
    title: 'Multi-Modal Sensor Fusion Assessor',
    shortTitle: 'AI Fusion Assessor',
    description: 'XAI multi-modal fusion combining gas telemetry, thermal data & remaining shelf-life (RSL)',
    icon: Cpu,
    badge: 'XAI Predictive Model',
    badgeColor: 'bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-700'
  },
  {
    id: 'sensors',
    title: 'Storage Zone IoT Telemetry',
    shortTitle: 'Chamber IoT Telemetry',
    description: 'Real-time NH3, CO2, VOC, humidity and temperature monitoring across 5 storage chambers',
    icon: Activity,
    badge: '5 Storage Chambers',
    badgeColor: 'bg-teal-100 dark:bg-teal-950/60 text-teal-900 dark:text-teal-300 border-teal-300 dark:border-teal-700'
  },
  {
    id: 'simulator',
    title: 'ESP32 Hardware Telemetry Simulator',
    shortTitle: 'ESP32 Simulator',
    description: 'Hardware simulation tool to test gas thresholds, anomaly alerts & sensor spikes',
    icon: Sparkles,
    badge: 'Hardware Test',
    badgeColor: 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700'
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
  
  // Active User Role: 'admin' (Executive/All), 'cashier' (POS/Billing), 'staff' (Kitchen KDS/Ops)
  const [currentRole, setCurrentRole] = useState('admin');
  
  // Top Level Navigation Module: 'executive', 'orders', 'inventory', 'spoilage', 'kitchen', 'demand', 'waste'
  const [activeModule, setActiveModule] = useState('executive');
  
  // Spoilage Sub-Tabs: 'vision', 'assessor', 'sensors', 'simulator'
  const [spoilageSubTab, setSpoilageSubTab] = useState('vision');
  const [spoilageDropdownOpen, setSpoilageDropdownOpen] = useState(false);
  const spoilageDropdownRef = useRef(null);
  
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

  const activeCriticalCount = recommendations.filter(
    r => r.severity === 'critical' && r.status !== 'resolved'
  ).length;

  const totalActiveAlertCount = recommendations.filter(
    r => r.status !== 'resolved'
  ).length;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-200`}>
      
      {/* Clean Navigation Header with Live Alert Counter, Role Switcher & Theme Toggle */}
      <Header
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        stats={stats}
        onRefresh={fetchAllData}
        activeAlertCount={totalActiveAlertCount}
        onOpenAlerts={() => setShowAlertsCenter(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main Container with generous bottom safe clearance */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-6 pt-2 sm:pt-4 pb-32 sm:py-6 space-y-3.5 sm:space-y-6">
        
        {/* Module 1: Executive Integration Hub */}
        {activeModule === 'executive' && (
          <CentralExecutiveDashboard
            stats={stats}
            recommendations={recommendations}
            onNavigateModule={setActiveModule}
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
                    Continuous monitoring of perishable food batches across 5 temperature-controlled chambers (Fruits, Veg, Dairy, Fish, Meat) with automated Smart FIFO consumption for orders.
                  </p>
                </div>
              </div>

              {/* Inventory Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#e1eae4] dark:border-slate-800">
                <div className="p-3.5 rounded-xl bg-[#f8faf9] dark:bg-slate-800/80 border border-[#d1ded5] dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Total Active Batches</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{inventoryItems.length}</div>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">Monitored 24/7 across 5 chambers</span>
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
            />
          </div>
        )}

        {/* Module 4: Food Spoilage & Quality Assessment */}
        {activeModule === 'spoilage' && (
          <div className="space-y-4 sm:space-y-6">
            
            {/* Spoilage Module Sub-Header & 4-Subpart Dropdown Navigation */}
            <div className="glass-panel p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-[#d1ded5] dark:border-slate-800 shadow-sm space-y-3 sm:space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-emerald-700 text-white shadow-xs flex items-center gap-1.5">
                      <Cpu className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Component 3: Food Spoilage & Quality
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold hidden sm:inline">
                      • 4 Analytical Subparts
                    </span>
                  </div>
                  <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                    Multi-Modal Spoilage Detection & Remaining Shelf-Life (RSL)
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium leading-relaxed">
                    Fuses IoT gas & thermal sensor arrays with computer vision to prevent food waste and route expiring stock.
                  </p>
                </div>

                {/* 4-Subpart Dropdown Selector */}
                <div className="relative w-full lg:w-88" ref={spoilageDropdownRef}>
                  <div className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1 flex items-center justify-between">
                    <span>Select Subpart (Dropdown)</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">4 Available</span>
                  </div>

                  {(() => {
                    const activeSubpart = SPOILAGE_SUBPARTS.find(s => s.id === spoilageSubTab) || SPOILAGE_SUBPARTS[0];
                    const ActiveIcon = activeSubpart.icon;
                    return (
                      <>
                        <button
                          type="button"
                          onClick={() => setSpoilageDropdownOpen(!spoilageDropdownOpen)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#c6d7cd] dark:border-slate-700 bg-[#f8faf9] dark:bg-slate-800 hover:border-emerald-600 dark:hover:border-emerald-500 flex items-center justify-between gap-2.5 shadow-2xs transition-all text-left group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex-shrink-0 group-hover:scale-105 transition-transform">
                              <ActiveIcon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[9px] uppercase font-black text-slate-400 dark:text-slate-400 leading-tight">
                                Current Subpart View
                              </div>
                              <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                                {activeSubpart.title}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`hidden sm:inline-block text-[9px] font-black px-2 py-0.5 rounded-full border ${activeSubpart.badgeColor}`}>
                              {activeSubpart.badge}
                            </span>
                            <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${spoilageDropdownOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                          </div>
                        </button>

                        {/* Dropdown Options Popup */}
                        {spoilageDropdownOpen && (
                          <div className="absolute right-0 left-0 lg:left-auto lg:right-0 mt-2 lg:w-96 rounded-2xl bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 space-y-1 animate-fade-in">
                            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">
                                4 Spoilage Subparts
                              </span>
                              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                                Tap to switch
                              </span>
                            </div>

                            {SPOILAGE_SUBPARTS.map((part) => {
                              const PartIcon = part.icon;
                              const isSelected = part.id === spoilageSubTab;
                              return (
                                <button
                                  key={part.id}
                                  type="button"
                                  onClick={() => {
                                    setSpoilageSubTab(part.id);
                                    setSpoilageDropdownOpen(false);
                                  }}
                                  className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start gap-3 ${
                                    isSelected
                                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 shadow-2xs'
                                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent'
                                  }`}
                                >
                                  <div className={`p-2 rounded-xl flex-shrink-0 mt-0.5 border ${
                                    isSelected
                                      ? 'bg-emerald-700 text-white border-emerald-700'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                  }`}>
                                    <PartIcon className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1">
                                      <span className={`text-xs font-black truncate ${isSelected ? 'text-emerald-950 dark:text-emerald-200' : 'text-slate-900 dark:text-white'}`}>
                                        {part.title}
                                      </span>
                                      {isSelected ? (
                                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-700 text-white flex-shrink-0 flex items-center gap-1">
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
              </div>
            </div>

            {/* Sub-View 1: Optical Camera Scanner & CV Bounding Box Inspector */}
            {spoilageSubTab === 'vision' && (
              <div className="space-y-4 sm:space-y-6 animate-fade-in">
                <VisionInspector onInspectionComplete={handleVisionInspectionComplete} isDarkMode={isDarkMode} />
              </div>
            )}

            {/* Sub-View 2: Multi-Modal Sensor + Vision Fusion Assessor */}
            {spoilageSubTab === 'assessor' && (
              <div className="space-y-4 sm:space-y-6 animate-fade-in">
                {/* Spoilage Risk & Batch Overview Cards */}
                <StatsCards stats={stats} isDarkMode={isDarkMode} />
                <MultiModalAssessor
                  currentVisionFeatures={currentVisionFeatures}
                  selectedZone={selectedZone}
                  isDarkMode={isDarkMode}
                />
              </div>
            )}

            {/* Sub-View 3: IoT Storage Telemetry */}
            {spoilageSubTab === 'sensors' && (
              <div className="space-y-4 sm:space-y-6 animate-fade-in">
                <StorageZoneTelemetry
                  zones={zones}
                  selectedZoneId={selectedZoneId}
                  onSelectZone={setSelectedZoneId}
                  isDarkMode={isDarkMode}
                />
              </div>
            )}

            {/* Sub-View 4: ESP32 Hardware Simulator */}
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
        onSelectRole={setCurrentRole}
        onRefresh={fetchAllData}
        activeAlertCount={totalActiveAlertCount}
        onOpenAlerts={() => setShowAlertsCenter(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />

    </div>
  );
}
