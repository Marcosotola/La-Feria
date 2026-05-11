// src/app/about/page.js
'use client'

import { Heart, Users, DollarSign, CheckCircle, User2 } from 'lucide-react'
import Image from 'next/image'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Image
              src="/logos/logo.png"
              alt="La Feria Logo"
              width={60}
              height={60}
              className="w-15 h-15"
            />
            <h1 className="text-4xl md:text-6xl font-bold">
              La <span className="text-primary-200">Feria</span>
            </h1>
          </div>
          <blockquote className="text-xl md:text-2xl italic mb-4 text-primary-100">
            "Así que, según tengamos oportunidad, hagamos bien a todos, y mayormente a los de la familia de la fe."
          </blockquote>
          <cite className="text-primary-300 font-medium">Gálatas 6:10</cite>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* ¿Qué es La Feria? */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            ¿Qué es La Feria?
          </h2>
          <div className="space-y-6 text-gray-700 dark:text-gray-300">
            <p className="text-xl leading-relaxed">
              La Feria es una plataforma comunitaria diseñada especialmente para bendecir a todos los hermanos de nuestra iglesia "Toma Tu Lugar". Nuestro propósito es simple pero poderoso: conectar, apoyar y visibilizar los talentos, emprendimientos y necesidades de nuestra comunidad.
            </p>
            <p className="text-lg leading-relaxed">
              Imaginate una gran feria virtual donde podés recorrer productos y servicios ofrecidos por otros miembros de la iglesia, todo en un solo lugar. Desde ropa artesanal hasta servicios de carpintería, pasando por comidas caseras, clases particulares, asesorías profesionales, ofertas de empleo y mucho más.
            </p>
            <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-lg border-l-4 border-primary-500">
              <blockquote className="text-primary-800 dark:text-primary-200 italic text-lg mb-2">
                "Cada uno ponga al servicio de los demás el don que haya recibido, administrando fielmente la gracia de Dios en sus diversas formas."
              </blockquote>
              <cite className="text-primary-600 dark:text-primary-400 font-medium">1 Pedro 4:10 - NVI</cite>
            </div>
          </div>
        </section>

        {/* Propósito y Visión */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Nuestro Propósito
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Fortaleciendo Vínculos
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                Cada interacción comercial se convierte en una oportunidad de conocerse mejor, crear lazos y fortalecer la comunidad de fe. Cada contacto es una puerta abierta para que los hogares se conecten.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Apoyo Comunitario
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                Creamos una red de apoyo económico y social entre hermanos, fortaleciendo la economía comunitaria y creciendo juntos en fe y prosperidad.
              </p>
            </div>
          </div>
        </section>

        {/* Beneficios */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Beneficios para Todos
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Visibilidad para Emprendimientos
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Pequeños emprendimientos que quizás no tienen página web pueden brillar aquí
              </p>
            </div>
            <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Sin Intermediarios
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Posibilidad de generar ingresos directos, sin comisiones ni intermediarios
              </p>
            </div>
            <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Consumo Responsable
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Fomenta el consumo responsable dentro de la comunidad de fe
              </p>
            </div>
          </div>
        </section>

        {/* Categorías Disponibles */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            ¿Qué Podés Encontrar?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Productos</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Ropa y accesorios</li>
                <li>• Alimentos caseros y repostería</li>
                <li>• Artesanías y manualidades</li>
                <li>• Productos para el hogar</li>
                <li>• Tecnología y electrónicos</li>
                <li>• Libros y material educativo</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Servicios</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Servicios profesionales</li>
                <li>• Servicios del hogar</li>
                <li>• Clases particulares</li>
                <li>• Salud y bienestar</li>
                <li>• Transporte</li>
                <li>• Eventos y catering</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Empleos</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Ofertas de trabajo</li>
                <li>• Búsquedas laborales</li>
                <li>• Servicios freelance</li>
                <li>• Oportunidades de colaboración</li>
                <li>• Prácticas profesionales</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Cómo se mantiene */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            ¿Cómo se Mantiene La Feria?
          </h2>
          <div className="bg-green-50 dark:bg-green-900/20 p-8 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-lg text-green-800 dark:text-green-200 mb-4">
              <strong>La Feria no cobra comisión</strong>, ni es una plataforma con fines de lucro. Las colaboraciones económicas son 100% voluntarias y contribuyen a:
            </p>
            <ul className="grid md:grid-cols-2 gap-2 text-green-700 dark:text-green-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Gastos de hosting y almacenamiento
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Mejoras visuales y funcionales
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Mantenimiento y soporte técnico
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Desarrollo de nuevas funcionalidades
              </li>
            </ul>
            <p className="text-green-700 dark:text-green-300 mt-4">
              De esta manera, el sitio puede autosustentarse sin necesidad de publicidad externa.
            </p>
          </div>
        </section>

        {/* El Desarrollador */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Detrás del Proyecto
          </h2>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <User2 className="w-12 h-12 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Marco Sotola
            </h3>
            <p className="text-primary-600 dark:text-primary-400 font-medium mb-4">
              Desarrollador Web Fullstack
            </p>
            <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              La Feria nace de mi sueño de ayudar a los emprendedores de la iglesia TTL y, de paso, fomentar la comunión entre hermanos. Como desarrollador y miembro de la comunidad, vi una oportunidad de usar la tecnología para fortalecer los lazos que nos unen como familia de la fe.
            </p>
          </div>
        </section>

        {/* Versículo Final */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-8 rounded-lg text-white">
            <blockquote className="text-xl md:text-2xl italic mb-4">
              "Preocupémonos los unos por los otros, a fin de estimularnos al amor y a las buenas obras."
            </blockquote>
            <cite className="text-primary-200 font-medium">Hebreos 10:24 - NVI</cite>
          </div>
        </section>

      </div>
    </div>
  )
}