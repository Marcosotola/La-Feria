// src/components/tienda/empleos/EmploymentManager.js
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
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { TIPOS_PUBLICACION } from '@/types/employment';
import OfertaEmpleoForm from './OfertaEmpleoForm';
import BusquedaEmpleoForm from './BusquedaEmpleoForm';
import EmploymentList from './EmploymentList';
import OfertaEmpleoCard from './OfertaEmpleoCard';
import BusquedaEmpleoCard from './BusquedaEmpleoCard';
import FeaturedEmploymentButton from './FeaturedEmploymentButton';
import { ArrowLeft, Briefcase, X } from 'lucide-react';
import { deleteImage } from '@/lib/actions/cloudinary';
import { extractPublicId } from '@/lib/helpers/cloudinaryHelpers';

export default function EmploymentManager({ storeId, storeData }) {
  const { user } = useAuth();
  const [view, setView] = useState('list');
  const [tipoPublicacion, setTipoPublicacion] = useState(null);
  const [publicaciones, setPublicaciones] = useState([]);
  const [selectedPublicacion, setSelectedPublicacion] = useState(null);
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
      loadPublicaciones();
    }
  }, [storeId]);

  const loadPublicaciones = async () => {
    try {
      setIsLoading(true);
      const empleosRef = collection(db, 'empleos');
      const q = query(
        empleosRef,
        where('usuarioId', '==', storeId),
        orderBy('fechaCreacion', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const publicacionesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setPublicaciones(publicacionesData);
    } catch (error) {
      console.error('Error cargando publicaciones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = (tipo) => {
    setTipoPublicacion(tipo);
    setSelectedPublicacion(null);
    setView('form');
  };

  const handleEditPublicacion = (publicacion) => {
    setTipoPublicacion(publicacion.tipoPublicacion);
    setSelectedPublicacion(publicacion);
    setView('form');
  };

  const handleViewPublicacion = (publicacion) => {
    setSelectedPublicacion(publicacion);
    setView('view');
  };

  const handleFeaturePublicacion = (publicacion) => {
    setSelectedPublicacion(publicacion);
    setShowFeaturedModal(true);
  };

  const handleFeatureSuccess = async () => {
    setShowFeaturedModal(false);
    setSelectedPublicacion(null);
    await loadPublicaciones();
  };

  const handleSavePublicacion = async (publicacionData) => {
    try {
      setIsSaving(true);

      // ✅ CRÍTICO: Obtener y guardar tiendaInfo
      const tiendaInfo = await getTiendaInfo(storeId);

      if (selectedPublicacion) {
        // Actualizar publicación existente
        const publicacionRef = doc(db, 'empleos', selectedPublicacion.id);
        await updateDoc(publicacionRef, {
          ...publicacionData,
          tiendaInfo,
          fechaActualizacion: serverTimestamp()
        });

        setPublicaciones(prev => prev.map(p =>
          p.id === selectedPublicacion.id
            ? { ...p, ...publicacionData, tiendaInfo, fechaActualizacion: new Date().toISOString() }
            : p
        ));
      } else {
        // Crear nueva publicación
        const newPublicacion = {
          ...publicacionData,
          usuarioId: storeId,
          tiendaId: storeId,
          tipoPublicacion: tipoPublicacion,
          tiendaInfo,
          fechaCreacion: serverTimestamp(),
          fechaActualizacion: serverTimestamp(),
          estado: 'activo',
          vistas: 0,
          interacciones: {
            vistas: 0,
            favoritos: 0,
            compartidas: 0,
            consultas: 0
          },
          featured: false,
          featuredUntil: null,
          featuredPaymentId: null,
          featuredAmount: null,
          fechaDestacado: null
        };

        const docRef = await addDoc(collection(db, 'empleos'), newPublicacion);

        setPublicaciones(prev => [{
          id: docRef.id,
          ...newPublicacion,
          fechaCreacion: new Date().toISOString(),
          fechaActualizacion: new Date().toISOString()
        }, ...prev]);
      }

      setView('list');
      setSelectedPublicacion(null);
      setTipoPublicacion(null);
    } catch (error) {
      console.error('Error guardando publicación:', error);
      alert('Error al guardar la publicación. Intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePublicacion = async (publicacionId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      return;
    }

    try {
      setIsLoading(true);

      // 1. Obtener datos
      const itemToDelete = publicaciones.find(p => p.id === publicacionId);

      // 2. Verificar campo 'logo' (común en ofertas de empleo)
      if (itemToDelete?.logo) {
        const publicId = extractPublicId(itemToDelete.logo);
        if (publicId) {
          await deleteImage(publicId);
        }
      }

      await deleteDoc(doc(db, 'empleos', publicacionId));
      setPublicaciones(prev => prev.filter(p => p.id !== publicacionId));
    } catch (error) {
      console.error('Error eliminando publicación:', error);
      alert('Error al eliminar la publicación. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (publicacion) => {
    try {
      const newStatus = publicacion.estado === 'activo' ? 'pausado' : 'activo';
      const publicacionRef = doc(db, 'empleos', publicacion.id);

      await updateDoc(publicacionRef, {
        estado: newStatus,
        fechaActualizacion: serverTimestamp()
      });

      setPublicaciones(prev => prev.map(p =>
        p.id === publicacion.id
          ? { ...p, estado: newStatus, fechaActualizacion: new Date().toISOString() }
          : p
      ));
    } catch (error) {
      console.error('Error cambiando estado:', error);
      alert('Error al cambiar el estado. Intenta nuevamente.');
    }
  };

  const handleDuplicatePublicacion = (publicacion) => {
    const duplicatedPublicacion = {
      ...publicacion,
      titulo: `${publicacion.titulo} (Copia)`,
      id: undefined,
      fechaCreacion: undefined,
      fechaActualizacion: undefined,
      vistas: 0,
      featured: false,
      featuredUntil: null,
      featuredPaymentId: null,
      featuredAmount: null,
      fechaDestacado: null
    };

    setTipoPublicacion(publicacion.tipoPublicacion);
    setSelectedPublicacion(duplicatedPublicacion);
    setView('form');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedPublicacion(null);
    setTipoPublicacion(null);
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
            No tienes permisos para gestionar estas publicaciones
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {view === 'list' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Mis Publicaciones de Empleo
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Gestioná tus ofertas, búsquedas y servicios profesionales
            </p>
          </div>

          <EmploymentList
            publicaciones={publicaciones}
            onEdit={handleEditPublicacion}
            onDelete={handleDeletePublicacion}
            onToggleStatus={handleToggleStatus}
            onDuplicate={handleDuplicatePublicacion}
            onView={handleViewPublicacion}
            onCreateNew={handleCreateNew}
            onFeature={handleFeaturePublicacion}
            isLoading={isLoading}
          />
        </div>
      )}

      {view === 'form' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {tipoPublicacion === TIPOS_PUBLICACION.OFERTA_EMPLEO && (
            <OfertaEmpleoForm
              oferta={selectedPublicacion}
              storeId={storeId}
              onSave={handleSavePublicacion}
              onCancel={handleBackToList}
              isLoading={isSaving}
            />
          )}

          {tipoPublicacion === TIPOS_PUBLICACION.BUSQUEDA_EMPLEO && (
            <BusquedaEmpleoForm
              busqueda={selectedPublicacion}
              userId={storeId}
              onSave={handleSavePublicacion}
              onCancel={handleBackToList}
              isLoading={isSaving}
            />
          )}
        </div>
      )}

      {view === 'view' && selectedPublicacion && (
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
                  onClick={() => handleEditPublicacion(selectedPublicacion)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDuplicatePublicacion(selectedPublicacion)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Duplicar
                </button>
                <button
                  onClick={() => handleFeaturePublicacion(selectedPublicacion)}
                  className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-colors"
                >
                  Destacar
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Vista Previa de la Publicación
            </h2>

            <div className="grid grid-cols-1 gap-8">
              {selectedPublicacion.tipoPublicacion === TIPOS_PUBLICACION.OFERTA_EMPLEO && (
                <OfertaEmpleoCard
                  oferta={selectedPublicacion}
                  storeData={storeData}
                  variant="grid"
                  showContactInfo={false}
                />
              )}

              {selectedPublicacion.tipoPublicacion === TIPOS_PUBLICACION.BUSQUEDA_EMPLEO && (
                <BusquedaEmpleoCard
                  busqueda={selectedPublicacion}
                  variant="grid"
                  showContactInfo={false}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {showFeaturedModal && selectedPublicacion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Destacar Publicación
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
                  {selectedPublicacion.titulo}
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Esta publicación aparecerá en la sección destacada del home
                </p>
              </div>

              <FeaturedEmploymentButton
                publicacion={selectedPublicacion}
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