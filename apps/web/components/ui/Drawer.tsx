"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes, useEffect } from "react";
import { X } from "lucide-react";

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
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

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
        onClick={onClose}
      />
      
      {/* Drawer */}
      <aside
        className={cn(
          "fixed top-0 h-full bg-white shadow-2xl p-5 border-l border-gray-100",
          "transform transition-transform duration-300 ease-in-out",
          sizeClasses[size],
          positionClasses[position],
          position === "right" ? "translate-x-0" : "-translate-x-0",
          className
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-sandstone/10 hover:bg-sandstone/20 flex items-center justify-center transition-colors"
          aria-label="Close drawer"
        >
          <X className="h-4 w-4 text-slate-600" />
        </button>
        
        {/* Content */}
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </aside>
    </>
  );
}
