// src/types/services.js

export const ESTADOS_SERVICIO = {
  DISPONIBLE: 'disponible',
  PAUSADO: 'pausado',
  AGOTADO: 'agotado', // Para servicios con cupos limitados
  INACTIVO: 'inactivo'
};

export const TIPOS_PRECIO_SERVICIO = {
  FIJO: 'fijo',
  POR_HORA: 'por_hora',
  POR_DIA: 'por_dia',
  POR_SESION: 'por_sesion',
  PAQUETE: 'paquete',
  NEGOCIABLE: 'negociable',
  CONSULTAR: 'consultar',
  GRATIS: 'gratis'
};

export const MODALIDAD_SERVICIO = {
  PRESENCIAL: 'presencial',
  DOMICILIO: 'domicilio',
  VIRTUAL: 'virtual',
  HIBRIDO: 'hibrido'
};

// Categorías de servicios mejoradas con subcategorías
export const CATEGORIAS_SERVICIOS = {
  belleza_y_bienestar: {
    id: 'belleza_y_bienestar',
    nombre: 'Belleza y Bienestar',
    descripcion: 'Servicios de cuidado personal, estética y bienestar',
    subcategorias: {
      peluqueria: 'Peluquería y Cortes',
      barberia: 'Barbería',
      manicura_pedicura: 'Manicura y Pedicura',
      maquillaje: 'Maquillaje y Caracterización',
      masajes: 'Masajes y Relajación',
      tratamientos_faciales: 'Tratamientos Faciales',
      depilacion: 'Depilación',
      tatuajes_piercing: 'Tatuajes y Piercing',
      spa_wellness: 'Spa y Wellness',
      medicina_estetica: 'Medicina Estética',
      podologia: 'Podología',
      otros_belleza: 'Otros Servicios de Belleza'
    }
  },
  salud_y_medicina: {
    id: 'salud_y_medicina',
    nombre: 'Salud y Medicina',
    descripcion: 'Servicios médicos y de salud profesional',
    subcategorias: {
      consulta_medica: 'Consulta Médica General',
      especialidades_medicas: 'Especialidades Médicas',
      odontologia: 'Odontología',
      psicologia: 'Psicología y Terapia',
      fisioterapia: 'Fisioterapia y Rehabilitación',
      nutricion: 'Nutrición y Dietética',
      enfermeria: 'Enfermería a Domicilio',
      cuidado_adultos_mayores: 'Cuidado de Adultos Mayores',
      laboratorio: 'Análisis de Laboratorio',
      farmacia: 'Servicios de Farmacia',
      medicina_alternativa: 'Medicina Alternativa',
      otros_salud: 'Otros Servicios de Salud'
    }
  },
  educacion_y_capacitacion: {
    id: 'educacion_y_capacitacion',
    nombre: 'Educación y Capacitación',
    descripcion: 'Clases, tutorías y formación académica/profesional',
    subcategorias: {
      clases_particulares: 'Clases Particulares',
      apoyo_escolar: 'Apoyo Escolar',
      idiomas: 'Idiomas',
      musica: 'Música e Instrumentos',
      arte_dibujo: 'Arte y Dibujo',
      danza_baile: 'Danza y Baile',
      deportes_entrenamiento: 'Deportes y Entrenamiento',
      informatica_programacion: 'Informática y Programación',
      capacitacion_profesional: 'Capacitación Profesional',
      preparacion_examenes: 'Preparación para Exámenes',
      coaching: 'Coaching y Desarrollo Personal',
      otros_educacion: 'Otros Servicios Educativos'
    }
  },
  tecnologia_e_informatica: {
    id: 'tecnologia_e_informatica',
    nombre: 'Tecnología e Informática',
    descripcion: 'Servicios técnicos y desarrollo tecnológico',
    subcategorias: {
      desarrollo_web: 'Desarrollo Web',
      desarrollo_apps: 'Desarrollo de Apps',
      diseño_web: 'Diseño Web',
      soporte_tecnico: 'Soporte Técnico',
      reparacion_computadoras: 'Reparación de Computadoras',
      reparacion_celulares: 'Reparación de Celulares',
      instalacion_software: 'Instalación de Software',
      redes_wifi: 'Redes y WiFi',
      consultoria_ti: 'Consultoría en TI',
      seguridad_informatica: 'Seguridad Informática',
      recuperacion_datos: 'Recuperación de Datos',
      otros_tecnologia: 'Otros Servicios Tecnológicos'
    }
  },
  hogar_y_mantenimiento: {
    id: 'hogar_y_mantenimiento',
    nombre: 'Hogar y Mantenimiento',
    descripcion: 'Servicios para el hogar, reparaciones y mantenimiento',
    subcategorias: {
      limpieza_hogar: 'Limpieza del Hogar',
      limpieza_oficinas: 'Limpieza de Oficinas',
      plomeria: 'Plomería',
      electricidad: 'Electricidad',
      pintura: 'Pintura y Decoración',
      carpinteria: 'Carpintería',
      cerrajeria: 'Cerrajería',
      jardineria: 'Jardinería y Paisajismo',
      fumigacion: 'Fumigación y Control de Plagas',
      aire_acondicionado: 'Aire Acondicionado',
      reparaciones_generales: 'Reparaciones Generales',
      mudanzas: 'Mudanzas y Traslados',
      otros_hogar: 'Otros Servicios del Hogar'
    }
  },
  automotriz: {
    id: 'automotriz',
    nombre: 'Automotriz',
    descripcion: 'Servicios para vehículos y transporte',
    subcategorias: {
      mecanica_general: 'Mecánica General',
      mecanica_especializada: 'Mecánica Especializada',
      lavado_autos: 'Lavado de Autos',
      encerado_pulido: 'Encerado y Pulido',
      neumaticos: 'Neumáticos',
      electricidad_automotriz: 'Electricidad Automotriz',
      chaperia_pintura: 'Chapería y Pintura',
      grua: 'Grúa y Remolque',
      transporte_personas: 'Transporte de Personas',
      transporte_cargas: 'Transporte de Cargas',
      alquiler_vehiculos: 'Alquiler de Vehículos',
      otros_automotriz: 'Otros Servicios Automotrices'
    }
  },
  eventos_y_celebraciones: {
    id: 'eventos_y_celebraciones',
    nombre: 'Eventos y Celebraciones',
    descripcion: 'Organización y servicios para eventos especiales',
    subcategorias: {
      organizacion_eventos: 'Organización de Eventos',
      catering: 'Catering y Banquetes',
      animacion_infantil: 'Animación Infantil',
      dj_musica: 'DJ y Música',
      fotografia_eventos: 'Fotografía de Eventos',
      video_eventos: 'Video y Filmación',
      decoracion_eventos: 'Decoración de Eventos',
      alquiler_equipos: 'Alquiler de Equipos',
      maestro_ceremonias: 'Maestro de Ceremonias',
      seguridad_eventos: 'Seguridad para Eventos',
      servicios_boda: 'Servicios para Bodas',
      otros_eventos: 'Otros Servicios para Eventos'
    }
  },
  deportes_y_fitness: {
    id: 'deportes_y_fitness',
    nombre: 'Deportes y Fitness',
    descripcion: 'Entrenamiento físico y actividades deportivas',
    subcategorias: {
      entrenamiento_personal: 'Entrenamiento Personal',
      gimnasio: 'Gimnasio y Fitness',
      pilates: 'Pilates',
      yoga: 'Yoga',
      crossfit: 'CrossFit',
      artes_marciales: 'Artes Marciales',
      natacion: 'Natación',
      futbol: 'Fútbol',
      tenis: 'Tenis',
      basquet: 'Básquet',
      running: 'Running y Atletismo',
      deportes_extremos: 'Deportes Extremos',
      otros_deportes: 'Otros Deportes'
    }
  },
  mascotas: {
    id: 'mascotas',
    nombre: 'Mascotas',
    descripcion: 'Cuidado y servicios para mascotas',
    subcategorias: {
      veterinaria: 'Veterinaria',
      peluqueria_mascotas: 'Peluquería para Mascotas',
      paseo_perros: 'Paseo de Perros',
      cuidado_mascotas: 'Cuidado de Mascotas',
      adiestramiento: 'Adiestramiento',
      guarderia_mascotas: 'Guardería para Mascotas',
      fotografia_mascotas: 'Fotografía de Mascotas',
      pension_mascotas: 'Pensión para Mascotas',
      transporte_mascotas: 'Transporte de Mascotas',
      otros_mascotas: 'Otros Servicios para Mascotas'
    }
  },
  consultoria_y_negocios: {
    id: 'consultoria_y_negocios',
    nombre: 'Consultoría y Negocios',
    descripcion: 'Servicios profesionales para empresas y emprendedores',
    subcategorias: {
      consultoria_empresarial: 'Consultoría Empresarial',
      plan_negocios: 'Plan de Negocios',
      contabilidad: 'Contabilidad',
      administracion: 'Administración',
      recursos_humanos: 'Recursos Humanos',
      auditoria: 'Auditoría',
      coaching_empresarial: 'Coaching Empresarial',
      estrategia_comercial: 'Estrategia Comercial',
      gestion_proyectos: 'Gestión de Proyectos',
      analisis_mercado: 'Análisis de Mercado',
      otros_consultoria: 'Otras Consultorías'
    }
  },
  marketing_y_publicidad: {
    id: 'marketing_y_publicidad',
    nombre: 'Marketing y Publicidad',
    descripcion: 'Servicios de marketing digital y publicidad',
    subcategorias: {
      marketing_digital: 'Marketing Digital',
      redes_sociales: 'Gestión de Redes Sociales',
      publicidad_online: 'Publicidad Online',
      seo: 'SEO y Posicionamiento',
      email_marketing: 'Email Marketing',
      branding: 'Branding e Identidad',
      copywriting: 'Copywriting',
      influencer_marketing: 'Influencer Marketing',
      marketing_tradicional: 'Marketing Tradicional',
      eventos_marketing: 'Eventos y Activaciones',
      otros_marketing: 'Otros Servicios de Marketing'
    }
  },
  diseño_y_creatividad: {
    id: 'diseño_y_creatividad',
    nombre: 'Diseño y Creatividad',
    descripcion: 'Servicios de diseño gráfico y creativo',
    subcategorias: {
      diseño_grafico: 'Diseño Gráfico',
      diseño_logos: 'Diseño de Logos',
      diseño_web_ui: 'Diseño Web/UI',
      ilustracion: 'Ilustración',
      diseño_packaging: 'Diseño de Packaging',
      diseño_interiores: 'Diseño de Interiores',
      arquitectura: 'Arquitectura',
      diseño_moda: 'Diseño de Moda',
      animacion: 'Animación y Motion Graphics',
      otros_diseño: 'Otros Servicios de Diseño'
    }
  },
  fotografia_y_video: {
    id: 'fotografia_y_video',
    nombre: 'Fotografía y Video',
    descripcion: 'Servicios audiovisuales profesionales',
    subcategorias: {
      fotografia_profesional: 'Fotografía Profesional',
      fotografia_social: 'Fotografía Social',
      fotografia_producto: 'Fotografía de Producto',
      fotografia_corporativa: 'Fotografía Corporativa',
      video_corporativo: 'Video Corporativo',
      video_publicitario: 'Video Publicitario',
      edicion_video: 'Edición de Video',
      edicion_fotos: 'Edición de Fotos',
      streaming: 'Streaming y Transmisión',
      drones: 'Fotografía/Video con Drones',
      otros_audiovisual: 'Otros Servicios Audiovisuales'
    }
  },
  musica_y_entretenimiento: {
    id: 'musica_y_entretenimiento',
    nombre: 'Música y Entretenimiento',
    descripcion: 'Servicios de entretenimiento y espectáculos',
    subcategorias: {
      musicos: 'Músicos y Bandas',
      cantantes: 'Cantantes',
      dj_fiestas: 'DJ para Fiestas',
      shows_artisticos: 'Shows Artísticos',
      espectaculos_infantiles: 'Espectáculos Infantiles',
      teatro: 'Teatro y Actuación',
      comedia: 'Comedia y Stand-up',
      baile_shows: 'Baile y Shows',
      karaoke: 'Karaoke',
      grabacion_musica: 'Grabación de Música',
      otros_entretenimiento: 'Otros Entretenimientos'
    }
  },
  gastronomia: {
    id: 'gastronomia',
    nombre: 'Gastronomía',
    descripcion: 'Servicios gastronómicos y alimentarios',
    subcategorias: {
      chef_domicilio: 'Chef a Domicilio',
      catering_empresarial: 'Catering Empresarial',
      reposteria: 'Repostería y Tortas',
      panaderia: 'Panadería',
      comida_casera: 'Comida Casera',
      comida_dietetica: 'Comida Dietética',
      bartender: 'Bartender y Cocteles',
      asesoramiento_nutricional: 'Asesoramiento Nutricional',
      cursos_cocina: 'Cursos de Cocina',
      otros_gastronomia: 'Otros Servicios Gastronómicos'
    }
  },
  jardineria_y_paisajismo: {
    id: 'jardineria_y_paisajismo',
    nombre: 'Jardinería y Paisajismo',
    descripcion: 'Cuidado de jardines y espacios verdes',
    subcategorias: {
      diseño_jardines: 'Diseño de Jardines',
      mantenimiento_jardines: 'Mantenimiento de Jardines',
      poda_arboles: 'Poda de Árboles',
      cesped: 'Césped y Grama',
      riego: 'Sistemas de Riego',
      plantas_flores: 'Plantas y Flores',
      paisajismo: 'Paisajismo',
      viveros: 'Viveros',
      otros_jardineria: 'Otros Servicios de Jardinería'
    }
  },
  limpieza: {
    id: 'limpieza',
    nombre: 'Limpieza',
    descripcion: 'Servicios especializados de limpieza',
    subcategorias: {
      limpieza_domestica: 'Limpieza Doméstica',
      limpieza_comercial: 'Limpieza Comercial',
      limpieza_edificios: 'Limpieza de Edificios',
      limpieza_ventanas: 'Limpieza de Ventanas',
      limpieza_alfombras: 'Limpieza de Alfombras',
      limpieza_profunda: 'Limpieza Profunda',
      desinfeccion: 'Desinfección',
      limpieza_mudanza: 'Limpieza Post-Mudanza',
      otros_limpieza: 'Otros Servicios de Limpieza'
    }
  },
  transporte_y_logistica: {
    id: 'transporte_y_logistica',
    nombre: 'Transporte y Logística',
    descripcion: 'Servicios de transporte y logística',
    subcategorias: {
      taxi_remis: 'Taxi y Remis',
      delivery: 'Delivery y Envíos',
      mudanzas_fletes: 'Mudanzas y Fletes',
      transporte_escolar: 'Transporte Escolar',
      logistica_empresarial: 'Logística Empresarial',
      courier: 'Courier y Mensajería',
      transporte_turismo: 'Transporte Turístico',
      alquiler_vehiculos_carga: 'Alquiler de Vehículos de Carga',
      otros_transporte: 'Otros Servicios de Transporte'
    }
  },
  servicios_legales: {
    id: 'servicios_legales',
    nombre: 'Servicios Legales',
    descripcion: 'Asesoramiento y servicios jurídicos',
    subcategorias: {
      abogados_general: 'Abogados - Derecho General',
      derecho_laboral: 'Derecho Laboral',
      derecho_penal: 'Derecho Penal',
      derecho_civil: 'Derecho Civil',
      derecho_comercial: 'Derecho Comercial',
      derecho_familia: 'Derecho de Familia',
      tramites_legales: 'Trámites Legales',
      escribania: 'Escribanía',
      mediacion: 'Mediación',
      otros_legales: 'Otros Servicios Legales'
    }
  },
  servicios_financieros: {
    id: 'servicios_financieros',
    nombre: 'Servicios Financieros',
    descripcion: 'Asesoramiento financiero y económico',
    subcategorias: {
      asesoramiento_financiero: 'Asesoramiento Financiero',
      creditos_prestamos: 'Créditos y Préstamos',
      seguros: 'Seguros',
      inversiones: 'Inversiones',
      planificacion_financiera: 'Planificación Financiera',
      gestion_patrimonial: 'Gestión Patrimonial',
      tramites_bancarios: 'Trámites Bancarios',
      otros_financieros: 'Otros Servicios Financieros'
    }
  },
  otros: {
    id: 'otros',
    nombre: 'Otros Servicios',
    descripcion: 'Otros servicios no clasificados',
    subcategorias: {
      servicios_diversos: 'Servicios Diversos',
      servicios_especializados: 'Servicios Especializados'
    }
  }
};

