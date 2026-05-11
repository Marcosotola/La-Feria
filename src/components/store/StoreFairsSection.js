'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getAllFairs } from '@/lib/services/fairsService'
import { 
  MapPin, 
  CheckCircle2, 
  Plus, 
  Loader2, 
  Store as StoreIcon,
  Search,
  Calendar
} from 'lucide-react'
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

export default function StoreFairsSection({ showMessage }) {
  const { user, userData, refreshUserData } = useAuth()
  const [fairs, setFairs] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadFairs()
  }, [])

  const loadFairs = async () => {
    setLoading(true)
    const data = await getAllFairs()
    setFairs(data)
    setLoading(false)
  }

  const handleJoinFair = async (fairId) => {
    setProcessingId(fairId)
    try {
      const userRef = doc(db, 'users', user.uid)
      const fairRef = doc(db, 'ferias', fairId)
      
      const isJoined = userData.myFairs?.includes(fairId)

      if (isJoined) {
        // Salir de la feria
        await updateDoc(userRef, {
          myFairs: arrayRemove(fairId)
        })
        // También actualizar la feria para quitar al puestero (opcional, pero ayuda a la indexación)
        await updateDoc(fairRef, {
          stalls: arrayRemove(user.uid)
        })
        showMessage('success', 'Has salido de la feria')
      } else {
        // Unirse a la feria
        await updateDoc(userRef, {
          myFairs: arrayUnion(fairId)
        })
        await updateDoc(fairRef, {
          stalls: arrayUnion(user.uid)
        })
        showMessage('success', '¡Te has unido a la feria!')
      }
      
      await refreshUserData()
    } catch (error) {
      console.error("Error toggling fair:", error)
      showMessage('error', 'Error al procesar la solicitud')
    } finally {
      setProcessingId(null)
    }
  }

  const filteredFairs = fairs.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.locationName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500 mb-4" />
        <p className="text-gray-500">Buscando ferias disponibles...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary-500" /> Mis Ferias Activas
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Selecciona las ferias donde tienes un puesto físico hoy. Esto permitirá que los clientes te encuentren en el mapa.
        </p>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input 
          type="text"
          placeholder="Buscar feria por nombre o lugar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-6 py-4 bg-white dark:bg-gray-800 border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredFairs.map((fair) => {
          const isJoined = userData.myFairs?.includes(fair.id)
          
          return (
            <div 
              key={fair.id}
              className={`bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border-2 transition-all group ${
                isJoined ? 'border-primary-500 bg-primary-50/10' : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="text-xl font-black text-gray-900 dark:text-white mb-1 truncate">{fair.name}</h4>
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                    <MapPin className="w-4 h-4 text-primary-500" />
                    <span className="truncate">{fair.locationName || fair.address}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mb-6">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-[10px] font-bold text-gray-600 dark:text-gray-300">
                      <Calendar className="w-3 h-3" /> {fair.days}
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-[10px] font-bold text-gray-600 dark:text-gray-300">
                      <StoreIcon className="w-3 h-3" /> {fair.stalls?.length || 0} Puesteros
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleJoinFair(fair.id)}
                  disabled={processingId === fair.id}
                  className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    isJoined 
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {processingId === fair.id ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : isJoined ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <Plus className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filteredFairs.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">No se encontraron ferias con ese nombre.</p>
        </div>
      )}
    </div>
  )
}
