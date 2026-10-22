import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Utensils, 
  Upload, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Clock, 
  DollarSign, 
  ChefHat, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  CloudUpload,
  PackageCheck
} from 'lucide-react';
import axios from 'axios';

const DEFAULT_INVENTORY_ITEMS = [
  { name: 'Fresh Atlantic Salmon Fillet', category: 'Fish', quantity: '24.5 kg' },
  { name: 'Fresh Broiler Chicken Breast Cuts', category: 'Meat', quantity: '35.0 kg' },
  { name: 'Prime Beef Sirloin Medallion', category: 'Meat', quantity: '18.0 kg' },
  { name: 'Calamari & Prawns Mix', category: 'Fish', quantity: '15.0 kg' },
  { name: 'Garlic Butter Jumbo King Prawns', category: 'Fish', quantity: '12.0 kg' },
  { name: 'Embul Banana (Ambul Kesel)', category: 'Fruits', quantity: '28.0 kg' },
  { name: 'Karthakolomban Mango (Ripe)', category: 'Fruits', quantity: '20.0 kg' },
  { name: 'Red Lady Papaya (Rathu Papol)', category: 'Fruits', quantity: '18.5 kg' },
  { name: 'Mauritius Pineapple (Gampaha Annasi)', category: 'Fruits', quantity: '22.0 kg' },
  { name: 'Local Tomatoes (Thakkali - Maheshi)', category: 'Vegetables', quantity: '19.0 kg' },
  { name: 'Nuwara Eliya Carrots (Premium Kuroda)', category: 'Vegetables', quantity: '16.5 kg' },
  { name: 'Green Beans (Welimada Bonchi)', category: 'Vegetables', quantity: '14.0 kg' },
  { name: 'Green Chillies (Amu Miris - MI-2)', category: 'Vegetables', quantity: '8.0 kg' },
  { name: 'Kankun (Water Spinach)', category: 'Vegetables', quantity: '12.0 kg' },
  { name: 'Gotukola (Centella Asiatica)', category: 'Vegetables', quantity: '6.5 kg' },
  { name: 'Hydroponic Romaine Lettuce (Crisp)', category: 'Vegetables', quantity: '15.0 kg' },
  { name: 'Pasteurized Fresh Buffalo Curd & Milk', category: 'Dairy', quantity: '25.0 kg' },
  { name: 'Aged Cheddar & Mozzarella Blocks', category: 'Dairy', quantity: '14.0 kg' },
  { name: 'Basmati Rice', category: 'Grains & Flour', quantity: '45.0 kg' },
  { name: 'Samba/Keeri Rice', category: 'Grains & Flour', quantity: '50.0 kg' },
  { name: 'Godamba Roti Shreds', category: 'Grains & Flour', quantity: '30.0 kg' },
  { name: 'Dhal / Lentils', category: 'Grains & Flour', quantity: '25.0 kg' },
  { name: 'Ceylon Cinnamon & Cardamom', category: 'Spices', quantity: '5.0 kg' },
  { name: 'Crushed Tellicherry Black Pepper', category: 'Spices', quantity: '4.5 kg' },
  { name: 'Coconut Milk & Spices', category: 'Oils & Condiments', quantity: '18.0 L' },
  { name: 'Spiced Kottu Gravy', category: 'Oils & Condiments', quantity: '15.0 L' },
  { name: 'Fresh Basil & Olive Oil', category: 'Oils & Condiments', quantity: '8.0 L' }
];

const STATION_OPTIONS = [
  { id: 'station-1', name: 'Hot Wok & Kottu Station' },
  { id: 'station-2', name: 'Curry & Rice Assembly Bay' },
  { id: 'station-3', name: 'Grill & Seafood Station' },
  { id: 'station-4', name: 'Salad & Cold Prep Station' },
  { id: 'station-5', name: 'Dessert & Beverage Bar' }
];

const CATEGORY_OPTIONS = [
  'Main Course',
  'Seafood',
  'Grill & Seafood',
  'Curry & Rice',
  'Healthy & Salads',
  'Dessert & Pastry',
  'Beverages',
  'Snacks & Appetizers'
];

