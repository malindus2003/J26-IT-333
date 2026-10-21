import React, { useState, useEffect, useRef } from 'react';
import { 
  ChefHat, 
  UtensilsCrossed, 
  Sparkles, 
  Clock, 
  Hourglass, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  Flame, 
  BookOpen, 
  Send, 
  Check, 
  Plus, 
  RefreshCw, 
  ShieldAlert, 
  Search, 
  Filter, 
  Apple, 
  Carrot, 
  Boxes, 
  ArrowRight,
  TrendingUp,
  X,
  Layers,
  Camera,
  Upload,
  Cpu,
  Thermometer,
  Droplets,
  Zap,
  Activity
} from 'lucide-react';
import axios from 'axios';

// Default Storage Unit Schema fallback
const DEFAULT_FALLBACK_STORAGES = [
  {
    id: "storage-1",
    name: "Storage 1: Tropical Chiller",
    category: "Chilled Chamber (Fruit & Veg)",
    target_temp: 11.0,
    current_temp: 11.4,
    target_humidity: 89.0,
    current_humidity: 90.2,
    voc: 0.32,
    status: "optimal",
    node_id: "ESP32-NODE-01 (Active)",
    assignedProduce: {
      presetId: "banana_embul_fresh",
      produceName: "Embul Banana (Ambul Kesel)",
      category: "Fruits",
      imageUrl: "/images/specimens/banana_fresh.jpg",
      cvResult: {
        identified_produce: "Banana",
        visual_spoilage_score: 11.5,
        ripeness_percent: 25,
        risk_level: "Low",
        ripeness_stage: "Fresh (Grade A - Prime Harvest)",
        remaining_shelf_life_hours: 115.0,
        discoloration_score: 3.2,
        texture_degradation: 6.0,
        detected_defects: ["Intact epidermal cuticle", "Optimal chlorophyll-to-carotenoid ratio (Grade A)"]
      }
    }
  }
];

