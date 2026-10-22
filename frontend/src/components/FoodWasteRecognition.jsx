import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronDown,
  Info,
  Sliders,
  Video,
  VideoOff,
  Check,
  Edit2,
  Save,
  Scale,
  X
} from 'lucide-react';

// Verified against Pilot v2 metadata (data.yaml & model.names):
// 0: rice, 1: kottu, 2: noodles, 3: chicken, 4: whole_mango, 5: mango_flesh, 6: mango_peel
export const SUPPORTED_CLASSES = [
  { id: 0, name: 'rice', label: 'Rice', color: 'border-amber-500 text-amber-600 bg-amber-500/10' },
  { id: 1, name: 'kottu', label: 'Kottu', color: 'border-orange-500 text-orange-600 bg-orange-500/10' },
  { id: 2, name: 'noodles', label: 'Noodles', color: 'border-yellow-500 text-yellow-600 bg-yellow-500/10' },
  { id: 3, name: 'chicken', label: 'Chicken', color: 'border-rose-500 text-rose-600 bg-rose-500/10', unassessedNote: true },
  { id: 4, name: 'whole_mango', label: 'Whole Mango', color: 'border-emerald-500 text-emerald-600 bg-emerald-500/10' },
  { id: 5, name: 'mango_flesh', label: 'Mango Flesh', color: 'border-amber-600 text-amber-700 bg-amber-600/10' },
  { id: 6, name: 'mango_peel', label: 'Mango Peel', color: 'border-lime-500 text-lime-600 bg-lime-500/10', unassessedNote: true },
];

