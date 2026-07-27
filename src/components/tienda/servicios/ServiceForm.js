// src/components/tienda/servicios/ServiceForm.js
'use client';

import { useState, useEffect, useRef } from 'react';
import {
    ESTADOS_SERVICIO,
    TIPOS_PRECIO_SERVICIO,
    MODALIDAD_SERVICIO,
    DURACION_SERVICIO,
    DIAS_DISPONIBLES,
    HORARIOS_DISPONIBLES,
    GESTION_CUPOS,
    CATEGORIAS_SERVICIOS,
    formatearCategoria,
    validarServicio,
    getSubcategorias  // <- AGREGADO: Importación de getSubcategorias
} from '../../../types/services';
import { generarSlugServicio } from '../../../types/services';
import {
    X,
    Upload,
    Trash2,
    Save,
    ArrowLeft,
    Image as ImageIcon,
    Plus,
    Info,
    Camera,
    Clock,
    Calendar,
    Users,
    Music,
    ChefHat,
    Leaf,
    Scale,
    MapPin,
    Monitor,
    Home,
    Globe,
    UserCheck, Wrench, Sparkles, GraduationCap, Truck, PartyPopper,
    Laptop, Heart, Car, DollarSign, Activity, Package2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const serviceCategoryIconMap = {
    'belleza_y_bienestar': Sparkles,
    'salud_y_medicina': Heart,
    'educacion_y_capacitacion': GraduationCap,
    'tecnologia_e_informatica': Laptop,
    'hogar_y_mantenimiento': Wrench,
    'automotriz': Car,
    'eventos_y_celebraciones': PartyPopper,
    'deportes_y_fitness': Activity,
    'mascotas': Heart,
    'consultoria_y_negocios': UserCheck,
    'marketing_y_publicidad': Monitor,
    'diseño_y_creatividad': Sparkles,
    'fotografia_y_video': Camera,
    'musica_y_entretenimiento': Music,
    'gastronomia': ChefHat,
    'jardineria_y_paisajismo': Leaf,
    'limpieza': Sparkles,
    'transporte_y_logistica': Truck,
    'servicios_legales': Scale,
    'servicios_financieros': DollarSign,
    'otros': Package2
};

export default function ServiceForm({
    servicio = null,
    storeId,
    onSave,
    onCancel,
    isLoading = false
}) {
    const { user } = useAuth();
    const [storeData, setStoreData] = useState(null);

    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        categoria: '',
        subcategoria: '',
        modalidad: MODALIDAD_SERVICIO.PRESENCIAL,
        precio: '',
        tipoPrecio: TIPOS_PRECIO_SERVICIO.FIJO,
        moneda: 'ARS',
        duracion: DURACION_SERVICIO.HORA_1,
        duracionPersonalizada: '',
        gestionCupos: GESTION_CUPOS.ILIMITADO,
        cuposDisponibles: '',
        imagenes: [],
        imagenPrincipal: '',
        estado: ESTADOS_SERVICIO.DISPONIBLE,
        diasDisponibles: [],
        horarios: [HORARIOS_DISPONIBLES.TODO_EL_DIA],
        horarioPersonalizado: '',
        ubicacion: '',
        palabrasClave: [],
        contacto: {
            whatsapp: '',
            telefono: '',
            email: '',
            mensaje: ''
        },
        requisitos: '',
        incluye: '',
        noIncluye: ''
    });

    const [errores, setErrores] = useState([]);
    const [justFailedValidation, setJustFailedValidation] = useState(false);
    const errorBannerRef = useRef(null);
    const fileInputRef = useRef(null);
    const [currentKeyword, setCurrentKeyword] = useState('');

    useEffect(() => {
        const loadStoreData = async () => {
            if (!user?.uid) return;

            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setStoreData(userData);

                    setFormData(prev => ({
                        ...prev,
                        ubicacion: userData.address || '',
                        contacto: {
                            whatsapp: userData.phone || '',
                            telefono: userData.phone || '',
                            email: userData.email || '',
                            mensaje: prev.contacto.mensaje || 'Hola! Me interesa tu servicio'
                        }
                    }));
                }
            } catch (error) {
                console.error('Error cargando datos de la tienda:', error);
            }
        };

        loadStoreData();
    }, [user]);

    useEffect(() => {
        if (servicio) {
            setFormData({
                ...servicio,
                precio: servicio.precio?.toString() || '',
                cuposDisponibles: servicio.cuposDisponibles?.toString() || '',
                diasDisponibles: servicio.diasDisponibles || [],
                horarios: servicio.horarios || [HORARIOS_DISPONIBLES.TODO_EL_DIA],
                palabrasClave: servicio.palabrasClave || []
            });
        }
    }, [servicio]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNestedChange = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: value
            }
        }));
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Por favor selecciona un archivo de imagen');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('La imagen no puede superar los 5MB');
            return;
        }

        try {
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);
            formDataUpload.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_SERVICES);

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formDataUpload,
                }
            );

            if (!response.ok) {
                throw new Error('Error al subir la imagen');
            }

            const data = await response.json();
            const imageUrl = data.secure_url;

            setFormData(prev => {
                const newImages = [...prev.imagenes, imageUrl];
                return {
                    ...prev,
                    imagenes: newImages.slice(0, 5),
                    imagenPrincipal: prev.imagenPrincipal || imageUrl
                };
            });

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

        } catch (error) {
            console.error('Error subiendo imagen:', error);
            alert('Error al subir la imagen. Intenta nuevamente.');
        }
    };

    const removeImage = (index) => {
        setFormData(prev => {
            const newImages = prev.imagenes.filter((_, i) => i !== index);
            return {
                ...prev,
                imagenes: newImages,
                imagenPrincipal: prev.imagenPrincipal === prev.imagenes[index]
                    ? newImages[0] || ''
                    : prev.imagenPrincipal
            };
        });
    };

    const setMainImage = (imageUrl) => {
        setFormData(prev => ({
            ...prev,
            imagenPrincipal: imageUrl
        }));
    };

    const addKeyword = () => {
        if (currentKeyword.trim() && !formData.palabrasClave.includes(currentKeyword.trim())) {
            setFormData(prev => ({
                ...prev,
                palabrasClave: [...prev.palabrasClave, currentKeyword.trim()]
            }));
            setCurrentKeyword('');
        }
    };

    const removeKeyword = (keyword) => {
        setFormData(prev => ({
            ...prev,
            palabrasClave: prev.palabrasClave.filter(k => k !== keyword)
        }));
    };

    const handleDayToggle = (dia) => {
        setFormData(prev => ({
            ...prev,
            diasDisponibles: prev.diasDisponibles.includes(dia)
                ? prev.diasDisponibles.filter(d => d !== dia)
                : [...prev.diasDisponibles, dia]
        }));
    };

    const handleHorarioToggle = (horario) => {
        setFormData(prev => ({
            ...prev,
            horarios: prev.horarios.includes(horario)
                ? prev.horarios.filter(h => h !== horario)
                : [...prev.horarios, horario]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const serviceData = {
            ...formData,
            usuarioId: storeId,
            tiendaId: storeId,
            precio: parseFloat(formData.precio) || 0,
            cuposDisponibles: formData.gestionCupos === GESTION_CUPOS.LIMITADO ? parseInt(formData.cuposDisponibles) || 0 : null,
            slug: generarSlugServicio(formData.titulo, Date.now().toString()),
            fechaActualizacion: new Date().toISOString()
        };

        const validationErrors = validarServicio(serviceData);
        if (validationErrors.length > 0) {
            setErrores(validationErrors);
            errorBannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setJustFailedValidation(true);
            setTimeout(() => setJustFailedValidation(false), 2500);
            return;
        }

        setErrores([]);
        onSave(serviceData);
    };

    // CORREGIDO: Usar Object.keys en lugar de Object.values
    const categorias = Object.keys(CATEGORIAS_SERVICIOS);

    const diasSemana = [
        { id: DIAS_DISPONIBLES.LUNES, nombre: 'Lunes' },
        { id: DIAS_DISPONIBLES.MARTES, nombre: 'Martes' },
        { id: DIAS_DISPONIBLES.MIERCOLES, nombre: 'Miércoles' },
        { id: DIAS_DISPONIBLES.JUEVES, nombre: 'Jueves' },
        { id: DIAS_DISPONIBLES.VIERNES, nombre: 'Viernes' },
        { id: DIAS_DISPONIBLES.SABADO, nombre: 'Sábado' },
        { id: DIAS_DISPONIBLES.DOMINGO, nombre: 'Domingo' }
    ];

    const horariosDisponibles = [
        { id: HORARIOS_DISPONIBLES.MAÑANA, nombre: 'Mañana (6:00 - 12:00)' },
        { id: HORARIOS_DISPONIBLES.TARDE, nombre: 'Tarde (12:00 - 18:00)' },
        { id: HORARIOS_DISPONIBLES.NOCHE, nombre: 'Noche (18:00 - 24:00)' },
        { id: HORARIOS_DISPONIBLES.TODO_EL_DIA, nombre: 'Todo el día' },
        { id: HORARIOS_DISPONIBLES.PERSONALIZADO, nombre: 'Horario personalizado' }
    ];

    const getValidationMessage = () => {
        if (formData.titulo.length === 0) return null;
        const errors = validarServicio({
            ...formData,
            usuarioId: storeId,
            precio: parseFloat(formData.precio) || 0
        });
        
        if (errors.length === 0) {
            return <p className="text-green-600 text-sm mt-2">✓ El formulario está completo</p>;
        }
        return null;
    };

    return (
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {servicio ? 'Editar Servicio' : 'Nuevo Servicio'}
                    </h1>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
                {/* Errores */}
                {errores.length > 0 && (
                    <div
                        ref={errorBannerRef}
                        role="alert"
                        aria-live="assertive"
                        className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-lg p-4 animate-in fade-in duration-300"
                    >
                        <h3 className="text-red-800 dark:text-red-300 font-medium mb-2">
                            Corrige los siguientes errores para poder guardar:
                        </h3>
                        <ul className="text-red-700 dark:text-red-400 text-sm space-y-1">
                            {errores.map((error, index) => (
                                <li key={index}>• {error}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Información Básica */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                        Información Básica
                    </h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Título del servicio *
                        </label>
                        <input
                            type="text"
                            value={formData.titulo}
                            onChange={(e) => handleInputChange('titulo', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Ej: Clases de guitarra personalizadas"
                            maxLength={100}
                        />
                        {formData.titulo.length > 0 && formData.titulo.length < 3 && (
                            <p className="text-sm text-red-500 mt-1">El título debe tener al menos 3 caracteres</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Descripción *
                        </label>
                        <textarea
                            value={formData.descripcion}
                            onChange={(e) => handleInputChange('descripcion', e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Describe tu servicio, qué incluye, para quién está dirigido..."
                            maxLength={2000}
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {formData.descripcion.length}/2000 caracteres
                            {formData.descripcion.length < 20 && formData.descripcion.length > 0 && (
                                <span className="text-red-500 ml-2">(mínimo 20 caracteres)</span>
                            )}
                            {formData.descripcion.length >= 20 && (
                                <span className="text-green-500 ml-2">✓</span>
                            )}
                        </p>
                    </div>

                    {/* Categorías */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Categoría *
                        </label>
                        <select
                            value={formData.categoria}
                            onChange={(e) => {
                                handleInputChange('categoria', e.target.value);
                                handleInputChange('subcategoria', '');
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="">Selecciona una categoría</option>
                            {categorias.map(cat => (
                                <option key={cat} value={cat}>{formatearCategoria(cat)}</option>
                            ))}
                        </select>
                    </div>

                    {/* NUEVO: Campo de Subcategorías */}
                    {formData.categoria && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Subcategoría
                            </label>
                            <select
                                value={formData.subcategoria}
                                onChange={(e) => handleInputChange('subcategoria', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="">Selecciona una subcategoría (opcional)</option>
                                {Object.entries(getSubcategorias(formData.categoria)).map(([key, nombre]) => (
                                    <option key={key} value={key}>{nombre}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Modalidad */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                        Modalidad y Configuración
                    </h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Modalidad del servicio *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { value: MODALIDAD_SERVICIO.PRESENCIAL, icon: MapPin, label: 'Presencial' },
                                { value: MODALIDAD_SERVICIO.DOMICILIO, icon: Home, label: 'A domicilio' },
                                { value: MODALIDAD_SERVICIO.VIRTUAL, icon: Monitor, label: 'Virtual/Online' },
                                { value: MODALIDAD_SERVICIO.HIBRIDO, icon: Globe, label: 'Híbrido' }
                            ].map(({ value, icon: Icon, label }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => handleInputChange('modalidad', value)}
                                    className={`p-3 rounded-lg border-2 transition-colors text-sm ${formData.modalidad === value
                                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-orange-300 text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-center mb-2">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="text-center">{label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Duración estimada *
                        </label>
                        <select
                            value={formData.duracion}
                            onChange={(e) => handleInputChange('duracion', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value={DURACION_SERVICIO.MINUTOS_30}>30 minutos</option>
                            <option value={DURACION_SERVICIO.HORA_1}>1 hora</option>
                            <option value={DURACION_SERVICIO.HORAS_2}>2 horas</option>
                            <option value={DURACION_SERVICIO.MEDIO_DIA}>Medio día</option>
                            <option value={DURACION_SERVICIO.DIA_COMPLETO}>Día completo</option>
                            <option value={DURACION_SERVICIO.VARIOS_DIAS}>Varios días</option>
                            <option value={DURACION_SERVICIO.SEMANAL}>Semanal</option>
                            <option value={DURACION_SERVICIO.MENSUAL}>Mensual</option>
                            <option value={DURACION_SERVICIO.PERSONALIZADA}>Duración personalizada</option>
                        </select>

                        {formData.duracion === DURACION_SERVICIO.PERSONALIZADA && (
                            <input
                                type="text"
                                value={formData.duracionPersonalizada}
                                onChange={(e) => handleInputChange('duracionPersonalizada', e.target.value)}
                                className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Ej: 3 horas, según necesidades, etc."
                            />
                        )}
                    </div>
                </div>

                {/* Precio y Cupos */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                        Precio y Disponibilidad
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tipo de precio *
                            </label>
                            <select
                                value={formData.tipoPrecio}
                                onChange={(e) => handleInputChange('tipoPrecio', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value={TIPOS_PRECIO_SERVICIO.FIJO}>Precio fijo</option>
                                <option value={TIPOS_PRECIO_SERVICIO.POR_HORA}>Por hora</option>
                                <option value={TIPOS_PRECIO_SERVICIO.POR_DIA}>Por día</option>
                                <option value={TIPOS_PRECIO_SERVICIO.POR_SESION}>Por sesión</option>
                                <option value={TIPOS_PRECIO_SERVICIO.PAQUETE}>Paquete</option>
                                <option value={TIPOS_PRECIO_SERVICIO.NEGOCIABLE}>Negociable</option>
                                <option value={TIPOS_PRECIO_SERVICIO.CONSULTAR}>A consultar</option>
                                <option value={TIPOS_PRECIO_SERVICIO.GRATIS}>Gratis</option>
                            </select>
                        </div>

                        {(formData.tipoPrecio === TIPOS_PRECIO_SERVICIO.FIJO ||
                            formData.tipoPrecio === TIPOS_PRECIO_SERVICIO.POR_HORA ||
                            formData.tipoPrecio === TIPOS_PRECIO_SERVICIO.POR_DIA ||
                            formData.tipoPrecio === TIPOS_PRECIO_SERVICIO.POR_SESION ||
                            formData.tipoPrecio === TIPOS_PRECIO_SERVICIO.PAQUETE) && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Precio *
                                    </label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-sm">
                                            $
                                        </span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.precio}
                                            onChange={(e) => handleInputChange('precio', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Gestión de cupos *
                            </label>
                            <select
                                value={formData.gestionCupos}
                                onChange={(e) => handleInputChange('gestionCupos', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value={GESTION_CUPOS.ILIMITADO}>Cupos ilimitados</option>
                                <option value={GESTION_CUPOS.LIMITADO}>Cupos limitados</option>
                                <option value={GESTION_CUPOS.UNICO}>Servicio único</option>
                            </select>
                        </div>

                        {formData.gestionCupos === GESTION_CUPOS.LIMITADO && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Cupos disponibles *
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.cuposDisponibles}
                                    onChange={(e) => handleInputChange('cuposDisponibles', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="0"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Disponibilidad */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                        Disponibilidad
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Días disponibles
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {diasSemana.map(dia => (
                                    <label key={dia.id} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.diasDisponibles.includes(dia.id)}
                                            onChange={() => handleDayToggle(dia.id)}
                                            className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{dia.nombre}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Horarios disponibles
                            </label>
                            <div className="space-y-2">
                                {horariosDisponibles.map(horario => (
                                    <label key={horario.id} className="flex items-start space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.horarios.includes(horario.id)}
                                            onChange={() => handleHorarioToggle(horario.id)}
                                            className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 mt-0.5"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{horario.nombre}</span>
                                    </label>
                                ))}
                            </div>

                            {formData.horarios.includes(HORARIOS_DISPONIBLES.PERSONALIZADO) && (
                                <input
                                    type="text"
                                    value={formData.horarioPersonalizado}
                                    onChange={(e) => handleInputChange('horarioPersonalizado', e.target.value)}
                                    className="w-full mt-3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Ej: Lunes a viernes 9:00-17:00"
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Ubicación */}
                {(formData.modalidad !== MODALIDAD_SERVICIO.VIRTUAL) && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                            Ubicación
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Ubicación del servicio
                            </label>
                            <input
                                type="text"
                                value={formData.ubicacion}
                                onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Ej: Centro de Córdoba, zona norte"
                            />
                        </div>
                    </div>
                )}

                {/* Imágenes */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                        Imágenes del Servicio
                    </h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Fotos (máximo 5)
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                            {formData.imagenes.map((imagen, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={imagen}
                                        alt={`Servicio ${index + 1}`}
                                        className={`w-full h-32 object-cover rounded-lg border-2 ${formData.imagenPrincipal === imagen
                                            ? 'border-orange-500'
                                            : 'border-gray-200 dark:border-gray-600'
                                            }`}
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => setMainImage(imagen)}
                                            className="p-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                                            title="Imagen principal"
                                        >
                                            <ImageIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {formData.imagenPrincipal === imagen && (
                                        <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
                                            Principal
                                        </div>
                                    )}
                                </div>
                            ))}

                            {formData.imagenes.length < 5 && (
                                <div className="relative">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center hover:border-orange-500 transition-colors cursor-pointer">
                                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            Subir imagen
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            La primera imagen será la principal si no seleccionas otra. Formatos: JPG, PNG. Máximo 5MB.
                        </p>
                    </div>
                </div>

                {/* Detalles del Servicio */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                        Detalles del Servicio
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Qué incluye el servicio
                            </label>
                            <textarea
                                value={formData.incluye}
                                onChange={(e) => handleInputChange('incluye', e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Ej: Materiales, herramientas, certificado, seguimiento..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Qué NO incluye
                            </label>
                            <textarea
                                value={formData.noIncluye}
                                onChange={(e) => handleInputChange('noIncluye', e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Ej: Transporte, materiales especiales..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Requisitos del cliente
                            </label>
                            <textarea
                                value={formData.requisitos}
                                onChange={(e) => handleInputChange('requisitos', e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Ej: Edad mínima, conocimientos previos..."
                            />
                        </div>
                    </div>
                </div>

                {/* Palabras Clave */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                        Optimización para Búsquedas
                    </h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Palabras clave para búsqueda
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {formData.palabrasClave.map((keyword, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200"
                                >
                                    {keyword}
                                    <button
                                        type="button"
                                        onClick={() => removeKeyword(keyword)}
                                        className="ml-2 text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={currentKeyword}
                                onChange={(e) => setCurrentKeyword(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Ej: clases, domicilio, personalizado..."
                            />
                            <button
                                type="button"
                                onClick={addKeyword}
                                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Información de Contacto */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                        Información de Contacto
                    </h2>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                        <p className="text-blue-800 dark:text-blue-300 text-sm">
                            <Info className="w-4 h-4 inline mr-2" />
                            Esta información se carga automáticamente desde tu perfil de tienda.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                WhatsApp
                            </label>
                            <input
                                type="tel"
                                value={formData.contacto.whatsapp}
                                onChange={(e) => handleNestedChange('contacto', 'whatsapp', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="549351xxxxxxx"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Teléfono
                            </label>
                            <input
                                type="tel"
                                value={formData.contacto.telefono}
                                onChange={(e) => handleNestedChange('contacto', 'telefono', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="351xxxxxxx"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.contacto.email}
                                onChange={(e) => handleNestedChange('contacto', 'email', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="contacto@ejemplo.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Mensaje predefinido WhatsApp
                            </label>
                            <input
                                type="text"
                                value={formData.contacto.mensaje}
                                onChange={(e) => handleNestedChange('contacto', 'mensaje', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Hola, me interesa tu servicio..."
                            />
                        </div>
                    </div>
                </div>

                {/* Estado del Servicio */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                        Estado del Servicio
                    </h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Estado *
                        </label>
                        <select
                            value={formData.estado}
                            onChange={(e) => handleInputChange('estado', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value={ESTADOS_SERVICIO.DISPONIBLE}>Disponible</option>
                            <option value={ESTADOS_SERVICIO.AGOTADO}>Sin cupos disponibles</option>
                            <option value={ESTADOS_SERVICIO.PAUSADO}>Pausado</option>
                            <option value={ESTADOS_SERVICIO.INACTIVO}>Inactivo</option>
                        </select>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-end">
                        {getValidationMessage()}
                    </div>
                    <div className="flex justify-end space-x-4 mt-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all disabled:opacity-50 flex items-center space-x-2 ${
                                justFailedValidation ? 'ring-4 ring-red-400 animate-pulse' : ''
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Guardando...</span>
                                </>
                            ) : justFailedValidation ? (
                                <span>Revisá los errores arriba</span>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>{servicio ? 'Actualizar' : 'Crear'} Servicio</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}