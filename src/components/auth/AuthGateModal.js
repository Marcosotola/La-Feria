'use client'
import { useRouter } from 'next/navigation'
import { UserPlus, LogIn, X, ShoppingBag } from 'lucide-react'

export default function AuthGateModal({ onClose }) {
  const router = useRouter()

  const go = (path) => {
    onClose()
    router.push(path)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="px-6 pt-6 pb-2 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
              Bienvenido a <span className="text-primary-600">La Feria</span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              ¿Cómo querés continuar?
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Opciones */}
        <div className="px-6 py-4 space-y-3">

          {/* Ingresar */}
          <button
            onClick={() => go('/login')}
            className="w-full flex items-center gap-4 p-4 bg-brand-teal-600 hover:bg-brand-teal-700 text-white rounded-2xl shadow-lg shadow-brand-teal-600/30 transition-all active:scale-[0.98] text-left"
          >
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black text-base leading-tight">Ingresar</p>
              <p className="text-brand-teal-100 text-xs mt-0.5">
                Ya tenés cuenta, ingresá acá
              </p>
            </div>
          </button>

          {/* Registrarse */}
          <button
            onClick={() => go('/register')}
            className="w-full flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-500 rounded-2xl transition-all active:scale-[0.98] text-left group"
          >
            <div className="w-11 h-11 bg-primary-50 dark:bg-primary-900/30 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 rounded-xl flex items-center justify-center shrink-0 transition-colors">
              <UserPlus className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="font-black text-base text-gray-900 dark:text-white leading-tight">
                Registrarme gratis
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                ¿Primera vez en La Feria? Creá tu cuenta
              </p>
            </div>
          </button>

        </div>

        {/* Continuar sin cuenta */}
        <div className="px-6 pb-6 flex items-center justify-center gap-2">
          <ShoppingBag className="w-4 h-4 text-gray-400" />
          <button
            onClick={onClose}
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium transition-colors"
          >
            Continuar explorando sin cuenta
          </button>
        </div>

      </div>
    </div>
  )
}
