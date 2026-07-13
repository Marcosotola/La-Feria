// src/components/tienda/empleos/ServicioProfesionalCard.js
'use client';

import { useState } from 'react';
import {
  Share2,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Wrench,
  Award,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Calendar,
  Star
} from 'lucide-react';
import { formatearSalario } from '@/types/employment';
import FavoriteButton from '@/components/ui/FavoriteButton';

export default function ServicioProfesionalCard({
  servicio,
  storeData,
  variant = 'grid',
  showContactInfo = true,
  showStoreInfo = true,
  onClick = null
}) {
  const [showDetails, setShowDetails] = useState(false);

  if (!servicio) return null;

  const handleWhatsAppContact = (e) => {
    e.stopPropagation();
    const phone = servicio.contacto?.whatsapp || storeData?.phoneNumber || '';
    const message = `Hola! Me interesa tu servicio: ${servicio.titulo}`;
    const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handlePhoneContact = (e) => {
    e.stopPropagation();
    const phone = servicio.contacto?.telefono || storeData?.phoneNumber || '';
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmailContact = (e) => {
    e.stopPropagation();
    const email = servicio.contacto?.email || storeData?.email || '';
    const subject = `Consulta sobre: ${servicio.titulo}`;
    const body = `Hola! Me interesa tu servicio profesional: ${servicio.titulo}`;
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const servicioUrl = `${window.location.origin}/empleos/${servicio.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: servicio.titulo,
          text: servicio.descripcion,
          url: servicioUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(servicioUrl);
      alert('Enlace copiado al portapapeles');
    }
  };

  const toggleDetails = (e) => {
    e.stopPropagation();
    setShowDetails(!showDetails);
  };

  // Formatear ubicación
  const formatearUbicacion = (ubicacion) => {
    if (!ubicacion) return '';
    if (typeof ubicacion === 'string') return ubicacion;
    return [
      ubicacion.direccion,
      ubicacion.ciudad,
      ubicacion.provincia,
      ubicacion.pais
    ].filter(Boolean).join(', ');
  };

  // Variante Grid
  if (variant === 'grid') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header con ícono y acciones */}
        <div 
          className={`relative bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-6 ${onClick ? 'cursor-pointer' : ''}`}
          onClick={onClick}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg">
                <Wrench className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 line-clamp-2 leading-tight">
                  {servicio.titulo}
                </h3>
                {servicio.especialidad && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {servicio.especialidad}
                  </p>
                )}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col space-y-2 ml-3">
              <FavoriteButton
                itemId={servicio.id}
                itemType="empleo"
                size="md"
              />
              <button
                onClick={handleShare}
                className="p-2 bg-white bg-opacity-90 text-gray-700 rounded-full hover:bg-opacity-100 transition-all backdrop-blur-sm shadow-md"
                title="Compartir"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="p-5">
          {/* Info rápida con badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Tarifa/Tarifas - CORREGIDO */}
            {servicio.tarifas && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-lg text-sm font-medium">
                <DollarSign className="w-4 h-4" />
                {formatearSalario(servicio.tarifas)}
              </span>
            )}
            {servicio.disponibilidadHoraria && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg text-sm font-medium">
                <Clock className="w-4 h-4" />
                {servicio.disponibilidadHoraria}
              </span>
            )}
            {servicio.experienciaAnios !== undefined && servicio.experienciaAnios !== null && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-200 rounded-lg text-sm font-medium">
                <Award className="w-4 h-4" />
                {servicio.experienciaAnios} años exp.
              </span>
            )}
            {/* También manejar experiencia.años si existe */}
            {servicio.experiencia?.años !== undefined && servicio.experiencia?.años !== null && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-200 rounded-lg text-sm font-medium">
                <Award className="w-4 h-4" />
                {servicio.experiencia.años} años exp.
              </span>
            )}
          </div>

          {/* Ubicación */}
          {servicio.ubicacion && (
            <div className="mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{formatearUbicacion(servicio.ubicacion)}</span>
              </div>
            </div>
          )}

          {/* Botón desplegable de detalles */}
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

          {/* Detalles desplegables */}
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showDetails ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="space-y-4 pt-2">
              {/* Descripción */}
              {servicio.descripcion && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Descripción del servicio
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {servicio.descripcion}
                  </p>
                </div>
              )}

              {/* Certificaciones */}
              {servicio.certificaciones?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Certificaciones
                  </h4>
                  <ul className="space-y-1">
                    {servicio.certificaciones.map((cert, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span className="text-purple-600 mt-1">•</span>
                        <span>{cert}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Información de contacto */}
              {showContactInfo && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Contactar profesional
                  </h4>
                  <div className="space-y-2">
                    {(servicio.contacto?.whatsapp || storeData?.phoneNumber) && (
                      <button
                        onClick={handleWhatsAppContact}
                        className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>Contactar por WhatsApp</span>
                      </button>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2">
                      {(servicio.contacto?.telefono || storeData?.phoneNumber) && (
                        <button
                          onClick={handlePhoneContact}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Llamar</span>
                        </button>
                      )}
                      
                      {(servicio.contacto?.email || storeData?.email) && (
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

          {/* Fecha de publicación */}
          {servicio.fechaCreacion && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Calendar className="w-3 h-3" />
              <span>
                Publicado: {new Date(servicio.fechaCreacion.seconds * 1000).toLocaleDateString('es-AR')}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}