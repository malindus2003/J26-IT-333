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
  Check,
  Cpu,
  Wifi,
  Radio,
  RefreshCw,
  History,
  Award,
  Info,
  ShieldCheck,
  Database
} from 'lucide-react';
import axios from 'axios';

// High-resolution photographic presets for Fruit and Vegetable quality inspection
// Automatic SVG fallback generator for offline / broken image handling
const getFallbackSvg = (name, category, icon) => {
  const bg = category === 'Fruits' ? '%23059669' : '%2310b981';
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="${bg}" fill-opacity="0.14"/><text x="50%" y="42%" dominant-baseline="middle" text-anchor="middle" font-size="56">${encodeURIComponent(icon || '🍎')}</text><text x="50%" y="68%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="bold" fill="%23334155">${encodeURIComponent(name || 'Food Specimen')}</text><text x="50%" y="82%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="%2364748b">${encodeURIComponent(category || 'Produce')}</text></svg>`;
};

const SAMPLE_PRESETS = [
  // 1. Fruits (Authentic Sri Lankan Produce & Benchmark Specimens)
  {
    id: "banana_embul_fresh",
    name: "Embul Banana (Ambul Kesel)",
    category: "Fruits",
    icon: "🍌",
    identified_produce: "Banana",
    produce_confidence: 96.5,
    produce_icon: "🍌",
    scientific_name: "Musa acuminata",
    container: "Container #C-101 (Zone 1: Fruit Chiller 11°C)",
    imageUrl: "/images/specimens/banana_fresh.jpg",
    remoteFallbackUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80",
    ripeness_stage: "Fresh (Grade A - Prime Harvest)",
    ripeness_percent: 25,
    visual_spoilage_score: 11.5,
    risk_level: "Low",
    discoloration_score: 3.2,
    mould_detected: false,
    mould_coverage: 0.0,
    texture_degradation: 6.0,
    baseline_shelf_life_hours: 168.0,
    remaining_shelf_life_hours: 115.0,
    detected_defects: [
      "Intact epidermal cuticle",
      "Optimal chlorophyll-to-carotenoid ratio (Grade A)"
    ],
    bounding_boxes: [
      { label: "PRIME INTACT PEEL", type: "fresh", x: 22, y: 20, width: 56, height: 60, color: "#10b981" }
    ]
  },
  {
    id: "banana_overripe",
    name: "Overripe Ambul Kesel (Senescent)",
    category: "Fruits",
    icon: "🍌",
    identified_produce: "Banana",
    produce_confidence: 94.8,
    produce_icon: "🍌",
    scientific_name: "Musa acuminata",
    container: "Container #C-102 (Zone 4: Ambient Kitchen Rack)",
    imageUrl: "/images/specimens/banana_overripe.jpg",
    remoteFallbackUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80",
    ripeness_stage: "Ripe / Good (Grade B - High Ethylene)",
    ripeness_percent: 75,
    visual_spoilage_score: 68.0,
    risk_level: "High",
    discoloration_score: 38.5,
    mould_detected: false,
    mould_coverage: 0.0,
    texture_degradation: 45.0,
    baseline_shelf_life_hours: 72.0,
    remaining_shelf_life_hours: 12.5,
    detected_defects: [
      "Senescence tyrosine browning spots (38%)",
      "Pulp softening & high ethylene degassing"
    ],
    bounding_boxes: [
      { label: "SENESCENCE BROWNING", type: "overripe", x: 25, y: 28, width: 50, height: 45, color: "#f59e0b" }
    ]
  },
  {
    id: "peach_rotting",
    name: "Senescent Peach (Brown Rot Softening)",
    category: "Fruits",
    icon: "🍑",
    identified_produce: "Peach",
    produce_confidence: 96.5,
    produce_icon: "🍑",
    scientific_name: "Prunus persica",
    container: "Container #C-106 (Ambient Produce Tray)",
    imageUrl: "/images/specimens/peach_rotting.jpg",
    remoteFallbackUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&auto=format&fit=crop&q=80",
    ripeness_stage: "Overripe / Softening (Use Today)",
    ripeness_percent: 47,
    visual_spoilage_score: 60.0,
    risk_level: "High",
    discoloration_score: 13.7,
    mould_detected: false,
    mould_coverage: 0.0,
    texture_degradation: 62.0,
    baseline_shelf_life_hours: 120.0,
    remaining_shelf_life_hours: 16.5,
    detected_defects: [
      "Senescent sunken necrotic lesion / brown rot discoloration (13.7%)",
      "Epidermal texture wrinkling & soft tissue breakdown"
    ],
    bounding_boxes: [
      { label: "SENESCENCE BROWNING", type: "overripe", x: 48, y: 23, width: 20, height: 38, color: "#f59e0b" },
      { label: "SENESCENCE BROWNING", type: "overripe", x: 27, y: 19, width: 15, height: 32, color: "#f59e0b" }
    ]
  },
  {
    id: "rotten_fruit_mould",
    name: "Rotten Fruit (Botrytis Mould Colony)",
    category: "Fruits",
    icon: "🍓",
    identified_produce: "Strawberry",
    produce_confidence: 91.2,
    produce_icon: "🍓",
    scientific_name: "Fragaria × ananassa",
    container: "Container #C-104 (Quarantine Vault)",
    imageUrl: "/images/specimens/strawberries_mould.jpg",
    remoteFallbackUrl: "https://images.unsplash.com/photo-1543158181-e6f9f6712055?w=600&auto=format&fit=crop&q=80",
    ripeness_stage: "Spoiled / Rotten (Grade F)",
    ripeness_percent: 98,
    visual_spoilage_score: 92.5,
    risk_level: "Critical",
    discoloration_score: 42.0,
    mould_detected: true,
    mould_coverage: 18.2,
    texture_degradation: 72.0,
    baseline_shelf_life_hours: 96.0,
    remaining_shelf_life_hours: 0.0,
    detected_defects: [
      "Active fungal mycelium & spore colony detected",
      "Severe enzymatic browning and necrotic tissue breakdown"
    ],
    bounding_boxes: [
      { label: "MOULD SPORE COLONY", type: "spoilage", x: 28, y: 32, width: 44, height: 40, color: "#ef4444" },
      { label: "NECROTIC TISSUE ROT", type: "spoilage", x: 58, y: 52, width: 28, height: 26, color: "#ef4444" }
    ]
  },
  {
    id: "mango_karthakolomban",
    name: "Karthakolomban Mango (Ripe)",
    category: "Fruits",
    icon: "🥭",
    identified_produce: "Mango",
    produce_confidence: 95.0,
    produce_icon: "🥭",
    scientific_name: "Mangifera indica",
    container: "Container #C-103 (Zone 1: Tropical Fruit Chiller)",
    imageUrl: "/images/specimens/mango_ripe.jpg",
    remoteFallbackUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80",
    ripeness_stage: "Ripe / Good (Grade B - Peak Flavour)",
    ripeness_percent: 78,
    visual_spoilage_score: 32.0,
    risk_level: "Low",
    discoloration_score: 8.5,
    mould_detected: false,
    mould_coverage: 0.0,
    texture_degradation: 14.0,
    baseline_shelf_life_hours: 192.0,
    remaining_shelf_life_hours: 38.0,
    detected_defects: [
      "Rich golden-yellow carotenoid skin gloss",
      "Slight lenticel spotting at stem end"
    ],
    bounding_boxes: [
      { label: "PEAK CAROTENOID RIPENESS", type: "fresh", x: 20, y: 15, width: 60, height: 65, color: "#10b981" }
    ]
  },
  {
    id: "avocado_overripe",
    name: "Overripe Avocado (Butter Fruit)",
    category: "Fruits",
    icon: "🥑",
    identified_produce: "Avocado",
    produce_confidence: 96.0,
    produce_icon: "🥑",
    scientific_name: "Persea americana",
    container: "Container #C-105 (Zone 4: Ambient Kitchen Rack)",
    imageUrl: "/images/specimens/avocado_overripe.jpg",
    remoteFallbackUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&auto=format&fit=crop&q=80",
    ripeness_stage: "Overripe / Softening (Use Today)",
    ripeness_percent: 44,
    visual_spoilage_score: 63.5,
    risk_level: "High",
    discoloration_score: 30.2,
    mould_detected: false,
    mould_coverage: 0.0,
    texture_degradation: 68.0,
    baseline_shelf_life_hours: 96.0,
    remaining_shelf_life_hours: 18.0,
    detected_defects: [
      "Loss of skin firmness & localized sunken browning (30.2%)",
      "Pulp softening & high lipid cellular oxidation (Stage 3)"
    ],
    bounding_boxes: [
      { label: "SENESCENCE BROWNING", type: "overripe", x: 0, y: 37, width: 82, height: 51, color: "#f59e0b" },
      { label: "SENESCENCE BROWNING", type: "overripe", x: 55, y: 41, width: 44, height: 58, color: "#f59e0b" }
    ]
  },

  // 2. Vegetables (3 presets: Wilted, Crisp, Softening)
  {
    id: "spinach_wilted",
    name: "Wilted Yellowing Spinach",
    category: "Vegetables",
    icon: "🥬",
    identified_produce: "Spinach / Leafy Greens",
    produce_confidence: 97.4,
    produce_icon: "🥬",
    scientific_name: "Spinacia oleracea",
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
    identified_produce: "Spinach / Leafy Greens",
    produce_confidence: 93.8,
    produce_icon: "🥗",
    scientific_name: "Lactuca sativa",
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
    identified_produce: "Tomato",
    produce_confidence: 96.2,
    produce_icon: "🍅",
    scientific_name: "Solanum lycopersicum",
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

  // ESP32-CAM Wi-Fi Hardware Node State
  const [esp32Url, setEsp32Url] = useState(() => localStorage.getItem("esp32_cam_url") || "http://172.20.10.2/capture");
  const [isEsp32ModalOpen, setIsEsp32ModalOpen] = useState(false);
  const [esp32Loading, setEsp32Loading] = useState(false);
  const [esp32Error, setEsp32Error] = useState(null);
  const [esp32AutoPoll, setEsp32AutoPoll] = useState(false);
  const [esp32PollInterval, setEsp32PollInterval] = useState(3600); // default 1 hour (3600s)
  const [esp32LastCaptureTime, setEsp32LastCaptureTime] = useState(null);

  // Inspection History & Telemetry State
  const [inspectionHistory, setInspectionHistory] = useState([]);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/vision/history");
      if (res.data?.history) {
        setInspectionHistory(res.data.history);
      }
    } catch (e) {
      // non-blocking fallback
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

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
      setCurrentContainerName("Scanning Uploaded Specimen...");
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
    setCurrentContainerName("Scanning Captured Photo...");
    runBackendAnalysis(dataUrl, cvResult?.category || "Fruits");
  };

  const runBackendAnalysis = async (imageDataUrl, targetCategory) => {
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("category", targetCategory);
      formData.append("image_base64", imageDataUrl);

      const res = await axios.post("http://localhost:8000/api/vision/inspect", formData);
      const feat = res.data.features || res.data;
      setCvResult(feat);
      if (feat.identified_produce) {
        setCurrentContainerName(`Detected: ${feat.identified_produce} (${feat.category || targetCategory})`);
      }
      fetchHistory();
      if (onInspectionComplete) {
        onInspectionComplete(feat);
      }
    } catch (err) {
      console.error("CV inspection error:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const captureFromEsp32 = async (overrideUrl = null) => {
    const targetUrl = (overrideUrl || esp32Url).trim();
    if (!targetUrl) return;
    localStorage.setItem("esp32_cam_url", targetUrl);
    setEsp32Loading(true);
    setEsp32Error(null);
    stopCamera();
    try {
      const res = await axios.post("http://localhost:8000/api/vision/esp32/capture", {
        camera_url: targetUrl,
        category: cvResult?.category || "Fruits",
        container_id: "ESP32-CAM Container Node"
      });
      const data = res.data;
      const feat = data.features || data;
      setCvResult(feat);
      if (data.image_base64) {
        setPreviewImage(data.image_base64);
      }
      setCurrentContainerName(`ESP32-CAM: ${feat.identified_produce || "Live Capture"} (${feat.category || "Produce"})`);
      setSelectedPresetId(null);
      setEsp32LastCaptureTime(new Date().toLocaleTimeString());
      fetchHistory();
      if (onInspectionComplete) {
        onInspectionComplete(feat);
      }
    } catch (err) {
      console.error("ESP32-CAM fetch error:", err);
      const msg = err.response?.data?.detail || err.message || "Could not connect to ESP32-CAM module.";
      setEsp32Error(msg);
    } finally {
      setEsp32Loading(false);
    }
  };

  useEffect(() => {
    let interval = null;
    if (esp32AutoPoll && esp32Url) {
      captureFromEsp32();
      interval = setInterval(() => {
        captureFromEsp32();
      }, esp32PollInterval * 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [esp32AutoPoll, esp32Url, esp32PollInterval]);

  // Dynamic Remaining Shelf-Life & Spoilage Computation grounded on Model Outputs
  const computeRemainingShelfLife = (val, category, isMould) => {
    const baselines = {
      "Fruits": 120.0,
      "Vegetables": 96.0
    };
    const baseline = cvResult?.baseline_shelf_life_hours || baselines[category] || 120.0;

    const h = cvResult?.remaining_shelf_life_hours !== undefined 
      ? Math.round(cvResult.remaining_shelf_life_hours * 10) / 10 
      : Math.round(baseline * Math.pow(Math.max(0, (100 - val) / 100), 1.3) * 10) / 10;

    const isExpired = h <= 0 || isMould || cvResult?.risk_level === 'Critical' || (cvResult?.ripeness_stage && cvResult.ripeness_stage.toLowerCase().includes('spoiled'));
    const isUrgent = h < 24 || cvResult?.risk_level === 'High' || (cvResult?.ripeness_stage && cvResult.ripeness_stage.toLowerCase().includes('overripe'));

    const confInterval = cvResult?.rsl_confidence_interval || (
      isExpired ? "0.0 hrs (Quarantine)" : `${Math.max(0, Math.round(h * 0.75))} - ${Math.round(h * 1.25)} hrs [90% CI]`
    );

    return {
      hours: isExpired ? 0.0 : h,
      days: isExpired ? 0.0 : Math.round((h / 24.0) * 10) / 10,
      percentage: isExpired ? 0 : Math.max(0, Math.min(100, Math.round(cvResult?.ripeness_percent || (100 - val)))),
      confidenceInterval: confInterval,
      action: isExpired 
        ? "EXPIRED: Quarantine & Dispose Immediately" 
        : (isUrgent ? "PRIORITY CHEF USE (Cook / Divert Today)" : (h > 48 ? "Optimal Quality (Standard FIFO Rotation)" : "Prime Culinary Quality (Cook within 2-3 days)")),
      safeDeadline: isExpired 
        ? "Expired - Do not cook or serve" 
        : (isUrgent ? `Must consume within ${Math.max(2, Math.round(h))} hours!` : `Safe for ~${Math.max(1, Math.round(h / 24.0))} days in cold storage`),
      decayRate: isExpired 
        ? "Severe degradation (> 5.2x baseline decay)" 
        : (isUrgent ? "Accelerated cellular breakdown (3.4x decay)" : "Normal baseline metabolic aging (1.0x)")
    };
  };

  const getRipenessStep = (stage) => {
    if (!stage) return 2;
    const s = stage.toLowerCase();
    if (s.includes("unripe")) return 1;
    if (s.includes("overripe") || s.includes("wilted") || s.includes("soft") || s.includes("grade c")) return 3;
    if (s.includes("spoiled") || s.includes("mould") || s.includes("mold") || s.includes("rot") || s.includes("grade f")) return 4;
    if (s.includes("optimal") || s.includes("fresh") || s.includes("prime") || s.includes("crisp") || s.includes("ripe") || s.includes("grade b") || s.includes("grade a")) return 2;
    return 2;
  };

  const ripenessStep = cvResult ? getRipenessStep(cvResult.ripeness_stage) : 2;

  const getLevelColor = (val) => {
    if (val < 25) return { text: "text-emerald-800 dark:text-emerald-400", bg: "bg-emerald-600", border: "border-emerald-500", badge: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-300 border border-emerald-400 dark:border-emerald-600", label: "LOW RISK (UNRIPE / FIRM)", colorHex: "#059669" };
    if (val < 55) return { text: "text-emerald-800 dark:text-emerald-400", bg: "bg-emerald-600", border: "border-emerald-500", badge: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-300 border border-emerald-400 dark:border-emerald-600", label: "LOW RISK (OPTIMAL RIPE)", colorHex: "#047857" };
    if (val < 78) return { text: "text-amber-800 dark:text-amber-400", bg: "bg-amber-600", border: "border-amber-500", badge: "bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-300 border border-amber-400 dark:border-amber-600", label: "HIGH RISK (OVERRIPE / SOFTENING)", colorHex: "#d97706" };
    return { text: "text-rose-800 dark:text-rose-400", bg: "bg-rose-600", border: "border-rose-500", badge: "bg-rose-100 dark:bg-rose-950/60 text-rose-950 dark:text-rose-300 border border-rose-400 dark:border-rose-600 animate-pulse", label: "CRITICAL RISK (SPOILED / MOULD)", colorHex: "#dc2626" };
  };

  const visualScore = cvResult?.visual_spoilage_score !== undefined ? cvResult.visual_spoilage_score : 15;
  const levelTheme = getLevelColor(visualScore);

  // Active Shelf-Life Prediction Object grounded directly on AI inference results
  const shelfLifePrediction = computeRemainingShelfLife(
    visualScore,
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
            Photographic inspection across Fruits & Vegetables with Remaining Shelf-Life Prediction
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEsp32ModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-700/20 transition-colors cursor-pointer"
            title="Connect physical ESP32-CAM Wi-Fi camera node"
          >
            <Cpu className="h-4 w-4 text-sky-200" />
            <span>ESP32-CAM</span>
            {esp32AutoPoll && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
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
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Fruit & Vegetable Specimens</span>
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
                placeholder="Search produce item (e.g. banana, spinach, mango, tomato)..."
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

          {/* Category Filter Tabs (Fruits & Vegetables Only) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: "all", label: "All Produce (8)", icon: null },
              { id: "fruits", label: "Fruits (5)", icon: <Apple className="h-3 w-3" /> },
              { id: "vegetables", label: "Vegetables (3)", icon: <Carrot className="h-3 w-3" /> },
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
            <span className="font-bold flex items-center gap-1.5 text-slate-900 dark:text-white truncate mr-2">
              <Camera className="h-4 w-4 text-emerald-700 dark:text-emerald-400 flex-shrink-0" />
              <span className="truncate">{currentContainerName}</span>
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 flex-shrink-0">
              Optical Sensor
            </span>
          </div>

          {/* Identified Produce & AI Confidence Badge */}
          {cvResult && cvResult.identified_produce && (
            <div className="w-full mb-2 p-2.5 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50 dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-emerald-950/70 border border-emerald-300 dark:border-emerald-700/80 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-2xl p-1 bg-white dark:bg-slate-800 rounded-lg shadow-2xs flex-shrink-0 border border-emerald-200 dark:border-emerald-800">
                  {cvResult.produce_icon || "🍎"}
                </span>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                      Detected Produce:
                    </span>
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      {cvResult.identified_produce}
                    </span>
                    {cvResult.scientific_name && (
                      <span className="text-[10px] italic text-slate-500 dark:text-slate-400 hidden sm:inline">
                        ({cvResult.scientific_name})
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-900 dark:text-emerald-300 truncate">
                    Category: {cvResult.category || "Produce"} • Baseline: {cvResult.baseline_shelf_life_hours || 120}h Shelf-Life
                  </span>
                </div>
              </div>
              {cvResult.produce_confidence && (
                <div className="flex flex-col items-end flex-shrink-0 ml-2">
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">Confidence</span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-200/90 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-700 font-mono">
                    {cvResult.produce_confidence}%
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Risk Diagnostic Banner (Placed outside photo frame to prevent text overlapping with bounding boxes) */}
          {cvResult && (
            <div className={`w-full mb-2 px-3 py-2 rounded-xl border text-[11px] sm:text-xs font-bold flex items-center justify-between shadow-2xs ${
              cvResult.risk_level === 'Critical'
                ? 'bg-rose-50 text-rose-950 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800'
                : cvResult.risk_level === 'High'
                ? 'bg-amber-50 text-amber-950 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800'
                : cvResult.risk_level === 'Medium'
                ? 'bg-amber-50/70 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-700'
                : 'bg-emerald-50 text-emerald-950 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800'
            }`}>
              <span className="flex items-center gap-1.5 truncate">
                {cvResult.risk_level === 'Critical' ? (
                  <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-rose-600 dark:text-rose-400 animate-pulse flex-shrink-0" />
                ) : cvResult.risk_level === 'High' ? (
                  <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                ) : cvResult.risk_level === 'Medium' ? (
                  <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                )}
                <span>{cvResult.identified_produce ? `${cvResult.identified_produce.toUpperCase()} — ` : ""}{cvResult.risk_level.toUpperCase()}: {cvResult.ripeness_stage.toUpperCase()}</span>
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
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5">
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-[#c6d7cd] dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-98"
                >
                  <Upload className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Upload Photo</span>
                </button>
                <button
                  onClick={() => setIsEsp32ModalOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-sky-700/20 transition-all cursor-pointer active:scale-98"
                >
                  <Cpu className="h-4 w-4 text-sky-200" />
                  <span>ESP32-CAM Node</span>
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

      {/* SECTION 3: AI MULTI-STAGE TELEMETRY & DIAGNOSTICS */}
      <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-[#d1ded5] dark:border-slate-800 shadow-sm space-y-4 mt-4">
        
        {/* Card Header with Badges & History Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-[#e1eae4] dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400">
              <Award className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span>AI Multi-Stage Telemetry & Quality Diagnostics</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-700">
                  {cvResult?.model_version || "v2.2-trained"}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                Dataset-backed machine learning inference on CPU • Pascal VOC Ground-Truth Aligned
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsHistoryDrawerOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#ecfdf5] hover:bg-[#d1fae5] dark:bg-slate-800 dark:hover:bg-slate-750 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-slate-700 flex items-center gap-1.5 transition-all shadow-xs"
            >
              <History className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>Inspection History</span>
              {inspectionHistory.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[10px]">
                  {inspectionHistory.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 4-Column Decoupled Diagnostic Telemetry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Diagnostic 1: Species Identification */}
          <div className="p-3.5 rounded-xl bg-[#f8faf9] dark:bg-slate-800/60 border border-[#e1eae4] dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                1. Species Identity
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                cvResult?.is_supported_produce !== false 
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700'
              }`}>
                {cvResult?.is_supported_produce !== false ? 'Supported Class' : 'Out-of-Distribution'}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{cvResult?.produce_icon || "🍎"}</span>
              <div className="min-w-0">
                <div className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                  {cvResult?.species_identity || cvResult?.identified_produce || "Fruit / Vegetable"}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 italic truncate">
                  {cvResult?.scientific_name || "Biological specimen"}
                </div>
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-600 dark:text-slate-400">Confidence:</span>
                <span className="text-emerald-800 dark:text-emerald-400">{cvResult?.produce_confidence || 85.0}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, cvResult?.produce_confidence || 85)}%` }}
                />
              </div>
            </div>

            {cvResult?.alternative_predictions && cvResult.alternative_predictions.length > 1 && (
              <div className="text-[10px] text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="font-bold">Alternatives: </span>
                {cvResult.alternative_predictions.slice(1, 3).map((alt, idx) => (
                  <span key={idx} className="mr-1.5">
                    {alt.produce} ({alt.confidence}%)
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Diagnostic 2: Ripeness Stage (Physiological) */}
          <div className="p-3.5 rounded-xl bg-[#f8faf9] dark:bg-slate-800/60 border border-[#e1eae4] dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                2. Ripeness Stage
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700">
                Physiological
              </span>
            </div>

            <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{cvResult?.ripeness_classification || cvResult?.ripeness_stage || "Ripe / Optimal"}</span>
            </div>

            {/* Stage Probabilities Bar */}
            {cvResult?.stage_probabilities && (
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Class Probabilities:</span>
                <div className="grid grid-cols-3 gap-1 text-[9px] font-bold text-center">
                  <div className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <div>Unripe</div>
                    <div>{cvResult.stage_probabilities["Unripe / Firm"] || 0}%</div>
                  </div>
                  <div className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <div>Optimal</div>
                    <div>{cvResult.stage_probabilities["Ripe / Optimal"] || 0}%</div>
                  </div>
                  <div className="p-1 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    <div>Overripe</div>
                    <div>{cvResult.stage_probabilities["Overripe"] || 0}%</div>
                  </div>
                </div>
              </div>
            )}

            <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700 flex justify-between">
              <span>Sugar Spotting:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {cvResult?.ripeness_classification === 'Overripe' ? 'Senescent Sugar Spots' : 'Normal Cuticle'}
              </span>
            </div>
          </div>

          {/* Diagnostic 3: Visible Spoilage Classification (Calibrated) */}
          <div className="p-3.5 rounded-xl bg-[#f8faf9] dark:bg-slate-800/60 border border-[#e1eae4] dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                3. Visible Spoilage
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                cvResult?.visible_spoilage_classification === 'No visible spoilage detected' 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : cvResult?.visible_spoilage_classification === 'Localized visible defect'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : cvResult?.visible_spoilage_classification === 'Uncertain'
                  ? 'bg-purple-100 text-purple-800 border-purple-300'
                  : 'bg-rose-100 text-rose-800 border-rose-300'
              }`}>
                {cvResult?.risk_level || 'Low'} Risk
              </span>
            </div>

            <div className={`text-sm font-extrabold flex items-center gap-1.5 ${
              cvResult?.visible_spoilage_classification === 'No visible spoilage detected'
                ? 'text-emerald-700 dark:text-emerald-400'
                : cvResult?.visible_spoilage_classification === 'Localized visible defect'
                ? 'text-amber-700 dark:text-amber-400'
                : cvResult?.visible_spoilage_classification === 'Uncertain'
                ? 'text-purple-700 dark:text-purple-400'
                : 'text-rose-700 dark:text-rose-400'
            }`}>
              <span>{cvResult?.visible_spoilage_classification || 'No visible spoilage detected'}</span>
            </div>

            <div className="space-y-1 pt-1 text-xs">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-600 dark:text-slate-400">Spoilage Probability:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {cvResult?.spoilage_probability !== undefined ? `${cvResult.spoilage_probability}%` : '0.0%'}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden relative">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    (cvResult?.spoilage_probability || 0) >= 41.0 ? 'bg-rose-600' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${Math.min(100, cvResult?.spoilage_probability || 0)}%` }}
                />
              </div>
            </div>

            <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700 flex justify-between">
              <span>Decision Threshold:</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                T = {cvResult?.calibrated_threshold || 41.0}%
              </span>
            </div>
          </div>

          {/* Diagnostic 4: Defect Types & Localization SLA */}
          <div className="p-3.5 rounded-xl bg-[#f8faf9] dark:bg-slate-800/60 border border-[#e1eae4] dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                4. Defect Types & SLA
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {cvResult?.processing_latency_ms ? `${cvResult.processing_latency_ms} ms CPU` : "< 100 ms"}
              </span>
            </div>

            <div className="text-xs">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Identified Defect Types</div>
              <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                {cvResult?.defect_types && cvResult.defect_types.length > 0
                  ? cvResult.defect_types.join(", ")
                  : "None (Intact Cuticle)"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-0.5 text-xs">
              <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-[#e1eae4] dark:border-slate-700">
                <div className="text-[9px] text-slate-500 dark:text-slate-400">Bounding Boxes</div>
                <div className="font-extrabold text-slate-800 dark:text-slate-200">
                  {cvResult?.bounding_boxes ? `${cvResult.bounding_boxes.length}` : "0"}
                </div>
              </div>

              <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-[#e1eae4] dark:border-slate-700">
                <div className="text-[9px] text-slate-500 dark:text-slate-400">Defect Area</div>
                <div className="font-extrabold text-slate-800 dark:text-slate-200">
                  {cvResult?.defect_surface_area_percent !== undefined 
                    ? `${cvResult.defect_surface_area_percent}%` 
                    : "0.0%"}
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-600 dark:text-slate-400 pt-1 flex items-center justify-between border-t border-slate-200 dark:border-slate-700">
              <span className="font-bold">Mould Status:</span>
              <span className={`font-bold ${cvResult?.mould_detected ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-emerald-700 dark:text-emerald-400'}`}>
                {cvResult?.mould_detected ? `Mould Spores Detected` : "Clean Cuticle"}
              </span>
            </div>
          </div>

        </div>

        {/* Audit Meta Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-2 border-t border-[#e1eae4] dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">Analysis ID:</span>
            <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono">
              {cvResult?.analysis_id || "CV-SCAN-REALTIME"}
            </code>
          </div>
          <div>
            Benchmark ground truth: 3,202 verified images (Apache 2.0) • Stratified test split (N=321)
          </div>
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
              Dynamic multi-modal fusion of visual defect index ({visualScore}%) & storage parameters • {shelfLifePrediction.confidenceInterval}
            </p>
          </div>

        </div>
      </div>

      {/* ESP32-CAM Hardware Node Modal */}
      {isEsp32ModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-sky-500/40 shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-400">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>ESP32-CAM Optical Hardware Node</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-bold border border-sky-300 dark:border-sky-800">
                      Component 3
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Direct Wi-Fi snapshot pull from your AI-Thinker ESP32-CAM module
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEsp32ModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* IP URL Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>ESP32-CAM Snapshot URL</span>
                <span className="text-[10px] font-normal text-slate-400">e.g. http://172.20.10.2/capture</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Wifi className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={esp32Url}
                    onChange={(e) => setEsp32Url(e.target.value)}
                    placeholder="http://172.20.10.2/capture"
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-sky-600"
                  />
                </div>
                <button
                  onClick={() => captureFromEsp32()}
                  disabled={esp32Loading}
                  className="px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  {esp32Loading ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Camera className="h-3.5 w-3.5" />
                  )}
                  <span>{esp32Loading ? "Pulling..." : "Snap Frame"}</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Ensure your laptop and ESP32-CAM are connected to the same Wi-Fi network or mobile phone hotspot.
              </p>
            </div>

            {/* Error Message if any */}
            {esp32Error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-300 text-xs flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <strong className="block font-bold">Connection Failed</strong>
                  <span>{esp32Error}</span>
                </div>
              </div>
            )}

            {/* Auto-Poll Controls with Configurable Frequency */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Radio className={`h-3.5 w-3.5 ${esp32AutoPoll ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
                    Autonomous Container Surveillance
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                    {esp32LastCaptureTime ? `Last captured: ${esp32LastCaptureTime}` : "Periodic non-intrusive container quality assessment"}
                  </span>
                </div>
                <button
                  onClick={() => setEsp32AutoPoll(prev => !prev)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    esp32AutoPoll
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                >
                  {esp32AutoPoll ? "Active (Stop)" : "Enable Auto-Capture"}
                </button>
              </div>

              {/* Interval Selection: 15s (Demo), 15m, 1h (Standard), 4h */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-slate-400" /> Capture Frequency:
                </span>
                <div className="flex items-center gap-1">
                  {[
                    { label: "15s (Demo)", val: 15 },
                    { label: "15m", val: 900 },
                    { label: "1h (HACCP Standard)", val: 3600 },
                    { label: "4h", val: 14400 }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => setEsp32PollInterval(opt.val)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                        esp32PollInterval === opt.val
                          ? 'bg-sky-600 text-white shadow-2xs'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Firmware & Arduino Sketch Quick Links */}
            <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-[11px] text-emerald-950 dark:text-emerald-200 space-y-1">
              <strong className="block font-bold text-emerald-900 dark:text-emerald-300">
                📄 Arduino Firmware & Circuit Guide:
              </strong>
              <div className="flex flex-col gap-1 text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                <span>• Sketch: <code>iot_firmware/esp32_cam_spoilage_node.ino</code></span>
                <span>• Wiring: <code>iot_firmware/ESP32_CAM_SETUP_GUIDE.md</code></span>
                <span>• Camera: AI-Thinker OV2640 (VGA 640x480 with Flash LED GPIO 4)</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setIsEsp32ModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Inspection Audit History Modal */}
      {isHistoryDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-3xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-2xl border border-emerald-500/40 shadow-2xl p-5 space-y-4 flex flex-col animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Inspection Audit Log & History</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                      {inspectionHistory.length} Records
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Persistent inspection logs from manual uploads & ESP32-CAM autonomous optical scans
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchHistory}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                  title="Refresh Log"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsHistoryDrawerOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* History Table Container */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {inspectionHistory.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400 space-y-2">
                  <Database className="h-8 w-8 mx-auto text-slate-400" />
                  <p className="text-sm font-bold">No inspection records logged yet.</p>
                  <p className="text-xs">Upload a photograph or trigger an ESP32-CAM optical capture to record telemetry.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {inspectionHistory.map((rec, idx) => (
                    <div
                      key={rec.analysis_id || idx}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#f8faf9] dark:bg-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{rec.produce_icon || "🍎"}</span>
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{rec.produce || "Produce Item"}</span>
                            <span className="text-[10px] text-slate-500 font-normal">
                              ({rec.confidence || 0}% conf)
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {rec.analysis_id} • {rec.source} • {rec.timestamp ? new Date(rec.timestamp).toLocaleString() : ""}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          rec.risk_level === 'Critical'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-300 border-rose-300'
                            : (rec.risk_level === 'High' ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border-amber-300' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-950 dark:text-emerald-300 border-emerald-300')
                        }`}>
                          {rec.stage}
                        </span>

                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold font-mono">
                          RSL: {rec.rsl_hours}h
                        </span>

                        {rec.mould_detected && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white text-[9px] font-black uppercase">
                            Mould
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await axios.delete("http://localhost:8000/api/vision/history");
                    setInspectionHistory([]);
                  } catch (e) {
                    console.error("Error clearing history:", e);
                  }
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
              >
                Clear Audit Log
              </button>

              <button
                type="button"
                onClick={() => setIsHistoryDrawerOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
