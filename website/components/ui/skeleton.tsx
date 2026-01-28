import * as React from "react";

import { cn } from "@/lib/utils";

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Simple shadcn-style skeleton block.
 * Use `className` to control size and layout.
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/60 dark:bg-muted/40",
        className,
      )}
      {...props}
    />
  );
}

