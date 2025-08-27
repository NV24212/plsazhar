import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  withLogo?: boolean;
  text?: string;
}

export function LoadingSpinner({
  className,
  size = "md",
  withLogo = false,
  text,
}: LoadingSpinnerProps) {
  const { t } = useLanguage();

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const logoSizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        className,
      )}
    >
      {withLogo && (
        <div
          className={cn(
            "flex items-center justify-center",
            logoSizeClasses[size],
          )}
        >
          <img
            src="/placeholder.svg"
            alt="Logo"
            className="w-full h-full object-contain"
          />
        </div>
      )}
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-muted border-t-primary",
          sizeClasses[size],
        )}
      />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

interface LoadingScreenProps {
  text?: string;
  className?: string;
}

export function LoadingScreen({ text, className }: LoadingScreenProps) {
  const { t } = useLanguage();

  return (
    <div
      className={cn("min-h-screen flex items-center justify-center", className)}
    >
      <LoadingSpinner size="lg" text={text || t("common.loading")} />
    </div>
  );
}
