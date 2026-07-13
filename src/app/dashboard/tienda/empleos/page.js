'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EmpleosPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/empleos');
  }, [router]);
  return null;
}
