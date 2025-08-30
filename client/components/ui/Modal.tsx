import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Shield,
  X,
} from "lucide-react";

type ModalType = "success" | "error" | "warning" | "info" | "danger";

interface Action {
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children?: React.ReactNode;
  actions?: Action[];
  type?: ModalType;
}

const getIcon = (type?: ModalType) => {
  switch (type) {
    case "success":
      return <CheckCircle className="w-8 h-8 text-green-500" />;
    case "error":
      return <XCircle className="w-8 h-8 text-red-500" />;
    case "warning":
      return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
    case "danger":
      return <X className="w-8 h-8 text-red-500" />;
    case "info":
      return <Info className="w-8 h-8 text-blue-500" />;
    default:
      return null;
  }
};

const getIconBg = (type?: ModalType) => {
  switch (type) {
    case "success":
      return "bg-green-100";
    case "error":
      return "bg-red-100";
    case "warning":
      return "bg-yellow-100";
    case "danger":
      return "bg-red-100";
    case "info":
      return "bg-blue-100";
    default:
      return "";
  }
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  actions,
  type,
}) => {
  const icon = getIcon(type);
  const iconBg = getIconBg(type);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-md max-h-[95vh] bg-white rounded-lg shadow-xl border border-gray-200">
        <DialogHeader className="space-y-4">
          <div className="flex items-start gap-3 sm:gap-4">
            {icon && (
              <div className={`p-2 sm:p-3 rounded-full ${iconBg} flex-shrink-0`}>
                {icon}
              </div>
            )}
            <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
              <DialogTitle className="text-base sm:text-lg font-semibold text-gray-900 auto-text leading-tight">
                {title}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 auto-text leading-relaxed">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        {children}
        <DialogFooter className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 sm:pt-6">
          {actions?.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              variant={action.variant}
              className={action.className}
            >
              {action.label}
            </Button>
          ))}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
