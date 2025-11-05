import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/**
 * Input component with label and error states
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type = "text", ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-slate-700">
            {label}
            {props.required && <span className="text-saffron ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            "w-full px-3 py-2 rounded-md border border-slate-300 bg-white",
            "text-slate-900 placeholder:text-slate-400",
            "focus:outline-none focus:ring-2 focus:ring-saffron focus:border-transparent",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-colors",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };