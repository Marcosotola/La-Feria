// src/components/layout/Footer.js
'use client'
import { Heart, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube, Package, Briefcase, Wrench } from 'lucide-react'
import Image from 'next/image'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    marketplace: {
      title: 'Marketplace',
      links: [
        { name: 'Productos', href: '/productos', icon: Package },
        { name: 'Servicios', href: '/servicios', icon: Wrench },
        { name: 'Empleos', href: '/empleos', icon: Briefcase },
        { name: 'Crear Tienda', href: '/crear-tienda' },
        { name: 'Favoritos', href: '/favoritos' }
      ]
    },
    community: {
      title: 'Comunidad',
      links: [
        { name: 'Nuestra Historia', href: '/historia' },
        { name: 'Testimonios', href: '/testimonios' },
        { name: 'Eventos', href: '/eventos' },
        { name: 'Blog', href: '/blog' },
        { name: 'Voluntariado', href: '/voluntariado' }
      ]
    },
    support: {
      title: 'Soporte',
      links: [
        { name: 'Centro de Ayuda', href: '/ayuda' },
        { name: 'Guías', href: '/guias' },
        { name: 'Contacto', href: '/contacto' },
        { name: 'Reportar Problema', href: '/reportar' },
        { name: 'Estado del Servicio', href: '/estado' }
      ]
    },
    legal: {
      title: 'Legal',
      links: [
        { name: 'Términos de Uso', href: '/terminos' },
        { name: 'Política de Privacidad', href: '/privacidad' },
        { name: 'Cookies', href: '/cookies' },
        { name: 'Política de Ventas', href: '/ventas' },
        { name: 'Seguridad', href: '/seguridad' }
      ]
    }
  }

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#', color: 'hover:text-blue-400' },
    { name: 'Instagram', icon: Instagram, href: '#', color: 'hover:text-pink-400' },
    { name: 'Twitter', icon: Twitter, href: '#', color: 'hover:text-sky-400' },
    { name: 'YouTube', icon: Youtube, href: '#', color: 'hover:text-red-400' }
  ]

  const contactInfo = [
    { icon: Phone, text: '+54 351 123-4567', href: 'tel:+543511234567' },
    { icon: Mail, text: 'hola@laferia.com', href: 'mailto:hola@laferia.com' },
    { icon: MapPin, text: 'Córdoba, Argentina', href: '#' }
  ]

  return (
    <footer className="relative mt-8 lg:mt-12">
      <div className="bg-gray-900 dark:bg-gray-950 text-white transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Sección principal del footer */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8">
            {/* Columna de marca y descripción */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/logos/logo.png"
                  alt="La Feria Logo"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
                <h3 className="text-2xl font-bold">
                  <span className="text-brand-teal-400">La</span>{' '}
                  <span className="text-primary-400">Feria</span>
                </h3>
              </div>
              
              <p className="text-gray-300 dark:text-gray-400 mb-6 leading-relaxed text-sm lg:text-base">
                La plataforma líder para encontrar ferias locales, gestionar puestos y 
                conectar con emprendedores de tu comunidad. Impulsamos el apoyo local y la economía regional.
              </p>

              {/* Información de contacto */}
              <div className="space-y-3 mb-6">
                {contactInfo.map((contact, index) => {
                  const IconComponent = contact.icon
                  return (
                    <a
                      key={index}
                      href={contact.href}
                      className="flex items-center gap-3 text-gray-300 dark:text-gray-400 hover:text-primary-400 transition-colors group"
                    >
                      <IconComponent className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="text-sm">{contact.text}</span>
                    </a>
                  )
                })}
              </div>

              {/* Redes sociales */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400 dark:text-gray-500">Síguenos:</span>
                <div className="flex gap-2">
                  {socialLinks.map((social, index) => {
                    const IconComponent = social.icon
                    return (
                      <a
                        key={index}
                        href={social.href}
                        className={`p-2 bg-gray-800 dark:bg-gray-900 rounded-lg ${social.color} transition-all duration-200 hover:scale-110 hover:bg-gray-700 dark:hover:bg-gray-800`}
                        aria-label={social.name}
                      >
                        <IconComponent className="w-4 h-4" />
                      </a>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Columnas de enlaces - Optimizadas para móvil */}
            <div className="md:col-span-1 lg:col-span-3">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {Object.entries(footerLinks).map(([key, section]) => (
                  <div key={key}>
                    <h4 className="font-semibold text-white mb-3 text-sm lg:text-base">{section.title}</h4>
                    <ul className="space-y-2">
                      {section.links.map((link, index) => (
                        <li key={index}>
                          <a
                            href={link.href}
                            className="flex items-center gap-2 text-xs lg:text-sm text-gray-300 dark:text-gray-400 hover:text-primary-400 transition-colors group"
                          >
                            {link.icon && <link.icon className="w-3 h-3 lg:w-4 lg:h-4 group-hover:scale-110 transition-transform" />}
                            <span>{link.name}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>


          {/* Footer inferior */}
          <div className="mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-gray-700 dark:border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-400 dark:text-gray-500">
                <Heart className="w-4 h-4 text-primary-500" />
                <span>Hecho por Mira Soluciones Digitales</span>
              </div>

              <div className="text-xs lg:text-sm text-gray-500 dark:text-gray-600 text-center md:text-right">
                <div>© {currentYear} La Feria</div>
                <div className="text-xs mt-1">Conectando ferias y emprendedores locales</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}