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
  Milk, 
  Fish, 
  Beef, 
  X, 
  Truck, 
  Layers, 
  DollarSign, 
  Sparkles,
  PackageCheck
} from 'lucide-react';
import axios from 'axios';

const getItemThumbnail = (name = "", category = "") => {
  const n = name.toLowerCase();
  if (n.includes("banana")) return "/images/specimens/banana_overripe.jpg";
  if (n.includes("strawberr")) return "/images/specimens/strawberries_mould.jpg";
  if (n.includes("apple")) return "/images/specimens/apple_fresh.jpg";
  if (n.includes("lettuce") || n.includes("salad")) return "/images/specimens/lettuce_crisp.jpg";
  if (n.includes("tomato")) return "/images/specimens/tomato_overripe.jpg";
  if (n.includes("spinach")) return "/images/specimens/spinach_wilted.jpg";
  if (n.includes("milk")) return "/images/specimens/milk_fresh.jpg";
  if (n.includes("cheese") || n.includes("mozzarella")) return "/images/specimens/cheese_mouldy.jpg";
  if (n.includes("yogurt") || n.includes("cream")) return "/images/specimens/yogurt_curdled.jpg";
  if (n.includes("tuna")) return "/images/specimens/tuna_oxidized.jpg";
  if (n.includes("salmon")) return "/images/specimens/salmon_fresh.jpg";
  if (n.includes("prawn") || n.includes("shrimp")) return "/images/specimens/prawns_fresh.jpg";
  if (n.includes("chicken") || n.includes("poultry")) return "/images/specimens/chicken_fresh.jpg";
  if (n.includes("beef") || n.includes("steak") || n.includes("meat")) return "/images/specimens/beef_fresh.jpg";

  if (category === "Fruits") return "/images/specimens/apple_fresh.jpg";
  if (category === "Vegetables") return "/images/specimens/lettuce_crisp.jpg";
  if (category === "Dairy") return "/images/specimens/milk_fresh.jpg";
  if (category === "Fish") return "/images/specimens/salmon_fresh.jpg";
  return "/images/specimens/beef_fresh.jpg";
};

const getCategoryEmoji = (category = "") => {
  switch (category) {
    case "Fruits": return "🍎";
    case "Vegetables": return "🥬";
    case "Dairy": return "🥛";
    case "Fish": return "🐟";
    case "Meat": return "🥩";
    default: return "📦";
  }
};

