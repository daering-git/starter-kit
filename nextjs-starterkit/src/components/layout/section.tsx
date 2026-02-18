import { cn } from "@/lib/utils";
import { Container } from "./container";

interface SectionProps extends React.ComponentProps<"section"> {
  title?: string;
  description?: string;
  centered?: boolean;
  containerSize?: React.ComponentProps<typeof Container>["size"];
}

export function Section({
  title,
  description,
  centered = false,
  containerSize,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      data-slot="section"
      className={cn("py-16", className)}
      {...props}
    >
      <Container size={containerSize}>
        {(title || description) && (
          <div className={cn("mb-10 space-y-2", centered && "text-center")}>
            {title && (
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
