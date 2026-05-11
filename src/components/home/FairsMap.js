'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Calendar, Users, X, ArrowRight, Star } from 'lucide-react'

import { getAllFairs } from '@/lib/services/fairsService'

// Cargamos TODO el contenido del mapa de forma dinámica y solo en el cliente
const MapInner = dynamic(
  () => import('./MapInner'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center">
        <p className="text-gray-500 font-bold">Cargando mapa interactivo...</p>
      </div>
    )
  }
)

export default function FairsMap() {
  const [mounted, setMounted] = useState(false)
  const [selectedFair, setSelectedFair] = useState(null)
  const [fairs, setFairs] = useState([])

  useEffect(() => {
    setMounted(true)
    loadFairs()
  }, [])

  const loadFairs = async () => {
    const data = await getAllFairs()
    setFairs(data)
  }

  return (
    <div className="relative w-full h-[350px] md:h-[550px] rounded-[2.5rem] md:rounded-[3rem] shadow-2xl border-2 md:border-4 border-white dark:border-gray-800 z-20 bg-gray-100 dark:bg-gray-900 transition-all duration-500">
      
      {/* Contenedor del Mapa (Clipped) */}
      <div className="absolute inset-0 rounded-[2.3rem] md:rounded-[2.8rem] overflow-hidden">
        {mounted && <MapInner onSelect={setSelectedFair} fairs={fairs} />}
      </div>

      {/* Overlay informativo (Movido arriba para no estorbar) */}
      <div className={`absolute top-4 left-4 md:top-6 md:left-6 z-[1000] bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-3 md:p-4 rounded-2xl shadow-xl border border-white/20 transition-all duration-300 ${selectedFair ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
        <h4 className="font-black text-gray-900 dark:text-white text-[10px] md:text-xs mb-1 uppercase tracking-wider flex items-center gap-2">
          <MapPin className="w-3 h-3 text-primary-500" /> Mapa de Ferias
        </h4>
        <p className="text-[9px] md:text-[10px] text-gray-600 dark:text-gray-400">
          Toca un pin para ver detalles.
        </p>
      </div>

      {/* CARD DE DETALLES FLOTANTE (Premium Slide-up) */}
      {selectedFair && (
        <div className="absolute inset-x-4 bottom-4 md:inset-x-auto md:right-8 md:bottom-8 md:w-80 z-[1001] animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden relative group">
            {/* Botón Cerrar */}
            <button 
              onClick={() => setSelectedFair(null)}
              className="absolute top-3 right-3 z-20 p-2 bg-black/20 backdrop-blur-md text-white rounded-full hover:bg-black/40 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Imagen con Gradiente */}
            <div className="relative h-32 md:h-40 w-full overflow-hidden">
              <img 
                src={selectedFair.image} 
                alt={selectedFair.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-gray-900 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 flex items-center gap-2">
                <span className="px-2 py-1 bg-primary-500 text-white text-[10px] font-bold rounded-lg shadow-lg">
                  {selectedFair.date}
                </span>
              </div>
            </div>

            {/* Contenido Detallado */}
            <div className="px-5 pb-6 pt-1">
              <div className="flex items-center gap-1 text-amber-500 mb-1">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-[10px] font-bold">4.8 (Destacada)</span>
              </div>
              <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white leading-tight mb-3">
                {selectedFair.name}
              </h3>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs">
                  <MapPin className="w-4 h-4 text-primary-500" />
                  <span className="truncate">{selectedFair.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs">
                  <Calendar className="w-4 h-4 text-brand-teal-500" />
                  <span>{selectedFair.time}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs">
                  <Users className="w-4 h-4 text-accent-500" />
                  <span className="font-bold text-gray-900 dark:text-white">{selectedFair.stalls} Puesteros activos</span>
                </div>
              </div>

              <a 
                href={`/ferias/${selectedFair.id}`}
                className="w-full py-4 bg-brand-teal-600 hover:bg-brand-teal-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-brand-teal-600/30 transition-all active:scale-95"
              >
                Explorar Feria <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
