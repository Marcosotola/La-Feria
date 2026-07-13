// src/types/product.js

// Estados del producto
export const ESTADOS_PRODUCTO = {
  DISPONIBLE: 'disponible',     // Producto en stock y disponible
  AGOTADO: 'agotado',          // Sin stock temporalmente
  PAUSADO: 'pausado',          // Pausado por el vendedor
  INACTIVO: 'inactivo',        // Desactivado
}

// Condición del producto
export const CONDICION_PRODUCTO = {
  NUEVO: 'nuevo',              // Producto nuevo
  USADO: 'usado',              // Producto usado en buen estado
  REACONDICIONADO: 'reacondicionado', // Producto reparado/restaurado
  ARTESANAL: 'artesanal'       // Hecho a mano/artesanal
}

// Tipos de precio
export const TIPOS_PRECIO = {
  FIJO: 'fijo',                // Precio fijo
  NEGOCIABLE: 'negociable',    // Precio negociable
  CONSULTAR: 'consultar',      // Precio a consultar
  GRATIS: 'gratis'             // Producto gratuito
}

// Unidades de medida
export const UNIDADES_MEDIDA = {
  // Peso
  GRAMOS: 'gramos',
  KILOGRAMOS: 'kilogramos',

  // Volumen
  MILILITROS: 'mililitros',
  LITROS: 'litros',

  // Longitud
  CENTIMETROS: 'centimetros',
  METROS: 'metros',

  // Cantidad
  UNIDAD: 'unidad',
  DOCENA: 'docena',
  PACK: 'pack',
  KIT: 'kit',

  // Tiempo (para servicios)
  HORA: 'hora',
  DIA: 'dia',
  MES: 'mes'
}

// Tipos de destacado
export const TIPOS_DESTACADO = {
  NORMAL: 'normal',            // Sin destacar
  PROMOCION: 'promocion',      // En promoción
  NUEVO: 'nuevo',              // Producto nuevo (últimos 30 días)
  DESTACADO: 'destacado',      // Destacado por donación
  URGENTE: 'urgente'           // Venta urgente
}

// Configuraciones de stock
export const GESTION_STOCK = {
  ILIMITADO: 'ilimitado',      // Stock ilimitado
  LIMITADO: 'limitado',        // Stock con cantidad específica
  BAJO_PEDIDO: 'bajo_pedido'   // Se hace bajo pedido
}

// Tipos de descuento
export const TIPOS_DESCUENTO = {
  PORCENTAJE: 'porcentaje',    // Descuento en porcentaje
  MONTO_FIJO: 'monto_fijo',    // Descuento en monto fijo
  PROMOCION_2X1: '2x1',        // Promoción 2x1
  COMBO: 'combo'               // Precio especial por combo
}

// Etiquetas especiales del producto
export const ETIQUETAS_PRODUCTO = {
  ORGANICO: 'organico',
  VEGANO: 'vegano',
  SIN_TACC: 'sin_tacc',
  ARTESANAL: 'artesanal',
  LOCAL: 'local',
  PREMIUM: 'premium',
  ECO_FRIENDLY: 'eco_friendly',
  HECHO_EN_CASA: 'hecho_en_casa'
}

// Tipos de variaciones del producto
export const TIPOS_VARIACION = {
  COLOR: 'color',
  TALLE: 'talle',
  SABOR: 'sabor',
  TAMAÑO: 'tamaño',
  MATERIAL: 'material',
  MODELO: 'modelo'
}

// Métodos de fabricación/obtención
export const ORIGEN_PRODUCTO = {
  PROPIO: 'propio',            // Fabricado por el vendedor
  REVENTA: 'reventa',          // Comprado para revender
  CONSIGNACION: 'consignacion' // En consignación
}

// Categorías predefinidas (se pueden personalizar por tienda)
export const CATEGORIAS_PRODUCTO = {
  ALIMENTOS: 'alimentos',
  BEBIDAS: 'bebidas',
  PANADERIA: 'panaderia',
  DULCES: 'dulces',
  LACTEOS: 'lacteos',
  CARNES: 'carnes',
  VERDURAS: 'verduras',
  FRUTAS: 'frutas',
  ROPA: 'ropa',
  ACCESORIOS: 'accesorios',
  HOGAR: 'hogar',
  DECORACION: 'decoracion',
  ELECTRONICA: 'electronica',
  LIBROS: 'libros',
  JUGUETES: 'juguetes',
  DEPORTES: 'deportes',
  SALUD: 'salud',
  BELLEZA: 'belleza',
  MASCOTAS: 'mascotas',
  JARDIN: 'jardin',
  HERRAMIENTAS: 'herramientas',
  VEHICULOS: 'vehiculos',
  INMUEBLES: 'inmuebles',
  SERVICIOS: 'servicios',
  OTROS: 'otros'
}

