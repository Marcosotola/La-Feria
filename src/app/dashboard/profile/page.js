// src/app/dashboard/profile/page.js
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardTopNavigation from '@/components/layout/DashboardTopNavigation';
import ProfileNavBadges from '@/components/layout/ProfileNavBadges';
import PersonalInfoSection from '@/components/profile/PersonalInfoSection';
import ProfileImageSection from '@/components/profile/ProfileImageSection';
import ToastContainer from '@/components/ui/ToastContainer';
import useToast from '@/hooks/useToast';
import { User, Shield, ChevronLeft } from 'lucide-react';

export default function ProfilePage() {
  const { isAuthenticated, userData, user, loading } = useAuth();
  const router = useRouter();
  const { toasts, showSuccess, showError, hideToast } = useToast();

  const [activeSection, setActiveSection] = useState('personal');

  // Estado para imagen de perfil
  const [profileImageState, setProfileImageState] = useState({
    url: '',
    uploading: false,
    preview: null
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (userData) {
      setProfileImageState(prev => ({
        ...prev,
        url: userData.profileImage || ''
      }));
    }
  }, [userData]);

  // Función mejorada para mostrar mensajes con toast
  const showMessage = (type, message) => {
    if (type === 'success') {
      showSuccess(message);
    } else {
      showError(message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !userData) {
    return null;
  }

  const fullName = `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || userData?.businessName || 'Usuario';

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return '✓';
      case 'pending': return '⏳';
      case 'rejected': return '✗';
      default: return '⏳';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Aprobado';
      case 'pending': return 'Pendiente';
      case 'rejected': return 'Rechazado';
      default: return 'Desconocido';
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'personal':
        return <PersonalInfoSection showMessage={showMessage} />;
      case 'image':
        return (
          <ProfileImageSection
            profileImageState={profileImageState}
            setProfileImageState={setProfileImageState}
            showMessage={showMessage}
          />
        );
      default:
        return <PersonalInfoSection showMessage={showMessage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardTopNavigation />
      
      {/* Header del perfil - Solo la parte con fondo */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Botón volver */}
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-white/80 hover:text-white mb-4 transition-colors text-sm group"
          >
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Volver a Mi Cuenta
          </button>

          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-white/30">
                {userData?.profileImage ? (
                  <img
                    src={userData.profileImage}
                    alt="Perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                )}
              </div>
              {/* Indicador de estado */}
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${getStatusColor(userData?.accountStatus)} flex items-center justify-center`}>
                <span className="text-white text-xs">{getStatusIcon(userData?.accountStatus)}</span>
              </div>
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white truncate">
                  {fullName}
                </h1>
                {userData?.role === 'admin' && (
                  <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-medium px-2 py-1 rounded-full">
                    <Shield className="w-3 h-3" />
                    Admin
                  </span>
                )}
              </div>
              <p className="text-white/80 text-sm sm:text-base truncate">
                {userData?.email}
              </p>
              <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 bg-white/20 border border-white/30 text-white">
                {getStatusText(userData?.accountStatus)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges de navegación */}
      <ProfileNavBadges 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderActiveSection()}
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onHideToast={hideToast} />
    </div>
  );
}