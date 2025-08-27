import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, X, CheckCircle, XCircle, Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AdminAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "success" | "error" | "warning" | "info";
  buttonText?: string;
}

export default function AdminAlertDialog({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  buttonText,
}: AdminAlertDialogProps) {
  const { t } = useLanguage();

  const finalButtonText = buttonText || t("common.close");
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case "error":
        return <XCircle className="w-8 h-8 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
      default:
        return <Info className="w-8 h-8 text-blue-500" />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case "success":
        return "bg-green-100";
      case "error":
        return "bg-red-100";
      case "warning":
        return "bg-yellow-100";
      default:
        return "bg-blue-100";
    }
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

        <DialogFooter className="flex justify-center pt-4 sm:pt-6">
          <Button
            onClick={onClose}
            className={`w-full sm:w-auto px-6 sm:px-8 py-2.5 text-sm font-medium text-white rounded-md transition-colors touch-manipulation ${
              type === "error"
                ? "bg-red-600 hover:bg-red-700"
                : type === "success"
                  ? "bg-green-600 hover:bg-green-700"
                  : type === "warning"
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : "bg-dashboard-primary hover:bg-dashboard-primary-light"
            }`}
          >
            <span className="auto-text">{finalButtonText}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
