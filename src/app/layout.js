// src/app/layout.js
'use client';

import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import '@/styles/store-themes.css'
import { ThemeProvider } from '../components/providers/ThemeProvider'
import { AuthProvider } from '../contexts/AuthContext'
import { usePathname } from 'next/navigation'
import Header from '../components/layout/Header'
import DesktopNavigation from '../components/layout/DesktopNavigation'
import MobileNavigation from '../components/layout/MobileNavigation'
import Footer from '@/components/layout/Footer'
import InstallPrompt from '@/components/pwa/InstallPrompt'
import NotificationPrompt from '@/components/pwa/NotificationPrompt'
import TokenRefresher from '@/components/pwa/TokenRefresher'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  const pathname = usePathname()

  // Verificar si estamos en una ruta de tienda
  const isStorePage = pathname?.startsWith('/tienda/')

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="La Feria" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="La Feria" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="screen-orientation" content="any" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />

        {/* Open Graph / Social Media */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="La Feria" />
        <meta property="og:title" content="La Feria - Tienda Local" />
        <meta property="og:description" content="Tu mercado local online para productos y servicios de confianza." />
        <meta property="og:image" content="/icon-512.png" />
      </head>
      <body className={`${inter.className} ${isStorePage ? 'antialiased' : 'overflow-x-hidden'}`}>
        <ThemeProvider attribute="class" defaultTheme={isStorePage ? "light" : "system"} enableSystem={!isStorePage}>
          <AuthProvider>
            {isStorePage ? (
              // Para páginas de tienda: solo el contenido sin layout de La Feria
              children
            ) : (
              // Para páginas de La Feria: layout completo
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                {/* Header */}
                <Header />

                {/* Navegación Desktop */}
                <DesktopNavigation />

                {/* Contenido principal */}
                <main className="pb-20 lg:pb-8">
                  {children}
                </main>

                {/* Navegación Mobile - Funciona tanto para páginas normales como dashboard */}
                <MobileNavigation />

                {/* Footer */}
                <Footer />
              </div>
            )}
          </AuthProvider>
        </ThemeProvider>

        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', async () => {
                try {
                  // Registrar el Service Worker principal
                  const swRegistration = await navigator.serviceWorker.register('/sw.js');
                  console.log('SW principal registered:', swRegistration);
                  
                  // Registrar el Service Worker de Firebase Messaging
                  const msgRegistration = await navigator.serviceWorker.register('/api/firebase-messaging-sw');
                  console.log('Firebase SW registered:', msgRegistration);
                  
                } catch (error) {
                  console.log('SW registration failed:', error);
                }
              });
            }
          `
        }} />
        <InstallPrompt />
        <NotificationPrompt />
        <TokenRefresher />
        {/* reCAPTCHA Enterprise — requerido por Firebase App Check para phone auth */}
        <Script
          src="https://www.google.com/recaptcha/enterprise.js?render=6LeSM-AsAAAAAIY4YxApMXFW45hJacgQYoMxK0oa"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