// Labels para las categorías (para compatibilidad)
export const CATEGORIAS_SERVICIOS_LABELS = Object.values(CATEGORIAS_SERVICIOS).reduce((acc, cat) => {
  acc[cat.id] = cat.nombre;
  return acc;
}, {});

export const DURACION_SERVICIO = {
  MINUTOS_30: '30_minutos',
  HORA_1: '1_hora',
  HORAS_2: '2_horas',
  MEDIO_DIA: 'medio_dia',
  DIA_COMPLETO: 'dia_completo',
  VARIOS_DIAS: 'varios_dias',
  SEMANAL: 'semanal',
  MENSUAL: 'mensual',
  PERSONALIZADA: 'personalizada'
};

export const DIAS_DISPONIBLES = {
  LUNES: 'lunes',
  MARTES: 'martes',
  MIERCOLES: 'miercoles',
  JUEVES: 'jueves',
  VIERNES: 'viernes',
  SABADO: 'sabado',
  DOMINGO: 'domingo'
};

export const HORARIOS_DISPONIBLES = {
  MAÑANA: 'mañana', // 6:00 - 12:00
  TARDE: 'tarde',   // 12:00 - 18:00
  NOCHE: 'noche',   // 18:00 - 24:00
  TODO_EL_DIA: 'todo_el_dia',
  PERSONALIZADO: 'personalizado'
};

