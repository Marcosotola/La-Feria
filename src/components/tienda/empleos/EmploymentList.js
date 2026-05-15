// src/components/tienda/empleos/EmploymentList.js
'use client';

import { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Briefcase,
  User as UserIcon,
  Wrench,
  Package,
  Star,
  Copy,
  Play,
  Pause,
  Grid3X3,
  List
} from 'lucide-react';
import { TIPOS_PUBLICACION } from '@/types/employment';

export default function EmploymentList({
  publicaciones = [],
  onEdit,
  onDelete,
  onToggleStatus,
  onDuplicate,
  onView,
  onCreateNew,
  onFeature,
  isLoading = false
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('fechaCreacion');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('table');

  // Filtrar y ordenar publicaciones
  const filteredPublicaciones = publicaciones
    .filter(pub => {
      const matchesSearch = pub.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pub.descripcion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pub.empresa?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = filterType === 'all' || pub.tipoPublicacion === filterType;

      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'titulo':
          aValue = (a.titulo || '').toLowerCase();
          bValue = (b.titulo || '').toLowerCase();
          break;
        case 'vistas':
          aValue = a.vistas || 0;
          bValue = b.vistas || 0;
          break;
        default:
          aValue = new Date(a.fechaCreacion || 0);
          bValue = new Date(b.fechaCreacion || 0);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Agrupar por tipo
  const ofertas = filteredPublicaciones.filter(p => p.tipoPublicacion === TIPOS_PUBLICACION.OFERTA_EMPLEO);
  const busquedas = filteredPublicaciones.filter(p => p.tipoPublicacion === TIPOS_PUBLICACION.BUSQUEDA_EMPLEO);

  const getActiveCount = () => {
    return publicaciones.filter(p => p.estado === 'activo').length;
  };

  const getFeaturedCount = () => {
    return publicaciones.filter(p => {
      if (!p.featured || !p.featuredUntil) return false;
      const now = new Date();
      const featuredUntil = p.featuredUntil.toDate ? 
        p.featuredUntil.toDate() : 
        new Date(p.featuredUntil);
      return now < featuredUntil;
    }).length;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando publicaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">{publicaciones.length}</p>
            </div>
            <Package className="w-5 h-5 md:w-8 md:h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Activos</p>
              <p className="text-lg md:text-2xl font-bold text-green-600 dark:text-green-400">
                {getActiveCount()}
              </p>
            </div>
            <Star className="w-5 h-5 md:w-8 md:h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Ofertas</p>
              <p className="text-lg md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {ofertas.length}
              </p>
            </div>
            <Briefcase className="w-5 h-5 md:w-8 md:h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Destacados</p>
              <p className="text-lg md:text-2xl font-bold text-orange-600 dark:text-orange-400">
                {getFeaturedCount()}
              </p>
            </div>
            <Star className="w-5 h-5 md:w-8 md:h-8 text-orange-500 fill-current" />
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        {/* Botones crear en móvil */}
        <div className="flex justify-between items-start mb-4 sm:hidden">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Empleos</h3>
          <div className="relative group">
            <button className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo
            </button>
            <div className="hidden group-hover:block absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              <button
                onClick={() => onCreateNew(TIPOS_PUBLICACION.OFERTA_EMPLEO)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-sm"
              >
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>Oferta de Empleo</span>
              </button>
              <button
                onClick={() => onCreateNew(TIPOS_PUBLICACION.BUSQUEDA_EMPLEO)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-sm"
              >
                <UserIcon className="w-4 h-4 text-green-600" />
                <span>Busco Empleo</span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Búsqueda */}
          <div className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar publicaciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">Todos los tipos</option>
              <option value={TIPOS_PUBLICACION.OFERTA_EMPLEO}>Ofertas de Empleo</option>
              <option value={TIPOS_PUBLICACION.BUSQUEDA_EMPLEO}>Búsquedas de Empleo</option>
            </select>

            <select
              value={`${sortBy}_${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('_');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="fechaCreacion_desc">Más recientes</option>
              <option value="fechaCreacion_asc">Más antiguos</option>
              <option value="titulo_asc">A-Z (Título)</option>
              <option value="titulo_desc">Z-A (Título)</option>
              <option value="vistas_desc">Más vistas</option>
              <option value="vistas_asc">Menos vistas</option>
            </select>
          </div>

          {/* Vista y botones crear para desktop */}
          <div className="flex justify-between items-center">
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 text-sm ${viewMode === 'table'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                  } transition-colors flex items-center`}
              >
                <List className="w-4 h-4 mr-2" />
                Lista
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm ${viewMode === 'grid'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                  } transition-colors flex items-center`}
              >
                <Grid3X3 className="w-4 h-4 mr-2" />
                Tarjetas
              </button>
            </div>

            {/* Botones crear para desktop */}
            <div className="hidden sm:flex gap-2">
              <button
                onClick={() => onCreateNew(TIPOS_PUBLICACION.OFERTA_EMPLEO)}
                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Oferta
              </button>
              <button
                onClick={() => onCreateNew(TIPOS_PUBLICACION.BUSQUEDA_EMPLEO)}
                className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <UserIcon className="w-4 h-4 mr-2" />
                Busco Empleo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista/Grid de publicaciones */}
      {filteredPublicaciones.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No se encontraron publicaciones
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchQuery || filterType !== 'all'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza creando tu primera publicación'
            }
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => onCreateNew(TIPOS_PUBLICACION.OFERTA_EMPLEO)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Crear Oferta
            </button>
            <button
              onClick={() => onCreateNew(TIPOS_PUBLICACION.BUSQUEDA_EMPLEO)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <UserIcon className="w-4 h-4 mr-2" />
              Busco Empleo
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {filteredPublicaciones.map((publicacion) => (
            <EmploymentCard
              key={publicacion.id}
              publicacion={publicacion}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              onDuplicate={onDuplicate}
              onView={onView}
              onFeature={onFeature}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Publicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Vistas
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPublicaciones.map((publicacion) => (
                  <EmploymentTableRow
                    key={publicacion.id}
                    publicacion={publicacion}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleStatus={onToggleStatus}
                    onDuplicate={onDuplicate}
                    onView={onView}
                    onFeature={onFeature}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para tarjeta en vista grid
function EmploymentCard({ publicacion, onEdit, onDelete, onToggleStatus, onDuplicate, onView, onFeature }) {
  const isFeatureActive = () => {
    if (!publicacion.featured || !publicacion.featuredUntil) return false;
    const now = new Date();
    const featuredUntil = publicacion.featuredUntil.toDate ? 
      publicacion.featuredUntil.toDate() : 
      new Date(publicacion.featuredUntil);
    return now < featuredUntil;
  };

  const getRemainingDays = () => {
    if (!isFeatureActive()) return 0;
    const now = new Date();
    const featuredUntil = publicacion.featuredUntil.toDate ? 
      publicacion.featuredUntil.toDate() : 
      new Date(publicacion.featuredUntil);
    const diffTime = featuredUntil - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getTipoIcon = () => {
    switch(publicacion.tipoPublicacion) {
      case TIPOS_PUBLICACION.OFERTA_EMPLEO:
        return <Briefcase className="w-8 h-8 text-blue-400" />;
      case TIPOS_PUBLICACION.BUSQUEDA_EMPLEO:
        return <UserIcon className="w-8 h-8 text-green-400" />;
      case TIPOS_PUBLICACION.SERVICIO_PROFESIONAL:
        return <Wrench className="w-8 h-8 text-purple-400" />;
      default:
        return <Package className="w-8 h-8 text-gray-400" />;
    }
  };

  const getTipoColor = () => {
    switch(publicacion.tipoPublicacion) {
      case TIPOS_PUBLICACION.OFERTA_EMPLEO:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case TIPOS_PUBLICACION.BUSQUEDA_EMPLEO:
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case TIPOS_PUBLICACION.SERVICIO_PROFESIONAL:
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border-2 ${getTipoColor()} overflow-hidden hover:shadow-lg transition-shadow relative`}>
      {/* Badge de destacado */}
      {isFeatureActive() && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1">
            <Star className="w-3 h-3 fill-current" />
            <span>DESTACADO</span>
          </div>
        </div>
      )}

      {/* Contenido */}
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0">
            {getTipoIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
              {publicacion.titulo}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
              {publicacion.empresa || publicacion.descripcion}
            </p>
          </div>
        </div>

        {/* Badge de estado */}
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            publicacion.estado === 'activo' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
          }`}>
            {publicacion.estado === 'activo' ? 'Activo' : 'Pausado'}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {publicacion.vistas || 0} vistas
          </span>
        </div>

        {/* Info de destacado */}
        {isFeatureActive() && (
          <div className="mb-3 p-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <div className="flex items-center space-x-2 text-yellow-700 dark:text-yellow-300 text-xs">
              <Star className="w-3 h-3 fill-current" />
              <span className="font-medium">Destacado por {getRemainingDays()} días más</span>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => onView(publicacion)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
              title="Ver"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(publicacion)}
              className="flex-1 px-3 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors flex items-center justify-center"
              title="Editar"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleStatus(publicacion)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
              title={publicacion.estado === 'activo' ? 'Pausar' : 'Activar'}
            >
              {publicacion.estado === 'activo' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onDuplicate(publicacion)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1"
              title="Duplicar"
            >
              <Copy className="w-4 h-4" />
              <span className="hidden lg:inline text-xs">Duplicar</span>
            </button>

            <button
              onClick={() => onFeature && onFeature(publicacion)}
              className={`px-3 py-2 text-sm rounded transition-colors flex items-center justify-center gap-1 ${
                isFeatureActive()
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                  : 'border border-yellow-500 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
              }`}
              title={isFeatureActive() ? 'Ya destacado' : 'Destacar'}
            >
              <Star className="w-4 h-4" />
              <span className="hidden lg:inline text-xs">
                {isFeatureActive() ? 'Destacado' : 'Destacar'}
              </span>
            </button>

            <button
              onClick={() => onDelete(publicacion.id)}
              className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden lg:inline text-xs">Eliminar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente para fila de tabla
function EmploymentTableRow({ publicacion, onEdit, onDelete, onToggleStatus, onDuplicate, onView, onFeature }) {
  const isFeatureActive = () => {
    if (!publicacion.featured || !publicacion.featuredUntil) return false;
    const now = new Date();
    const featuredUntil = publicacion.featuredUntil.toDate ? 
      publicacion.featuredUntil.toDate() : 
      new Date(publicacion.featuredUntil);
    return now < featuredUntil;
  };

  const getTipoNombre = () => {
    switch(publicacion.tipoPublicacion) {
      case TIPOS_PUBLICACION.OFERTA_EMPLEO:
        return 'Oferta de Empleo';
      case TIPOS_PUBLICACION.BUSQUEDA_EMPLEO:
        return 'Búsqueda de Empleo';
      case TIPOS_PUBLICACION.SERVICIO_PROFESIONAL:
        return 'Servicio Profesional';
      default:
        return 'Desconocido';
    }
  };

  const getTipoColor = () => {
    switch(publicacion.tipoPublicacion) {
      case TIPOS_PUBLICACION.OFERTA_EMPLEO:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case TIPOS_PUBLICACION.BUSQUEDA_EMPLEO:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case TIPOS_PUBLICACION.SERVICIO_PROFESIONAL:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
              {publicacion.titulo}
              {isFeatureActive() && (
                <span className="ml-2 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs rounded-full">
                  DESTACADO
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {publicacion.empresa || publicacion.descripcion?.substring(0, 50)}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoColor()}`}>
          {getTipoNombre()}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          publicacion.estado === 'activo' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
        }`}>
          {publicacion.estado === 'activo' ? 'Activo' : 'Pausado'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        {publicacion.vistas || 0}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => onView(publicacion)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title="Ver"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(publicacion)}
            className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
            title="Editar"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleStatus(publicacion)}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
            title={publicacion.estado === 'activo' ? 'Pausar' : 'Activar'}
          >
            {publicacion.estado === 'activo' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onFeature && onFeature(publicacion)}
            className={`${
              isFeatureActive()
                ? 'text-yellow-500'
                : 'text-yellow-600 dark:text-yellow-400'
            } hover:text-yellow-700 dark:hover:text-yellow-300`}
            title={isFeatureActive() ? 'Ya destacado' : 'Destacar'}
          >
            <Star className={`w-4 h-4 ${isFeatureActive() ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => onDuplicate(publicacion)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title="Duplicar"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(publicacion.id)}
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}