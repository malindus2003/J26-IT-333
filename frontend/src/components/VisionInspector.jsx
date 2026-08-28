import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Video, 
  VideoOff, 
  Sliders, 
  XCircle, 
  Layers, 
  ArrowRight, 
  ShieldAlert, 
  Apple, 
  Carrot, 
  Milk, 
  Fish, 
  Beef,
  Clock,
  Hourglass,
  Calendar,
  Zap,
  TrendingDown,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Grid,
  List,
  X,
  Check
} from 'lucide-react';
import axios from 'axios';

// Comprehensive high-resolution photographic presets across ALL 5 food categories
// Automatic SVG fallback generator for offline / broken image handling
const getFallbackSvg = (name, category, icon) => {
  const bg = category === 'Fruits' ? '%23059669' :
             category === 'Vegetables' ? '%2310b981' :
             category === 'Dairy' ? '%230284c7' :
             category === 'Fish' ? '%230d9488' : '%23e11d48';
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="${bg}" fill-opacity="0.14"/><text x="50%" y="42%" dominant-baseline="middle" text-anchor="middle" font-size="56">${encodeURIComponent(icon || '🍎')}</text><text x="50%" y="68%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="bold" fill="%23334155">${encodeURIComponent(name || 'Food Specimen')}</text><text x="50%" y="82%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="%2364748b">${encodeURIComponent(category || 'Perishable')}</text></svg>`;
};

const SAMPLE_PRESETS = [
  // 1. Fruits (3 presets: Rotten, Overripe, Prime Fresh)
  {
    id: "strawberries_mould",
    name: "Mouldy Strawberries",
    category: "Fruits",
    icon: "🍓",
    container: "Container #C-104 (Fruit Chamber)",
    imageUrl: "/images/specimens/strawberries_mould.jpg",
    remoteFallbackUrl: "https://images.unsplash.com/photo-1543158181-e6f9f6712055?w=600&auto=format&fit=crop&q=80",
    ripeness_stage: "Spoiled / Senescent (Rotting)",
    ripeness_percent: 98,
    visual_spoilage_score: 92,
    risk_level: "Critical",
    discoloration_score: 38,
    mould_detected: true,
    mould_coverage: 14.5,
    texture_degradation: 65,
    baseline_shelf_life_hours: 120.0,
    remaining_shelf_life_hours: 0.0,
    detected_defects: [
      "Active fungal mould colony (Botrytis cinerea)",
      "Surface tissue softening & cellular collapse",
      "Enzymatic browning across 38% surface area"
    ],
    bounding_boxes: [
      { label: "MOULD SPORE PATCH (92%)", type: "spoilage", x: 28, y: 35, width: 44, height: 38, color: "#ef4444" },
      { label: "TISSUE ROT (85%)", type: "spoilage", x: 60, y: 55, width: 28, height: 26, color: "#ef4444" }
    ]
  },
  {
    id: "banana_overripe",
    name: "Overripe Brown Banana",
    category: "Fruits",
    icon: "🍌",
    container: "Container #C-102 (Fruit Chamber)",
    imageUrl: "/images/specimens/banana_overripe.jpg",
    remoteFallbackUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80",
    ripeness_stage: "Overripe (Use Immediately)",
    ripeness_percent: 85,
    visual_spoilage_score: 74,
    risk_level: "High",
    discoloration_score: 42,
    mould_detected: false,
    mould_coverage: 0.0,
    texture_degradation: 48,
    baseline_shelf_life_hours: 120.0,
    remaining_shelf_life_hours: 16.5,
    detected_defects: [
      "Extensive senescence brown spotting (tyrosine oxidation)",
      "Sugar inversion & soft pulp texture",
      "High ethylene degassing emission"
    ],
    bounding_boxes: [
      { label: "SENESCENCE BROWNING", type: "overripe", x: 25, y: 30, width: 52, height: 42, color: "#f59e0b" }
    ]
  },
  {
    id: "apple_fresh",
    name: "Fresh Crisp Green Apple",
    category: "Fruits",
    icon: "🍏",
    container: "Container #C-101 (Fruit Chamber)",
    imageUrl: "/images/specimens/apple_fresh.jpg",
    remoteFallbackUrl: "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=600&auto=format&fit=crop&q=80",
    ripeness_stage: "Optimal Ripe (Prime Quality)",
    ripeness_percent: 45,
    visual_spoilage_score: 8,
    risk_level: "Low",
    discoloration_score: 2,
    mould_detected: false,
    mould_coverage: 0.0,
    texture_degradation: 4,
    baseline_shelf_life_hours: 120.0,
    remaining_shelf_life_hours: 96.0,
    detected_defects: [],
    bounding_boxes: [
      { label: "PRIME CRISP TURGOR", type: "fresh", x: 20, y: 15, width: 60, height: 70, color: "#10b981" }
    ]
  },

  // 2. Vegetables (3 presets: Wilted, Crisp, Softening)
  {
    id: "spinach_wilted",
    name: "Wilted Yellowing Spinach",
    category: "Vegetables",
    icon: "🥬",
    container: "Container #C-205 (Veg Crisper)",
    imageUrl: "/images/specimens/spinach_wilted.jpg",
    remoteFallbackUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80",
    ripeness_stage: "Wilted / Softening (Use Today)",
    ripeness_percent: 82,
    visual_spoilage_score: 76,
    risk_level: "High",
    discoloration_score: 34,
    mould_detected: false,
    mould_coverage: 0.0,
    texture_degradation: 58,
    baseline_shelf_life_hours: 96.0,
    remaining_shelf_life_hours: 14.0,
    detected_defects: [
      "Chlorophyll breakdown (leaf chlorosis / yellowing)",
      "Severe leaf wilting and moisture loss",
      "Early leaf edge slime degradation"
    ],
    bounding_boxes: [
      { label: "CHLOROSIS / YELLOWING", type: "overripe", x: 20, y: 25, width: 58, height: 50, color: "#f59e0b" }
    ]
  },
  {
    id: "lettuce_crisp",
    name: "Fresh Romaine Lettuce",
    category: "Vegetables",
    icon: "🥗",
    container: "Container #C-201 (Veg Crisper)",
    imageUrl: "/images/specimens/lettuce_crisp.jpg",
    remoteFallbackUrl: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=600&auto=format&fit=crop&q=80",
    ripeness_stage: "Crisp & Fresh Harvest",
    ripeness_percent: 40,
    visual_spoilage_score: 10,
    risk_level: "Low",
    discoloration_score: 3,
    mould_detected: false,
    mould_coverage: 0.0,
    texture_degradation: 6,
    baseline_shelf_life_hours: 96.0,
    remaining_shelf_life_hours: 74.0,
    detected_defects: [],
    bounding_boxes: [
      { label: "FRESH HYDRATED LEAVES", type: "fresh", x: 18, y: 18, width: 64, height: 64, color: "#10b981" }
    ]
  },
  {
    id: "tomato_overripe",
    name: "Overripe Soft Tomato",
    category: "Vegetables",
    icon: "🍅",
    container: "Container #C-204 (Veg Crisper)",
    imageUrl: "/images/specimens/tomato_overripe.jpg",
    remoteFallbackUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80",
    ripeness_stage: "Overripe / Softening (Use Today)",
    ripeness_percent: 86,
    visual_spoilage_score: 70,
    risk_level: "High",
    discoloration_score: 22,
    mould_detected: false,
    mould_coverage: 0.0,
    texture_degradation: 52,
    baseline_shelf_life_hours: 96.0,
    remaining_shelf_life_hours: 18.0,
    detected_defects: [
      "Loss of skin firmness & localized bruising",
      "High carotenoid softness breakdown"
    ],
    bounding_boxes: [
      { label: "SOFTENING TISSUE", type: "overripe", x: 28, y: 25, width: 48, height: 50, color: "#f59e0b" }
    ]
  },

  // 3. Dairy (3 presets: Mouldy Cheese, Fresh Milk, Curdled Sour Cream)
  {
    id: "cheese_mouldy",
    name: "Mouldy Aged Cheese",
    category: "Dairy",
    icon: "🧀",
    container: "Container #C-302 (Dairy Fridge)",
    imageUrl: "/images/specimens/cheese_mouldy.jpg",
    remoteFallbackUrl: "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=600&auto=format&fit=crop&q=80",
    ripeness_stage: "Spoiled / Sour",
    ripeness_percent: 95,
    visual_spoilage_score: 88,
    risk_level: "Critical",
    discoloration_score: 30,
    mould_detected: true,
    mould_coverage: 16.0,
    texture_degradation: 45,
    baseline_shelf_life_hours: 168.0,
    remaining_shelf_life_hours: 0.0,
    detected_defects: [
      "Uncontrolled surface fungal mycelium",
      "Yellow curd acidification"
    ],
    bounding_boxes: [
      { label: "FUNGAL MYCELIUM PATCH", type: "spoilage", x: 30, y: 30, width: 42, height: 40, color: "#ef4444" }
    ]
  },
  {
    id: "milk_fresh",
    name: "Fresh Whole Milk",
    category: "Dairy",
    icon: "🥛",
    container: "Container #C-301 (Dairy Fridge)",
    imageUrl: "/images/specimens/milk_fresh.jpg",
    remoteFallbackUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80",
    ripeness_stage: "Optimal Fresh",
    ripeness_percent: 25,
    visual_spoilage_score: 6,
    risk_level: "Low",
    discoloration_score: 1,
    mould_detected: false,
    mould_coverage: 0.0,
    texture_degradation: 2,
    baseline_shelf_life_hours: 168.0,
    remaining_shelf_life_hours: 142.0,
    detected_defects: [],
    bounding_boxes: [
      { label: "STABLE LACTIC HOMOGENEITY", type: "fresh", x: 20, y: 20, width: 60, height: 60, color: "#10b981" }
    ]
  },
  {
    id: "yogurt_curdled",
    name: "Curdled Sour Cream / Milk",
    category: "Dairy",
    icon: "🥣",
    container: "Container #C-304 (Dairy Fridge)",
    imageUrl: "/images/specimens/yogurt_curdled.jpg",
    remoteFallbackUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80",
    ripeness_stage: "Curdled / Sour Spoilage",
    ripeness_percent: 92,
    visual_spoilage_score: 84,
    risk_level: "Critical",
    discoloration_score: 28,
    mould_detected: false,
    mould_coverage: 0.0,
    texture_degradation: 60,
    baseline_shelf_life_hours: 96.0,
    remaining_shelf_life_hours: 0.0,
    detected_defects: [
      "Severe whey syneresis & casein curd separation",
      "Lactic acidification coagulum breakdown"
    ],
    bounding_boxes: [
      { label: "CASEIN CURDLING SEPARATION", type: "spoilage", x: 25, y: 30, width: 50, height: 45, color: "#ef4444" }
    ]
  },

  // 4. Fish & Seafood (3 presets: Fresh Salmon, Spoiled Tuna, Fresh Prawns)
  {
    id: "salmon_fresh",
    name: "Fresh Atlantic Salmon",
    category: "Fish",
    icon: "🐟",
    container: "Container #C-501 (Seafood Ice)",
    imageUrl: "/images/specimens/salmon_fresh.jpg",
    remoteFallbackUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80",
    ripeness_stage: "Prime Sea-Fresh",
    ripeness_percent: 30,
    visual_spoilage_score: 12,
    risk_level: "Low",
    discoloration_score: 4,
    mould_detected: false,
    mould_coverage: 0.0,
    texture_degradation: 8,
    baseline_shelf_life_hours: 48.0,
    remaining_shelf_life_hours: 38.0,
    detected_defects: [],
    bounding_boxes: [
      { label: "OPTIMAL ASTAXANTHIN TRANSLUCENCY", type: "fresh", x: 22, y: 20, width: 56, height: 60, color: "#10b981" }
    ]
  },
  {
    id: "tuna_oxidized",
    name: "Oxidized Grey Tuna Steak",
    category: "Fish",
    icon: "🐟",
    container: "Container #C-503 (Seafood Ice)",
    imageUrl: "/images/specimens/tuna_oxidized.jpg",
    remoteFallbackUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80",
    ripeness_stage: "Oxidized / Bacterial Spoilage",
    ripeness_percent: 94,
    visual_spoilage_score: 88,
    risk_level: "Critical",
    discoloration_score: 46,
    mould_detected: false,
    mould_coverage: 0.0,
    texture_degradation: 68,
    baseline_shelf_life_hours: 48.0,
    remaining_shelf_life_hours: 0.0,
    detected_defects: [
      "Deep myoglobin oxidation (grey-brown coloration)",
      "Volatile amine off-odour breakdown",
      "Muscle tissue softening & slime formation"
    ],
    bounding_boxes: [
      { label: "TMA DECOMPOSITION SPOT", type: "spoilage", x: 26, y: 30, width: 48, height: 42, color: "#ef4444" }
    ]
  },
  {
    id: "prawns_fresh",
    name: "Fresh Sea King Prawns",
    category: "Fish",
    icon: "🦐",
    container: "Container #C-502 (Seafood Ice)",
    imageUrl: "/images/specimens/prawns_fresh.jpg",
    remoteFallbackUrl: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&auto=format&fit=crop&q=80",
    ripeness_stage: "Prime Sea-Fresh",
    ripeness_percent: 28,
    visual_spoilage_score: 10,
    risk_level: "Low",
    discoloration_score: 2,
    mould_detected: false,
    mould_coverage: 0.0,
    texture_degradation: 5,
    baseline_shelf_life_hours: 48.0,
    remaining_shelf_life_hours: 40.0,
    detected_defects: [],
    bounding_boxes: [
      { label: "FIRM TRANSLUCENT EXOSKELETON", type: "fresh", x: 20, y: 22, width: 60, height: 56, color: "#10b981" }
    ]
  },

  // 5. Meat & Poultry (3 presets: Prime Beef, Fresh Chicken, Oxidized Meat)
  {
    id: "beef_fresh",
    name: "Fresh Beef Sirloin",
    category: "Meat",
    icon: "🥩",
    container: "Container #C-401 (Meat Chiller)",
    imageUrl: "/images/specimens/beef_fresh.jpg",
    remoteFallbackUrl: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&auto=format&fit=crop&q=80",
    ripeness_stage: "Fresh Cut (Optimal)",
    ripeness_percent: 35,
    visual_spoilage_score: 14,
    risk_level: "Low",
    discoloration_score: 5,
    mould_detected: false,
    mould_coverage: 0.0,
    texture_degradation: 10,
    baseline_shelf_life_hours: 96.0,
    remaining_shelf_life_hours: 76.0,
    detected_defects: [],
    bounding_boxes: [
      { label: "HEALTHY OXYMYOGLOBIN RED", type: "fresh", x: 25, y: 25, width: 50, height: 50, color: "#10b981" }
    ]
  },
  {
    id: "chicken_fresh",
    name: "Raw Fresh Chicken Breast",
    category: "Meat",
    icon: "🍗",
    container: "Container #C-402 (Meat Chiller)",
    imageUrl: "/images/specimens/chicken_fresh.jpg",
    remoteFallbackUrl: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&auto=format&fit=crop&q=80",
    ripeness_stage: "Prime Fresh Cut",
    ripeness_percent: 30,
    visual_spoilage_score: 12,
    risk_level: "Low",
    discoloration_score: 3,
    mould_detected: false,
    mould_coverage: 0.0,
    texture_degradation: 6,
    baseline_shelf_life_hours: 72.0,
    remaining_shelf_life_hours: 58.0,
    detected_defects: [],
    bounding_boxes: [
      { label: "HEALTHY PINK FLESH TURGOR", type: "fresh", x: 22, y: 20, width: 56, height: 60, color: "#10b981" }
    ]
  },
  {
    id: "meat_oxidized",
    name: "Oxidized Discolored Meat",
    category: "Meat",
    icon: "🍖",
    container: "Container #C-403 (Meat Chiller)",
    imageUrl: "/images/specimens/meat_oxidized.jpg",
    remoteFallbackUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    ripeness_stage: "Oxidized / High Spoilage Risk",
    ripeness_percent: 90,
    visual_spoilage_score: 80,
    risk_level: "High",
    discoloration_score: 44,
    mould_detected: false,
    mould_coverage: 0.0,
    texture_degradation: 55,
    baseline_shelf_life_hours: 96.0,
    remaining_shelf_life_hours: 8.5,
    detected_defects: [
      "Metmyoglobin surface discoloration (dull grey/brown)",
      "Aerobic bacterial slime degradation"
    ],
    bounding_boxes: [
      { label: "OXIDATIVE BROWNING", type: "spoilage", x: 24, y: 28, width: 55, height: 48, color: "#ef4444" }
    ]
  }
];

export default function VisionInspector({ onInspectionComplete }) {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [selectedRiskFilter, setSelectedRiskFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("compact"); // 'compact' | 'grid'
  const [specimenDropdownOpen, setSpecimenDropdownOpen] = useState(false);
  
  const [selectedPresetId, setSelectedPresetId] = useState(SAMPLE_PRESETS[0].id);
  const [previewImage, setPreviewImage] = useState(SAMPLE_PRESETS[0].imageUrl);
  const [currentContainerName, setCurrentContainerName] = useState(SAMPLE_PRESETS[0].container);
  const [analyzing, setAnalyzing] = useState(false);
  const [cvResult, setCvResult] = useState(SAMPLE_PRESETS[0]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // Interactive Dummy Simulation Slider (0% to 100%)
  const [dummyLevel, setDummyLevel] = useState(92);
  const [isManualOverride, setIsManualOverride] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const specimenDropdownRef = useRef(null);
  const carouselRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (specimenDropdownRef.current && !specimenDropdownRef.current.contains(e.target)) {
        setSpecimenDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (onInspectionComplete) {
      onInspectionComplete(SAMPLE_PRESETS[0]);
    }
    return () => {
      stopCamera();
    };
  }, []);

  const filteredPresets = SAMPLE_PRESETS.filter(p => {
    const matchesCategory = selectedCategoryFilter === "all" || p.category.toLowerCase() === selectedCategoryFilter.toLowerCase();
    const matchesRisk = selectedRiskFilter === "all" || p.risk_level.toLowerCase() === selectedRiskFilter.toLowerCase();
    const matchesSearch = searchTerm.trim() === "" ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ripeness_stage.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesRisk && matchesSearch;
  });

  const currentIndex = filteredPresets.findIndex(p => p.id === selectedPresetId);

  const handleNextPreset = () => {
    if (filteredPresets.length === 0) return;
    const nextIdx = (currentIndex + 1) % filteredPresets.length;
    handleSelectPreset(filteredPresets[nextIdx]);
  };

  const handlePrevPreset = () => {
    if (filteredPresets.length === 0) return;
    const prevIdx = (currentIndex - 1 + filteredPresets.length) % filteredPresets.length;
    handleSelectPreset(filteredPresets[prevIdx]);
  };

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleSelectPreset = (preset) => {
    stopCamera();
    setSelectedPresetId(preset.id);
    setCurrentContainerName(preset.container);
    setPreviewImage(preset.imageUrl);
    setCvResult(preset);
    setDummyLevel(preset.visual_spoilage_score);
    setIsManualOverride(false);
    setSpecimenDropdownOpen(false);

    if (onInspectionComplete) {
      onInspectionComplete(preset);
    }
  };

  const handleCategoryFilterClick = (cat) => {
    setSelectedCategoryFilter(cat);
    const matches = SAMPLE_PRESETS.filter(p => {
      const matchesCat = cat === "all" || p.category.toLowerCase() === cat.toLowerCase();
      const matchesRisk = selectedRiskFilter === "all" || p.risk_level.toLowerCase() === selectedRiskFilter.toLowerCase();
      return matchesCat && matchesRisk;
    });
    if (matches.length > 0) {
      handleSelectPreset(matches[0]);
    }
  };

  const handleFileUpload = async (e) => {
    stopCamera();
    const file = e.target.files[0];
    if (file) {
      setCurrentContainerName("Uploaded Container Photo");
      setSelectedPresetId(null);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target.result;
        setPreviewImage(dataUrl);
        await runBackendAnalysis(dataUrl, cvResult?.category || "Fruits");
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "environment" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
      setCurrentContainerName("Live Container Camera (Real-Time)");
      setSelectedPresetId(null);
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("Unable to access camera. Check device permissions or select a sample photo.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureCameraFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 400;
    canvas.height = videoRef.current.videoHeight || 300;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg");
    stopCamera();
    setPreviewImage(dataUrl);
    runBackendAnalysis(dataUrl, cvResult?.category || "Fruits");
  };

  const runBackendAnalysis = async (imageDataUrl, targetCategory) => {
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("category", targetCategory);
      formData.append("image_base64", imageDataUrl);

      const res = await axios.post("http://localhost:8000/api/vision/inspect", formData);
      setCvResult(res.data.features);
      setDummyLevel(res.data.features.visual_spoilage_score || 50);
      setIsManualOverride(false);
      if (onInspectionComplete) {
        onInspectionComplete(res.data.features);
      }
    } catch (err) {
      console.error("CV inspection error:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Dynamic Remaining Shelf-Life & Spoilage Computation
  const computeRemainingShelfLife = (val, category, isMould) => {
    const baselines = {
      "Fruits": 120.0,
      "Vegetables": 96.0,
      "Meat": 96.0,
      "Fish": 48.0,
      "Dairy": 168.0
    };
    const baseline = baselines[category] || 120.0;

    if (val >= 78 || isMould) {
      return {
        hours: 0.0,
        days: 0.0,
        percentage: 0,
        action: "EXPIRED: Quarantine & Dispose Immediately",
        safeDeadline: "Expired - Do not cook or serve",
        decayRate: "Severe degradation (> 5.2x baseline decay)"
      };
    }

    if (val < 25) {
      const h = Math.round(baseline * (1.0 - (val / 100.0) * 0.5) * 10) / 10;
      return {
        hours: h,
        days: Math.round((h / 24.0) * 10) / 10,
        percentage: Math.round(100 - val),
        action: "Optimal Quality (Standard FIFO Rotation)",
        safeDeadline: `Safe for ~${Math.round(h / 24.0)} days in cold storage`,
        decayRate: "Normal baseline metabolic aging (1.0x)"
      };
    }

    if (val < 55) {
      const h = Math.round(baseline * 0.65 * (1.0 - ((val - 25) / 30) * 0.3) * 10) / 10;
      return {
        hours: h,
        days: Math.round((h / 24.0) * 10) / 10,
        percentage: Math.round(100 - val),
        action: "Prime Culinary Quality (Cook within 2-3 days)",
        safeDeadline: `Optimal flavor peak for next ${h} hours`,
        decayRate: "Moderate respiration & ethylene activity (1.6x)"
      };
    }

    // Overripe / High Risk (55% - 77%)
    const h = Math.round(baseline * 0.22 * (1.0 - ((val - 55) / 23) * 0.6) * 10) / 10;
    return {
      hours: Math.max(2.0, h),
      days: Math.round((h / 24.0) * 10) / 10,
      percentage: Math.round(100 - val),
      action: "PRIORITY CHEF USE (Cook / Divert Today)",
      safeDeadline: `Must consume within ${Math.max(2, Math.round(h))} hours!`,
      decayRate: "Accelerated cellular breakdown (3.4x decay)"
    };
  };

  const handleDummySliderChange = (newVal) => {
    const val = Number(newVal);
    setDummyLevel(val);
    setIsManualOverride(true);

    let stage = "Optimal Ripe (Prime Quality)";
    let risk = "Low";
    let mould = false;
    let bboxes = [];
    let defects = [];

    if (val < 25) {
      stage = "Unripe / Firm";
      risk = "Low";
      bboxes = [{ label: "UNRIPE (FIRM TEXTURE)", type: "fresh", x: 25, y: 25, width: 50, height: 50, color: "#10b981" }];
    } else if (val < 55) {
      stage = "Optimal Ripe (Prime Quality)";
      risk = "Low";
      bboxes = [{ label: "OPTIMAL RIPENESS", type: "fresh", x: 20, y: 20, width: 60, height: 60, color: "#10b981" }];
    } else if (val < 78) {
      stage = "Overripe / Wilted (Use Today)";
      risk = "High";
      bboxes = [{ label: "SENESCENCE BROWNING / WILTING", type: "overripe", x: 22, y: 25, width: 56, height: 50, color: "#f59e0b" }];
      defects = ["Surface softening and enzymatic browning", "Loss of moisture / turgor"];
    } else {
      stage = "Spoiled / Rotten (Quarantine)";
      risk = "Critical";
      mould = true;
      bboxes = [
        { label: "MOULD SPORE PATCH", type: "spoilage", x: 28, y: 32, width: 44, height: 40, color: "#ef4444" },
        { label: "DEEP TISSUE ROT", type: "spoilage", x: 55, y: 50, width: 30, height: 30, color: "#ef4444" }
      ];
      defects = ["Active fungal mould growth detected", "Severe microbial decomposition", "Deleterious odour / spoilage risk"];
    }

    const updated = {
      ...cvResult,
      ripeness_stage: stage,
      ripeness_percent: val,
      visual_spoilage_score: val,
      risk_level: risk,
      discoloration_score: Math.round(val * 0.45),
      mould_detected: mould,
      mould_coverage: mould ? Math.round((val - 75) * 0.6) : 0,
      texture_degradation: Math.round(val * 0.7),
      detected_defects: defects,
      bounding_boxes: bboxes
    };

    setCvResult(updated);
    if (onInspectionComplete) {
      onInspectionComplete(updated);
    }
  };

  const getRipenessStep = (stage) => {
    if (!stage) return 2;
    const s = stage.toLowerCase();
    if (s.includes("unripe")) return 1;
    if (s.includes("optimal") || s.includes("fresh") || s.includes("prime") || s.includes("crisp")) return 2;
    if (s.includes("overripe") || s.includes("wilted") || s.includes("soft")) return 3;
    return 4; // Spoiled
  };

  const ripenessStep = cvResult ? getRipenessStep(cvResult.ripeness_stage) : 2;

  const getLevelColor = (val) => {
    if (val < 25) return { text: "text-emerald-800 dark:text-emerald-400", bg: "bg-emerald-600", border: "border-emerald-500", badge: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-300 border border-emerald-400 dark:border-emerald-600", label: "LOW RISK (UNRIPE / FIRM)", colorHex: "#059669" };
    if (val < 55) return { text: "text-emerald-800 dark:text-emerald-400", bg: "bg-emerald-600", border: "border-emerald-500", badge: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-300 border border-emerald-400 dark:border-emerald-600", label: "LOW RISK (OPTIMAL RIPE)", colorHex: "#047857" };
    if (val < 78) return { text: "text-amber-800 dark:text-amber-400", bg: "bg-amber-600", border: "border-amber-500", badge: "bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-300 border border-amber-400 dark:border-amber-600", label: "HIGH RISK (OVERRIPE / WILTED)", colorHex: "#d97706" };
    return { text: "text-rose-800 dark:text-rose-400", bg: "bg-rose-600", border: "border-rose-500", badge: "bg-rose-100 dark:bg-rose-950/60 text-rose-950 dark:text-rose-300 border border-rose-400 dark:border-rose-600 animate-pulse", label: "CRITICAL RISK (SPOILED / MOULD)", colorHex: "#dc2626" };
  };

  const levelTheme = getLevelColor(dummyLevel);

  // Active Shelf-Life Prediction Object
  const shelfLifePrediction = computeRemainingShelfLife(
    dummyLevel,
    cvResult?.category || "Fruits",
    cvResult?.mould_detected || false
  );

  return (
    <div className="glass-panel p-6 rounded-2xl space-y-5 bg-white dark:bg-slate-900 border border-[#d1ded5] dark:border-slate-800">
      
      {/* Top Bar with Clean Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e1eae4] dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Container Optical Scanner & Ripeness Assessor</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-semibold">
            Photographic inspection across Fruits, Vegetables, Dairy, Fish & Meat with Remaining Shelf-Life Prediction
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isCameraActive ? (
            <button
              onClick={stopCamera}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
            >
              <VideoOff className="h-4 w-4" /> Stop Live Camera
            </button>
          ) : (
            <button
              onClick={startCamera}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-700/20 transition-colors"
            >
              <Video className="h-4 w-4" /> Open Container Camera
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION: STREAMLINED FOOD SPECIMEN SELECTOR & ORGANIZER
          ───────────────────────────────────────────────────────────── */}
      <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#f8faf9] dark:bg-slate-850/80 border border-[#d1ded5] dark:border-slate-800 space-y-3 shadow-2xs">
        
        {/* Top Active Specimen Bar + Dropdown Selector + Prev/Next Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#e1eae4] dark:border-slate-800">
          
          {/* Active Specimen Summary */}
          {(() => {
            const activePreset = SAMPLE_PRESETS.find(p => p.id === selectedPresetId) || SAMPLE_PRESETS[0];
            return (
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-[#c6d7cd] dark:border-slate-700 flex-shrink-0 shadow-2xs relative">
                  <img
                    src={activePreset.imageUrl}
                    alt={activePreset.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getFallbackSvg(activePreset.name, activePreset.category, activePreset.icon);
                    }}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0.5 right-0.5 text-[10px] leading-none">{activePreset.icon}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                      {activePreset.name}
                    </span>
                    <span className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-md border ${
                      activePreset.risk_level === 'Critical'
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-300 border-rose-400 animate-pulse'
                        : activePreset.risk_level === 'High'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-400'
                        : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-300 border-emerald-400'
                    }`}>
                      {activePreset.risk_level}: {activePreset.ripeness_stage.split('(')[0].trim()}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                    {activePreset.container} • <span className="text-emerald-700 dark:text-emerald-400 font-bold">{activePreset.remaining_shelf_life_hours}h RSL</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Quick Stepper & Dropdown Picker Controls */}
          <div className="flex items-center gap-2 flex-shrink-0" ref={specimenDropdownRef}>
            
            {/* Previous / Next Stepper */}
            <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl border border-[#c6d7cd] dark:border-slate-700 p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={handlePrevPreset}
                disabled={filteredPresets.length <= 1}
                title="Previous Food Specimen"
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-200 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-[10px] font-mono font-bold px-2 text-slate-600 dark:text-slate-400 select-none">
                {currentIndex >= 0 ? currentIndex + 1 : 1}/{filteredPresets.length || 1}
              </span>
              <button
                type="button"
                onClick={handleNextPreset}
                disabled={filteredPresets.length <= 1}
                title="Next Food Specimen"
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-200 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Dropdown Picker Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSpecimenDropdownOpen(!specimenDropdownOpen)}
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-[#c6d7cd] dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-600 text-slate-900 dark:text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all"
              >
                <List className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                <span className="hidden sm:inline">Select Food Item</span>
                <span className="sm:hidden">Select</span>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-500 transition-transform ${specimenDropdownOpen ? 'rotate-180 text-emerald-600' : ''}`} />
              </button>

              {/* Specimen Dropdown List */}
              {specimenDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-84 max-h-96 overflow-y-auto rounded-2xl bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 space-y-1 animate-fade-in no-scrollbar">
                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">All 15 Food Presets</span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">Organized by Category</span>
                  </div>
                  {SAMPLE_PRESETS.map((preset) => {
                    const isSelected = preset.id === selectedPresetId;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`w-full p-2 rounded-xl text-left transition-all flex items-center gap-2.5 ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <img
                            src={preset.imageUrl}
                            alt={preset.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = getFallbackSvg(preset.name, preset.category, preset.icon);
                            }}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold truncate ${isSelected ? 'text-emerald-900 dark:text-emerald-300' : 'text-slate-900 dark:text-white'}`}>
                              {preset.icon} {preset.name}
                            </span>
                            <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                              preset.risk_level === 'Critical' ? 'bg-rose-100 text-rose-800' :
                              preset.risk_level === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {preset.risk_level}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {preset.category} • {preset.remaining_shelf_life_hours}h left
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* View Mode Toggle: Compact Ribbon vs Full Grid */}
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'compact' ? 'grid' : 'compact')}
              className={`p-1.5 sm:p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all ${
                viewMode === 'grid'
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-[#c6d7cd] dark:border-slate-700 hover:border-emerald-500'
              }`}
              title={viewMode === 'compact' ? 'Expand to Full Grid' : 'Switch to Compact Ribbon'}
            >
              {viewMode === 'compact' ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Filter Toolbar: Search Bar + Category Pills + Spoilage Stage Filters */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            
            {/* Live Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search food item (e.g. banana, salmon, spinach, milk)..."
                className="w-full pl-8.5 pr-8 py-1.5 sm:py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-[#c6d7cd] dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-600 shadow-2xs font-medium"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Spoilage Stage / Risk Pills */}
            <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto no-scrollbar py-0.5 flex-shrink-0">
              <span className="text-[10px] uppercase font-black text-slate-400 sm:hidden">Stage:</span>
              {[
                { id: "all", label: "All States" },
                { id: "low", label: "🟢 Fresh" },
                { id: "high", label: "⚠️ Overripe" },
                { id: "critical", label: "🚨 Spoiled" }
              ].map((rf) => (
                <button
                  key={rf.id}
                  type="button"
                  onClick={() => setSelectedRiskFilter(rf.id)}
                  className={`px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all whitespace-nowrap border ${
                    selectedRiskFilter === rf.id
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-2xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-[#d1ded5] dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {rf.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5-Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: "all", label: "All Categories (15)", icon: null },
              { id: "fruits", label: "Fruits (3)", icon: <Apple className="h-3 w-3" /> },
              { id: "vegetables", label: "Vegetables (3)", icon: <Carrot className="h-3 w-3" /> },
              { id: "dairy", label: "Dairy (3)", icon: <Milk className="h-3 w-3" /> },
              { id: "fish", label: "Fish & Seafood (3)", icon: <Fish className="h-3 w-3" /> },
              { id: "meat", label: "Meat & Poultry (3)", icon: <Beef className="h-3 w-3" /> },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryFilterClick(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 whitespace-nowrap border ${
                  selectedCategoryFilter === cat.id
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#d1ded5] dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-800'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* View Mode 1: Compact Horizontal Ribbon (Default - Zero vertical space wastage!) */}
        {viewMode === 'compact' ? (
          <div className="relative group">
            {/* Scroll Left Navigator */}
            <button
              type="button"
              onClick={() => scrollCarousel('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1.5 sm:-translate-x-3 w-7 h-7 rounded-full bg-white/95 dark:bg-slate-800/95 border border-slate-300 dark:border-slate-700 shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200 z-10 hover:bg-emerald-50 cursor-pointer transition-transform active:scale-95"
              title="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Horizontal Snap Scroll Container */}
            <div
              ref={carouselRef}
              className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 px-1 scroll-smooth"
            >
              {filteredPresets.length === 0 ? (
                <div className="w-full py-4 text-center text-xs text-slate-500 font-medium">
                  No food items match your filter. Try adjusting your search query.
                </div>
              ) : (
                filteredPresets.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`flex-shrink-0 w-36 sm:w-40 p-2 rounded-xl border cursor-pointer transition-all flex flex-col items-center text-center ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-600 dark:border-emerald-500 ring-2 ring-emerald-500/50 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-[#d1ded5] dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 shadow-2xs'
                      }`}
                    >
                      <div className="w-full h-18 sm:h-20 rounded-lg overflow-hidden relative bg-slate-100 dark:bg-slate-950 mb-1.5 border border-slate-200 dark:border-slate-800">
                        <img
                          src={preset.imageUrl}
                          alt={preset.name}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = getFallbackSvg(preset.name, preset.category, preset.icon);
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className={`absolute top-1 right-1 text-[8px] font-black px-1.5 py-0.5 rounded shadow ${
                          preset.risk_level === 'Critical'
                            ? 'bg-rose-600 text-white'
                            : preset.risk_level === 'High'
                            ? 'bg-amber-500 text-white'
                            : 'bg-emerald-700 text-white'
                        }`}>
                          {preset.risk_level}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-900 dark:text-white line-clamp-1 flex items-center gap-1 w-full justify-center">
                        <span>{preset.icon}</span> {preset.name}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate w-full">
                        {preset.category} • {preset.remaining_shelf_life_hours}h left
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Scroll Right Navigator */}
            <button
              type="button"
              onClick={() => scrollCarousel('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1.5 sm:translate-x-3 w-7 h-7 rounded-full bg-white/95 dark:bg-slate-800/95 border border-slate-300 dark:border-slate-700 shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200 z-10 hover:bg-emerald-50 cursor-pointer transition-transform active:scale-95"
              title="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          /* View Mode 2: Full Grid View (Expanded upon toggle) */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5 pt-1 animate-fade-in">
            {filteredPresets.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2 rounded-xl border cursor-pointer transition-all flex flex-col items-center text-center group ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-600 dark:border-emerald-500 ring-2 ring-emerald-500/50 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-[#d1ded5] dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 shadow-2xs'
                  }`}
                >
                  <div className="w-full h-20 sm:h-24 rounded-lg overflow-hidden relative bg-slate-100 dark:bg-slate-950 mb-1 border border-[#d1ded5] dark:border-slate-700">
                    <img
                      src={preset.imageUrl}
                      alt={preset.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getFallbackSvg(preset.name, preset.category, preset.icon);
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className={`absolute top-1 right-1 text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded shadow ${
                      preset.risk_level === 'Critical'
                        ? 'bg-rose-600 text-white'
                        : preset.risk_level === 'High'
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-700 text-white'
                    }`}>
                      {preset.risk_level}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white line-clamp-1 flex items-center gap-1">
                    <span>{preset.icon}</span> {preset.name}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{preset.category} • {preset.remaining_shelf_life_hours}h</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: Optical Inspection Workbench (Container Photo with Bounding Boxes + Sensory Diagnostics) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 pt-2">
        
        {/* Real Photographic Container View with AI Bounding Box & Risk Overlay */}
        <div className="lg:col-span-5 flex flex-col items-center justify-between p-3.5 sm:p-4 bg-[#f8faf9] dark:bg-slate-850 rounded-xl sm:rounded-2xl border border-[#d1ded5] dark:border-slate-800 relative dark:bg-slate-900/60 shadow-2xs">
          
          <div className="w-full flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 pb-2 mb-2 border-b border-[#e1eae4] dark:border-slate-800">
            <span className="font-bold flex items-center gap-1.5 text-slate-900 dark:text-white">
              <Camera className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /> {currentContainerName}
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
              Optical Sensor
            </span>
          </div>

          {/* Risk Diagnostic Banner (Placed outside photo frame to prevent text overlapping with bounding boxes) */}
          {cvResult && (
            <div className={`w-full mb-2 px-3 py-2 rounded-xl border text-[11px] sm:text-xs font-bold flex items-center justify-between shadow-2xs ${
              cvResult.risk_level === 'Critical'
                ? 'bg-rose-50 text-rose-950 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800'
                : cvResult.risk_level === 'High'
                ? 'bg-amber-50 text-amber-950 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800'
                : 'bg-emerald-50 text-emerald-950 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800'
            }`}>
              <span className="flex items-center gap-1.5 truncate">
                {cvResult.risk_level === 'Critical' ? <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-rose-600 dark:text-rose-400 animate-pulse flex-shrink-0" /> : (cvResult.risk_level === 'High' ? <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" /> : <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />)}
                <span>{cvResult.risk_level.toUpperCase()}: {cvResult.ripeness_stage.toUpperCase()}</span>
              </span>
              <span className="font-mono text-[11px] sm:text-xs font-black flex-shrink-0 ml-2">{cvResult.visual_spoilage_score}% Spoilage</span>
            </div>
          )}

          {isCameraActive ? (
            <div className="relative w-full h-64 sm:h-72 lg:h-80 bg-black rounded-xl overflow-hidden flex flex-col items-center justify-center border border-emerald-600">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <button
                onClick={captureCameraFrame}
                className="absolute bottom-3 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xl flex items-center gap-2 cursor-pointer"
              >
                <Camera className="h-4 w-4" /> Snap & Inspect Item
              </button>
            </div>
          ) : previewImage ? (
            <div className="relative w-full flex flex-col items-center">
              
              {/* Photo Frame with Clean Bounding Box Overlays */}
              <div className="relative w-full h-64 sm:h-72 lg:h-80 rounded-xl overflow-hidden shadow-sm border border-[#d1ded5] dark:border-slate-700 bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
                <img
                  src={previewImage}
                  alt="Food Container Inspection"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    const curPreset = SAMPLE_PRESETS.find(p => p.id === selectedPresetId);
                    if (curPreset?.remoteFallbackUrl && e.currentTarget.src !== curPreset.remoteFallbackUrl) {
                      e.currentTarget.src = curPreset.remoteFallbackUrl;
                    } else {
                      e.currentTarget.src = getFallbackSvg(curPreset?.name || 'Container Inspection', curPreset?.category || 'Perishable', curPreset?.icon || '🔬');
                    }
                  }}
                  className="w-full h-full object-cover"
                />

                {/* Simulated Computer Vision Detection Bounding Box on image */}
                {cvResult?.bounding_boxes?.map((box, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: `${box.x}%`,
                      top: `${box.y}%`,
                      width: `${box.width}%`,
                      height: `${box.height}%`,
                      borderColor: box.color,
                    }}
                    className="border-2 rounded-lg border-dashed bg-rose-500/20 pointer-events-none flex items-start justify-start p-1 z-10"
                  >
                    <span
                      style={{ backgroundColor: box.color }}
                      className="text-[9px] sm:text-[10px] font-black text-white px-1.5 py-0.5 rounded shadow uppercase"
                    >
                      {box.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* High-Visibility Action Buttons */}
              <div className="w-full grid grid-cols-2 gap-2 mt-2.5">
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-[#c6d7cd] dark:border-slate-700 text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-98"
                >
                  <Upload className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                  <span>Upload Photo</span>
                </button>
                <button
                  onClick={startCamera}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/20 transition-all cursor-pointer active:scale-98"
                >
                  <Video className="h-3.5 w-3.5" />
                  <span>Open Camera</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current.click()}
              className="w-full h-64 sm:h-72 lg:h-80 border-2 border-dashed border-[#d1ded5] dark:border-slate-700 hover:border-emerald-600 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors p-4 text-center bg-white dark:bg-slate-900"
            >
              <div className="p-3 rounded-full bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 mb-2">
                <Camera className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Upload Container Food Photo</span>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {/* Ripeness Stage Progression & Diagnostic Assessment */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-3 sm:space-y-4">
          {cvResult && (
            <div className="space-y-3 sm:space-y-4">
              
              {/* 4-Stage Ripeness Level Progression Bar */}
              <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#f8faf9] dark:bg-slate-850 border border-[#d1ded5] dark:border-slate-800 shadow-xs dark:bg-slate-900/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-700 dark:text-emerald-400" /> Lifecycle Stage:
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold text-emerald-800 dark:text-emerald-400">
                    Stage {ripenessStep} of 4: {cvResult.ripeness_stage}
                  </span>
                </div>

                {/* 4 Steps Graphic - 2x2 on Mobile, 1x4 on Desktop */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                  
                  {/* Step 1: Unripe */}
                  <div className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all ${
                    ripenessStep === 1
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-600 text-emerald-950 dark:text-emerald-300 font-bold shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-[#d1ded5] dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    <span className="text-[9px] sm:text-[10px] block font-bold">Stage 1</span>
                    <span className="text-xs sm:text-xs font-bold truncate block">🟢 Unripe</span>
                  </div>

                  {/* Step 2: Optimal Ripe */}
                  <div className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all ${
                    ripenessStep === 2
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-600 text-emerald-950 dark:text-emerald-300 font-bold shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-[#d1ded5] dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    <span className="text-[9px] sm:text-[10px] block font-bold">Stage 2</span>
                    <span className="text-xs sm:text-xs font-bold truncate block">✨ Optimal</span>
                  </div>

                  {/* Step 3: Overripe */}
                  <div className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all ${
                    ripenessStep === 3
                      ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-600 text-amber-950 dark:text-amber-300 font-bold shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-[#d1ded5] dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    <span className="text-[9px] sm:text-[10px] block font-bold">Stage 3</span>
                    <span className="text-xs sm:text-xs font-bold truncate block">⚠️ Overripe</span>
                  </div>

                  {/* Step 4: Spoiled / Rotten */}
                  <div className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all ${
                    ripenessStep === 4
                      ? 'bg-rose-100 dark:bg-rose-950/60 border-rose-600 text-rose-950 dark:text-rose-300 font-bold shadow-sm animate-pulse'
                      : 'bg-white dark:bg-slate-900 border-[#d1ded5] dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    <span className="text-[9px] sm:text-[10px] block font-bold">Stage 4</span>
                    <span className="text-xs sm:text-xs font-bold truncate block">🚨 Spoiled</span>
                  </div>

                </div>
              </div>

              {/* 4 Sensory Indicators - 2x2 on Mobile, 1x4 on Desktop */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                <div className="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-slate-850 border border-[#d1ded5] dark:border-slate-800 shadow-xs dark:bg-slate-900/80">
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 block truncate">Surface Browning</span>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">{cvResult.discoloration_score}%</div>
                </div>

                <div className="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-slate-850 border border-[#d1ded5] dark:border-slate-800 shadow-xs dark:bg-slate-900/80">
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 block truncate">Mould Colony</span>
                  <div className="text-sm sm:text-lg font-bold mt-0.5 flex items-center gap-1">
                    {cvResult.mould_detected ? (
                      <span className="text-rose-700 dark:text-rose-400 flex items-center gap-1 text-xs sm:text-sm font-bold truncate">
                        <AlertTriangle className="h-3.5 w-3.5" /> Detected ({cvResult.mould_coverage}%)
                      </span>
                    ) : (
                      <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 text-xs sm:text-sm font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Clear (0%)
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-slate-850 border border-[#d1ded5] dark:border-slate-800 shadow-xs dark:bg-slate-900/80">
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 block truncate">Tissue Breakdown</span>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">{cvResult.texture_degradation}%</div>
                </div>

                <div className="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-slate-850 border border-[#d1ded5] dark:border-slate-800 shadow-xs dark:bg-slate-900/80">
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 block truncate">Defect Regions</span>
                  <div className="text-sm sm:text-base font-bold text-emerald-800 dark:text-emerald-400 mt-0.5">
                    {cvResult.bounding_boxes?.length || 0} Region(s)
                  </div>
                </div>
              </div>

              {/* Detected Spoilage Symptoms Box */}
              {cvResult.detected_defects?.length > 0 ? (
                <div className={`p-3 sm:p-4 rounded-xl border ${
                  cvResult.risk_level === 'Critical'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200'
                }`}>
                  <span className={`text-[11px] sm:text-xs font-bold flex items-center gap-1.5 mb-1 ${
                    cvResult.risk_level === 'Critical' ? 'text-rose-900 dark:text-rose-400' : 'text-amber-900 dark:text-amber-400'
                  }`}>
                    <AlertTriangle className="h-3.5 w-3.5" /> Identified Spoilage Symptoms:
                  </span>
                  <ul className="text-[11px] sm:text-xs space-y-0.5 list-disc list-inside font-medium">
                    {cvResult.detected_defects.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="p-3 sm:p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-[11px] sm:text-xs text-emerald-950 dark:text-emerald-200 flex items-center gap-2 font-bold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                  <span>No biological defects detected. Item in prime harvest condition.</span>
                </div>
              )}

            </div>
          )}
        </div>

      </div>

      {/* SECTION 3: Multi-Modal Spoilage Level Simulation & Remaining Shelf-Life Output */}
      <div className={`p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#f8faf9] dark:bg-slate-850 border ${levelTheme.border} shadow-sm space-y-3 dark:bg-slate-800/60 mt-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <Sliders className={`h-4 w-4 sm:h-5 sm:w-5 ${levelTheme.text}`} />
            <span className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Ripeness & Spoilage Level Simulation:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black flex items-center gap-1.5 shadow-sm ${levelTheme.badge}`}>
              <span className={`h-2 w-2 rounded-full ${levelTheme.bg}`} />
              {dummyLevel}% — {levelTheme.label}
            </span>
          </div>
        </div>

        {/* Custom Multi-Color Gradient Slider Track */}
        <div className="mt-1 sm:mt-2 relative">
          <div className="h-3.5 w-full rounded-full overflow-hidden bg-slate-200 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 relative">
            {/* 4-Color Full Gradient Background */}
            <div
              className="absolute inset-0 h-full w-full opacity-60"
              style={{
                background: "linear-gradient(to right, #059669 0%, #10b981 35%, #f59e0b 70%, #dc2626 100%)"
              }}
            />
            {/* Active Colored Fill Bar */}
            <div
              className="h-full rounded-full transition-all duration-150 shadow-sm"
              style={{
                width: `${dummyLevel}%`,
                backgroundColor: levelTheme.colorHex
              }}
            />
          </div>

          {/* Range input layered cleanly over track */}
          <input
            type="range"
            min="0"
            max="100"
            value={dummyLevel}
            onChange={(e) => handleDummySliderChange(e.target.value)}
            className="w-full h-3.5 absolute top-0 left-0 opacity-0 cursor-pointer"
          />
        </div>

        {/* Interactive Milestone Clicker Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 pt-2 border-t border-[#e1eae4] dark:border-slate-700">
          <button
            type="button"
            onClick={() => handleDummySliderChange(10)}
            className={`py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 border transition-all ${
              dummyLevel < 25
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-300 border-emerald-600 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#d1ded5] dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>🟢</span> 0%-25% Unripe
          </button>

          <button
            type="button"
            onClick={() => handleDummySliderChange(40)}
            className={`py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 border transition-all ${
              dummyLevel >= 25 && dummyLevel < 55
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-300 border-emerald-600 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#d1ded5] dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>✨</span> 35%-50% Optimal
          </button>

          <button
            type="button"
            onClick={() => handleDummySliderChange(72)}
            className={`py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 border transition-all ${
              dummyLevel >= 55 && dummyLevel < 78
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-300 border-amber-600 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#d1ded5] dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>⚠️</span> 70%-75% Overripe
          </button>

          <button
            type="button"
            onClick={() => handleDummySliderChange(94)}
            className={`py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 border transition-all ${
              dummyLevel >= 78
                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-950 dark:text-rose-300 border-rose-600 shadow-sm animate-pulse'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#d1ded5] dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>🚨</span> 90%-100% Spoiled
          </button>
        </div>
      </div>

      {/* SECTION 4: REMAINING SHELF-LIFE (RSL) PREDICTION HERO CARD */}
      <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#ecfdf5] via-[#f0fdf4] to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 border border-emerald-400 dark:border-emerald-600/40 shadow-sm space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-emerald-200 dark:border-emerald-900/50 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-600 text-white shadow-sm">
              <Hourglass className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-emerald-950 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                Remaining Shelf-Life (RSL) Dynamic Prediction
              </h3>
              <span className="text-[11px] sm:text-xs text-emerald-800 dark:text-emerald-400 font-semibold">
                AI Multi-Modal Degradation Model • {cvResult?.category || "Fruits"} Preservability
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-black border ${
              shelfLifePrediction.hours === 0
                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-300 border-rose-400 animate-pulse'
                : (shelfLifePrediction.hours < 20 ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-400' : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-300 border-emerald-400')
            }`}>
              {shelfLifePrediction.action}
            </span>
          </div>
        </div>

        {/* Shelf-Life Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          
          {/* Main Countdown Gauge */}
          <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-800/90 border border-emerald-200 dark:border-emerald-900/40 shadow-sm space-y-1">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" /> Usable Shelf-Life Remaining
            </span>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl sm:text-3xl font-black ${
                shelfLifePrediction.hours === 0 ? 'text-rose-600 dark:text-rose-400' : (shelfLifePrediction.hours < 20 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400')
              }`}>
                {shelfLifePrediction.hours}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">Hours</span>
              {shelfLifePrediction.days > 0 && (
                <span className="text-[10px] sm:text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  ~{shelfLifePrediction.days} Days
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
              {shelfLifePrediction.safeDeadline}
            </p>
          </div>

          {/* Freshness & Quality Retention Score */}
          <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-800/90 border border-emerald-200 dark:border-emerald-900/40 shadow-sm space-y-1">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" /> Freshness Index
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {shelfLifePrediction.percentage}%
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">Score</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 sm:h-2 mt-1 overflow-hidden border border-slate-200 dark:border-slate-600">
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{ 
                  width: `${shelfLifePrediction.percentage}%`,
                  backgroundColor: shelfLifePrediction.percentage > 50 ? '#059669' : (shelfLifePrediction.percentage > 20 ? '#d97706' : '#dc2626')
                }}
              />
            </div>
          </div>

          {/* Biological Decay Multiplier */}
          <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-800/90 border border-emerald-200 dark:border-emerald-900/40 shadow-sm space-y-1">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" /> Degradation Rate
            </span>
            <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
              {shelfLifePrediction.decayRate}
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-medium">
              Dynamic multi-modal fusion of visual ripeness ({dummyLevel}%) & storage parameters.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
