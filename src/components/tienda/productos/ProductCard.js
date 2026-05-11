// src/components/tienda/productos/ProductCard.js
'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Share2,
  MessageCircle,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Star,
  Package,
  Truck,
  MapPin,
  Store,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Crown
} from 'lucide-react';
import {
  formatearPrecio,
  TIPOS_PRECIO
} from '../../../types/product';
import {
  doc,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import FavoriteButton from '@/components/ui/FavoriteButton';

export default function ProductCard({
  product,
  storeData,
  variant = 'grid',
  showContactInfo = true,
  showStoreInfo = true,
  onClick = null
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  if (!product) return null;

  const images = product.imagenes || [];
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleWhatsAppContact = (e) => {
    e.stopPropagation();
    const phone = product.contacto?.whatsapp || storeData?.phone || '';
    const message = product.contacto?.mensaje ||
      `Hola! Me interesa tu producto: ${product.titulo || product.nombre}`;
    const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handlePhoneContact = (e) => {
    e.stopPropagation();
    const phone = product.contacto?.telefono || storeData?.phone || '';
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmailContact = (e) => {
    e.stopPropagation();
    const email = product.contacto?.email || storeData?.email || '';
    const subject = `Consulta sobre: ${product.titulo || product.nombre}`;
    const body = `Hola! Me interesa tu producto: ${product.titulo || product.nombre}\n\nPodrías darme más información?`;
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const productUrl = `${window.location.origin}/tienda/${product.tiendaInfo?.slug || storeData?.storeSlug}/producto/${product.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.titulo || product.nombre,
          text: product.descripcion,
          url: productUrl,
        });

        const productRef = doc(db, 'productos', product.id);
        await updateDoc(productRef, {
          'interacciones.compartidas': increment(1)
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(productUrl);
      alert('Enlace copiado al portapapeles');
    }
  };

  const handleViewStore = (e) => {
    e.stopPropagation();
    const storeUrl = `https://laferia.vercel.app/tienda/${product.tiendaInfo?.slug || storeData?.storeSlug}`;
    window.open(storeUrl, '_blank');
  };

  const toggleDetails = (e) => {
    e.stopPropagation();
    setShowDetails(!showDetails);
  };

  // Variante FEATURED COMPACT con desplegable
  if (variant === 'featured-compact') {
    return (
      <div
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-orange-200 dark:border-orange-700"
      >
        <div className="absolute top-0 left-0 right-0 z-20">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-2 py-1 text-center">
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
              <Image
                src={images[currentImageIndex] || images[0]}
                alt={product.titulo || product.nombre}
                fill
                className="object-cover"
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
              <Package className="w-8 h-8 text-gray-400" />
            </div>
          )}

          {/* BOTONES DE ACCIÓN - Con nuevo FavoriteButton */}
          <div className="absolute top-2 right-2 flex flex-col space-y-1 z-10">
            <FavoriteButton
              itemId={product.id}
              itemType="product"
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
            className={`font-semibold text-sm text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight ${onClick ? 'cursor-pointer hover:text-orange-600 dark:hover:text-orange-400' : ''}`}
            onClick={onClick}
          >
            {product.titulo || product.nombre}
          </h3>

          <div className="mb-3">
            {product.tipoPrecio === TIPOS_PRECIO.FIJO ? (
              <div className="flex items-baseline space-x-1">
                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {formatearPrecio(product.precio, product.moneda)}
                </span>
                {product.precioAnterior && (
                  <span className="text-xs text-gray-500 line-through">
                    {formatearPrecio(product.precioAnterior, product.moneda)}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
                {product.tipoPrecio === 'negociable' && 'Negociable'}
                {product.tipoPrecio === 'consultar' && 'Consultar'}
                {product.tipoPrecio === 'gratis' && 'Gratis'}
              </span>
            )}
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
            className={`overflow-hidden transition-all duration-300 ease-in-out ${showDetails ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
              }`}
          >
            <div className="space-y-2 pt-1">
              {product.descripcion && (
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                    {product.descripcion}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((starNumber) => {
                    const rating = product.valoraciones?.promedio || 0;
                    const isFilled = starNumber <= Math.floor(rating);

                    return (
                      <Star
                        key={starNumber}
                        className={`w-3 h-3 ${isFilled
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 dark:text-gray-600'
                          }`}
                      />
                    );
                  })}
                  <span className="text-gray-500 ml-1">
                    ({product.valoraciones?.total || 0})
                  </span>
                </div>
              </div>

              {showStoreInfo && (
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                  <div className="flex items-center space-x-1 min-w-0 flex-1">
                    <Store className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {product.tiendaInfo?.nombre || storeData?.businessName}
                    </span>
                  </div>
                  <button
                    onClick={handleViewStore}
                    className="text-orange-600 hover:text-orange-700 flex-shrink-0 ml-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}

              {(product.entrega?.enLocal || product.entrega?.delivery) && (
                <div className="flex flex-wrap gap-1">
                  {product.entrega?.enLocal && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200">
                      <MapPin className="w-2.5 h-2.5 mr-0.5" />
                      Local
                    </span>
                  )}
                  {product.entrega?.delivery && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200">
                      <Truck className="w-2.5 h-2.5 mr-0.5" />
                      Delivery
                    </span>
                  )}
                </div>
              )}

              {showContactInfo && (
                <div className="space-y-1.5 mt-2">
                  {(product.contacto?.whatsapp || storeData?.phone) && (
                    <button
                      onClick={handleWhatsAppContact}
                      className="w-full bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-1">
                    {(product.contacto?.telefono || storeData?.phone) && (
                      <button
                        onClick={handlePhoneContact}
                        className="px-2 py-1.5 border border-orange-300 text-orange-700 dark:text-orange-300 rounded text-xs hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Llamar</span>
                      </button>
                    )}

                    {(product.contacto?.email || storeData?.email) && (
                      <button
                        onClick={handleEmailContact}
                        className="px-2 py-1.5 border border-orange-300 text-orange-700 dark:text-orange-300 rounded text-xs hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors flex items-center justify-center space-x-1"
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
              <Image
                src={images[currentImageIndex] || images[0]}
                alt={product.titulo || product.nombre}
                fill
                className="object-cover transition-transform duration-300"
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
              <Package className="w-16 h-16 text-gray-400" />
            </div>
          )}

          {/* BOTONES DE ACCIÓN - Con nuevo FavoriteButton */}
          <div className="absolute top-3 right-3 flex flex-col space-y-2 z-10">
            <FavoriteButton
              itemId={product.id}
              itemType="product"
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
            className={`font-bold text-lg text-gray-900 dark:text-white mb-3 line-clamp-2 leading-tight ${onClick ? 'cursor-pointer hover:text-orange-600 dark:hover:text-orange-400' : ''}`}
            onClick={onClick}
          >
            {product.titulo || product.nombre}
          </h3>

          <div className="mb-4">
            {product.tipoPrecio === TIPOS_PRECIO.FIJO ? (
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatearPrecio(product.precio, product.moneda)}
                </span>
                {product.precioAnterior && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatearPrecio(product.precioAnterior, product.moneda)}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xl font-semibold text-gray-700 dark:text-gray-300 capitalize">
                {product.tipoPrecio === 'negociable' && 'Precio negociable'}
                {product.tipoPrecio === 'consultar' && 'Consultar precio'}
                {product.tipoPrecio === 'gratis' && 'Gratis'}
              </span>
            )}
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
            className={`overflow-hidden transition-all duration-300 ease-in-out ${showDetails ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
              }`}
          >
            <div className="space-y-4 pt-2">
              {product.descripcion && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Descripción
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {product.descripcion}
                  </p>
                </div>
              )}

              {product.valoraciones && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Valoraciones
                  </h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((starNumber) => {
                        const rating = product.valoraciones?.promedio || 0;
                        const isFilled = starNumber <= Math.floor(rating);

                        return (
                          <Star
                            key={starNumber}
                            className={`w-4 h-4 ${isFilled
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300 dark:text-gray-600'
                              }`}
                          />
                        );
                      })}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {product.valoraciones?.promedio?.toFixed(1) || '0.0'} ({product.valoraciones?.total || 0} reseñas)
                    </span>
                  </div>
                </div>
              )}

              {showStoreInfo && (product.tiendaInfo?.nombre || storeData?.businessName) && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Vendido por
                  </h4>
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Store className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {product.tiendaInfo?.nombre || storeData?.businessName}
                      </span>
                    </div>
                    <button
                      onClick={handleViewStore}
                      className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {(product.entrega?.enLocal || product.entrega?.delivery) && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Opciones de entrega
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {product.entrega?.enLocal && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200">
                        <MapPin className="w-4 h-4 mr-1.5" />
                        Retiro en local
                      </span>
                    )}
                    {product.entrega?.delivery && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200">
                        <Truck className="w-4 h-4 mr-1.5" />
                        Delivery disponible
                      </span>
                    )}
                  </div>
                </div>
              )}

              {showContactInfo && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Contactar vendedor
                  </h4>
                  <div className="space-y-2">
                    {(product.contacto?.whatsapp || storeData?.phone) && (
                      <button
                        onClick={handleWhatsAppContact}
                        className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>Contactar por WhatsApp</span>
                      </button>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      {(product.contacto?.telefono || storeData?.phone) && (
                        <button
                          onClick={handlePhoneContact}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Llamar</span>
                        </button>
                      )}

                      {(product.contacto?.email || storeData?.email) && (
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