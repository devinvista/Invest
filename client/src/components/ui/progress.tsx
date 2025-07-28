"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    gradient?: 'purple' | 'teal' | 'orange' | 'success' | 'default'
  }
>(({ className, value, gradient = 'default', ...props }, ref) => {
  const getGradientClass = (gradientType: string) => {
    switch (gradientType) {
      case 'purple': return 'progress-gradient-purple';
      case 'teal': return 'progress-gradient-teal';
      case 'orange': return 'progress-gradient-orange';
      case 'success': return 'gradient-success';
      default: return 'bg-primary';
    }
  };

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
        className={cn(
          "h-full w-full flex-1 transition-all",
          getGradientClass(gradient)
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
