import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  full: "max-w-full",
} as const;

type ContainerSize = keyof typeof sizeClasses;

interface ContainerProps extends React.ComponentProps<"div"> {
  size?: ContainerSize;
}

export function Container({
  size = "xl",
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      data-slot="container"
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", sizeClasses[size], className)}
      {...props}
    >
      {children}
    </div>
  );
}
