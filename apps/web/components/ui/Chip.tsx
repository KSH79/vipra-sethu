"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

/**
 * Chip component for filters and categories
 */
const Chip = forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, active, removable, onRemove, children, ...props }, ref) => {
    if (removable) {
      return (
        <div className={cn(
          "inline-flex items-center gap-2 rounded-full bg-saffron/10 text-saffron px-3 py-1.5 text-sm",
          className
        )}>
          <span>{children}</span>
          <button
            type="button"
            onClick={onRemove}
            className="h-4 w-4 rounded-full bg-saffron/20 hover:bg-saffron/30 flex items-center justify-center"
            aria-label="Remove"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-sandstone/30 bg-white px-3 py-1.5 text-sm",
          "hover:border-saffron/50 transition-colors",
          active && "bg-saffron/10 border-saffron/60 text-saffron",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Chip.displayName = "Chip";

export { Chip };