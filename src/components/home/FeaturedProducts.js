// src/components/home/FeaturedProducts.js
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/tienda/productos/ProductCard';
import SectionEmptyState from './SectionEmptyState';


// Componente Skeleton
function FeaturedProductsSkeleton({ itemsPerView, gapClass }) {
  return (
    <div className="w-full px-2 sm:px-4 lg:px-8">
      {/* Header Skeleton */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-yellow-200 to-orange-300 dark:from-yellow-800 dark:to-orange-800 rounded-lg animate-pulse" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse" />
      </div>

      {/* Cards Skeleton */}
      <div className="relative">
        <div className="overflow-hidden">
          <div className={`flex ${gapClass}`}>
            {Array.from({ length: itemsPerView }).map((_, index) => {
              const gapPx = itemsPerView === 2 ? 8 : itemsPerView === 3 ? 16 : 24;
              const totalGapPx = gapPx * (itemsPerView - 1);

              return (
                <div
                  key={index}
                  className="flex-shrink-0"
                  style={{
                    width: `calc(${100 / itemsPerView}% - ${totalGapPx / itemsPerView}px)`,
                  }}
                >
                  {/* Skeleton Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 animate-pulse">
                    <div className="h-6 bg-gradient-to-r from-orange-300 to-amber-300 dark:from-orange-700 dark:to-amber-700" />
                    <div className="h-40 bg-gray-200 dark:bg-gray-700 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    </div>
                    <div className="p-3 space-y-3">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      </div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dots skeleton */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [windowWidth, setWindowWidth] = useState(1280);
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
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const productsRef = collection(db, 'productos');
      const q = query(
        productsRef,
        where('featured', '==', true),
        where('featuredUntil', '>', now),
        where('estado', '==', 'disponible'),
        orderBy('featuredUntil', 'desc'),
        orderBy('fechaDestacado', 'desc'),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`✅ ${products.length} productos destacados cargados`);
      setFeaturedProducts(products);
    } catch (error) {
      console.error('Error cargando productos destacados:', error);
      setError('Error cargando productos destacados');
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product) => {
    const storeSlug = product.tiendaInfo?.slug || product.storeData?.storeSlug;
    if (storeSlug && product.id) {
      const url = `https://laferia.vercel.app/tienda/${storeSlug}/producto/${product.id}`;
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

  const maxIndex = Math.max(0, featuredProducts.length - itemsPerView);

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

  const gapClass = isMobile ? 'gap-2' : isTablet ? 'gap-4' : 'gap-6';

  if (loading || !isClient) {
    return <FeaturedProductsSkeleton itemsPerView={itemsPerView} gapClass={gapClass} />;
  }

  if (error) {
    return null;
  }

  const currentOffset = currentIndex + dragOffset;
  const translateX = -(currentOffset * (100 / itemsPerView));
  const isEmpty = featuredProducts.length === 0;

  return (
    <div className="w-full px-2 sm:px-4 lg:px-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg shadow-sm">
          <Star className="w-6 h-6 text-white fill-current" />
        </div>
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          Productos Destacados
        </h2>
      </div>

      {isEmpty ? (
        <SectionEmptyState
          message="Aún no hay productos destacados."
          subMessage="¡Destaca tu producto para que aparezca aquí!"
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
              {featuredProducts.map((product) => {
                const gapPx = isMobile ? 8 : isTablet ? 16 : 24;
                const totalGapPx = gapPx * (itemsPerView - 1);

                return (
                  <div
                    key={product.id}
                    className={`flex-shrink-0 transition-all duration-200 ${isDragging ? 'scale-[0.98]' : ''}`}
                    style={{
                      width: `calc(${100 / itemsPerView}% - ${totalGapPx / itemsPerView}px)`,
                    }}
                  >
                    <ProductCard
                      product={product}
                      storeData={product.storeData}
                      variant="featured-compact"
                      showContactInfo={true}
                      showStoreInfo={true}
                      onClick={() => handleProductClick(product)}
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
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 scale-125 shadow-md'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-amber-300 dark:hover:bg-amber-600'
                    }`}
                  disabled={isDragging || isTransitioning}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}