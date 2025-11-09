"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes, useEffect, useRef } from "react";

export interface DrawerProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  position?: "right" | "left";
  size?: "sm" | "md" | "lg";
}

/**
 * Drawer/sheet component for side panels
 */
export function Drawer({ 
  isOpen, 
  onClose, 
  position = "right", 
  size = "md",
  className,
  children 
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // focus the drawer for keyboard navigation
      setTimeout(() => {
        panelRef.current?.focus()
      }, 0)
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "w-full sm:w-[360px]",
    md: "w-full sm:w-[420px]",
    lg: "w-full sm:w-[480px]"
  };

  const positionClasses = {
    right: "right-0",
    left: "left-0"
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <aside
        className={cn(
          "fixed top-0 h-full bg-white shadow-2xl p-5 border-l border-gray-100 z-50",
          "transform transition-transform duration-300 ease-in-out",
          sizeClasses[size],
          positionClasses[position],
          position === "right" ? "translate-x-0" : "-translate-x-0",
          className
        )}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        ref={panelRef}
      >
        {/* Content */}
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </aside>
    </>
  );
}
