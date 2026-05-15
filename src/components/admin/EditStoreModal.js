'use client';

import { useState, useEffect } from 'react';
import { X, Save, Store, Star, AlertCircle, Loader2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const TIPO_NEGOCIO_OPTIONS = [
  { value: '', label: 'Sin especificar' },
  { value: 'productos', label: 'Productos' },
  { value: 'servicios', label: 'Servicios' },
  { value: 'digital', label: 'Digital' },
  { value: 'mixta', label: 'Mixta' },
];

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Sin publicar' },
  { value: 'approved', label: 'Publicada' },
  { value: 'suspended', label: 'Suspendida' },
];

const ROLE_OPTIONS = [
  { value: 'user', label: 'Usuario' },
  { value: 'puestero', label: 'Puestero' },
  { value: 'organizer', label: 'Organizador' },
  { value: 'admin', label: 'Admin' },
];

export default function EditStoreModal({ store, isOpen, onClose, onStoreUpdated }) {
  const [formData, setFormData] = useState({
    businessName: '',
    storeSlug: '',
    tipoNegocio: '',
    description: '',
    whatsapp: '',
    phoneNumber: '',
    accountStatus: 'pending',
    role: 'user',
    featured: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (store && isOpen) {
      setFormData({
        businessName: store.businessName || '',
        storeSlug: store.storeSlug || '',
        tipoNegocio: store.tipoNegocio || '',
        description: store.description || '',
        whatsapp: store.whatsapp || '',
        phoneNumber: store.phoneNumber || '',
        accountStatus: store.accountStatus || 'pending',
        role: store.role || 'user',
        featured: store.featured || false,
      });
      setError('');
    }
  }, [store, isOpen]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!formData.businessName.trim()) throw new Error('El nombre del negocio es obligatorio');
      if (!formData.storeSlug.trim()) throw new Error('El slug es obligatorio');
      if (!/^[a-z0-9-]+$/.test(formData.storeSlug.trim())) throw new Error('El slug solo puede contener letras minúsculas, números y guiones');

      const updateData = {
        businessName: formData.businessName.trim(),
        storeSlug: formData.storeSlug.trim(),
        tipoNegocio: formData.tipoNegocio,
        description: formData.description.trim(),
        whatsapp: formData.whatsapp.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        accountStatus: formData.accountStatus,
        role: formData.role,
        featured: formData.featured,
        updatedAt: new Date(),
      };

      if (!formData.featured) {
        updateData.featuredUntil = null;
      }

      await updateDoc(doc(db, 'users', store.id), updateData);
      onStoreUpdated({ ...store, ...updateData });
      onClose();
    } catch (err) {
      setError(err.message || 'Error al actualizar la tienda');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                <Store className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Editar Tienda</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{store?.email}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Información básica */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Información de la tienda</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre del negocio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Slug (URL) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 whitespace-nowrap">/tienda/</span>
                    <input
                      type="text"
                      name="storeSlug"
                      value={formData.storeSlug}
                      onChange={handleChange}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de negocio</label>
                    <select
                      name="tipoNegocio"
                      value={formData.tipoNegocio}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                    >
                      {TIPO_NEGOCIO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">WhatsApp</label>
                    <input
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      placeholder="+54 9 11 1234-5678"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Estado y permisos */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Estado y permisos</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado de publicación</label>
                  <select
                    name="accountStatus"
                    value={formData.accountStatus}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rol</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Featured toggle */}
              <label className="flex items-center gap-3 mt-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-4 h-4 rounded accent-yellow-500"
                />
                <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Tienda destacada</p>
                  <p className="text-xs text-gray-500">Aparece en la sección Destacadas del home</p>
                </div>
              </label>
            </div>

            {/* Footer */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                ) : (
                  <><Save className="w-4 h-4" /> Guardar cambios</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
