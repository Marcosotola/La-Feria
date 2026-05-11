// src/components/dashboard/FavoritesSection.js
'use client';

import { useState, useEffect } from 'react';
import { useFavorites } from '@/lib/hooks/useFavorites';
import { 
  Heart, 
  Package, 
  Wrench, 
  Briefcase,
  Search,
  MapPin,
  ExternalLink,
  Trash2,
  Grid3X3,
  List,
  AlertCircle,
  RefreshCw,
  X,
  CheckCircle,
  Info
} from 'lucide-react';

export default function FavoritesSection() {
  const { 
    favorites, 
    loading, 
    error,
    orphanedCount,
    removeFavoriteById,
    getFavoritesByType,
    refreshFavorites
  } = useFavorites();
  
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [notification, setNotification] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mostrar notificación de limpieza automática
  useEffect(() => {
    if (orphanedCount > 0) {
      showNotification(
        `Se eliminaron ${orphanedCount} favorito${orphanedCount > 1 ? 's' : ''} porque ${orphanedCount > 1 ? 'los elementos ya no existen' : 'el elemento ya no existe'}`,
        'info'
      );
    }
  }, [orphanedCount]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const getTabIcon = (type) => {
    switch (type) {
      case 'product': return Package;
      case 'service': return Wrench;
      case 'job': return Briefcase;
      default: return Heart;
    }
  };

  const getTabLabel = (type) => {
    switch (type) {
      case 'product': return 'Productos';
      case 'service': return 'Servicios';
      case 'job': return 'Empleos';
      default: return 'Todos';
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

  const filteredFavorites = favorites.filter(favorite => {
    // Validar que itemData existe
    if (!favorite.itemData) return false;
    
    const matchesTab = activeTab === 'all' || favorite.itemType === activeTab;
    const matchesSearch = favorite.itemData?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         favorite.itemData?.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleRemoveFavorite = async (favoriteId, itemType) => {
    try {
      await removeFavoriteById(favoriteId, itemType);
      showNotification('Favorito eliminado correctamente', 'success');
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
      showNotification('No se pudo eliminar el favorito', 'error');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshFavorites();
      showNotification('Favoritos actualizados', 'success');
    } catch (error) {
      showNotification('Error al actualizar favoritos', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return null;
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  const handleViewItem = (favorite) => {
    const baseUrl = 'https://laferia.vercel.app';
    let url = '';
    
    if (favorite.itemType === 'product') {
      const storeSlug = favorite.itemData?.storeSlug || 'tienda';
      url = `${baseUrl}/tienda/${storeSlug}/producto/${favorite.itemId}`;
    } else if (favorite.itemType === 'service') {
      const storeSlug = favorite.itemData?.storeSlug || 'tienda';
      url = `${baseUrl}/tienda/${storeSlug}/servicios`;
    } else if (favorite.itemType === 'job') {
      const storeSlug = favorite.itemData?.storeSlug || 'tienda';
      url = `${baseUrl}/tienda/${storeSlug}/empleos`;
    }
    
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col items-center justify-center py-8 text-red-600 dark:text-red-400">
          <AlertCircle className="w-12 h-12 mb-4" />
          <span className="text-lg font-medium mb-2">{error}</span>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Notificación */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 max-w-md ${
          notification.type === 'success' ? 'bg-green-500' :
          notification.type === 'error' ? 'bg-red-500' :
          'bg-blue-500'
        } text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 animate-slide-in`}>
          {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {notification.type === 'error' && <AlertCircle className="w-5 h-5" />}
          {notification.type === 'info' && <Info className="w-5 h-5" />}
          <span className="flex-1">{notification.message}</span>
          <button 
            onClick={() => setNotification(null)}
            className="hover:bg-white/20 rounded p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Mis Favoritos
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {favorites.length} elemento{favorites.length !== 1 ? 's' : ''} guardado{favorites.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Controles de vista */}
          <div className="flex items-center space-x-2">
            {/* Botón refrescar */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
              title="Actualizar favoritos"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Toggle vista */}
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
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 overflow-x-auto">
            {['all', 'product', 'service', 'job'].map((tab) => {
              const TabIcon = getTabIcon(tab);
              const count = getFavoritesByType(tab);
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <TabIcon className="w-4 h-4" />
                    <span className="hidden sm:block">{getTabLabel(tab)}</span>
                    <span className="bg-gray-200 dark:bg-gray-500 text-xs px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar favoritos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full lg:w-64"
            />
          </div>
        </div>
      </div>

      {/* Lista de favoritos */}
      <div className="p-6">
        {filteredFavorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'No se encontraron resultados' : 'No tienes favoritos'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza a marcar productos, servicios o empleos como favoritos.'
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'
            : 'overflow-x-auto'
          }>
            {viewMode === 'grid' ? (
              // Vista Grid
              filteredFavorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all hover:shadow-md overflow-hidden group"
                >
                  <div className="relative">
                    <img
                      src={favorite.itemData?.image || '/placeholder-image.jpg'}
                      alt={favorite.itemData?.title || 'Sin título'}
                      className="w-full h-32 sm:h-40 object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                    <button
                      onClick={() => handleRemoveFavorite(favorite.id, favorite.itemType)}
                      className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-1.5 text-red-500 hover:text-red-600 hover:bg-white dark:hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100"
                      title="Quitar de favoritos"
                    >
                      <Heart className="w-3 h-3 fill-current" />
                    </button>
                    <span className={`absolute top-2 left-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(favorite.itemType)}`}>
                      {getTabLabel(favorite.itemType).slice(0, -1)}
                    </span>
                  </div>
                  
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 min-h-[2.5rem]">
                      {favorite.itemData?.title || 'Sin título'}
                    </h3>
                    
                    {favorite.itemData?.price ? (
                      <p className="text-base font-bold text-green-600 dark:text-green-400">
                        {formatPrice(favorite.itemData.price)}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Consultar precio
                      </p>
                    )}
                    
                    <button 
                      onClick={() => handleViewItem(favorite)}
                      className="w-full mt-2 text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium py-1.5 border border-primary-200 dark:border-primary-800 rounded hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                    >
                      Ver detalles
                    </button>
                  </div>
                </div>
              ))
            ) : (
              // Vista Tabla
              <table className="w-full min-w-[800px]">
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
                      Precio
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Ubicación
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Dueño
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredFavorites.map((favorite) => (
                    <tr key={favorite.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="w-12 h-12 flex-shrink-0 rounded overflow-hidden">
                          <img
                            src={favorite.itemData?.image || '/placeholder-image.jpg'}
                            alt={favorite.itemData?.title || 'Sin título'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/placeholder-image.jpg';
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white max-w-xs truncate">
                          {favorite.itemData?.title || 'Sin título'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                          {favorite.itemData?.description || ''}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(favorite.itemType)}`}>
                          {getTabLabel(favorite.itemType).slice(0, -1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {favorite.itemData?.price ? (
                          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                            {formatPrice(favorite.itemData.price)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Consultar
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                          <span className="truncate max-w-[150px]">{favorite.itemData?.location || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[120px] block">
                          {favorite.itemData?.ownerName || 'Desconocido'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewItem(favorite)}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 p-1 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors"
                            title="Ver publicación"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleRemoveFavorite(favorite.id, favorite.itemType)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Quitar de favoritos"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}