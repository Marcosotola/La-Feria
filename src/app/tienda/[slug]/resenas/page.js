// src/app/tienda/[slug]/resenas/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  orderBy,
  serverTimestamp,
  limit,
  startAfter 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getPublicStoreConfig } from '@/lib/storeConfigUtils';
import { canViewStore } from '@/lib/storeVisibility';
import { useAuth } from '@/contexts/AuthContext';
import StoreLayout from '@/components/tienda/StoreLayout';
import { 
  ArrowLeft, 
  Loader2, 
  MessageSquare, 
  Star,
  User,
  Calendar,
  Plus,
  X
} from 'lucide-react';
import Link from 'next/link';

export default function ResenasPage() {
  const params = useParams();
  const { slug } = params;
  const { user, userData, loading: authLoading } = useAuth();
  
  const [storeData, setStoreData] = useState(null);
  const [storeConfig, setStoreConfig] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Stats
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  
  // Form
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [content, setContent] = useState('');
  
  const REVIEWS_PER_PAGE = 10;

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
        
        await loadReviews(userData.id);
        await loadStats(userData.id);
        
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

  const loadReviews = async (storeId, loadMore = false) => {
    if (loadMore) {
      setLoadingMore(true);
    }

    try {
      const reviewsRef = collection(db, 'testimonios');
      let q;

      if (loadMore && lastVisible) {
        q = query(
          reviewsRef,
          where('storeId', '==', storeId),
          orderBy('createdAt', 'desc'),
          startAfter(lastVisible),
          limit(REVIEWS_PER_PAGE)
        );
      } else {
        q = query(
          reviewsRef,
          where('storeId', '==', storeId),
          orderBy('createdAt', 'desc'),
          limit(REVIEWS_PER_PAGE)
        );
      }

      const querySnapshot = await getDocs(q);

      const reviewsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastVisible(lastDoc);
      setHasMore(querySnapshot.docs.length === REVIEWS_PER_PAGE);

      if (loadMore) {
        setReviews(prev => [...prev, ...reviewsList]);
      } else {
        setReviews(reviewsList);
      }
    } catch (error) {
      console.error('Error cargando reseñas:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const loadStats = async (storeId) => {
    try {
      const reviewsRef = collection(db, 'testimonios');
      const q = query(reviewsRef, where('storeId', '==', storeId));
      const querySnapshot = await getDocs(q);
      
      const total = querySnapshot.size;
      const sum = querySnapshot.docs.reduce((acc, doc) => acc + (doc.data().rating || 0), 0);
      const average = total > 0 ? (sum / total).toFixed(1) : 0;
      
      setTotalReviews(total);
      setAverageRating(parseFloat(average));
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('Debes iniciar sesión para dejar una reseña');
      return;
    }

    if (rating === 0) {
      alert('Por favor selecciona una calificación');
      return;
    }

    if (!content.trim()) {
      alert('Por favor escribe tu reseña');
      return;
    }

    if (content.trim().length < 10) {
      alert('La reseña debe tener al menos 10 caracteres');
      return;
    }

    setSubmitting(true);

    try {
      await addDoc(collection(db, 'testimonios'), {
        storeId: storeData.id,
        userId: user.uid,
        name: userData?.firstName && userData?.lastName 
          ? `${userData.firstName} ${userData.lastName}`
          : userData?.firstName || 'Usuario',
        rating,
        content: content.trim(),
        createdAt: serverTimestamp()
      });

      // Recargar reseñas y stats
      await loadReviews(storeData.id);
      await loadStats(storeData.id);
      
      // Cerrar modal y limpiar form
      setShowModal(false);
      setRating(0);
      setContent('');
      
      alert('¡Gracias por tu reseña!');
    } catch (error) {
      console.error('Error al enviar reseña:', error);
      alert('Error al enviar la reseña. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Fecha desconocida';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const renderStars = (rating, interactive = false, onHover = null, onClick = null) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= (interactive ? (hoveredRating || rating) : rating)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            } ${interactive ? 'cursor-pointer' : ''} transition-colors`}
            onMouseEnter={() => interactive && onHover && onHover(star)}
            onMouseLeave={() => interactive && onHover && onHover(0)}
            onClick={() => interactive && onClick && onClick(star)}
          />
        ))}
      </div>
    );
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Cargando reseñas...
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
    <StoreLayout storeData={storeData} storeConfig={storeConfig}>
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
            <span className="text-gray-900 dark:text-white font-medium">Reseñas</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 py-8 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-orange-600" />
                Reseñas
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                Lo que dicen nuestros clientes
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Escribir reseña
              </button>

              <Link
                href={`/tienda/${slug}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl p-6 border border-orange-100 dark:border-orange-800">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                  {averageRating}
                </div>
                {renderStars(Math.round(averageRating))}
              </div>
              <div className="text-center sm:text-left">
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {totalReviews} {totalReviews === 1 ? 'reseña' : 'reseñas'}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  De clientes verificados
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reseñas */}
      <div className="bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {reviews.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No hay reseñas todavía
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Sé el primero en compartir tu experiencia
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Escribir primera reseña
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {review.name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatDate(review.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      {renderStars(review.rating)}
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {review.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Botón Cargar Más */}
              {hasMore && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => loadReviews(storeData.id, true)}
                    disabled={loadingMore}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Cargando más...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        <span>Cargar más reseñas</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal Nueva Reseña */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Escribe tu reseña
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="p-6 space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Calificación *
                </label>
                {renderStars(
                  rating,
                  true,
                  setHoveredRating,
                  setRating
                )}
              </div>

              {/* Contenido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tu reseña *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Comparte tu experiencia con esta tienda..."
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  required
                  minLength={10}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Mínimo 10 caracteres
                </p>
              </div>

              {/* Botones */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !user}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Enviando...
                    </>
                  ) : !user ? (
                    'Inicia sesión'
                  ) : (
                    'Publicar reseña'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StoreLayout>
  );
}