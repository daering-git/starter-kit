import { cn } from "@/lib/utils";
import { Container } from "./container";

interface ContentLayoutProps extends React.ComponentProps<"div"> {
  containerSize?: React.ComponentProps<typeof Container>["size"];
}

export function ContentLayout({
  containerSize = "xl",
  className,
  children,
  ...props
}: ContentLayoutProps) {
  return (
    <Container size={containerSize}>
      <div
        data-slot="content-layout"
        className={cn("py-8", className)}
        {...props}
      >
        {children}
      </div>
    </Container>
  );
}
