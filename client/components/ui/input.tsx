import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onFocus, onChange, inputMode, ...props }, ref) => {
    const innerRef = React.useRef<HTMLInputElement | null>(null);

    // forward ref
    React.useEffect(() => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(innerRef.current);
      } else if (typeof ref === "object") {
        try {
          (ref as React.MutableRefObject<HTMLInputElement | null>).current = innerRef.current;
        } catch {}
      }
    }, [ref]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      const el = innerRef.current;
      try {
        if (el && (type === "number" || inputMode === "numeric")) {
          const val = el.value ?? "";
          // If the field shows only a zero, clear it so user can type naturally
          if (val === "0") {
            el.value = "";
            // notify parent of change so controlled inputs update
            if (onChange) {
              const syntheticEvent = { target: el, currentTarget: el } as unknown as React.ChangeEvent<HTMLInputElement>;
              onChange(syntheticEvent);
            }
          } else if (/^\d+(?:\.\d+)?$/.test(val)) {
            // select all numeric content so typing replaces it
            el.select();
          }
        }
      } catch (err) {
        // swallow any errors to avoid breaking UI
        console.error("Input focus handling error:", err);
      }

      if (onFocus) onFocus(e);
    };

    return (
      <input
        type={type}
        inputMode={inputMode}
        className={cn(
          "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-gray-900 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={(el) => (innerRef.current = el)}
        onFocus={handleFocus}
        onChange={onChange}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
