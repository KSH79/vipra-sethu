"use client";

import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { InputHTMLAttributes, forwardRef, useState } from "react";

export interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  onClear?: () => void;
}

/**
 * Search bar with clear button
 */
const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, onClear, value, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value && String(value).length > 0;

    return (
      <div className="relative">
        <Search 
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors",
            isFocused ? "text-saffron" : "text-slate-400"
          )} 
        />
        <input
          ref={ref}
          type="search"
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "w-full pl-10 pr-10 py-3 rounded-md border border-slate-300 bg-white",
            "text-slate-900 placeholder:text-slate-400",
            "focus:outline-none focus:ring-2 focus:ring-saffron focus:border-transparent",
            "transition-all",
            className
          )}
          {...props}
        />
        {hasValue && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    );
  }
);

SearchBar.displayName = "SearchBar";

export { SearchBar };