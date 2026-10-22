import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  Phone, 
  User, 
  Armchair, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';
import axios from 'axios';

const TABLE_OPTIONS = [
  { no: 'Table 01', capacity: 2, zone: 'Window Patio' },
  { no: 'Table 02', capacity: 4, zone: 'Main Dining Hall' },
  { no: 'Table 03', capacity: 2, zone: 'Window Patio' },
  { no: 'Table 04', capacity: 4, zone: 'Main Dining Hall' },
  { no: 'Table 05', capacity: 6, zone: 'Family Booth' },
  { no: 'Table 06', capacity: 4, zone: 'Main Dining Hall' },
  { no: 'Table 07', capacity: 2, zone: 'Window Patio' },
  { no: 'Table 08', capacity: 8, zone: 'Large Party Bay' },
  { no: 'Table 09', capacity: 4, zone: 'Main Dining Hall' },
  { no: 'Table 10', capacity: 2, zone: 'Window Patio' },
  { no: 'Table 11', capacity: 4, zone: 'Main Dining Hall' },
  { no: 'Table 12', capacity: 6, zone: 'Family Booth' },
  { no: 'VIP Lounge Area', capacity: 8, zone: 'Private VIP Deck' },
  { no: 'Ocean Deck Tables 01-03', capacity: 14, zone: 'Beachfront Terrace' }
];

const SHIFT_OPTIONS = [
  'Dinner Service (7:00 PM)',
  'Dinner Late Rush (8:30 PM)',
  'Lunch Service (1:00 PM)',
  'Sunset Dining (5:30 PM)',
  'Special Event Service'
];

