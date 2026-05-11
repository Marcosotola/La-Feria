// src/components/testimonials/TestimonialModal.js
'use client'
import { useState, useEffect } from 'react';
import { X, Star, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { addTestimonial, updateTestimonial } from '@/lib/services/testimonialsService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// Función simple de notificación como fallback
const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div');
  notification.className = `fixed bottom-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white animate-pulse ${
    type === 'success' ? 'bg-green-500' : 
    type === 'error' ? 'bg-red-500' : 
    type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
  }`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
};

export default function TestimonialModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  editingTestimonial = null 
}) {
  const { user } = useAuth();
  
  // Usar showNotification como fallback
  const showToast = showNotification;
  
  const [formData, setFormData] = useState({
    rating: 5,
    testimonial: '',
    role: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  // Cargar datos si estamos editando
  useEffect(() => {
    if (editingTestimonial) {
      setFormData({
        rating: editingTestimonial.rating || 5,
        testimonial: editingTestimonial.testimonial || '',
        role: editingTestimonial.role || ''
      });
    } else {
      // Reset form cuando se abre para crear nuevo
      setFormData({
        rating: 5,
        testimonial: '',
        role: ''
      });
    }
  }, [editingTestimonial, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.testimonial || formData.testimonial.trim().length < 10) {
      newErrors.testimonial = 'El testimonio debe tener al menos 10 caracteres';
    }
    
    if (formData.testimonial.length > 500) {
      newErrors.testimonial = 'El testimonio no puede exceder 500 caracteres';
    }
    
    if (!formData.role || formData.role.trim().length < 2) {
      newErrors.role = 'Por favor ingresa tu rol o profesión';
    }
    
    if (formData.role.length > 50) {
      newErrors.role = 'El rol no puede exceder 50 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para obtener el storeLogo del usuario desde Firestore
  const getUserStoreLogo = async () => {
    try {
      if (user && user.uid) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Usar storeLogo como imagen principal
          if (userData.storeLogo) {
            return userData.storeLogo;
          }
        }
      }
      // Si no hay storeLogo, retornar null
      return null;
    } catch (error) {
      console.error('Error obteniendo storeLogo:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Obtener el storeLogo del usuario
      const userStoreLogo = await getUserStoreLogo();
      
      const testimonialData = {
        ...formData,
        userName: user.displayName || 'Usuario Anónimo',
        userId: user.uid,
        userEmail: user.email,
        // Usar storeLogo, y si no existe usar avatar genérico
        avatar: userStoreLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'Usuario')}&background=6366f1&color=ffffff`
      };
      
      let result;
      if (editingTestimonial) {
        result = await updateTestimonial(editingTestimonial.id, {
          rating: formData.rating,
          testimonial: formData.testimonial,
          role: formData.role,
          // También actualizar el avatar en caso de que el usuario haya cambiado su storeLogo
          avatar: userStoreLogo || editingTestimonial.avatar
        });
      } else {
        result = await addTestimonial(testimonialData);
      }
      
      if (result.success) {
        showToast(
          editingTestimonial ? 'Testimonio actualizado exitosamente' : 'Testimonio agregado exitosamente',
          'success'
        );
        onSuccess && onSuccess();
        onClose();
      } else {
        showToast(
          result.error || 'Error al guardar el testimonio',
          'error'
        );
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al procesar la solicitud', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {editingTestimonial ? 'Editar Testimonio' : 'Compartir tu Testimonio'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          
          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Calificación
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoveredRating || formData.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {formData.rating === 5 && 'Excelente'}
                {formData.rating === 4 && 'Muy bueno'}
                {formData.rating === 3 && 'Bueno'}
                {formData.rating === 2 && 'Regular'}
                {formData.rating === 1 && 'Necesita mejorar'}
              </p>
            </div>
            
            {/* Rol/Profesión */}
            <div>
              <label 
                htmlFor="role" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Tu rol o profesión
              </label>
              <input
                id="role"
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Ej: Compradora frecuente, Emprendedor, etc."
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                  ${errors.role 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                  }`}
                maxLength={50}
              />
              {errors.role && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.role}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                {formData.role.length}/50
              </p>
            </div>
            
            {/* Testimonio */}
            <div>
              <label 
                htmlFor="testimonial" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Tu testimonio
              </label>
              <textarea
                id="testimonial"
                rows={4}
                value={formData.testimonial}
                onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
                placeholder="Comparte tu experiencia con La Feria..."
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                  ${errors.testimonial 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                  }`}
                maxLength={500}
              />
              {errors.testimonial && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.testimonial}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                {formData.testimonial.length}/500 caracteres
              </p>
            </div>
            
            {/* Info adicional */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Tu testimonio será visible públicamente con tu nombre y el logo de tu tienda.
                Ayudará a otros miembros de la comunidad a conocer La Feria.
              </p>
            </div>
            
            {/* Botones */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 
                  rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 
                  transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading 
                  ? 'Guardando...' 
                  : editingTestimonial ? 'Actualizar' : 'Compartir Testimonio'
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}