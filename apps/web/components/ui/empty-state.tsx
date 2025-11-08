import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

/**
 * Empty state component for no results or empty lists
 */
const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, children, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(
          "text-center py-12 rounded-2xl border border-dashed border-sandstone/30 bg-white",
          className
        )}
        {...props}
      >
        <div className="mx-auto max-w-md space-y-3">
          {icon && (
            <div className="mx-auto h-12 w-12 rounded-full bg-saffron/10 flex items-center justify-center">
              {icon}
            </div>
          )}
          {(title || description || action) && (
            <div className="space-y-2">
              {title && (
                <h4 className="text-lg font-medium text-slate-900">{title}</h4>
              )}
              {description && (
                <p className="text-sm text-slate-600">{description}</p>
              )}
              {action && <div className="mt-2">{action}</div>}
            </div>
          )}
          {children}
        </div>
      </section>
    );
  }
);

EmptyState.displayName = "EmptyState";

export { EmptyState };