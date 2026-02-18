import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "size-4 border-2",
  md: "size-6 border-2",
  lg: "size-10 border-[3px]",
} as const;

type SpinnerSize = keyof typeof sizeClasses;

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  className?: string;
  label?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
  label = "Loading...",
}: LoadingSpinnerProps) {
  return (
    <div
      data-slot="loading-spinner"
      role="status"
      className={cn("flex items-center gap-2", className)}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-border border-t-foreground",
          sizeClasses[size]
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
