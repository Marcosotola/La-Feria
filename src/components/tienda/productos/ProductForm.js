// src/components/tienda/productos/ProductForm.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  ESTADOS_PRODUCTO, 
  CONDICION_PRODUCTO, 
  TIPOS_PRECIO, 
  GESTION_STOCK,
  validarProducto
} from '@/types/product';
import { generarSlugProducto } from '@/lib/helpers/productHelpers';
import { CATEGORIAS_PRODUCTOS } from '@/types/categories';
import { 
  X, 
  Upload, 
  Trash2, 
  Save, 
  ArrowLeft, 
  Image as ImageIcon,
  Plus,
  Info,
  // Iconos para categorías
  Smartphone, Car, Home, Shirt, Sofa, PawPrint, UtensilsCrossed, Palette, 
  Dumbbell, BookOpen, Baby, Heart, Music, Building2, Package, Briefcase
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// Mapeo de iconos para categorías de productos (actualizado con tu estructura)
const categoryIconMap = {
  'tecnologia': Smartphone,
  'vehiculos': Car,
  'inmuebles': Home,
  'moda_belleza': Shirt,
  'hogar_decoracion': Sofa,
  'mascotas': PawPrint,
  'alimentos_bebidas': UtensilsCrossed,
  'arte_manualidades': Palette,
  'deportes_fitness': Dumbbell,
  'libros_educacion': BookOpen,
  'bebes_ninos': Baby,
  'salud_bienestar': Heart,
  'musica_entretenimiento': Music,
  'industria_comercio': Building2,
  'servicios': Package, // Podrías usar un ícono específico
  'trabajo': Briefcase,
  'otros': Package
};

export default function ProductForm({ 
  producto = null, 
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
    precio: '',
    tipoPrecio: TIPOS_PRECIO.FIJO,
    moneda: 'ARS',
    gestionStock: GESTION_STOCK.ILIMITADO,
    stock: '',
    stockMinimo: '',
    imagenes: [],
    imagenPrincipal: '',
    estado: ESTADOS_PRODUCTO.DISPONIBLE,
    condicion: CONDICION_PRODUCTO.NUEVO,
    peso: '',
    unidadPeso: 'gramos',
    palabrasClave: [],
    contacto: {
      whatsapp: '',
      telefono: '',
      email: '',
      mensaje: ''
    },
    entrega: {
      enLocal: false,
      delivery: false,
      puntoEncuentro: false,
      costoDelivery: '',
      tiempoPreparacion: ''
    }
  });

  const [errores, setErrores] = useState([]);
  const [justFailedValidation, setJustFailedValidation] = useState(false);
  const errorBannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [currentKeyword, setCurrentKeyword] = useState('');

  // Cargar datos de la tienda
  useEffect(() => {
    const loadStoreData = async () => {
      if (!user?.uid) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setStoreData(userData);
          
          // Auto-completar datos de contacto desde storeData
          setFormData(prev => ({
            ...prev,
            contacto: {
              whatsapp: userData.phone || '',
              telefono: userData.phone || '',
              email: userData.email || '',
              mensaje: prev.contacto.mensaje || 'Hola! Me interesa tu producto'
            }
          }));
        }
      } catch (error) {
        console.error('Error cargando datos de la tienda:', error);
      }
    };

    loadStoreData();
  }, [user]);

  // Inicializar formulario si hay producto existente
  useEffect(() => {
    if (producto) {
      setFormData({
        ...producto,
        precio: producto.precio?.toString() || '',
        stock: producto.stock?.toString() || '',
        stockMinimo: producto.stockMinimo?.toString() || '',
        peso: producto.peso?.toString() || '',
        entrega: {
          ...producto.entrega,
          costoDelivery: producto.entrega?.costoDelivery?.toString() || ''
        }
      });
    }
  }, [producto]);

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

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen');
      return;
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar los 5MB');
      return;
    }

    try {
      // Crear FormData para subir a Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_PRODUCTS);

      // Subir a Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Error al subir la imagen');
      }

      const data = await response.json();
      const imageUrl = data.secure_url;

      // Agregar imagen al formulario
      setFormData(prev => {
        const newImages = [...prev.imagenes, imageUrl];
        return {
          ...prev,
          imagenes: newImages.slice(0, 3), // Máximo 3 imágenes
          imagenPrincipal: prev.imagenPrincipal || imageUrl
        };
      });

      // Limpiar el input
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Preparar datos para validación y envío
    const productData = {
      ...formData,
      usuarioId: storeId,
      tiendaId: storeId,
      nombre: formData.titulo,
      precio: parseFloat(formData.precio) || 0,
      stock: formData.gestionStock === GESTION_STOCK.LIMITADO ? parseInt(formData.stock) || 0 : null,
      stockMinimo: parseInt(formData.stockMinimo) || 0,
      peso: parseFloat(formData.peso) || null,
      slug: generarSlugProducto(formData.titulo, Date.now().toString()),
      entrega: {
        ...formData.entrega,
        costoDelivery: parseFloat(formData.entrega.costoDelivery) || 0
      },
      fechaActualizacion: new Date().toISOString()
    };

    // Validar
    const validationErrors = validarProducto(productData);
    if (validationErrors.length > 0) {
      setErrores(validationErrors);
      errorBannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setJustFailedValidation(true);
      setTimeout(() => setJustFailedValidation(false), 2500);
      return;
    }

    setErrores([]);
    onSave(productData);
  };

  const categorias = Object.values(CATEGORIAS_PRODUCTOS).map(categoria => ({
    ...categoria,
    icon: categoryIconMap[categoria.id] || Package
  }));

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
            {producto ? 'Editar Producto' : 'Nuevo Producto'}
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
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Título del producto *
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => handleInputChange('titulo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ej: Dulce de leche artesanal"
                maxLength={100}
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción *
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Describe tu producto, ingredientes, características especiales..."
                maxLength={1000}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formData.descripcion.length}/1000 caracteres
              </p>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoría y Subcategoría *
              </label>
              
              {/* Selector visual de categorías */}
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 max-h-96 overflow-y-auto">
                {categorias.map(categoria => (
                  <div key={categoria.id} className="border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                    {/* Categoría principal */}
                    <div
                      onClick={() => {
                        if (formData.categoria === categoria.id) {
                          // Si ya está seleccionada, la deseleccionamos
                          handleInputChange('categoria', '');
                          handleInputChange('subcategoria', '');
                        } else {
                          // Seleccionamos la nueva categoría
                          handleInputChange('categoria', categoria.id);
                          handleInputChange('subcategoria', '');
                        }
                      }}
                      className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ${
                        formData.categoria === categoria.id 
                          ? 'bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500' 
                          : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          formData.categoria === categoria.id 
                            ? 'bg-orange-500 text-white' 
                            : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                        }`}>
                          <categoria.icon className="w-4 h-4" />
                        </div>
                        <span className={`font-medium ${
                          formData.categoria === categoria.id 
                            ? 'text-orange-700 dark:text-orange-300' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {categoria.nombre}
                        </span>
                      </div>
                      
                      {/* Indicador de expansión */}
                      <div className={`transform transition-transform ${
                        formData.categoria === categoria.id ? 'rotate-180' : ''
                      }`}>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Subcategorías */}
                    {formData.categoria === categoria.id && categoria.subcategorias && (
                      <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600">
                        <div className="p-2">
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">
                            Selecciona una subcategoría (opcional):
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                            {Object.entries(categoria.subcategorias).map(([key, value]) => (
                              <button
                                key={key}
                                type="button"
                                onClick={() => handleInputChange('subcategoria', value)}
                                className={`text-left px-3 py-2 text-sm rounded-md transition-colors ${
                                  formData.subcategoria === value
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/20 border border-gray-200 dark:border-gray-600'
                                }`}
                              >
                                {value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Selección actual */}
              {(formData.categoria || formData.subcategoria) && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.categoria && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                      {categorias.find(c => c.id === formData.categoria)?.nombre}
                      {formData.subcategoria && (
                        <>
                          <span className="mx-1">›</span>
                          {formData.subcategoria.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          handleInputChange('categoria', '');
                          handleInputChange('subcategoria', '');
                        }}
                        className="ml-2 text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Estado y Condición */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Estado del Producto
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado *
              </label>
              <select
                value={formData.estado}
                onChange={(e) => handleInputChange('estado', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={ESTADOS_PRODUCTO.DISPONIBLE}>Disponible</option>
                <option value={ESTADOS_PRODUCTO.AGOTADO}>Agotado</option>
                <option value={ESTADOS_PRODUCTO.PAUSADO}>Pausado</option>
                <option value={ESTADOS_PRODUCTO.INACTIVO}>Inactivo</option>
              </select>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Controla la visibilidad del producto en tu tienda
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Condición *
              </label>
              <select
                value={formData.condicion}
                onChange={(e) => handleInputChange('condicion', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={CONDICION_PRODUCTO.NUEVO}>Nuevo</option>
                <option value={CONDICION_PRODUCTO.USADO}>Usado</option>
                <option value={CONDICION_PRODUCTO.REACONDICIONADO}>Reacondicionado</option>
                <option value={CONDICION_PRODUCTO.ARTESANAL}>Artesanal</option>
              </select>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Indica el estado físico del producto
              </p>
            </div>
          </div>
        </div>

        {/* Precio y Stock */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Precio y Stock
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
                <option value={TIPOS_PRECIO.FIJO}>Precio fijo</option>
                <option value={TIPOS_PRECIO.NEGOCIABLE}>Negociable</option>
                <option value={TIPOS_PRECIO.CONSULTAR}>A consultar</option>
                <option value={TIPOS_PRECIO.GRATIS}>Gratis</option>
              </select>
            </div>

            {formData.tipoPrecio === TIPOS_PRECIO.FIJO && (
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
                Gestión de stock *
              </label>
              <select
                value={formData.gestionStock}
                onChange={(e) => handleInputChange('gestionStock', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={GESTION_STOCK.ILIMITADO}>Stock ilimitado</option>
                <option value={GESTION_STOCK.LIMITADO}>Stock limitado</option>
                <option value={GESTION_STOCK.BAJO_PEDIDO}>Bajo pedido</option>
              </select>
            </div>

            {formData.gestionStock === GESTION_STOCK.LIMITADO && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stock disponible *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stock mínimo
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockMinimo}
                    onChange={(e) => handleInputChange('stockMinimo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Te avisaremos cuando el stock esté bajo
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Imágenes */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Imágenes del Producto
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fotos * (máximo 3)
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {formData.imagenes.map((imagen, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imagen}
                    alt={`Producto ${index + 1}`}
                    className={`w-full h-32 object-cover rounded-lg border-2 ${
                      formData.imagenPrincipal === imagen 
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
              
              {formData.imagenes.length < 3 && (
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

        {/* Características Físicas */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Características Físicas
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                Peso del producto
                <div className="ml-2 group relative">
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    Peso total del producto empaquetado
                  </div>
                </div>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.peso}
                onChange={(e) => handleInputChange('peso', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0.00"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Importante para calcular costos de envío
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Unidad de medida
              </label>
              <select
                value={formData.unidadPeso}
                onChange={(e) => handleInputChange('unidadPeso', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="gramos">Gramos (g)</option>
                <option value="kilogramos">Kilogramos (kg)</option>
                <option value="mililitros">Mililitros (ml)</option>
                <option value="litros">Litros (l)</option>
                <option value="unidad">Por unidad</option>
              </select>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Selecciona la unidad más apropiada para tu producto
              </p>
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
                placeholder="Ej: artesanal, casero, natural..."
              />
              <button
                type="button"
                onClick={addKeyword}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Agrega palabras que los clientes podrían usar para buscar tu producto
            </p>
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
              Esta información se carga automáticamente desde tu perfil de tienda. Puedes personalizarla para este producto específico.
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
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Número con código de país (ej: 549351xxxxxxx)
              </p>
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
                placeholder="Hola, me interesa tu producto..."
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Mensaje que aparecerá al hacer clic en WhatsApp
              </p>
            </div>
          </div>
        </div>

        {/* Opciones de Entrega */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Opciones de Entrega
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="enLocal"
                checked={formData.entrega.enLocal}
                onChange={(e) => handleNestedChange('entrega', 'enLocal', e.target.checked)}
                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mt-1"
              />
              <div>
                <label htmlFor="enLocal" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Retiro en local
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  El cliente puede retirar el producto en tu domicilio/local comercial
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="delivery"
                checked={formData.entrega.delivery}
                onChange={(e) => handleNestedChange('entrega', 'delivery', e.target.checked)}
                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mt-1"
              />
              <div>
                <label htmlFor="delivery" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Delivery
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Entregas a domicilio en tu zona de cobertura
                </p>
              </div>
            </div>

            {formData.entrega.delivery && (
              <div className="ml-7 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Costo de delivery
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.entrega.costoDelivery}
                      onChange={(e) => handleNestedChange('entrega', 'costoDelivery', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tiempo de preparación
                  </label>
                  <input
                    type="text"
                    value={formData.entrega.tiempoPreparacion}
                    onChange={(e) => handleNestedChange('entrega', 'tiempoPreparacion', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Ej: 24 horas, mismo día"
                  />
                </div>
              </div>
            )}

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="puntoEncuentro"
                checked={formData.entrega.puntoEncuentro}
                onChange={(e) => handleNestedChange('entrega', 'puntoEncuentro', e.target.checked)}
                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mt-1"
              />
              <div>
                <label htmlFor="puntoEncuentro" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Punto de encuentro
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Acordar un lugar específico para encontrarse (plaza, estación, etc.)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
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
                <span>{producto ? 'Actualizar' : 'Crear'} Producto</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}