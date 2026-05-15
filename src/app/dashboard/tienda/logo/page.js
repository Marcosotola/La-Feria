'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import useToast from '@/hooks/useToast';
import StoreLogoSection from '@/components/store/StoreLogoSection';
import ToastContainer from '@/components/ui/ToastContainer';

export default function TiendaLogoPage() {
  const { userData } = useAuth();
  const { toasts, showSuccess, showError, hideToast } = useToast();
  const [logoState, setLogoState] = useState({ url: '', uploading: false, preview: null });

  useEffect(() => {
    if (userData?.storeLogo) {
      setLogoState(prev => ({ ...prev, url: userData.storeLogo }));
    }
  }, [userData]);

  const showMessage = (type, msg) =>
    type === 'success' ? showSuccess(msg) : showError(msg);

  return (
    <>
      <StoreLogoSection
        logoState={logoState}
        setLogoState={setLogoState}
        showMessage={showMessage}
      />
      <ToastContainer toasts={toasts} onHideToast={hideToast} />
    </>
  );
}