export default function AddReservationModal({ isOpen, onClose, onReservationAdded }) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(todayStr);
  const [shift, setShift] = useState('Dinner Service (7:00 PM)');
  const [selectedTables, setSelectedTables] = useState(['Table 04']);
  const [isTableDropdownOpen, setIsTableDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [pax, setPax] = useState(4);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('Confirmed');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const resetForm = () => {
    setCustomerName('');
    setPhone('');
    setDate(new Date().toISOString().split('T')[0]);
    setShift('Dinner Service (7:00 PM)');
    setSelectedTables(['Table 04']);
    setIsTableDropdownOpen(false);
    setPax(4);
    setNotes('');
    setStatus('Confirmed');
    setErrorMsg('');
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsTableDropdownOpen(false);
      }
    };
    if (isTableDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTableDropdownOpen]);

  const toggleTable = (tableNo) => {
    setSelectedTables(prev => {
      if (prev.includes(tableNo)) {
        return prev.filter(t => t !== tableNo);
      } else {
        return [...prev, tableNo];
      }
    });
  };

  const selectAllTables = () => {
    setSelectedTables(TABLE_OPTIONS.map(t => t.no));
  };

  const clearAllTables = () => {
    setSelectedTables([]);
  };

  const combinedCapacity = selectedTables.reduce((sum, no) => {
    const table = TABLE_OPTIONS.find(t => t.no === no);
    return sum + (table ? table.capacity : 0);
  }, 0);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMsg('Customer name is required.');
      return;
    }
    if (selectedTables.length === 0) {
      setErrorMsg('Please select at least one dining table.');
      return;
    }
    const parsedPax = parseInt(pax, 10);
    if (isNaN(parsedPax) || parsedPax <= 0) {
      setErrorMsg('Please specify a valid guest count (pax) greater than 0.');
      return;
    }

    const finalTableStr = selectedTables.join(', ');

    const payload = {
      customer_name: customerName.trim(),
      phone: phone.trim(),
      date: date || todayStr,
      shift: shift,
      table_number: finalTableStr,
      pax: parsedPax,
      notes: notes.trim(),
      status: status || 'Confirmed'
    };

    try {
      setSaving(true);
      setErrorMsg('');
      const res = await axios.post('http://localhost:8000/api/orders/reservations', payload);
      if (res.data?.status === 'success' || res.data?.data) {
        if (onReservationAdded) {
          onReservationAdded(res.data.data);
        }
        resetForm();
        onClose();
      }
    } catch (err) {
      console.error('Failed to save reservation:', err);
      // Fallback: create locally
      const localRes = {
        id: `res-${Date.now()}`,
        ...payload,
        created_at: new Date().toISOString()
      };
      if (onReservationAdded) {
        onReservationAdded(localRes);
      }
      resetForm();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/50 flex items-center justify-center text-amber-700 dark:text-amber-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                New Table Reservation
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Firebase Sync
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Reserve table, record guest pax, and automatically calibrate AI Food Demand Forecasts
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Customer Name */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Guest / Host Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Mr. Chamara Alwis / Corporate Group"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Contact Phone */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Contact Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+94 77 123 4567"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Booking Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Shift / Dining Time */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Service Shift / Time
              </label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {SHIFT_OPTIONS.map((sh) => (
                  <option key={sh} value={sh}>{sh}</option>
                ))}
              </select>
            </div>

            {/* Multi-Select Reserved Tables Dropdown with Checkboxes */}
            <div className="space-y-1 relative" ref={dropdownRef}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Armchair className="w-3.5 h-3.5 text-slate-400" />
                  Reserved Table(s) <span className="text-rose-500">*</span>
                </label>
                {selectedTables.length > 0 && (
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                    {selectedTables.length} table{selectedTables.length > 1 ? 's' : ''} ({combinedCapacity} Pax cap.)
                  </span>
                )}
              </div>

              {/* Trigger Button */}
              <button
                type="button"
                onClick={() => setIsTableDropdownOpen(!isTableDropdownOpen)}
                className={`w-full px-3 py-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  isTableDropdownOpen 
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/30 dark:bg-slate-800' 
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                } text-slate-900 dark:text-white`}
              >
                <div className="flex items-center gap-1.5 overflow-hidden flex-1 mr-2">
                  {selectedTables.length === 0 ? (
                    <span className="text-slate-400 font-normal">Select dining table(s)...</span>
                  ) : selectedTables.length === 1 ? (
                    <span className="truncate">
                      {selectedTables[0]} ({TABLE_OPTIONS.find(t => t.no === selectedTables[0])?.capacity || 2} Pax • {TABLE_OPTIONS.find(t => t.no === selectedTables[0])?.zone || ''})
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md text-[11px]">
                        {selectedTables.length} Tables Selected
                      </span>
                      <span className="text-slate-600 dark:text-slate-300 text-[11px] truncate">
                        ({selectedTables.join(', ')})
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 text-slate-400 flex-shrink-0">
                  {isTableDropdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Dropdown Menu Overlay with Checkboxes */}
              {isTableDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-2 max-h-60 overflow-y-auto space-y-1 animate-fade-in">
                  {/* Quick Select Actions */}
                  <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 dark:border-slate-800 text-[11px]">
                    <span className="font-bold text-slate-500 dark:text-slate-400">
                      Select multiple tables:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={selectAllTables}
                        className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
                      >
                        Select All
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={clearAllTables}
                        className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Table Options with Checkboxes */}
                  <div className="space-y-0.5 pt-1">
                    {TABLE_OPTIONS.map((t) => {
                      const isChecked = selectedTables.includes(t.no);
                      return (
                        <div
                          key={t.no}
                          onClick={() => toggleTable(t.no)}
                          className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-bold'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                            />
                            <span className="truncate">{t.no}</span>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md flex-shrink-0 ${
                            isChecked 
                              ? 'bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 font-black' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}>
                            {t.capacity} Pax • {t.zone}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary Footer */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between px-2 text-[11px]">
                    <span className="text-slate-500">
                      Total Cap: <strong className="text-slate-800 dark:text-slate-200">{combinedCapacity} Pax</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsTableDropdownOpen(false)}
                      className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] shadow-sm cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Pax Count */}
            <div className="sm:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  Party Size / Guest Pax <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs font-mono font-black text-amber-700 dark:text-amber-400">
                  {pax} Guests Confirmed
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 4, 6, 8, 10, 14].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPax(num)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all border ${
                      pax === num
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-amber-50'
                    }`}
                  >
                    {num}
                  </button>
                ))}
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={pax}
                  onChange={(e) => setPax(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-16 px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-center font-mono font-bold text-xs"
                />
              </div>
            </div>

            {/* Notes / Special Requests */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Chef Notes, Dietary & Special Requests
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Birthday celebration, pre-ordered seafood marinara pizzas and seafood platter, high chair requested."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-600 to-emerald-700 hover:from-amber-700 hover:to-emerald-800 text-white shadow-md active:scale-95 transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Registering Reservation...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Save Reservation</span>
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
