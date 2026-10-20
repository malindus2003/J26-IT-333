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
  Droplets
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

export default function VisionInspector({ onInspectionComplete }) {
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
  const [selectedStorageId, setSelectedStorageId] = useState("storage-1");
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
    setSelectedStorageId("storage-1");
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

  // Update the currently active storage's assigned produce
  const updateActiveStorageInspection = (presetOrCvResult, imageUrl) => {
    const updated = storages.map(s => {
      if (s.id === selectedStorageId) {
        return {
          ...s,
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
      const fallback = updated[0];
      handleSelectStorage(fallback);
    }
    setStorageToDelete(null);
  };

const activeStorage = storages.find(s => s?.id === selectedStorageId) || storages[0] || DEFAULT_SYSTEM_STORAGES[0];
  const [selectedPresetId, setSelectedPresetId] = useState(() => activeStorage?.assignedProduce?.presetId || SAMPLE_PRESETS[0].id);
  const [previewImage, setPreviewImage] = useState(SAMPLE_PRESETS[0].imageUrl);
  const [currentContainerName, setCurrentContainerName] = useState(SAMPLE_PRESETS[0]?.container || "Container #C-101 (Zone 1: Fruit Chiller 11°C)");
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
      <div className="p-4 sm:p-5 rounded-2xl bg-[#f8faf9] dark:bg-slate-850/80 border border-[#d1ded5] dark:border-slate-800 space-y-4 shadow-2xs">
        
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


      {/* SECTION 2: Optical Inspection Workbench (Container Photo with Bounding Boxes + Sensory Diagnostics) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 pt-2">
        
        {/* Real Photographic Container View with AI Bounding Box & Risk Overlay */}
        <div className="lg:col-span-5 flex flex-col items-center justify-between p-3.5 sm:p-4 bg-[#f8faf9] dark:bg-slate-850 rounded-xl sm:rounded-2xl border border-[#d1ded5] dark:border-slate-800 relative dark:bg-slate-900/60 shadow-2xs">
          
          <div className="w-full flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 pb-2 mb-2 border-b border-[#e1eae4] dark:border-slate-800">
            <span className="font-bold flex items-center gap-1.5 text-slate-900 dark:text-white truncate mr-2">
              <Camera className="h-4 w-4 text-emerald-700 dark:text-emerald-400 flex-shrink-0" />
              <span className="truncate">{activeStorage?.name} Optical Feed</span>
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
                      <span className="text-rose-700 dark:text-rose-400 flex items-center gap-1 text-xs sm:text-sm font-bold truncate" title={`Confidence: ${cvResult.mould_confidence || 90}%, Coverage: ${cvResult.mould_coverage}%`}>
                        <AlertTriangle className="h-3.5 w-3.5" /> Detected ({cvResult.mould_confidence !== undefined ? `${cvResult.mould_confidence}%` : `${cvResult.mould_coverage}%`})
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
                <span>AI Quality Diagnostics — {activeStorage?.name}</span>
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
                Remaining Shelf-Life (RSL) Dynamic Prediction — {activeStorage?.name}
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
