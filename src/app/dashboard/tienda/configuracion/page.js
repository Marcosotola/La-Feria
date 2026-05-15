'use client';

import useToast from '@/hooks/useToast';
import StoreConfigSection from '@/components/store/StoreConfigSection';
import ToastContainer from '@/components/ui/ToastContainer';

export default function TiendaConfiguracionPage() {
  const { toasts, showSuccess, showError, hideToast } = useToast();

  const showMessage = (type, msg) =>
    type === 'success' ? showSuccess(msg) : showError(msg);

  return (
    <>
      <StoreConfigSection showMessage={showMessage} onConfigUpdate={() => {}} />
      <ToastContainer toasts={toasts} onHideToast={hideToast} />
    </>
  );
}
