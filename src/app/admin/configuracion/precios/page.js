'use client';

import { useState, useEffect } from 'react';
import { getPricing, updatePricing, DEFAULT_PRICING } from '@/lib/services/pricingService';
import { Save, Loader2, CheckCircle2, DollarSign, Briefcase, Wrench, ShoppingBag, Store } from 'lucide-react';

const SECTIONS = [
  {
    key: 'empleos',
    label: 'Portal de Empleos',
    icon: Briefcase,
    color: 'purple',
    fields: [
      { key: 'dias3', label: '3 días' },
      { key: 'dias5', label: '5 días' },
      { key: 'dias7', label: '7 días' },
    ],
  },
  {
    key: 'servicios',
    label: 'Servicios',
    icon: Wrench,
    color: 'blue',
    fields: [
      { key: 'dias3', label: '3 días' },
      { key: 'dias5', label: '5 días' },
      { key: 'dias7', label: '7 días' },
    ],
  },
  {
    key: 'productos',
    label: 'Productos',
    icon: ShoppingBag,
    color: 'green',
    fields: [
      { key: 'dias3', label: '3 días' },
      { key: 'dias5', label: '5 días' },
      { key: 'dias7', label: '7 días' },
    ],
  },
  {
    key: 'tienda',
    label: 'Suscripción Tienda',
    icon: Store,
    color: 'teal',
    fields: [
      { key: 'mensual',     label: 'Mensual' },
      { key: 'trimestral', label: 'Trimestral' },
      { key: 'anual',      label: 'Anual' },
    ],
  },
];

const COLOR_MAP = {
  purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  blue:   'bg-blue-100   dark:bg-blue-900/20   text-blue-600   dark:text-blue-400',
  green:  'bg-green-100  dark:bg-green-900/20  text-green-600  dark:text-green-400',
  teal:   'bg-teal-100   dark:bg-teal-900/20   text-teal-600   dark:text-teal-400',
};

export default function PreciosPage() {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getPricing().then(data => {
      setPricing(data);
      setLoading(false);
    });
  }, []);

  const handleChange = (section, field, value) => {
    const num = parseInt(value) || 0;
    setPricing(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: num },
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await updatePricing(pricing);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError('Error al guardar. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPricing(DEFAULT_PRICING);
    setSaved(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestión de Precios
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Precios de destaque para cada categoría. Los cambios aplican inmediatamente.
            </p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {SECTIONS.map(section => {
          const Icon = section.icon;
          return (
            <div
              key={section.key}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
            >
              {/* Section header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${COLOR_MAP[section.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-gray-900 dark:text-white">{section.label}</h2>
                {section.key !== 'tienda' && (
                  <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
                    Destaque en el home
                  </span>
                )}
                {section.key === 'tienda' && (
                  <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
                    Plan de suscripción
                  </span>
                )}
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-gray-700">
                {section.fields.map(field => (
                  <div key={field.key} className="px-6 py-4">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      {field.label}
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-400">$</span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={pricing[section.key]?.[field.key] ?? 0}
                        onChange={e => handleChange(section.key, field.key, e.target.value)}
                        className="w-full text-xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-gray-200 dark:border-gray-600 focus:border-red-500 dark:focus:border-red-400 outline-none pb-1 transition-colors"
                      />
                      <span className="text-sm text-gray-400">ARS</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleReset}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors underline underline-offset-2"
        >
          Restaurar valores por defecto
        </button>

        <div className="flex items-center gap-3">
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          {saved && (
            <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">Guardado</span>
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl font-semibold transition-colors shadow-sm"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Guardando...' : 'Guardar precios'}
          </button>
        </div>
      </div>
    </div>
  );
}
