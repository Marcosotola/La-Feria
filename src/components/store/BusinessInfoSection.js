// src/components/store/BusinessInfoSection.js
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Building2, Save, Store } from 'lucide-react';

export default function BusinessInfoSection({ showMessage }) {
  const { userData, user, refreshUserData } = useAuth();
  
  const [formData, setFormData] = useState({
    businessName: '',
    familyName: '',
    slogan: '',
    storeSlug: ''
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData) {
      setFormData({
        businessName: userData.businessName || '',
        familyName: userData.familyName || '',
        slogan: userData.slogan || '',
        storeSlug: userData.storeSlug || ''
      });
    }
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user?.uid) {
        throw new Error('Usuario no disponible');
      }

      await updateDoc(doc(db, 'users', user.uid), {
        ...formData,
        updatedAt: new Date()
      });

      await refreshUserData();
      showMessage('success', 'Datos del negocio actualizados correctamente');

    } catch (error) {
      console.error('Error al actualizar datos:', error);
      showMessage('error', `Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Building2 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Datos del Negocio
        </h2>
      </div>

      {/* Preview del logo si existe */}
      {userData.storeLogo && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-10 bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 flex items-center justify-center">
              <img
                src={userData.storeLogo}
                alt="Logo de la tienda"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Logo actual de tu tienda
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Puedes cambiarlo en la sección "Logo de la Tienda"
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre del Negocio
            </label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre de Familia
            </label>
            <input
              type="text"
              name="familyName"
              value={formData.familyName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Slogan de la Tienda
          </label>
          <input
            type="text"
            name="slogan"
            value={formData.slogan}
            onChange={handleInputChange}
            placeholder="Ej: Tu tienda familiar de confianza"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Una frase corta que describa tu negocio (opcional)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            URL de la Tienda
          </label>
          <div className="flex flex-col sm:flex-row">
            <span className="inline-flex items-center px-3 py-2 border border-b-0 sm:border-b sm:border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm rounded-t-lg sm:rounded-t-none sm:rounded-l-lg">
              laferia.com/tienda/
            </span>
            <input
              type="text"
              name="storeSlug"
              value={formData.storeSlug}
              onChange={handleInputChange}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-b-lg sm:rounded-b-none sm:rounded-r-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-0"
              placeholder="mi-tienda"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Solo letras, números y guiones. Ejemplo: mi-tienda-familiar
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}