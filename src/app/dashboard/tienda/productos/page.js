'use client';

import { useAuth } from '@/contexts/AuthContext';
import ProductManager from '@/components/tienda/productos/ProductManager';

export default function ProductosPage() {
  const { user, userData } = useAuth();
  return <ProductManager storeId={user?.uid} storeData={userData} />;
}