export default function FoodWasteRecognition({ isDarkMode }) {
  const [modelStatus, setModelStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  // Default confidence to 50% as requested
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.50);
  const [isDetecting, setIsDetecting] = useState(false);
  const [results, setResults] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Manual correction states per detection index
  const [corrections, setCorrections] = useState({});
  const [savingCorrectionIdx, setSavingCorrectionIdx] = useState(null);

  // Waste Record Confirmation State (separate from inference)
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false);
  const [manualWeightInput, setManualWeightInput] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);
  const [isSavingRecord, setIsSavingRecord] = useState(false);

  // Camera capture mode (camera never starts automatically)
  const [useCamera, setUseCamera] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [displayedImgSize, setDisplayedImgSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    fetchModelStatus();
  }, []);

  const fetchModelStatus = async () => {
    try {
      setStatusLoading(true);
      const res = await axios.get('http://localhost:8000/api/waste/ai/status');
      setModelStatus(res.data);
    } catch (err) {
      console.warn('Could not fetch AI model status from backend:', err);
      setModelStatus(null);
    } finally {
      setStatusLoading(false);
    }
  };

  // Handle image upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (.jpg, .png, .webp).');
      return;
    }

    stopCamera();
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResults(null);
    setErrorMsg(null);
    setSaveSuccessMsg(null);
    setCorrections({});
  };

  // Start Camera Stream (only upon explicit button click)
  const startCamera = async () => {
    try {
      setErrorMsg(null);
      setUseCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setErrorMsg('Unable to access camera. Please check camera permissions in your browser.');
      setUseCamera(false);
      setCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setUseCamera(false);
  };

  // Capture Frame from Camera
  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'camera_capture.jpg', { type: 'image/jpeg' });
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        stopCamera();
        setResults(null);
        setCorrections({});
        setSaveSuccessMsg(null);
      }
    }, 'image/jpeg', 0.95);
  };

  // Execute Classification
  const runDetection = async () => {
    if (!selectedFile) {
      setErrorMsg('Please upload an image or capture a camera frame first.');
      return;
    }

    setIsDetecting(true);
    setErrorMsg(null);
    setResults(null);
    setSaveSuccessMsg(null);
    setCorrections({});

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await axios.post(
        `http://localhost:8000/api/waste/classify?confidence=${confidenceThreshold}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      setResults(res.data);
    } catch (err) {
      console.error('Detection request failed:', err);
      if (err.response?.status === 503) {
        setErrorMsg(
          err.response?.data?.detail ||
          'Trained YOLO weights not found on backend. The model must be trained using real annotated dataset before live inference.'
        );
      } else {
        setErrorMsg(err.response?.data?.detail || 'Inference error occurred while communicating with the AI server.');
      }
    } finally {
      setIsDetecting(false);
    }
  };

  // Handle Image Load to calculate bounding box scaling
  const handleImageLoaded = (e) => {
    const img = e.target;
    setDisplayedImgSize({
      width: img.clientWidth,
      height: img.clientHeight,
    });
  };

  // Manual Confirmation / Correction
  const handleConfirmPrediction = async (det, idx) => {
    setSavingCorrectionIdx(idx);
    try {
      await axios.post('http://localhost:8000/api/waste/corrections', {
        original_class_id: det.class_id,
        original_class_name: det.class_name,
        original_confidence: det.confidence,
        corrected_class_id: det.class_id,
        corrected_class_name: det.class_name,
        status: 'confirmed',
        model_version: results?.model_version || modelStatus?.model_version || 'food-waste-yolo-v1',
        notes: 'Operator confirmed correct classification',
      });
      setCorrections((prev) => ({
        ...prev,
        [idx]: { status: 'confirmed', correctedName: det.class_name },
      }));
    } catch (err) {
      console.error('Failed to save confirmation:', err);
    } finally {
      setSavingCorrectionIdx(null);
    }
  };

  const handleCorrectPrediction = async (det, idx, correctedClass) => {
    setSavingCorrectionIdx(idx);
    try {
      const isUnsupported = correctedClass === 'unsupported';
      const classObj = SUPPORTED_CLASSES.find((c) => c.name === correctedClass);

      await axios.post('http://localhost:8000/api/waste/corrections', {
        original_class_id: det.class_id,
        original_class_name: det.class_name,
        original_confidence: det.confidence,
        corrected_class_id: isUnsupported ? null : classObj?.id,
        corrected_class_name: isUnsupported ? 'unsupported' : classObj?.name || correctedClass,
        status: 'corrected',
        model_version: results?.model_version || modelStatus?.model_version || 'food-waste-yolo-v1',
        notes: `Operator corrected ${det.class_name} -> ${correctedClass}`,
      });

      setCorrections((prev) => ({
        ...prev,
        [idx]: {
          status: 'corrected',
          correctedName: isUnsupported ? 'Unsupported Food Item' : classObj?.label || correctedClass,
        },
      }));
    } catch (err) {
      console.error('Failed to save correction:', err);
    } finally {
      setSavingCorrectionIdx(null);
    }
  };

  // Explicit confirmation to save detections as a formal waste record
  const handleSaveWasteRecord = async () => {
    if (!results || results.detections.length === 0) return;
    setIsSavingRecord(true);
    try {
      // Log as confirmed record to backend corrections/audit store
      await axios.post('http://localhost:8000/api/waste/corrections', {
        original_class_id: results.detections[0].class_id,
        original_class_name: results.detections.map(d => d.class_name).join(', '),
        original_confidence: results.detections[0].confidence,
        corrected_class_name: results.detections.map(d => d.class_name).join(', '),
        status: 'confirmed',
        model_version: results.model_version,
        notes: `Confirmed waste entry: ${results.detections.length} items detected. Measured weight: ${manualWeightInput || 'Pending load cell'} kg`,
      });

      setSaveSuccessMsg(
        `Waste record successfully logged with ${results.detections.length} recognized item(s).`
      );
      setIsConfirmSaveOpen(false);
      setManualWeightInput('');
    } catch (err) {
      console.error('Failed to save waste record:', err);
      setErrorMsg('Failed to save waste record to backend database.');
    } finally {
      setIsSavingRecord(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl space-y-6">

      {/* Component 4 AI Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              AI Food Waste Optical Recognition Subsystem
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              YOLOv8 7-Class Model
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Multi-object computer vision identification for Food Waste Bin tray monitoring
          </p>
        </div>

        {/* Backend Verified Model Status Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Model Status:</span>
            {statusLoading ? (
              <span className="text-xs text-slate-400 font-mono">Checking runtime...</span>
            ) : modelStatus && modelStatus.is_loaded && modelStatus.is_pilot_v2 ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Pilot v2 loaded ({modelStatus.device || 'CPU'})
              </span>
            ) : modelStatus && modelStatus.is_loaded ? (
              <span className="px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 text-sky-700 dark:text-sky-400 font-bold flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {modelStatus.weights_filename || 'YOLO loaded'} ({modelStatus.device || 'CPU'})
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1.5 text-[11px]">
                <Info className="h-3.5 w-3.5" />
                {modelStatus?.status_label || 'Status unavailable'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Target Classes Overview (Derived from loaded model metadata) */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Recognized Canonical Classes (Derived from Model Metadata):
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            (7 Active Pilot Classes)
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(modelStatus?.classes
            ? Object.entries(modelStatus.classes).map(([id, name]) => {
                const numId = parseInt(id, 10);
                const matching = SUPPORTED_CLASSES.find((c) => c.name === name || c.id === numId);
                return {
                  id: numId,
                  name: name,
                  label: matching?.label || name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
                  color: matching?.color || 'border-emerald-500 text-emerald-600 bg-emerald-500/10',
                  unassessedNote: name === 'chicken' || name === 'mango_peel',
                };
              })
            : SUPPORTED_CLASSES
          ).map((cls) => (
            <span
              key={cls.id}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${cls.color}`}
            >
              #{cls.id} {cls.label}
              {cls.unassessedNote && <span className="ml-1 text-[10px] font-normal opacity-80">*</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Shortened Research Note */}
      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
        <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <span className="font-medium">
          Prototype model. Chicken and mango peel lack independent validation/test coverage.
        </span>
      </div>

      {/* Collapsible Technical Details Section */}
      <details className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-3.5 text-xs">
        <summary className="flex items-center justify-between cursor-pointer font-bold text-slate-700 dark:text-slate-300 select-none">
          <span className="flex items-center gap-2">
            <Sliders className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Technical Details & Checkpoint Configuration</span>
          </span>
          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180 text-slate-400" />
        </summary>
        <div className="mt-3 space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-200">Active Loaded Checkpoint:</span>
              <code className="block mt-0.5 font-mono text-[10px] text-slate-800 dark:text-slate-200 bg-slate-200/80 dark:bg-slate-800 px-2 py-1 rounded truncate">
                {modelStatus?.weights_path || 'ai/models/food-waste-yolo-pilot-v2_best.pt'}
              </code>
            </div>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-200">Loaded Runtime Architecture:</span>
              <p className="mt-0.5 text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                Ultralytics YOLOv8n ({modelStatus?.device || 'CPU'})
              </p>
            </div>
          </div>
          <div className="pt-1">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Sequence Leakage Isolation Protocol:</span>
            <p className="mt-0.5 leading-relaxed text-slate-500 dark:text-slate-400 text-[10px]">
              Chicken and Mango Peel cafeteria/garden burst sequences were grouped 100% into Train to eliminate cross-split sequence visual leakage. Clean Pilot v2 excludes the 3 unapproved non-mango images, deleted peel image, and paused bread images.
            </p>
          </div>
        </div>
      </details>

      {/* Control Panel: Upload, Camera, and Confidence Slider */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

        {/* Source Inputs */}
        <div className="md:col-span-6 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:bg-emerald-500 cursor-pointer transition">
            <Upload className="h-4 w-4" />
            <span>Upload Tray Photo</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {!useCamera ? (
            <button
              type="button"
              onClick={startCamera}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Camera className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Use Webcam</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopCamera}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-400 font-bold text-xs hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
            >
              <VideoOff className="h-4 w-4 text-rose-600" />
              <span>Turn Off Webcam</span>
            </button>
          )}

          {selectedFile && (
            <span className="text-xs text-slate-500 truncate max-w-xs font-mono">
              {selectedFile.name}
            </span>
          )}
        </div>

        {/* Confidence Threshold Slider Control */}
        <div className="md:col-span-6 flex items-center justify-end gap-3">
          <Sliders className="h-4 w-4 text-slate-500" />
          <div className="flex-1 max-w-xs">
            <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              <span>Confidence Threshold:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {Math.round(confidenceThreshold * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.95"
              step="0.05"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          <button
            type="button"
            onClick={runDetection}
            disabled={!selectedFile || isDetecting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isDetecting ? (
              <>
                <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                <span>Running YOLO...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Detect Food Waste</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Notice */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/20 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Save Success Notice */}
      {saveSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Live Camera Viewfinder */}
      {useCamera && (
        <div className="relative rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-black flex flex-col items-center">
          <video
            ref={videoRef}
            className="w-full max-h-[480px] object-contain"
            autoPlay
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="p-4 bg-slate-900/90 w-full flex justify-center gap-4">
            <button
              type="button"
              onClick={captureFrame}
              disabled={!cameraActive}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              <Camera className="h-4 w-4" /> Capture Tray Frame
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Image Preview & Bounding Box Overlay Display */}
      {previewUrl && !useCamera && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Main Visual Canvas */}
          <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 relative flex items-center justify-center">
            <div className="relative inline-block max-w-full">
              <img
                src={previewUrl}
                alt="Food Waste Tray Candidate"
                className="max-h-[500px] w-auto block object-contain"
                onLoad={handleImageLoaded}
              />

              {/* Render Bounding Boxes */}
              {results && results.detections && results.image_dimensions && displayedImgSize.width > 0 && (
                results.detections.map((det, idx) => {
                  const scaleX = displayedImgSize.width / results.image_dimensions.width;
                  const scaleY = displayedImgSize.height / results.image_dimensions.height;

                  const left = det.bounding_box.x1 * scaleX;
                  const top = det.bounding_box.y1 * scaleY;
                  const width = (det.bounding_box.x2 - det.bounding_box.x1) * scaleX;
                  const height = (det.bounding_box.y2 - det.bounding_box.y1) * scaleY;

                  const classObj = SUPPORTED_CLASSES.find((c) => c.name === det.class_name);
                  const isCorrected = corrections[idx]?.status === 'corrected';
                  const displayClassName = isCorrected ? corrections[idx].correctedName : det.class_name;

                  return (
                    <div
                      key={idx}
                      style={{
                        position: 'absolute',
                        left: `${left}px`,
                        top: `${top}px`,
                        width: `${width}px`,
                        height: `${height}px`,
                      }}
                      className="border-2 border-emerald-400 bg-emerald-500/10 pointer-events-none transition-all"
                    >
                      <span className="absolute -top-6 left-0 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-600 text-white whitespace-nowrap shadow-sm">
                        {displayClassName} ({Math.round(det.confidence * 100)}%)
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Detections & Human-In-The-Loop Panel */}
          <div className="lg:col-span-5 space-y-4">

            {/* Inference Statistics Bar */}
            {results && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block font-medium">Inference Latency</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {results.inference_time_ms} ms
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 dark:text-slate-400 block font-medium">Items Recognized</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                    {results.total_detected}
                  </span>
                </div>
              </div>
            )}

            {/* Empty State: No Detections */}
            {results && results.detections.length === 0 && (
              <div className="p-6 text-center rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <Info className="h-6 w-6 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  No food waste detected above {Math.round(confidenceThreshold * 100)}% confidence
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Try lowering the confidence threshold slider or upload a closer image of the waste plate.
                </p>
              </div>
            )}

            {/* Detected Items List */}
            {results && results.detections.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Recognized Foods & Review:
                  </span>
                  <span className="text-[11px] text-slate-400">Human-In-The-Loop Audit</span>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {results.detections.map((det, idx) => {
                    const correctionState = corrections[idx];

                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white capitalize">
                              {correctionState?.status === 'corrected'
                                ? correctionState.correctedName
                                : det.class_name}
                            </span>
                            <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                              {Math.round(det.confidence * 100)}%
                            </span>
                          </div>

                          {/* Status Badge */}
                          {correctionState && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              correctionState.status === 'confirmed'
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                : 'bg-purple-500/10 text-purple-700 dark:text-purple-400'
                            }`}>
                              {correctionState.status === 'confirmed' ? 'Confirmed' : 'Corrected'}
                            </span>
                          )}
                        </div>

                        {/* Confirmation and Correction Buttons */}
                        {!correctionState && (
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleConfirmPrediction(det, idx)}
                              disabled={savingCorrectionIdx === idx}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-[11px] font-semibold hover:bg-emerald-100 flex items-center gap-1"
                            >
                              <Check className="h-3 w-3" /> Correct
                            </button>

                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleCorrectPrediction(det, idx, e.target.value);
                                }
                              }}
                              disabled={savingCorrectionIdx === idx}
                              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                              defaultValue=""
                            >
                              <option value="" disabled>Change Class...</option>
                              {SUPPORTED_CLASSES.filter(c => c.name !== det.class_name).map(c => (
                                <option key={c.id} value={c.name}>{c.label}</option>
                              ))}
                              <option value="unsupported">Other / Unsupported</option>
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explicit Action to Save as Confirmed Waste Record */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsConfirmSaveOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Detections as Waste Record</span>
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-1.5 font-medium">
                    Explicit confirmation required before saving to waste log.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal to Save Waste Record */}
      {isConfirmSaveOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Confirm Waste Record Entry
              </h4>
              <button
                type="button"
                onClick={() => setIsConfirmSaveOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <p>
                You are about to log a waste disposal record with the following recognized food categories:
              </p>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                {results?.detections.map((d, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="font-semibold capitalize">{d.class_name}</span>
                    <span className="font-mono text-slate-400">{Math.round(d.confidence * 100)}%</span>
                  </div>
                ))}
              </div>

              {/* Academic Integrity Rule on Weight Estimation */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-[11px] space-y-1">
                <span className="font-bold block">Academic Integrity Rule:</span>
                <span>
                  Bounding boxes alone cannot reliably determine mass or volume. Please enter the physical measured weight from the Food Waste load cell or manual kitchen scale.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Measured Waste Weight (kg):
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder="e.g. 1.2"
                  value={manualWeightInput}
                  onChange={(e) => setManualWeightInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsConfirmSaveOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveWasteRecord}
                disabled={isSavingRecord}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                {isSavingRecord ? 'Saving...' : 'Confirm & Save to Record'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