// Labels para las categorías
export const CATEGORIAS_PRODUCTO_LABELS = {
  [CATEGORIAS_PRODUCTO.ALIMENTOS]: 'Alimentos',
  [CATEGORIAS_PRODUCTO.BEBIDAS]: 'Bebidas',
  [CATEGORIAS_PRODUCTO.PANADERIA]: 'Panadería',
  [CATEGORIAS_PRODUCTO.DULCES]: 'Dulces y Golosinas',
  [CATEGORIAS_PRODUCTO.LACTEOS]: 'Lácteos',
  [CATEGORIAS_PRODUCTO.CARNES]: 'Carnes',
  [CATEGORIAS_PRODUCTO.VERDURAS]: 'Verduras',
  [CATEGORIAS_PRODUCTO.FRUTAS]: 'Frutas',
  [CATEGORIAS_PRODUCTO.ROPA]: 'Ropa',
  [CATEGORIAS_PRODUCTO.ACCESORIOS]: 'Accesorios',
  [CATEGORIAS_PRODUCTO.HOGAR]: 'Hogar',
  [CATEGORIAS_PRODUCTO.DECORACION]: 'Decoración',
  [CATEGORIAS_PRODUCTO.ELECTRONICA]: 'Electrónica',
  [CATEGORIAS_PRODUCTO.LIBROS]: 'Libros',
  [CATEGORIAS_PRODUCTO.JUGUETES]: 'Juguetes',
  [CATEGORIAS_PRODUCTO.DEPORTES]: 'Deportes',
  [CATEGORIAS_PRODUCTO.SALUD]: 'Salud',
  [CATEGORIAS_PRODUCTO.BELLEZA]: 'Belleza',
  [CATEGORIAS_PRODUCTO.MASCOTAS]: 'Mascotas',
  [CATEGORIAS_PRODUCTO.JARDIN]: 'Jardín',
  [CATEGORIAS_PRODUCTO.HERRAMIENTAS]: 'Herramientas',
  [CATEGORIAS_PRODUCTO.VEHICULOS]: 'Vehículos',
  [CATEGORIAS_PRODUCTO.INMUEBLES]: 'Inmuebles',
  [CATEGORIAS_PRODUCTO.SERVICIOS]: 'Servicios',
  [CATEGORIAS_PRODUCTO.OTROS]: 'Otros'
}

// Tipos de contacto para productos
export const TIPOS_CONTACTO = {
  WHATSAPP: 'whatsapp',
  TELEFONO: 'telefono',
  EMAIL: 'email',
  MENSAJE_DIRECTO: 'mensaje_directo'
}

