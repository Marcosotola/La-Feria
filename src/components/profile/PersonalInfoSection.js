// src/components/profile/PersonalInfoSection.js
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { User, Save } from 'lucide-react';

export default function PersonalInfoSection({ showMessage }) {
  const { userData, user, refreshUserData } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: ''
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData) {
      // Mostrar solo el número local (sin el +549 que guarda el sistema)
      const rawPhone = userData.phone || ''
      const localPhone = rawPhone.startsWith('+549') ? rawPhone.slice(4) : rawPhone
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: localPhone,
        address: userData.address || '',
        city: userData.city || ''
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
        // Guardar siempre con el prefijo +549 para mensajes automáticos
        phone: formData.phone ? `+549${formData.phone}` : '',
        updatedAt: new Date()
      });

      await refreshUserData();
      showMessage('success', 'Datos personales actualizados correctamente');

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
        <User className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Datos Personales
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Apellido
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Teléfono
            </label>
            <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-primary-500">
              <span className="px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-sm font-mono border-r border-gray-300 dark:border-gray-600 flex items-center select-none">
                +549
              </span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '')
                  setFormData(prev => ({ ...prev, phone: digits }))
                }}
                className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
                placeholder="3511234567 (sin 0, sin 15)"
                maxLength={10}
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1 px-1">
              Cod. área + número sin el 0 inicial ni el 15 (ej: <span className="font-mono">3511234567</span>)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ciudad
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Buenos Aires"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Dirección
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Av. Corrientes 1234"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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