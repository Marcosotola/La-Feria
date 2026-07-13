// src/app/tienda/[slug]/galeria/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { canViewStore } from '@/lib/storeVisibility';
import { getPublicStoreConfig } from '@/lib/storeConfigUtils';
import StoreLayout from '@/components/tienda/StoreLayout';
import { ArrowLeft, Loader2, Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function GaleriaPage() {
  const params = useParams();
  const { slug } = params;
  const { user, loading: authLoading } = useAuth();

  const [storeData, setStoreData] = useState(null);
  const [storeConfig, setStoreConfig] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  
  const IMAGES_PER_PAGE = 20;
  
  // Lightbox
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Cargar datos de la tienda
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true);
        
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('storeSlug', '==', slug));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError('Tienda no encontrada');
          return;
        }
        
        const userDoc = querySnapshot.docs[0];
        const userData = { id: userDoc.id, ...userDoc.data() };

        const config = await getPublicStoreConfig(userData.id);
        
        setStoreData(userData);
        setStoreConfig(config);
        
        // Cargar imágenes de la galería
        await loadImages(userData.id);
        
      } catch (error) {
        console.error('Error al cargar la tienda:', error);
        setError('Error al cargar la tienda');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchStoreData();
    }
  }, [slug]);

  const loadImages = async (userId) => {
    try {
      const galeriaRef = collection(db, 'galeria');
      const q = query(
        galeriaRef,
        where('userId', '==', userId),
        orderBy('fechaCreacion', 'desc')
      );
      const querySnapshot = await getDocs(q);

      const imagesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setImages(imagesList);
    } catch (error) {
      console.error('Error cargando galería:', error);
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

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Filtrar imágenes por búsqueda
  const filteredImages = images.filter(image => 
    image.titulo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Lightbox functions
  const openLightbox = (image, index) => {
    setSelectedImage(image);
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    setSelectedIndex(0);
  };

  const goToPrevious = () => {
    const newIndex = selectedIndex > 0 ? selectedIndex - 1 : filteredImages.length - 1;
    setSelectedIndex(newIndex);
    setSelectedImage(filteredImages[newIndex]);
  };

  const goToNext = () => {
    const newIndex = selectedIndex < filteredImages.length - 1 ? selectedIndex + 1 : 0;
    setSelectedIndex(newIndex);
    setSelectedImage(filteredImages[newIndex]);
  };

  const handleKeyDown = (e) => {
    if (!selectedImage) return;
    
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') closeLightbox();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, selectedIndex]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Cargando galería...
          </h2>
        </div>
      </div>
    );
  }

  if (error || !storeData || !storeConfig || !canViewStore(storeData, user?.uid)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {error || 'Página no encontrada'}
          </h2>
          <Link
            href={`/tienda/${slug}`}
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <StoreLayout
      storeData={storeData}
      storeConfig={storeConfig}
      onSearch={handleSearch}
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
            <span className="text-gray-900 dark:text-white font-medium">Galería</span>
          </nav>
        </div>
      </div>

      {/* Header de página */}
      <div className="bg-white dark:bg-gray-800 py-8 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <ImageIcon className="w-8 h-8 text-orange-600" />
                Galería
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                {filteredImages.length} {filteredImages.length === 1 ? 'imagen' : 'imágenes'} en nuestra galería
              </p>
            </div>
            
            <Link
              href={`/tienda/${slug}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Link>
          </div>
        </div>
      </div>

      {/* Galería */}
      <div className="bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredImages.length === 0 ? (
            <div className="text-center py-16">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchQuery ? 'No se encontraron imágenes' : 'No hay imágenes en la galería'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Esta tienda aún no ha agregado imágenes a su galería'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              {filteredImages.map((image, index) => (
                <div
                  key={image.id}
                  className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <img
                    src={image.imageUrl}
                    alt={image.titulo}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onClick={() => openLightbox(image, index)}
                  />
                  
                  {/* Título siempre visible en la parte inferior */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <p className="text-white text-sm font-medium line-clamp-2">
                      {image.titulo}
                    </p>
                  </div>
                  
                  {/* Overlay hover adicional */}
                  <div 
                    className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    onClick={() => openLightbox(image, index)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Botón cerrar */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/50 rounded-full p-2 backdrop-blur-sm transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Botón anterior */}
          {filteredImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 text-white/80 hover:text-white bg-black/50 rounded-full p-3 backdrop-blur-sm transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Botón siguiente */}
          {filteredImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 text-white/80 hover:text-white bg-black/50 rounded-full p-3 backdrop-blur-sm transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Imagen y título */}
          <div
            className="max-w-5xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.imageUrl}
              alt={selectedImage.titulo}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            
            <div className="mt-4 text-center">
              <h3 className="text-xl font-semibold text-white mb-1">
                {selectedImage.titulo}
              </h3>
              <p className="text-white/60 text-sm">
                {selectedIndex + 1} / {filteredImages.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </StoreLayout>
  );
}