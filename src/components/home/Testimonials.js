// src/components/home/Testimonials.js
'use client'
import { useState, useEffect } from 'react';
import { Star, Quote, Plus, Trash2, Edit2, Shield, Loader2, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  subscribeToTestimonials, 
  deleteTestimonial,
  toggleFeaturedTestimonial,
  hasUserTestimonial,
  getTestimonialStats
} from '@/lib/services/testimonialsService';
import TestimonialModal from '@/components/testimonials/TestimonialModal';

// Función simple de notificación si no existe useToast
const showNotification = (message, type = 'info') => {
  // Crear elemento de notificación
  const notification = document.createElement('div');
  notification.className = `fixed bottom-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white animate-pulse ${
    type === 'success' ? 'bg-green-500' : 
    type === 'error' ? 'bg-red-500' : 
    type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
  }`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Remover después de 3 segundos
  setTimeout(() => {
    notification.remove();
  }, 3000);
};

export default function Testimonials({ 
  title = "Lo que dice nuestra comunidad",
  subtitle = "Historias reales de hermanos que han encontrado bendición a través de La Feria",
  showAddButton = true,
  limit = 6,
  featuredOnly = false
}) {
  const { user } = useAuth();
  
  // Usar showNotification como fallback
  const showToast = showNotification;
  
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [userHasTestimonial, setUserHasTestimonial] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0
  });
  
  // Verificar si el usuario es admin
  const isAdmin = user?.role === 'admin';

  // Cargar testimonios en tiempo real
  useEffect(() => {
    setLoading(true);
    
    const filters = {
      approved: true,
      limit: limit
    };
    
    if (featuredOnly) {
      filters.featured = true;
    }
    
    const unsubscribe = subscribeToTestimonials((data) => {
      setTestimonials(data);
      setLoading(false);
    }, filters);
    
    // Cargar estadísticas
    getTestimonialStats().then(setStats);
    
    return () => unsubscribe();
  }, [limit, featuredOnly]);

  // Verificar si el usuario ya tiene un testimonio
  useEffect(() => {
    const checkUserTestimonial = async () => {
      if (user) {
        const hasTestimonial = await hasUserTestimonial(user.uid);
        setUserHasTestimonial(hasTestimonial);
      }
    };
    checkUserTestimonial();
  }, [user, testimonials]);

  const handleDelete = async (testimonialId, testimonialUserId) => {
    // Verificar permisos
    if (!user) {
      showToast('Debes iniciar sesión para eliminar testimonios', 'error');
      return;
    }
    
    if (!isAdmin && user.uid !== testimonialUserId) {
      showToast('No tienes permisos para eliminar este testimonio', 'error');
      return;
    }
    
    if (!window.confirm('¿Estás seguro de eliminar este testimonio?')) {
      return;
    }
    
    setDeletingId(testimonialId);
    
    try {
      const result = await deleteTestimonial(testimonialId);
      
      if (result.success) {
        showToast('Testimonio eliminado exitosamente', 'success');
        // Actualizar estadísticas
        const newStats = await getTestimonialStats();
        setStats(newStats);
      } else {
        showToast(result.error || 'Error al eliminar el testimonio', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al eliminar el testimonio', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (testimonial) => {
    if (!user) {
      showToast('Debes iniciar sesión para editar testimonios', 'error');
      return;
    }
    
    if (!isAdmin && user.uid !== testimonial.userId) {
      showToast('No tienes permisos para editar este testimonio', 'error');
      return;
    }
    
    setEditingTestimonial(testimonial);
    setModalOpen(true);
  };

  const handleToggleFeatured = async (testimonialId, currentFeatured) => {
    if (!isAdmin) {
      showToast('Solo los administradores pueden destacar testimonios', 'error');
      return;
    }
    
    try {
      const result = await toggleFeaturedTestimonial(testimonialId, !currentFeatured);
      
      if (result.success) {
        showToast(
          !currentFeatured ? 'Testimonio destacado' : 'Testimonio ya no está destacado',
          'success'
        );
      } else {
        showToast(result.error || 'Error al cambiar el estado', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al cambiar el estado', 'error');
    }
  };

  const handleAddNew = () => {
    if (!user) {
      showToast('Debes iniciar sesión para dejar un testimonio', 'error');
      return;
    }
    
    if (userHasTestimonial && !isAdmin) {
      const userTestimonial = testimonials.find(t => t.userId === user.uid);
      if (userTestimonial) {
        handleEdit(userTestimonial);
      }
    } else {
      setEditingTestimonial(null);
      setModalOpen(true);
    }
  };

  const handleModalSuccess = async () => {
    // Actualizar estadísticas después de agregar/editar
    const newStats = await getTestimonialStats();
    setStats(newStats);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <section className="pb-2 lg:pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" />
            <p className="mt-2 text-gray-600 dark:text-gray-400">Cargando testimonios...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pb-2 lg:pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header con estadísticas */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-2xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100 tracking-tight">
            {title}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
          
          {/* Estadísticas */}
          {stats.totalReviews > 0 && (
            <div className="mt-6 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {renderStars(Math.round(parseFloat(stats.averageRating)))}
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {stats.averageRating}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <MessageCircle className="w-4 h-4 inline mr-1" />
                {stats.totalReviews} {stats.totalReviews === 1 ? 'testimonio' : 'testimonios'}
              </div>
            </div>
          )}
        </div>

        {/* Grid de testimonios o mensaje vacío */}
        {testimonials.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial) => (
              <div 
                key={testimonial.id} 
                className={`bg-white dark:bg-gray-800 p-6 lg:p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden group ${
                  testimonial.featured ? 'ring-2 ring-primary-200 dark:ring-primary-800' : ''
                }`}
              >
                {/* Icono de comillas decorativo */}
                <div className="absolute -top-2 -right-2 w-16 h-16 text-primary-100 dark:text-primary-900/30">
                  <Quote className="w-full h-full" />
                </div>

                {/* Badge de destacado */}
                {testimonial.featured && (
                  <div className="absolute top-4 right-4 bg-primary-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Destacado
                  </div>
                )}
                
                {/* Botones de acción */}
                {user && (user.uid === testimonial.userId || isAdmin) && (
                  <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {isAdmin && (
                      <button
                        onClick={() => handleToggleFeatured(testimonial.id, testimonial.featured)}
                        className="p-1.5 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        title={testimonial.featured ? 'Quitar destacado' : 'Destacar'}
                      >
                        <Star className={`w-4 h-4 ${testimonial.featured ? 'text-yellow-500 fill-current' : 'text-gray-500'}`} />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(testimonial)}
                      className="p-1.5 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(testimonial.id, testimonial.userId)}
                      disabled={deletingId === testimonial.id}
                      className="p-1.5 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                      title="Eliminar"
                    >
                      {deletingId === testimonial.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      )}
                    </button>
                  </div>
                )}
                
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4 relative z-10">
                  {renderStars(testimonial.rating)}
                </div>
                
                {/* Testimonial */}
                <blockquote className="text-gray-700 dark:text-gray-300 mb-6 italic leading-relaxed relative z-10">
                  "{testimonial.testimonial}"
                </blockquote>
                
                {/* Autor */}
                <div className="flex items-center gap-4 relative z-10">
                  <div className="relative">
                    {/* CAMBIO AQUÍ: Contenedor con fondo y padding para el logo */}
                    <div className="w-14 h-14 rounded-full bg-gray-50 dark:bg-gray-900 ring-2 ring-gray-200 dark:ring-gray-700 p-2 flex items-center justify-center">
                      <img
                        src={testimonial.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.userName || 'Usuario')}&background=6366f1&color=ffffff`}
                        alt={testimonial.userName}
                        className="w-full h-full object-contain"
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                      />
                    </div>
                    {testimonial.featured && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                        <Star className="w-3 h-3 text-white fill-current" />
                      </div>
                    )}
                    {isAdmin && (
                      <div className="absolute -top-1 -left-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center" title="Admin">
                        <Shield className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 dark:text-gray-200 text-base">
                      {testimonial.userName || 'Usuario Anónimo'}
                    </div>
                    <div className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-2xl">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Aún no hay testimonios
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Sé el primero en compartir tu experiencia con la comunidad
            </p>
            {showAddButton && user && (
              <button
                onClick={handleAddNew}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Compartir mi testimonio
              </button>
            )}
          </div>
        )}

        {/* Llamada a la acción */}
        <div className="text-center mt-12 lg:mt-16">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-8 lg:p-12">
            {showAddButton && user && testimonials.length > 0 && (
              <button
                onClick={handleAddNew}
                className="mb-6 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-primary-600 dark:text-primary-400 font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl inline-flex items-center gap-2 border border-primary-200 dark:border-primary-800"
              >
                <Plus className="w-5 h-5" />
                {userHasTestimonial ? 'Editar mi testimonio' : 'Compartir mi testimonio'}
              </button>
            )}
            
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              ¿Quieres formar parte de estas historias?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-lg mx-auto">
              Únete a nuestra comunidad y comparte tus talentos con la familia de la fe
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl">
                Crear mi tienda
              </button>
              <button className="px-6 py-3 border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-medium rounded-lg transition-all duration-200">
                Explorar servicios
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para agregar/editar testimonio */}
      <TestimonialModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTestimonial(null);
        }}
        onSuccess={handleModalSuccess}
        editingTestimonial={editingTestimonial}
      />
    </section>
  );
}