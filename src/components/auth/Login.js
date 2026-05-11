'use client'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Phone, 
  Key, 
  ArrowRight, 
  Loader2,
  AlertCircle,
  Mail,
  Lock
} from 'lucide-react'

export default function Login({ onSwitchToRegister }) {
  const { 
    setupRecaptcha, 
    signInWithPhone, 
    signInWithGoogle,
    loginWithEmail 
  } = useAuth()

  const [step, setStep] = useState(1) // 1: Method Select / Phone, 2: OTP, 3: Email Login
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Datos
  const [phoneParts, setPhoneParts] = useState({ area: '', number: '' })
  const [otp, setOtp] = useState('')
  const [confirmationResult, setConfirmationResult] = useState(null)
  
  const [emailData, setEmailData] = useState({ email: '', password: '' })

  // === TELÉFONO ===
  const handleSendOtp = async (e) => {
    e.preventDefault()
    
    // Limpiamos espacios por si las dudas
    const cleanNumber = phoneParts.number.trim()
    const fullPhone = `+549${cleanNumber}`
    
    // Validación: Un número argentino completo (Cod. Área + Local) suele tener 10 dígitos
    if (cleanNumber.length < 10) {
      return setError('Número demasiado corto (ingresá Cód. Área + Número)')
    }
    
    setLoading(true)
    setError(null)
    try {
      const verifier = setupRecaptcha('recaptcha-container-login')
      const result = await signInWithPhone(fullPhone, verifier)
      setConfirmationResult(result)
      setStep(2)
    } catch (err) {
      setError('Error al enviar SMS. Verifica el número.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await confirmationResult.confirm(otp)
      // La redirección la maneja el AuthContext o el layout
      window.location.href = '/dashboard'
    } catch (err) {
      setError('Código incorrecto')
    } finally {
      setLoading(false)
    }
  }

  // === EMAIL ===
  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await loginWithEmail(emailData.email, emailData.password)
      window.location.href = '/dashboard'
    } catch (err) {
      setError('Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8 bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 relative overflow-hidden">
        
        <div className="text-center relative z-10">
          <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
            Bienvenido a <span className="text-primary-600">La Feria</span>
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
            Inicia sesión para continuar
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}

        <div id="recaptcha-container-login"></div>

        {step === 1 && (
          <div className="space-y-6">
            {/* OPCIÓN PRIMARIA: TELÉFONO */}
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 px-1 tracking-widest">Número de Celular</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-brand-teal-500 transition-colors" />
                  <input
                    type="tel"
                    required
                    placeholder="Cod. Área + Número (Ej: 11 1234 5678)"
                    value={phoneParts.number}
                    onChange={(e) => setPhoneParts({ ...phoneParts, number: e.target.value.replace(/\D/g, '') })}
                    className="w-full pl-12 pr-4 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-brand-teal-500 rounded-[2rem] transition-all font-black text-lg"
                  />
                </div>
                <p className="text-[10px] font-black text-gray-900 dark:text-gray-100 px-4 uppercase tracking-tight text-center">
                  ⚠️ Ingresar <span className="text-primary-600">SIN el 0</span> y <span className="text-primary-600">SIN el 15</span>
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-brand-teal-600 hover:bg-brand-teal-700 text-white font-black rounded-[2rem] shadow-xl shadow-brand-teal-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Enviar Código <ArrowRight className="w-5 h-5" /></>}
                </button>
              </div>
            </form>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white dark:bg-gray-900 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  Otras formas de acceso
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={signInWithGoogle}
                className="py-4 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" /> Google
              </button>
              <button
                onClick={() => setStep(3)}
                className="py-4 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Mail className="w-4 h-4" /> Email
              </button>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-500">
                ¿No tienes cuenta?{' '}
                <button onClick={onSwitchToRegister} className="text-primary-600 font-black hover:underline">Registrate gratis</button>
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Verifica tu código</h3>
              <p className="text-sm text-gray-500">Enviado al {phoneNumber}</p>
            </div>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-black text-center text-3xl tracking-[0.5em]"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Ingresar ahora</>}
              </button>
              <button onClick={() => setStep(1)} className="w-full text-center text-xs text-gray-400 font-bold">Volver atrás</button>
            </form>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                required
                placeholder="tu@email.com"
                value={emailData.email}
                onChange={(e) => setEmailData({...emailData, email: e.target.value})}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 font-bold"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                required
                placeholder="Tu contraseña"
                value={emailData.password}
                onChange={(e) => setEmailData({...emailData, password: e.target.value})}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 font-bold"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl shadow-xl transition-all"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Iniciar Sesión"}
            </button>
            <button onClick={() => setStep(1)} className="w-full text-center text-xs text-gray-400 font-bold">Usar otro método</button>
          </form>
        )}

      </div>
    </div>
  )
}