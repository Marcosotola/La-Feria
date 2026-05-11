// src/app/terms/page.js
import { Shield, Users, Store, Bell, Lock, Mail } from 'lucide-react';

export const metadata = {
  title: 'Términos y Condiciones - La Feria',
  description: 'Términos y condiciones de uso de La Feria - Mercado comunitario de la iglesia TTL'
}

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Shield className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Términos y Condiciones
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          La Feria - Mercado comunitario de la iglesia "Toma Tu Lugar"
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Última actualización: Septiembre 2025
        </p>
      </div>

      {/* Contenido */}
      <div className="prose prose-lg max-w-none">
        
        {/* Introducción */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-primary-800 mb-4 flex items-center">
            <Users className="w-6 h-6 mr-2" />
            Bienvenido a La Feria
          </h2>
          <p className="text-primary-700 mb-0">
            La Feria es una plataforma comunitaria diseñada exclusivamente para los miembros de la iglesia "Toma Tu Lugar" (TTL). 
            Nuestro propósito es fomentar la conexión, el apoyo mutuo y el crecimiento de emprendimientos dentro de nuestra comunidad de fe.
          </p>
        </div>

        {/* Sección 1: Elegibilidad */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            1. Elegibilidad y Acceso
          </h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Requisitos de Membresía</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• <strong>Pertenencia a un hogar:</strong> Solo pueden registrarse miembros que pertenezcan a un hogar reconocido de la iglesia TTL</li>
              <li>• <strong>Validación administrativa:</strong> Todas las cuentas requieren validación por parte de un administrador</li>
              <li>• <strong>Verificación de email:</strong> Es obligatorio verificar la dirección de correo electrónico</li>
              <li>• <strong>Información familiar:</strong> Debe proporcionarse el nombre de la familia del hogar al que pertenece</li>
            </ul>
          </div>
        </section>

        {/* Sección 2: Uso de la Plataforma */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
            <Store className="w-6 h-6 mr-2" />
            2. Uso de la Plataforma
          </h2>
          
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-800 mb-3">Productos y Servicios Permitidos</h3>
              <ul className="space-y-2 text-blue-700">
                <li>• <strong>Productos:</strong> Alimentos caseros, artesanías, ropa, libros, y productos elaborados por miembros</li>
                <li>• <strong>Servicios:</strong> Servicios profesionales, del hogar, clases particulares, asesorías</li>
                <li>• <strong>Empleos:</strong> Ofertas laborales, búsquedas de empleo, trabajos freelance</li>
                <li>• <strong>Servicios de salud y bienestar</strong> ofrecidos por profesionales de la comunidad</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-red-800 mb-3">Contenido Prohibido</h3>
              <ul className="space-y-2 text-red-700">
                <li>• Productos o servicios que contradigan los valores cristianos</li>
                <li>• Contenido ofensivo, discriminatorio o que promueva división</li>
                <li>• Productos ilegales, peligrosos o que requieran licencias especiales</li>
                <li>• Esquemas piramidales o multinivel</li>
                <li>• Contenido comercial externo a la comunidad TTL</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Sección 3: Transacciones */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            3. Transacciones y Responsabilidades
          </h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-yellow-800 mb-3">Importante</h3>
            <ul className="space-y-2 text-yellow-700">
              <li>• <strong>La Feria es solo una plataforma de conexión:</strong> No somos parte de las transacciones comerciales</li>
              <li>• <strong>Responsabilidad directa:</strong> Las transacciones se realizan directamente entre los miembros</li>
              <li>• <strong>Resolución de conflictos:</strong> Los desacuerdos deben resolverse según los principios bíblicos de reconciliación</li>
              <li>• <strong>Calidad y garantías:</strong> Cada vendedor es responsable de la calidad de sus productos/servicios</li>
            </ul>
          </div>
        </section>

        {/* Sección 4: Notificaciones */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
            <Bell className="w-6 h-6 mr-2" />
            4. Notificaciones y Comunicaciones
          </h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <ul className="space-y-2 text-green-700">
              <li>• <strong>Consentimiento voluntario:</strong> Las notificaciones push son opcionales</li>
              <li>• <strong>Tipos de notificaciones:</strong> Nuevos productos, servicios, oportunidades de empleo, y actualizaciones de la comunidad</li>
              <li>• <strong>Control total:</strong> Puedes desactivar las notificaciones en cualquier momento</li>
              <li>• <strong>Frecuencia responsable:</strong> Nos comprometemos a no enviar spam</li>
            </ul>
          </div>
        </section>

        {/* Sección 5: Privacidad */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
            <Lock className="w-6 h-6 mr-2" />
            5. Privacidad y Protección de Datos
          </h2>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-purple-800 mb-3">Compromiso con tu Privacidad</h3>
            <ul className="space-y-2 text-purple-700">
              <li>• <strong>Datos mínimos necesarios:</strong> Solo recopilamos la información esencial para el funcionamiento de la plataforma</li>
              <li>• <strong>Uso interno exclusivo:</strong> Tus datos nunca serán vendidos o compartidos con terceros externos</li>
              <li>• <strong>Seguridad:</strong> Utilizamos Firebase y medidas de seguridad estándar de la industria</li>
              <li>• <strong>Acceso limitado:</strong> Solo administradores autorizados pueden acceder a información de usuarios</li>
              <li>• <strong>Derecho de eliminación:</strong> Puedes solicitar la eliminación de tu cuenta y datos en cualquier momento</li>
            </ul>
          </div>
        </section>

        {/* Sección 6: Conducta */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            6. Código de Conducta Cristiano
          </h2>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
            <p className="text-indigo-800 font-medium mb-4">
              "Así que, según tengamos oportunidad, hagamos bien a todos, y mayormente a los de la familia de la fe." (Gálatas 6:10)
            </p>
            <h3 className="text-lg font-medium text-indigo-800 mb-3">Principios de Convivencia</h3>
            <ul className="space-y-2 text-indigo-700">
              <li>• <strong>Amor y respeto:</strong> Tratar a todos los miembros con amor cristiano y respeto</li>
              <li>• <strong>Honestidad:</strong> Ser transparente en todas las descripciones de productos y servicios</li>
              <li>• <strong>Justicia:</strong> Establecer precios justos y razonables</li>
              <li>• <strong>Excelencia:</strong> Ofrecer productos y servicios de calidad</li>
              <li>• <strong>Edificación:</strong> Usar la plataforma para edificar y bendecir a la comunidad</li>
              <li>• <strong>Resolución bíblica:</strong> Resolver conflictos según Mateo 18:15-17</li>
            </ul>
          </div>
        </section>

        {/* Sección 7: Validación de Cuentas */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            7. Proceso de Validación
          </h2>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-orange-800 mb-3">Estados de Cuenta</h3>
            <ul className="space-y-2 text-orange-700">
              <li>• <strong>Pendiente:</strong> Cuenta nueva esperando validación administrativa</li>
              <li>• <strong>Validada:</strong> Cuenta verificada por un administrador de La Feria</li>
              <li>• <strong>Participación durante validación:</strong> Puedes publicar y participar mientras tu cuenta está pendiente</li>
              <li>• <strong>Indicador visible:</strong> El estado de validación será visible para otros usuarios</li>
              <li>• <strong>Proceso de validación:</strong> Los administradores verificarán tu pertenencia al hogar indicado</li>
            </ul>
          </div>
        </section>

        {/* Sección 8: Comentarios y Reputación */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
            <Mail className="w-6 h-6 mr-2" />
            8. Sistema de Comentarios y Reputación
          </h2>
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
            <ul className="space-y-2 text-teal-700">
              <li>• <strong>Comentarios constructivos:</strong> Los comentarios deben ser edificantes y constructivos</li>
              <li>• <strong>Experiencias reales:</strong> Solo comenta basándote en experiencias reales de transacción</li>
              <li>• <strong>Respeto mutuo:</strong> Mantén un tono respetuoso en todos los comentarios</li>
              <li>• <strong>Moderación:</strong> Los administradores pueden moderar comentarios inapropiados</li>
              <li>• <strong>Calificaciones justas:</strong> Las calificaciones deben reflejar honestamente la experiencia</li>
            </ul>
          </div>
        </section>

        {/* Sección 9: Modificaciones */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            9. Modificaciones de los Términos
          </h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <ul className="space-y-2 text-gray-700">
              <li>• <strong>Derecho de modificación:</strong> Nos reservamos el derecho de actualizar estos términos</li>
              <li>• <strong>Notificación:</strong> Los cambios importantes serán notificados a los usuarios</li>
              <li>• <strong>Fecha de vigencia:</strong> Los cambios entran en vigor al ser publicados</li>
              <li>• <strong>Uso continuado:</strong> El uso continuado de la plataforma implica aceptación de los nuevos términos</li>
            </ul>
          </div>
        </section>

        {/* Sección 10: Contacto */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            10. Contacto y Soporte
          </h2>
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
            <p className="text-primary-700 mb-4">
              Para consultas, soporte técnico o reportar problemas, puedes contactarnos a través de:
            </p>
            <ul className="space-y-2 text-primary-700">
              <li>• <strong>Email de soporte:</strong> soporte@laferia-ttl.com</li>
              <li>• <strong>Administradores de la iglesia TTL</strong></li>
              <li>• <strong>Sistema de comentarios</strong> dentro de la plataforma</li>
            </ul>
          </div>
        </section>

        {/* Conclusión */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">¡Gracias por ser parte de La Feria!</h2>
          <p className="text-primary-100 mb-4">
            Al aceptar estos términos, te unes a una comunidad comprometida con los valores cristianos, 
            el apoyo mutuo y el crecimiento conjunto en la fe.
          </p>
          <p className="text-sm text-primary-200">
            "Y considerémonos unos a otros para estimularnos al amor y a las buenas obras" (Hebreos 10:24)
          </p>
        </div>

        {/* Footer legal */}
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>
            La Feria © 2025 - Iglesia "Toma Tu Lugar" | 
            Desarrollado con ❤️ para nuestra comunidad de fe
          </p>
          <p className="mt-2">
            Estos términos están sujetos a las leyes aplicables y a los principios bíblicos de nuestra fe.
          </p>
        </div>
      </div>
    </div>
  );
}