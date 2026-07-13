// src/components/tienda/empleos/OfertaEmpleoCard.js
'use client';

import { useState } from 'react';
import {
  Share2,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Calendar,
  Users,
  Award,
  Crown,
  Star
} from 'lucide-react';
import {
  obtenerNombreCategoria,
  obtenerNombreSubcategoria,
  formatearDias,
  formatearHorarios
} from '@/lib/helpers/employmentHelpers';
import {
  TIPOS_EMPLEO,
  MODALIDADES_TRABAJO,
  NIVELES_EXPERIENCIA,
  formatearSalario,
  TIPOS_PUBLICACION
} from '@/types/employment';
import FavoriteButton from '@/components/ui/FavoriteButton';

export default function OfertaEmpleoCard({
  oferta,
  storeData,
  variant = 'grid',
  showContactInfo = true,
  showStoreInfo = true,
  onClick = null
}) {
  const [showDetails, setShowDetails] = useState(false);

  if (!oferta) return null;

  const handleWhatsAppContact = (e) => {
    e.stopPropagation();
    const phone = oferta.contacto?.whatsapp || storeData?.phoneNumber || '';
    if (!phone) return;
    const message = `Hola! Me interesa postularme para: ${oferta.titulo}`;
    const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handlePhoneContact = (e) => {
    e.stopPropagation();
    const phone = oferta.contacto?.telefono || storeData?.phoneNumber || '';
    if (!phone) return;
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmailContact = (e) => {
    e.stopPropagation();
    const email = oferta.contacto?.email || storeData?.email || '';
    if (!email) return;
    const subject = `Consulta sobre: ${oferta.titulo}`;
    const body = `Hola! Me interesa postularme para: ${oferta.titulo}`;
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const ofertaUrl = `${window.location.origin}/empleos/${oferta.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: oferta.titulo,
          text: oferta.descripcion,
          url: ofertaUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(ofertaUrl);
      alert('Enlace copiado al portapapeles');
    }
  };

  const toggleDetails = (e) => {
    e.stopPropagation();
    setShowDetails(!showDetails);
  };

  const formatearUbicacion = (ubicacion) => {
    if (!ubicacion) return '';
    if (typeof ubicacion === 'string' && ubicacion.trim()) return ubicacion;
    if (typeof ubicacion === 'object') {
      const partes = [
        ubicacion.direccion,
        ubicacion.ciudad,
        ubicacion.provincia,
        ubicacion.pais
      ].filter(parte => parte && parte.trim() !== '');
      return partes.length > 0 ? partes.join(', ') : '';
    }
    return '';
  };

  const getTipoEmpleoNombre = (tipoEmpleo) => {
    if (!tipoEmpleo) return '';
    const tipo = TIPOS_EMPLEO[tipoEmpleo.toUpperCase()];
    if (tipo && typeof tipo === 'object') return tipo.nombre;
    return tipoEmpleo;
  };

  const getModalidadNombre = (modalidad) => {
    if (!modalidad) return '';
    const mod = MODALIDADES_TRABAJO[modalidad.toUpperCase()];
    if (mod && typeof mod === 'object') return mod.nombre;
    return modalidad;
  };

  const getNivelExperienciaNombre = (nivel) => {
    if (!nivel) return '';
    const niv = NIVELES_EXPERIENCIA[nivel.toUpperCase()];
    if (niv && typeof niv === 'object') return niv.nombre;
    return nivel;
  };

  const getJobTypeLabel = () => {
    if (oferta.tipoPublicacion === TIPOS_PUBLICACION.OFERTA_EMPLEO) return 'Oferta';
    if (oferta.tipoPublicacion === TIPOS_PUBLICACION.BUSQUEDA_EMPLEO) return 'Busco';
    if (oferta.tipoPublicacion === TIPOS_PUBLICACION.SERVICIO_PROFESIONAL) return 'Servicio';
    return 'Empleo';
  };

  // ✅ VARIANTE FEATURED COMPACT - Igual que ProductCard
  if (variant === 'featured-compact') {
    return (
      <div 
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-blue-200 dark:border-blue-700"
      >
        {/* Badge DESTACADO arriba */}
        <div className="absolute top-0 left-0 right-0 z-20">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-2 py-1 text-center">
            <div className="flex items-center justify-center space-x-1">
              <Crown className="w-3 h-3" />
              <span className="text-xs font-bold">DESTACADO</span>
            </div>
          </div>
        </div>

        {/* Header con gradiente - h-40 */}
        <div 
          className={`relative h-40 overflow-hidden mt-6 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${onClick ? 'cursor-pointer' : ''}`}
          onClick={onClick}
        >
          <div className="text-white text-center">
            <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-90" />
            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">
              {getJobTypeLabel()}
            </span>
          </div>

          {/* Botones de acción */}
          <div className="absolute top-2 right-2 flex flex-col space-y-1 z-10">
            <FavoriteButton 
              itemId={oferta.id} 
              itemType="empleo"
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

        {/* Contenido - p-3 */}
        <div className="p-3">
          {/* Título */}
          <h3 
            className={`font-semibold text-sm text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight ${onClick ? 'cursor-pointer hover:text-orange-600 dark:hover:text-orange-400' : ''}`}
            onClick={onClick}
          >
            {oferta.titulo}
          </h3>

          {/* Salario - mb-3 */}
          <div className="mb-3">
            {oferta.salario && oferta.salario.tipo !== 'a_convenir' && (oferta.salario.minimo || oferta.salario.maximo) ? (
              <div className="flex items-baseline space-x-1">
                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {formatearSalario(oferta.salario)}
                </span>
              </div>
            ) : (
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                A convenir
              </span>
            )}
          </div>

          {/* Botón desplegable */}
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

          {/* Detalles desplegables */}
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showDetails ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="space-y-2 pt-1">
              {/* Info de tienda */}
              {oferta.tiendaInfo?.nombre && (
                <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400">
                  <Users className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{oferta.tiendaInfo.nombre}</span>
                </div>
              )}

              {/* Descripción */}
              {oferta.descripcion && (
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                  {oferta.descripcion}
                </p>
              )}

              {/* Tags de modalidad y tipo */}
              <div className="flex flex-wrap gap-1">
                {oferta.modalidad && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200">
                    <MapPin className="w-2.5 h-2.5 mr-0.5" />
                    {getModalidadNombre(oferta.modalidad)}
                  </span>
                )}
                {oferta.tipoEmpleo && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200">
                    <Clock className="w-2.5 h-2.5 mr-0.5" />
                    {getTipoEmpleoNombre(oferta.tipoEmpleo)}
                  </span>
                )}
              </div>

              {/* Botones de contacto */}
              {showContactInfo && (
                <div className="space-y-1.5 mt-2">
                  {(oferta.contacto?.whatsapp || storeData?.phoneNumber) && (
                    <button
                      onClick={handleWhatsAppContact}
                      className="w-full bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </button>
                  )}
                  
                  <div className="grid grid-cols-2 gap-1">
                    {(oferta.contacto?.telefono || storeData?.phoneNumber) && (
                      <button
                        onClick={handlePhoneContact}
                        className="px-2 py-1.5 border border-orange-300 text-orange-700 dark:text-orange-300 rounded text-xs hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Llamar</span>
                      </button>
                    )}
                    
                    {(oferta.contacto?.email || storeData?.email) && (
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

  // Variante Grid (principal)
  if (variant === 'grid') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header con ícono y acciones */}
        <div 
          className={`relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-6 ${onClick ? 'cursor-pointer' : ''}`}
          onClick={onClick}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 line-clamp-2 leading-tight">
                  {oferta.titulo}
                </h3>
                {oferta.empresa && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {oferta.empresa}
                  </p>
                )}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col space-y-2 ml-3">
              <FavoriteButton
                itemId={oferta.id}
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
            {oferta.tipoEmpleo && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg text-sm font-medium">
                <Clock className="w-4 h-4" />
                {getTipoEmpleoNombre(oferta.tipoEmpleo)}
              </span>
            )}
            {oferta.modalidad && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 rounded-lg text-sm font-medium">
                <MapPin className="w-4 h-4" />
                {getModalidadNombre(oferta.modalidad)}
              </span>
            )}
            {oferta.nivelExperiencia && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-200 rounded-lg text-sm font-medium">
                <Award className="w-4 h-4" />
                {getNivelExperienciaNombre(oferta.nivelExperiencia)}
              </span>
            )}
          </div>

          {/* Salario destacado */}
          {oferta.salario && 
           typeof oferta.salario === 'object' && 
           (oferta.salario.minimo || oferta.salario.maximo || oferta.salario.tipo !== 'a_convenir') && (
            <div className="mb-4">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatearSalario(oferta.salario)}
                </span>
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
              {oferta.descripcion && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Descripción
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {oferta.descripcion}
                  </p>
                </div>
              )}

              {oferta.ubicacion && formatearUbicacion(oferta.ubicacion) && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Ubicación
                  </h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>{formatearUbicacion(oferta.ubicacion)}</span>
                  </div>
                </div>
              )}

              {oferta.requisitos?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Requisitos
                  </h4>
                  <ul className="space-y-1">
                    {oferta.requisitos.map((req, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {oferta.beneficios?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    Beneficios
                  </h4>
                  <ul className="space-y-1">
                    {oferta.beneficios.map((ben, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        <span>{ben}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {showContactInfo && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Contactar empleador
                  </h4>
                  <div className="space-y-2">
                    {(oferta.contacto?.whatsapp || storeData?.phoneNumber) && (
                      <button
                        onClick={handleWhatsAppContact}
                        className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>Contactar por WhatsApp</span>
                      </button>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2">
                      {(oferta.contacto?.telefono || storeData?.phoneNumber) && (
                        <button
                          onClick={handlePhoneContact}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Llamar</span>
                        </button>
                      )}
                      
                      {(oferta.contacto?.email || storeData?.email) && (
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

          {oferta.fechaCreacion && oferta.fechaCreacion.seconds && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Calendar className="w-3 h-3" />
              <span>
                Publicado: {new Date(oferta.fechaCreacion.seconds * 1000).toLocaleDateString('es-AR')}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}