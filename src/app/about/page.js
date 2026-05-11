import { Heart, Users, DollarSign, CheckCircle, MapPin, Store, Calendar, ArrowRight } from 'lucide-react'
import Image from 'next/image'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors pb-20">
      {/* Hero Section */}
      <section className="bg-brand-teal-900 text-white py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500/10 rounded-full -ml-10 -mb-10 blur-3xl" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="relative w-20 h-20 bg-white rounded-3xl p-2 shadow-2xl transform rotate-3">
              <Image
                src="/icon.png"
                alt="La Feria Logo"
                fill
                className="object-contain p-2"
              />
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
              La <span className="text-primary-500">Feria</span>
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Impulsando la economía local y conectando a feriantes con su comunidad.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        
        {/* ¿Qué es La Feria? */}
        <section className="mb-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                El nuevo corazón de las <span className="text-primary-500">Ferias Locales</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                La Feria es una plataforma tecnológica diseñada para modernizar la forma en que interactuamos con los mercados locales. Facilitamos la ubicación y gestión de ferias itinerantes, mercados de artesanos y ferias regionales.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                Nuestra misión es empoderar a los <strong>puesteros</strong> (feriantes) dándoles un espacio digital donde mostrar sus productos y servicios, permitiendo que los usuarios encuentren exactamente lo que buscas en su propia ciudad.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center">
                <MapPin className="w-8 h-8 text-primary-500 mb-3" />
                <span className="font-bold text-gray-900 dark:text-white text-sm">Ubicación Precisa</span>
              </div>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center mt-8">
                <Calendar className="w-8 h-8 text-brand-teal-500 mb-3" />
                <span className="font-bold text-gray-900 dark:text-white text-sm">Días y Horarios</span>
              </div>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center">
                <Store className="w-8 h-8 text-accent-500 mb-3" />
                <span className="font-bold text-gray-900 dark:text-white text-sm">Gestión de Puestos</span>
              </div>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center mt-8">
                <Users className="w-8 h-8 text-amber-500 mb-3" />
                <span className="font-bold text-gray-900 dark:text-white text-sm">Contacto Directo</span>
              </div>
            </div>
          </div>
        </section>

        {/* Pilares del Proyecto */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white">Nuestros Pilares</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 hover:scale-105 transition-transform duration-300">
              <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Apoyo al Feriante</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Brindamos herramientas a los puesteros para que puedan gestionar sus tiendas en múltiples ferias, manteniendo su stock y contacto actualizado.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 hover:scale-105 transition-transform duration-300">
              <div className="w-14 h-14 bg-brand-teal-100 dark:bg-brand-teal-900/30 rounded-2xl flex items-center justify-center mb-6">
                <MapPin className="w-7 h-7 text-brand-teal-600 dark:text-brand-teal-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Geolocalización</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                El usuario final puede descubrir ferias cercanas, ver rutas de llegada y conocer qué tiendas están presentes en ese momento.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 hover:scale-105 transition-transform duration-300">
              <div className="w-14 h-14 bg-accent-100 dark:bg-accent-900/30 rounded-2xl flex items-center justify-center mb-6">
                <DollarSign className="w-7 h-7 text-accent-600 dark:text-accent-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Sin Comisiones</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Fomentamos el trato directo entre el comprador y el vendedor. La plataforma no cobra comisiones por venta, impulsando la ganancia neta del emprendedor.
              </p>
            </div>
          </div>
        </section>

        {/* Visión Futuro */}
        <section className="mb-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-10 -mt-10 blur-3xl" />
          <div className="max-w-3xl relative z-10">
            <h2 className="text-4xl font-black mb-6 italic">Una red local más fuerte.</h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Creemos en un futuro donde los mercados locales sean los protagonistas. Donde la tecnología no reemplace al trato humano, sino que facilite que más personas descubran la magia de las ferias de su barrio.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-white" />
                <span className="font-bold">Fomento local</span>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-white" />
                <span className="font-bold">Sustentabilidad</span>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-white" />
                <span className="font-bold">Conectividad real</span>
              </div>
            </div>
          </div>
        </section>

        {/* El Equipo Desarrollador */}
        <section className="mb-24">
          <div className="bg-white dark:bg-gray-900 p-12 rounded-[3.5rem] shadow-xl border border-gray-100 dark:border-gray-800 text-center relative overflow-hidden">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent" />
             
             <div className="inline-block p-4 bg-primary-50 dark:bg-primary-900/20 rounded-full mb-8">
                <Image
                  src="/icon.png"
                  alt="Mira Soluciones Digitales"
                  width={80}
                  height={80}
                  className="w-20 h-20 object-contain"
                />
             </div>
             
             <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
               Mira Soluciones Digitales
             </h3>
             <p className="text-primary-500 font-bold mb-8 uppercase tracking-widest text-sm">
               Desarrollo e Innovación
             </p>
             <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed text-lg italic">
               "La Feria es un proyecto nacido de la pasión por conectar comunidades. En Mira, nos dedicamos a crear herramientas digitales que tengan un impacto real en la vida cotidiana de las personas, potenciando el trabajo local a través de la tecnología moderna."
             </p>
          </div>
        </section>

        {/* CTA Final */}
        <section className="text-center">
           <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8">¿Listo para unirte a la red?</h2>
           <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <button className="w-full md:w-auto px-10 py-5 bg-brand-teal-600 text-white font-black rounded-2xl shadow-xl shadow-brand-teal-600/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                Explorar Ferias
              </button>
              <button className="w-full md:w-auto px-10 py-5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-black rounded-2xl border-2 border-gray-100 dark:border-gray-800 shadow-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                Registrar mi Puesto
              </button>
           </div>
        </section>
      </div>
    </div>
  )
}