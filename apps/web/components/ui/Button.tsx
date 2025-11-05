import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

/**
 * Reusable Button component with variants and sizes
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading = false, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          
          // Variants
          {
            "bg-saffron text-white hover:opacity-90 active:opacity-80 shadow-soft":
              variant === "primary",
            "bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 border border-slate-200 shadow-soft":
              variant === "secondary",
            "border-2 border-saffron text-saffron hover:bg-saffron/10 active:bg-saffron/20":
              variant === "outline",
            "text-slate-700 hover:bg-slate-100 active:bg-slate-200":
              variant === "ghost",
          },
          
          // Sizes
          {
            "px-3 py-1.5 text-sm": size === "sm",
            "px-4 py-2 text-base": size === "md",
            "px-6 py-3 text-lg": size === "lg",
          },
          
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };