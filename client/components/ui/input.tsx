import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isRTL?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, leftIcon, rightIcon, isRTL, ...props }, ref) => {
    const hasLeftIcon = leftIcon && !isRTL;
    const hasRightIcon = rightIcon && !isRTL;
    const hasLeftIconRTL = rightIcon && isRTL;
    const hasRightIconRTL = leftIcon && isRTL;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2 auto-text">
            {label}
          </label>
        )}
        <div className="relative">
          {/* Left icon (LTR) / Right icon (RTL) */}
          {(hasLeftIcon || hasLeftIconRTL) && (
            <div className={cn(
              "absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center",
              hasLeftIcon ? "left-3" : "right-3",
              "text-muted-foreground pointer-events-none"
            )}>
              {hasLeftIcon ? leftIcon : rightIcon}
            </div>
          )}

          <input
            type={type}
            className={cn(
              "flex h-12 w-full rounded-lg border border-input bg-background text-foreground",
              "px-4 py-3 text-base transition-all duration-200 ease-out",
              "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-muted-foreground placeholder:transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "focus-visible:border-ring focus:placeholder:text-muted-foreground/70",
              "hover:border-ring/50 hover:bg-accent/20",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
              "md:text-sm md:h-10",
              "touch-manipulation transform-gpu",
              // Enhanced RTL support
              isRTL && "text-right direction-rtl",
              !isRTL && "text-left direction-ltr",
              // Icon spacing
              hasLeftIcon && "pl-10 md:pl-9",
              hasRightIcon && "pr-10 md:pr-9",
              hasLeftIconRTL && "pr-10 md:pr-9",
              hasRightIconRTL && "pl-10 md:pl-9",
              // Error state
              error && "border-destructive focus-visible:ring-destructive",
              className,
            )}
            dir={isRTL ? "rtl" : "ltr"}
            ref={ref}
            {...props}
          />

          {/* Right icon (LTR) / Left icon (RTL) */}
          {(hasRightIcon || hasRightIconRTL) && (
            <div className={cn(
              "absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center",
              hasRightIcon ? "right-3" : "left-3",
              "text-muted-foreground pointer-events-none"
            )}>
              {hasRightIcon ? rightIcon : leftIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-2 text-sm text-destructive auto-text animate-in slide-in-from-top-1 duration-200">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
