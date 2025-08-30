import { createContext, useContext, useState, ReactNode } from 'react';
import { Modal } from '@/components/ui/Modal';

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
      
      <Modal
        isOpen={confirmDialog.isOpen}
        onClose={handleConfirmClose}
        title={confirmDialog.options.title}
        description={confirmDialog.options.message}
        type={confirmDialog.options.type}
        actions={[
          {
            label: confirmDialog.options.cancelText || 'Cancel',
            onClick: handleConfirmClose,
            variant: 'outline',
          },
          {
            label: confirmDialog.options.confirmText || 'Confirm',
            onClick: handleConfirmConfirm,
            variant: confirmDialog.options.type === 'danger' ? 'destructive' : 'default',
          },
        ]}
      />

      <Modal
        isOpen={alertDialog.isOpen}
        onClose={handleAlertClose}
        title={alertDialog.options.title}
        description={alertDialog.options.message}
        type={alertDialog.options.type}
        actions={[
          {
            label: alertDialog.options.buttonText || 'OK',
            onClick: handleAlertClose,
            variant: 'default',
          },
        ]}
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
