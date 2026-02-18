import { cn } from "@/lib/utils";

interface SidebarLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  sidebarClassName?: string;
  mainClassName?: string;
}

export function SidebarLayout({
  sidebar,
  children,
  className,
  sidebarClassName,
  mainClassName,
}: SidebarLayoutProps) {
  return (
    <div
      data-slot="sidebar-layout"
      className={cn("flex min-h-full", className)}
    >
      <aside
        className={cn(
          "hidden w-64 shrink-0 border-r bg-background md:block",
          sidebarClassName
        )}
      >
        {sidebar}
      </aside>
      <main className={cn("flex-1 overflow-auto", mainClassName)}>
        {children}
      </main>
    </div>
  );
}
