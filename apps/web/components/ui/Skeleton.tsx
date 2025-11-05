import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * Skeleton loader for loading states with shimmer effect
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gray-200 rounded-md",
        "before:absolute before:inset-0",
        "before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent",
        "before:animate-shimmer",
        className
      )}
      style={{
        backgroundSize: "200% 100%"
      }}
      {...props}
    />
  );
}

/**
 * Provider card skeleton
 */
export function ProviderCardSkeleton() {
  return (
    <div className="bg-white rounded-md shadow-soft p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
      </div>
    </div>
  );
}