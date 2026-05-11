// src/app/ferias/page.js
'use client'
import { MapPin, Calendar, Users, Star, ArrowRight } from 'lucide-react'
import Image from 'next/image'

export default function FeriasPage() {
  const ferias = [
    {
      id: 1,
      nombre: 'Gran Feria de Artesanos',
      lugar: 'Plaza Central',
      fecha: 'Próximo Sábado',
      imagen: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=800&auto=format&fit=crop',
      categoria: 'Artesanías'
    },
    {
      id: 2,
      nombre: 'Mercado de Sabores',
      lugar: 'Paseo de la Costa',
      fecha: 'Domingo 15',
      imagen: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=800&auto=format&fit=crop',
      categoria: 'Gastronomía'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      {/* Header / Hero */}
      <div className="bg-brand-teal-900 text-white pt-12 pb-20 px-6 rounded-b-[3rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-500/10 rounded-full -ml-10 -mb-10 blur-3xl" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-1 bg-white/10 backdrop-blur-md rounded-xl">
              <div className="relative w-8 h-8">
                <Image
                  src="/icon.png"
                  alt="La Feria"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <span className="text-primary-400 font-bold tracking-widest uppercase text-xs">El corazón de la comunidad</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            Descubre las <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-amber-300">Ferias Locales</span>
          </h1>
          <p className="text-lg text-white/70 max-w-xl">
            Encuentra los eventos más cercanos, apoya a los productores locales y disfruta de experiencias únicas en tu ciudad.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 -mt-10">
        {/* Search / Filter Placeholder */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-xl flex gap-4 mb-12 border border-gray-100 dark:border-gray-800">
           <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
             <MapPin className="w-5 h-5 text-gray-400" />
             <input type="text" placeholder="Tu ciudad..." className="bg-transparent border-none focus:ring-0 text-sm flex-1" />
           </div>
           <button className="bg-brand-teal-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-brand-teal-600/30 hover:bg-brand-teal-700 transition-all">
             Buscar
           </button>
        </div>

        {/* Featured Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
              Próximos Eventos
              <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
            </h2>
            <button className="text-brand-teal-600 dark:text-brand-teal-400 font-semibold text-sm flex items-center gap-1 hover:underline">
              Ver calendario <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ferias.map(feria => (
              <div key={feria.id} className="group bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800">
                <div className="relative h-48 overflow-hidden">
                  <Image 
                    src={feria.imagen} 
                    alt={feria.nombre} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-brand-teal-900 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                      {feria.categoria}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 dark:text-white group-hover:text-brand-teal-600 transition-colors">{feria.nombre}</h3>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                      <MapPin className="w-4 h-4" />
                      {feria.lugar}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      {feria.fecha}
                    </div>
                  </div>
                  <button className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-xl group-hover:bg-primary-500 group-hover:text-white transition-all duration-300">
                    Más información
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Banner */}
        <div className="bg-gradient-to-br from-primary-500 to-orange-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-primary-500/20">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h3 className="text-2xl font-black mb-3 italic">¿Organizas una feria?</h3>
              <p className="text-white/80 mb-6">
                Únete a nuestra red y llega a miles de personas en tu comunidad. Es gratis y fácil de empezar.
              </p>
              <button className="bg-white text-primary-600 px-8 py-4 rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all">
                REGISTRAR MI FERIA
              </button>
            </div>
            <div className="flex items-center gap-4 bg-black/10 backdrop-blur-md p-6 rounded-[2rem]">
               <div className="flex -space-x-3">
                 {[1,2,3].map(i => (
                   <div key={i} className="w-12 h-12 rounded-full border-2 border-white bg-gray-300 overflow-hidden shadow-lg">
                      <Image src={`https://i.pravatar.cc/150?u=${i}`} alt="user" width={48} height={48} />
                   </div>
                 ))}
               </div>
               <div className="text-xs">
                 <p className="font-bold">+500 feriantes</p>
                 <p className="opacity-70">ya son parte de la red</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
