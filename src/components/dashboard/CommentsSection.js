// src/components/dashboard/CommentsSection.js
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MessageSquare,
  Package,
  Wrench,
  Briefcase,
  Calendar,
  User,
  ExternalLink,
  Star,
  Search,
  Loader,
  Trash2,
  Grid3X3,
  List
} from 'lucide-react';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  getDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function CommentsSection() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('received');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');

  useEffect(() => {
    if (user?.uid) {
      loadComments();
    }
  }, [user?.uid, activeTab]);

  const loadComments = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      let allComments = [];

      if (activeTab === 'made') {
        allComments = await getCommentsMadeByUser(user.uid);
      } else {
        allComments = await getCommentsReceivedByUser(user.uid);
      }

      // Ordenar por fecha más reciente
      allComments.sort((a, b) => b.fechaCreacion - a.fechaCreacion);
      setComments(allComments);
    } catch (error) {
      console.error('Error cargando comentarios:', error);
    } finally {
      setLoading(false);
    }
  };

  // Verificar si un item existe
  const itemExists = async (collectionName, itemId) => {
    try {
      const itemRef = doc(db, collectionName, itemId);
      const itemSnap = await getDoc(itemRef);
      return itemSnap.exists();
    } catch (error) {
      console.error('Error verificando item:', error);
      return false;
    }
  };

  // Obtener comentarios que el usuario hizo
  const getCommentsMadeByUser = async (userId) => {
    const allComments = [];

    // Comentarios en productos
    const productCommentsRef = collection(db, 'comentarios');
    const productQuery = query(
      productCommentsRef,
      where('usuarioId', '==', userId),
      orderBy('fechaCreacion', 'desc')
    );
    const productSnapshot = await getDocs(productQuery);

    for (const commentDoc of productSnapshot.docs) {
      const commentData = commentDoc.data();
      
      // Verificar si el producto existe
      const exists = await itemExists('productos', commentData.productoId);
      
      if (exists) {
        const itemData = await getItemData('productos', commentData.productoId);
        allComments.push({
          id: commentDoc.id,
          type: 'product',
          ...commentData,
          fechaCreacion: commentData.fechaCreacion?.toDate() || new Date(),
          itemData
        });
      } else {
        // Si no existe, eliminar el comentario
        await deleteDoc(doc(db, 'comentarios', commentDoc.id));
        console.log(`Comentario eliminado (producto no existe): ${commentDoc.id}`);
      }
    }

    // Comentarios en servicios
    const serviceCommentsRef = collection(db, 'comentarios_servicios');
    const serviceQuery = query(
      serviceCommentsRef,
      where('usuarioId', '==', userId),
      orderBy('fechaCreacion', 'desc')
    );
    const serviceSnapshot = await getDocs(serviceQuery);

    for (const commentDoc of serviceSnapshot.docs) {
      const commentData = commentDoc.data();
      
      const exists = await itemExists('servicios', commentData.servicioId);
      
      if (exists) {
        const itemData = await getItemData('servicios', commentData.servicioId);
        allComments.push({
          id: commentDoc.id,
          type: 'service',
          ...commentData,
          fechaCreacion: commentData.fechaCreacion?.toDate() || new Date(),
          itemData
        });
      } else {
        await deleteDoc(doc(db, 'comentarios_servicios', commentDoc.id));
        console.log(`Comentario eliminado (servicio no existe): ${commentDoc.id}`);
      }
    }

    // Comentarios en empleos
    const jobCommentsRef = collection(db, 'comentarios_empleos');
    const jobQuery = query(
      jobCommentsRef,
      where('usuarioId', '==', userId),
      orderBy('fechaCreacion', 'desc')
    );
    const jobSnapshot = await getDocs(jobQuery);

    for (const commentDoc of jobSnapshot.docs) {
      const commentData = commentDoc.data();
      
      const exists = await itemExists('empleos', commentData.empleoId);
      
      if (exists) {
        const itemData = await getItemData('empleos', commentData.empleoId);
        allComments.push({
          id: commentDoc.id,
          type: 'job',
          ...commentData,
          fechaCreacion: commentData.fechaCreacion?.toDate() || new Date(),
          itemData
        });
      } else {
        await deleteDoc(doc(db, 'comentarios_empleos', commentDoc.id));
        console.log(`Comentario eliminado (empleo no existe): ${commentDoc.id}`);
      }
    }

    return allComments;
  };

  // Obtener comentarios que el usuario recibió
  const getCommentsReceivedByUser = async (userId) => {
    const allComments = [];

    // Primero obtener todos los items del usuario
    const userProducts = await getUserItems('productos', userId);
    const userServices = await getUserItems('servicios', userId);
    const userJobs = await getUserItems('empleos', userId);

    // Comentarios en productos del usuario
    for (const productId of userProducts) {
      const productCommentsRef = collection(db, 'comentarios');
      const productQuery = query(
        productCommentsRef,
        where('productoId', '==', productId)
      );
      const snapshot = await getDocs(productQuery);

      for (const commentDoc of snapshot.docs) {
        const commentData = commentDoc.data();
        const itemData = await getItemData('productos', productId);
        const userData = await getUserData(commentData.usuarioId);

        allComments.push({
          id: commentDoc.id,
          type: 'product',
          ...commentData,
          fechaCreacion: commentData.fechaCreacion?.toDate() || new Date(),
          itemData,
          userData
        });
      }
    }

    // Comentarios en servicios del usuario
    for (const serviceId of userServices) {
      const serviceCommentsRef = collection(db, 'comentarios_servicios');
      const serviceQuery = query(
        serviceCommentsRef,
        where('servicioId', '==', serviceId)
      );
      const snapshot = await getDocs(serviceQuery);

      for (const commentDoc of snapshot.docs) {
        const commentData = commentDoc.data();
        const itemData = await getItemData('servicios', serviceId);
        const userData = await getUserData(commentData.usuarioId);

        allComments.push({
          id: commentDoc.id,
          type: 'service',
          ...commentData,
          fechaCreacion: commentData.fechaCreacion?.toDate() || new Date(),
          itemData,
          userData
        });
      }
    }

    // Comentarios en empleos del usuario
    for (const jobId of userJobs) {
      const jobCommentsRef = collection(db, 'comentarios_empleos');
      const jobQuery = query(
        jobCommentsRef,
        where('empleoId', '==', jobId)
      );
      const snapshot = await getDocs(jobQuery);

      for (const commentDoc of snapshot.docs) {
        const commentData = commentDoc.data();
        const itemData = await getItemData('empleos', jobId);
        const userData = await getUserData(commentData.usuarioId);

        allComments.push({
          id: commentDoc.id,
          type: 'job',
          ...commentData,
          fechaCreacion: commentData.fechaCreacion?.toDate() || new Date(),
          itemData,
          userData
        });
      }
    }

    return allComments;
  };

  // Helpers
  const getUserItems = async (collectionName, userId) => {
    const itemsRef = collection(db, collectionName);
    const q = query(itemsRef, where('usuarioId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.id);
  };

  const getItemData = async (collectionName, itemId) => {
    try {
      const itemRef = doc(db, collectionName, itemId);
      const itemSnap = await getDoc(itemRef);
      
      if (itemSnap.exists()) {
        const data = itemSnap.data();
        return {
          id: itemId,
          title: data.titulo || data.nombre || 'Sin título',
          image: data.imagen || data.imagenes?.[0] || null
        };
      }
    } catch (error) {
      console.error('Error obteniendo item:', error);
    }
    
    return null;
  };

  const getUserData = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          name: data.firstName && data.lastName 
            ? `${data.firstName} ${data.lastName}`
            : data.firstName || data.businessName || 'Usuario',
          avatar: data.profileImage || data.storeLogo || null
        };
      }
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
    }
    
    return {
      name: 'Usuario',
      avatar: null
    };
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'product': return Package;
      case 'service': return Wrench;
      case 'job': return Briefcase;
      default: return MessageSquare;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'product': return 'Producto';
      case 'service': return 'Servicio';
      case 'job': return 'Empleo';
      default: return 'Item';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'product': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'service': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'job': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
      default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleDeleteComment = async (commentId, commentType) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      return;
    }

    try {
      let collectionName;
      switch (commentType) {
        case 'product':
          collectionName = 'comentarios';
          break;
        case 'service':
          collectionName = 'comentarios_servicios';
          break;
        case 'job':
          collectionName = 'comentarios_empleos';
          break;
        default:
          throw new Error('Tipo de comentario no válido');
      }

      const commentRef = doc(db, collectionName, commentId);
      await deleteDoc(commentRef);

      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      alert('No se pudo eliminar el comentario. Inténtalo de nuevo.');
    }
  };

  const handleViewItem = (comment) => {
    const baseUrl = 'https://laferia.vercel.app';
    let url = '';
    
    if (comment.type === 'product') {
      const storeSlug = comment.itemData?.storeSlug || 'tienda';
      const productId = comment.productoId || comment.itemData?.id;
      url = `${baseUrl}/tienda/${storeSlug}/producto/${productId}`;
    } else if (comment.type === 'service') {
      const storeSlug = comment.itemData?.storeSlug || 'tienda';
      url = `${baseUrl}/tienda/${storeSlug}/servicios`;
    } else if (comment.type === 'job') {
      const storeSlug = comment.itemData?.storeSlug || 'tienda';
      url = `${baseUrl}/tienda/${storeSlug}/empleos`;
    }
    
    if (url) {
      window.open(url, '_blank');
    }
  };

  const filteredComments = comments.filter(comment => {
    // Validar que itemData existe antes de filtrar
    if (!comment.itemData) return false;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      comment.contenido?.toLowerCase().includes(searchLower) ||
      comment.itemData?.title?.toLowerCase().includes(searchLower) ||
      comment.userData?.name?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando comentarios...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Comentarios
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {comments.length} comentario{comments.length !== 1 ? 's' : ''} {activeTab === 'received' ? 'recibido' : 'realizado'}{comments.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Controles de vista */}
          <div className="flex items-center space-x-2">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs y búsqueda */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('received')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'received'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Recibidos
            </button>
            <button
              onClick={() => setActiveTab('made')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'made'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Realizados
            </button>
          </div>

          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar comentarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Lista de comentarios */}
      <div className="p-6">
        {filteredComments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'No se encontraron resultados' : 'No hay comentarios'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda'
                : activeTab === 'received' 
                  ? 'Aún no has recibido comentarios en tus publicaciones'
                  : 'Aún no has hecho comentarios'
              }
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'
            : 'overflow-x-auto'
          }>
            {viewMode === 'grid' ? (
              // Vista Grid (Mantén tu código de grid actual...)
              filteredComments.map((comment) => {
                const TypeIcon = getTypeIcon(comment.type);
                
                return (
                  <div
                    key={comment.id}
                    className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all hover:shadow-md overflow-hidden"
                  >
                    {comment.itemData?.image && (
                      <div className="relative h-40">
                        <img
                          src={comment.itemData.image}
                          alt={comment.itemData.title}
                          className="w-full h-full object-cover"
                        />
                        <span className={`absolute top-2 left-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(comment.type)}`}>
                          <TypeIcon className="w-3 h-3 mr-1" />
                          {getTypeLabel(comment.type)}
                        </span>
                      </div>
                    )}

                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {comment.itemData?.title || 'Sin título'}
                      </h3>

                      {activeTab === 'received' && comment.userData && (
                        <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mb-2">
                          <User className="w-3 h-3 mr-1" />
                          <span className="truncate">{comment.userData.name}</span>
                        </div>
                      )}

                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">
                        {comment.contenido}
                      </p>

                      {comment.puntuacion && (
                        <div className="flex items-center mb-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= comment.puntuacion
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>{formatDate(comment.fechaCreacion)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewItem(comment)}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 p-1"
                            title="Ver publicación"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteComment(comment.id, comment.type)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1"
                            title="Eliminar comentario"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              // Vista Tabla (Mantén tu código de tabla actual pero solo renderiza si itemData existe)
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Imagen
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Título
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Comentario
                    </th>
                    {activeTab === 'received' && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Usuario
                      </th>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredComments.map((comment) => {
                    const TypeIcon = getTypeIcon(comment.type);
                    
                    return (
                      <tr key={comment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="w-12 h-12 flex-shrink-0 rounded overflow-hidden">
                            {comment.itemData?.image ? (
                              <img
                                src={comment.itemData.image}
                                alt={comment.itemData.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white max-w-xs truncate">
                            {comment.itemData?.title || 'Sin título'}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(comment.type)}`}>
                            <TypeIcon className="w-3 h-3 mr-1" />
                            {getTypeLabel(comment.type)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-700 dark:text-gray-300 max-w-md truncate">
                            {comment.contenido}
                          </div>
                        </td>
                        {activeTab === 'received' && (
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <User className="w-3.5 h-3.5 mr-1" />
                              <span className="truncate max-w-[120px]">
                                {comment.userData?.name || 'Usuario'}
                              </span>
                            </div>
                          </td>
                        )}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {comment.puntuacion ? (
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3.5 h-3.5 ${
                                    star <= comment.puntuacion
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300 dark:text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Sin rating</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="w-3.5 h-3.5 mr-1" />
                            <span>{formatDate(comment.fechaCreacion)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewItem(comment)}
                              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 p-1"
                              title="Ver publicación"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => handleDeleteComment(comment.id, comment.type)}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1"
                              title="Eliminar comentario"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}