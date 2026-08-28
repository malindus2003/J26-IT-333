import React, { useEffect, useState } from 'react';
import { ClipboardPlus, X } from 'lucide-react';

const MAIN_CATEGORIES = ['Food', 'Plastic', 'Paper'];

const FOOD_ITEMS = {
  Fruit: ['Banana', 'Mango', 'Apple', 'Orange', 'Pineapple', 'Papaya', 'Other Fruit'],
  Vegetables: ['Onion', 'Carrot', 'Potato', 'Tomato', 'Cabbage', 'Lettuce', 'Other Vegetable'],
  'Rice & Grains': ['Rice', 'Noodles', 'Pasta', 'Bread', 'Roti / Flatbread', 'Other Grain Product'],
  Poultry: ['Chicken', 'Duck', 'Turkey', 'Other Poultry'],
  Meat: ['Beef', 'Pork', 'Mutton', 'Lamb', 'Goat', 'Other Meat'],
  Seafood: ['Fish', 'Prawn / Shrimp', 'Crab', 'Squid', 'Other Seafood'],
  'Egg & Dairy': ['Egg', 'Milk', 'Cheese', 'Yogurt / Curd', 'Other Dairy'],
  'Prepared / Mixed Food': ['Fried Rice', 'Kottu', 'Curry', 'Salad', 'Sandwich', 'Pizza', 'Burger', 'Other Prepared Food'],
  'Sauces / Liquids': ['Gravy', 'Curry Sauce', 'Soup', 'Chutney', 'Dressing', 'Other Sauce / Liquid'],
  'Bakery / Dessert': ['Cake', 'Pastry', 'Biscuit / Cookie', 'Ice Cream', 'Pudding', 'Brownie', 'Donut', 'Other Dessert'],
  'Other Food': ['Other Food Item'],
};

const GENERIC_PARTS = ['Whole', 'Cooked', 'Raw', 'Mixed', 'Other'];

const ITEM_PARTS = {
  Banana: ['Peel', 'Flesh', 'Whole'],
  Mango: ['Peel', 'Flesh', 'Seed', 'Whole'],
  Apple: ['Peel', 'Flesh', 'Core', 'Whole'],
  Chicken: ['Meat', 'Bone', 'Skin', 'Whole', 'Mixed'],
  Fish: ['Flesh', 'Bone', 'Head', 'Skin', 'Whole', 'Mixed'],
  Rice: ['Raw', 'Cooked'],
  Bread: ['Slice', 'Crust', 'Whole'],
};

const INEDIBLE_PARTS = new Set([
  'Peel',
  'Seed',
  'Core',
  'Bone',
  'Head',
]);

const FOOD_OPTIONS = {
  wasteStages: ['Preparation Waste', 'Plate Waste', 'Spoilage / Storage Waste', 'Overproduction Waste'],
  edibility: ['Edible / Potentially Avoidable', 'Inedible / Unavoidable'],
  conditions: ['Fresh / Normal', 'Raw', 'Cooked', 'Spoiled', 'Rotten', 'Expired', 'Burnt / Overcooked', 'Contaminated', 'Other'],
  reasons: ['Peeling / Trimming', 'Bone / Shell Removal', 'Customer Leftover', 'Overproduction', 'Spoiled During Storage', 'Expired', 'Burnt / Cooking Error', 'Dropped', 'Incorrect Order', 'Quality Rejection', 'Other'],
};

const LOCATIONS = [
  'Preparation Kitchen',
  'Cooking Area',
  'Serving Area',
  'Customer Dining Area',
  'Buffet',
  'Storage',
  'Dishwashing Area',
  'Bar / Beverage Area',
  'Other',
];

const INITIAL_FORM = {
  mainCategory: '',
  foodCategory: '',
  item: '',
  part: '',
  wasteStage: '',
  edibility: '',
  condition: '',
  reason: '',
  weight: '',
  weightUnit: 'grams',
  quantity: 1,
  location: '',
  notes: '',
};

