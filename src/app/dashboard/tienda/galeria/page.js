// src/app/dashboard/tienda/galeria/page.js
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  ChevronLeft,
  Calendar,
  Loader,
  X,
  Upload
} from 'lucide-react';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  orderBy,
  limit,
  startAfter
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { deleteImage } from '@/lib/actions/cloudinary';
import { extractPublicId } from '@/lib/helpers/cloudinaryHelpers';

export default function GaleriaManagementPage() {
  const { user, userData, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);

  const IMAGES_PER_PAGE = 20; // Número de imágenes por página

  // Form data
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [titulo, setTitulo] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (user?.uid) {
      loadImages();
    }
  }, [user?.uid]);

  const loadImages = async (loadMore = false) => {
    if (!user?.uid) return;

    if (loadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const galeriaRef = collection(db, 'galeria');
      let q;

      if (loadMore && lastVisible) {
        // Cargar más desde el último documento
        const { startAfter, limit } = await import('firebase/firestore');
        q = query(
          galeriaRef,
          where('userId', '==', user.uid),
          orderBy('fechaCreacion', 'desc'),
          startAfter(lastVisible),
          limit(IMAGES_PER_PAGE)
        );
      } else {
        // Carga inicial
        const { limit } = await import('firebase/firestore');
        q = query(
          galeriaRef,
          where('userId', '==', user.uid),
          orderBy('fechaCreacion', 'desc'),
          limit(IMAGES_PER_PAGE)
        );
      }

      const querySnapshot = await getDocs(q);

      const imagesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Guardar el último documento visible para paginación
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastVisible(lastDoc);

      // Verificar si hay más documentos
      setHasMore(querySnapshot.docs.length === IMAGES_PER_PAGE);

      if (loadMore) {
        setImages(prev => [...prev, ...imagesList]);
      } else {
        setImages(imagesList);
      }
    } catch (error) {
      console.error('Error cargando imágenes:', error);
      alert('Error al cargar la galería');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no puede superar los 5MB');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile && !editingImage) {
      alert('Por favor selecciona una imagen');
      return;
    }

    if (!titulo.trim()) {
      alert('Por favor ingresa un título');
      return;
    }

    setUploading(true);

    try {
      let imageUrl = editingImage?.imageUrl;

      // Si hay una nueva imagen, subirla a Cloudinary
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_GALLERY || 'family-market-gallery');
        formData.append('folder', `galeria/${user.uid}`);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error('Error al subir imagen a Cloudinary');
        }

        const data = await response.json();
        imageUrl = data.secure_url;

        // Si estamos editando y subimos una nueva imagen, borrar la anterior
        if (editingImage && editingImage.imageUrl) {
          const oldPublicId = extractPublicId(editingImage.imageUrl);
          if (oldPublicId) {
            await deleteImage(oldPublicId);
          }
        }
      }

      if (editingImage) {
        // Actualizar imagen existente
        const imageDocRef = doc(db, 'galeria', editingImage.id);
        await updateDoc(imageDocRef, {
          titulo: titulo.trim(),
          imageUrl,
          fechaActualizacion: serverTimestamp()
        });
      } else {
        // Crear nueva imagen
        await addDoc(collection(db, 'galeria'), {
          userId: user.uid,
          storeSlug: userData?.storeSlug || '',
          imageUrl,
          titulo: titulo.trim(),
          fechaCreacion: serverTimestamp()
        });
      }

      // Recargar imágenes
      await loadImages();
      handleCloseModal();

    } catch (error) {
      console.error('Error guardando imagen:', error);
      alert('Error al guardar la imagen. Inténtalo de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (image) => {
    setEditingImage(image);
    setTitulo(image.titulo);
    setImagePreview(image.imageUrl);
    setShowModal(true);
  };

  const handleDelete = async (image) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
      return;
    }

    try {
      // Eliminar de Cloudinary primero
      if (image.imageUrl) {
        const publicId = extractPublicId(image.imageUrl);
        if (publicId) {
          await deleteImage(publicId);
        }
      }

      // Eliminar de Firestore
      await deleteDoc(doc(db, 'galeria', image.id));

      // Actualizar lista
      setImages(prev => prev.filter(img => img.id !== image.id));

    } catch (error) {
      console.error('Error eliminando imagen:', error);
      alert('Error al eliminar la imagen');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingImage(null);
    setImageFile(null);
    setImagePreview(null);
    setTitulo('');
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Fecha desconocida';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Cargando galería...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !userData) {
    return null;
  }

  return (
    <div>

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.push('/dashboard/tienda')}
            className="flex items-center text-white/80 hover:text-white mb-4 transition-colors text-sm group"
          >
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Volver a Mi Tienda
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-white/30">
                <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  Galería de Imágenes
                </h1>
                <p className="text-white/80 text-sm sm:text-base">
                  {images.length} imagen{images.length !== 1 ? 'es' : ''} en tu galería
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-2 bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Agregar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {images.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay imágenes en tu galería
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Comienza a agregar imágenes de tu negocio para mostrarlas a tus clientes
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Agregar primera imagen</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {images.map((image) => (
              <div
                key={image.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-square">
                  <img
                    src={image.imageUrl}
                    alt={image.titulo}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {image.titulo}
                  </h3>

                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    <span>{formatDate(image.fechaCreacion)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(image)}
                      className="flex-1 flex items-center justify-center space-x-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={() => handleDelete(image)}
                      className="flex items-center justify-center bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botón Cargar Más */}
        {!loading && images.length > 0 && hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={() => loadImages(true)}
              disabled={loadingMore}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingMore ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Cargando más...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Cargar más imágenes</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Modal Agregar/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingImage ? 'Editar Imagen' : 'Agregar Imagen'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Preview de imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Imagen {editingImage && '(opcional - deja vacío para mantener la actual)'}
                </label>

                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(editingImage?.imageUrl || null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Click para seleccionar imagen
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      PNG, JPG (máx. 5MB)
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>

              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Nuestro local, Producto destacado..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              {/* Botones */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {uploading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin mr-2" />
                      {editingImage ? 'Actualizando...' : 'Subiendo...'}
                    </>
                  ) : (
                    editingImage ? 'Actualizar' : 'Agregar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}