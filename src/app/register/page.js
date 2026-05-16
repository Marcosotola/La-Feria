// src/app/register/page.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Register from '@/components/auth/Register';

export default function RegisterPage() {
  const { isAuthenticated, needsProfileCompletion, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) return;
    if (!needsProfileCompletion && userData?.profileCompleted) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, needsProfileCompletion, userData, loading, router]);

  const switchToLogin = () => {
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-white rounded-lg"></div>
          </div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return <Register onSwitchToLogin={switchToLogin} />;
}