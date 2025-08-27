import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, X, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AdminConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: "warning" | "danger" | "info";
  confirmText?: string;
  cancelText?: string;
}

export default function AdminConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "warning",
  confirmText,
  cancelText,
}: AdminConfirmDialogProps) {
  const { t } = useLanguage();

  const finalConfirmText = confirmText || t("common.yes");
  const finalCancelText = cancelText || t("common.cancel");
  const getIcon = () => {
    switch (type) {
      case "danger":
        return <X className="w-8 h-8 text-red-500" />;
      case "info":
        return <Shield className="w-8 h-8 text-blue-500" />;
      default:
        return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case "danger":
        return "bg-red-100";
      case "info":
        return "bg-blue-100";
      default:
        return "bg-yellow-100";
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-md max-h-[95vh] bg-white rounded-lg shadow-xl border border-gray-200">
        <DialogHeader className="space-y-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <div
              className={`p-2 sm:p-3 rounded-full ${getIconBg()} flex-shrink-0`}
            >
              {getIcon()}
            </div>
            <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
              <DialogTitle className="text-base sm:text-lg font-semibold text-gray-900 auto-text leading-tight">
                {title}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 auto-text leading-relaxed">
                {message}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 sm:pt-6">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 text-sm font-medium border-gray-300 hover:bg-gray-50 rounded-md touch-manipulation"
          >
            <span className="auto-text">{finalCancelText}</span>
          </Button>
          <Button
            onClick={handleConfirm}
            className={`w-full sm:w-auto px-4 sm:px-6 py-2.5 text-sm font-medium text-white rounded-md transition-colors touch-manipulation ${
              type === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : type === "info"
                  ? "bg-dashboard-primary hover:bg-dashboard-primary-light"
                  : "bg-yellow-600 hover:bg-yellow-700"
            }`}
          >
            <span className="auto-text">{finalConfirmText}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
