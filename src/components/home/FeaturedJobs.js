// src/components/home/FeaturedJobs.js
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import { TIPOS_PUBLICACION } from '@/types/employment';
import OfertaEmpleoCard from '@/components/tienda/empleos/OfertaEmpleoCard';
import BusquedaEmpleoCard from '@/components/tienda/empleos/BusquedaEmpleoCard';
import ServicioProfesionalCard from '@/components/tienda/empleos/ServicioProfesionalCard';
import SectionEmptyState from './SectionEmptyState';

export default function FeaturedJobs() {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [windowWidth, setWindowWidth] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
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
    loadFeaturedJobs();
  }, []);

  const loadFeaturedJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const empleosRef = collection(db, 'empleos');
      const q = query(
        empleosRef,
        where('featured', '==', true),
        where('featuredUntil', '>', now),
        where('estado', '==', 'activo'),
        orderBy('featuredUntil', 'desc'),
        orderBy('fechaDestacado', 'desc'),
        limit(20)
      );

      const querySnapshot = await getDocs(q);

      const jobs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`✅ ${jobs.length} empleos destacados cargados`);
      setFeaturedJobs(jobs);
    } catch (error) {
      console.error('Error cargando empleos destacados:', error);
      setError('Error cargando empleos destacados');
      setFeaturedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJobClick = (job) => {
    const storeSlug = job.tiendaInfo?.slug || job.storeSlug;
    if (storeSlug && job.id) {
      const url = `https://laferia.vercel.app/tienda/${storeSlug}/empleos/${job.id}`;
      window.open(url, '_blank');
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

  const maxIndex = Math.max(0, featuredJobs.length - itemsPerView);

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
      <section className="py-8 lg:py-12">
        <div className="w-full px-2 sm:px-4 lg:px-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando empleos destacados...</p>
          </div>
        </div>
      </section>
    );
  }

  // if (error) {
  //   return null;
  // }

  const isEmpty = featuredJobs.length === 0;

  if (!isClient) {
    return (
      <section className="py-8 lg:py-12">
        <div className="text-center">Cargando empleos destacados...</div>
      </section>
    );
  }

  const currentOffset = currentIndex + dragOffset;
  const translateX = -(currentOffset * (100 / itemsPerView));

  const gapClass = isMobile ? 'gap-3' : isTablet ? 'gap-4' : 'gap-6';

  return (
    <section className="py-0 w-full">
      <div className="w-full px-2 sm:px-4 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-brand-teal-700 to-brand-teal-800 rounded-lg shadow-sm">
            <Briefcase className="w-6 h-6 text-white fill-current" />
          </div>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Empleos Destacados
          </h2>
        </div>

        {isEmpty ? (
          <SectionEmptyState
            message="Aún no hay empleos destacados."
            subMessage="¡Destaca un empleo para obtener más postulantes!"
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
                {featuredJobs.map((job) => {
                  const gapPx = isMobile ? 12 : isTablet ? 16 : 24;
                  const totalGapPx = gapPx * (itemsPerView - 1);

                  return (
                    <div
                      key={job.id}
                      className={`flex-shrink-0 transition-all duration-200 ${isDragging ? 'scale-[0.98]' : ''}`}
                      style={{
                        width: `calc(${100 / itemsPerView}% - ${totalGapPx / itemsPerView}px)`,
                      }}
                    >
                      {(() => {
                        const tipoEmpleo = job.tipoPublicacion || job.tipo;

                        // Busqueda de empleo
                        if (tipoEmpleo === 'busqueda' || tipoEmpleo === 'busqueda_empleo') {
                          return (
                            <BusquedaEmpleoCard
                              busqueda={job}
                              storeData={job.tiendaInfo}
                              variant="featured-compact"
                              showContactInfo={true}
                              showStoreInfo={true}
                              onClick={() => handleJobClick(job)}
                            />
                          );
                        }

                        // Servicio profesional
                        if (tipoEmpleo === 'servicio_profesional') {
                          return (
                            <ServicioProfesionalCard
                              servicio={job}
                              storeData={job.tiendaInfo}
                              variant="featured-compact"
                              showContactInfo={true}
                              showStoreInfo={true}
                              onClick={() => handleJobClick(job)}
                            />
                          );
                        }

                        // Oferta de empleo (por defecto)
                        return (
                          <OfertaEmpleoCard
                            oferta={job}
                            storeData={job.tiendaInfo}
                            variant="featured-compact"
                            showContactInfo={true}
                            showStoreInfo={true}
                            onClick={() => handleJobClick(job)}
                          />
                        );
                      })()}
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
                      ? 'bg-gradient-to-r from-accent-600 to-accent-700 scale-125 shadow-md'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-accent-500 dark:hover:bg-accent-800'
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