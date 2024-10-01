"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.memo(
  React.forwardRef<
    React.ElementRef<typeof ProgressPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
  >(({ className, value, ...props }, ref) => {
    // Memoize the style object to prevent unnecessary re-renders
    const indicatorStyle = React.useMemo(
      () => ({
        transform: `translateX(-${100 - (value || 0)}%)`,
      }),
      [value]
    );

    return (
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className="h-full w-full flex-1 bg-primary transition-all"
          style={indicatorStyle}
        />
      </ProgressPrimitive.Root>
    );
  })
);

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
