// src/app/tienda/[slug]/nosotros/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { canViewStore } from '@/lib/storeVisibility';
import { getPublicStoreConfig } from '@/lib/storeConfigUtils';
import StoreLayout from '@/components/tienda/StoreLayout';
import {
  MapPin,
  Mail,
  Clock,
  Calendar,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Globe,
  Loader2,
  Heart,
  Target,
  Eye,
  Award,
  Users,
  ArrowLeft,
  MessageCircle
} from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const params = useParams();
  const { slug } = params;
  const { user, loading: authLoading } = useAuth();

  const [storeData, setStoreData] = useState(null);
  const [storeConfig, setStoreConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        
        setStoreData(userData);
        setStoreConfig(config);
        
      } catch (error) {
        console.error('Error al cargar la tienda:', error);
        setError('Error al cargar la tienda');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchData();
    }
  }, [slug]);

  const formatLocation = (location) => {
    if (!location) return '';
    if (typeof location === 'string') return location;
    if (typeof location === 'object') {
      const parts = [
        location.direccion,
        location.ciudad,
        location.provincia,
        location.pais
      ].filter(part => part && part.trim() !== '');
      return parts.join(', ');
    }
    return '';
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Cargando...
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
            {error || 'Tienda no encontrada'}
          </h2>
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
            <span className="text-gray-900 dark:text-white font-medium">Nosotros</span>
          </nav>
        </div>
      </div>

      {/* Header de página */}
      <div className="bg-white dark:bg-gray-800 py-8 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Heart 
                  className="w-8 h-8"
                  style={{ color: storeConfig?.primaryColor || '#ea580c' }}
                />
                Sobre Nosotros
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                Conoce nuestra historia, valores y equipo
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

      <div className="bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Nuestra Historia / Descripción */}
          {storeData.about?.description && (
            <section className="mb-12">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Heart 
                    className="w-8 h-8"
                    style={{ color: storeConfig?.primaryColor || '#ea580c' }}
                  />
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    Nuestra Historia
                  </h2>
                </div>
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {storeData.about.description}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Misión y Visión */}
          {(storeData.about?.mission || storeData.about?.vision) && (
            <section className="mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Misión */}
                {storeData.about?.mission && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <Target 
                        className="w-7 h-7"
                        style={{ color: storeConfig?.primaryColor || '#ea580c' }}
                      />
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Nuestra Misión
                      </h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {storeData.about.mission}
                    </p>
                  </div>
                )}

                {/* Visión */}
                {storeData.about?.vision && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <Eye 
                        className="w-7 h-7"
                        style={{ color: storeConfig?.primaryColor || '#ea580c' }}
                      />
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Nuestra Visión
                      </h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {storeData.about.vision}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Valores */}
          {storeData.about?.values && storeData.about.values.length > 0 && (
            <section className="mb-12">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Award 
                    className="w-8 h-8"
                    style={{ color: storeConfig?.primaryColor || '#ea580c' }}
                  />
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    Nuestros Valores
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {storeData.about.values.map((value, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div 
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: storeConfig?.primaryColor || '#ea580c' }}
                      />
                      <span className="text-gray-900 dark:text-white font-medium">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Información de Contacto */}
          <section className="mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <Users 
                  className="w-8 h-8"
                  style={{ color: storeConfig?.primaryColor || '#ea580c' }}
                />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Información de Contacto
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Datos de contacto */}
                <div className="space-y-4">
                  {storeConfig?.showWhatsApp && storeData.whatsapp && (
                    <a
                      href={`https://wa.me/${storeData.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow group"
                    >
                      <div
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: `${storeConfig?.primaryColor || '#ea580c'}20` }}
                      >
                        <MessageCircle
                          className="w-6 h-6"
                          style={{ color: storeConfig?.primaryColor || '#ea580c' }}
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">WhatsApp</p>
                        <p className="font-semibold text-gray-900 dark:text-white group-hover:underline">
                          Enviar mensaje
                        </p>
                      </div>
                    </a>
                  )}

                  {storeData.email && (
                    <a
                      href={`mailto:${storeData.email}`}
                      className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow group"
                    >
                      <div 
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: `${storeConfig?.primaryColor || '#ea580c'}20` }}
                      >
                        <Mail 
                          className="w-6 h-6"
                          style={{ color: storeConfig?.primaryColor || '#ea580c' }}
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <p className="font-semibold text-gray-900 dark:text-white group-hover:underline break-all">
                          {storeData.email}
                        </p>
                      </div>
                    </a>
                  )}

                  {(storeData.city || storeData.address) && (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div 
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: `${storeConfig?.primaryColor || '#ea580c'}20` }}
                      >
                        <MapPin 
                          className="w-6 h-6"
                          style={{ color: storeConfig?.primaryColor || '#ea580c' }}
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Ubicación</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatLocation(storeData.city || storeData.address)}
                        </p>
                      </div>
                    </div>
                  )}

                  {storeData.about?.foundedYear && (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div 
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: `${storeConfig?.primaryColor || '#ea580c'}20` }}
                      >
                        <Calendar 
                          className="w-6 h-6"
                          style={{ color: storeConfig?.primaryColor || '#ea580c' }}
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Fundada en</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {storeData.about.foundedYear}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Horarios */}
                {storeData.horarios && Object.keys(storeData.horarios).length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Clock 
                        className="w-6 h-6"
                        style={{ color: storeConfig?.primaryColor || '#ea580c' }}
                      />
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Horarios de Atención
                      </h3>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                      {Object.entries(storeData.horarios).map(([dia, horario]) => (
                        <div key={dia} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600 last:border-0">
                          <span className="font-medium text-gray-900 dark:text-white capitalize">
                            {dia}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {horario.cerrado ? 'Cerrado' : `${horario.apertura} - ${horario.cierre}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Redes Sociales */}
              {(storeConfig?.socialLinks?.facebook ||
                storeConfig?.socialLinks?.instagram ||
                storeConfig?.socialLinks?.linkedin ||
                storeConfig?.socialLinks?.twitter ||
                storeConfig?.socialLinks?.website) && (
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Síguenos en redes sociales
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {storeConfig?.socialLinks?.facebook && (
                      <a
                        href={storeConfig.socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <Facebook className="w-6 h-6" />
                      </a>
                    )}
                    {storeConfig?.socialLinks?.instagram && (
                      <a
                        href={storeConfig.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-gradient-to-br from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white rounded-lg transition-colors"
                      >
                        <Instagram className="w-6 h-6" />
                      </a>
                    )}
                    {storeConfig?.socialLinks?.linkedin && (
                      <a
                        href={storeConfig.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors"
                      >
                        <Linkedin className="w-6 h-6" />
                      </a>
                    )}
                    {storeConfig?.socialLinks?.twitter && (
                      <a
                        href={storeConfig.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
                      >
                        <Twitter className="w-6 h-6" />
                      </a>
                    )}
                    {storeConfig?.socialLinks?.website && (
                      <a
                        href={storeConfig.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors"
                      >
                        <Globe className="w-6 h-6" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </StoreLayout>
  );
}