export const GESTION_CUPOS = {
  ILIMITADO: 'ilimitado',
  LIMITADO: 'limitado',
  UNICO: 'unico' // Para servicios únicos como trabajos específicos
};

// Función para obtener categorías como array (compatibilidad hacia atrás)
export const getCategoriasList = () => {
  return Object.values(CATEGORIAS_SERVICIOS);
};

// Función para obtener solo los IDs de categorías (para compatibilidad)
export const getCategoriasIds = () => {
  return Object.keys(CATEGORIAS_SERVICIOS);
};

// Función para obtener categorías para select/dropdown (compatibilidad hacia atrás)
export const getCategoriasForSelect = () => {
  return Object.keys(CATEGORIAS_SERVICIOS);
};

// Función para obtener subcategorías de una categoría específica
export const getSubcategorias = (categoriaId) => {
  const categoria = CATEGORIAS_SERVICIOS[categoriaId];
  return categoria ? categoria.subcategorias : {};
};

// Función para buscar categorías por texto
export const buscarCategorias = (texto) => {
  const textoLower = texto.toLowerCase();
  return Object.values(CATEGORIAS_SERVICIOS).filter(categoria =>
    categoria.nombre.toLowerCase().includes(textoLower) ||
    categoria.descripcion.toLowerCase().includes(textoLower) ||
    Object.values(categoria.subcategorias).some(sub =>
      sub.toLowerCase().includes(textoLower)
    )
  );
};