// Dynamic AI Culinary Directive Generator based on produce & spoilage drivers
const generateCulinaryDirective = (produceName, category, spoilageScore, rslHours, storageName) => {
  const name = (produceName || "Perishable Produce").toLowerCase();
  const roundedSpoilage = Math.round(spoilageScore);

  if (name.includes("mango")) {
    return {
      recipeTitle: "Fresh Mango Nectar, Smoothies & Dessert Coulis",
      station: "Bar & Beverage / Dessert Station",
      prepTimeMinutes: 15,
      yieldPortions: "12 - 14 Servings",
      extendedShelfLife: "+5 Days Chilled / +3 Months Frozen",
      wasteCost: 38.40,
      chefDirective: `Softening cuticle and high ethylene detected (${roundedSpoilage}% spoilage). Divert ${produceName} immediately to bar cocktail prep and dessert coulis before fermentation sets in.`,
      ingredients: [
        `${produceName} flesh (approx. 2.5 kg)`,
        "Fresh lime juice (60 ml)",
        "Ginger simple syrup (45 ml)",
        "Pinch of sea salt"
      ],
      prepSteps: [
        "Peel skin and cut pulp away from seed; discard bruised epidermal spots.",
        "Puree 70% of pulp in high-speed blender with lime juice and ginger syrup until silky smooth.",
        "Decant half into bar dispensers for today's lunch brunch cocktails and mocktails.",
        "Portion remaining coulis into 500ml vacuum bags and freeze for weekly mango cheesecake topping."
      ],
      storageTip: "Store prepared coulis in airtight Cambro containers at 2°C - 4°C with wax paper touching surface."
    };
  } else if (name.includes("banana")) {
    return {
      recipeTitle: "Spiced Artisan Banana Bread & Breakfast Parfait",
      station: "Bakery & Pastry Counter",
      prepTimeMinutes: 25,
      yieldPortions: "3 Signature Loaves (24 Slices)",
      extendedShelfLife: "+4 Days Baked / +60 Days Frozen",
      wasteCost: 26.00,
      chefDirective: `Senescent sugar spotting and high softening detected (${roundedSpoilage}% spoilage). Peak natural fructose makes this ideal for zero-sugar added commercial baking.`,
      ingredients: [
        `${produceName} (8 - 10 medium)`,
        "Unsalted butter, melted (120 g)",
        "Dark brown sugar (150 g)",
        "Ceylon cinnamon & ground nutmeg (1.5 tsp)",
        "Flour, baking soda, and eggs"
      ],
      prepSteps: [
        "Mash bananas with a fork; their high moisture creates an extra tender crumb.",
        "Fold into batter with Ceylon cinnamon and fold gently with roasted walnuts.",
        "Bake at 175°C for 50 minutes until golden brown.",
        "Slice extra bananas into rounds and freeze flat on sheet trays for morning smoothie station."
      ],
      storageTip: "Wrap cooled loaves in plastic wrap; flavor intensifies on day 2."
    };
  } else if (name.includes("strawberry") || name.includes("strawberr") || name.includes("berry")) {
    return {
      recipeTitle: "Warm Strawberry-Basil Compote & Waffle Glaze",
      station: "Morning Grill & Dessert Bar",
      prepTimeMinutes: 12,
      yieldPortions: "10 Portions",
      extendedShelfLife: "+6 Days Jarred & Chilled",
      wasteCost: 32.00,
      chefDirective: `Tissue breakdown and high softening detected (${roundedSpoilage}% spoilage). Immediate heat reduction locks natural pectin and halts decomposition.`,
      ingredients: [
        `${produceName}, hulled (1.2 kg)`,
        "Raw cane sugar or honey (80 g)",
        "Fresh lemon zest & juice (1 lemon)",
        "Fresh basil chiffonade (3 g)"
      ],
      prepSteps: [
        "Rinse and hull strawberries, halving larger berries.",
        "Simmer in wide saucepan with sugar and lemon juice over medium flame for 8-10 minutes.",
        "Remove from heat, fold in fresh basil chiffonade for aroma, and let cool slightly.",
        "Serve warm over morning waffles, vanilla bean ice cream, or chill for dessert buffet."
      ],
      storageTip: "Decant into sterilized glass Mason jars with tight rubber gaskets."
    };
  } else if (name.includes("tomato")) {
    return {
      recipeTitle: "Slow-Roasted Garlic-Herb Tomato Marinara Base",
      station: "Hot Line & Sauté Station",
      prepTimeMinutes: 35,
      yieldPortions: "16 - 18 Servings (2.5 Liters)",
      extendedShelfLife: "+7 Days Chilled / +6 Months Frozen",
      wasteCost: 28.50,
      chefDirective: `Overripe softening and skin cracking detected (${roundedSpoilage}% spoilage). Peak acidity and natural lycopene sugars make this optimal for rich savory reduction sauces.`,
      ingredients: [
        `${produceName}, quartered (3 kg)`,
        "Garlic cloves, crushed (8 cloves)",
        "Extra virgin olive oil (60 ml)",
        "Fresh rosemary, oregano, and sea salt"
      ],
      prepSteps: [
        "Toss quartered tomatoes with olive oil, crushed garlic, and fresh herbs.",
        "Roast on hotel pans at 190°C for 25 minutes until blistered and caramelized.",
        "Transfer to stockpot, simmer with cracked pepper for 10 minutes, and pulse with immersion blender.",
        "Label as 'House Roasted Marinara Base' for pizza, pasta stations, and shakshuka service."
      ],
      storageTip: "Cool rapidly in blast chiller before sealing into 2L Cambros."
    };
  } else if (name.includes("lettuce") || name.includes("spinach") || name.includes("green") || name.includes("salad") || name.includes("cabbage")) {
    return {
      recipeTitle: "Velvety Green Herb Soup & Stock Reduction",
      station: "Prep Kitchen & Soup Station",
      prepTimeMinutes: 20,
      yieldPortions: "12 Bowls",
      extendedShelfLife: "+4 Days Chilled / +2 Months Frozen",
      wasteCost: 19.80,
      chefDirective: `Cellular dehydration and wilting detected (${roundedSpoilage}% spoilage). While unsuitable for raw salads, high chlorophyll and dietary fiber make exquisite velvet soups.`,
      ingredients: [
        `Wilted ${produceName} (1.5 kg)`,
        "Shallots & leeks, diced (200 g)",
        "Vegetable broth (1.5 L)",
        "Potatoes, diced (for natural creaminess, 200 g)",
        "Fresh mint & cracked pepper"
      ],
      prepSteps: [
        "Blanch wilted greens in salted boiling water for 45 seconds, then shock in ice bath to preserve vibrant emerald green.",
        "Sauté shallots and leeks, add potatoes and vegetable broth; simmer until tender.",
        "Add blanched greens at the very end and blend immediately to retain bright green color.",
        "Finish with extra virgin olive oil swirl and garlic croutons as soup of the day."
      ],
      storageTip: "Reheat gently; do not boil vigorously to prevent color dulling."
    };
  } else if (name.includes("carrot")) {
    return {
      recipeTitle: "Pickled Ginger-Carrot Ribbons & Slaw Topping",
      station: "Cold Larder & Garde Manger",
      prepTimeMinutes: 15,
      yieldPortions: "25 Portions (Garnish / Slaw)",
      extendedShelfLife: "+30 Days (Pickled in Brine)",
      wasteCost: 22.00,
      chefDirective: `Root flaccidity and surface moisture loss detected (${roundedSpoilage}% spoilage). Acidic pickling brine will completely restore crisp texture.`,
      ingredients: [
        `${produceName}, peeled (1 kg)`,
        "Rice vinegar or white vinegar (300 ml)",
        "Filtered water (300 ml)",
        "Coriander seeds, fresh ginger, and sea salt"
      ],
      prepSteps: [
        "Using a mandoline or Y-peeler, shave carrots into long thin ribbons.",
        "Bring vinegar, water, sugar, and spices to a quick boil; pour hot pickling liquid over carrot ribbons.",
        "Allow to cool to room temperature; the acidity crisps the carrots back to a crunch.",
        "Use as signature condiment on banh mi, grain bowls, and grilled sandwiches."
      ],
      storageTip: "Keep submerged in brine in glass jars; ready to serve in 2 hours."
    };
  } else if (category === "Fruits") {
    return {
      recipeTitle: `Fresh ${produceName} Nectar & Tropical Smoothie Coulis`,
      station: "Bar & Beverage / Dessert Station",
      prepTimeMinutes: 15,
      yieldPortions: "12 Servings",
      extendedShelfLife: "+5 Days Chilled / +3 Months Frozen",
      wasteCost: 28.00,
      chefDirective: `High fruit softening detected (${roundedSpoilage}% spoilage). Blend immediately with citrus balancer for beverage service or freeze as puree.`,
      ingredients: [
        `${produceName} flesh (2 kg)`,
        "Fresh lemon or lime juice (50 ml)",
        "Simple syrup or agave (40 ml)",
        "Pinch of salt"
      ],
      prepSteps: [
        `Trim and sort ${produceName}; discard bruised skin areas.`,
        "Puree in blender with citrus juice and syrup until smooth.",
        "Decant for beverage bar specials or freeze into silicone muffin molds for smoothie portions."
      ],
      storageTip: "Keep chilled at 2°C - 4°C in sealed containers."
    };
  } else {
    return {
      recipeTitle: `Roasted ${produceName} Savory Stock Reduction`,
      station: "Prep Kitchen & Hot Line",
      prepTimeMinutes: 25,
      yieldPortions: "14 Bowls",
      extendedShelfLife: "+5 Days Chilled / +2 Months Frozen",
      wasteCost: 24.00,
      chefDirective: `Vegetable softening and wilting detected (${roundedSpoilage}% spoilage). Roast and simmer into hearty vegetable stock reduction.`,
      ingredients: [
        `${produceName}, chopped (2 kg)`,
        "Onions and garlic, halved",
        "Olive oil and fresh herbs",
        "Sea salt and peppercorns"
      ],
      prepSteps: [
        `Toss ${produceName} with olive oil and roast at 200°C for 20 minutes until caramelized.`,
        "Transfer to stockpot with water and herbs; simmer for 40 minutes.",
        "Strain or puree for house vegetable soup base."
      ],
      storageTip: "Chill rapidly in ice bath before refrigerated storage."
    };
  }
};

