'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getAllFairs } from '@/lib/services/fairsService';
import { Building2, Save, Search, MapPin, CheckCircle2, Plus, Loader2, X } from 'lucide-react';

export default function BusinessInfoSection({ showMessage }) {
  const { userData, user, refreshUserData } = useAuth();

  const [formData, setFormData] = useState({
    businessName: '',
    slogan: '',
    storeSlug: ''
  });

  const [loading, setLoading] = useState(false);

  // Estado del selector de ferias
  const [fairs, setFairs] = useState([]);
  const [fairsLoading, setFairsLoading] = useState(true);
  const [fairSearch, setFairSearch] = useState('');
  const [processingFairId, setProcessingFairId] = useState(null);

  useEffect(() => {
    if (userData) {
      setFormData({
        businessName: userData.businessName || '',
        slogan: userData.slogan || '',
        storeSlug: userData.storeSlug || ''
      });
    }
  }, [userData]);

  useEffect(() => {
    getAllFairs().then(data => {
      setFairs(data);
      setFairsLoading(false);
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!user?.uid) throw new Error('Usuario no disponible');
      await updateDoc(doc(db, 'users', user.uid), {
        ...formData,
        updatedAt: new Date()
      });
      await refreshUserData();
      showMessage('success', 'Datos del negocio actualizados correctamente');
    } catch (error) {
      console.error('Error al actualizar datos:', error);
      showMessage('error', `Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFair = async (fairId) => {
    if (!user?.uid) return;
    setProcessingFairId(fairId);
    try {
      const userRef = doc(db, 'users', user.uid);
      const fairRef = doc(db, 'ferias', fairId);
      const isJoined = userData.myFairs?.includes(fairId);

      if (isJoined) {
        await updateDoc(userRef, { myFairs: arrayRemove(fairId) });
        await updateDoc(fairRef, { stalls: arrayRemove(user.uid) });
        showMessage('success', 'Saliste de la feria');
      } else {
        await updateDoc(userRef, { myFairs: arrayUnion(fairId) });
        await updateDoc(fairRef, { stalls: arrayUnion(user.uid) });
        showMessage('success', '¡Te uniste a la feria!');
      }
      await refreshUserData();
    } catch (error) {
      console.error('Error toggling fair:', error);
      showMessage('error', 'Error al actualizar la feria');
    } finally {
      setProcessingFairId(null);
    }
  };

  const filteredFairs = fairs.filter(f =>
    f.name?.toLowerCase().includes(fairSearch.toLowerCase()) ||
    f.locationName?.toLowerCase().includes(fairSearch.toLowerCase())
  );

  const joinedFairs = fairs.filter(f => userData?.myFairs?.includes(f.id));

  return (
    <div className="space-y-6">
      {/* Datos del negocio */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Building2 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Datos del Negocio
          </h2>
        </div>

        {userData?.storeLogo && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-10 bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                <img src={userData.storeLogo} alt="Logo de la tienda" className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Logo actual de tu tienda</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Puedes cambiarlo en la sección "Logo de la Tienda"</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre del Negocio
            </label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Slogan de la Tienda
            </label>
            <input
              type="text"
              name="slogan"
              value={formData.slogan}
              onChange={handleInputChange}
              placeholder="Ej: El mejor puesto de la feria"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Una frase corta que describa tu negocio (opcional)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL de la Tienda
            </label>
            <div className="flex flex-col sm:flex-row">
              <span className="inline-flex items-center px-3 py-2 border border-b-0 sm:border-b sm:border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm rounded-t-lg sm:rounded-t-none sm:rounded-l-lg">
                laferia.com/tienda/
              </span>
              <input
                type="text"
                name="storeSlug"
                value={formData.storeSlug}
                onChange={handleInputChange}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-b-lg sm:rounded-b-none sm:rounded-r-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-0"
                placeholder="mi-tienda"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Solo letras, números y guiones.</p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>

      {/* Selector de ferias */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-2">
          <MapPin className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Mis Ferias
          </h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Seleccioná las ferias donde tenés un puesto. Tu tienda aparecerá en el mapa y en los resultados de esa feria.
        </p>

        {/* Ferias ya unidas */}
        {joinedFairs.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {joinedFairs.map(f => (
              <span
                key={f.id}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm font-medium"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {f.name}
                <button
                  onClick={() => handleToggleFair(f.id)}
                  disabled={processingFairId === f.id}
                  className="ml-1 hover:text-orange-900 dark:hover:text-orange-100"
                >
                  {processingFairId === f.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <X className="w-3.5 h-3.5" />
                  )}
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Buscador de ferias */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar feria por nombre o lugar..."
            value={fairSearch}
            onChange={(e) => setFairSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        </div>

        {fairsLoading ? (
          <div className="flex items-center gap-2 py-4 text-gray-500 dark:text-gray-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Cargando ferias...
          </div>
        ) : filteredFairs.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No se encontró la feria. Si sos organizador, podés{' '}
              <a href="/dashboard/ferias/nueva" className="text-orange-600 dark:text-orange-400 underline">
                crear tu feria aquí
              </a>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
            {filteredFairs.map(fair => {
              const isJoined = userData?.myFairs?.includes(fair.id);
              const isProcessing = processingFairId === fair.id;
              return (
                <button
                  key={fair.id}
                  onClick={() => handleToggleFair(fair.id)}
                  disabled={isProcessing}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-left transition-colors text-sm ${
                    isJoined
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{fair.name}</div>
                      {fair.locationName && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{fair.locationName}</div>
                      )}
                    </div>
                  </div>
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                  ) : isJoined ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-orange-500" />
                  ) : (
                    <Plus className="w-4 h-4 flex-shrink-0 text-gray-400" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {!fairsLoading && fairs.length > 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
            Tu tienda puede pertenecer a varias ferias. Si no encontrás la tuya,{' '}
            <a href="/dashboard/ferias/nueva" className="text-orange-600 dark:text-orange-400 underline">
              creala como organizador
            </a>.
          </p>
        )}
      </div>
    </div>
  );
}