// Función para formatear precio de servicio
export const formatearPrecioServicio = (precio, tipoPrecio = TIPOS_PRECIO_SERVICIO.FIJO, moneda = '$') => {
  if (!precio && precio !== 0) {
    switch (tipoPrecio) {
      case TIPOS_PRECIO_SERVICIO.NEGOCIABLE:
        return 'Precio negociable';
      case TIPOS_PRECIO_SERVICIO.CONSULTAR:
        return 'Consultar precio';
      case TIPOS_PRECIO_SERVICIO.GRATIS:
        return 'Gratis';
      default:
        return 'Precio a consultar';
    }
  }

  const precioFormateado = `${moneda} ${parseFloat(precio).toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`;

  switch (tipoPrecio) {
    case TIPOS_PRECIO_SERVICIO.POR_HORA:
      return `${precioFormateado} / hora`;
    case TIPOS_PRECIO_SERVICIO.POR_DIA:
      return `${precioFormateado} / día`;
    case TIPOS_PRECIO_SERVICIO.POR_SESION:
      return `${precioFormateado} / sesión`;
    case TIPOS_PRECIO_SERVICIO.PAQUETE:
      return `${precioFormateado} / paquete`;
    default:
      return precioFormateado;
  }
};

// Función para obtener el badge del estado
export const obtenerEstadoBadgeServicio = (estado) => {
  switch (estado) {
    case ESTADOS_SERVICIO.DISPONIBLE:
      return { texto: 'Disponible', color: 'green' };
    case ESTADOS_SERVICIO.PAUSADO:
      return { texto: 'Pausado', color: 'yellow' };
    case ESTADOS_SERVICIO.AGOTADO:
      return { texto: 'Sin cupos', color: 'red' };
    case ESTADOS_SERVICIO.INACTIVO:
      return { texto: 'Inactivo', color: 'gray' };
    default:
      return { texto: 'Desconocido', color: 'gray' };
  }
};

