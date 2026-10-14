import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
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
import { Activity, LayoutDashboard, Camera, Cpu, ListFilter, AlertTriangle, Sparkles, X, TrendingUp, Users, Trash2, Layers, Check, ShoppingBag, Package, Truck, ShieldCheck, DollarSign } from 'lucide-react';

export default function App() {
  const [stats, setStats] = useState(null);
  const [zones, setZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState("zone-fruit");
  const [inventoryItems, setInventoryItems] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  // Theme state: defaults to false (Light Mode) for bright, clear visibility
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Active User Role: 'admin' (Executive/All), 'cashier' (POS/Billing), 'staff' (Kitchen KDS/Ops)
  const [currentRole, setCurrentRole] = useState('admin');

  // Top Level Navigation Module: 'executive', 'orders', 'inventory', 'spoilage', 'kitchen', 'demand', 'waste'
  const [activeModule, setActiveModule] = useState('executive');

  // Spoilage Sub-Tabs: 'vision', 'assessor', 'inventory', 'sensors', 'simulator'
  const [spoilageSubTab, setSpoilageSubTab] = useState('vision');

  const [currentVisionFeatures, setCurrentVisionFeatures] = useState(null);
  const [showAlertsCenter, setShowAlertsCenter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
  }, [isDarkMode]);

  const fetchAllData = async () => {
    setRefreshTrigger(prev => prev + 1);
    try {
      const [statsRes, zonesRes, invRes, recsRes] = await Promise.all([
        axios.get("http://localhost:8000/api/dashboard/stats"),
        axios.get("http://localhost:8000/api/sensors/zones"),
        axios.get("http://localhost:8000/api/inventory/items"),
        axios.get("http://localhost:8000/api/recommendations/")
      ]);

      setStats(statsRes.data);
      setZones(zonesRes.data.zones || []);
      setInventoryItems(invRes.data.items || []);
      setRecommendations(recsRes.data.recommendations || []);
    } catch (err) {
      console.error("Error fetching system data, applying fallbacks:", err);
      setStats({
        total_monitored_batches: 12,
        critical_batches: 1,
        high_priority_batches: 3,
        safe_batches: 8,
        avg_spoilage_probability: 41.5,
        total_storage_zones: 5,
        zones_needing_attention: 2,
        today_predicted_orders: 480,
        kitchen_efficiency_pct: 88.5,
        daily_food_waste_kg: 28.5,
        cost_loss_today_lkr: "10,900.00",
        system_health: "Optimal Operational Flow"
      });
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

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">

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
            refreshTrigger={refreshTrigger}
            onNavigateModule={setActiveModule}
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
            />
          </div>
        )}

        {/* Module 4: Food Spoilage & Quality Assessment */}
        {activeModule === 'spoilage' && (
          <div className="space-y-6">

            {/* Spoilage Module Sub-Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Food Spoilage & Quality Assessment</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  Multi-Modal Spoilage Prediction & Optical Container Quality Inspection
                </p>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  onClick={() => setSpoilageSubTab('vision')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${spoilageSubTab === 'vision'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                    }`}
                >
                  <Camera className="h-3.5 w-3.5" /> Container Camera Scanner
                </button>

                <button
                  onClick={() => setSpoilageSubTab('assessor')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${spoilageSubTab === 'assessor'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                    }`}
                >
                  <Cpu className="h-3.5 w-3.5" /> Multi-Modal Assessor
                </button>

                <button
                  onClick={() => setSpoilageSubTab('sensors')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${spoilageSubTab === 'sensors'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                    }`}
                >
                  <Activity className="h-3.5 w-3.5" /> IoT Telemetry
                </button>

                <button
                  onClick={() => setSpoilageSubTab('simulator')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${spoilageSubTab === 'simulator'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                    }`}
                >
                  <Sparkles className="h-3.5 w-3.5" /> ESP32 Sim
                </button>
              </div>
            </div>

            {/* Top KPIs Summary */}
            <StatsCards stats={stats} isDarkMode={isDarkMode} />

            {/* Sub-View: Container Camera Scanner */}
            {spoilageSubTab === 'vision' && (
              <div className="space-y-6">
                <VisionInspector onInspectionComplete={handleVisionInspectionComplete} isDarkMode={isDarkMode} />
                <ActionRecommendations
                  recommendations={recommendations}
                  isDarkMode={isDarkMode}
                  onOpenAlertsCenter={() => setShowAlertsCenter(true)}
                  onRefresh={fetchAllData}
                />
              </div>
            )}

            {/* Sub-View: Multi-Modal Assessor */}
            {spoilageSubTab === 'assessor' && (
              <div className="space-y-6">
                <MultiModalAssessor
                  currentVisionFeatures={currentVisionFeatures}
                  selectedZone={selectedZone}
                  isDarkMode={isDarkMode}
                />
                <ActionRecommendations
                  recommendations={recommendations}
                  isDarkMode={isDarkMode}
                  onOpenAlertsCenter={() => setShowAlertsCenter(true)}
                  onRefresh={fetchAllData}
                />
              </div>
            )}

            {/* Sub-View: IoT Storage Telemetry */}
            {spoilageSubTab === 'sensors' && (
              <div className="space-y-6">
                <StorageZoneTelemetry
                  zones={zones}
                  selectedZoneId={selectedZoneId}
                  onSelectZone={setSelectedZoneId}
                  isDarkMode={isDarkMode}
                />
              </div>
            )}

            {/* Sub-View: ESP32 Hardware Simulator */}
            {spoilageSubTab === 'simulator' && (
              <div className="space-y-6">
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
          <KitchenStaffDashboard
            isDarkMode={isDarkMode}
            currentRole={currentRole}
            refreshTrigger={refreshTrigger}
            onRefresh={fetchAllData}
            onNavigateModule={setActiveModule}
          />
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

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-500 transition-colors">
        <p className="font-medium">
          Smart Restaurant Analytics • Real-Time AI & IoT Operational Decision Support
        </p>
      </footer>

    </div>
  );
}
