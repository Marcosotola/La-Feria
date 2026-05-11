// src/components/auth/CompleteProfileModal.js

'use client';

import { useState } from 'react';
import { X, Home, Building2, Check } from 'lucide-react';

export default function CompleteProfileModal({ user, onComplete }) {
  // Estado inicial con todos los valores definidos como boolean
  const [formData, setFormData] = useState({
    familyName: '',
    businessName: '',
    acceptNotifications: false,
    acceptTerms: false
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Función para generar slug de la tienda
  const generateStoreSlug = (businessName, displayName) => {
    const name = businessName || displayName || 'tienda';
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s]/g, '') // Solo letras, números y espacios
      .trim()
      .replace(/\s+/g, '-'); // Espacios a guiones
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.familyName) newErrors.familyName = 'El nombre de la familia es requerido';
    if (!formData.businessName) newErrors.businessName = 'El nombre del negocio es requerido';
    if (!formData.acceptTerms) newErrors.acceptTerms = 'Debes aceptar los términos y condiciones';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Llamar la función del contexto para completar el perfil
      await onComplete(formData);
      
      // Redirigir al dashboard después de completar exitosamente
      window.location.href = '/dashboard';
    } catch (error) {
      setErrors({ general: 'Error al guardar los datos. Intenta nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  // Handler mejorado que garantiza valores boolean para checkboxes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? Boolean(checked) : value
    }));
    
    // Limpiar errores cuando el usuario empiece a escribir/cambiar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Función para autocompletar con el nombre del usuario
  const handleUseName = () => {
    if (user?.displayName) {
      setFormData(prev => ({
        ...prev,
        businessName: user.displayName
      }));
      if (errors.businessName) {
        setErrors(prev => ({ ...prev, businessName: '' }));
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">¡Bienvenido a La Feria!</h1>
            <p className="text-gray-600 dark:text-gray-400">Necesitamos algunos datos adicionales para completar tu perfil</p>
          </div>

          {/* Error general */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Datos ya obtenidos de Google */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">Datos de Google:</h3>
              <div className="text-sm text-green-700 dark:text-green-300">
                <p><strong>Nombre:</strong> {user?.displayName}</p>
                <p><strong>Email:</strong> {user?.email}</p>
              </div>
            </div>

            {/* Nombre de la Familia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre de la Familia del Hogar *
              </label>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  name="familyName"
                  value={formData.familyName}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-800 ${
                    errors.familyName ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Ej: Familia Gómez"
                  autoFocus
                />
              </div>
              {errors.familyName && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.familyName}</p>}
            </div>

            {/* Nombre del Negocio (Ahora Obligatorio) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre de tu Tienda/Negocio *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-800 ${
                    errors.businessName ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Ej: Panadería San José"
                />
              </div>
              
              {/* Botón para usar el nombre del usuario */}
              {user?.displayName && !formData.businessName && (
                <button
                  type="button"
                  onClick={handleUseName}
                  className="mt-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Usar mi nombre: "{user.displayName}"
                </button>
              )}
              
              {errors.businessName && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.businessName}</p>}
              
              {/* Preview de la URL */}
              {formData.businessName && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Tu tienda será: laferia.com/tienda/{generateStoreSlug(formData.businessName, user?.displayName)}
                </p>
              )}
              
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Si no tienes negocio, puedes usar tu nombre completo
              </p>
            </div>

            {/* Checkboxes */}
            <div className="space-y-4">
              {/* Checkbox notificaciones */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="acceptNotifications"
                  checked={Boolean(formData.acceptNotifications)}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-primary-600 dark:text-primary-500 focus:ring-primary-500 dark:focus:ring-primary-400 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                />
                <label className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Acepto recibir notificaciones</span>
                  <br />
                  <span className="text-gray-500 dark:text-gray-400">Ofertas exclusivas, nuevos productos y promociones especiales</span>
                </label>
              </div>

              {/* Checkbox términos y condiciones */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={Boolean(formData.acceptTerms)}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-primary-600 dark:text-primary-500 focus:ring-primary-500 dark:focus:ring-primary-400 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                />
                <label className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  Acepto los{' '}
                  <a 
                    href="/terms" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    términos y condiciones
                  </a>{' '}
                  de La Feria *
                </label>
              </div>
              {errors.acceptTerms && <p className="text-sm text-red-600 dark:text-red-400">{errors.acceptTerms}</p>}
            </div>

            {/* Botón de completar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-4 rounded-xl font-medium hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Completando perfil...' : 'Completar perfil y continuar'}
            </button>

            {/* Nota sobre validación */}
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tu cuenta será validada por un administrador una vez completado el registro
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}