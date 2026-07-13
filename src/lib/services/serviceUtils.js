// src/lib/services/serviceUtils.js

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  doc,
  getDoc,
  updateDoc,
  increment,
  serverTimestamp,
  startAfter
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { ESTADOS_SERVICIO, GESTION_CUPOS } from '@/types/service';

/**
 * Obtiene servicios de una tienda con filtros
 */
export const getStoreServices = async (storeId, options = {}) => {
  try {
    const {
      categoria = null,
      modalidad = null,
      estado = ESTADOS_SERVICIO.DISPONIBLE,
      limite = 20,
      ordenarPor = 'fechaCreacion',
      orden = 'desc',
      lastVisible = null
    } = options;

    const servicesRef = collection(db, 'servicios');
    let q = query(
      servicesRef,
      where('storeId', '==', storeId)
    );

    // Filtro por estado
    if (estado) {
      q = query(q, where('estado', '==', estado));
    }

    // Filtro por categoría
    if (categoria) {
      q = query(q, where('categoria', '==', categoria));
    }

    // Filtro por modalidad
    if (modalidad) {
      q = query(q, where('modalidad', '==', modalidad));
    }

    // Ordenamiento
    q = query(q, orderBy(ordenarPor, orden));

    // Paginación
    if (lastVisible) {
      q = query(q, startAfter(lastVisible));
    }

    // Límite
    q = query(q, limit(limite));

    const querySnapshot = await getDocs(q);
    const services = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      services,
      lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1],
      hasMore: querySnapshot.docs.length === limite
    };
  } catch (error) {
    console.error('Error obteniendo servicios:', error);
    throw error;
  }
};

/**
 * Obtiene un servicio específico por ID
 */
