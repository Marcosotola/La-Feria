'use client'
import { MapPin, Calendar, ArrowRight, Star, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function UpcomingFairs() {
  const fairs = [
    {
      id: 1,
      name: "Feria de Artesanos del Centro",
      location: "Plaza San Martín, Córdoba",
      date: "Sábado 15 de Mayo",
      time: "10:00 - 18:00",
      image: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=800&auto=format&fit=crop",
      stallsCount: 45,
      rating: 4.8
    },
    {
      id: 2,
      name: "Mercado Local Gastronómico",
      location: "Parque Sarmiento",
      date: "Domingo 16 de Mayo",
      time: "11:00 - 20:00",
      image: "https://images.unsplash.com/photo-1488459711635-0c015d94e8d6?q=80&w=800&auto=format&fit=crop",
      stallsCount: 28,
      rating: 4.9
    }
  ]

  return (
    <section className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Ferias <span className="text-primary-500">Próximas</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Descubre los eventos y mercados más cercanos a ti.
            </p>
          </div>
          <Link 
            href="/ferias" 
            className="hidden sm:flex items-center gap-2 text-primary-600 font-bold hover:text-primary-700 transition-colors"
          >
            Ver todas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {fairs.map((fair) => (
            <div 
              key={fair.id}
              className="group relative bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all duration-500"
            >
              <div className="flex flex-col md:flex-row h-full">
                {/* Imagen */}
                <div className="relative w-full md:w-2/5 h-48 md:h-auto overflow-hidden">
                  <Image
                    src={fair.image}
                    alt={fair.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-primary-600 shadow-lg">
                    {fair.date}
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-bold">{fair.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-brand-teal-500 text-sm font-medium">
                        <Users className="w-4 h-4" />
                        <span>{fair.stallsCount} puestos</span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 group-hover:text-primary-500 transition-colors">
                      {fair.name}
                    </h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                        <MapPin className="w-4 h-4 text-primary-500" />
                        <span>{fair.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                        <Calendar className="w-4 h-4 text-brand-teal-500" />
                        <span>{fair.time}</span>
                      </div>
                    </div>
                  </div>

                  <Link 
                    href={`/ferias/${fair.id}`}
                    className="mt-6 w-full py-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-500 hover:text-white transition-all duration-300 group/btn"
                  >
                    Ver Detalles <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Link 
          href="/ferias" 
          className="sm:hidden mt-8 flex items-center justify-center gap-2 text-primary-600 font-bold py-4 border-2 border-primary-100 dark:border-gray-800 rounded-2xl transition-colors"
        >
          Ver todas las ferias <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  )
}
