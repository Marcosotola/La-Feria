'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import EmploymentManager from '@/components/tienda/empleos/EmploymentManager';
import DashboardTopNavigation from '@/components/layout/DashboardTopNavigation';
import { Loader2, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EmpleosPortalPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (!authLoading && user) {
      loadUser();
    }
  }, [user, authLoading]);

  const loadUser = async () => {
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        setUserData({ id: snap.id, ...snap.data() });
      }
    } catch (e) {
      console.error('Error cargando usuario:', e);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Cargando portal de empleos...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <DashboardTopNavigation />
      <EmploymentManager storeId={user.uid} storeData={userData} />
    </>
  );
}