// Estructura del modelo de producto
export const PRODUCTO_SCHEMA = {
  // Información básica
  id: '',                      // ID único del producto
  storeId: '',                 // ID de la tienda propietaria
  usuarioId: '',               // ID del usuario propietario
  titulo: '',                  // Nombre del producto
  nombre: '',                  // Alias para compatibilidad
  descripcion: '',             // Descripción detallada
  categoria: '',               // Categoría del producto
  subcategoria: '',            // Subcategoría opcional

  // Precios y stock
  precio: 0,                   // Precio principal
  tipoPrecio: TIPOS_PRECIO.FIJO, // Tipo de precio
  precioAnterior: null,        // Precio anterior (para mostrar descuento)
  moneda: 'ARS',              // Moneda
  gestionStock: GESTION_STOCK.ILIMITADO, // Tipo de gestión de stock
  stock: null,                 // Cantidad en stock
  stockMinimo: 0,              // Stock mínimo para alertas

  // Imágenes
  imagenes: [],                // Array de URLs de imágenes (máximo 3)
  imagenPrincipal: '',         // URL de la imagen principal

  // Estado y configuración
  estado: ESTADOS_PRODUCTO.DISPONIBLE, // Estado actual
  condicion: CONDICION_PRODUCTO.NUEVO, // Condición del producto
  tipoDestacado: TIPOS_DESTACADO.NORMAL, // Tipo de destacado

  // Características del producto
  peso: null,                  // Peso del producto
  unidadPeso: UNIDADES_MEDIDA.GRAMOS, // Unidad de peso
  dimensiones: {               // Dimensiones del producto
    largo: null,
    ancho: null,
    alto: null,
    unidad: UNIDADES_MEDIDA.CENTIMETROS
  },

  // Etiquetas y categorización
  etiquetas: [],               // Array de etiquetas especiales
  palabrasClave: [],           // Palabras clave para búsqueda
  origen: ORIGEN_PRODUCTO.PROPIO, // Origen del producto

  // Variaciones del producto
  tieneVariaciones: false,     // Si tiene variaciones
  variaciones: [],             // Array de variaciones

  // Descuentos y promociones
  tieneDescuento: false,       // Si tiene descuento activo
  descuento: {                 // Configuración del descuento
    tipo: null,                // Tipo de descuento (TIPOS_DESCUENTO)
    valor: 0,                  // Valor del descuento
    fechaInicio: null,         // Fecha inicio promoción
    fechaFin: null             // Fecha fin promoción
  },

  // Contacto (se auto-completa desde storeData)
  contacto: {
    whatsapp: '',              // Auto desde storeData.whatsapp
    telefono: '',              // Auto desde storeData.phoneNumber
    email: '',                 // Auto desde storeData.email
    mensaje: ''                // Mensaje predefinido para WhatsApp
  },

  // Configuración de entrega
  entrega: {
    retiroLocal: false,        // Se puede retirar en local
    delivery: false,           // Tiene delivery
    envioCorreo: false,        // Se envía por correo
    zonasCoberturaDelivery: [], // Zonas donde hace delivery
    costoDelivery: 0,          // Costo del delivery
    tiempoPreparacion: '',     // Tiempo de preparación
  },

  // Valoraciones y reseñas
  valoraciones: {
    promedio: 0,               // Promedio de valoraciones (0-5)
    total: 0,                  // Total de valoraciones
    distribucion: {            // Distribución por estrellas
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    }
  },

  // Estadísticas de interacción
  interacciones: {
    vistas: 0,                 // Total de vistas
    favoritos: 0,              // Total de usuarios que lo marcaron favorito
    compartidas: 0,            // Total de veces compartido
    comentarios: 0             // Total de comentarios
  },

  // Información de la tienda (para cards)
  tiendaInfo: {
    nombre: '',                // Auto desde storeData.businessName
    slug: '',                  // Auto desde storeData.storeSlug
    logo: '',                  // Auto desde storeData.storeLogo
    verificada: false,         // Si la tienda está verificada
    ubicacion: ''              // Auto desde storeData.address
  },

  // Metadatos del producto
  fechaCreacion: null,         // Timestamp de creación
  fechaActualizacion: null,    // Timestamp última actualización
  fechaUltimaVenta: null,      // Timestamp última venta
  fechaUltimaVista: null,      // Timestamp última vista
  totalVentas: 0,              // Contador de ventas
  totalVistas: 0,              // Contador de vistas (mantenido por compatibilidad)

  // SEO y búsqueda
  slug: '',                    // URL amigable
  metaDescripcion: '',         // Meta descripción para SEO

  // Control de calidad
  reportes: 0,                 // Número de reportes del producto

  // Campos adicionales personalizables
  camposPersonalizados: {}     // Campos extra definidos por la tienda
}

// Esquema para comentarios de productos
export const COMENTARIO_PRODUCTO_SCHEMA = {
  id: '',                      // ID único del comentario
  productoId: '',              // ID del producto
  usuarioId: '',               // ID del usuario que comenta
  usuario: {                   // Información del usuario
    nombre: '',
    avatar: '',
    verificado: false
  },
  contenido: '',               // Texto del comentario
  valoracion: 0,               // Valoración del 1 al 5
  fechaCreacion: null,         // Timestamp de creación
  respuestas: [],              // Array de respuestas al comentario
  likes: 0,                    // Likes del comentario
  reportado: false,            // Si fue reportado
  aprobado: true               // Si está aprobado por moderación
}

