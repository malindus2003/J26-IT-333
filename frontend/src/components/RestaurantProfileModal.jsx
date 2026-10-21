import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Building2, 
  MapPin, 
  Check, 
  Compass, 
  Save, 
  Plus, 
  X, 
  CloudRain, 
  Phone, 
  Users, 
  RefreshCw, 
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Store
} from 'lucide-react';
import axios from 'axios';

export default function RestaurantProfileModal({ isOpen, onClose }) {
  const [profile, setProfile] = useState(null);
  const [activeBranch, setActiveBranch] = useState(null);
  const [liveWeather, setLiveWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('branches'); // 'branches', 'edit', 'add'

  // Edit Form State
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editLat, setEditLat] = useState('');
  const [editLon, setEditLon] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCapacity, setEditCapacity] = useState('75');

  // Add Branch Form State
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newLat, setNewLat] = useState('6.0329');
  const [newLon, setNewLon] = useState('80.2168');
  const [newPhone, setNewPhone] = useState('');
  const [newCapacity, setNewCapacity] = useState('50');

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await axios.get('http://localhost:8000/api/demand/profile');
      if (res.data && res.data.profile) {
        setProfile(res.data.profile);
        setActiveBranch(res.data.active_branch);
        setLiveWeather(res.data.live_weather);

        // Prepopulate edit form with active branch
        const ab = res.data.active_branch;
        if (ab) {
          setEditName(ab.name || '');
          setEditAddress(ab.address || '');
          setEditCity(ab.city || '');
          setEditLat(ab.latitude?.toString() || '');
          setEditLon(ab.longitude?.toString() || '');
          setEditPhone(ab.phone || '');
          setEditCapacity(ab.seating_capacity?.toString() || '75');
        }
      }
    } catch (err) {
      console.error('Error fetching restaurant profile:', err);
      setErrorMsg('Could not load profile from server. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchBranch = async (branchId) => {
    try {
      setSaving(true);
      setErrorMsg('');
      const res = await axios.post('http://localhost:8000/api/demand/profile/switch-branch', {
        branch_id: branchId
      });
      if (res.data && res.data.status === 'success') {
        setProfile(res.data.profile);
        setActiveBranch(res.data.active_branch);
        setLiveWeather(res.data.live_weather);
        setSuccessMsg(`Switched active branch to ${res.data.active_branch.name}! Live weather & demand model updated.`);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Error switching branch:', err);
      setErrorMsg('Failed to switch active branch.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveActiveBranch = async (e) => {
    e.preventDefault();
    if (!activeBranch) return;

    try {
      setSaving(true);
      setErrorMsg('');
      const res = await axios.put('http://localhost:8000/api/demand/profile/branch', {
        branch_id: activeBranch.id,
        name: editName,
        address: editAddress,
        city: editCity,
        latitude: parseFloat(editLat),
        longitude: parseFloat(editLon),
        phone: editPhone,
        seating_capacity: parseInt(editCapacity, 10)
      });
      if (res.data && res.data.status === 'success') {
        setProfile(res.data.profile);
        setSuccessMsg('Branch details and GPS coordinates successfully saved & synced to Firebase!');
        fetchProfile(); // reload updated weather
        setTimeout(() => {
          setSuccessMsg('');
          setActiveTab('branches');
        }, 2000);
      }
    } catch (err) {
      console.error('Error updating branch:', err);
      setErrorMsg('Failed to save branch changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddBranch = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg('');
      const res = await axios.post('http://localhost:8000/api/demand/profile/branch/add', {
        name: newName,
        address: newAddress,
        city: newCity,
        latitude: parseFloat(newLat),
        longitude: parseFloat(newLon),
        phone: newPhone,
        seating_capacity: parseInt(newCapacity, 10)
      });
      if (res.data && res.data.status === 'success') {
        setSuccessMsg(`New branch '${newName}' registered successfully!`);
        fetchProfile();
        setNewName('');
        setNewAddress('');
        setNewCity('');
        setNewPhone('');
        setTimeout(() => {
          setSuccessMsg('');
          setActiveTab('branches');
        }, 2500);
      }
    } catch (err) {
      console.error('Error adding branch:', err);
      setErrorMsg('Failed to register new branch.');
    } finally {
      setSaving(false);
    }
  };

  const handleAutoDetectGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setEditLat(pos.coords.latitude.toFixed(4));
          setEditLon(pos.coords.longitude.toFixed(4));
          setSuccessMsg(`GPS Coordinates detected: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
          setTimeout(() => setSuccessMsg(''), 3000);
        },
        (err) => {
          setErrorMsg(`GPS permission denied or unavailable (${err.message}). Using manual coordinates.`);
          setTimeout(() => setErrorMsg(''), 3500);
        }
      );
    } else {
      setErrorMsg('Geolocation is not supported by this browser.');
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-inner">
              <Store className="h-5 w-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">Restaurant Profile & Branches</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                  Admin Only
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 font-medium">
                Manage restaurant identity, branch locations, and GPS coordinates for real-time AI weather intelligence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            title="Close Settings"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-3 bg-slate-50/80 dark:bg-slate-800/40 gap-2">
          <button
            onClick={() => setActiveTab('branches')}
            className={`pb-2.5 px-3 text-xs font-black border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'branches'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Building2 className="h-4 w-4" />
            Branch Overview & Switcher
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`pb-2.5 px-3 text-xs font-black border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'edit'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Compass className="h-4 w-4" />
            Edit Coordinates & Details
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`pb-2.5 px-3 text-xs font-black border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'add'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Plus className="h-4 w-4" />
            Register New Branch
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5">
          
          {/* Notification Alerts */}
          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-xs">
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-xs">
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-slate-500 space-y-3">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-emerald-600" />
              <p className="text-xs font-bold">Connecting to Centralized Restaurant Profile & Firebase...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: BRANCH OVERVIEW & SWITCHER */}
              {activeTab === 'branches' && (
                <div className="space-y-5">
                  {/* Active Restaurant Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800/80 dark:to-slate-800/40 border border-emerald-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                        Primary Restaurant Identity
                      </span>
                      <h4 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                        {profile?.restaurant_name || 'Hikkaduwa Coastal Seafood Restaurant'}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        Cuisine: {profile?.cuisine || 'Fresh Coastal Seafood, Rice & Curry & Grills'}
                      </p>
                    </div>

                    {liveWeather && (
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-slate-700 text-right shadow-2xs self-start sm:self-auto">
                        <span className="text-[9px] font-black uppercase text-slate-400 block">Live Weather Feed</span>
                        <div className="text-xs font-black text-emerald-700 dark:text-emerald-400 flex items-center justify-end gap-1 mt-0.5">
                          <CloudRain className="h-3.5 w-3.5" />
                          <span>{liveWeather.weather_condition}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-semibold block">
                          Impact: {liveWeather.weather_impact}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Branches Grid */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        Operating Outlets & Branches ({profile?.branches?.length || 0})
                      </h5>
                      <span className="text-[10px] font-bold text-slate-500">
                        Click 'Switch' to recalculate live weather & demand
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {profile?.branches?.map((branch) => {
                        const isActive = branch.id === profile?.active_branch_id;
                        return (
                          <div 
                            key={branch.id}
                            className={`p-4 rounded-2xl border transition-all ${
                              isActive 
                                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500 dark:border-emerald-600 shadow-sm ring-1 ring-emerald-500/30'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h6 className="text-sm font-black text-slate-900 dark:text-white">
                                    {branch.name}
                                  </h6>
                                  {isActive && (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-700 text-white uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                                      <Check className="h-3 w-3" /> Active Operating Branch
                                    </span>
                                  )}
                                  {branch.status_badge && (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                      {branch.status_badge}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium flex-wrap">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                                    {branch.address}, {branch.city}
                                  </span>
                                  <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 font-bold">
                                    GPS: {branch.latitude}° N, {branch.longitude}° E
                                  </span>
                                  {branch.seating_capacity && (
                                    <span className="flex items-center gap-1">
                                      <Users className="h-3.5 w-3.5 text-slate-400" />
                                      {branch.seating_capacity} Pax
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
                                {isActive ? (
                                  <button
                                    onClick={() => {
                                      setActiveTab('edit');
                                    }}
                                    className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-400 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-black text-xs hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
                                  >
                                    Edit Coordinates
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleSwitchBranch(branch.id)}
                                    disabled={saving}
                                    className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-black text-xs transition-all cursor-pointer shadow-xs disabled:opacity-50"
                                  >
                                    Switch Branch
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: EDIT ACTIVE BRANCH LOCATION & COORDINATES */}
              {activeTab === 'edit' && (
                <form onSubmit={handleSaveActiveBranch} className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-medium flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold block">Configuring: {activeBranch?.name}</span>
                      <span>Coordinates feed directly into Open-Meteo Weather API to predict rainfall surges & shifts.</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoDetectGPS}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs cursor-pointer flex-shrink-0"
                    >
                      <Compass className="h-3.5 w-3.5" />
                      Auto-Detect GPS
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Branch Name</label>
                      <input 
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">City / Town</label>
                      <input 
                        type="text"
                        value={editCity}
                        onChange={e => setEditCity(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Physical Street Address</label>
                      <input 
                        type="text"
                        value={editAddress}
                        onChange={e => setEditAddress(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Latitude (°N) <span className="text-[10px] text-slate-400 font-normal">(Hikkaduwa: 6.1395)</span>
                      </label>
                      <input 
                        type="number"
                        step="0.0001"
                        value={editLat}
                        onChange={e => setEditLat(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Longitude (°E) <span className="text-[10px] text-slate-400 font-normal">(Hikkaduwa: 80.1063)</span>
                      </label>
                      <input 
                        type="number"
                        step="0.0001"
                        value={editLon}
                        onChange={e => setEditLon(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Contact Phone</label>
                      <input 
                        type="text"
                        value={editPhone}
                        onChange={e => setEditPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Seating Capacity (Pax)</label>
                      <input 
                        type="number"
                        value={editCapacity}
                        onChange={e => setEditCapacity(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('branches')}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2 rounded-xl text-xs font-black bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-700/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      <span>Save & Sync to Firebase</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: REGISTER NEW BRANCH */}
              {activeTab === 'add' && (
                <form onSubmit={handleAddBranch} className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs font-medium">
                    Registering a new branch allows multi-outlet POS data integration and independent weather-driven prep sizing.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Branch Name</label>
                      <input 
                        type="text"
                        placeholder="e.g. Negombo Coastal Diner"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">City / District</label>
                      <input 
                        type="text"
                        placeholder="e.g. Negombo, Western Province"
                        value={newCity}
                        onChange={e => setNewCity(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Address</label>
                      <input 
                        type="text"
                        placeholder="e.g. Porutota Road, Negombo"
                        value={newAddress}
                        onChange={e => setNewAddress(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Latitude (°N)</label>
                      <input 
                        type="number"
                        step="0.0001"
                        placeholder="7.2083"
                        value={newLat}
                        onChange={e => setNewLat(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Longitude (°E)</label>
                      <input 
                        type="number"
                        step="0.0001"
                        placeholder="79.8358"
                        value={newLon}
                        onChange={e => setNewLon(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('branches')}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      <span>Add Branch to Enterprise</span>
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

        </div>

      </div>
    </div>,
    document.body
  );
}
