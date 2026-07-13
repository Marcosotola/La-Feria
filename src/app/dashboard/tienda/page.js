'use client';

import { useAuth } from '@/contexts/AuthContext';
import useToast from '@/hooks/useToast';
import TiendaSetupChecklist from '@/components/store/TiendaSetupChecklist';
import BusinessInfoSection from '@/components/store/BusinessInfoSection';
import ToastContainer from '@/components/ui/ToastContainer';

export default function TiendaInfoPage() {
  const { userData } = useAuth();
  const { toasts, showSuccess, showError, hideToast } = useToast();

  const showMessage = (type, msg) =>
    type === 'success' ? showSuccess(msg) : showError(msg);

  return (
    <>
      <TiendaSetupChecklist userData={userData} />
      <BusinessInfoSection showMessage={showMessage} />
      <ToastContainer toasts={toasts} onHideToast={hideToast} />
    </>
  );
}
