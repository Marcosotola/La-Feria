'use client';

import { useAuth } from '@/contexts/AuthContext';
import ServiceManager from '@/components/tienda/servicios/ServiceManager';

export default function ServiciosPage() {
  const { user, userData } = useAuth();
  return <ServiceManager storeId={user?.uid} storeData={userData} />;
}
