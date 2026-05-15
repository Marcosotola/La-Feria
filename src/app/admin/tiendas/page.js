'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Store, Search, X, ExternalLink, Loader2, User,
  Edit, Trash2, AlertTriangle, MoreVertical, CheckCircle,
  Clock, Star, Filter
} from 'lucide-react';
import Image from 'next/image';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import EditStoreModal from '@/components/admin/EditStoreModal';

const STATUS_FILTER = [
  { value: 'all', label: 'Todas' },
  { value: 'approved', label: 'Publicadas' },
  { value: 'pending', label: 'Sin publicar' },
  { value: 'featured', label: 'Destacadas' },
];

const STATUS_META = {
  approved: { label: 'Publicada', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  pending: { label: 'Sin publicar', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
  suspended: { label: 'Suspendida', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: AlertTriangle },
};

export default function AdminTiendasPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [editStore, setEditStore] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const loadStores = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const withStores = snap.docs
        .filter(d => d.data().storeSlug)
        .map(d => ({ id: d.id, ...d.data() }));
      setStores(withStores);
    } catch (err) {
      console.error('Error cargando tiendas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (storeId) => {
    setDeletingId(storeId);
    try {
      await deleteDoc(doc(db, 'users', storeId));
      setStores(prev => prev.filter(s => s.id !== storeId));
      setConfirmDeleteId(null);
    } catch (err) {
      console.error('Error eliminando tienda:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleStoreUpdated = (updated) => {
    setStores(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const filtered = stores.filter(s => {
    const matchSearch = !search.trim() ||
      s.businessName?.toLowerCase().includes(search.toLowerCase()) ||
      s.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      s.storeSlug?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'featured' ? s.featured : s.accountStatus === statusFilter);

    return matchSearch && matchStatus;
  });

  const counts = {
    all: stores.length,
    approved: stores.filter(s => s.accountStatus === 'approved').length,
    pending: stores.filter(s => s.accountStatus === 'pending').length,
    featured: stores.filter(s => s.featured).length,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Tiendas</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {loading ? '...' : `${stores.length} tiendas en la plataforma`}
        </p>
      </div>

      {/* Filtros de estado */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {STATUS_FILTER.map(f => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              statusFilter === f.value
                ? 'bg-teal-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-teal-400'
            }`}
          >
            {f.value === 'featured' && <Star className="w-3 h-3" />}
            {f.label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
              statusFilter === f.value ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              {counts[f.value]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, slug o email..."
          className="w-full pl-11 pr-10 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          {search || statusFilter !== 'all' ? 'Sin resultados para este filtro' : 'No hay tiendas'}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(store => {
            const isConfirmingDelete = confirmDeleteId === store.id;
            const statusInfo = STATUS_META[store.accountStatus] || STATUS_META.pending;
            const StatusIcon = statusInfo.icon;

            if (isConfirmingDelete) {
              return (
                <div key={store.id} className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 border border-red-200 dark:border-red-700">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-red-800 dark:text-red-200">
                      ¿Eliminar "{store.businessName || store.email}"?
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400">
                      Esta acción no se puede deshacer. Se eliminará el usuario y toda su configuración.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleDelete(store.id)}
                      disabled={deletingId === store.id}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-60 flex items-center gap-1.5"
                    >
                      {deletingId === store.id ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Eliminando...</>
                      ) : (
                        <><Trash2 className="w-3.5 h-3.5" /> Eliminar</>
                      )}
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div key={store.id} className="flex gap-3 bg-white dark:bg-gray-800 rounded-2xl p-3 border border-gray-100 dark:border-gray-700 shadow-sm hover:border-gray-200 dark:hover:border-gray-600 transition-colors">

                {/* Logo */}
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 relative bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  {store.storeLogo ? (
                    <Image src={store.storeLogo} alt={store.businessName || ''} fill className="object-contain p-1" sizes="56px" />
                  ) : (
                    <Store className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 py-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-black text-gray-900 dark:text-white text-sm leading-tight">
                      {store.businessName || `${store.firstName || ''} ${store.lastName || ''}`.trim() || 'Sin nombre'}
                    </p>
                    {store.featured && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                        <Star className="w-2.5 h-2.5" /> Destacada
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <User className="w-3 h-3 text-gray-400 shrink-0" />
                    <span className="text-xs text-gray-500 truncate">{store.email}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                      <StatusIcon className="w-2.5 h-2.5" />
                      {statusInfo.label}
                    </span>
                    {store.tipoNegocio && (
                      <span className="text-[9px] text-gray-400 font-semibold uppercase">{store.tipoNegocio}</span>
                    )}
                    <span className="text-[9px] text-gray-400 font-mono">/{store.storeSlug}</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1 shrink-0" ref={openMenuId === store.id ? menuRef : null}>
                  <a
                    href={`/tienda/${store.storeSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ver tienda"
                    className="w-9 h-9 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl flex items-center justify-center hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-teal-900/20 dark:hover:text-teal-400 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => { setEditStore(store); setOpenMenuId(null); }}
                    title="Editar tienda"
                    className="w-9 h-9 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setConfirmDeleteId(store.id); setOpenMenuId(null); }}
                    title="Eliminar tienda"
                    className="w-9 h-9 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de edición */}
      <EditStoreModal
        store={editStore}
        isOpen={!!editStore}
        onClose={() => setEditStore(null)}
        onStoreUpdated={handleStoreUpdated}
      />
    </div>
  );
}