const PRESET_IMAGES = [
  { label: 'Seafood Rice', url: '/images/dishes/dish_7.jpg' },
  { label: 'Grilled Salmon', url: '/images/dishes/dish_2.jpg' },
  { label: 'Chicken Kottu', url: '/images/dishes/dish_1.jpg' },
  { label: 'King Prawns', url: '/images/dishes/dish_9.jpg' },
  { label: 'Harvest Salad', url: '/images/dishes/dish_4.jpg' },
  { label: 'Berry Waffle', url: '/images/dishes/dish_3.jpg' }
];

export default function AddMenuItemModal({ isOpen, onClose, onItemAdded }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Main Course');
  const [priceLkr, setPriceLkr] = useState('');
  const [hasPortions, setHasPortions] = useState(false);
  const [portionPrices, setPortionPrices] = useState({ Small: '', Medium: '', Large: '' });
  const [prepTimeMins, setPrepTimeMins] = useState('12');
  const [stationId, setStationId] = useState('station-1');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [availableInventory, setAvailableInventory] = useState(DEFAULT_INVENTORY_ITEMS);
  const [ingredients, setIngredients] = useState([
    { ingredient_name: 'Fresh Atlantic Salmon Fillet', category: 'Fish', required_kg: 0.25, small_kg: 0.18, large_kg: 0.38, isCustom: false },
    { ingredient_name: 'Hydroponic Romaine Lettuce (Crisp)', category: 'Vegetables', required_kg: 0.10, small_kg: 0.07, large_kg: 0.15, isCustom: false }
  ]);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchInventoryItems();
    }
  }, [isOpen]);

  const fetchInventoryItems = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/inventory/items');
      if (res.data?.items && Array.isArray(res.data.items) && res.data.items.length > 0) {
        const liveItems = res.data.items.map(it => ({
          name: it.name,
          category: it.category || 'Vegetables',
          quantity: it.quantity || 'In Stock'
        }));
        const map = new Map();
        [...liveItems, ...DEFAULT_INVENTORY_ITEMS].forEach(it => {
          if (!map.has(it.name.toLowerCase())) {
            map.set(it.name.toLowerCase(), it);
          }
        });
        setAvailableInventory(Array.from(map.values()));
      }
    } catch (err) {
      console.warn("Using offline default inventory items for recipe BOM", err);
    }
  };

  if (!isOpen) return null;

  // Handle local image file upload & compress via canvas for optimal Firebase storage
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 500;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);

        setImageUrl(compressedBase64);
        setImagePreview(compressedBase64);
        setErrorMsg('');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (url) => {
    setImageUrl(url);
    setImagePreview(url);
    setErrorMsg('');
  };

  const handleAddIngredient = () => {
    const nextItem = availableInventory[ingredients.length % availableInventory.length] || DEFAULT_INVENTORY_ITEMS[0];
    setIngredients([
      ...ingredients,
      { 
        ingredient_name: nextItem.name, 
        category: nextItem.category, 
        required_kg: 0.10, 
        small_kg: 0.07, 
        large_kg: 0.15,
        isCustom: false
      }
    ]);
  };

  const handleSelectInventoryIngredient = (index, selectedName) => {
    const found = availableInventory.find(i => i.name === selectedName);
    const updated = [...ingredients];
    updated[index].ingredient_name = selectedName;
    if (found) {
      updated[index].category = found.category;
    }
    updated[index].isCustom = false;
    setIngredients(updated);
  };

  const handleToggleCustom = (index, isCustom) => {
    const updated = [...ingredients];
    updated[index].isCustom = isCustom;
    if (isCustom) {
      updated[index].ingredient_name = '';
    } else {
      updated[index].ingredient_name = availableInventory[0]?.name || '';
      updated[index].category = availableInventory[0]?.category || 'Vegetables';
    }
    setIngredients(updated);
  };

  const handleRemoveIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index, field, value) => {
    const updated = [...ingredients];
    if (field === 'required_kg') {
      const num = parseFloat(value) || 0;
      updated[index].required_kg = num;
      updated[index].small_kg = parseFloat((num * 0.7).toFixed(2));
      updated[index].large_kg = parseFloat((num * 1.5).toFixed(2));
    } else if (field === 'small_kg' || field === 'large_kg') {
      updated[index][field] = parseFloat(value) || 0;
    } else {
      updated[index][field] = value;
    }
    setIngredients(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Dish name is required.');
      return;
    }

    let finalPrice = parseFloat(priceLkr);
    let portionsList = [];

    if (hasPortions) {
      const pSmall = parseFloat(portionPrices.Small);
      const pMed = parseFloat(portionPrices.Medium) || finalPrice;
      const pLarge = parseFloat(portionPrices.Large);

      if (isNaN(pMed) || pMed <= 0) {
        setErrorMsg('Please enter a valid Medium (standard) price in LKR.');
        return;
      }
      finalPrice = pMed;

      const validIngredients = ingredients.filter(i => i.ingredient_name.trim() !== '');

      portionsList = [
        {
          size: 'Small',
          price_lkr: !isNaN(pSmall) && pSmall > 0 ? pSmall : Math.round(pMed * 0.7),
          prep_time_mins: Math.max(1, (parseInt(prepTimeMins) || 12) - 2),
          recipe_bom: validIngredients.map(ing => ({
            ingredient_name: ing.ingredient_name.trim(),
            category: ing.category,
            required_kg: ing.small_kg !== undefined && !isNaN(parseFloat(ing.small_kg)) && parseFloat(ing.small_kg) > 0
              ? parseFloat(ing.small_kg)
              : parseFloat((ing.required_kg * 0.7).toFixed(2)) || 0.1
          }))
        },
        {
          size: 'Medium',
          price_lkr: pMed,
          prep_time_mins: parseInt(prepTimeMins) || 12,
          recipe_bom: validIngredients.map(ing => ({
            ingredient_name: ing.ingredient_name.trim(),
            category: ing.category,
            required_kg: parseFloat(ing.required_kg) || 0.2
          }))
        },
        {
          size: 'Large',
          price_lkr: !isNaN(pLarge) && pLarge > 0 ? pLarge : Math.round(pMed * 1.4),
          prep_time_mins: (parseInt(prepTimeMins) || 12) + 3,
          recipe_bom: validIngredients.map(ing => ({
            ingredient_name: ing.ingredient_name.trim(),
            category: ing.category,
            required_kg: ing.large_kg !== undefined && !isNaN(parseFloat(ing.large_kg)) && parseFloat(ing.large_kg) > 0
              ? parseFloat(ing.large_kg)
              : parseFloat((ing.required_kg * 1.5).toFixed(2)) || 0.3
          }))
        }
      ];
    } else {
      if (isNaN(finalPrice) || finalPrice <= 0) {
        setErrorMsg('Please enter a valid price in LKR greater than zero.');
        return;
      }
    }

    const selectedStation = STATION_OPTIONS.find(s => s.id === stationId);

    const payload = {
      name: name.trim(),
      category: category.trim(),
      price_lkr: finalPrice,
      prep_time_mins: parseInt(prepTimeMins) || 12,
      station_id: stationId,
      station_name: selectedStation ? selectedStation.name : 'Hot Wok & Kottu Station',
      image_url: imageUrl || '/images/dishes/dish_1.jpg',
      description: description.trim(),
      has_portions: hasPortions,
      portions: portionsList,
      recipe_bom: ingredients.filter(i => i.ingredient_name.trim() !== '')
    };

    try {
      setSaving(true);
      setErrorMsg('');
      const res = await axios.post('http://localhost:8000/api/orders/menu', payload);
      if (res.data?.status === 'success') {
        if (onItemAdded) {
          onItemAdded(res.data.item);
        }
        onClose();
      }
    } catch (err) {
      console.error('Failed to save menu item:', err);
      setErrorMsg(err.response?.data?.detail || 'Failed to save menu item. Please check backend connection.');
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <Utensils className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                Add New Menu Item 
               
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Upload dish photo, set pricing, assign kitchen station, and specify recipe 
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 max-h-[82vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Food Photo Upload */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                Dish Food Photo (Upload or Preset)
              </span>
              {imagePreview && (
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Photo Loaded
                </span>
              )}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              {/* Photo Preview Box */}
              <div className="w-full h-32 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden relative bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-400 group">
                {imagePreview ? (
                  <>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                    />
                    <button
                      type="button"
                      onClick={() => { setImageUrl(''); setImagePreview(''); }}
                      className="absolute top-1.5 right-1.5 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-md text-[10px] shadow"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-2">
                    <CloudUpload className="w-7 h-7 mx-auto mb-1 text-slate-400" />
                    <span className="text-[11px] font-bold text-slate-500">No photo chosen</span>
                  </div>
                )}
              </div>

              {/* Upload Input & Presets */}
              <div className="sm:col-span-2 space-y-2">
                <label className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl cursor-pointer text-xs font-bold transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Choose Food Photo from Computer</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageFileChange} 
                    className="hidden" 
                  />
                </label>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Or quick select standard dish photo:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPreset(preset.url)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                          imageUrl === preset.url
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-emerald-50'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Core Dish Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Dish Name */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Dish Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sri Lankan Black Pepper Crab"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Menu Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat} className="text-slate-900 dark:text-white bg-white dark:bg-slate-900 py-1">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Portion Strategy Switcher */}
            <div className="sm:col-span-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Portion Sizes & Sizing Strategy
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Select single standard portion or multi-tier (Small, Medium, Large)
                </p>
              </div>

              <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-900 rounded-xl self-start sm:self-auto border border-slate-300 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setHasPortions(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    !hasPortions
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Single Portion
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHasPortions(true);
                    if (!portionPrices.Medium && priceLkr) {
                      const p = parseFloat(priceLkr) || 1500;
                      setPortionPrices({
                        Small: (p * 0.7).toFixed(0),
                        Medium: p.toString(),
                        Large: (p * 1.4).toFixed(0)
                      });
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    hasPortions
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Small / Med / Large
                </button>
              </div>
            </div>

            {/* Pricing Section */}
            {!hasPortions ? (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Selling Price (LKR) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Rs.</span>
                  <input
                    type="number"
                    step="50"
                    value={priceLkr}
                    onChange={(e) => setPriceLkr(e.target.value)}
                    placeholder="2450.00"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Portion Tier Pricing (LKR) <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Small Price:</span>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-[11px] font-bold text-slate-400">Rs.</span>
                      <input
                        type="number"
                        step="50"
                        value={portionPrices.Small}
                        onChange={(e) => setPortionPrices({ ...portionPrices, Small: e.target.value })}
                        placeholder="1100"
                        className="w-full pl-8 pr-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Medium (Standard) Price:</span>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-[11px] font-bold text-emerald-600">Rs.</span>
                      <input
                        type="number"
                        step="50"
                        value={portionPrices.Medium}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPriceLkr(val);
                          const p = parseFloat(val);
                          setPortionPrices({
                            Small: portionPrices.Small || (p ? (p * 0.7).toFixed(0) : ''),
                            Medium: val,
                            Large: portionPrices.Large || (p ? (p * 1.4).toFixed(0) : '')
                          });
                        }}
                        placeholder="1650"
                        className="w-full pl-8 pr-2.5 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100 text-xs font-black focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Large Price:</span>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-[11px] font-bold text-slate-400">Rs.</span>
                      <input
                        type="number"
                        step="50"
                        value={portionPrices.Large}
                        onChange={(e) => setPortionPrices({ ...portionPrices, Large: e.target.value })}
                        placeholder="2250"
                        className="w-full pl-8 pr-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Prep Time */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Target Prep Time (Mins)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={prepTimeMins}
                onChange={(e) => setPrepTimeMins(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Kitchen Station */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <ChefHat className="w-3.5 h-3.5 text-slate-400" />
                Dispatched Kitchen Station
              </label>
              <select
                value={stationId}
                onChange={(e) => setStationId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {STATION_OPTIONS.map((st) => (
                  <option key={st.id} value={st.id} className="text-slate-900 dark:text-white bg-white dark:bg-slate-900 py-1">
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Culinary Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Succulent mud crab sautéed with crushed tellicherry black peppercorns, curry leaves, and toasted garlic sourdough."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Section 3: Recipe Bill of Materials (BOM) */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  Recipe Bill of Materials (BOM Ingredients)
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {hasPortions
                    ? "Specify required ingredient weights for Small, Medium, and Large portions"
                    : "Required ingredients automatically deducted from batches with lowest shelf-life upon order"}
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-300 dark:border-emerald-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Ingredient</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {ingredients.map((ing, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-2.5 shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    {/* Inventory Database Dropdown or Custom Name */}
                    {!ing.isCustom ? (
                      <div className="flex-1">
                        <select
                          value={ing.ingredient_name}
                          onChange={(e) => {
                            if (e.target.value === '__custom__') {
                              handleToggleCustom(idx, true);
                            } else {
                              handleSelectInventoryIngredient(idx, e.target.value);
                            }
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
                        >
                          <option value="" disabled className="text-slate-500 bg-white dark:bg-slate-900">
                            -- Select Ingredient from Inventory --
                          </option>
                          {availableInventory.map((item) => (
                            <option 
                              key={item.name} 
                              value={item.name}
                              className="text-slate-900 dark:text-white bg-white dark:bg-slate-900 py-1"
                            >
                              {item.name} {item.category ? `(${item.category})` : ''} {item.quantity ? `• Stock: ${item.quantity}` : ''}
                            </option>
                          ))}
                          <option value="__custom__" className="text-emerald-700 dark:text-emerald-400 font-extrabold bg-white dark:bg-slate-900">
                            + Enter Custom Ingredient...
                          </option>
                        </select>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center gap-1.5">
                        <input
                          type="text"
                          value={ing.ingredient_name}
                          onChange={(e) => handleIngredientChange(idx, 'ingredient_name', e.target.value)}
                          placeholder="Type custom ingredient name..."
                          className="w-full px-3 py-2 rounded-lg border border-emerald-400 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleToggleCustom(idx, false)}
                          className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline px-1.5 whitespace-nowrap cursor-pointer"
                        >
                          Inventory List
                        </button>
                      </div>
                    )}

                    {/* Single Portion Quantity */}
                    {!hasPortions && (
                      <div className="flex items-center gap-1.5 shrink-0 bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Qty:
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.001"
                          value={ing.required_kg}
                          onChange={(e) => handleIngredientChange(idx, 'required_kg', e.target.value)}
                          className="w-16 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-xs text-right focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <span className="text-[11px] text-slate-700 dark:text-slate-300 font-bold">kg</span>
                      </div>
                    )}

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Remove ingredient"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Multi-Portion Tier Weights if hasPortions is active */}
                  {hasPortions && (
                    <div className="grid grid-cols-3 gap-2 bg-white dark:bg-slate-900/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-0.5">Small Portion:</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.01"
                            min="0.001"
                            value={ing.small_kg ?? (ing.required_kg ? (ing.required_kg * 0.7).toFixed(2) : 0.07)}
                            onChange={(e) => handleIngredientChange(idx, 'small_kg', e.target.value)}
                            className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <span className="text-[10px] text-slate-700 dark:text-slate-300 font-bold">kg</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-0.5">Medium (Base):</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.01"
                            min="0.001"
                            value={ing.required_kg}
                            onChange={(e) => handleIngredientChange(idx, 'required_kg', e.target.value)}
                            className="w-full px-2 py-1 rounded border border-emerald-400 dark:border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-slate-900 dark:text-white font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <span className="text-[10px] text-slate-700 dark:text-slate-300 font-bold">kg</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-0.5">Large Portion:</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.01"
                            min="0.001"
                            value={ing.large_kg ?? (ing.required_kg ? (ing.required_kg * 1.5).toFixed(2) : 0.15)}
                            onChange={(e) => handleIngredientChange(idx, 'large_kg', e.target.value)}
                            className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <span className="text-[10px] text-slate-700 dark:text-slate-300 font-bold">kg</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md active:scale-95 transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save & Publish Dish</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
