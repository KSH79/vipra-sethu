import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "saffron" | "gold" | "sandstone" | "verified" | "secondary" | "outline";
}

/**
 * Badge component for displaying status, sampradaya, or verification
 */
const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "saffron", children, ...props }, ref) => {
    const variants = {
      saffron: "bg-saffron/10 text-saffron border-saffron/20",
      gold: "bg-gold/15 text-gold border-gold/20", 
      sandstone: "bg-sandstone/10 text-sandstone border-sandstone/20",
      verified: "bg-gold/15 text-gold border-gold/20",
      secondary: "bg-gray-100 text-gray-700 border-gray-200",
      outline: "bg-transparent border-2 border-saffron-200 text-saffron-700",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
          variants[variant],
          className
        )}
        {...props}
      >
        {variant === "verified" && (
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export { Badge };