// Función para formatear modalidad
export const formatearModalidad = (modalidad) => {
  switch (modalidad) {
    case MODALIDAD_SERVICIO.PRESENCIAL:
      return 'Presencial';
    case MODALIDAD_SERVICIO.DOMICILIO:
      return 'A domicilio';
    case MODALIDAD_SERVICIO.VIRTUAL:
      return 'Virtual/Online';
    case MODALIDAD_SERVICIO.HIBRIDO:
      return 'Híbrido';
    default:
      return modalidad;
  }
};

// Función para formatear categoría
export const formatearCategoria = (categoriaId) => {
  const categoria = CATEGORIAS_SERVICIOS[categoriaId];
  return categoria ? categoria.nombre : categoriaId;
};

// Función para formatear subcategoría
export const formatearSubcategoria = (categoriaId, subcategoriaId) => {
  const categoria = CATEGORIAS_SERVICIOS[categoriaId];
  if (!categoria || !categoria.subcategorias) return subcategoriaId;

  return categoria.subcategorias[subcategoriaId] || subcategoriaId;
};

// Función para formatear duración
export const formatearDuracion = (duracion, duracionPersonalizada = '') => {
  switch (duracion) {
    case DURACION_SERVICIO.MINUTOS_30:
      return '30 minutos';
    case DURACION_SERVICIO.HORA_1:
      return '1 hora';
    case DURACION_SERVICIO.HORAS_2:
      return '2 horas';
    case DURACION_SERVICIO.MEDIO_DIA:
      return 'Medio día';
    case DURACION_SERVICIO.DIA_COMPLETO:
      return 'Día completo';
    case DURACION_SERVICIO.VARIOS_DIAS:
      return 'Varios días';
    case DURACION_SERVICIO.SEMANAL:
      return 'Semanal';
    case DURACION_SERVICIO.MENSUAL:
      return 'Mensual';
    case DURACION_SERVICIO.PERSONALIZADA:
      return duracionPersonalizada || 'Duración personalizada';
    default:
      return duracion;
  }
};

// Función para formatear días disponibles
export const formatearDiasDisponibles = (dias = []) => {
  if (!Array.isArray(dias) || dias.length === 0) return 'No especificado';

  const diasOrdenados = [
    DIAS_DISPONIBLES.LUNES,
    DIAS_DISPONIBLES.MARTES,
    DIAS_DISPONIBLES.MIERCOLES,
    DIAS_DISPONIBLES.JUEVES,
    DIAS_DISPONIBLES.VIERNES,
    DIAS_DISPONIBLES.SABADO,
    DIAS_DISPONIBLES.DOMINGO
  ];

  const diasFiltrados = diasOrdenados.filter(dia => dias.includes(dia));

  if (diasFiltrados.length === 7) return 'Todos los días';
  if (diasFiltrados.length === 5 && !dias.includes(DIAS_DISPONIBLES.SABADO) && !dias.includes(DIAS_DISPONIBLES.DOMINGO)) {
    return 'Lunes a viernes';
  }
  if (diasFiltrados.length === 2 && dias.includes(DIAS_DISPONIBLES.SABADO) && dias.includes(DIAS_DISPONIBLES.DOMINGO)) {
    return 'Fines de semana';
  }

  const nombresDias = {
    [DIAS_DISPONIBLES.LUNES]: 'Lun',
    [DIAS_DISPONIBLES.MARTES]: 'Mar',
    [DIAS_DISPONIBLES.MIERCOLES]: 'Mié',
    [DIAS_DISPONIBLES.JUEVES]: 'Jue',
    [DIAS_DISPONIBLES.VIERNES]: 'Vie',
    [DIAS_DISPONIBLES.SABADO]: 'Sáb',
    [DIAS_DISPONIBLES.DOMINGO]: 'Dom'
  };

  return diasFiltrados.map(dia => nombresDias[dia]).join(', ');
};

