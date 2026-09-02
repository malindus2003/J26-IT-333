import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertCircle, Building2, CheckCircle2, Loader2, X } from 'lucide-react';

const INITIAL_FORM = {
  name: '',
  email: '',
  contact_number: '',
  address: '',
  accepted_waste_types: '',
};

function FieldLabel({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
      {children}<span className="ml-1 text-rose-500">*</span>
    </label>
  );
}

function getErrorMessage(error) {
  const detail = error.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  return 'Unable to register the company. Please check the details and try again.';
}

export default function RecyclingCompanyModal({ isOpen, onClose, onRegistered }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    setForm(INITIAL_FORM);
    setFeedback(null);
    const originalOverflow = document.body.style.overflow;
    const handleEscape = (event) => event.key === 'Escape' && onClose();
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (feedback) setFeedback(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback(null);

    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setFeedback({ type: 'error', message: 'Enter a valid company email address.' });
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post('http://localhost:8000/api/waste/recycling-companies', {
        name: form.name.trim(),
        email: form.email.trim(),
        contact_number: form.contact_number.trim(),
        address: form.address.trim(),
        accepted_waste_types: form.accepted_waste_types,
      });
      setFeedback({ type: 'success', message: `${response.data.name} registered successfully.` });
      setForm(INITIAL_FORM);
      onRegistered?.(response.data);
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-600';

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/75 px-3 py-4 backdrop-blur-sm sm:items-center sm:px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recycling-company-title"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-black/40 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <h3 id="recycling-company-title" className="text-lg font-bold text-slate-900 dark:text-white">Register Recycling Company</h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Add a collection partner and select the recyclable waste they accept.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" aria-label="Close recycling company form">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-5 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="company-name">Company name</FieldLabel>
              <input id="company-name" required maxLength="120" value={form.name} onChange={(event) => updateField('name', event.target.value)} className={inputClasses} placeholder="Green Cycle Ltd" />
            </div>
            <div>
              <FieldLabel htmlFor="company-email">Company email</FieldLabel>
              <input id="company-email" type="email" required maxLength="254" value={form.email} onChange={(event) => updateField('email', event.target.value)} className={inputClasses} placeholder="collections@example.com" />
            </div>
            <div>
              <FieldLabel htmlFor="company-contact">Contact number</FieldLabel>
              <input id="company-contact" type="tel" required maxLength="40" value={form.contact_number} onChange={(event) => updateField('contact_number', event.target.value)} className={inputClasses} placeholder="+94 77 123 4567" />
            </div>
            <div>
              <FieldLabel htmlFor="accepted-waste-types">Accepted waste types</FieldLabel>
              <select id="accepted-waste-types" required value={form.accepted_waste_types} onChange={(event) => updateField('accepted_waste_types', event.target.value)} className={inputClasses}>
                <option value="">Select accepted waste</option>
                <option value="Plastic">Plastic</option>
                <option value="Paper">Paper</option>
                <option value="Both">Both</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <FieldLabel htmlFor="company-address">Address</FieldLabel>
              <textarea id="company-address" required rows="3" maxLength="500" value={form.address} onChange={(event) => updateField('address', event.target.value)} className={`${inputClasses} resize-y`} placeholder="Company collection address" />
            </div>
          </div>

          {feedback && (
            <div className={`flex items-start gap-2 rounded-xl border px-3.5 py-3 text-sm ${feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300' : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'}`} role="status">
              {feedback.type === 'success' ? <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 dark:border-slate-800 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">Cancel</button>
            <button type="submit" disabled={submitting} className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Registering...' : 'Register Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
