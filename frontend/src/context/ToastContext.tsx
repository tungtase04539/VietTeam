import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Toast';

interface ToastContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message: string) => {
    const id = Date.now().toString() + Math.random().toString(36);
    setToasts((prev) => [...prev, { id, message, type: 'success' }]);
  }, []);

  const showError = useCallback((message: string) => {
    const id = Date.now().toString() + Math.random().toString(36);
    setToasts((prev) => [...prev, { id, message, type: 'error' }]);
  }, []);

  return (
    <ToastContext.Provider value={{ showSuccess, showError }}>
      {children}
      {/* Toast Container - Bottom Left */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col-reverse">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