// Función para formatear horarios
export const formatearHorarios = (horarios = [], horarioPersonalizado = '') => {
  if (!Array.isArray(horarios) || horarios.length === 0) return 'No especificado';

  if (horarios.includes(HORARIOS_DISPONIBLES.TODO_EL_DIA)) return 'Todo el día';
  if (horarios.includes(HORARIOS_DISPONIBLES.PERSONALIZADO)) return horarioPersonalizado || 'Horario personalizado';

  const nombresHorarios = {
    [HORARIOS_DISPONIBLES.MAÑANA]: 'Mañana',
    [HORARIOS_DISPONIBLES.TARDE]: 'Tarde',
    [HORARIOS_DISPONIBLES.NOCHE]: 'Noche'
  };

  return horarios.map(horario => nombresHorarios[horario] || horario).join(', ');
};

// Función para validar servicio
export const validarServicio = (servicio) => {
  const errores = [];

  // Validaciones básicas
  if (!servicio.titulo || servicio.titulo.trim().length === 0) {
    errores.push('El título es requerido');
  }
  if (servicio.titulo && servicio.titulo.length < 3) {
    errores.push('El título debe tener al menos 3 caracteres');
  }
  if (servicio.titulo && servicio.titulo.length > 100) {
    errores.push('El título no puede exceder 100 caracteres');
  }

  if (!servicio.descripcion || servicio.descripcion.trim().length === 0) {
    errores.push('La descripción es requerida');
  }
  if (servicio.descripcion && servicio.descripcion.length < 20) {
    errores.push('La descripción debe tener al menos 20 caracteres');
  }
  if (servicio.descripcion && servicio.descripcion.length > 2000) {
    errores.push('La descripción no puede exceder 2000 caracteres');
  }

  if (!servicio.categoria) {
    errores.push('La categoría es requerida');
  }

  if (!servicio.modalidad) {
    errores.push('La modalidad es requerida');
  }

  // Validar precio según tipo
  if (servicio.tipoPrecio === TIPOS_PRECIO_SERVICIO.FIJO ||
    servicio.tipoPrecio === TIPOS_PRECIO_SERVICIO.POR_HORA ||
    servicio.tipoPrecio === TIPOS_PRECIO_SERVICIO.POR_DIA ||
    servicio.tipoPrecio === TIPOS_PRECIO_SERVICIO.POR_SESION ||
    servicio.tipoPrecio === TIPOS_PRECIO_SERVICIO.PAQUETE) {
    if (!servicio.precio || servicio.precio <= 0) {
      errores.push('El precio es requerido para este tipo de precio');
    }
  }

  // Validar cupos si es limitado
  if (servicio.gestionCupos === GESTION_CUPOS.LIMITADO) {
    if (!servicio.cuposDisponibles || servicio.cuposDisponibles <= 0) {
      errores.push('Los cupos disponibles son requeridos para gestión limitada');
    }
  }

  // Validar duración personalizada
  if (servicio.duracion === DURACION_SERVICIO.PERSONALIZADA && !servicio.duracionPersonalizada) {
    errores.push('Debe especificar la duración personalizada');
  }

  // Validar horario personalizado
  if (servicio.horarios && servicio.horarios.includes(HORARIOS_DISPONIBLES.PERSONALIZADO) && !servicio.horarioPersonalizado) {
    errores.push('Debe especificar el horario personalizado');
  }

  return errores;
};