// Esquema para favoritos
export const FAVORITO_SCHEMA = {
  id: '',                      // ID único
  usuarioId: '',               // ID del usuario
  productoId: '',              // ID del producto
  fechaCreacion: null          // Timestamp cuando se marcó favorito
}

// Utilidades para valoraciones
export const calcularPromedioValoraciones = (comentarios) => {
  if (!comentarios || comentarios.length === 0) return 0;
  const suma = comentarios.reduce((acc, c) => acc + (c.valoracion || 0), 0);
  return Math.round((suma / comentarios.length) * 10) / 10; // Redondear a 1 decimal
}

export const calcularDistribucionValoraciones = (comentarios) => {
  const distribucion = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  if (!comentarios || comentarios.length === 0) return distribucion;

  comentarios.forEach(c => {
    if (c.valoracion >= 1 && c.valoracion <= 5) {
      distribucion[c.valoracion]++;
    }
  });

  return distribucion;
}

// Utilidad para auto-completar datos desde storeData
export const autoCompletarDatosProducto = (productData, storeData) => {
  return {
    ...productData,
    contacto: {
      whatsapp: productData.contacto?.whatsapp || storeData?.whatsapp || storeData?.phoneNumber || '',
      telefono: productData.contacto?.telefono || storeData?.phoneNumber || '',
      email: productData.contacto?.email || storeData?.email || '',
      mensaje: productData.contacto?.mensaje || `Hola! Me interesa tu producto: ${productData.titulo}`
    },
    tiendaInfo: {
      nombre: storeData?.businessName || storeData?.familyName || '',
      slug: storeData?.storeSlug || '',
      logo: storeData?.storeLogo || '',
      verificada: storeData?.verificada || false,
      ubicacion: storeData?.address || ''
    }
  };
}

// Utilidades para validación
export const validarProducto = (producto) => {
  const errores = [];

  if (!producto.titulo || producto.titulo.trim().length < 3) {
    errores.push('El título debe tener al menos 3 caracteres');
  }

  if (!producto.descripcion || producto.descripcion.trim().length < 10) {
    errores.push('La descripción debe tener al menos 10 caracteres');
  }

  if (!producto.categoria) {
    errores.push('Debe seleccionar una categoría');
  }

  if (producto.tipoPrecio === TIPOS_PRECIO.FIJO && (!producto.precio || producto.precio <= 0)) {
    errores.push('El precio debe ser mayor a 0');
  }

  if (producto.gestionStock === GESTION_STOCK.LIMITADO && (!producto.stock || producto.stock < 0)) {
    errores.push('El stock debe ser 0 o mayor');
  }

  if (!producto.imagenes || producto.imagenes.length === 0) {
    errores.push('Debe agregar al menos una imagen');
  }

  return errores;
}

// Utilidades para formateo
export const formatearPrecio = (precio, moneda = 'ARS') => {
  if (typeof precio !== 'number') return 'Precio a consultar';

  const formatters = {
    ARS: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }),
    USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
    EUR: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })
  };

  return formatters[moneda]?.format(precio) || `${precio} ${moneda}`;
}

export const obtenerEstadoBadge = (estado) => {
  const badges = {
    [ESTADOS_PRODUCTO.DISPONIBLE]: { color: 'green', texto: 'Disponible' },
    [ESTADOS_PRODUCTO.AGOTADO]: { color: 'red', texto: 'Agotado' },
    [ESTADOS_PRODUCTO.PAUSADO]: { color: 'yellow', texto: 'Pausado' },
    [ESTADOS_PRODUCTO.INACTIVO]: { color: 'gray', texto: 'Inactivo' }
  };

  return badges[estado] || { color: 'gray', texto: 'Desconocido' };
}

export const generarSlug = (titulo) => {
  return titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9\s-]/g, '') // Quitar caracteres especiales
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Quitar guiones múltiples
    .trim();
}

// Utilidades para estrellas
export const renderEstrellas = (valoracion, tamaño = 'sm') => {
  const estrellas = [];
  const valoracionRedondeada = Math.round(valoracion * 2) / 2; // Redondear a 0.5

  for (let i = 1; i <= 5; i++) {
    if (i <= valoracionRedondeada) {
      estrellas.push('full');
    } else if (i - 0.5 <= valoracionRedondeada) {
      estrellas.push('half');
    } else {
      estrellas.push('empty');
    }
  }

  return estrellas;
}