export default function MultiModalAssessor({ currentVisionFeatures, selectedZone, isDarkMode, targetProduce }) {
  // Storages State - loaded from localStorage to reflect Storage 1, Storage 2, etc.
  const [storages, setStorages] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_restaurant_storages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_FALLBACK_STORAGES;
  });

  const [selectedStorageId, setSelectedStorageId] = useState(() => storages[0]?.id || "storage-1");
  const [dispatchedMap, setDispatchedMap] = useState({});
  const [toastMessage, setToastMessage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPullingEsp32, setIsPullingEsp32] = useState(false);
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState(null);

  // Manual simulation override per storage for testing ~75% spoilage trigger
  const [simulationOverrides, setSimulationOverrides] = useState({});

  const fileInputRef = useRef(null);

  // Keep storages synced with localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('smart_restaurant_storages');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) setStorages(parsed);
        }
      } catch {}
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Auto-switch to storage or produce matching targetProduce when routed from Inventory
  useEffect(() => {
    if (!targetProduce) return;
    const term = targetProduce.toLowerCase().trim();
    const matched = storages.find(s => {
      const pn = (s.assignedProduce?.produceName || "").toLowerCase();
      return pn.includes(term) || term.includes(pn) ||
        (term.includes("banana") && pn.includes("banana")) ||
        (term.includes("mango") && pn.includes("mango")) ||
        (term.includes("papaya") && (pn.includes("papaya") || pn.includes("fruit"))) ||
        (term.includes("spinach") && pn.includes("spinach")) ||
        (term.includes("kankun") && pn.includes("spinach")) ||
        (term.includes("gotukola") && pn.includes("spinach")) ||
        (term.includes("lettuce") && pn.includes("lettuce")) ||
        (term.includes("tomato") && pn.includes("tomato"));
    });
    if (matched) {
      setSelectedStorageId(matched.id);
    }
  }, [targetProduce, storages]);

  // Active Storage Object
  const activeStorage = storages.find(s => s.id === selectedStorageId) || storages[0] || DEFAULT_FALLBACK_STORAGES[0];
  const activeProduce = activeStorage?.assignedProduce || DEFAULT_FALLBACK_STORAGES[0].assignedProduce;
  const activeCv = activeProduce?.cvResult;

  // Calculate Effective Spoilage Percentage
  // Priority: 1. Simulation override, 2. CV inspection result, 3. Sensor degradation penalty
  const simulation = simulationOverrides[activeStorage.id];

  const baseSpoilage = simulation !== undefined
    ? simulation.spoilageScore
    : (activeCv?.visual_spoilage_score || activeCv?.ripeness_percent || 15.0);

  // Environmental stress penalty: elevated temperature or high VOC/ethylene increases effective spoilage
  const tempExcess = Math.max(0, (activeStorage.current_temp || 11.0) - (activeStorage.target_temp || 11.0));
  const vocExcess = Math.max(0, (activeStorage.voc || 0.2) - 0.35);
  const sensorStressFactor = (tempExcess * 2.5) + (vocExcess * 18.0);

  const effectiveSpoilageScore = simulation !== undefined
    ? simulation.spoilageScore
    : Math.min(99.0, Math.round((baseSpoilage + sensorStressFactor) * 10) / 10);

  const effectiveRslHours = simulation !== undefined
    ? simulation.rslHours
    : (activeCv?.remaining_shelf_life_hours !== undefined 
        ? Math.max(1.0, Math.round((activeCv.remaining_shelf_life_hours - (tempExcess * 1.5)) * 10) / 10)
        : 115.0);

  // Spoilage Threshold Trigger: Around 70% - 75% spoilage, High Risk, or RSL <= 24h
  const isNearSpoil = effectiveSpoilageScore >= 70.0 || effectiveRslHours <= 24.0 || activeCv?.risk_level === 'High' || activeCv?.risk_level === 'Critical';

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDispatchKDS = (recipe, e) => {
    e?.stopPropagation();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setDispatchedMap(prev => ({
      ...prev,
      [activeStorage.id]: {
        dispatched: true,
        time: time,
        recipeTitle: recipe.recipeTitle
      }
    }));
    showToast(`✓ Recipe "${recipe.recipeTitle}" dispatched to Kitchen Display (${recipe.station})!`);
  };

  // Image Upload Analysis for Active Storage
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;
      try {
        const formData = new FormData();
        formData.append("category", activeProduce?.category || "Fruits");
        formData.append("image_base64", dataUrl);

        const res = await axios.post("http://localhost:8000/api/vision/inspect", formData);
        const feat = res.data.features || res.data;

        // Update active storage in state & localStorage
        const updated = storages.map(s => {
          if (s.id === activeStorage.id) {
            return {
              ...s,
              assignedProduce: {
                ...s.assignedProduce,
                imageUrl: dataUrl,
                produceName: feat.identified_produce || s.assignedProduce?.produceName || "Inspected Specimen",
                cvResult: feat
              }
            };
          }
          return s;
        });

        setStorages(updated);
        try {
          localStorage.setItem('smart_restaurant_storages', JSON.stringify(updated));
        } catch {}

        // Clear simulation override on real scan
        setSimulationOverrides(prev => {
          const next = { ...prev };
          delete next[activeStorage.id];
          return next;
        });

        const score = feat.visual_spoilage_score || feat.ripeness_percent || 20;
        showToast(`Image scanned for ${activeStorage.name}. Detected: ${feat.identified_produce || 'Produce'} (${score}% spoilage)`);
      } catch (err) {
        console.error("Scan error:", err);
        showToast("Error processing image scan with backend.");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // ESP32-CAM Snapshot Pull
  const handlePullEsp32 = async () => {
    const esp32Url = localStorage.getItem("esp32_cam_url") || "http://172.20.10.2/capture";
    setIsPullingEsp32(true);
    try {
      const res = await axios.post("http://localhost:8000/api/vision/esp32/capture", {
        camera_url: esp32Url,
        category: activeProduce?.category || "Fruits",
        container_id: activeStorage.name
      });
      const data = res.data;
      const feat = data.features || data;

      const updated = storages.map(s => {
        if (s.id === activeStorage.id) {
          return {
            ...s,
            assignedProduce: {
              ...s.assignedProduce,
              imageUrl: data.image_base64 || s.assignedProduce?.imageUrl,
              produceName: feat.identified_produce || s.assignedProduce?.produceName,
              cvResult: feat
            }
          };
        }
        return s;
      });

      setStorages(updated);
      try {
        localStorage.setItem('smart_restaurant_storages', JSON.stringify(updated));
      } catch {}

      showToast(`Snapshot pulled from ESP32 node for ${activeStorage.name}!`);
    } catch (err) {
      console.error("ESP32 pull error:", err);
      showToast("Could not connect to ESP32 node. Check Wi-Fi connection.");
    } finally {
      setIsPullingEsp32(false);
    }
  };

  // Toggle ~75% Spoilage Simulation for Testing
  const handleToggleSimulation = () => {
    if (simulationOverrides[activeStorage.id]) {
      // Reset
      setSimulationOverrides(prev => {
        const next = { ...prev };
        delete next[activeStorage.id];
        return next;
      });
      showToast(`Reset ${activeStorage.name} to real live inspection data.`);
    } else {
      // Simulate 76% spoilage
      setSimulationOverrides(prev => ({
        ...prev,
        [activeStorage.id]: {
          spoilageScore: 76.5,
          rslHours: 14.0,
          ripenessStage: "Overripe / Senescent Cuticle",
          riskLevel: "High"
        }
      }));
      showToast(`Simulated ~76% spoilage threshold for ${activeStorage.name}. Culinary divert activated!`);
    }
  };

  // Generate the active culinary directive if near spoil
  const activeDirective = isNearSpoil 
    ? generateCulinaryDirective(
        activeProduce?.produceName || "Food Specimen",
        activeProduce?.category || "Fruits",
        effectiveSpoilageScore,
        effectiveRslHours,
        activeStorage.name
      )
    : null;

  const isDispatched = dispatchedMap[activeStorage.id]?.dispatched;
  const dispatchTime = dispatchedMap[activeStorage.id]?.time;

  return (
    <div className="glass-panel p-4 sm:p-6 rounded-2xl space-y-5 bg-white dark:bg-slate-900 border border-[#d1ded5] dark:border-slate-800 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl bg-slate-900 dark:bg-emerald-950 text-white text-xs font-bold shadow-2xl border border-emerald-500/50 flex items-center gap-2.5 animate-slide-down">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#e1eae4] dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-600/20 flex-shrink-0">
            <ChefHat className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                AI Culinary Divert & Recipe Directives
              </h2>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-600" /> ~75% Spoilage Threshold Trigger
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Dynamically evaluates camera feeds, user uploads, ESP32 captures, and climate telemetry across separate storages.
            </p>
          </div>
        </div>

        {/* Real-Time Action Triggers for Active Storage */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 cursor-pointer transition-colors"
            title="Upload an image to inspect produce in this storage"
          >
            <Upload className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
            <span>{isUploading ? "Scanning Image..." : "Upload Image"}</span>
          </button>

          <button
            type="button"
            onClick={handlePullEsp32}
            disabled={isPullingEsp32}
            className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 text-sky-800 dark:text-sky-300 text-xs font-bold flex items-center gap-1.5 border border-sky-300 dark:border-sky-800 cursor-pointer transition-colors"
            title="Pull live frame from ESP32 camera node"
          >
            <Cpu className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
            <span>{isPullingEsp32 ? "Pulling..." : "ESP32 Snapshot"}</span>
          </button>

          <button
            type="button"
            onClick={handleToggleSimulation}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              simulationOverrides[activeStorage.id]
                ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600 shadow-sm'
                : 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800'
            }`}
            title="Toggle simulated ~75% spoilage trigger to test recipe generation"
          >
            <Flame className="h-3.5 w-3.5" />
            <span>{simulationOverrides[activeStorage.id] ? "Reset to Live Data" : "Test ~75% Trigger"}</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          STORAGE CHAMBER SWITCHER (STORAGE 1 vs STORAGE 2 SEPARATELY)
          ───────────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Boxes className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            Select Storage Chamber to Inspect:
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Each storage has independent sensor telemetry & produce monitoring
          </span>
        </div>

        {/* Storage Tabs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {storages.map((storage) => {
            const isSelected = selectedStorageId === storage.id;
            const p = storage.assignedProduce;
            const cv = p?.cvResult;
            const sim = simulationOverrides[storage.id];
            const currentSpoilage = sim !== undefined 
              ? sim.spoilageScore 
              : (cv?.visual_spoilage_score || cv?.ripeness_percent || 15);
            const isStorageSpoiling = currentSpoilage >= 70.0 || (cv?.risk_level === 'High' || cv?.risk_level === 'Critical');

            return (
              <button
                key={storage.id}
                type="button"
                onClick={() => setSelectedStorageId(storage.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-500 shadow-md ring-1 ring-emerald-500/40'
                    : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                }`}
              >
                {/* Active Indicator Top Edge */}
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-amber-500" />
                )}

                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                      {p?.cvResult?.produce_icon || (p?.category === "Fruits" ? "🍎" : "🥕")}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {storage.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {p?.produceName || "Assigned Produce"}
                      </div>
                    </div>
                  </div>

                  {/* Spoilage Status Badge */}
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border flex-shrink-0 ${
                    isStorageSpoiling
                      ? 'bg-rose-100 text-rose-950 border-rose-300 dark:bg-rose-950 dark:text-rose-200 animate-pulse'
                      : 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200'
                  }`}>
                    {isStorageSpoiling ? `~${Math.round(currentSpoilage)}% Spoilage (Divert!)` : `${Math.round(currentSpoilage)}% Safe`}
                  </span>
                </div>

                {/* Storage Telemetry Mini-Bar */}
                <div className="grid grid-cols-3 gap-1 py-1 px-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700 text-[10px] text-slate-600 dark:text-slate-300 font-semibold mt-2">
                  <div className="flex items-center gap-1">
                    <Thermometer className="h-3 w-3 text-rose-500" />
                    <span>{storage.current_temp}°C</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets className="h-3 w-3 text-sky-500" />
                    <span>{storage.current_humidity}%</span>
                  </div>
                  <div className="flex items-center gap-1 truncate text-emerald-700 dark:text-emerald-400 font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="truncate">{storage.status}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ACTIVE STORAGE LIVE STATUS & CULINARY DIRECTIVE SECTION
          ───────────────────────────────────────────────────────────── */}
      <div className="pt-2 border-t border-[#e1eae4] dark:border-slate-800 space-y-4">
        
        {/* Active Storage Chamber Header Banner */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-750 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-3xl shadow-2xs flex-shrink-0">
              {activeProduce?.cvResult?.produce_icon || (activeProduce?.category === "Fruits" ? "🍎" : "🥕")}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {activeStorage.name} • Monitored Batch:
                </span>
                <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {activeProduce?.produceName || "Perishable Stock"}
                </span>
                {simulationOverrides[activeStorage.id] && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                    Simulation Override Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Chamber Category: <span className="font-semibold text-slate-800 dark:text-slate-200">{activeStorage.category}</span> • Hardware Node: <span className="font-mono text-emerald-700 dark:text-emerald-400">{activeStorage.node_id}</span>
              </p>
            </div>
          </div>

          {/* Spoilage Index Gauge Box */}
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs self-start md:self-auto">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Live Spoilage Index</span>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-xl sm:text-2xl font-black ${
                  effectiveSpoilageScore >= 70 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'
                }`}>
                  {effectiveSpoilageScore}%
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  (~{effectiveRslHours}h left)
                </span>
              </div>
            </div>
            <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  effectiveSpoilageScore >= 70 ? 'bg-rose-500' : (effectiveSpoilageScore >= 40 ? 'bg-amber-500' : 'bg-emerald-500')
                }`}
                style={{ width: `${Math.min(100, effectiveSpoilageScore)}%` }}
              />
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            CASE A: SPOILAGE REACHED ~75% -> GENERATE & DISPLAY CHEF RECIPE
            ───────────────────────────────────────────────────────────── */}
        {isNearSpoil && activeDirective ? (
          <div className="space-y-4 animate-fade-in">
            
            {/* Urgent Divert Alert Header */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 flex items-start justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200 flex-shrink-0 mt-0.5">
                  <Flame className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-amber-950 dark:text-amber-100 flex items-center gap-2">
                    <span>Spoilage Threshold Reached ({effectiveSpoilageScore}%) — Immediate Culinary Divert Prescribed!</span>
                  </h4>
                  <p className="text-xs text-amber-900/90 dark:text-amber-300 font-medium mt-0.5 leading-relaxed">
                    {activeDirective.chefDirective}
                  </p>
                </div>
              </div>

              <div className="flex-shrink-0 text-right hidden sm:block">
                <span className="text-[10px] font-bold uppercase text-amber-800 dark:text-amber-400 block">Inventory Value</span>
                <span className="text-base font-black text-amber-950 dark:text-amber-100">${activeDirective.wasteCost.toFixed(2)} Protected</span>
              </div>
            </div>

            {/* Generated Chef Recipe Directives Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-850 border border-emerald-300 dark:border-emerald-700/80 shadow-md space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                      Recommended Chef Action
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      Station: <strong className="text-slate-900 dark:text-white">{activeDirective.station}</strong>
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
                    {activeDirective.recipeTitle}
                  </h3>
                </div>

                {/* Dispatch Button */}
                <button
                  type="button"
                  onClick={(e) => handleDispatchKDS(activeDirective, e)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                    isDispatched
                      ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white active:scale-95'
                  }`}
                >
                  {isDispatched ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Dispatched to KDS ({dispatchTime})</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Dispatch to Kitchen KDS</span>
                    </>
                  )}
                </button>
              </div>

              {/* Recipe Highlights Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">Prep Time</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{activeDirective.prepTimeMinutes} Mins</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">Batch Yield</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{activeDirective.yieldPortions}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">Shelf-Life Extended</span>
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-400">{activeDirective.extendedShelfLife}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">Food Cost Protected</span>
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-400">${activeDirective.wasteCost.toFixed(2)}</span>
                </div>
              </div>

              {/* Commercial Prep Steps */}
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white block">
                  Kitchen Prep Steps for {activeProduce?.produceName}:
                </span>
                <div className="space-y-2">
                  {activeDirective.prepSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                      <span className="h-5 w-5 rounded-full bg-emerald-700 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Storage & Preservation Tip */}
              <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-950 dark:text-emerald-200">
                <span className="font-black text-emerald-900 dark:text-emerald-300">Preservation Note: </span>
                {activeDirective.storageTip}
              </div>

            </div>

          </div>
        ) : (
          /* ─────────────────────────────────────────────────────────────
              CASE B: FRESH (< 70-75%) -> SHOW REASSURING OPTIMAL STATUS
              ───────────────────────────────────────────────────────────── */
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-center space-y-4 animate-fade-in shadow-2xs">
            
            <div className="mx-auto h-14 w-14 rounded-3xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shadow-sm">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {activeStorage.name}: Optimal Quality & Safe
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                <strong className="text-slate-800 dark:text-slate-200">{activeProduce?.produceName}</strong> is currently at <span className="text-emerald-700 dark:text-emerald-400 font-black">{effectiveSpoilageScore}% spoilage index</span> with <span className="font-bold">{effectiveRslHours} hours</span> remaining shelf-life.
              </p>
            </div>

            {/* Explanation of Trigger */}
            <div className="max-w-lg mx-auto p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 text-left space-y-1.5">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Automatic AI Recipe Trigger Policy:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                No urgent culinary divert is needed right now. The AI will automatically synthesize zero-waste recipes for this storage when:
              </p>
              <ul className="text-[11px] space-y-1 list-disc list-inside text-slate-700 dark:text-slate-300 font-medium">
                <li>You upload an inspection image showing tissue softening/browning (~75% spoilage).</li>
                <li>The ESP32 camera node captures produce reaching overripe stage.</li>
                <li>Chamber sensors detect severe heat or VOC/ethylene gas spikes.</li>
              </ul>
            </div>

            {/* Test Action Trigger Button */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 cursor-pointer transition-colors"
              >
                <Upload className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                <span>Upload Overripe Photo to Test Trigger</span>
              </button>

              <button
                type="button"
                onClick={handleToggleSimulation}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Flame className="h-3.5 w-3.5" />
                <span>Simulate ~75% Spoilage Trigger</span>
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
