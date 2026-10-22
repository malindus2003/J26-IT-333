import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Plus,
  Boxes,
  Trash2,
  Pencil,
  Cpu,
  Wifi,
  Radio,
  RefreshCw,
  History,
  Award,
  Info,
  ShieldCheck,
  Database,
  Thermometer,
  Droplets,
  Send,
  ChefHat,
  Flame,
  Activity,
  Gauge,
  Wind,
  BookOpen
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
    id: "strawberry_fresh",
    name: "Fresh Garden Strawberry",
    category: "Fruits",
    icon: "🍓",
    identified_produce: "Strawberry",
    produce_confidence: 72.8,
    produce_icon: "🍓",
    scientific_name: "Fragaria × ananassa",
    container: "Container #C-107 (Zone 1: Fruit Chiller 4°C)",
    imageUrl: "/images/specimens/strawberry_fresh.jpg",
    remoteFallbackUrl: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&auto=format&fit=crop&q=80",
    ripeness_stage: "Ripe / Optimal (Grade A)",
    ripeness_percent: 15,
    visual_spoilage_score: 8.5,
    risk_level: "Low",
    discoloration_score: 1.2,
    mould_detected: false,
    mould_coverage: 0.0,
    mould_confidence: 2.9,
    texture_degradation: 4.0,
    baseline_shelf_life_hours: 120.0,
    remaining_shelf_life_hours: 91.3,
    detected_defects: [
      "Firm epidermal achenes",
      "Vibrant anthocyanin pigmentation (No fungal growth)"
    ],
    bounding_boxes: [
      { label: "HEALTHY TISSUE", type: "fresh", x: 20, y: 18, width: 60, height: 64, color: "#10b981" }
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

const DEFAULT_SYSTEM_STORAGES = [
  {
    id: "storage-1",
    name: "Storage 1: Tropical Chiller",
    category: "Chilled Chamber (Fruit & Veg)",
    target_temp: 11.0,
    current_temp: 11.4,
    target_humidity: 89.0,
    current_humidity: 90.2,
    voc: 0.32,
    co2: 415.0,
    nh3: 0.02,
    status: "optimal",
    node_id: "ESP32-NODE-01 (Active)",
    assignedProduce: {
      presetId: "banana_embul_fresh",
      produceName: "Embul Banana (Ambul Kesel)",
      category: "Fruits",
      imageUrl: "/images/specimens/banana_fresh.jpg",
      cvResult: SAMPLE_PRESETS[0]
    }
  }
];

const getStorageInspection = (storage) => {
  if (storage?.assignedProduce?.cvResult) {
    return storage.assignedProduce;
  }
  const preset = SAMPLE_PRESETS.find(p => p.id === storage?.assignedProduce?.presetId) || SAMPLE_PRESETS[0];
  return {
    presetId: preset.id,
    produceName: preset.name,
    category: preset.category,
    imageUrl: preset.imageUrl,
    cvResult: preset
  };
};

export default function VisionInspector({ zones = [], onRefreshTelemetry, onInspectionComplete, isDarkMode, targetProduce }) {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [selectedRiskFilter, setSelectedRiskFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("compact"); // 'compact' | 'grid'
  const [specimenDropdownOpen, setSpecimenDropdownOpen] = useState(false);
  // Storage Chamber Management (Each storage has its own scoped produce inspection & RSL telemetry)
  const [storages, setStorages] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_restaurant_storages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.id && parsed[0]?.name) {
          return parsed.map((s, idx) => {
            if (!s.assignedProduce || !s.assignedProduce.cvResult) {
              const defaultPreset = SAMPLE_PRESETS[idx % SAMPLE_PRESETS.length] || SAMPLE_PRESETS[0];
              return {
                ...s,
                assignedProduce: {
                  presetId: defaultPreset.id,
                  produceName: defaultPreset.name,
                  category: defaultPreset.category,
                  imageUrl: defaultPreset.imageUrl,
                  cvResult: defaultPreset
                }
              };
            }
            return s;
          });
        }
      }
    } catch {}
    return DEFAULT_SYSTEM_STORAGES;
  });
  const [selectedStorageId, setSelectedStorageId] = useState(null);
  const [isAddStorageModalOpen, setIsAddStorageModalOpen] = useState(false);
  const [isChangeProduceModalOpen, setIsChangeProduceModalOpen] = useState(false);
  const [newStorageForm, setNewStorageForm] = useState({
    name: "",
    category: "Chilled Cold Room (1°C - 5°C)",
    target_temp: "4.0",
    target_humidity: "85",
    node_id: "",
    preset_id: "lettuce_crisp"
  });

    const handleAddStorage = (e) => {
    e.preventDefault();
    if (!newStorageForm.name.trim()) return;
    const selectedPreset = SAMPLE_PRESETS.find(p => p.id === newStorageForm.preset_id) || SAMPLE_PRESETS[5] || SAMPLE_PRESETS[0];
    const newStorage = {
      id: `storage-${Date.now()}`,
      name: newStorageForm.name.trim(),
      category: newStorageForm.category,
      target_temp: parseFloat(newStorageForm.target_temp) || 4.0,
      current_temp: parseFloat(newStorageForm.target_temp) || 4.0,
      target_humidity: parseFloat(newStorageForm.target_humidity) || 85.0,
      current_humidity: parseFloat(newStorageForm.target_humidity) || 85.0,
      voc: 0.18,
      status: "optimal",
      node_id: newStorageForm.node_id.trim() || `ESP32-NODE-0${storages.length + 1}`,
      assignedProduce: {
        presetId: selectedPreset.id,
        produceName: selectedPreset.name,
        category: selectedPreset.category,
        imageUrl: selectedPreset.imageUrl,
        cvResult: selectedPreset
      }
    };
    const updated = [...storages, newStorage];
    setStorages(updated);
    try {
      localStorage.setItem('smart_restaurant_storages', JSON.stringify(updated));
    } catch {}

    // Immediately select and assign view to the newly created storage
    setSelectedStorageId(newStorage.id);
    setCurrentContainerName(newStorage.name);
    setSelectedPresetId(selectedPreset.id);
    setPreviewImage(selectedPreset.imageUrl);
    setCvResult(selectedPreset);
    if (onInspectionComplete) {
      onInspectionComplete(selectedPreset);
    }

    setIsAddStorageModalOpen(false);
    setNewStorageForm({
      name: "",
      category: "Chilled Cold Room (1°C - 5°C)",
      target_temp: "4.0",
      target_humidity: "85",
      node_id: "",
      preset_id: "lettuce_crisp"
    });
  };

  const handleDeleteCustomStorage = (storageId, e) => {
    e.stopPropagation();
    if (storageId === "storage-1") return; // Primary Storage 1 cannot be deleted
    const updated = storages.filter(s => s.id !== storageId);
    setStorages(updated);
    try {
      localStorage.setItem('smart_restaurant_storages', JSON.stringify(updated));
    } catch {}
    if (selectedStorageId === storageId) {
      setSelectedStorageId(null);
    }
    const primaryContainer = storages[0]?.containers[0]?.name || "Container #C-101 (Zone 1: Fruit Chiller 11°C)";
    setCurrentContainerName(primaryContainer);
  };
  // Edit & Delete Storage State
  const [editingStorage, setEditingStorage] = useState(null);
  const [editStorageForm, setEditStorageForm] = useState({
    name: "",
    category: "Chilled Cold Room (1°C - 5°C)",
    target_temp: "4.0",
    current_temp: "4.0",
    target_humidity: "85",
    current_humidity: "85",
    node_id: "",
    preset_id: ""
  });
  const [storageToDelete, setStorageToDelete] = useState(null);

  // Switch active storage chamber and load its assigned produce & telemetry
  const handleSelectStorage = (storage) => {
    if (selectedStorageId === storage.id) {
      setSelectedStorageId(null);
      return;
    }
    setSelectedStorageId(storage.id);
    setCurrentContainerName(storage.name);
    const insp = getStorageInspection(storage);
    setSelectedPresetId(insp.presetId);
    setPreviewImage(insp.imageUrl);
    setCvResult(insp.cvResult);
    if (onInspectionComplete) {
      onInspectionComplete(insp.cvResult);
    }
  };

  // Update the currently active storage's assigned produce AND dynamically synchronize IoT telemetry
  const updateActiveStorageInspection = async (presetOrCvResult, imageUrl) => {
    if (!selectedStorageId) return;

    const visualScore = presetOrCvResult?.visual_spoilage_score !== undefined 
      ? presetOrCvResult.visual_spoilage_score 
      : (presetOrCvResult?.ripeness_percent || 15);
    const isMould = Boolean(presetOrCvResult?.mould_detected);
    const isCritical = presetOrCvResult?.risk_level === 'Critical' || visualScore >= 65.0 || isMould;
    const isWarning = !isCritical && (presetOrCvResult?.risk_level === 'High' || visualScore >= 45.0);

    let synchronizedTelemetry = null;

    const updated = storages.map(s => {
      if (s.id === selectedStorageId) {
        const targetTemp = Number(s.target_temp || 11.0);
        const targetHum = Number(s.target_humidity || 89.0);

        let newTemp, newHum, newVoc, newCo2, newStatus;

        if (isCritical) {
          // SPOILED: Thermal runaway respiration, elevated ethylene & decay volatiles
          newTemp = Math.round((targetTemp + 9.5) * 10) / 10;
          newHum = Math.round(Math.max(68.0, targetHum - 16.0) * 10) / 10;
          newVoc = 0.88;
          newCo2 = 1250;
          newStatus = "warning";
        } else if (isWarning) {
          // NEAR SPOIL / OVERRIPE: Rising respiration & ripening gas emission
          newTemp = Math.round((targetTemp + 4.2) * 10) / 10;
          newHum = Math.round(Math.max(74.0, targetHum - 9.0) * 10) / 10;
          newVoc = 0.45;
          newCo2 = 780;
          newStatus = "warning";
        } else {
          // FRESH / OPTIMAL: Steady target cold chain, hydrated turgor, clean dormancy baseline
          newTemp = Math.round((targetTemp + 0.4) * 10) / 10;
          newHum = Math.round(targetHum * 10) / 10;
          newVoc = 0.18;
          newCo2 = 415;
          newStatus = "optimal";
        }

        synchronizedTelemetry = {
          storage_zone: s.name,
          temperature: newTemp,
          humidity: newHum,
          voc: newVoc,
          co2: newCo2,
          nh3: isCritical ? 0.045 : 0.015
        };

        return {
          ...s,
          current_temp: newTemp,
          current_humidity: newHum,
          voc: newVoc,
          co2: newCo2,
          status: newStatus,
          assignedProduce: {
            presetId: presetOrCvResult.id || s.assignedProduce?.presetId || null,
            produceName: presetOrCvResult.identified_produce || presetOrCvResult.name || s.assignedProduce?.produceName || "Produce",
            category: presetOrCvResult.category || s.assignedProduce?.category || "Fruits",
            imageUrl: imageUrl || presetOrCvResult.imageUrl || s.assignedProduce?.imageUrl,
            cvResult: presetOrCvResult
          }
        };
      }
      return s;
    });

    setStorages(updated);
    try {
      localStorage.setItem('smart_restaurant_storages', JSON.stringify(updated));
    } catch {}

    // Transmit to FastAPI backend REST telemetry endpoint so system dashboards update in sync
    if (synchronizedTelemetry) {
      try {
        await axios.post("http://localhost:8000/api/sensors/telemetry", synchronizedTelemetry);
        if (onRefreshTelemetry) onRefreshTelemetry();
        setLastSensorSyncTime(new Date().toLocaleTimeString());
      } catch (err) {
        console.warn("Sensor sync broadcast error:", err);
      }
    }
  };

  const handleOpenEditStorage = (storage, e) => {
    e.stopPropagation();
    setEditingStorage(storage);
    const insp = getStorageInspection(storage);
    setEditStorageForm({
      name: storage.name || "",
      category: storage.category || "Chilled Cold Room (1°C - 5°C)",
      target_temp: String(storage.target_temp ?? 4.0),
      current_temp: String(storage.current_temp ?? storage.target_temp ?? 4.0),
      target_humidity: String(storage.target_humidity ?? 85.0),
      current_humidity: String(storage.current_humidity ?? storage.target_humidity ?? 85.0),
      node_id: storage.node_id || "",
      preset_id: insp.presetId || SAMPLE_PRESETS[0].id
    });
  };

  const handleUpdateStorage = (e) => {
    e.preventDefault();
    if (!editingStorage || !editStorageForm.name.trim()) return;

    const chosenPreset = SAMPLE_PRESETS.find(p => p.id === editStorageForm.preset_id);

    const updated = storages.map(s => {
      if (s.id === editingStorage.id) {
        const currentInsp = getStorageInspection(s);
        const newInsp = chosenPreset ? {
          presetId: chosenPreset.id,
          produceName: chosenPreset.name,
          category: chosenPreset.category,
          imageUrl: chosenPreset.imageUrl,
          cvResult: chosenPreset
        } : currentInsp;

        return {
          ...s,
          name: editStorageForm.name.trim(),
          category: editStorageForm.category,
          target_temp: parseFloat(editStorageForm.target_temp) || s.target_temp,
          current_temp: parseFloat(editStorageForm.current_temp) || s.current_temp,
          target_humidity: parseFloat(editStorageForm.target_humidity) || s.target_humidity,
          current_humidity: parseFloat(editStorageForm.current_humidity) || s.current_humidity,
          node_id: editStorageForm.node_id.trim() || s.node_id,
          assignedProduce: newInsp
        };
      }
      return s;
    });

    setStorages(updated);
    try {
      localStorage.setItem('smart_restaurant_storages', JSON.stringify(updated));
    } catch {}

    if (selectedStorageId === editingStorage.id) {
      setCurrentContainerName(editStorageForm.name.trim());
      if (chosenPreset) {
        setSelectedPresetId(chosenPreset.id);
        setPreviewImage(chosenPreset.imageUrl);
        setCvResult(chosenPreset);
        if (onInspectionComplete) onInspectionComplete(chosenPreset);
      }
    }
    setEditingStorage(null);
  };

  const handlePromptDeleteStorage = (storage, e) => {
    e.stopPropagation();
    setStorageToDelete(storage);
  };

  const handleConfirmDeleteStorage = () => {
    if (!storageToDelete) return;
    if (storages.length <= 1) {
      setStorageToDelete(null);
      return;
    }
    const updated = storages.filter(s => s.id !== storageToDelete.id);
    setStorages(updated);
    try {
      localStorage.setItem('smart_restaurant_storages', JSON.stringify(updated));
    } catch {}

    if (selectedStorageId === storageToDelete.id) {

      setSelectedStorageId(null);
    }
    setStorageToDelete(null);
  };

  const activeStorage = selectedStorageId ? (storages.find(s => s?.id === selectedStorageId) || null) : null;
  const [selectedPresetId, setSelectedPresetId] = useState(() => activeStorage?.assignedProduce?.presetId || SAMPLE_PRESETS[0].id);
  const [previewImage, setPreviewImage] = useState(SAMPLE_PRESETS[0].imageUrl);
  const [currentContainerName, setCurrentContainerName] = useState(SAMPLE_PRESETS[0]?.container || "Container #C-101 (Zone 1: Fruit Chiller 11°C)");
  const [analyzing, setAnalyzing] = useState(false);
  const [cvResult, setCvResult] = useState(SAMPLE_PRESETS[0]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [targetProduceSelection, setTargetProduceSelection] = useState("auto");

  // Auto-select specimen preset when navigating from Inventory or Executive hub
  useEffect(() => {
    if (!targetProduce) return;
    const term = targetProduce.toLowerCase().trim();
    const matchedPreset = SAMPLE_PRESETS.find(p => {
      const pn = p.name.toLowerCase();
      const pi = (p.identified_produce || "").toLowerCase();
      const pid = p.id.toLowerCase();
      return pn.includes(term) || term.includes(pn) || pi.includes(term) || term.includes(pi) ||
        (term.includes("banana") && pid.includes("banana")) ||
        (term.includes("mango") && pid.includes("mango")) ||
        (term.includes("papaya") && (pid.includes("peach") || pid.includes("banana"))) ||
        (term.includes("strawberr") && pid.includes("strawberr")) ||
        (term.includes("tomato") && pid.includes("tomato")) ||
        (term.includes("spinach") && pid.includes("spinach")) ||
        (term.includes("kankun") && pid.includes("spinach")) ||
        (term.includes("gotukola") && pid.includes("spinach")) ||
        (term.includes("lettuce") && pid.includes("lettuce")) ||
        (term.includes("avocado") && pid.includes("avocado"));
    });
    if (matchedPreset) {
      const targetStorage = storages.find(s => 
        (s.assignedProduce?.produceName || "").toLowerCase().includes(term) ||
        (s.assignedProduce?.presetId || "").toLowerCase().includes(term)
      ) || storages[0];
      if (targetStorage) {
        setSelectedStorageId(targetStorage.id);
        setCurrentContainerName(targetStorage.name);
      }
      setSelectedPresetId(matchedPreset.id);
      setPreviewImage(matchedPreset.imageUrl);
      setCvResult(matchedPreset);
      if (onInspectionComplete) onInspectionComplete(matchedPreset);
    }
  }, [targetProduce]);

  // Unified Multi-Modal Simulation Override for testing Fresh vs ~75% Spoilage
  const [simulationSpoilageOverride, setSimulationSpoilageOverride] = useState(null);
  const [dispatchedKds, setDispatchedKds] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

    // Live IoT Telemetry Synchronization State
  const [isSyncingSensors, setIsSyncingSensors] = useState(false);
  const [lastSensorSyncTime, setLastSensorSyncTime] = useState(() => new Date().toLocaleTimeString());
  const [isSensorModalOpen, setIsSensorModalOpen] = useState(false);
  const [sensorUpdateForm, setSensorUpdateForm] = useState({
    temperature: 11.4,
    humidity: 90.2,
    voc: 0.32,
    co2: 415.0,
    nh3: 0.02
  });

  const updateStoragesWithLiveTelemetry = useCallback((liveZones) => {
    if (!Array.isArray(liveZones) || liveZones.length === 0) return;
    setStorages(prevStorages => {
      let changed = false;
      const updated = prevStorages.map((storage, idx) => {
        const matchedZone = liveZones.find(z => 
          z.id === storage.zone_id || 
          z.id === storage.id || 
          (storage.name && z.name && storage.name.toLowerCase().includes(z.name.toLowerCase().slice(0, 6))) ||
          (idx === 0 && (z.id === 'zone-fruit' || z.name?.includes('Zone 1') || z.name?.includes('Storage 1') || z.name?.toLowerCase().includes('fruit'))) ||
          (idx === 1 && (z.id === 'zone-veg' || z.name?.includes('Zone 2') || z.name?.includes('Storage 2') || z.name?.toLowerCase().includes('crisper') || z.name?.toLowerCase().includes('leafy'))) ||
          (idx === 2 && (z.id === 'zone-root' || z.name?.includes('Zone 3') || z.name?.includes('Storage 3') || z.name?.toLowerCase().includes('root'))) ||
          (idx === 3 && (z.id === 'zone-ambient' || z.name?.includes('Zone 4') || z.name?.includes('Storage 4') || z.name?.toLowerCase().includes('ambient')))
        ) || liveZones[idx % liveZones.length];

        if (!matchedZone) return storage;

        const newTemp = matchedZone.current_temp !== undefined ? Number(matchedZone.current_temp) : storage.current_temp;
        const newHumidity = matchedZone.current_humidity !== undefined ? Number(matchedZone.current_humidity) : storage.current_humidity;
        const newVoc = matchedZone.voc !== undefined ? Number(matchedZone.voc) : storage.voc;
        const newCo2 = matchedZone.co2 !== undefined ? Number(matchedZone.co2) : storage.co2;
        const newNh3 = matchedZone.nh3 !== undefined ? Number(matchedZone.nh3) : storage.nh3;
        const newStatus = matchedZone.status || storage.status;

        if (
          storage.current_temp !== newTemp ||
          storage.current_humidity !== newHumidity ||
          storage.voc !== newVoc ||
          storage.co2 !== newCo2 ||
          storage.nh3 !== newNh3 ||
          storage.status !== newStatus
        ) {
          changed = true;
          return {
            ...storage,
            current_temp: newTemp,
            current_humidity: newHumidity,
            voc: newVoc,
            co2: newCo2,
            nh3: newNh3,
            status: newStatus
          };
        }
        return storage;
      });

      if (changed) {
        try {
          localStorage.setItem('smart_restaurant_storages', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      }
      return prevStorages;
    });
  }, []);

  const fetchLiveSensors = useCallback(async () => {
    setIsSyncingSensors(true);
    try {
      const res = await axios.get("http://localhost:8000/api/sensors/zones");
      if (res.data?.zones) {
        updateStoragesWithLiveTelemetry(res.data.zones);
        setLastSensorSyncTime(new Date().toLocaleTimeString());
      }
    } catch (err) {
      // silent fallback
    } finally {
      setIsSyncingSensors(false);
    }
  }, [updateStoragesWithLiveTelemetry]);

  useEffect(() => {
    fetchLiveSensors();
    const timer = setInterval(fetchLiveSensors, 3000);
    return () => clearInterval(timer);
  }, [fetchLiveSensors]);

  useEffect(() => {
    if (zones && zones.length > 0) {
      updateStoragesWithLiveTelemetry(zones);
    }
  }, [zones, updateStoragesWithLiveTelemetry]);

  const handleTransmitTelemetry = async (e) => {
    if (e) e.preventDefault();
    try {
      const payload = {
        storage_zone: activeStorage?.name || "Zone 1: Tropical Fruit Chiller (11°C)",
        temperature: Number(sensorUpdateForm.temperature),
        humidity: Number(sensorUpdateForm.humidity),
        voc: Number(sensorUpdateForm.voc),
        co2: Number(sensorUpdateForm.co2),
        nh3: Number(sensorUpdateForm.nh3)
      };

      await axios.post("http://localhost:8000/api/sensors/telemetry", payload);

      setStorages(prev => {
        const updated = prev.map(s => {
          if (s.id === activeStorage.id) {
            return {
              ...s,
              current_temp: payload.temperature,
              current_humidity: payload.humidity,
              voc: payload.voc,
              co2: payload.co2,
              nh3: payload.nh3,
              status: (Math.abs(payload.temperature - (s.target_temp || 11.0)) > 3.5 || payload.voc > 0.6 || payload.nh3 > 0.05 || payload.co2 > 1100.0 || payload.humidity > 96.0 || payload.humidity < 70.0) ? 'warning' : 'optimal'
            };
          }
          return s;
        });
        try {
          localStorage.setItem('smart_restaurant_storages', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      setLastSensorSyncTime(new Date().toLocaleTimeString());
      setIsSensorModalOpen(false);
      showToast(`✓ Live telemetry transmitted to ${activeStorage.name} (${payload.temperature}°C, ${payload.voc} ppm VOC)!`);

      if (onRefreshTelemetry) {
        onRefreshTelemetry();
      }
    } catch (err) {
      console.error("Failed to transmit telemetry:", err);
      showToast("Error transmitting telemetry. Ensure backend is running.");
    }
  };

  const applySensorPreset = (presetType) => {
    if (presetType === 'optimal') {
      setSensorUpdateForm({
        temperature: Number(activeStorage?.target_temp || 11.0),
        humidity: Number(activeStorage?.target_humidity || 89.0),
        voc: 0.22,
        co2: 430.0,
        nh3: 0.015
      });
    } else if (presetType === 'door_ajar') {
      setSensorUpdateForm({
        temperature: Number(activeStorage?.target_temp || 11.0) + 9.5,
        humidity: 74.0,
        voc: 0.65,
        co2: 890.0,
        nh3: 0.032
      });
    } else if (presetType === 'near_spoil') {
      setSensorUpdateForm({
        temperature: 28.5,
        humidity: 66.0,
        voc: 1.85,
        co2: 1350.0,
        nh3: 0.065
      });
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleSimulation = () => {
    if (simulationSpoilageOverride !== null) {
      setSimulationSpoilageOverride(null);
      showToast("Reset to real live inspection & sensor telemetry data.");
    } else {
      setSimulationSpoilageOverride(76.5);
      showToast("Simulated ~76.5% Spoilage Threshold. Near-spoilage recipe directive activated!");
    }
  };

  const handleDispatchKDSUnified = (recipeTitle, station) => {
    setDispatchedKds(true);
    showToast(`✓ "${recipeTitle}" dispatched to Kitchen KDS (${station})!`);
  };

  // Recipe Directive Generator for active produce when near spoil (~75%)
  const getProduceRecipeDirective = (produceName, category, spoilageScore) => {
    const name = (produceName || "Perishable Produce").toLowerCase();
    const score = Math.round(spoilageScore);

    if (name.includes("mango")) {
      return {
        recipeTitle: "Fresh Mango Nectar, Smoothies & Dessert Coulis",
        station: "Bar & Beverage / Dessert Station",
        prepTimeMinutes: 15,
        yieldPortions: "12 - 14 Servings",
        extendedShelfLife: "+5 Days Chilled / +3 Months Frozen",
        wasteCost: 38.40,
        directive: `Softening cuticle and high ethylene detected (${score}% spoilage). Divert ${produceName} immediately to bar cocktail prep and dessert coulis before fermentation sets in.`,
        steps: [
          "Peel skin and cut pulp away from seed; discard bruised epidermal spots.",
          "Puree 70% of pulp in high-speed blender with lime juice and ginger syrup until silky smooth.",
          "Decant half into bar dispensers for today's lunch brunch cocktails and mocktails.",
          "Portion remaining coulis into 500ml vacuum bags and freeze for weekly mango cheesecake topping."
        ]
      };
    } else if (name.includes("banana")) {
      return {
        recipeTitle: "Spiced Artisan Banana Bread & Breakfast Parfait",
        station: "Bakery & Pastry Counter",
        prepTimeMinutes: 25,
        yieldPortions: "3 Signature Loaves (24 Slices)",
        extendedShelfLife: "+4 Days Baked / +60 Days Frozen",
        wasteCost: 26.00,
        directive: `Senescent sugar spotting and high softening detected (${score}% spoilage). Peak natural fructose makes this ideal for zero-sugar added commercial baking.`,
        steps: [
          "Mash bananas with a fork; their high moisture creates an extra tender crumb.",
          "Fold into batter with Ceylon cinnamon and fold gently with roasted walnuts.",
          "Bake at 175°C for 50 minutes until golden brown.",
          "Slice extra bananas into rounds and freeze flat on sheet trays for morning smoothie station."
        ]
      };
    } else if (name.includes("strawberry") || name.includes("strawberr") || name.includes("berry")) {
      return {
        recipeTitle: "Warm Strawberry-Basil Compote & Waffle Glaze",
        station: "Morning Grill & Dessert Bar",
        prepTimeMinutes: 12,
        yieldPortions: "10 Portions",
        extendedShelfLife: "+6 Days Jarred & Chilled",
        wasteCost: 32.00,
        directive: `Tissue breakdown and softening detected (${score}% spoilage). Immediate heat reduction locks natural pectin and halts decomposition.`,
        steps: [
          "Rinse and hull strawberries, halving larger berries.",
          "Simmer in wide saucepan with sugar and lemon juice over medium flame for 8-10 minutes.",
          "Remove from heat, fold in fresh basil chiffonade for aroma, and let cool slightly.",
          "Serve warm over morning waffles, vanilla bean ice cream, or chill for dessert buffet."
        ]
      };
    } else if (name.includes("tomato")) {
      return {
        recipeTitle: "Slow-Roasted Garlic-Herb Tomato Marinara Base",
        station: "Hot Line & Sauté Station",
        prepTimeMinutes: 35,
        yieldPortions: "16 - 18 Servings (2.5 Liters)",
        extendedShelfLife: "+7 Days Chilled / +6 Months Frozen",
        wasteCost: 28.50,
        directive: `Overripe softening and skin cracking detected (${score}% spoilage). Peak acidity and natural lycopene sugars make this optimal for rich savory reduction sauces.`,
        steps: [
          "Toss quartered tomatoes with olive oil, crushed garlic, and fresh herbs.",
          "Roast on hotel pans at 190°C for 25 minutes until blistered and caramelized.",
          "Transfer to stockpot, simmer with cracked pepper for 10 minutes, and pulse with immersion blender.",
          "Label as 'House Roasted Marinara Base' for pizza, pasta stations, and shakshuka service."
        ]
      };
    } else if (name.includes("lettuce") || name.includes("spinach") || name.includes("green") || name.includes("salad")) {
      return {
        recipeTitle: "Velvety Green Herb Soup & Stock Reduction",
        station: "Prep Kitchen & Soup Station",
        prepTimeMinutes: 20,
        yieldPortions: "12 Bowls",
        extendedShelfLife: "+4 Days Chilled / +2 Months Frozen",
        wasteCost: 19.80,
        directive: `Cellular dehydration and wilting detected (${score}% spoilage). While unsuitable for raw salads, high chlorophyll and dietary fiber make exquisite velvet soups.`,
        steps: [
          "Blanch wilted greens in salted boiling water for 45 seconds, then shock in ice bath to preserve vibrant emerald green.",
          "Sauté shallots and leeks, add potatoes and vegetable broth; simmer until tender.",
          "Add blanched greens at the very end and blend immediately to retain bright green color.",
          "Finish with extra virgin olive oil swirl and garlic croutons as soup of the day."
        ]
      };
    } else if (name.includes("carrot")) {
      return {
        recipeTitle: "Pickled Ginger-Carrot Ribbons & Slaw Topping",
        station: "Cold Larder & Garde Manger",
        prepTimeMinutes: 15,
        yieldPortions: "25 Portions (Garnish / Slaw)",
        extendedShelfLife: "+30 Days (Pickled in Brine)",
        wasteCost: 22.00,
        directive: `Root flaccidity and surface moisture loss detected (${score}% spoilage). Acidic pickling brine will completely restore crisp texture.`,
        steps: [
          "Using a mandoline or Y-peeler, shave carrots into long thin ribbons.",
          "Bring vinegar, water, sugar, and spices to a quick boil; pour hot pickling liquid over carrot ribbons.",
          "Allow to cool to room temperature; the acidity crisps the carrots back to a crunch.",
          "Use as signature condiment on banh mi, grain bowls, and grilled sandwiches."
        ]
      };
    } else {
      return {
        recipeTitle: `Fresh ${produceName} Culinary Reduction`,
        station: category === "Fruits" ? "Bar & Dessert Station" : "Prep Kitchen & Hot Line",
        prepTimeMinutes: 18,
        yieldPortions: "10 Servings",
        extendedShelfLife: "+5 Days Chilled / +2 Months Frozen",
        wasteCost: 24.00,
        directive: `Produce softening detected (${score}% spoilage). Process into culinary reduction to prevent spoilage loss.`,
        steps: [
          `Trim and inspect ${produceName}; discard damaged surface areas.`,
          "Process according to culinary style: blend for puree/coulis, or sauté for sauce base.",
          "Season with citrus or salt to stabilize shelf life, cool and store at 2°C - 4°C."
        ]
      };
    }
  };


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

  // Produce Encyclopedia Modal & Inspection Knowledge Base
  const [isEncyclopediaModalOpen, setIsEncyclopediaModalOpen] = useState(false);
  const [encyclopediaItems, setEncyclopediaItems] = useState([]);
  const [encyclopediaLoading, setEncyclopediaLoading] = useState(false);
  const [encyclopediaSearch, setEncyclopediaSearch] = useState('');
  const [encyclopediaCategory, setEncyclopediaCategory] = useState('all');
  const [selectedEncyclopediaProduce, setSelectedEncyclopediaProduce] = useState(null);

  const fetchEncyclopedia = async (cat = 'all', q = '') => {
    setEncyclopediaLoading(true);
    try {
      const url = `http://localhost:8000/api/vision/produce-encyclopedia?category=${cat}&search=${encodeURIComponent(q)}`;
      const res = await axios.get(url);
      if (res.data?.items) {
        setEncyclopediaItems(res.data.items);
        if (res.data.items.length > 0) {
          setSelectedEncyclopediaProduce(prev => {
            if (prev) {
              const matched = res.data.items.find(i => i.produce_name === prev.produce_name);
              return matched || res.data.items[0];
            }
            return res.data.items[0];
          });
        }
      }
    } catch (e) {
      console.warn("Could not fetch produce encyclopedia:", e);
    } finally {
      setEncyclopediaLoading(false);
    }
  };

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
    setCurrentContainerName(`${activeStorage?.name || 'Storage'} - ${preset.name}`);
    setPreviewImage(preset.imageUrl);
    setCvResult(preset);
    setSpecimenDropdownOpen(false);
    updateActiveStorageInspection(preset, preset.imageUrl);

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
    const file = e.target.files?.[0];
    if (file) {
      setCurrentContainerName("Scanning Uploaded Specimen...");
      setSelectedPresetId(null);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target.result;
        setPreviewImage(dataUrl);
        setCvResult(prev => ({
          ...prev,
          bounding_boxes: [],
          identified_produce: "Analyzing Specimen..."
        }));
        await runBackendAnalysis(dataUrl, cvResult?.category || "Fruits");
      };
      reader.readAsDataURL(file);
    }
    if (e.target) {
      e.target.value = '';
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
    setCvResult(prev => ({
      ...prev,
      bounding_boxes: [],
      identified_produce: "Analyzing Specimen..."
    }));
    runBackendAnalysis(dataUrl, cvResult?.category || "Fruits");
  };

  const runBackendAnalysis = async (imageDataUrl, targetCategory) => {
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("category", targetCategory);
      formData.append("image_base64", imageDataUrl);
      if (targetProduceSelection && targetProduceSelection !== "auto") {
        formData.append("expected_produce", targetProduceSelection);
      }

      const res = await axios.post("http://localhost:8000/api/vision/inspect", formData);
      const feat = res.data.features || res.data;
      setCvResult(feat);
      updateActiveStorageInspection(feat, imageDataUrl);
      if (feat.identified_produce) {
        setCurrentContainerName(`Detected: ${feat.identified_produce} (${feat.category || targetCategory})`);
      }
      fetchHistory();
      if (onInspectionComplete) {
        onInspectionComplete(feat);
      }
    } catch (err) {
      console.error("CV inspection error:", err);
      setToastMessage("Vision API Error: Backend server is unreachable at http://localhost:8000. Please start the backend service.");
      setTimeout(() => setToastMessage(null), 6000);
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
        updateActiveStorageInspection(feat, data.image_base64);
      } else {
        updateActiveStorageInspection(feat, previewImage);
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
            type="button"
            onClick={() => {
              setIsEncyclopediaModalOpen(true);
              fetchEncyclopedia(encyclopediaCategory, encyclopediaSearch);
            }}
            className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-700/20 transition-all cursor-pointer active:scale-95"
            title="Open Produce Encyclopedia with Surface & Color Criteria for 47 Fruits & Vegetables"
          >
            <BookOpen className="h-4 w-4 text-emerald-200" />
            <span>Produce Encyclopedia</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-900/90 text-emerald-200 font-mono font-bold">47</span>
          </button>
        </div>
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
          SECTION: STORAGE CHAMBER SELECTOR & MULTI-STORAGE MANAGEMENT
          ───────────────────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#f8faf9] dark:bg-slate-800/80 border border-[#d1ded5] dark:border-slate-700 space-y-4 shadow-2xs">
        
        {/* Top Header Row: Chamber Overview & Add Storage Trigger */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e1eae4] dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <Boxes className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                Active Storage Units
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                {storages.length} Configured
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Select a storage chamber to monitor telemetry, or register a new storage unit.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddStorageModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-700/20 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Add Storage</span>
          </button>
        </div>

        {/* Storage Units Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {storages.map((storage) => {
            const isSelected = selectedStorageId === storage.id;
            return (
              <div
                key={storage.id}
                onClick={() => handleSelectStorage(storage)} className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-600 dark:border-emerald-500 shadow-sm ring-1 ring-emerald-500/40'
                    : 'bg-white dark:bg-slate-900 border-[#d1ded5] dark:border-slate-700 hover:border-emerald-400 hover:bg-emerald-50/30 dark:hover:bg-slate-800/60 shadow-2xs'
                }`}
              >
                {/* Active indicator line */}
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                )}

                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`p-2 rounded-xl flex-shrink-0 ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}>
                      <Boxes className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {storage.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {storage.category}
                      </div>
                    </div>
                  </div>

                  {/* Edit & Delete Storage Action Buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleOpenEditStorage(storage, e)}
                      title={`Edit ${storage.name}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handlePromptDeleteStorage(storage, e)}
                      disabled={storages.length <= 1}
                      title={storages.length <= 1 ? "At least one storage unit must remain active" : `Delete ${storage.name}`}
                      className={`p-1.5 rounded-lg transition-colors ${
                        storages.length <= 1
                          ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-40'
                          : 'text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 cursor-pointer'
                      }`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Telemetry Summary Bar */}
                <div className="grid grid-cols-3 gap-1.5 py-1.5 px-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1">
                    <Thermometer className="h-3 w-3 text-rose-500" />
                    <span>{storage.current_temp}°C</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets className="h-3 w-3 text-sky-500" />
                    <span>{storage.current_humidity}%</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold truncate">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="truncate">{storage.status}</span>
                  </div>
                </div>

                {/* Hardware Node Badge */}
                <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  <span>Hardware Node:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-mono text-[9px]">{storage.node_id}</span>
                </div>

                {/* Assigned Produce Pill */}
                <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[10px]">
                  <span className="font-bold text-slate-500 dark:text-slate-400">Assigned Produce:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 truncate max-w-[140px]">
                    <span>{storage.assignedProduce?.cvResult?.produce_icon || "🍎"}</span>
                    <span className="truncate">{storage.assignedProduce?.produceName || "Embul Banana"}</span>
                  </span>
                </div>
                {/* Inspection Status Pill */}
                <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[10px]">
                  <span className="font-bold text-slate-500 dark:text-slate-400">Chamber View:</span>
                  {isSelected ? (
                    <span className="font-extrabold px-2 py-0.5 rounded-full bg-emerald-700 text-white flex items-center gap-1 shadow-2xs">
                      <CheckCircle2 className="h-3 w-3" /> Active Inspection
                    </span>
                  ) : (
                    <span className="font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-800 dark:group-hover:bg-emerald-950/60 dark:group-hover:text-emerald-300 transition-colors">
                      Click to inspect →
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
</div>

      {/* Modal: Add New Storage Chamber */}
      {isAddStorageModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  <Boxes className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Register New Storage Unit
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Add cold room, crisper, or pantry storage
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddStorageModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddStorage} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block">
                  Storage Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Storage 2: Walk-In Crisper Vault"
                  value={newStorageForm.name}
                  onChange={(e) => setNewStorageForm({ ...newStorageForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block">
                  Chamber Category
                </label>
                <select
                  value={newStorageForm.category}
                  onChange={(e) => setNewStorageForm({ ...newStorageForm, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-emerald-600"
                >
                  <option value="Chilled Cold Room (1°C - 5°C)">Chilled Cold Room (1°C - 5°C)</option>
                  <option value="Deep Freeze Vault (-18°C)">Deep Freeze Vault (-18°C)</option>
                  <option value="Tropical Fruit Chiller (10°C - 12°C)">Tropical Fruit Chiller (10°C - 12°C)</option>
                  <option value="High-Humidity Crisper (4°C - 8°C)">High-Humidity Crisper (4°C - 8°C)</option>
                  <option value="Ambient Kitchen Prep Rack (25°C - 28°C)">Ambient Kitchen Prep Rack (25°C - 28°C)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block">
                    Target Temp (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newStorageForm.target_temp}
                    onChange={(e) => setNewStorageForm({ ...newStorageForm, target_temp: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block">
                    Target Humidity (%)
                  </label>
                  <input
                    type="number"
                    required
                    value={newStorageForm.target_humidity}
                    onChange={(e) => setNewStorageForm({ ...newStorageForm, target_humidity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block">
                  Hardware Node ID / ESP32 IP (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ESP32-NODE-02 or 192.168.1.150"
                  value={newStorageForm.node_id}
                  onChange={(e) => setNewStorageForm({ ...newStorageForm, node_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-emerald-600 font-mono"
                />
              </div>

                            <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block">
                  Assign Produce to Monitor in this Chamber
                </label>
                <select
                  value={newStorageForm.preset_id}
                  onChange={(e) => setNewStorageForm({ ...newStorageForm, preset_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-emerald-600"
                >
                  {SAMPLE_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.icon || '🍎'} {p.name} ({p.category} • {p.remaining_shelf_life_hours}h RSL)
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddStorageModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all active:scale-95"
                >
                  Save Storage Chamber
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal: Edit Storage Chamber */}
      {editingStorage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  <Pencil className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Edit Storage Unit
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Update temperature targets, category, and telemetry node
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingStorage(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStorage} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block">
                  Storage Name
                </label>
                <input
                  type="text"
                  required
                  value={editStorageForm.name}
                  onChange={(e) => setEditStorageForm({ ...editStorageForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block">
                  Chamber Category
                </label>
                <select
                  value={editStorageForm.category}
                  onChange={(e) => setEditStorageForm({ ...editStorageForm, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-emerald-600"
                >
                  <option value="Chilled Chamber (Fruit & Veg)">Chilled Chamber (Fruit & Veg)</option>
                  <option value="Chilled Cold Room (1°C - 5°C)">Chilled Cold Room (1°C - 5°C)</option>
                  <option value="Deep Freeze Vault (-18°C)">Deep Freeze Vault (-18°C)</option>
                  <option value="Tropical Fruit Chiller (10°C - 12°C)">Tropical Fruit Chiller (10°C - 12°C)</option>
                  <option value="High-Humidity Crisper (4°C - 8°C)">High-Humidity Crisper (4°C - 8°C)</option>
                  <option value="Ambient Kitchen Prep Rack (25°C - 28°C)">Ambient Kitchen Prep Rack (25°C - 28°C)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block">
                    Target Temp (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={editStorageForm.target_temp}
                    onChange={(e) => setEditStorageForm({ ...editStorageForm, target_temp: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block">
                    Target Humidity (%)
                  </label>
                  <input
                    type="number"
                    required
                    value={editStorageForm.target_humidity}
                    onChange={(e) => setEditStorageForm({ ...editStorageForm, target_humidity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block">
                  Hardware Node ID / ESP32 IP
                </label>
                <input
                  type="text"
                  value={editStorageForm.node_id}
                  onChange={(e) => setEditStorageForm({ ...editStorageForm, node_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-emerald-600 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingStorage(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all active:scale-95 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Modal: Change Assigned Produce for Active Storage */}
      {isChangeProduceModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-slide-up max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  <Apple className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Assign Produce Specimen to {activeStorage?.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select a produce batch to monitor with optical scanning & shelf-life prediction
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsChangeProduceModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 pr-1 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SAMPLE_PRESETS.map((preset) => {
                  const isCur = cvResult?.id === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        handleSelectPreset(preset);
                        setIsChangeProduceModalOpen(false);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                        isCur
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 shadow-xs ring-1 ring-emerald-500/30'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-2xl p-1.5 bg-slate-100 dark:bg-slate-700 rounded-xl flex-shrink-0">
                        {preset.icon || '🍎'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {preset.name}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                            preset.risk_level === 'Low'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : preset.risk_level === 'High'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-rose-100 text-rose-800 border-rose-300'
                          }`}>
                            {preset.risk_level} Risk
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {preset.category} • {preset.ripeness_stage}
                        </div>
                        <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                          Remaining Shelf-Life: {preset.remaining_shelf_life_hours}h
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsChangeProduceModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Storage Confirmation */}
      {storageToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex-shrink-0">
                <Trash2 className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Delete Storage Unit?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This action removes the storage chamber from monitoring.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
              <div className="font-bold text-slate-900 dark:text-white">{storageToDelete.name}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {storageToDelete.category} • Node: {storageToDelete.node_id}
              </div>
            </div>

            <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
              Are you sure you want to remove this unit? Its telemetry data and configuration will be removed.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setStorageToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteStorage}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Storage</span>
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ─────────────────────────────────────────────────────────────
          UNIFIED SECTION: OPTICAL COMPUTER VISION + IOT TELEMETRY
          (Both hardware units operating in the same chamber)
          ───────────────────────────────────────────────────────────── */}
      
      
      {/* Modal: Live Telemetry Update & Simulation */}
      {isSensorModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Update Chamber Sensor Telemetry
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {activeStorage?.name} • Node ID: {activeStorage?.node_id || "ESP32-NODE-01"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSensorModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick 1-Click Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-extrabold uppercase text-slate-500 block">
                Quick Simulation Presets:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => applySensorPreset('optimal')}
                  className="p-2 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 text-left hover:bg-emerald-100 transition-colors"
                >
                  <span className="text-[10px] font-bold block">1. Cold Chain Safe</span>
                  <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-mono">11°C • 89% RH</span>
                </button>
                <button
                  type="button"
                  onClick={() => applySensorPreset('door_ajar')}
                  className="p-2 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 text-left hover:bg-amber-100 transition-colors"
                >
                  <span className="text-[10px] font-bold block">2. Temp Elevation</span>
                  <span className="text-[9px] text-amber-700 dark:text-amber-400 font-mono">20.5°C • 74% RH</span>
                </button>
                <button
                  type="button"
                  onClick={() => applySensorPreset('near_spoil')}
                  className="p-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/60 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300 text-left hover:bg-rose-100 transition-colors"
                >
                  <span className="text-[10px] font-bold block">3. Gas Spike (~75%)</span>
                  <span className="text-[9px] text-rose-700 dark:text-rose-400 font-mono">28.5°C • 1.85 VOC</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleTransmitTelemetry} className="space-y-4 pt-1">
              
              {/* Temperature */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Thermometer className="h-4 w-4 text-rose-500" /> Temperature (°C)
                  </span>
                  <span className="font-mono text-sm font-black text-rose-600 dark:text-rose-400">
                    {sensorUpdateForm.temperature}°C
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="0.5"
                  value={sensorUpdateForm.temperature}
                  onChange={(e) => setSensorUpdateForm({ ...sensorUpdateForm, temperature: parseFloat(e.target.value) })}
                  className="w-full accent-rose-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              {/* Humidity */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Droplets className="h-4 w-4 text-sky-500" /> Relative Humidity (% RH)
                  </span>
                  <span className="font-mono text-sm font-black text-sky-600 dark:text-sky-400">
                    {sensorUpdateForm.humidity}%
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  step="1"
                  value={sensorUpdateForm.humidity}
                  onChange={(e) => setSensorUpdateForm({ ...sensorUpdateForm, humidity: parseFloat(e.target.value) })}
                  className="w-full accent-sky-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              {/* VOC */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Wind className="h-4 w-4 text-amber-500" /> VOC / Ethylene Ripening Gas (ppm)
                  </span>
                  <span className="font-mono text-sm font-black text-amber-600 dark:text-amber-400">
                    {sensorUpdateForm.voc} ppm
                  </span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="3.00"
                  step="0.01"
                  value={sensorUpdateForm.voc}
                  onChange={(e) => setSensorUpdateForm({ ...sensorUpdateForm, voc: parseFloat(e.target.value) })}
                  className="w-full accent-amber-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>



              {/* CO2 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Gauge className="h-4 w-4 text-emerald-500" /> Respiration CO₂ (ppm)
                  </span>
                  <span className="font-mono text-sm font-black text-emerald-600 dark:text-emerald-400">
                    {sensorUpdateForm.co2} ppm
                  </span>
                </div>
                <input
                  type="range"
                  min="350"
                  max="2000"
                  step="25"
                  value={sensorUpdateForm.co2}
                  onChange={(e) => setSensorUpdateForm({ ...sensorUpdateForm, co2: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsSensorModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold shadow-md shadow-sky-700/20 transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Transmit to Chamber</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl bg-slate-900 dark:bg-emerald-950 text-white text-xs font-bold shadow-2xl border border-emerald-500/50 flex items-center gap-2.5 animate-slide-down">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          UNIFIED SECTION: OPTICAL COMPUTER VISION + IOT TELEMETRY
          Only appears when Storage 1 or any other storage chamber is clicked
          ───────────────────────────────────────────────────────────── */}
      {selectedStorageId && activeStorage ? (
        <>
          {/* Chamber Header & Synchronization Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 flex-shrink-0">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {activeStorage?.name}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  Dual-Unit Synchronized Chamber
                </span>
                {simulationSpoilageOverride !== null && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                    Simulation Override: ~{simulationSpoilageOverride}%
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Optical Camera Sensor & 5-Parameter IoT Environmental Array are both installed in this storage chamber.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleSimulation}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-2xs ${
                simulationSpoilageOverride !== null
                  ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600'
                  : 'bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700'
              }`}
              title="Toggle simulated ~75% spoilage trigger to test Fresh vs Spoiled output"
            >
              <Flame className="h-3.5 w-3.5" />
              <span>{simulationSpoilageOverride !== null ? "Reset to Live Data" : "Test ~75% Spoilage"}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedStorageId(null)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
              title="Close Chamber Inspection"
            >
              <X className="h-3.5 w-3.5" />
              <span>Close Inspection</span>
            </button>
          </div>
        </div>
      </div>

      {/* Row of the Two Synchronized Units in One Chamber */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 pt-1">
        
        {/* UNIT 1: Optical Camera View & CV Inspection (Left Side) */}
        <div className="lg:col-span-6 flex flex-col justify-between p-4 sm:p-5 bg-[#f8faf9] dark:bg-slate-800/80 rounded-2xl border border-[#d1ded5] dark:border-slate-700 shadow-2xs space-y-3">
          
          <div className="flex items-center justify-between pb-2 border-b border-[#e1eae4] dark:border-slate-800 text-xs">
            <span className="font-extrabold flex items-center gap-1.5 text-slate-900 dark:text-white truncate">
              <Camera className="h-4 w-4 text-emerald-700 dark:text-emerald-400 flex-shrink-0" />
              <span>Unit 1: Optical Computer Vision Scanner</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-700">
              Camera Feed
            </span>
          </div>

          {/* Identified Produce & AI Confidence */}
          {cvResult && cvResult.identified_produce && (
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-2xl p-1 bg-slate-50 dark:bg-slate-800 rounded-lg flex-shrink-0">
                  {cvResult.produce_icon || "🍎"}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                    {cvResult.identified_produce}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {cvResult.category || "Produce"} • Lifecycle: {cvResult.ripeness_stage}
                  </div>
                </div>
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 border border-emerald-300 font-mono">
                {cvResult.produce_confidence || 96.5}% Conf.
              </span>
            </div>
          )}

          {/* Photographic Feed with AI Bounding Boxes */}
          <div className="relative w-full h-64 sm:h-72 rounded-xl overflow-hidden shadow-sm border border-[#d1ded5] dark:border-slate-700 bg-slate-950 flex items-center justify-center">
            {isCameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : previewImage ? (
              <img
                src={previewImage}
                alt="Chamber Inspection Feed"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getFallbackSvg(cvResult?.name || 'Produce', cvResult?.category || 'Produce', cvResult?.icon || '🍎');
                }}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-slate-400 text-xs font-bold">No Image Available</div>
            )}

            {/* Analyzing Spinner Overlay */}
            {analyzing && (
              <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white z-20 animate-fade-in">
                <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin" />
                <span className="text-xs font-bold tracking-wide">Analyzing Produce Quality...</span>
                <span className="text-[10px] text-slate-300">Running rot detection, colour index & mould inspection</span>
              </div>
            )}

            {/* Bounding box overlays */}
            {!isCameraActive && !analyzing && cvResult?.bounding_boxes?.map((box, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${box.x}%`,
                  top: `${box.y}%`,
                  width: `${box.width}%`,
                  height: `${box.height}%`,
                  borderColor: box.color,
                  borderWidth: '2px',
                  borderStyle: 'dashed',
                  backgroundColor: `${box.color}22`
                }}
                className="pointer-events-none rounded transition-all"
              >
                <span 
                  style={{ backgroundColor: box.color }}
                  className="absolute -top-5 left-0 px-1.5 py-0.2 text-[9px] font-black text-white rounded uppercase tracking-wider"
                >
                  {box.label}
                </span>
              </div>
            ))}
          </div>


          {/* Surface Texture, Color & Spoilage Progression Diagnostics */}
          {cvResult && (
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Surface & Color Diagnostics</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {cvResult.surface_analysis?.texture_type || "Intact Epidermis"}
                </span>
              </div>

              {/* Surface Texture & Tactile Details */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Surface Texture</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                    {cvResult.surface_analysis?.texture_type || "Smooth Cuticle"}
                  </div>
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {cvResult.surface_analysis?.tactile_feel || "Firm and resilient peel"}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Color Profile</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                    {cvResult.color_profile_analysis?.primary_hue || "Varietal Pigment"}
                  </div>
                  <div className="text-[9px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5 truncate">
                    {cvResult.color_profile_analysis?.color_congruence || "Normal Spectrum"}
                  </div>
                </div>
              </div>

              {/* Biological Spoilage Stage & Pathogen Watch */}
              <div className="p-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-extrabold text-emerald-900 dark:text-emerald-300">
                    Spoilage Level: {cvResult.spoilage_level_detail?.stage_name || (visualScore > 75 ? "Spoiled / Quarantine" : (visualScore > 50 ? "Overripe ~75%" : "Optimal Fresh"))}
                  </span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                    Score: {visualScore}%
                  </span>
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-tight">
                  {cvResult.spoilage_level_detail?.visual_cues || "Epidermal peel intact without necrotic rot spots. Cellular turgor pressure within optimal freshness threshold."}
                </p>
                {cvResult.spoilage_level_detail?.common_pathogens && (
                  <div className="text-[9px] text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3 flex-shrink-0" />
                    <span>Pathogen Watch: {cvResult.spoilage_level_detail.common_pathogens}</span>
                  </div>
                )}
                {cvResult.spoilage_level_detail?.chef_action && (
                  <div className="text-[9px] text-amber-800 dark:text-amber-300 font-medium bg-amber-100/60 dark:bg-amber-950/60 p-1 rounded border border-amber-300/40">
                    👨‍🍳 {cvResult.spoilage_level_detail.chef_action}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Target Produce Selector for 47 Commodities */}
          <div className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shadow-2xs">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 whitespace-nowrap">
              <span>🎯 Target Commodity:</span>
            </label>
            <select
              value={targetProduceSelection}
              onChange={(e) => setTargetProduceSelection(e.target.value)}
              className="flex-1 py-1 px-2 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="auto">✨ Auto-Detect (47 Produce Items)</option>
              <optgroup label="Fruits (20 Commodities)">
                <option value="Watermelon">🍉 Watermelon (Citrullus lanatus)</option>
                <option value="Apple">🍎 Fresh Apple (Malus domestica)</option>
                <option value="Strawberry">🍓 Fresh Strawberry (Fragaria × ananassa)</option>
                <option value="Mango">🥭 Karthakolomban Mango</option>
                <option value="Banana">🍌 Embul Banana (Ambul Kesel)</option>
                <option value="Orange">🍊 Orange / Citrus</option>
                <option value="Lime / Lemon">🍋 Lime / Lemon</option>
                <option value="Grapes">🍇 Grapes</option>
                <option value="Pineapple">🍍 Mauritius Pineapple</option>
                <option value="Papaya">🍈 Red Lady Papaya</option>
                <option value="Avocado">🥑 Sri Lankan Avocado</option>
                <option value="Guava">🍈 Guava (Pera)</option>
                <option value="Pomegranate">🫐 Pomegranate (Delum)</option>
                <option value="Passion Fruit">🟡 Passion Fruit</option>
                <option value="Dragon Fruit">🐉 Dragon Fruit</option>
                <option value="Jackfruit / Kos / Varaka">🍈 Jackfruit (Kos / Varaka)</option>
                <option value="Peach">🍑 Fresh Peach</option>
                <option value="Pear">🍐 Fresh Pear</option>
                <option value="Plum">🟣 Plum</option>
                <option value="Kiwi">🥝 Kiwi Fruit</option>
              </optgroup>
              <optgroup label="Vegetables (27 Commodities)">
                <option value="Tomato">🍅 Local Tomatoes (Thakkali)</option>
                <option value="Cucumber">🥒 Cucumber (Pipinna)</option>
                <option value="Carrot">🥕 Nuwara Eliya Carrots</option>
                <option value="Capsicum / Bell Pepper">🫑 Capsicum / Bell Pepper</option>
                <option value="Green Chillies">🌶️ Green Chillies (Amu Miris)</option>
                <option value="Eggplant">🍆 Eggplant (Brinjal / Wambatu)</option>
                <option value="Potato">🥔 Potato (Ala)</option>
                <option value="Cabbage">🥬 Cabbage (Gova)</option>
                <option value="Cauliflower">🥦 Cauliflower</option>
                <option value="Broccoli">🥦 Broccoli</option>
                <option value="Green Beans">🫛 Green Beans (Bonchi)</option>
                <option value="Spinach">🍃 Spinach / Leafy Greens</option>
                <option value="Gotukola (Centella Asiatica)">🌿 Gotukola (Centella)</option>
                <option value="Kankun (Water Spinach)">🌿 Kankun (Water Spinach)</option>
                <option value="Mukunuwenna (Alternanthera)">🌿 Mukunuwenna</option>
                <option value="Romaine Lettuce">🥬 Romaine Lettuce</option>
                <option value="Pumpkin">🎃 Pumpkin (Wattakka)</option>
                <option value="Bitter Gourd (Karawila)">🥒 Bitter Gourd (Karawila)</option>
                <option value="Snake Gourd (Pathola)">🥒 Snake Gourd (Pathola)</option>
                <option value="Ridge Gourd (Wetawalu)">🥒 Ridge Gourd (Wetawalu)</option>
                <option value="Radish (Rabu)">🥢 Radish (Rabu)</option>
                <option value="Okra (Bandakka / Ladies Finger)">🫛 Okra (Bandakka)</option>
                <option value="Red Onion">🧅 Red Onion (Rathu Lunu)</option>
                <option value="Garlic">🧄 Garlic (Sudu Lunu)</option>
                <option value="Mushroom">🍄 Mushroom (Bimmal)</option>
                <option value="Ginger">🫚 Ginger (Inguru)</option>
                <option value="Beetroot">🍠 Beetroot</option>
              </optgroup>
            </select>
          </div>

          {/* Hidden File Input for Image Upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />

          {/* Camera Action Buttons */}
          {isCameraActive ? (
            <div className="flex items-center gap-2 pt-1 animate-fade-in">
              <button
                type="button"
                onClick={captureCameraFrame}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Capture Frame</span>
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer transition-all active:scale-95"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                disabled={analyzing}
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95 disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                    <span>Upload Photo</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={startCamera}
                className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1 border border-slate-300 dark:border-slate-700 shadow-2xs cursor-pointer transition-all active:scale-95"
                title="Open Live Device Camera"
              >
                <Camera className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                <span className="hidden sm:inline">Webcam</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEsp32ModalOpen(true)}
                className="flex-1 py-2 px-3 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
              >
                <Cpu className="h-3.5 w-3.5 text-sky-200" />
                <span>ESP32-CAM Node</span>
              </button>
            </div>
          )}
        </div>

        {/* UNIT 2: IoT Environmental Telemetry Array (Right Side) */}
        {(() => {
          const displayTemp = simulationSpoilageOverride !== null
            ? (simulationSpoilageOverride >= 70 ? 20.9 : 11.4)
            : (activeStorage?.current_temp !== undefined ? activeStorage.current_temp : 11.4);

          const displayHum = simulationSpoilageOverride !== null
            ? (simulationSpoilageOverride >= 70 ? 73.0 : 90.0)
            : (activeStorage?.current_humidity !== undefined ? activeStorage.current_humidity : 90.0);

          const displayVoc = simulationSpoilageOverride !== null
            ? (simulationSpoilageOverride >= 70 ? 0.88 : (activeStorage?.voc !== undefined ? activeStorage.voc : 0.18))
            : (activeStorage?.voc !== undefined ? activeStorage.voc : 0.18);

          const displayCo2 = simulationSpoilageOverride !== null
            ? (simulationSpoilageOverride >= 70 ? 1250 : (activeStorage?.co2 || 415))
            : (activeStorage?.co2 || 415);

          const isSpoiledChamber = (simulationSpoilageOverride !== null && simulationSpoilageOverride >= 70) ||
            (cvResult?.visual_spoilage_score >= 60 || cvResult?.risk_level === 'Critical' || cvResult?.mould_detected || displayVoc > 0.60);

          const isWarningChamber = !isSpoiledChamber && (
            (simulationSpoilageOverride !== null && simulationSpoilageOverride >= 45) ||
            cvResult?.visual_spoilage_score >= 45 || cvResult?.risk_level === 'High' || displayVoc > 0.35 || Math.abs(displayTemp - Number(activeStorage?.target_temp || 11.0)) > 3.0
          );

          return (
            <div className="lg:col-span-6 flex flex-col p-4 sm:p-5 bg-[#f8faf9] dark:bg-slate-800/80 rounded-2xl border border-[#d1ded5] dark:border-slate-700 shadow-2xs space-y-3.5">
              
              {/* Header Bar: Node Identification, Live Stream Status & Telemetry Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#e1eae4] dark:border-slate-700/80 text-xs gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 flex-shrink-0 shadow-2xs">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                        Unit 2: IoT Chamber Sensors
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-mono">
                        {activeStorage?.node_id || "ESP32-NODE-01"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Continuous micro-climate monitoring synchronized with vision analysis
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap self-end sm:self-auto">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-2xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live Stream</span>
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-medium px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    {lastSensorSyncTime ? `${lastSensorSyncTime}` : 'Syncing...'}
                  </span>
                  <button
                    type="button"
                    onClick={fetchLiveSensors}
                    title="Refresh live sensor telemetry from chamber node"
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer shadow-2xs active:scale-95"
                  >
                    <RefreshCw className={`h-3 w-3 ${isSyncingSensors ? 'animate-spin text-emerald-500' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSensorModalOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                    title="Update or simulate chamber sensor readings"
                  >
                    <Sliders className="h-3 w-3" />
                    <span>Update Telemetry</span>
                  </button>
                </div>
              </div>

              {/* Environmental Micro-Climate Banner */}
              <div className={`p-3 rounded-xl border shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all ${
                isSpoiledChamber || isWarningChamber
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block tracking-wider">
                    Chamber Micro-Climate Status
                  </span>
                  {isSpoiledChamber || isWarningChamber ? (
                    <span className="text-xs font-black text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 animate-pulse flex-shrink-0" />
                      <span>{isSpoiledChamber ? "Critical Gas & Thermal Spoilage Triggered" : "Thermal or Gas Stress Detected • Accelerated Decay Phase"}</span>
                    </span>
                  ) : (
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                      <span>Optimal Cold Chain Storage • Safe Atmospheric Envelope</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 font-mono px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    Target: {activeStorage?.target_temp || 11.0}°C • {activeStorage?.target_humidity || 89}% RH
                  </span>
                </div>
              </div>

              {/* 4-Parameter IoT Telemetry Matrix (2x2 Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                {/* 1. Chamber Temperature */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2 relative overflow-hidden transition-all hover:border-rose-300 dark:hover:border-rose-900 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                      <div className="p-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                        <Thermometer className="h-3.5 w-3.5" />
                      </div>
                      <span>Temperature</span>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      isSpoiledChamber || isWarningChamber
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    }`}>
                      {isSpoiledChamber ? 'High Respiration' : (isWarningChamber ? 'Drift Alert' : 'Optimal')}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-0.5">
                    <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {displayTemp}°C
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono">
                      Set: {activeStorage?.target_temp || 11.0}°C ({((displayTemp) - (activeStorage?.target_temp || 11.0)) >= 0 ? `+${(((displayTemp) - (activeStorage?.target_temp || 11.0))).toFixed(1)}` : (((displayTemp) - (activeStorage?.target_temp || 11.0))).toFixed(1)}°C)
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          isSpoiledChamber || isWarningChamber ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, (displayTemp / 35.0) * 100))}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-medium">
                      <span>0°C Min</span>
                      <span className="text-slate-600 dark:text-slate-300 font-bold">Target: {activeStorage?.target_temp || 11.0}°C</span>
                      <span>35°C Max</span>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>Sensor: DHT22 Digital</span>
                    <span className={isSpoiledChamber ? "text-rose-600 font-semibold" : "text-emerald-600 dark:text-emerald-400 font-semibold"}>
                      {isSpoiledChamber ? "Heat Respiration Peak" : "Cold Chain Stable"}
                    </span>
                  </div>
                </div>

                {/* 2. Relative Humidity */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2 relative overflow-hidden transition-all hover:border-sky-300 dark:hover:border-sky-900 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                      <div className="p-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-900">
                        <Droplets className="h-3.5 w-3.5" />
                      </div>
                      <span>Rel. Humidity</span>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      displayHum < 75 || displayHum > 96
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        : 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                    }`}>
                      {displayHum < 75 ? 'Dry' : (displayHum > 96 ? 'Condensing' : 'Hydrated')}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-0.5">
                    <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {displayHum}%
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono">
                      Target: {activeStorage?.target_humidity || 89}% RH
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          displayHum < 75 ? 'bg-amber-500' : 'bg-sky-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(10, displayHum))}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-medium">
                      <span>30% Dry</span>
                      <span className="text-sky-700 dark:text-sky-400 font-bold">Crisper Safe Zone</span>
                      <span>100% Sat</span>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>Sensor: Capacitive Array</span>
                    <span className={displayHum < 75 ? "text-amber-600 font-semibold" : "text-sky-600 dark:text-sky-400 font-semibold"}>
                      {displayHum < 75 ? "Moisture Escape" : "Turgor Preserved"}
                    </span>
                  </div>
                </div>

                {/* 3. VOC & Ethylene */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2 relative overflow-hidden transition-all hover:border-amber-300 dark:hover:border-amber-900 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                      <div className="p-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                        <Wind className="h-3.5 w-3.5" />
                      </div>
                      <span>VOC &amp; Ethylene</span>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      displayVoc > 0.60
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        : (displayVoc > 0.35 ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800' : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800')
                    }`}>
                      {displayVoc > 0.60 ? 'High Decay' : (displayVoc > 0.35 ? 'Ripening Gas' : 'Fresh Range')}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-0.5">
                    <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {displayVoc} <span className="text-xs font-semibold text-slate-500">ppm</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono">
                      Safe: &lt;0.40 ppm
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          displayVoc > 0.60 ? 'bg-rose-500' : (displayVoc > 0.35 ? 'bg-amber-500' : 'bg-emerald-500')
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, (displayVoc / 2.0) * 100))}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-medium">
                      <span>0.00 Clean</span>
                      <span className="text-amber-700 dark:text-amber-400 font-bold">C₂H₄ Respiration</span>
                      <span>2.00 Decay</span>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>Sensor: MQ-135 Gas Cell</span>
                    <span className={displayVoc > 0.60 ? "text-rose-600 font-semibold" : "text-amber-600 dark:text-amber-400 font-semibold"}>
                      {displayVoc > 0.60 ? "Heavy Decomposition Gas" : "Sub-Senescence"}
                    </span>
                  </div>
                </div>

                {/* 4. CO2 Respiration */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2 relative overflow-hidden transition-all hover:border-emerald-300 dark:hover:border-emerald-900 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                      <div className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                        <Gauge className="h-3.5 w-3.5" />
                      </div>
                      <span>CO₂ Respiration</span>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      displayCo2 > 1000
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    }`}>
                      {displayCo2 > 1000 ? 'Vent Required' : 'Aerobic Optimal'}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-0.5">
                    <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {displayCo2} <span className="text-xs font-semibold text-slate-500">ppm</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono">
                      Ceiling: &lt;1000 ppm
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          displayCo2 > 1000 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(10, ((displayCo2 - 350) / 1200) * 100))}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-medium">
                      <span>350 Ambient</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">NDIR Optical Array</span>
                      <span>1500 Peak</span>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>Sensor: NDIR Optical</span>
                    <span className={displayCo2 > 1000 ? "text-amber-600 font-semibold" : "text-emerald-600 dark:text-emerald-400 font-semibold"}>
                      {displayCo2 > 1000 ? "High Metabolic Output" : "Aerobic Dormancy"}
                    </span>
                  </div>
                </div>

              </div>

              {/* Chamber Atmosphere & Aeration Status Card */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-amber-500" /> Chamber Atmosphere &amp; Aeration Status
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">
                    Sensor Bus: I2C (0x3C) • DHT22/MQ-135 Array
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isSpoiledChamber || isWarningChamber
                    ? `Elevated thermal respiration observed at ${displayTemp}°C (${(displayTemp - Number(activeStorage?.target_temp || 11.0)).toFixed(1)}°C above setpoint). VOC ripening gas accumulation detected at ${displayVoc} ppm.`
                    : `Optimal cold chain stability maintained at ${displayTemp}°C (target: ${activeStorage?.target_temp || 11.0}°C). Relative humidity at ${displayHum}% preserves cellular turgor pressure without surface condensation.`}
                </p>
              </div>
            </div>
          );
        })()}

      </div>
      {/* ─────────────────────────────────────────────────────────────
          MASTER FUSED QUALITY ASSESSMENT (CROSS-CHECKING BOTH UNITS)
          "Output as Spoiled or Fresh and with Remaining Shelf Life"
          ───────────────────────────────────────────────────────────── */}
      {(() => {
        // Calculation fusing 60% Optical Vision + 40% IoT Environmental Sensors
        const tempDev = Math.max(0, (Number(activeStorage?.current_temp || 11.0) - Number(activeStorage?.target_temp || 11.0)));
        const tempPenalty = tempDev * 3.5;
        const vocExcess = Math.max(0, Number(activeStorage?.voc || 0.32) - 0.35);
        const vocPenalty = vocExcess * 25.0;
        
        const co2Excess = Math.max(0, Number(activeStorage?.co2 || 450) - 900);
        const co2Penalty = (co2Excess / 1000.0) * 20.0;
        const curHum = Number(activeStorage?.current_humidity || 90.0);
        const humPenalty = curHum < 75 ? (75 - curHum) * 0.8 : (curHum > 95 ? (curHum - 95) * 2.0 : 0);

        const sensorScore = Math.min(100, Math.round(tempPenalty + vocPenalty + co2Penalty + humPenalty));

        const simScore = simulationSpoilageOverride;
        const visualScore = cvResult?.visual_spoilage_score || cvResult?.ripeness_percent || 15.0;

        const fusedScore = simScore !== null 
          ? simScore 
          : Math.min(99.0, Math.round(((sensorScore * 0.40) + (visualScore * 0.60)) * 10) / 10);

        const dynamicHours = Math.max(0, Math.round((shelfLifePrediction.hours * (1 - (sensorScore / 130.0))) * 10) / 10);
        const fusedRsl = simScore !== null
          ? (simScore >= 70 ? 14.0 : 115.0)
          : (fusedScore >= 75 ? 0.0 : dynamicHours);

        const isSpoiledState = fusedScore >= 75.0 || cvResult?.mould_detected || cvResult?.risk_level === 'Critical';
        const isNearSpoilState = !isSpoiledState && (fusedScore >= 50.0 || fusedRsl <= 24.0 || cvResult?.risk_level === 'High');
        const isFreshState = !isSpoiledState && !isNearSpoilState;



        return (
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/80 dark:border-emerald-500/60 shadow-lg space-y-5 animate-fade-in">
            
            {/* Master Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                    Dual-Unit Fusion Output
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Cross-Checked: Camera Optical Inspection + IoT Environmental Telemetry
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
                  Comprehensive Produce Health & Usable Shelf-Life Verdict
                </h3>
              </div>

              {/* Definitive Output Badge: FRESH vs NEAR-SPOIL vs SPOILED */}
              <div>
                {isFreshState && (
                  <span className="px-4 py-2 rounded-2xl text-xs sm:text-sm font-black bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-200 border-2 border-emerald-500 shadow-sm flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
                    <span>STATUS: FRESH (Grade A Harvest)</span>
                  </span>
                )}
                {isNearSpoilState && (
                  <span className="px-4 py-2 rounded-2xl text-xs sm:text-sm font-black bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-200 border-2 border-amber-500 shadow-sm flex items-center gap-2 animate-pulse">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
                    <span>STATUS: NEAR-SPOIL (~75% Threshold Reached)</span>
                  </span>
                )}
                {isSpoiledState && (
                  <span className="px-4 py-2 rounded-2xl text-xs sm:text-sm font-black bg-rose-100 text-rose-950 dark:bg-rose-950 dark:text-rose-200 border-2 border-rose-500 shadow-sm flex items-center gap-2 animate-pulse">
                    <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-rose-600 dark:text-rose-400" />
                    <span>STATUS: SPOILED / QUARANTINE</span>
                  </span>
                )}
              </div>
            </div>

            {/* Core Metrics: Fused Spoilage % and Fused RSL */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Spoilage Probability */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Fused Spoilage Probability
                </span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-black ${
                    isSpoiledState ? 'text-rose-600' : (isNearSpoilState ? 'text-amber-600' : 'text-emerald-700 dark:text-emerald-400')
                  }`}>
                    {fusedScore}%
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">60% Camera + 40% Sensors</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isSpoiledState ? 'bg-rose-600' : (isNearSpoilState ? 'bg-amber-500' : 'bg-emerald-600')
                    }`}
                    style={{ width: `${Math.min(100, fusedScore)}%` }}
                  />
                </div>
              </div>

              {/* Remaining Shelf Life */}
              <div className="p-4 rounded-xl bg-[#ecfdf5] dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 space-y-1">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase flex items-center gap-1.5">
                  <Hourglass className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /> Remaining Shelf-Life (RSL)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-800 dark:text-emerald-300">
                    {fusedRsl}
                  </span>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Hours</span>
                  {fusedRsl > 0 && (
                    <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                      ~{(fusedRsl / 24.0).toFixed(1)} Days Usable
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-medium text-emerald-900 dark:text-emerald-300">
                  {isSpoiledState 
                    ? "Safe deadline expired. Do not cook or serve." 
                    : (isNearSpoilState ? "Must consume or cook within 24 hours!" : "Safe for normal FIFO kitchen rotation.")}
                </p>
              </div>

              {/* Degradation Rate */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
                  <TrendingDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Decay Multiplier
                </span>
                <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  {isSpoiledState ? "Severe breakdown (> 5.2x baseline)" : (isNearSpoilState ? "Accelerated cellular breakdown (3.4x)" : "Normal metabolic aging (1.0x)")}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Grounded on visual browning ({cvResult?.discoloration_score || 3.2}%) & chamber thermal baseline.
                </p>
              </div>

            </div>

            {/* Cross-Check Breakdown Table */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
              <span className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider block">
                Unit Cross-Check Validation Details ({activeStorage?.name}):
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <Camera className="h-3.5 w-3.5" /> Unit 1: Optical Camera Findings:
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {cvResult?.detected_defects?.length > 0 
                      ? cvResult.detected_defects.join(". ")
                      : "Epidermal peel intact (Grade A), 3.2% localized surface browning, 0% fungal mould spores detected."}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="font-bold text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5" /> Unit 2: IoT Sensors Findings:
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Chamber temperature at {activeStorage?.current_temp || 11.4}°C (target: {activeStorage?.target_temp || 11.0}°C), relative humidity at {activeStorage?.current_humidity || 90.2}% RH, VOC ripening gas at {activeStorage?.voc || 0.32} ppm, CO2 respiration at {activeStorage?.co2 || 415} ppm.
                  </p>
                </div>
              </div>
            </div>

                      </div>
        );
      })()}
        </>
      ) : (
        /* Empty / Initial State Prompt: Prompt to click a storage unit */
        <div className="p-8 sm:p-12 rounded-2xl bg-[#f8faf9] dark:bg-slate-800/60 border-2 border-dashed border-emerald-300 dark:border-emerald-800/80 text-center space-y-4 shadow-2xs animate-fade-in">
          <div className="inline-flex p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
            <Boxes className="h-8 w-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Select a Storage Chamber to Inspect
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Click on <strong>Storage 1</strong> or any configured storage chamber card above to open its real-time optical camera scanner, 5-parameter IoT sensor telemetry, and dual-unit fusion analysis.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {storages.map(storage => (
              <button
                key={storage.id}
                type="button"
                onClick={() => handleSelectStorage(storage)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white shadow-md shadow-emerald-700/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Boxes className="h-3.5 w-3.5" />
                <span>Inspect {storage.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}


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
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#f8faf9] dark:bg-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
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

      {/* Produce Encyclopedia & Inspection Criteria Modal (47 Commodities) */}
      {isEncyclopediaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs">
          <div className="w-full max-w-5xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-emerald-500/40 shadow-2xl p-4 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Produce Encyclopedia & Inspection Criteria</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800 font-mono">
                      47 Commodities
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Surface textures, color profiles, and 4-stage biological spoilage progression benchmarks
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEncyclopediaModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 w-full sm:w-auto">
                {[
                  { id: "all", label: "All Items", count: 47 },
                  { id: "fruits", label: "Fruits", count: 20 },
                  { id: "vegetables", label: "Vegetables", count: 27 },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setEncyclopediaCategory(tab.id);
                      fetchEncyclopedia(tab.id, encyclopediaSearch);
                    }}
                    className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      encyclopediaCategory === tab.id
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="ml-1.5 text-[10px] opacity-80 font-mono">({tab.count})</span>
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={encyclopediaSearch}
                  onChange={(e) => {
                    setEncyclopediaSearch(e.target.value);
                    fetchEncyclopedia(encyclopediaCategory, e.target.value);
                  }}
                  placeholder="Search name, variety, pathogen..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>
            </div>

            {/* Main Content: Split Grid (List Left, Deep-Dive Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
              
              {/* Left Column: Commodity Scroll List */}
              <div className="lg:col-span-4 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar max-h-[60vh] lg:max-h-[65vh]">
                {encyclopediaLoading && encyclopediaItems.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-600 mb-2" />
                    Loading encyclopedia...
                  </div>
                ) : encyclopediaItems.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No produce matching search criteria.
                  </div>
                ) : (
                  encyclopediaItems.map((item) => {
                    const isSelected = selectedEncyclopediaProduce?.produce_name === item.produce_name;
                    return (
                      <div
                        key={item.produce_name}
                        onClick={() => setSelectedEncyclopediaProduce(item)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                          isSelected
                            ? 'bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-500 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-2xl p-1 bg-white dark:bg-slate-900 rounded-lg flex-shrink-0 shadow-2xs">
                            {item.icon || "🍎"}
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                              {item.short_name || item.produce_name}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate italic">
                              {item.scientific_name}
                            </div>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          item.category === 'Fruits'
                            ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300'
                            : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300'
                        }`}>
                          {item.category === 'Fruits' ? 'Fruit' : 'Veg'}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Right Column: Selected Produce Comprehensive Inspection Sheet */}
              <div className="lg:col-span-8 overflow-y-auto pr-1 space-y-3.5 custom-scrollbar max-h-[60vh] lg:max-h-[65vh]">
                {selectedEncyclopediaProduce ? (
                  <div className="space-y-3.5">
                    
                    {/* Header Banner */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800/60 border border-emerald-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl p-1.5 bg-white dark:bg-slate-900 rounded-2xl shadow-xs">
                          {selectedEncyclopediaProduce.icon}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                              {selectedEncyclopediaProduce.produce_name}
                            </h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100">
                              {selectedEncyclopediaProduce.variety}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 font-mono italic">
                            {selectedEncyclopediaProduce.scientific_name} • Origin: {selectedEncyclopediaProduce.origin}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right text-[11px]">
                          <span className="text-slate-400 font-medium block">Cold Shelf-Life</span>
                          <span className="font-black text-emerald-700 dark:text-emerald-400 font-mono">
                            {selectedEncyclopediaProduce.storage?.cold_shelf_hours}h (~{(selectedEncyclopediaProduce.storage?.cold_shelf_hours / 24).toFixed(0)}d)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Section 1: Surface Texture & Optical Traits */}
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Sliders className="h-4 w-4 text-emerald-600" />
                          <span>1. Surface Texture & Cuticular Structure</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {selectedEncyclopediaProduce.surface?.gloss_level}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">Texture Type</span>
                          <span className="font-black text-slate-900 dark:text-white">
                            {selectedEncyclopediaProduce.surface?.texture_type}
                          </span>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                            {selectedEncyclopediaProduce.surface?.tactile_feel}
                          </p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Micro-Roughness Index</span>
                            <span className="font-mono font-bold text-emerald-600">
                              {selectedEncyclopediaProduce.surface?.roughness_score} / 10
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-emerald-600 h-full rounded-full" 
                              style={{ width: `${(selectedEncyclopediaProduce.surface?.roughness_score / 10) * 100}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[9px] text-slate-400">
                            <span>1 (Smooth Waxy)</span>
                            <span>10 (Spiked/Warty)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Peel / Leaf Color Profile */}
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Eye className="h-4 w-4 text-emerald-600" />
                          <span>2. Peel / Leaf Color Profile & Pigments</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {selectedEncyclopediaProduce.color?.hsv_range}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Primary Hue:</span>
                            <span className="font-bold text-slate-900 dark:text-white text-xs">
                              {selectedEncyclopediaProduce.color?.primary_hue}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Secondary:</span>
                            <span className="text-slate-700 dark:text-slate-300 text-xs">
                              {selectedEncyclopediaProduce.color?.secondary_hue}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 italic">
                            {selectedEncyclopediaProduce.color?.description}
                          </p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 space-y-1 text-xs">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">Baseline Natural Pigment Ranges</span>
                          <div className="space-y-1 pt-1 text-[11px]">
                            <div className="flex items-center justify-between">
                              <span className="text-emerald-700 dark:text-emerald-400 font-medium">Chlorophyll Green:</span>
                              <span className="font-mono font-bold">{selectedEncyclopediaProduce.color?.baseline_ratios?.green_pct?.join(' - ')}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-amber-700 dark:text-amber-400 font-medium">Carotenoid Yellow:</span>
                              <span className="font-mono font-bold">{selectedEncyclopediaProduce.color?.baseline_ratios?.yellow_pct?.join(' - ')}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-rose-700 dark:text-rose-400 font-medium">Anthocyanin / Red:</span>
                              <span className="font-mono font-bold">{selectedEncyclopediaProduce.color?.baseline_ratios?.red_pct?.join(' - ')}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: 4-Stage Spoilage Progression Guide */}
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          <span>3. Biological Spoilage Progression Stages (0% to 100%)</span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 font-mono">
                          Target: {selectedEncyclopediaProduce.storage?.optimal_temp_c}°C • {selectedEncyclopediaProduce.storage?.optimal_humidity_pct}% RH
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                        
                        {/* Stage 1: Fresh */}
                        <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-black text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Stage 1: Fresh (0-25%)
                            </span>
                            <span className="font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400">Grade A</span>
                          </div>
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-tight">
                            {selectedEncyclopediaProduce.spoilage_progression?.fresh?.visual_cues}
                          </p>
                          <div className="text-[10px] font-medium text-emerald-800 dark:text-emerald-300 pt-0.5">
                            Firmness: {selectedEncyclopediaProduce.spoilage_progression?.fresh?.firmness}
                          </div>
                        </div>

                        {/* Stage 2: Optimal */}
                        <div className="p-3 rounded-xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-black text-sky-900 dark:text-sky-300 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-sky-500" /> Stage 2: Peak Ripe (25-50%)
                            </span>
                            <span className="font-mono text-[10px] font-bold text-sky-700 dark:text-sky-400">Grade B</span>
                          </div>
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-tight">
                            {selectedEncyclopediaProduce.spoilage_progression?.optimal?.visual_cues}
                          </p>
                          <div className="text-[10px] font-medium text-sky-800 dark:text-sky-300 pt-0.5">
                            Firmness: {selectedEncyclopediaProduce.spoilage_progression?.optimal?.firmness}
                          </div>
                        </div>

                        {/* Stage 3: Near Spoilage ~75% */}
                        <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-black text-amber-900 dark:text-amber-300 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Stage 3: Near-Spoil (~75%)
                            </span>
                            <span className="font-mono text-[10px] font-bold text-amber-700 dark:text-amber-400">Rescue Alert</span>
                          </div>
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-tight">
                            {selectedEncyclopediaProduce.spoilage_progression?.near_spoilage?.visual_cues}
                          </p>
                          <div className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-900/60 p-1 rounded mt-1">
                            👨‍🍳 {selectedEncyclopediaProduce.spoilage_progression?.near_spoilage?.chef_action}
                          </div>
                        </div>

                        {/* Stage 4: Spoiled Quarantine */}
                        <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-black text-rose-900 dark:text-rose-300 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-rose-500" /> Stage 4: Spoiled (75-100%)
                            </span>
                            <span className="font-mono text-[10px] font-bold text-rose-700 dark:text-rose-400">Quarantine</span>
                          </div>
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-tight">
                            {selectedEncyclopediaProduce.spoilage_progression?.spoiled?.visual_cues}
                          </p>
                          <div className="text-[10px] font-bold text-rose-800 dark:text-rose-300 pt-0.5">
                            Pathogens: {selectedEncyclopediaProduce.spoilage_progression?.spoiled?.common_pathogens}
                          </div>
                        </div>

                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="p-12 text-center text-xs text-slate-400">
                    Select a produce commodity on the left to inspect its surface texture, color, and spoilage progression criteria.
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
              <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                All 47 commodities calibrated with RGB/HSV color moments, Sobel/Laplacian gradients & decay kinetics.
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEncyclopediaModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