function SelectField({ id, label, value, onChange, options, required = false, placeholder = 'Select an option' }) {
  return (
    <label htmlFor={id} className="block space-y-1.5">
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
        {label}{required && <span className="ml-1 text-rose-400">*</span>}
      </span>
      <select
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function Section({ title, children }) {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/40 sm:p-5">
      <h4 className="border-b border-slate-200 pb-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:border-slate-800 dark:text-rose-400">
        {title}
      </h4>
      {children}
    </section>
  );
}

export default function WasteRegistrationModal({ isOpen, onClose }) {
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (!isOpen) return undefined;

    setForm(INITIAL_FORM);

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    const originalOverflow = document.body.style.overflow;
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
  };

  const handleMainCategoryChange = (event) => {
    setForm({
      ...INITIAL_FORM,
      mainCategory: event.target.value,
      weightUnit: form.weightUnit,
      quantity: form.quantity,
      weight: form.weight,
      location: form.location,
      notes: form.notes,
    });
  };

  const handleFoodCategoryChange = (event) => {
    setForm((current) => ({
      ...current,
      foodCategory: event.target.value,
      item: '',
      part: '',
      edibility: '',
    }));
  };

  const handleItemChange = (event) => {
    setForm((current) => ({
      ...current,
      item: event.target.value,
      part: '',
      edibility: '',
    }));
  };

  const handlePartChange = (event) => {
    const part = event.target.value;
    setForm((current) => ({
      ...current,
      part,
      edibility: part
        ? (INEDIBLE_PARTS.has(part) ? 'Inedible / Unavoidable' : 'Edible / Potentially Avoidable')
        : '',
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const commonFields = {
      weight: Number(form.weight),
      weightUnit: form.weightUnit,
      quantity: form.quantity === '' ? null : Number(form.quantity),
      location: form.location,
      notes: form.notes.trim(),
    };

    let registration;

    if (form.mainCategory === 'Food') {
      registration = {
        mainCategory: form.mainCategory,
        foodCategory: form.foodCategory,
        item: form.item,
        part: form.part,
        wasteStage: form.wasteStage,
        edibility: form.edibility,
        condition: form.condition,
        reason: form.reason,
        ...commonFields,
      };
    } else {
      registration = { mainCategory: form.mainCategory, ...commonFields };
    }

    console.log('Registered wastage:', registration);
    onClose();
  };

  const foodItems = form.foodCategory ? FOOD_ITEMS[form.foodCategory] : [];
  const partOptions = form.item ? (ITEM_PARTS[form.item] || GENERIC_PARTS) : [];
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 px-3 py-4 backdrop-blur-sm sm:px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="waste-registration-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-black/40 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/60">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 rounded-xl bg-rose-50 p-2 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
              <ClipboardPlus className="h-5 w-5" />
            </span>
            <div>
              <h3 id="waste-registration-title" className="text-lg font-bold text-slate-900 dark:text-white">Register Wastage</h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Record detailed food-waste data or update Plastic and Paper bin weight.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Close waste registration form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form id="waste-registration-form" onSubmit={handleSubmit} className="overflow-y-auto px-4 py-5 sm:px-6">
          <div className="space-y-5">
            <Section title="Waste Identification">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SelectField
                  id="main-category"
                  label="Main Category"
                  value={form.mainCategory}
                  onChange={handleMainCategoryChange}
                  options={MAIN_CATEGORIES}
                  required
                />

                {form.mainCategory === 'Food' && (
                  <SelectField
                    id="food-category"
                    label="Food Category"
                    value={form.foodCategory}
                    onChange={handleFoodCategoryChange}
                    options={Object.keys(FOOD_ITEMS)}
                    required
                  />
                )}

                {form.mainCategory === 'Food' && form.foodCategory && (
                  <SelectField
                    id="specific-food-item"
                    label="Specific Food Item"
                    value={form.item}
                    onChange={handleItemChange}
                    options={foodItems}
                    required
                  />
                )}

                {form.mainCategory === 'Food' && form.item && (
                  <SelectField
                    id="food-part"
                    label="Part / Form"
                    value={form.part}
                    onChange={handlePartChange}
                    options={partOptions}
                    required
                  />
                )}

              </div>
            </Section>

            {form.mainCategory === 'Food' && (
              <Section title="Waste Details">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <SelectField
                    id="waste-stage"
                    label="Waste Stage"
                    value={form.wasteStage}
                    onChange={(event) => updateField('wasteStage', event.target.value)}
                    options={FOOD_OPTIONS.wasteStages}
                    required
                  />
                  <SelectField
                    id="edibility"
                    label="Edibility"
                    value={form.edibility}
                    onChange={(event) => updateField('edibility', event.target.value)}
                    options={FOOD_OPTIONS.edibility}
                    placeholder="Select or use suggested value"
                  />
                  <SelectField
                    id="food-condition"
                    label="Food Condition"
                    value={form.condition}
                    onChange={(event) => updateField('condition', event.target.value)}
                    options={FOOD_OPTIONS.conditions}
                  />
                  <SelectField
                    id="waste-reason"
                    label="Reason for Waste"
                    value={form.reason}
                    onChange={(event) => updateField('reason', event.target.value)}
                    options={FOOD_OPTIONS.reasons}
                  />
                </div>
              </Section>
            )}

            <Section title="Measurement">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label htmlFor="waste-weight" className="block space-y-1.5">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Weight<span className="ml-1 text-rose-400">*</span></span>
                  <input
                    id="waste-weight"
                    type="number"
                    min="0.01"
                    step="any"
                    required
                    value={form.weight}
                    onChange={(event) => updateField('weight', event.target.value)}
                    placeholder="120"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-600"
                  />
                </label>
                <SelectField
                  id="weight-unit"
                  label="Unit"
                  value={form.weightUnit}
                  onChange={(event) => updateField('weightUnit', event.target.value)}
                  options={['grams', 'kilograms']}
                  required
                />
                <label htmlFor="waste-quantity" className="block space-y-1.5">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Quantity</span>
                  <input
                    id="waste-quantity"
                    type="number"
                    min="1"
                    step="1"
                    value={form.quantity}
                    onChange={(event) => updateField('quantity', event.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100"
                  />
                </label>
                <SelectField
                  id="waste-location"
                  label="Waste Source / Location"
                  value={form.location}
                  onChange={(event) => updateField('location', event.target.value)}
                  options={LOCATIONS}
                />
                <label htmlFor="waste-notes" className="block space-y-1.5 sm:col-span-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Notes</span>
                  <textarea
                    id="waste-notes"
                    rows="3"
                    value={form.notes}
                    onChange={(event) => updateField('notes', event.target.value)}
                    placeholder="Leftover rice from customer table."
                    className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-600"
                  />
                </label>
              </div>
            </Section>
          </div>
        </form>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50/95 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/95 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="waste-registration-form"
            className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-400"
          >
            Register Wastage
          </button>
        </div>
      </div>
    </div>
  );
}
