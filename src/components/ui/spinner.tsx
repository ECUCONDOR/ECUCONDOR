'use client';

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

export function Spinner({ 
  size = 'md', 
  fullScreen = false,
  className,
  ...props 
}: SpinnerProps) {
  const Component = (
    <div
      role="status"
      className={cn(
        "flex items-center justify-center",
        className
      )}
      {...props}
    >
      <Loader2 
        className={cn(
          "animate-spin text-muted-foreground",
          sizeClasses[size]
        )} 
      />
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {Component}
      </div>
    );
  }

  return Component;
}
