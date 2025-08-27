import { createContext, useContext, useState, ReactNode } from 'react';
import AdminConfirmDialog from '@/components/AdminConfirmDialog';
import AdminAlertDialog from '@/components/AdminAlertDialog';

interface DialogContextType {
  showConfirm: (options: ConfirmOptions) => Promise<boolean>;
  showAlert: (options: AlertOptions) => void;
}

interface ConfirmOptions {
  title: string;
  message: string;
  type?: 'warning' | 'danger' | 'info';
  confirmText?: string;
  cancelText?: string;
}

interface AlertOptions {
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  buttonText?: string;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve?: (value: boolean) => void;
  }>({
    isOpen: false,
    options: { title: '', message: '' }
  });

  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    options: AlertOptions;
  }>({
    isOpen: false,
    options: { title: '', message: '' }
  });

  const showConfirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmDialog({
        isOpen: true,
        options,
        resolve
      });
    });
  };

  const showAlert = (options: AlertOptions) => {
    setAlertDialog({
      isOpen: true,
      options
    });
  };

  const handleConfirmClose = () => {
    if (confirmDialog.resolve) {
      confirmDialog.resolve(false);
    }
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  };

  const handleConfirmConfirm = () => {
    if (confirmDialog.resolve) {
      confirmDialog.resolve(true);
    }
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  };

  const handleAlertClose = () => {
    setAlertDialog(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <DialogContext.Provider value={{ showConfirm, showAlert }}>
      {children}
      
      <AdminConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleConfirmClose}
        onConfirm={handleConfirmConfirm}
        title={confirmDialog.options.title}
        message={confirmDialog.options.message}
        type={confirmDialog.options.type}
        confirmText={confirmDialog.options.confirmText}
        cancelText={confirmDialog.options.cancelText}
      />

      <AdminAlertDialog
        isOpen={alertDialog.isOpen}
        onClose={handleAlertClose}
        title={alertDialog.options.title}
        message={alertDialog.options.message}
        type={alertDialog.options.type}
        buttonText={alertDialog.options.buttonText}
      />
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
}
