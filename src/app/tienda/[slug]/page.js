// src/app/tienda/[slug]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { canViewStore } from '@/lib/storeVisibility';
import { getPublicStoreConfig } from '@/lib/storeConfigUtils';
import StoreLayout from '@/components/tienda/StoreLayout';
import Link from 'next/link';
import ProductCard from '@/components/tienda/productos/ProductCard';
import ServiceCard from '@/components/tienda/servicios/ServiceCard';
import OfertaEmpleoCard from '@/components/tienda/empleos/OfertaEmpleoCard';
import BusquedaEmpleoCard from '@/components/tienda/empleos/BusquedaEmpleoCard';
import { 
  Package, Wrench, Briefcase, Camera, MessageCircle, ArrowRight, Star, MapPin, Mail, Loader2
} from 'lucide-react';

export default function StoreHomePage() {
  const params = useParams();
  const router = useRouter();
  const { slug } = params;
  const { user, loading: authLoading } = useAuth();
  const [storeData, setStoreData] = useState(null);
  const [storeConfig, setStoreConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewsStats, setReviewsStats] = useState({ average: 0, total: 0 });

  useEffect(() => {
    const fetchData = async () => {
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
        console.log('🎨 StoreConfig cargado:', config);
        console.log('🎨 Colores - Primario:', config?.primaryColor, 'Secundario:', config?.secondaryColor);
        setStoreData(userData);
        setStoreConfig(config);
        if (config?.showProducts) await loadProductsPreview(userData.id);
        if (config?.showServices) await loadServicesPreview(userData.id);
        if (config?.showJobs) await loadJobsPreview(userData.id);
        if (config?.showGallery) await loadGalleryPreview(userData.id);
        if (config?.showTestimonials) {
          await loadReviewsPreview(userData.id);
          await loadReviewsStats(userData.id);
        }
      } catch (error) {
        console.error('Error al cargar la tienda:', error);
        setError('Error al cargar la tienda');
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchData();
  }, [slug]);

  const loadProductsPreview = async (userId) => {
    try {
      const productsRef = collection(db, 'productos');
      const q = query(productsRef, where('usuarioId', '==', userId), orderBy('fechaCreacion', 'desc'), limit(4));
      const querySnapshot = await getDocs(q);
      setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  const loadServicesPreview = async (userId) => {
    try {
      const servicesRef = collection(db, 'servicios');
      const q = query(servicesRef, where('usuarioId', '==', userId), orderBy('fechaCreacion', 'desc'), limit(4));
      const querySnapshot = await getDocs(q);
      setServices(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error cargando servicios:', error);
    }
  };

  const loadJobsPreview = async (userId) => {
    try {
      const jobsRef = collection(db, 'empleos');
      const q = query(jobsRef, where('usuarioId', '==', userId), orderBy('fechaCreacion', 'desc'), limit(3));
      const querySnapshot = await getDocs(q);
      setJobs(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error cargando empleos:', error);
    }
  };

  const loadGalleryPreview = async (userId) => {
    try {
      const galleryRef = collection(db, 'galeria');
      const q = query(galleryRef, where('userId', '==', userId), orderBy('fechaCreacion', 'desc'), limit(6));
      const querySnapshot = await getDocs(q);
      setGalleryImages(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error cargando galería:', error);
    }
  };

  const loadReviewsPreview = async (storeId) => {
    try {
      const reviewsRef = collection(db, 'testimonios');
      const q = query(reviewsRef, where('storeId', '==', storeId), orderBy('createdAt', 'desc'), limit(3));
      const querySnapshot = await getDocs(q);
      setReviews(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error cargando reseñas:', error);
    }
  };

  const loadReviewsStats = async (storeId) => {
    try {
      const reviewsRef = collection(db, 'testimonios');
      const q = query(reviewsRef, where('storeId', '==', storeId));
      const querySnapshot = await getDocs(q);
      const total = querySnapshot.size;
      const sum = querySnapshot.docs.reduce((acc, doc) => acc + (doc.data().rating || 0), 0);
      const average = total > 0 ? (sum / total).toFixed(1) : 0;
      setReviewsStats({ average: parseFloat(average), total });
    } catch (error) {
      console.error('Error cargando stats:', error);
    }
  };

  const getPrimaryColor = () => storeConfig?.primaryColor || '#ea580c';
  const getSecondaryColor = () => storeConfig?.secondaryColor || '#64748b';

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Cargando tienda...</h2>
        </div>
      </div>
    );
  }

  if (error || !storeData || !storeConfig || !canViewStore(storeData, user?.uid)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{error || 'Esta tienda no está disponible'}</h2>
          <Link href="/" className="text-orange-600 hover:text-orange-700 font-medium">
            Volver a La Feria
          </Link>
        </div>
      </div>
    );
  }

  const primaryColor = getPrimaryColor();
  const secondaryColor = getSecondaryColor();

  return (
    <StoreLayout storeData={storeData} storeConfig={storeConfig}>
      <div className="py-6 md:py-12 text-white" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-3">
            {storeData.businessName || storeData.familyName}
          </h1>
          {storeData.slogan && (
            <p className="text-base md:text-lg lg:text-xl text-white/90 max-w-3xl mx-auto">{storeData.slogan}</p>
          )}
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900">
        {storeConfig?.showProducts && products.length > 0 && (
          <section className="py-12 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold flex items-center gap-3" style={{ color: primaryColor }}>
                  <Package className="w-8 h-8" />
                  Productos Destacados
                </h2>
                <Link href={`/tienda/${slug}/productos`} className="flex items-center gap-2 font-medium hover:underline" style={{ color: primaryColor }}>
                  Ver todos
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} storeData={storeData} variant="featured-compact" showContactInfo={true} showStoreInfo={false} onClick={() => router.push(`/tienda/${slug}/producto/${product.id}`)} />
                ))}
              </div>
            </div>
          </section>
        )}

        {storeConfig?.showServices && services.length > 0 && (
          <section className="py-12 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold flex items-center gap-3" style={{ color: primaryColor }}>
                  <Wrench className="w-8 h-8" />
                  Servicios Destacados
                </h2>
                <Link href={`/tienda/${slug}/servicios`} className="flex items-center gap-2 font-medium hover:underline" style={{ color: primaryColor }}>
                  Ver todos
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} storeData={storeData} variant="featured-compact" showContactInfo={true} showStoreInfo={false} onClick={() => router.push(`/tienda/${slug}/servicio/${service.id}`)} />
                ))}
              </div>
            </div>
          </section>
        )}

        {storeConfig?.showJobs && jobs.length > 0 && (
          <section className="py-12 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold flex items-center gap-3" style={{ color: primaryColor }}>
                  <Briefcase className="w-8 h-8" />
                  Empleos Destacados
                </h2>
                <Link href={`/tienda/${slug}/empleos`} className="flex items-center gap-2 font-medium hover:underline" style={{ color: primaryColor }}>
                  Ver todos
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {jobs.map((job) => {
                  const isBusqueda = job.tipoPublicacion === 'busqueda_empleo';
                  return isBusqueda ? (
                    <BusquedaEmpleoCard key={job.id} busqueda={job} variant="featured-compact" showContactInfo={true} onClick={() => router.push(`/tienda/${slug}/empleo/${job.id}`)} />
                  ) : (
                    <OfertaEmpleoCard key={job.id} oferta={job} storeData={storeData} variant="featured-compact" showContactInfo={true} showStoreInfo={false} onClick={() => router.push(`/tienda/${slug}/empleo/${job.id}`)} />
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {storeConfig?.showGallery && galleryImages.length > 0 && (
          <section className="py-12 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold flex items-center gap-3" style={{ color: primaryColor }}>
                  <Camera className="w-8 h-8" />
                  Galería
                </h2>
                <Link href={`/tienda/${slug}/galeria`} className="flex items-center gap-2 font-medium hover:underline" style={{ color: primaryColor }}>
                  Ver todas
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {galleryImages.map((image) => (
                  <div key={image.id} className="aspect-square rounded-lg overflow-hidden hover:opacity-90 transition-opacity cursor-pointer">
                    <img src={image.imageUrl} alt={image.titulo} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {storeConfig?.showTestimonials && reviews.length > 0 && (
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold flex items-center gap-3" style={{ color: primaryColor }}>
                  <MessageCircle className="w-8 h-8" />
                  Reseñas
                </h2>
                <Link href={`/tienda/${slug}/resenas`} className="flex items-center gap-2 font-medium hover:underline" style={{ color: primaryColor }}>
                  Ver todas
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                      ))}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">{review.content}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{review.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-12 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Información de Contacto</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {storeConfig?.showWhatsApp && storeData.whatsapp && (
                <a href={`https://wa.me/${storeData.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow">
                  <MessageCircle className="w-6 h-6" style={{ color: primaryColor }} />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">WhatsApp</p>
                    <p className="font-medium text-gray-900 dark:text-white">Enviar mensaje</p>
                  </div>
                </a>
              )}
              {storeData.email && (
                <a href={`mailto:${storeData.email}`} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow">
                  <Mail className="w-6 h-6" style={{ color: primaryColor }} />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">{storeData.email}</p>
                  </div>
                </a>
              )}
              {storeData.city && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <MapPin className="w-6 h-6" style={{ color: primaryColor }} />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ubicación</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {typeof storeData.city === 'string' ? storeData.city : `${storeData.city.ciudad || ''}${storeData.city.ciudad && storeData.city.provincia ? ', ' : ''}${storeData.city.provincia || ''}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </StoreLayout>
  );
}