// Función para auto-completar datos del servicio desde storeData
export const autoCompletarDatosServicio = (servicioData, storeData) => {
  return {
    ...servicioData,
    // Información de la tienda
    tiendaInfo: {
      nombre: storeData?.businessName || storeData?.familyName || 'Tienda',
      slug: storeData?.storeSlug || '',
      ubicacion: storeData?.address || '',
      telefono: storeData?.phoneNumber || '',
      email: storeData?.email || '',
      logo: storeData?.storeLogo || storeData?.profileImage || null
    },
    // Auto-completar contacto si no está definido
    contacto: {
      whatsapp: servicioData.contacto?.whatsapp || storeData?.phoneNumber || '',
      telefono: servicioData.contacto?.telefono || storeData?.phoneNumber || '',
      email: servicioData.contacto?.email || storeData?.email || '',
      mensaje: servicioData.contacto?.mensaje || `Hola! Me interesa tu servicio: ${servicioData.titulo}`
    }
  };
};

// Función para generar slug de servicio
export const generarSlugServicio = (titulo, id) => {
  const slug = titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s]/g, '') // Solo letras, números y espacios
    .replace(/\s+/g, '-') // Espacios por guiones
    .substring(0, 50); // Máximo 50 caracteres

  return `${slug}-${id.substring(0, 8)}`;
};

// Función para verificar disponibilidad de cupos
export const verificarDisponibilidadCupos = (servicio) => {
  if (servicio.gestionCupos === GESTION_CUPOS.ILIMITADO) return true;
  if (servicio.gestionCupos === GESTION_CUPOS.UNICO) return servicio.estado === ESTADOS_SERVICIO.DISPONIBLE;

  return servicio.cuposDisponibles > 0;
};

// Export por defecto con todas las utilidades
export default {
  ESTADOS_SERVICIO,
  TIPOS_PRECIO_SERVICIO,
  MODALIDAD_SERVICIO,
  CATEGORIAS_SERVICIOS,
  DURACION_SERVICIO,
  DIAS_DISPONIBLES,
  HORARIOS_DISPONIBLES,
  GESTION_CUPOS,
  getCategoriasList,
  getSubcategorias,
  buscarCategorias,
  formatearPrecioServicio,
  obtenerEstadoBadgeServicio,
  formatearModalidad,
  formatearCategoria,
  formatearSubcategoria,
  formatearDuracion,
  formatearDiasDisponibles,
  formatearHorarios,
  validarServicio,
  autoCompletarDatosServicio,
  generarSlugServicio,
  verificarDisponibilidadCupos
};