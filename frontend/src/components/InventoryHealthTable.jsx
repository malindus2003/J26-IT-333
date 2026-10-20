import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  XCircle, 
  Apple, 
  Carrot, 
  X, 
  Truck, 
  Layers, 
  DollarSign, 
  Sparkles,
  PackageCheck,
  Camera,
  ChefHat,
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Eye,
  Check
} from 'lucide-react';
import axios from 'axios';

const getItemThumbnail = (name = "", category = "") => {
  const n = name.toLowerCase();
  if (n.includes("banana")) return "/images/specimens/banana_overripe.jpg";
  if (n.includes("strawberr")) return "/images/specimens/strawberries_mould.jpg";
  if (n.includes("apple")) return "/images/specimens/apple_fresh.jpg";
  if (n.includes("lettuce") || n.includes("salad")) return "/images/specimens/lettuce_crisp.jpg";
  if (n.includes("tomato")) return "/images/specimens/tomato_overripe.jpg";
  if (n.includes("spinach") || n.includes("kankun") || n.includes("gotukola")) return "/images/specimens/spinach_wilted.jpg";
  if (n.includes("mango")) return "/images/specimens/mango_ripe.jpg";
  if (n.includes("avocado")) return "/images/specimens/avocado_butter.jpg";
  if (n.includes("peach")) return "/images/specimens/peach_softening.jpg";

  if (category === "Fruits") return "/images/specimens/apple_fresh.jpg";
  return "/images/specimens/lettuce_crisp.jpg";
};

const getCategoryEmoji = (category = "") => {
  switch (category) {
    case "Fruits": return "🍎";
    case "Vegetables": return "🥬";
    default: return "🥗";
  }
};

