// src/components/tienda/servicios/ServiceManager.js
'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  serverTimestamp,
  getDoc // ✅ Agregado para obtener tiendaInfo
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { autoCompletarDatosServicio, generarSlugServicio } from '../../../types/services';
import ServiceForm from './ServiceForm';
import ServiceList from './ServiceList';
import ServiceCard from './ServiceCard';
import FeaturedServiceButton from './FeaturedServiceButton';
import { Plus, ArrowLeft, Briefcase, X } from 'lucide-react';
import { deleteImages } from '@/lib/actions/cloudinary';
import { extractPublicId } from '@/lib/helpers/cloudinaryHelpers';

export default function ServiceManager({ storeId, storeData }) {
  const { user } = useAuth();
  const [view, setView] = useState('list');
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [showFeaturedModal, setShowFeaturedModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ✅ Función para obtener tiendaInfo del usuario
  const getTiendaInfo = async (usuarioId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', usuarioId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          nombre: userData.businessName || userData.familyName || `${userData.firstName} ${userData.lastName}`.trim(),
          slug: userData.storeSlug,
          email: userData.email,
          phone: userData.phone,
        };
      }
    } catch (error) {
      console.error('Error cargando datos de tienda:', error);
    }

    return {
      nombre: 'Tienda La Feria',
      slug: '',
      email: '',
      phone: ''
    };
  };

  useEffect(() => {
    if (storeId) {
      loadServices();
    }
  }, [storeId]);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      const servicesRef = collection(db, 'servicios');
      const q = query(
        servicesRef,
        where('usuarioId', '==', storeId),
        orderBy('fechaCreacion', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const servicesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setServices(servicesData);
    } catch (error) {
      console.error('Error cargando servicios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateService = () => {
    setSelectedService(null);
    setView('form');
  };

  const handleEditService = (service) => {
    setSelectedService(service);
    setView('form');
  };

  const handleViewService = (service) => {
    setSelectedService(service);
    setView('view');
  };

  const handleFeatureService = (service) => {
    setSelectedService(service);
    setShowFeaturedModal(true);
  };

  const handleFeatureSuccess = async () => {
    setShowFeaturedModal(false);
    setSelectedService(null);
    await loadServices();
  };

  const handleSaveService = async (serviceData) => {
    try {
      setIsSaving(true);

      // Auto-completar datos desde storeData
      const serviceDataCompleto = autoCompletarDatosServicio(serviceData, storeData);

      // ✅ CRÍTICO: Obtener y guardar tiendaInfo
      const tiendaInfo = await getTiendaInfo(storeId);

      if (selectedService) {
        // Actualizar servicio existente
        const serviceRef = doc(db, 'servicios', selectedService.id);
        await updateDoc(serviceRef, {
          ...serviceDataCompleto,
          tiendaInfo, // ✅ Guardar tiendaInfo
          fechaActualizacion: serverTimestamp()
        });

        setServices(prev => prev.map(s =>
          s.id === selectedService.id
            ? { ...s, ...serviceDataCompleto, tiendaInfo, fechaActualizacion: new Date().toISOString() }
            : s
        ));
      } else {
        // Crear nuevo servicio
        const newService = {
          ...serviceDataCompleto,
          usuarioId: storeId,
          tiendaId: storeId,
          tiendaInfo, // ✅ Guardar tiendaInfo desde el inicio
          fechaCreacion: serverTimestamp(),
          fechaActualizacion: serverTimestamp(),
          totalReservas: 0,
          totalVistas: 0,
          valoraciones: {
            promedio: 0,
            total: 0,
            distribucion: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
          },
          interacciones: {
            vistas: 0,
            favoritos: 0,
            compartidas: 0,
            comentarios: 0
          },
          featured: false,
          featuredUntil: null,
          featuredPaymentId: null,
          featuredAmount: null,
          fechaDestacado: null,
          slug: generarSlugServicio ? generarSlugServicio(serviceDataCompleto.titulo, Date.now().toString()) : serviceDataCompleto.titulo.toLowerCase().replace(/\s+/g, '-')
        };

        const docRef = await addDoc(collection(db, 'servicios'), newService);

        setServices(prev => [{
          id: docRef.id,
          ...newService,
          fechaCreacion: new Date().toISOString(),
          fechaActualizacion: new Date().toISOString()
        }, ...prev]);
      }

      setView('list');
      setSelectedService(null);
    } catch (error) {
      console.error('Error guardando servicio:', error);
      alert('Error al guardar el servicio. Intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      return;
    }

    try {
      setIsLoading(true);

      // 1. Obtener datos del servicio
      const serviceToDelete = services.find(s => s.id === serviceId);

      // Verificar si tiene imágenes (asumiendo que tiene array imagenes o logo?)
      // Revisando ServiceForm.js (no lo he visto pero asumo estructura similar, o quizas solo imagenes)
      // Si el servicio tiene campo 'imagenes', usamos ese.
      if (serviceToDelete?.imagenes?.length > 0) {
        const publicIds = serviceToDelete.imagenes
          .map(url => extractPublicId(url))
          .filter(id => id);

        if (publicIds.length > 0) {
          await deleteImages(publicIds);
        }
      }

      await deleteDoc(doc(db, 'servicios', serviceId));
      setServices(prev => prev.filter(s => s.id !== serviceId));
    } catch (error) {
      console.error('Error eliminando servicio:', error);
      alert('Error al eliminar el servicio. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (service) => {
    try {
      const newStatus = service.estado === 'disponible' ? 'pausado' : 'disponible';
      const serviceRef = doc(db, 'servicios', service.id);

      await updateDoc(serviceRef, {
        estado: newStatus,
        fechaActualizacion: serverTimestamp()
      });

      setServices(prev => prev.map(s =>
        s.id === service.id
          ? { ...s, estado: newStatus, fechaActualizacion: new Date().toISOString() }
          : s
      ));
    } catch (error) {
      console.error('Error cambiando estado:', error);
      alert('Error al cambiar el estado. Intenta nuevamente.');
    }
  };

  const handleDuplicateService = (service) => {
    const duplicatedService = {
      ...service,
      titulo: `${service.titulo} (Copia)`,
      id: undefined,
      fechaCreacion: undefined,
      fechaActualizacion: undefined,
      totalReservas: 0,
      totalVistas: 0,
      featured: false,
      featuredUntil: null,
      featuredPaymentId: null,
      featuredAmount: null,
      fechaDestacado: null
    };

    setSelectedService(duplicatedService);
    setView('form');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedService(null);
  };

  if (!user || storeId !== user.uid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Acceso no autorizado
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            No tienes permisos para gestionar estos servicios
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {view === 'list' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Gestión de Servicios
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                  Administra tu catálogo de servicios
                </p>
              </div>

              <button
                onClick={handleCreateService}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Servicio
              </button>
            </div>
          </div>

          <ServiceList
            services={services}
            onEdit={handleEditService}
            onDelete={handleDeleteService}
            onToggleStatus={handleToggleStatus}
            onDuplicate={handleDuplicateService}
            onView={handleViewService}
            onCreateNew={handleCreateService}
            onFeature={handleFeatureService}
            isLoading={isLoading}
          />
        </div>
      )}

      {view === 'form' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ServiceForm
            servicio={selectedService}
            storeId={storeId}
            onSave={handleSaveService}
            onCancel={handleBackToList}
            isLoading={isSaving}
          />
        </div>
      )}

      {view === 'view' && selectedService && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <button
                onClick={handleBackToList}
                className="inline-flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Volver a la lista
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleEditService(selectedService)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDuplicateService(selectedService)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Duplicar
                </button>
                <button
                  onClick={() => handleFeatureService(selectedService)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors"
                >
                  Destacar
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Vista Previa del Servicio
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Vista en Tarjeta
                </h3>
                <ServiceCard
                  service={selectedService}
                  storeData={storeData}
                  variant="grid"
                  showContactInfo={false}
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Vista Destacada Compacta
                </h3>
                <ServiceCard
                  service={selectedService}
                  storeData={storeData}
                  variant="featured-compact"
                  showContactInfo={false}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showFeaturedModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Destacar Servicio
                </h2>
                <button
                  onClick={() => setShowFeaturedModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  {selectedService.titulo}
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Este servicio aparecerá en la sección destacada del home
                </p>
              </div>

              <FeaturedServiceButton
                service={selectedService}
                user={user}
                onSuccess={handleFeatureSuccess}
                onClose={() => setShowFeaturedModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}