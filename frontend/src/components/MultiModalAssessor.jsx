import React, { useState, useEffect } from 'react';
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
  Layers
} from 'lucide-react';
import axios from 'axios';

// Comprehensive Culinary Recipe & Food Waste Divert Database
const CULINARY_DIVERT_DATABASE = [
  {
    id: "rec-mango",
    produceName: "Karthakolomban / Keitt Mango",
    category: "Fruits",
    icon: "🥭",
    storageLocation: "Storage 1: Tropical Chiller",
    storageHours: 72,
    rslHours: 14.0,
    ripenessStage: "Overripe / Softening Cuticle",
    riskLevel: "High",
    wasteCost: 38.40,
    recipeTitle: "Fresh Mango Nectar, Smoothies & Dessert Coulis",
    station: "Bar & Beverage / Dessert Station",
    prepTimeMinutes: 15,
    yieldPortions: "12 - 14 Servings",
    extendedShelfLife: "+5 Days Chilled / +3 Months Frozen",
    urgency: "Urgent (Prepare Today)",
    chefDirective: "High ethylene degassing and tissue softening detected. Divert entire crate immediately before fermentation starts.",
    ingredients: [
      "Overripe mango flesh (approx. 2.5 kg)",
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
  },
  {
    id: "rec-banana",
    produceName: "Ambul Kesel / Cavendish Banana",
    category: "Fruits",
    icon: "🍌",
    storageLocation: "Storage 1: Tropical Chiller",
    storageHours: 96,
    rslHours: 16.5,
    ripenessStage: "Senescent / Tyrosine Sugar Spots (Grade B)",
    riskLevel: "High",
    wasteCost: 24.50,
    recipeTitle: "Spiced Artisan Banana Bread & Breakfast Parfait",
    station: "Bakery & Pastry Counter",
    prepTimeMinutes: 25,
    yieldPortions: "3 Signature Loaves (24 Slices)",
    extendedShelfLife: "+4 Days Baked / +60 Days Frozen",
    urgency: "Urgent (Bake Today)",
    chefDirective: "Starch fully converted to natural fructose. Peak natural sweetness makes this ideal for zero-sugar added baking.",
    ingredients: [
      "Overripe bananas (8 - 10 medium)",
      "Unsalted butter, melted (120 g)",
      "Dark brown sugar (150 g)",
      "Ceylon cinnamon & ground nutmeg (1.5 tsp)",
      "Flour, baking soda, and eggs"
    ],
    prepSteps: [
      "Mash bananas with a fork; their high moisture will create an extra tender crumb.",
      "Fold into batter with Ceylon cinnamon and fold gently with roasted walnuts.",
      "Bake at 175°C for 50 minutes until golden brown.",
      "Slice remaining bananas into rounds, toss in lemon juice, and freeze flat on sheet trays for morning smoothie station."
    ],
    storageTip: "Wrap cooled loaves in plastic wrap; flavor intensifies on day 2."
  },
  {
    id: "rec-strawberry",
    produceName: "Fresh Highland Strawberries",
    category: "Fruits",
    icon: "🍓",
    storageLocation: "Storage 1: Tropical Chiller",
    storageHours: 84,
    rslHours: 10.0,
    ripenessStage: "Softening / High Moisture Breakdown",
    riskLevel: "Critical",
    wasteCost: 32.00,
    recipeTitle: "Warm Strawberry-Basil Compote & Waffle Glaze",
    station: "Morning Grill & Dessert Bar",
    prepTimeMinutes: 12,
    yieldPortions: "10 Portions",
    extendedShelfLife: "+6 Days Jarred & Chilled",
    urgency: "Immediate Action (< 12h)",
    chefDirective: "Cellular walls softening rapidly. Immediate heat reduction locks pectin and stops microbial decomposition.",
    ingredients: [
      "Soft strawberries, hulled (1.2 kg)",
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
  },
  {
    id: "rec-tomato",
    produceName: "Local Vine Tomatoes",
    category: "Vegetables",
    icon: "🍅",
    storageLocation: "Storage 1: Tropical Chiller",
    storageHours: 65,
    rslHours: 18.0,
    ripenessStage: "Overripe / Deep Lycopene Softening",
    riskLevel: "High",
    wasteCost: 28.50,
    recipeTitle: "Slow-Roasted Garlic-Herb Tomato Marinara Base",
    station: "Hot Line & Sauté Station",
    prepTimeMinutes: 35,
    yieldPortions: "16 - 18 Servings (2.5 Liters)",
    extendedShelfLife: "+7 Days Chilled / +6 Months Frozen",
    urgency: "Urgent (Cook Today)",
    chefDirective: "High acidity and natural sugars are at their absolute culinary peak. Perfect for savory reduction sauces.",
    ingredients: [
      "Overripe tomatoes, quartered (3 kg)",
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
  },
  {
    id: "rec-lettuce",
    produceName: "Romaine Lettuce & Crisper Greens",
    category: "Vegetables",
    icon: "🥬",
    storageLocation: "Storage 1: Tropical Chiller",
    storageHours: 48,
    rslHours: 22.0,
    ripenessStage: "Dehydrated / Edge Wilting",
    riskLevel: "Medium",
    wasteCost: 19.80,
    recipeTitle: "Velvety Green Herb Soup & Vegetable Stock Reduction",
    station: "Prep Kitchen & Soup Station",
    prepTimeMinutes: 20,
    yieldPortions: "12 Bowls",
    extendedShelfLife: "+4 Days Chilled / +2 Months Frozen",
    urgency: "Prepare in 24h",
    chefDirective: "Loss of crispness makes it unsuitable for Caesar salads, but rich chlorophyll and dietary fiber make exquisite soups.",
    ingredients: [
      "Wilted lettuce & greens (1.5 kg)",
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
  },
  {
    id: "rec-carrot",
    produceName: "Nuwara Eliya Fresh Carrots",
    category: "Vegetables",
    icon: "🥕",
    storageLocation: "Storage 1: Tropical Chiller",
    storageHours: 120,
    rslHours: 42.0,
    ripenessStage: "Surface Softening / Moisture Loss",
    riskLevel: "Medium",
    wasteCost: 22.00,
    recipeTitle: "Pickled Ginger-Carrot Ribbons & Slaw Topping",
    station: "Cold Larder & Garde Manger",
    prepTimeMinutes: 15,
    yieldPortions: "25 Portions (Garnish / Slaw)",
    extendedShelfLife: "+30 Days (Pickled in Brine)",
    urgency: "Schedule this Week",
    chefDirective: "Slight root flaccidity can be completely reversed by acidic pickling brine.",
    ingredients: [
      "Softened carrots, peeled (1 kg)",
      "Rice vinegar or white vinegar (300 ml)",
      "Filtered water (300 ml)",
      "Coriander seeds, fresh ginger, and sea salt"
    ],
    prepSteps: [
      "Using a mandoline or Y-peeler, shave carrots into long thin ribbons.",
      "Bring vinegar, water, sugar, and spices to a quick boil; pour hot pickling liquid over carrot ribbons.",
      "Allow to cool to room temperature; the acidity crisps the carrots back to a crunch.",
      "Use as signature condiment on banh mi, grain bowls, and grilled chicken sandwiches."
    ],
    storageTip: "Keep submerged in brine in glass jars; ready to serve in 2 hours."
  }
];

export default function MultiModalAssessor({ currentVisionFeatures, selectedZone }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStationFilter, setSelectedStationFilter] = useState("all");
  const [selectedUrgencyFilter, setSelectedUrgencyFilter] = useState("all");
  const [dispatchedMap, setDispatchedMap] = useState({});
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Custom AI Generator State
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [generatorForm, setGeneratorForm] = useState({
    ingredient: "Pineapple",
    category: "Fruits",
    condition: "Overripe / High Acidity",
    prepType: "Bar & Beverage"
  });
  const [generatedRecipe, setGeneratedRecipe] = useState(null);

  // Sync with current vision inspection if provided
  useEffect(() => {
    if (currentVisionFeatures?.identified_produce) {
      // Find matching item in database to spotlight
      const produceName = currentVisionFeatures.identified_produce.toLowerCase();
      const match = CULINARY_DIVERT_DATABASE.find(r => r.produceName.toLowerCase().includes(produceName));
      if (match) {
        setSearchTerm(currentVisionFeatures.identified_produce);
      }
    }
  }, [currentVisionFeatures]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleDispatchKDS = (recipe, e) => {
    e.stopPropagation();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setDispatchedMap(prev => ({
      ...prev,
      [recipe.id]: {
        dispatched: true,
        time: time
      }
    }));
    showToast(`✓ Recipe "${recipe.recipeTitle}" dispatched to Kitchen KDS (${recipe.station})!`);
  };

  const handleGenerateCustomRecipe = (e) => {
    e.preventDefault();
    const ing = generatorForm.ingredient.trim() || "Perishable Produce";
    const customRecipe = {
      id: `custom-${Date.now()}`,
      produceName: ing,
      category: generatorForm.category,
      icon: generatorForm.category === "Fruits" ? "🍍" : "🥗",
      storageLocation: "Kitchen Cold Storage",
      rslHours: 12.0,
      ripenessStage: generatorForm.condition,
      riskLevel: "High",
      wasteCost: 35.00,
      recipeTitle: `AI Chef Special: ${ing} Culinary Transformation`,
      station: generatorForm.prepType,
      prepTimeMinutes: 20,
      yieldPortions: "10 - 12 Servings",
      extendedShelfLife: "+5 Days Refrigerated / +2 Months Frozen",
      urgency: "Urgent (Prepare Today)",
      chefDirective: `Custom zero-waste recipe generated for ${ing} in ${generatorForm.condition} state. Prioritize culinary reduction.`,
      ingredients: [
        `${ing} (approx. 1.8 kg)`,
        "Citrus balancer (lime or lemon juice, 50 ml)",
        "Aromatic seasoning (garlic, shallots, or ginger)",
        "Cooking oil or reduction stock"
      ],
      prepSteps: [
        `Trim and sort ${ing}; discard bruised or damaged surface areas.`,
        `Process according to ${generatorForm.prepType}: blend for beverage/coulis, or roast/sauté for sauce base.`,
        "Season with citrus balancer to stabilize acidity and inhibit bacterial oxidation.",
        "Portion into commercial gastronorms, label with prep date, and store at 2°C."
      ],
      storageTip: "Blast chill to < 4°C within 90 minutes of prep."
    };
    setGeneratedRecipe(customRecipe);
  };

  // Filter recipes
  const filteredRecipes = CULINARY_DIVERT_DATABASE.filter(r => {
    const matchesSearch = searchTerm.trim() === "" ||
      r.produceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.recipeTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.station.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStation = selectedStationFilter === "all" || r.station.toLowerCase().includes(selectedStationFilter.toLowerCase());
    
    const matchesUrgency = selectedUrgencyFilter === "all" ||
      (selectedUrgencyFilter === "urgent" && r.rslHours <= 18) ||
      (selectedUrgencyFilter === "moderate" && r.rslHours > 18);

    return matchesSearch && matchesStation && matchesUrgency;
  });

  // Calculate Aggregates
  const totalCostSaved = CULINARY_DIVERT_DATABASE.reduce((acc, cur) => acc + cur.wasteCost, 0);
  const urgentCount = CULINARY_DIVERT_DATABASE.filter(r => r.rslHours <= 18).length;

  return (
    <div className="glass-panel p-4 sm:p-6 rounded-2xl space-y-5 bg-white dark:bg-slate-900 border border-[#d1ded5] dark:border-slate-800 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl bg-slate-900 dark:bg-emerald-950 text-white text-xs font-bold shadow-2xl border border-emerald-500/50 flex items-center gap-2.5 animate-slide-down">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#e1eae4] dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-600/20 flex-shrink-0">
              <ChefHat className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  AI Culinary Divert & Recipe Directives
                </h2>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-600" /> Zero-Waste Kitchen Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Proactive recipe transformations for near-spoilage produce detected in Cold Storage chambers.
              </p>
            </div>
          </div>
        </div>

        {/* Action Trigger */}
        <div className="flex items-center gap-2 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setIsGeneratorOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 active:scale-95 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-emerald-200" />
            <span>Generate Custom AI Recipe</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/40 dark:from-slate-850 dark:to-slate-800 border border-amber-200 dark:border-amber-900/40">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-bold">
            <span>Urgent Kitchen Diverts</span>
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">
            {urgentCount} <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Batches</span>
          </div>
          <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold block mt-0.5">
            Consume / Cook in &lt; 24h
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/40 dark:from-slate-850 dark:to-slate-800 border border-emerald-200 dark:border-emerald-900/40">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-bold">
            <span>Potential Waste Prevented</span>
            <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
            ${totalCostSaved.toFixed(2)}
          </div>
          <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold block mt-0.5">
            Recovered food inventory
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50/40 dark:from-slate-850 dark:to-slate-800 border border-sky-200 dark:border-sky-900/40">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-bold">
            <span>Avg. Shelf-Life Extended</span>
            <Clock className="h-3.5 w-3.5 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-sky-700 dark:text-sky-400 mt-1">
            +5.2 <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Days</span>
          </div>
          <span className="text-[10px] text-sky-800 dark:text-sky-300 font-bold block mt-0.5">
            Via culinary transformation
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50/40 dark:from-slate-850 dark:to-slate-800 border border-purple-200 dark:border-purple-900/40">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-bold">
            <span>Active KDS Directives</span>
            <Send className="h-3.5 w-3.5 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700 dark:text-purple-400 mt-1">
            {Object.keys(dispatchedMap).length} <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Live</span>
          </div>
          <span className="text-[10px] text-purple-800 dark:text-purple-300 font-bold block mt-0.5">
            Dispatched to prep cooks
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search produce (e.g. mango, banana, tomato, soup)..."
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-600"
          />
        </div>

        {/* Station Filter */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-500 whitespace-nowrap">Station:</span>
          <select
            value={selectedStationFilter}
            onChange={(e) => setSelectedStationFilter(e.target.value)}
            className="px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-emerald-600"
          >
            <option value="all">All Kitchen Stations</option>
            <option value="bar">Bar & Beverage Station</option>
            <option value="bakery">Bakery & Pastry Counter</option>
            <option value="grill">Morning Grill / Dessert Bar</option>
            <option value="hot line">Hot Line / Sauté Station</option>
            <option value="prep">Prep Kitchen & Soup</option>
            <option value="cold">Cold Larder & Salads</option>
          </select>
        </div>

        {/* Urgency Filter */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-500 whitespace-nowrap">Urgency:</span>
          <select
            value={selectedUrgencyFilter}
            onChange={(e) => setSelectedUrgencyFilter(e.target.value)}
            className="px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-emerald-600"
          >
            <option value="all">All Urgencies</option>
            <option value="urgent">Urgent (&lt; 18h RSL)</option>
            <option value="moderate">Moderate (&gt; 18h RSL)</option>
          </select>
        </div>

      </div>

      {/* Culinary Divert Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecipes.map((recipe) => {
          const isDispatched = dispatchedMap[recipe.id]?.dispatched;
          const dispatchTime = dispatchedMap[recipe.id]?.time;

          return (
            <div
              key={recipe.id}
              onClick={() => setSelectedRecipeDetail(recipe)}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-750 hover:border-emerald-400 dark:hover:border-emerald-600 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group relative overflow-hidden"
            >
              {/* Top Accent Line */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                recipe.riskLevel === 'Critical' 
                  ? 'bg-rose-500' 
                  : (recipe.rslHours <= 18 ? 'bg-amber-500' : 'bg-emerald-500')
              }`} />

              <div>
                {/* Header row with produce & urgency */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-2xl p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                      {recipe.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {recipe.produceName}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {recipe.storageLocation}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border flex-shrink-0 ${
                    recipe.riskLevel === 'Critical'
                      ? 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-200'
                      : (recipe.rslHours <= 18
                          ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200'
                          : 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200')
                  }`}>
                    {recipe.urgency}
                  </span>
                </div>

                {/* Recipe Title & Station */}
                <div className="mt-1">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {recipe.recipeTitle}
                  </h3>
                  <div className="text-[11px] font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                    <UtensilsCrossed className="h-3 w-3" />
                    <span>{recipe.station}</span>
                  </div>
                </div>

                {/* Directive Summary */}
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                  {recipe.chefDirective}
                </p>

                {/* Value Metrics Pills */}
                <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-[11px]">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Extended Life</span>
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-400">{recipe.extendedShelfLife}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Inventory Protected</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">${recipe.wasteCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-slate-500">
                  Yield: {recipe.yieldPortions}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => handleDispatchKDS(recipe, e)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      isDispatched
                        ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700'
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white active:scale-95'
                    }`}
                  >
                    {isDispatched ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>KDS Sent ({dispatchTime})</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Dispatch to KDS</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipeDetail && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-slide-up max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-2xl bg-slate-100 dark:bg-slate-800">
                  {selectedRecipeDetail.icon}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {selectedRecipeDetail.recipeTitle}
                    </h3>
                  </div>
                  <div className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mt-0.5">
                    <UtensilsCrossed className="h-3.5 w-3.5" />
                    <span>Station: {selectedRecipeDetail.station}</span>
                    <span>• {selectedRecipeDetail.prepTimeMinutes} mins prep</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecipeDetail(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Directive Box */}
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs text-amber-950 dark:text-amber-200 font-medium">
              <span className="font-extrabold block text-amber-900 dark:text-amber-300 mb-1 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Chef Spoilage Prevention Directive:
              </span>
              {selectedRecipeDetail.chefDirective}
            </div>

            {/* Recipe Ingredients */}
            <div className="space-y-1.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white block">
                Required Kitchen Ingredients:
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                {selectedRecipeDetail.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{ing}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white block">
                Commercial Kitchen Prep Steps:
              </span>
              <ol className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {selectedRecipeDetail.prepSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700">
                    <span className="h-5 w-5 rounded-full bg-emerald-700 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Food Safety & Storage Tip */}
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
              <span className="font-bold text-slate-900 dark:text-white">Preservation Tip: </span>
              {selectedRecipeDetail.storageTip}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                Protects ${selectedRecipeDetail.wasteCost.toFixed(2)} in food inventory
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRecipeDetail(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    handleDispatchKDS(selectedRecipeDetail, e);
                    setSelectedRecipeDetail(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Dispatch to KDS</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Custom AI Recipe Generator Modal */}
      {isGeneratorOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-slide-up max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Generate Zero-Waste Chef Directive
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Input any surplus or near-spoilage ingredient to get an AI recipe
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsGeneratorOpen(false);
                  setGeneratedRecipe(null);
                }}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!generatedRecipe ? (
              <form onSubmit={handleGenerateCustomRecipe} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block">
                    Perishable Ingredient Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pineapple, Avocado, Papaya, Bell Pepper..."
                    value={generatorForm.ingredient}
                    onChange={(e) => setGeneratorForm({ ...generatorForm, ingredient: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block">
                      Food Category
                    </label>
                    <select
                      value={generatorForm.category}
                      onChange={(e) => setGeneratorForm({ ...generatorForm, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-emerald-600"
                    >
                      <option value="Fruits">Fruits</option>
                      <option value="Vegetables">Vegetables</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block">
                      Target Kitchen Station
                    </label>
                    <select
                      value={generatorForm.prepType}
                      onChange={(e) => setGeneratorForm({ ...generatorForm, prepType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-emerald-600"
                    >
                      <option value="Bar & Beverage Station">Bar & Beverage (Juices/Cocktails)</option>
                      <option value="Bakery & Pastry Counter">Bakery & Pastry (Breads/Tarts)</option>
                      <option value="Hot Line & Sauté Station">Hot Line (Sauces/Reductions)</option>
                      <option value="Prep Kitchen & Soup">Prep Kitchen (Soups/Stocks)</option>
                      <option value="Cold Larder & Salads">Cold Larder (Pickles/Condiments)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block">
                    Current Condition / Spoilage State
                  </label>
                  <select
                    value={generatorForm.condition}
                    onChange={(e) => setGeneratorForm({ ...generatorForm, condition: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Overripe / Softening Cuticle">Overripe / Softening Cuticle</option>
                    <option value="High Acidity / Bruised Peel">High Acidity / Bruised Peel</option>
                    <option value="Wilted / Moisture Loss">Wilted / Moisture Loss</option>
                    <option value="Surplus Stock (Slow Moving)">Surplus Stock (Slow Moving)</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsGeneratorOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Recipe Directive</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                      {generatedRecipe.recipeTitle}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-950 dark:text-emerald-200">
                      {generatedRecipe.station}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-950 dark:text-emerald-300 font-medium">
                    {generatedRecipe.chefDirective}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase text-slate-900 dark:text-white">Commercial Prep Directives:</span>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {generatedRecipe.prepSteps.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <Check className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setGeneratedRecipe(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Generate Another
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      handleDispatchKDS(generatedRecipe, e);
                      setIsGeneratorOpen(false);
                      setGeneratedRecipe(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Dispatch to Kitchen KDS</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
