'use client';

import { useState, useEffect } from 'react';
import { Share, PlusSquare, X, Download, Monitor, Smartphone } from 'lucide-react';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [platform, setPlatform] = useState(''); // 'ios', 'android', 'desktop', 'native'
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if already installed/standalone
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone ||
            document.referrer.includes('android-app://');

        setIsStandalone(isStandaloneMode);
        if (isStandaloneMode) return;

        // Detect Platform
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(userAgent);
        const isAndroid = /android/.test(userAgent);
        const isDesktop = !isIOS && !isAndroid;

        if (isIOS) {
            setPlatform('ios');
            // Show for iOS users after a small delay if not already shown recently
            const hasShown = localStorage.getItem('installPromptShown');
            if (!hasShown) {
                const timer = setTimeout(() => setShowModal(true), 3000);
                return () => clearTimeout(timer);
            }
        } else if (isAndroid) {
            setPlatform('android');
        } else {
            setPlatform('desktop');
        }

        // Capture beforeinstallprompt
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);

            // Check if we should show it
            const hasShown = localStorage.getItem('installPromptShown');
            if (!hasShown) {
                setShowModal(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setShowModal(false);
        }
    };

    const handleClose = () => {
        setShowModal(false);
        // Don't show again for a while (e.g., 7 days) needed? 
        // For now just mark as shown so it doesn't pop up every refresh
        localStorage.setItem('installPromptShown', 'true');
    };

    if (!showModal || isStandalone) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center relative">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="mx-auto bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm shadow-lg">
                        <img src="/icon-192.png" alt="Logo" className="w-12 h-12" />
                    </div>

                    <h3 className="text-xl font-bold mb-1">Instala App La Feria</h3>
                    <p className="text-blue-100 text-sm">
                        La mejor experiencia de compra en tu dispositivo
                    </p>
                </div>

                {/* Content */}
                <div className="p-6">

                    {platform === 'ios' && (
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                                    <Share size={24} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">1. Comparte</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Toca el ícono de <span className="font-bold">Compartir</span> en la barra de navegación.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                                    <PlusSquare size={24} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">2. Añadir a Inicio</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Busca y selecciona <span className="font-bold">"Agregar al inicio"</span>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {(platform === 'android' || platform === 'desktop' || deferredPrompt) && (
                        <div className="space-y-4">
                            <div className="text-center text-gray-600 dark:text-gray-300 mb-6">
                                {platform === 'desktop' ? (
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Monitor className="text-indigo-500" />
                                        <span>Instalar en tu PC o Laptop</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Smartphone className="text-indigo-500" />
                                        <span>Instalar en Android</span>
                                    </div>
                                )}
                                <p className="text-sm">
                                    Accede más rápido, recibe notificaciones y compra sin conexión.
                                </p>
                            </div>

                            <button
                                onClick={handleInstallClick}
                                className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <Download size={20} />
                                Instalar Aplicación
                            </button>
                        </div>
                    )}

                    {/* Backup for unsupported/unknown but not standalone */}
                    {platform === 'desktop' && !deferredPrompt && (
                        <div className="text-center text-sm text-gray-500 mt-4">
                            Busca el ícono de instalación en la barra de dirección de tu navegador.
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 text-center">
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium transition-colors"
                    >
                        Ahora no, continuar en navegador
                    </button>
                </div>

            </div>
        </div>
    );
}
