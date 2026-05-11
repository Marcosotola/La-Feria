// src/components/home/FeaturedServices.js
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Crown, Star, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import ServiceCard from '../tienda/servicios/ServiceCard';
import SectionEmptyState from './SectionEmptyState';

export default function FeaturedServices() {
  const [windowWidth, setWindowWidth] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollContainerRef = useRef(null);
  const rafRef = useRef();

  useEffect(() => {
    setIsClient(true);
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadFeaturedServices = async () => {
      try {
        setLoading(true);
        setError(null);

        const now = new Date();
        const servicesRef = collection(db, 'servicios');
        const q = query(
          servicesRef,
          where('featured', '==', true),
          where('featuredUntil', '>', now),
          where('estado', '==', 'disponible'),
          orderBy('featuredUntil', 'desc'),
          orderBy('fechaDestacado', 'desc'),
          limit(20)
        );

        const querySnapshot = await getDocs(q);

        // ✅ OPTIMIZADO: tiendaInfo ya viene en cada servicio
        const services = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        console.log(`✅ ${services.length} servicios destacados cargados (sin consultas adicionales)`);
        setFeaturedServices(services);
      } catch (error) {
        console.error('Error cargando servicios destacados:', error);
        setError('Error cargando servicios destacados');
        setFeaturedServices([]);
      } finally {
        setLoading(false);
      }
    };

    if (isClient) {
      loadFeaturedServices();
    }
  }, [isClient]);

  const handleServiceClick = (service) => {
    const storeSlug = service.tiendaInfo?.slug || service.storeData?.storeSlug;
    if (storeSlug && service.id) {
      const url = `https://laferia.vercel.app/tienda/${storeSlug}/servicio/${service.id}`;
      window.open(url, '_blank');
    } else {
      console.error('Faltan datos para la navegación:', { storeSlug, serviceId: service.id });
    }
  };

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  let itemsPerView;
  if (isMobile) {
    itemsPerView = 2;
  } else if (isTablet) {
    itemsPerView = 3;
  } else {
    itemsPerView = 5;
  }

  const maxIndex = Math.max(0, featuredServices.length - itemsPerView);

  const animateToIndex = useCallback((targetIndex) => {
    const clampedIndex = Math.max(0, Math.min(maxIndex, targetIndex));
    setIsTransitioning(true);
    setCurrentIndex(clampedIndex);
    setDragOffset(0);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [maxIndex]);

  const goToPrevious = () => {
    if (currentIndex > 0) {
      animateToIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < maxIndex) {
      animateToIndex(currentIndex + 1);
    }
  };

  const handleDragStart = useCallback((clientX) => {
    if (isTransitioning) return;
    setIsDragging(true);
    setStartX(clientX);
    setScrollLeft(currentIndex);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, [currentIndex, isTransitioning]);

  const handleDragMove = useCallback((clientX) => {
    if (!isDragging || isTransitioning) return;
    rafRef.current = requestAnimationFrame(() => {
      const containerWidth = scrollContainerRef.current?.offsetWidth || 0;
      const itemWidth = containerWidth / itemsPerView;
      const deltaX = startX - clientX;
      const dragDistance = deltaX / itemWidth;

      let newOffset = dragDistance;
      const futureIndex = scrollLeft + dragDistance;

      if (futureIndex < 0) {
        newOffset = dragDistance * (1 - Math.abs(futureIndex) * 0.3);
      } else if (futureIndex > maxIndex) {
        const overflow = futureIndex - maxIndex;
        newOffset = dragDistance - (overflow * 0.7);
      }

      setDragOffset(newOffset);
    });
  }, [isDragging, startX, scrollLeft, itemsPerView, maxIndex, isTransitioning]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging || isTransitioning) return;
    setIsDragging(false);
    const threshold = 0.3;
    let targetIndex = scrollLeft + dragOffset;

    if (Math.abs(dragOffset) > threshold) {
      targetIndex = dragOffset > 0 ? Math.ceil(scrollLeft + dragOffset) : Math.floor(scrollLeft + dragOffset);
    } else {
      targetIndex = Math.round(scrollLeft);
    }

    animateToIndex(targetIndex);
  }, [isDragging, scrollLeft, dragOffset, animateToIndex, isTransitioning]);

  const handleTouchStart = (e) => handleDragStart(e.touches[0].clientX);
  const handleTouchMove = (e) => {
    e.preventDefault();
    handleDragMove(e.touches[0].clientX);
  };
  const handleTouchEnd = () => handleDragEnd();

  const handleMouseDown = (e) => {
    if (isMobile) return;
    e.preventDefault();
    handleDragStart(e.clientX);
  };
  const handleMouseMove = (e) => handleDragMove(e.clientX);
  const handleMouseUp = () => handleDragEnd();
  const handleMouseLeave = () => {
    if (isDragging) handleDragEnd();
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (loading) {
    return (
      <section className="pb-2 lg:pb-4">
        <div className="w-full px-2 sm:px-4 lg:px-8">
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando servicios destacados...</p>
          </div>
        </div>
      </section>
    );
  }

  // if (error) {
  //   return null; 
  // }

  const isEmpty = featuredServices.length === 0;

  if (!isClient) {
    return (
      <section className="pb-2 lg:pb-4">
        <div className="text-center">Cargando servicios destacados...</div>
      </section>
    );
  }

  const currentOffset = currentIndex + dragOffset;
  const translateX = -(currentOffset * (100 / itemsPerView));

  const gapClass = isMobile ? 'gap-2' : isTablet ? 'gap-4' : 'gap-6';

  return (
    <section className="pb-2 lg:pb-4 w-full">
      <div className="w-full px-2 sm:px-4 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-accent-400 to-accent-500 rounded-lg shadow-sm">
            <Crown className="w-6 h-6 text-white fill-current" />
          </div>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Servicios Destacados
          </h2>
        </div>

        {isEmpty ? (
          <SectionEmptyState
            message="Aún no hay servicios destacados."
            subMessage="¡Destaca tu servicio para que aparezca aquí!"
          />
        ) : (
          <div className="relative">
            {!isMobile && maxIndex > 0 && (
              <>
                <button
                  onClick={goToPrevious}
                  disabled={currentIndex === 0 || isDragging || isTransitioning}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 p-3 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={goToNext}
                  disabled={currentIndex === maxIndex || isDragging || isTransitioning}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 p-3 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <div
              ref={scrollContainerRef}
              className={`overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              style={{ touchAction: 'pan-y' }}
            >
              <div
                className={`flex ${gapClass} will-change-transform`}
                style={{
                  transform: `translateX(${translateX}%)`,
                  transition: (isTransitioning && !isDragging) ? 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
                }}
              >
                {featuredServices.map((service) => {
                  const gapPx = isMobile ? 8 : isTablet ? 16 : 24;
                  const totalGapPx = gapPx * (itemsPerView - 1);

                  return (
                    <div
                      key={service.id}
                      className={`flex-shrink-0 transition-all duration-200 ${isDragging ? 'scale-[0.98]' : ''}`}
                      style={{
                        width: `calc(${100 / itemsPerView}% - ${totalGapPx / itemsPerView}px)`,
                      }}
                    >
                      <ServiceCard
                        service={service}
                        storeData={service.storeData}
                        variant="featured-compact"
                        showContactInfo={true}
                        showStoreInfo={true}
                        onClick={() => handleServiceClick(service)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {maxIndex > 0 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: maxIndex + 1 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => animateToIndex(i)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${Math.round(currentIndex) === i
                      ? 'bg-gradient-to-r from-accent-500 to-accent-600 scale-125 shadow-md'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-accent-300 dark:hover:bg-accent-600'
                      }`}
                    disabled={isDragging || isTransitioning}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}