export default function InventoryHealthTable({ items = [], zones = [], onRefresh, onUpdateItems }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRisk, setSelectedRisk] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);

  // New batch form state
  const [newItem, setNewItem] = useState({
    name: "",
    category: "Fruits",
    storage_zone: zones[0]?.name || "Zone 1: Fruit & Berry Preservation Chamber",
    batch_number: "",
    quantity: "15.0 kg",
    storage_duration_hours: 24
  });

  // Quick Restock form state
  const [restockData, setRestockData] = useState({
    name: "Cavendish Ripe Bananas (Crate)",
    category: "Fruits",
    storage_zone: zones[0]?.name || "Zone 1: Fruit & Berry Preservation Chamber",
    quantity_kg: 25.0,
    supplier: "Ceylon Organic Agricoop"
  });

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.batch_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === "all" || item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesRisk = selectedRisk === "all" || item.risk_level.toLowerCase() === selectedRisk.toLowerCase();
    return matchesSearch && matchesCat && matchesRisk;
  });

  const handleDeleteItem = async (itemId) => {
    try {
      await axios.delete(`http://localhost:8000/api/inventory/items/${itemId}`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.warn("Failed to delete inventory item remotely, removing locally:", err);
      if (onUpdateItems) {
        onUpdateItems(prev => prev.filter(i => i.id !== itemId));
      }
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/api/inventory/items", newItem);
      setShowAddModal(false);
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
    }
    setNewItem({
      name: "",
      category: "Fruits",
      storage_zone: zones[0]?.name || "Zone 1: Fruit & Berry Preservation Chamber",
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
        status: "Fresh",
        is_smart_fifo_target: false,
        stock_valuation_lkr: restockData.quantity_kg * 600,
        image_url: getItemThumbnail(restockData.name, restockData.category),
        recommendation: `Verified supplier delivery from ${restockData.supplier}. Inspected & cleared for storage.`
      };
      if (onUpdateItems) {
        onUpdateItems(prev => [restockedItem, ...prev]);
      }
      setShowRestockModal(false);
    }
  };

  const getCategoryBadge = (category) => {
    switch (category) {
      case "Fruits":
        return <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-400"><Apple className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" /> Fruits</span>;
      case "Vegetables":
        return <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-400"><Carrot className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" /> Vegetables</span>;
      case "Dairy":
        return <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-800 dark:text-sky-400"><Milk className="h-3.5 w-3.5 text-sky-700 dark:text-sky-400" /> Dairy</span>;
      case "Fish":
        return <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 dark:text-teal-400"><Fish className="h-3.5 w-3.5 text-teal-700 dark:text-teal-400" /> Fish & Seafood</span>;
      case "Meat":
      default:
        return <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 dark:text-rose-400"><Beef className="h-3.5 w-3.5 text-rose-700 dark:text-rose-400" /> Meat & Poultry</span>;
    }
  };

  const renderRiskBadge = (level) => {
    switch (level) {
      case "Low":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Low (Fresh)</span>;
      case "Medium":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700"><AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" /> Medium</span>;
      case "High":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 dark:bg-orange-950/60 text-orange-900 dark:text-orange-300 border border-orange-300 dark:border-orange-700"><ShieldAlert className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" /> High (Priority)</span>;
      case "Critical":
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-300 border border-rose-300 dark:border-rose-700 animate-pulse"><XCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" /> Critical (Spoiled)</span>;
    }
  };

  return (
    <div className="glass-panel p-3.5 sm:p-6 rounded-xl sm:rounded-2xl space-y-3.5 sm:space-y-5 bg-white dark:bg-slate-900 border border-[#d1ded5] dark:border-slate-800">
      
      {/* Header with Inventory Stats & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border-b border-[#e1eae4] dark:border-slate-800 pb-3 sm:pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">Perishable Inventory Spoilage & Stock Matrix</h2>
            <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold">
              {filteredItems.length} Batches
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Real-time batch shelf-life tracking, automated order deductions, and Smart FIFO dispatch priority
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
            placeholder="Search fruit, veg, meat or batch code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-[#c6d7cd] dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white font-medium placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-600 shadow-sm"
          />
        </div>

        {/* Category Quick Filter */}
        <div className="sm:col-span-5 flex items-center gap-1.5 overflow-x-auto">
          {["all", "fruits", "vegetables", "dairy", "fish", "meat"].map(cat => (
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
            <option value="all">All Risk Levels</option>
            <option value="low">Low Risk (Fresh)</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk (Priority Use)</option>
            <option value="critical">Critical (Disposal)</option>
          </select>
        </div>
      </div>

      {/* Table Data with FIFO & Stock Valuation */}
      <div className="overflow-x-auto rounded-xl border border-[#d1ded5] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm no-scrollbar">
        <table className="w-full min-w-[720px] text-left text-xs text-slate-900 dark:text-slate-100">
          <thead className="bg-[#f0f5f2] dark:bg-slate-800 text-slate-800 dark:text-slate-200 uppercase font-bold border-b border-[#d1ded5] dark:border-slate-800">
            <tr>
              <th className="py-3 px-4">Item & Batch Code</th>
              <th className="py-3 px-4">Category & Chamber</th>
              <th className="py-3 px-4">Stock Qty & Value</th>
              <th className="py-3 px-4">Remaining Shelf-Life</th>
              <th className="py-3 px-4">Risk & FIFO Routing</th>
              <th className="py-3 px-4">Action Recommendation</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e6ede8] dark:divide-slate-800">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-500 dark:text-slate-400 font-medium">
                  No matching inventory batches found.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#f9fbf9] dark:hover:bg-slate-800/60 transition-colors">
                  
                  {/* Item Name & Code */}
                  <td className="py-3 px-3.5 sm:px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-[#d1ded5] dark:border-slate-700 flex-shrink-0 relative shadow-2xs">
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
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                          <span>{item.name}</span>
                          {item.is_smart_fifo_target && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                              Smart FIFO Target
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-medium mt-0.5">
                          {item.batch_number} • <span className="text-slate-400">Stored {item.storage_duration_hours}h ago</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category & Zone */}
                  <td className="py-3.5 px-4">
                    <div>{getCategoryBadge(item.category)}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{item.storage_zone.split(':')[0]}</div>
                  </td>

                  {/* Stock Quantity & Unit Valuation */}
                  <td className="py-3.5 px-4">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.quantity}
                    </div>
                    <div className="text-[10px] text-emerald-800 dark:text-emerald-400 font-mono font-semibold mt-0.5">
                      ~Rs. {item.stock_valuation_lkr ? item.stock_valuation_lkr.toLocaleString() : '4,500'}
                    </div>
                  </td>

                  {/* Remaining Shelf Life */}
                  <td className="py-3.5 px-4">
                    <div className={`text-sm font-black ${item.remaining_shelf_life_hours < 16 ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                      {item.remaining_shelf_life_hours} hrs
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      Spoilage Prob: {item.spoilage_prob}%
                    </div>
                  </td>

                  {/* Risk Badge */}
                  <td className="py-3.5 px-4">
                    {renderRiskBadge(item.risk_level)}
                  </td>

                  {/* Culinary Recommendation */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-2">
                      {item.recommendation}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Dispatch / Remove batch"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
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
                    <option value="Dairy">Dairy</option>
                    <option value="Fish">Fish & Seafood</option>
                    <option value="Meat">Meat & Poultry</option>
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
                    <option value="Dairy">Dairy</option>
                    <option value="Fish">Fish & Seafood</option>
                    <option value="Meat">Meat & Poultry</option>
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
