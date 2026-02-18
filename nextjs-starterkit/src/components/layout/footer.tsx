export function Footer() {
  const currentYear = new Date().getFullYear();

  const techLinks = [
    { label: "Next.js", href: "https://nextjs.org" },
    { label: "TypeScript", href: "https://typescriptlang.org" },
    { label: "Tailwind CSS", href: "https://tailwindcss.com" },
    { label: "shadcn/ui", href: "https://ui.shadcn.com" },
  ];

  return (
    <footer className="border-t border-border/40 py-6">
      <div className="container mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          &copy; {currentYear} Next.js Starter Kit. Built with modern web
          technologies.
        </p>
        <div className="flex items-center gap-4">
          {techLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
