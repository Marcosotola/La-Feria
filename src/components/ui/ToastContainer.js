// src/components/ui/ToastContainer.js
'use client';

import Toast from './Toast';

const ToastContainer = ({ toasts, onHideToast }) => {
  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 left-0 right-0 z-[9999] flex flex-col items-center gap-2 px-4 pointer-events-none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          duration={toast.duration}
          onClose={() => onHideToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;