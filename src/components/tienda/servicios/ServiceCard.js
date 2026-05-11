// src/components/tienda/servicios/ServiceCard.js
'use client';

import { useState } from 'react';
import { 
  Share2, 
  MessageCircle, 
  Phone, 
  Mail,
  ChevronLeft,
  ChevronRight,
  Star,
  Briefcase,
  Clock,
  MapPin,
  Users,
  Calendar,
  Store,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Monitor,
  Home,
  Globe,
  Crown
} from 'lucide-react';
import { 
  formatearPrecioServicio, 
  TIPOS_PRECIO_SERVICIO,
  MODALIDAD_SERVICIO,
  formatearModalidad,
  formatearDuracion,
  formatearDiasDisponibles,
  formatearHorarios
} from '../../../types/services';
import { 
  doc, 
  updateDoc, 
  increment,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import FavoriteButton from '@/components/ui/FavoriteButton';

export default function ServiceCard({ 
  service, 
  storeData,
  variant = 'grid',
  showContactInfo = true,
  showStoreInfo = true,
  onClick = null
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  if (!service) return null;

  const images = service.imagenes || [];
  const hasMultipleImages = images.length > 1;

  const loadComments = async () => {
    if (comments.length > 0) return;
    
    try {
      setLoadingComments(true);
      const commentsRef = collection(db, 'comentarios_servicios');
      const q = query(
        commentsRef,
        where('servicioId', '==', service.id),
        orderBy('fechaCreacion', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      const commentsData = await Promise.all(
        querySnapshot.docs.map(async (commentDoc) => {
          const commentData = { id: commentDoc.id, ...commentDoc.data() };
          
          try {
            const userDoc = await getDoc(doc(db, 'users', commentData.usuarioId));
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              commentData.usuario = {
                nombre: userData.firstName && userData.lastName 
                  ? `${userData.firstName} ${userData.lastName}`
                  : userData.firstName || userData.familyName || userData.businessName || 'Usuario',
                avatar: userData.profileImage || userData.storeLogo || null
              };
            } else {
              commentData.usuario = {
                nombre: 'Usuario',
                avatar: null
              };
            }
          } catch (error) {
            commentData.usuario = {
              nombre: 'Usuario',
              avatar: null
            };
          }
          
          return commentData;
        })
      );
      
      setComments(commentsData);
    } catch (error) {
      console.error('Error cargando comentarios:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleWhatsAppContact = (e) => {
    e.stopPropagation();
    const phone = service.contacto?.whatsapp || storeData?.phone || '';
    const message = service.contacto?.mensaje || 
      `Hola! Me interesa tu servicio: ${service.titulo}`;
    const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handlePhoneContact = (e) => {
    e.stopPropagation();
    const phone = service.contacto?.telefono || storeData?.phone || '';
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmailContact = (e) => {
    e.stopPropagation();
    const email = service.contacto?.email || storeData?.email || '';
    const subject = `Consulta sobre: ${service.titulo}`;
    const body = `Hola! Me interesa tu servicio: ${service.titulo}\n\n¿Podrías darme más información?`;
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const serviceUrl = `${window.location.origin}/tienda/${service.tiendaInfo?.slug || storeData?.storeSlug}/servicio/${service.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: service.titulo,
          text: service.descripcion,
          url: serviceUrl,
        });
        
        const serviceRef = doc(db, 'servicios', service.id);
        await updateDoc(serviceRef, {
          'interacciones.compartidas': increment(1)
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(serviceUrl);
      alert('Enlace copiado al portapapeles');
    }
  };

  const handleViewStore = (e) => {
    e.stopPropagation();
    const storeUrl = `https://laferia.vercel.app/tienda/${service.tiendaInfo?.slug || storeData?.storeSlug}`;
    window.open(storeUrl, '_blank');
  };

  const handleToggleComments = async (e) => {
    e.stopPropagation();
    if (!showComments) {
      await loadComments();
    }
    setShowComments(!showComments);
  };

  const toggleDetails = (e) => {
    e.stopPropagation();
    setShowDetails(!showDetails);
  };

  const getModalidadIcon = (modalidad) => {
    switch (modalidad) {
      case MODALIDAD_SERVICIO.PRESENCIAL:
        return <MapPin className="w-4 h-4" />;
      case MODALIDAD_SERVICIO.DOMICILIO:
        return <Home className="w-4 h-4" />;
      case MODALIDAD_SERVICIO.VIRTUAL:
        return <Monitor className="w-4 h-4" />;
      case MODALIDAD_SERVICIO.HIBRIDO:
        return <Globe className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  // Variante FEATURED COMPACT con desplegable
  if (variant === 'featured-compact') {
    return (
      <div 
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-blue-200 dark:border-blue-700"
      >
        <div className="absolute top-0 left-0 right-0 z-20">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 text-center">
            <div className="flex items-center justify-center space-x-1">
              <Crown className="w-3 h-3" />
              <span className="text-xs font-bold">DESTACADO</span>
            </div>
          </div>
        </div>

        <div 
          className={`relative h-40 overflow-hidden mt-6 ${onClick ? 'cursor-pointer' : ''}`}
          onClick={onClick}
        >
          {images.length > 0 ? (
            <>
              <img
                src={images[currentImageIndex] || images[0]}
                alt={service.titulo}
                className="w-full h-full object-cover"
              />
              {hasMultipleImages && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-gray-400" />
            </div>
          )}

          {/* BOTONES DE ACCIÓN - Con nuevo FavoriteButton */}
          <div className="absolute top-2 right-2 flex flex-col space-y-1 z-10">
            <FavoriteButton 
              itemId={service.id} 
              itemType="service"
              size="sm"
            />
            <button
              onClick={handleShare}
              className="p-1.5 bg-white bg-opacity-90 text-gray-700 rounded-full hover:bg-opacity-100 transition-all backdrop-blur-sm"
            >
              <Share2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="p-3">
          <h3 
            className={`font-semibold text-sm text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight ${onClick ? 'cursor-pointer hover:text-blue-600 dark:hover:text-blue-400' : ''}`}
            onClick={onClick}
          >
            {service.titulo}
          </h3>

          <div className="mb-3">
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {formatearPrecioServicio(service.precio, service.tipoPrecio, service.moneda)}
              </span>
            </div>
          </div>

          <button
            onClick={toggleDetails}
            className="w-full flex items-center justify-between px-2 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors mb-2"
          >
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {showDetails ? 'Ocultar detalles' : 'Ver más detalles'}
            </span>
            {showDetails ? (
              <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showDetails ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="space-y-2 pt-1">
              {service.descripcion && (
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                    {service.descripcion}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                {service.duracion && (
                  <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{formatearDuracion(service.duracion, service.duracionPersonalizada)}</span>
                  </div>
                )}
                
                {service.gestionCupos === 'limitado' && service.cuposDisponibles !== null && (
                  <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                    <Users className="w-3 h-3 mr-1" />
                    <span>{service.cuposDisponibles} cupos</span>
                  </div>
                )}

                {service.modalidad && (
                  <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                    {getModalidadIcon(service.modalidad)}
                    <span className="ml-1">{formatearModalidad(service.modalidad)}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((starNumber) => {
                    const rating = service.valoraciones?.promedio || 0;
                    const isFilled = starNumber <= Math.floor(rating);
                    
                    return (
                      <Star
                        key={starNumber}
                        className={`w-3 h-3 ${
                          isFilled 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    );
                  })}
                  <span className="text-gray-500 ml-1">
                    ({service.valoraciones?.total || 0})
                  </span>
                </div>
              </div>

              {showStoreInfo && (
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                  <div className="flex items-center space-x-1 min-w-0 flex-1">
                    <Store className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {service.tiendaInfo?.nombre || storeData?.businessName}
                    </span>
                  </div>
                  <button
                    onClick={handleViewStore}
                    className="text-blue-600 hover:text-blue-700 flex-shrink-0 ml-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}

              {showContactInfo && (
                <div className="space-y-1.5 mt-2">
                  {(service.contacto?.whatsapp || storeData?.phone) && (
                    <button
                      onClick={handleWhatsAppContact}
                      className="w-full bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </button>
                  )}
                  
                  <div className="grid grid-cols-2 gap-1">
                    {(service.contacto?.telefono || storeData?.phone) && (
                      <button
                        onClick={handlePhoneContact}
                        className="px-2 py-1.5 border border-blue-300 text-blue-700 dark:text-blue-300 rounded text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Llamar</span>
                      </button>
                    )}
                    
                    {(service.contacto?.email || storeData?.email) && (
                      <button
                        onClick={handleEmailContact}
                        className="px-2 py-1.5 border border-blue-300 text-blue-700 dark:text-blue-300 rounded text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Mail className="w-3 h-3" />
                        <span>Email</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Variante Grid con desplegable
  if (variant === 'grid') {
    return (
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
      >
        <div 
          className={`relative h-64 overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}
          onClick={onClick}
        >
          {images.length > 0 ? (
            <>
              <img
                src={images[currentImageIndex] || images[0]}
                alt={service.titulo}
                className="w-full h-full object-cover transition-transform duration-300"
              />
              {hasMultipleImages && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
              <Briefcase className="w-16 h-16 text-gray-400" />
            </div>
          )}

          {/* BOTONES DE ACCIÓN - Con nuevo FavoriteButton */}
          <div className="absolute top-3 right-3 flex flex-col space-y-2 z-10">
            <FavoriteButton 
              itemId={service.id} 
              itemType="service"
              size="md"
            />
            <button
              onClick={handleShare}
              className="p-2 bg-white bg-opacity-90 text-gray-700 rounded-full hover:bg-opacity-100 transition-all backdrop-blur-sm"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-5">
          <h3 
            className={`font-bold text-lg text-gray-900 dark:text-white mb-3 line-clamp-2 leading-tight ${onClick ? 'cursor-pointer hover:text-blue-600 dark:hover:text-blue-400' : ''}`}
            onClick={onClick}
          >
            {service.titulo}
          </h3>

          <div className="mb-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatearPrecioServicio(service.precio, service.tipoPrecio, service.moneda)}
              </span>
            </div>
          </div>

          <button
            onClick={toggleDetails}
            className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors mb-3"
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {showDetails ? 'Ocultar detalles' : 'Ver más detalles'}
            </span>
            {showDetails ? (
              <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showDetails ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="space-y-4 pt-2">
              {service.descripcion && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Descripción
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {service.descripcion}
                  </p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Información del servicio
                </h4>
                <div className="space-y-2">
                  {service.duracion && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{formatearDuracion(service.duracion, service.duracionPersonalizada)}</span>
                    </div>
                  )}
                  
                  {service.gestionCupos === 'limitado' && service.cuposDisponibles !== null && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{service.cuposDisponibles} cupos disponibles</span>
                    </div>
                  )}
                  
                  {service.ubicacion && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{service.ubicacion}</span>
                    </div>
                  )}

                  {service.modalidad && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      {getModalidadIcon(service.modalidad)}
                      <span className="ml-2">{formatearModalidad(service.modalidad)}</span>
                    </div>
                  )}
                </div>
              </div>

              {(service.diasDisponibles?.length > 0 || service.horarios?.length > 0) && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Disponibilidad
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 space-y-2">
                    {service.diasDisponibles?.length > 0 && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatearDiasDisponibles(service.diasDisponibles)}</span>
                      </div>
                    )}
                    
                    {service.horarios?.length > 0 && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{formatearHorarios(service.horarios, service.horarioPersonalizado)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {service.palabrasClave && service.palabrasClave.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Etiquetas
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {service.palabrasClave.map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-block px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full"
                      >
                        #{keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {service.valoraciones && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Valoraciones
                  </h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((starNumber) => {
                        const rating = service.valoraciones?.promedio || 0;
                        const isFilled = starNumber <= Math.floor(rating);
                        
                        return (
                          <Star
                            key={starNumber}
                            className={`w-4 h-4 ${
                              isFilled 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {service.valoraciones?.promedio?.toFixed(1) || '0.0'} ({service.valoraciones?.total || 0} reseñas)
                    </span>
                  </div>
                </div>
              )}

              {showStoreInfo && (service.tiendaInfo?.nombre || storeData?.businessName) && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Proveedor del servicio
                  </h4>
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Store className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {service.tiendaInfo?.nombre || storeData?.businessName}
                      </span>
                    </div>
                    <button
                      onClick={handleViewStore}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {showContactInfo && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Contactar proveedor
                  </h4>
                  <div className="space-y-2">
                    {(service.contacto?.whatsapp || storeData?.phone) && (
                      <button
                        onClick={handleWhatsAppContact}
                        className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>Contactar por WhatsApp</span>
                      </button>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2">
                      {(service.contacto?.telefono || storeData?.phone) && (
                        <button
                          onClick={handlePhoneContact}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Llamar</span>
                        </button>
                      )}
                      
                      {(service.contacto?.email || storeData?.email) && (
                        <button
                          onClick={handleEmailContact}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Mail className="w-4 h-4" />
                          <span>Email</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}