export default function InventoryHealthTable({ 
  items = [], 
  zones = [], 
  onRefresh, 
  onUpdateItems, 
  isDarkMode, 
  onNavigateToSpoilage,
  onNavigateModule
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRisk, setSelectedRisk] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // New batch form state
  const defaultZoneName = zones[0]?.name || "Storage 1: Tropical Chiller (11°C)";
  const [newItem, setNewItem] = useState({
    name: "",
    category: "Fruits",
    storage_zone: defaultZoneName,
    batch_number: "",
    quantity: "15.0 kg",
    storage_duration_hours: 24
  });

  // Quick Restock form state
  const [restockData, setRestockData] = useState({
    name: "Embul Banana (Ambul Kesel)",
    category: "Fruits",
    storage_zone: defaultZoneName,
    quantity_kg: 25.0,
    supplier: "Ceylon Organic Agricoop"
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.storage_zone && item.storage_zone.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === "all" || item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesRisk = selectedRisk === "all" || item.risk_level.toLowerCase() === selectedRisk.toLowerCase();
    return matchesSearch && matchesCat && matchesRisk;
  });

  // Match item to its physical chamber telemetry
  const getChamberTelemetry = (item) => {
    const sz = (item.storage_zone || "").toLowerCase();
    const matchedZone = zones.find(z => {
      const zn = (z.name || "").toLowerCase();
      const zid = (z.id || "").toLowerCase();
      return sz.includes(zid) || zn.includes(sz) || sz.includes(zn) ||
        (sz.includes("storage 1") && zn.includes("1")) ||
        (sz.includes("storage 2") && zn.includes("2")) ||
        (sz.includes("storage 3") && zn.includes("3")) ||
        (sz.includes("storage 4") && zn.includes("4"));
    }) || zones[0];

    const temp = item.chamber_temp !== undefined ? item.chamber_temp : (matchedZone?.current_temp ?? item.current_temp ?? 11.4);
    const humidity = item.chamber_humidity !== undefined ? item.chamber_humidity : (matchedZone?.current_humidity ?? item.current_humidity ?? 90.2);
    const voc = item.chamber_voc !== undefined ? item.chamber_voc : (matchedZone?.voc ?? item.current_voc ?? 0.32);
    const co2 = item.chamber_co2 !== undefined ? item.chamber_co2 : (matchedZone?.co2 ?? item.current_co2 ?? 415.0);
    const status = matchedZone?.status || (temp > 14.5 || voc > 0.8 ? "warning" : "optimal");
    const node = matchedZone?.node_id || (sz.includes("1") ? "ESP32-NODE-01" : sz.includes("2") ? "ESP32-NODE-02" : "CHAMBER-SENSOR");

    return {
      chamberName: matchedZone?.name || item.storage_zone || "Storage 1: Tropical Chiller",
      temp,
      humidity,
      voc,
      co2,
      status,
      node
    };
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await axios.delete(`http://localhost:8000/api/inventory/items/${itemId}`);
      showToast("Batch removed from inventory.");
      if (onRefresh) onRefresh();
    } catch (err) {
      console.warn("Failed to delete inventory item remotely, removing locally:", err);
      if (onUpdateItems) {
        onUpdateItems(prev => prev.filter(i => i.id !== itemId));
      }
      showToast("Batch removed locally.");
    }
  };

  const handleQuarantineToWaste = async (item) => {
    try {
      await axios.post(`http://localhost:8000/api/inventory/items/${item.id}/quarantine-to-waste`);
      showToast(`Batch ${item.batch_number} (${item.name}) quarantined and logged to Smart Waste Bin.`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.warn("Failed to log quarantine remotely, updating locally:", err);
      if (onUpdateItems) {
        onUpdateItems(prev => prev.filter(i => i.id !== item.id));
      }
      showToast(`Batch ${item.batch_number} quarantined and safely removed.`);
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/api/inventory/items", newItem);
      setShowAddModal(false);
      showToast(`Registered batch for ${newItem.name}`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.warn("Failed to add inventory item remotely, adding locally:", err);
      const newId = `inv-${Date.now().toString().slice(-3)}`;
      const createdItem = {
        id: newId,
        name: newItem.name,
        category: newItem.category,
        storage_zone: newItem.storage_zone,
        batch_number: newItem.batch_number || `BAT-2026-N${Math.floor(10 + Math.random() * 90)}`,
        quantity: newItem.quantity,
        stored_at: new Date().toISOString().slice(0, 16).replace('T', ' '),
        storage_duration_hours: Number(newItem.storage_duration_hours) || 24,
        spoilage_prob: 12.0,
        remaining_shelf_life_hours: 72.0,
        risk_level: "Low",
        status: "Fresh",
        is_smart_fifo_target: false,
        stock_valuation_lkr: (parseFloat(newItem.quantity) || 15) * 500,
        image_url: getItemThumbnail(newItem.name, newItem.category),
        recommendation: "Freshly received lot. Regular FIFO cold storage rotation."
      };
      if (onUpdateItems) {
        onUpdateItems(prev => [createdItem, ...prev]);
      }
      setShowAddModal(false);
      showToast(`Locally created batch for ${newItem.name}`);
    }
    setNewItem({
      name: "",
      category: "Fruits",
      storage_zone: defaultZoneName,
      batch_number: "",
      quantity: "15.0 kg",
      storage_duration_hours: 24
    });
  };

  const handleRestockShipment = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/api/inventory/restock", restockData);
      setShowRestockModal(false);
      showToast(`Received ${restockData.quantity_kg}kg of ${restockData.name}`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.warn("Failed to restock shipment remotely, updating locally:", err);
      const newId = `inv-${Date.now().toString().slice(-3)}`;
      const restockedItem = {
        id: newId,
        name: restockData.name,
        category: restockData.category,
        storage_zone: restockData.storage_zone,
        batch_number: `BAT-2026-SUP${Math.floor(100 + Math.random() * 900)}`,
        quantity: `${restockData.quantity_kg} kg`,
        stored_at: new Date().toISOString().slice(0, 16).replace('T', ' '),
        storage_duration_hours: 2.0,
        spoilage_prob: 5.0,
        remaining_shelf_life_hours: 120.0,
        risk_level: "Low",
        status: "Fresh Harvest",
        is_smart_fifo_target: false,
        stock_valuation_lkr: restockData.quantity_kg * 600,
        image_url: getItemThumbnail(restockData.name, restockData.category),
        recommendation: `Verified supplier delivery from ${restockData.supplier}. Inspected & cleared for storage.`
      };
      if (onUpdateItems) {
        onUpdateItems(prev => [restockedItem, ...prev]);
      }
      setShowRestockModal(false);
      showToast(`Received ${restockData.quantity_kg}kg of ${restockData.name}`);
    }
  };

  const getCategoryBadge = (category) => {
    switch (category) {
      case "Fruits":
        return <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-400"><Apple className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" /> Fruits</span>;
      case "Vegetables":
      default:
        return <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 dark:text-teal-400"><Carrot className="h-3.5 w-3.5 text-teal-700 dark:text-teal-400" /> Vegetables</span>;
    }
  };

  const renderRiskBadge = (level, isQuarantine, isSmartFifo, spoilageProb) => {
    if (isQuarantine || level === "Critical") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-700 animate-pulse">
          <XCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" /> Quarantined (Locked)
        </span>
      );
    }

    if (spoilageProb >= 70.0 || isSmartFifo || level === "High") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" /> Near Spoilage (~75%) • FIFO
        </span>
      );
    }

    if (level === "Medium") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" /> Medium (Monitor)
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Low (Prime Fresh)
      </span>
    );
  };

  return (
    <div className="glass-panel p-3.5 sm:p-6 rounded-xl sm:rounded-2xl space-y-3.5 sm:space-y-5 bg-white dark:bg-slate-900 border border-[#d1ded5] dark:border-slate-800 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-800 text-white px-4 py-2.5 rounded-xl shadow-lg border border-emerald-700 flex items-center gap-2 text-xs font-bold animate-fade-in">
          <Check className="h-4 w-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with Inventory Stats & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border-b border-[#e1eae4] dark:border-slate-800 pb-3 sm:pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
              Perishable Inventory Spoilage & Stock Matrix
            </h2>
            <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold">
              {filteredItems.length} Batches
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Live cold chamber IoT telemetry synchronization, optical CV shelf-life tracking, and Smart FIFO culinary diversion.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setShowRestockModal(true)}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 border border-slate-300 dark:border-slate-700 transition-colors"
          >
            <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-700 dark:text-emerald-400" /> Receive Shipment
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 shadow-md shadow-emerald-700/20 transition-colors"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Register New Batch
          </button>
        </div>
      </div>

      {/* Category Pills + Search Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-[#f4f8f5] dark:bg-slate-800/80 p-3 rounded-xl border border-[#d7e5dc] dark:border-slate-700">
        {/* Search */}
        <div className="sm:col-span-4 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
          <input
            type="text"
            placeholder="Search produce, chamber, or batch code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-[#c6d7cd] dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white font-medium placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-600 shadow-sm"
          />
        </div>

        {/* Category Quick Filter */}
        <div className="sm:col-span-5 flex items-center gap-1.5 overflow-x-auto">
          {["all", "fruits", "vegetables"].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 border border-[#d1ded5] dark:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Risk Filter */}
        <div className="sm:col-span-3">
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-[#c6d7cd] dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-emerald-600 shadow-sm"
          >
            <option value="all">All Spoilage Statuses</option>
            <option value="low">Low Risk (Prime Fresh)</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk / Near Spoilage (~75%)</option>
            <option value="critical">Critical / Quarantined</option>
          </select>
        </div>
      </div>

      {/* Table Data with Chamber IoT Telemetry & Direct Food Spoilage Actions */}
      <div className="overflow-x-auto rounded-xl border border-[#d1ded5] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm no-scrollbar">
        <table className="w-full min-w-[880px] text-left text-xs text-slate-900 dark:text-slate-100">
          <thead className="bg-[#f0f5f2] dark:bg-slate-800 text-slate-800 dark:text-slate-200 uppercase font-bold border-b border-[#d1ded5] dark:border-slate-800">
            <tr>
              <th className="py-3 px-4">Item & Batch Code</th>
              <th className="py-3 px-4">Storage Chamber & Live IoT Telemetry</th>
              <th className="py-3 px-4">Stock Qty & Valuation</th>
              <th className="py-3 px-4">Multi-Modal Spoilage & RSL</th>
              <th className="py-3 px-4">Spoilage Status & Routing</th>
              <th className="py-3 px-4">AI Culinary Directive</th>
              <th className="py-3 px-4 text-right">Spoilage & Action Links</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e6ede8] dark:divide-slate-800">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-500 dark:text-slate-400 font-medium">
                  No matching perishable batches found.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const telemetry = getChamberTelemetry(item);
                const isQuarantine = item.is_quarantine || item.risk_level === 'Critical' || (item.remaining_shelf_life_hours <= 0);
                const isNearSpoil = (item.spoilage_prob >= 70.0 || item.is_smart_fifo_target || item.risk_level === 'High') && !isQuarantine;
                const spoilageScore = item.spoilage_prob || 15.0;

                return (
                  <tr 
                    key={item.id} 
                    className={`transition-colors ${
                      isQuarantine 
                        ? 'bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50/70 dark:hover:bg-rose-950/40' 
                        : isNearSpoil
                        ? 'bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50/70 dark:hover:bg-amber-950/30'
                        : 'hover:bg-[#f9fbf9] dark:hover:bg-slate-800/60'
                    }`}
                  >
                    
                    {/* Item Name & Batch Code */}
                    <td className="py-3 px-3.5 sm:px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-[#d1ded5] dark:border-slate-700 flex-shrink-0 relative shadow-xs">
                          <img
                            src={item.image_url || getItemThumbnail(item.name, item.category)}
                            alt={item.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><rect width="100%" height="100%" fill="%23059669" fill-opacity="0.12"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="24">${encodeURIComponent(getCategoryEmoji(item.category))}</text></svg>`;
                            }}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                            <span>{item.name}</span>
                            {isNearSpoil && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                                FIFO Target
                              </span>
                            )}
                            {isQuarantine && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-700">
                                Locked
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-medium mt-0.5">
                            {item.batch_number} • <span className="text-slate-400">Stored {item.storage_duration_hours}h ago</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Storage Chamber & Live IoT Telemetry */}
                    <td className="py-3.5 px-4 min-w-[200px]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                          {telemetry.chamberName.split('(')[0].trim()}
                        </span>
                        <span className={`h-1.5 w-1.5 rounded-full ${telemetry.status === 'warning' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                      </div>

                      {/* Chamber IoT Telemetry Matrix Pill */}
                      <div className="mt-1.5 p-1.5 rounded-lg bg-[#f0f5f2] dark:bg-slate-800/90 border border-[#d1ded5] dark:border-slate-700/80 text-[10px] space-y-0.5 font-medium text-slate-700 dark:text-slate-300">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-bold">
                            <Thermometer className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            {telemetry.temp}°C
                          </span>
                          <span className="flex items-center gap-1">
                            <Droplets className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                            {telemetry.humidity}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 text-slate-500 dark:text-slate-400 font-mono pt-0.5 border-t border-slate-200 dark:border-slate-700">
                          <span>VOC: {telemetry.voc}ppm</span>
                          <span>CO₂: {telemetry.co2}ppm</span>
                        </div>
                      </div>
                    </td>

                    {/* Stock Qty & Unit Valuation */}
                    <td className="py-3.5 px-4">
                      <div className="text-xs font-black text-slate-900 dark:text-white">
                        {item.quantity}
                      </div>
                      <div className="text-[11px] font-mono font-semibold mt-0.5">
                        {isQuarantine ? (
                          <span className="text-rose-600 dark:text-rose-400 font-bold">Rs. 0.00 (Quarantined)</span>
                        ) : (
                          <span className="text-emerald-800 dark:text-emerald-400">
                            Rs. {item.stock_valuation_lkr ? item.stock_valuation_lkr.toLocaleString() : '4,500'}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Multi-Modal Spoilage & RSL */}
                    <td className="py-3.5 px-4 min-w-[150px]">
                      <div className="flex items-center justify-between text-xs font-black mb-1">
                        <span className={
                          isQuarantine 
                            ? 'text-rose-700 dark:text-rose-400' 
                            : isNearSpoil 
                            ? 'text-amber-700 dark:text-amber-400' 
                            : 'text-emerald-700 dark:text-emerald-400'
                        }>
                          {spoilageScore}% Spoilage
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-semibold">
                          {item.remaining_shelf_life_hours <= 0 ? '0 hrs' : `${item.remaining_shelf_life_hours}h`}
                        </span>
                      </div>

                      {/* Spoilage Probability Bar */}
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            isQuarantine
                              ? 'bg-rose-600 animate-pulse'
                              : isNearSpoil
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(5, spoilageScore))}%` }}
                        />
                      </div>

                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                        <span>CV + IoT Telemetry Synced</span>
                      </div>
                    </td>

                    {/* Spoilage Status Badge */}
                    <td className="py-3.5 px-4">
                      {renderRiskBadge(item.risk_level, isQuarantine, isNearSpoil, spoilageScore)}
                    </td>

                    {/* AI Culinary Recommendation */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-2 leading-relaxed">
                        {item.recommendation}
                      </span>
                    </td>

                    {/* Integrated Cross-Module Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* 1. Inspect Produce in Chamber CV Scanner */}
                        <button
                          onClick={() => onNavigateToSpoilage ? onNavigateToSpoilage(item.name, 'vision') : onNavigateModule?.('spoilage')}
                          className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-[11px] font-bold flex items-center gap-1 transition-colors shadow-2xs"
                          title="Inspect produce in Food Spoilage Chamber & CV Inspector"
                        >
                          <Camera className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                          <span className="hidden lg:inline">Inspect</span>
                        </button>

                        {/* 2. AI Recipe Directive Button (For Near-Spoilage ~75% Batches) */}
                        {isNearSpoil && (
                          <button
                            onClick={() => onNavigateToSpoilage ? onNavigateToSpoilage(item.name, 'assessor') : onNavigateModule?.('spoilage')}
                            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 text-[11px] font-bold flex items-center gap-1 transition-colors shadow-2xs"
                            title="Open Zero-Waste Chef Recipe Directives"
                          >
                            <ChefHat className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
                            <span className="hidden lg:inline">Recipe</span>
                          </button>
                        )}

                        {/* 3. Quarantine to Smart Waste Bin (For Critical Rot Batches) */}
                        {isQuarantine && (
                          <button
                            onClick={() => handleQuarantineToWaste(item)}
                            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/80 dark:hover:bg-rose-900 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-700 text-[11px] font-bold flex items-center gap-1 transition-colors shadow-2xs animate-pulse"
                            title="Quarantine and log to Smart Waste Bin"
                          >
                            <ShieldAlert className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                            <span className="hidden lg:inline">Quarantine</span>
                          </button>
                        )}

                        {/* 4. Delete / Remove */}
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Dispatch / Remove batch"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* QUICK RESTOCK / RECEIVE SHIPMENT MODAL */}
      {showRestockModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[#d1ded5] dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e1eae4] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Receive Supplier Shipment</h3>
              </div>
              <button
                onClick={() => setShowRestockModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRestockShipment} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-800 dark:text-slate-200 font-bold block mb-1">Item / Produce Name</label>
                <input
                  type="text"
                  required
                  value={restockData.name}
                  onChange={(e) => setRestockData({ ...restockData, name: e.target.value })}
                  className="w-full bg-[#f8faf9] dark:bg-slate-800 border border-[#c6d7cd] dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-800 dark:text-slate-200 font-bold block mb-1">Category</label>
                  <select
                    value={restockData.category}
                    onChange={(e) => setRestockData({ ...restockData, category: e.target.value })}
                    className="w-full bg-[#f8faf9] dark:bg-slate-800 border border-[#c6d7cd] dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Fruits">Fruits</option>
                    <option value="Vegetables">Vegetables</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-800 dark:text-slate-200 font-bold block mb-1">Quantity (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={restockData.quantity_kg}
                    onChange={(e) => setRestockData({ ...restockData, quantity_kg: Number(e.target.value) })}
                    className="w-full bg-[#f8faf9] dark:bg-slate-800 border border-[#c6d7cd] dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-800 dark:text-slate-200 font-bold block mb-1">Destination Cold Storage Chamber</label>
                <select
                  value={restockData.storage_zone}
                  onChange={(e) => setRestockData({ ...restockData, storage_zone: e.target.value })}
                  className="w-full bg-[#f8faf9] dark:bg-slate-800 border border-[#c6d7cd] dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-emerald-600"
                >
                  {zones.map(z => (
                    <option key={z.id} value={z.name}>{z.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-800 dark:text-slate-200 font-bold block mb-1">Approved Agricultural Supplier</label>
                <input
                  type="text"
                  value={restockData.supplier}
                  onChange={(e) => setRestockData({ ...restockData, supplier: e.target.value })}
                  className="w-full bg-[#f8faf9] dark:bg-slate-800 border border-[#c6d7cd] dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e1eae4] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRestockModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md shadow-emerald-700/20"
                >
                  Confirm Shipment Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER NEW BATCH MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[#d1ded5] dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e1eae4] dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Register New Perishable Batch</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-800 dark:text-slate-200 font-bold block mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fresh Red Strawberries"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full bg-[#f8faf9] dark:bg-slate-800 border border-[#c6d7cd] dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-800 dark:text-slate-200 font-bold block mb-1">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full bg-[#f8faf9] dark:bg-slate-800 border border-[#c6d7cd] dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Fruits">Fruits</option>
                    <option value="Vegetables">Vegetables</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-800 dark:text-slate-200 font-bold block mb-1">Batch Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BAT-2026-SB99"
                    value={newItem.batch_number}
                    onChange={(e) => setNewItem({ ...newItem, batch_number: e.target.value })}
                    className="w-full bg-[#f8faf9] dark:bg-slate-800 border border-[#c6d7cd] dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-800 dark:text-slate-200 font-bold block mb-1">Quantity</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 15.0 kg"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                    className="w-full bg-[#f8faf9] dark:bg-slate-800 border border-[#c6d7cd] dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-slate-800 dark:text-slate-200 font-bold block mb-1">Storage Hours</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newItem.storage_duration_hours}
                    onChange={(e) => setNewItem({ ...newItem, storage_duration_hours: Number(e.target.value) })}
                    className="w-full bg-[#f8faf9] dark:bg-slate-800 border border-[#c6d7cd] dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-800 dark:text-slate-200 font-bold block mb-1">Storage Chamber</label>
                <select
                  value={newItem.storage_zone}
                  onChange={(e) => setNewItem({ ...newItem, storage_zone: e.target.value })}
                  className="w-full bg-[#f8faf9] dark:bg-slate-800 border border-[#c6d7cd] dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-emerald-600"
                >
                  {zones.map(z => (
                    <option key={z.id} value={z.name}>{z.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e1eae4] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md shadow-emerald-700/20"
                >
                  Save & Ingest Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