export const getServiceById = async (serviceId) => {
  try {
    const serviceDoc = await getDoc(doc(db, 'servicios', serviceId));
    if (serviceDoc.exists()) {
      return {
        id: serviceDoc.id,
        ...serviceDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo servicio:', error);
    throw error;
  }
};

/**
 * Incrementa las vistas de un servicio
 */
export const incrementServiceViews = async (serviceId) => {
  try {
    const serviceRef = doc(db, 'servicios', serviceId);
    await updateDoc(serviceRef, {
      'interacciones.vistas': increment(1),
      totalVistas: increment(1),
      fechaUltimaVista: serverTimestamp()
    });
  } catch (error) {
    console.error('Error incrementando vistas:', error);
  }
};

/**
 * Incrementa las reservas de un servicio
 */
export const incrementServiceBookings = async (serviceId, cantidad = 1) => {
  try {
    const serviceRef = doc(db, 'servicios', serviceId);
    await updateDoc(serviceRef, {
      totalReservas: increment(cantidad),
      fechaUltimaReserva: serverTimestamp()
    });
  } catch (error) {
    console.error('Error incrementando reservas:', error);
  }
};

/**
 * Actualiza los cupos disponibles de un servicio
 */
export const updateServiceCupos = async (serviceId, newCupos) => {
  try {
    const serviceRef = doc(db, 'servicios', serviceId);
    const updateData = {
      cuposDisponibles: newCupos,
      fechaActualizacion: serverTimestamp()
    };

    // Si los cupos llegan a 0, cambiar estado a agotado
    if (newCupos <= 0) {
      updateData.estado = ESTADOS_SERVICIO.AGOTADO;
    }

    await updateDoc(serviceRef, updateData);
  } catch (error) {
    console.error('Error actualizando cupos:', error);
    throw error;
  }
};

/**
 * Busca servicios por texto
 */
export const searchServices = async (storeId, searchTerm, options = {}) => {
  try {
    const {
      categoria = null,
      modalidad = null,
      limite = 20
    } = options;

    // Obtener todos los servicios de la tienda
    const servicesRef = collection(db, 'servicios');
    let q = query(
      servicesRef,
      where('storeId', '==', storeId),
      where('estado', '==', ESTADOS_SERVICIO.DISPONIBLE)
    );

    if (categoria) {
      q = query(q, where('categoria', '==', categoria));
    }

    if (modalidad) {
      q = query(q, where('modalidad', '==', modalidad));
    }

    q = query(q, limit(100)); // Obtener más para filtrar localmente

    const querySnapshot = await getDocs(q);
    const allServices = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filtrar por término de búsqueda
    const searchLower = searchTerm.toLowerCase();
    const filteredServices = allServices.filter(service =>
      service.titulo.toLowerCase().includes(searchLower) ||
      service.descripcion.toLowerCase().includes(searchLower) ||
      service.palabrasClave?.some(keyword => 
        keyword.toLowerCase().includes(searchLower)
      ) ||
      service.ubicacion?.toLowerCase().includes(searchLower)
    );

    return filteredServices.slice(0, limite);
  } catch (error) {
    console.error('Error buscando servicios:', error);
    throw error;
  }
};

/**
 * Obtiene servicios relacionados (misma categoría)
 */
export const getRelatedServices = async (service, limite = 4) => {
  try {
    const servicesRef = collection(db, 'servicios');
    const q = query(
      servicesRef,
      where('storeId', '==', service.storeId),
      where('categoria', '==', service.categoria),
      where('estado', '==', ESTADOS_SERVICIO.DISPONIBLE),
      limit(limite + 1) // +1 para excluir el servicio actual
    );

    const querySnapshot = await getDocs(q);
    const services = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(s => s.id !== service.id) // Excluir el servicio actual
      .slice(0, limite);

    return services;
  } catch (error) {
    console.error('Error obteniendo servicios relacionados:', error);
    return [];
  }
};

/**
 * Obtiene servicios destacados de una tienda
 */
export const getFeaturedServices = async (storeId, limite = 6) => {
  try {
    const servicesRef = collection(db, 'servicios');
    const q = query(
      servicesRef,
      where('storeId', '==', storeId),
      where('estado', '==', ESTADOS_SERVICIO.DISPONIBLE),
      orderBy('totalReservas', 'desc'),
      orderBy('fechaCreacion', 'desc'),
      limit(limite)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error obteniendo servicios destacados:', error);
    return [];
  }
};

/**
 * Obtiene estadísticas de servicios de una tienda
 */
export const getServiceStats = async (storeId) => {
  try {
    const servicesRef = collection(db, 'servicios');
    const q = query(servicesRef, where('storeId', '==', storeId));
    
    const querySnapshot = await getDocs(q);
    const services = querySnapshot.docs.map(doc => doc.data());

    const stats = {
      total: services.length,
      disponibles: services.filter(s => s.estado === ESTADOS_SERVICIO.DISPONIBLE).length,
      agotados: services.filter(s => s.estado === ESTADOS_SERVICIO.AGOTADO).length,
      pausados: services.filter(s => s.estado === ESTADOS_SERVICIO.PAUSADO).length,
      cuposLimitados: services.filter(s => 
        s.gestionCupos === GESTION_CUPOS.LIMITADO && 
        s.cuposDisponibles <= 5 && 
        s.cuposDisponibles > 0
      ).length,
      sinCupos: services.filter(s => 
        s.gestionCupos === GESTION_CUPOS.LIMITADO && s.cuposDisponibles === 0
      ).length,
      totalReservas: services.reduce((sum, s) => sum + (s.totalReservas || 0), 0),
      totalVistas: services.reduce((sum, s) => sum + (s.totalVistas || 0), 0),
      // Estadísticas por modalidad
      modalidades: {
        presencial: services.filter(s => s.modalidad === 'presencial').length,
        domicilio: services.filter(s => s.modalidad === 'domicilio').length,
        virtual: services.filter(s => s.modalidad === 'virtual').length,
        hibrido: services.filter(s => s.modalidad === 'hibrido').length
      },
      // Estadísticas por tipo de precio
      tiposPrecios: {
        fijo: services.filter(s => s.tipoPrecio === 'fijo').length,
        porHora: services.filter(s => s.tipoPrecio === 'por_hora').length,
        porDia: services.filter(s => s.tipoPrecio === 'por_dia').length,
        negociable: services.filter(s => s.tipoPrecio === 'negociable').length,
        gratis: services.filter(s => s.tipoPrecio === 'gratis').length
      }
    };

    return stats;
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return {
      total: 0,
      disponibles: 0,
      agotados: 0,
      pausados: 0,
      cuposLimitados: 0,
      sinCupos: 0,
      totalReservas: 0,
      totalVistas: 0,
      modalidades: { presencial: 0, domicilio: 0, virtual: 0, hibrido: 0 },
      tiposPrecios: { fijo: 0, porHora: 0, porDia: 0, negociable: 0, gratis: 0 }
    };
  }
};

/**
 * Valida si un servicio puede ser reservado
 */
export const isServiceAvailable = (service) => {
  if (service.estado !== ESTADOS_SERVICIO.DISPONIBLE) {
    return false;
  }

  // Verificar cupos
  if (service.gestionCupos === GESTION_CUPOS.LIMITADO && service.cuposDisponibles <= 0) {
    return false;
  }

  if (service.gestionCupos === GESTION_CUPOS.UNICO && service.totalReservas > 0) {
    return false;
  }

  return true;
};

/**
 * Verifica si un servicio está disponible en un día específico
 */
export const isServiceAvailableOnDay = (service, dayOfWeek) => {
  if (!isServiceAvailable(service)) return false;

  // Si no tiene días especificados, está disponible todos los días
  if (!service.diasDisponibles || service.diasDisponibles.length === 0) {
    return true;
  }

  return service.diasDisponibles.includes(dayOfWeek);
};

/**
 * Obtiene los servicios disponibles para un día específico
 */
export const getServicesForDay = async (storeId, dayOfWeek, options = {}) => {
  try {
    const { services } = await getStoreServices(storeId, {
      ...options,
      estado: ESTADOS_SERVICIO.DISPONIBLE
    });

    return services.filter(service => isServiceAvailableOnDay(service, dayOfWeek));
  } catch (error) {
    console.error('Error obteniendo servicios para el día:', error);
    return [];
  }
};

/**
 * Formatea el mensaje de WhatsApp para un servicio
 */
export const formatWhatsAppMessage = (service, storeData) => {
  const baseMessage = service.contacto?.mensaje || 
    `Hola! Me interesa tu servicio: ${service.titulo}`;
  
  const serviceUrl = `${window.location.origin}/tienda/${storeData.storeSlug}/servicio/${service.slug || service.id}`;
  
  return `${baseMessage}\n\nVer servicio: ${serviceUrl}`;
};

/**
 * Genera URL de contacto de WhatsApp para servicios
 */
export const getWhatsAppUrl = (service, storeData) => {
  const phone = service.contacto?.whatsapp || storeData?.phoneNumber || '';
  const cleanPhone = phone.replace(/\D/g, '');
  const message = formatWhatsAppMessage(service, storeData);
  
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

/**
 * Reserva un cupo de servicio
 */
export const bookService = async (serviceId, clientData, cuposReservados = 1) => {
  try {
    // Primero verificar disponibilidad
    const service = await getServiceById(serviceId);
    if (!service) {
      throw new Error('Servicio no encontrado');
    }

    if (!isServiceAvailable(service)) {
      throw new Error('Servicio no disponible');
    }

    if (service.gestionCupos === GESTION_CUPOS.LIMITADO && 
        service.cuposDisponibles < cuposReservados) {
      throw new Error('No hay suficientes cupos disponibles');
    }

    // Crear la reserva
    const reservaData = {
      servicioId,
      clienteId: clientData.uid,
      clienteInfo: {
        nombre: clientData.nombre,
        email: clientData.email,
        telefono: clientData.telefono || ''
      },
      cuposReservados,
      fechaReserva: serverTimestamp(),
      estado: 'pendiente', // pendiente, confirmada, cancelada, completada
      notas: clientData.notas || ''
    };

    // Guardar reserva
    const reservaRef = await addDoc(collection(db, 'reservas'), reservaData);

    // Actualizar cupos del servicio
    const newCupos = service.gestionCupos === GESTION_CUPOS.LIMITADO 
      ? service.cuposDisponibles - cuposReservados 
      : service.cuposDisponibles;

    await updateServiceCupos(serviceId, newCupos);
    await incrementServiceBookings(serviceId, cuposReservados);

    return {
      id: reservaRef.id,
      ...reservaData
    };

  } catch (error) {
    console.error('Error reservando servicio:', error);
    throw error;
  }
};

/**
 * Cancela una reserva de servicio
 */
export const cancelServiceBooking = async (reservaId) => {
  try {
    const reservaRef = doc(db, 'reservas', reservaId);
    const reservaDoc = await getDoc(reservaRef);
    
    if (!reservaDoc.exists()) {
      throw new Error('Reserva no encontrada');
    }

    const reservaData = reservaDoc.data();
    
    // Actualizar estado de la reserva
    await updateDoc(reservaRef, {
      estado: 'cancelada',
      fechaCancelacion: serverTimestamp()
    });

    // Restaurar cupos si es necesario
    const service = await getServiceById(reservaData.servicioId);
    if (service && service.gestionCupos === GESTION_CUPOS.LIMITADO) {
      const newCupos = service.cuposDisponibles + reservaData.cuposReservados;
      await updateServiceCupos(reservaData.servicioId, newCupos);
    }

    return true;
  } catch (error) {
    console.error('Error cancelando reserva:', error);
    throw error;
  }
};

/**
 * Obtiene las reservas de un servicio
 */
export const getServiceBookings = async (serviceId, options = {}) => {
  try {
    const {
      estado = null,
      limite = 50,
      ordenarPor = 'fechaReserva',
      orden = 'desc'
    } = options;

    const reservasRef = collection(db, 'reservas');
    let q = query(
      reservasRef,
      where('servicioId', '==', serviceId)
    );

    if (estado) {
      q = query(q, where('estado', '==', estado));
    }

    q = query(q, orderBy(ordenarPor, orden), limit(limite));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error obteniendo reservas:', error);
    return [];
  }
};

/**
 * Obtiene servicios filtrados por múltiples criterios
 */
export const getFilteredServices = async (storeId, filters = {}) => {
  try {
    const {
      categoria,
      modalidad,
      diasDisponibles = [],
      precioMin,
      precioMax,
      soloConCupos = false,
      ordenarPor = 'fechaCreacion',
      orden = 'desc',
      limite = 20
    } = filters;

    const { services } = await getStoreServices(storeId, {
      categoria,
      modalidad,
      limite: 100, // Obtener más para filtrar localmente
      ordenarPor,
      orden
    });

    let filteredServices = services;

    // Filtrar por días disponibles
    if (diasDisponibles.length > 0) {
      filteredServices = filteredServices.filter(service => {
        if (!service.diasDisponibles || service.diasDisponibles.length === 0) {
          return true; // Servicios sin días específicos están disponibles siempre
        }
        return diasDisponibles.some(dia => service.diasDisponibles.includes(dia));
      });
    }

    // Filtrar por rango de precio
    if (precioMin !== undefined || precioMax !== undefined) {
      filteredServices = filteredServices.filter(service => {
        if (service.tipoPrecio !== 'fijo' && 
            service.tipoPrecio !== 'por_hora' && 
            service.tipoPrecio !== 'por_dia' &&
            service.tipoPrecio !== 'por_sesion') {
          return true; // Incluir servicios sin precio fijo
        }
        
        const precio = service.precio || 0;
        const cumplePrecioMin = precioMin === undefined || precio >= precioMin;
        const cumplePrecioMax = precioMax === undefined || precio <= precioMax;
        
        return cumplePrecioMin && cumplePrecioMax;
      });
    }

    // Filtrar solo servicios con cupos disponibles
    if (soloConCupos) {
      filteredServices = filteredServices.filter(service => isServiceAvailable(service));
    }

    return filteredServices.slice(0, limite);
  } catch (error) {
    console.error('Error obteniendo servicios filtrados:', error);
    return [];
  }
};