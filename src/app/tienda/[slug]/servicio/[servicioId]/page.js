// src/app/tienda/[slug]/servicios/[servicioId]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { canViewStore } from '@/lib/storeVisibility';
import { getPublicStoreConfig } from '@/lib/storeConfigUtils';
import StoreLayout from '@/components/tienda/StoreLayout';
import ServiceCard from '@/components/tienda/servicios/ServiceCard';
import ServiceRatingsAndComments from '@/components/tienda/servicios/ServiceRatingsAndComments';
import { Loader2, AlertCircle, ArrowLeft, Share2, Eye } from 'lucide-react';
import Link from 'next/link';

export default function ServicioDetailPage() {
  const params = useParams();
  const { slug, servicioId } = params;
  const { user, loading: authLoading } = useAuth();

  const [storeData, setStoreData] = useState(null);
  const [storeConfig, setStoreConfig] = useState(null);
  const [servicioData, setServicioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (slug && servicioId) {
      loadData();
    }
  }, [slug, servicioId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar tienda por slug
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('storeSlug', '==', slug));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Tienda no encontrada');
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = {
        id: userDoc.id,
        ...userDoc.data()
      };

      // Cargar configuración de la tienda
      const config = await getPublicStoreConfig(userData.id);

      // Cargar datos del servicio
      const servicioDoc = await getDoc(doc(db, 'servicios', servicioId));
      
      if (!servicioDoc.exists()) {
        setError('Servicio no encontrado');
        return;
      }

      const servicio = {
        id: servicioDoc.id,
        ...servicioDoc.data()
      };

      // Verificar que el servicio pertenece a esta tienda
      if (servicio.usuarioId !== userData.id) {
        setError('Este servicio no pertenece a esta tienda');
        return;
      }

      // Incrementar contador de vistas
      await updateDoc(doc(db, 'servicios', servicioId), {
        totalVistas: increment(1)
      });

      setStoreData(userData);
      setStoreConfig(config);
      setServicioData(servicio);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar el servicio');
    } finally {
      setLoading(false);
    }
  };

  // Aplicar colores personalizados
  useEffect(() => {
    if (storeConfig) {
      const root = document.documentElement;
      
      if (storeConfig.primaryColor) {
        root.style.setProperty('--store-primary-color', storeConfig.primaryColor);
      }
      if (storeConfig.secondaryColor) {
        root.style.setProperty('--store-secondary-color', storeConfig.secondaryColor);
      }
    }
    
    return () => {
      const root = document.documentElement;
      root.style.removeProperty('--store-primary-color');
      root.style.removeProperty('--store-secondary-color');
    };
  }, [storeConfig]);

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: servicioData.titulo,
          text: servicioData.descripcion,
          url: url,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Enlace copiado al portapapeles');
    }
  };

  const handleRatingUpdate = () => {
    // Recargar el servicio para obtener las valoraciones actualizadas
    loadData();
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Cargando servicio...</p>
        </div>
      </div>
    );
  }

  if (error || !storeData || !servicioData || !canViewStore(storeData, user?.uid)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {error || 'No se pudo cargar el servicio'}
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/tienda/${slug}/servicios`}
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Ver todos los servicios
            </Link>
            <Link
              href={`/tienda/${slug}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <StoreLayout
      storeData={storeData}
      storeConfig={storeConfig}
    >
      {/* Breadcrumbs */}
      <div className="bg-gray-50 dark:bg-gray-900 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 text-sm">
            <Link 
              href={`/tienda/${slug}`}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              {storeData.businessName || storeData.familyName}
            </Link>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <Link 
              href={`/tienda/${slug}/servicios`}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Servicios
            </Link>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <span className="text-gray-900 dark:text-white font-medium line-clamp-1">
              {servicioData.titulo}
            </span>
          </nav>
        </div>
      </div>

      {/* Header de página */}
      <div className="bg-white dark:bg-gray-800 py-6 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href={`/tienda/${slug}/servicios`}
                className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {servicioData.titulo}
                </h1>
                {servicioData.totalVistas > 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                    <Eye className="w-4 h-4" />
                    {servicioData.totalVistas} {servicioData.totalVistas === 1 ? 'vista' : 'vistas'}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleShare}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartir
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Columna izquierda - Detalles del servicio */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Card del servicio */}
              <div className="max-w-md">
                <ServiceCard
                  service={servicioData}
                  storeData={storeData}
                  variant="featured-compact"
                  showContactInfo={true}
                />
              </div>

              {/* Descripción completa */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Descripción del Servicio
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {servicioData.descripcion}
                  </p>
                </div>

                {/* Información adicional */}
                {(servicioData.categoria || servicioData.etiquetas?.length > 0) && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {servicioData.categoria && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Categoría</h4>
                          <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm">
                            {servicioData.categoria}
                          </span>
                        </div>
                      )}
                      
                      {servicioData.etiquetas?.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Etiquetas</h4>
                          <div className="flex flex-wrap gap-2">
                            {servicioData.etiquetas.map((etiqueta, index) => (
                              <span 
                                key={index}
                                className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                              >
                                {etiqueta.replace(/_/g, ' ').toUpperCase()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Información adicional de la tienda */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Acerca de la tienda
                </h3>
                <div className="flex items-center gap-4">
                  {storeData.logoUrl && (
                    <img
                      src={storeData.logoUrl}
                      alt={storeData.businessName || storeData.familyName}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                      {storeData.businessName || storeData.familyName}
                    </h4>
                    {storeData.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {storeData.description}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/tienda/${slug}`}
                    className="flex-shrink-0 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                  >
                    Ver tienda
                  </Link>
                </div>
              </div>
            </div>

            {/* Columna derecha - Valoraciones y comentarios */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <ServiceRatingsAndComments 
                  service={servicioData}
                  onRatingUpdate={handleRatingUpdate}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}