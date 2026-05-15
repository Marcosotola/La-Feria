'use client';

import useToast from '@/hooks/useToast';
import BusinessInfoSection from '@/components/store/BusinessInfoSection';
import ToastContainer from '@/components/ui/ToastContainer';

export default function TiendaInfoPage() {
  const { toasts, showSuccess, showError, hideToast } = useToast();

  const showMessage = (type, msg) =>
    type === 'success' ? showSuccess(msg) : showError(msg);

  return (
    <>
      <BusinessInfoSection showMessage={showMessage} />
      <ToastContainer toasts={toasts} onHideToast={hideToast} />
    </>
  );
}
