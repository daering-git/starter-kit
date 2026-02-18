import { ArrowRight, Github, Layers, Palette, Zap, Code2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const techStack = [
  {
    icon: <Zap className="size-6" />,
    title: "Next.js 15",
    description:
      "App Router, Server Components, and Turbopack for blazing-fast development.",
    badge: "v15",
    badgeVariant: "default" as const,
  },
  {
    icon: <Code2 className="size-6" />,
    title: "TypeScript",
    description:
      "Strict mode enabled with full type safety across the entire codebase.",
    badge: "Strict",
    badgeVariant: "secondary" as const,
  },
  {
    icon: <Palette className="size-6" />,
    title: "Tailwind CSS v4",
    description:
      "CSS-first configuration with @theme inline and OKLCH color palette.",
    badge: "v4",
    badgeVariant: "outline" as const,
  },
  {
    icon: <Layers className="size-6" />,
    title: "shadcn/ui",
    description:
      "Accessible components built with Radix UI and the new v4 patterns.",
    badge: "New York",
    badgeVariant: "default" as const,
  },
];

const buttonShowcaseItems = [
  { variant: "default" as const, label: "Default" },
  { variant: "secondary" as const, label: "Secondary" },
  { variant: "outline" as const, label: "Outline" },
  { variant: "ghost" as const, label: "Ghost" },
  { variant: "destructive" as const, label: "Destructive" },
  { variant: "link" as const, label: "Link" },
];

const badgeShowcaseItems = [
  { variant: "default" as const, label: "Default" },
  { variant: "secondary" as const, label: "Secondary" },
  { variant: "outline" as const, label: "Outline" },
  { variant: "destructive" as const, label: "Destructive" },
];

export default function HomePage() {
  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-16">
      {/* Hero Section */}
      <section className="mb-20 text-center">
        <Badge variant="outline" className="mb-4">
          Next.js v15 + Tailwind v4 + shadcn/ui
        </Badge>
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-6xl">
          Modern Web Starter Kit
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
          A production-ready starter kit with the latest Next.js, TypeScript,
          Tailwind CSS v4 CSS-first configuration, and shadcn/ui v4 components.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="gap-2">
            Get Started <ArrowRight className="size-4" />
          </Button>
          <Button size="lg" variant="outline" className="gap-2">
            <Github className="size-4" /> View on GitHub
          </Button>
        </div>
      </section>

      {/* Tech Stack Grid */}
      <section className="mb-20">
        <h2 className="mb-2 text-center text-2xl font-bold">Tech Stack</h2>
        <p className="mb-8 text-center text-muted-foreground">
          Carefully selected tools for modern web development
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {techStack.map((tech) => (
            <Card key={tech.title}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="rounded-md border border-border/50 bg-muted p-2 text-primary">
                    {tech.icon}
                  </div>
                  <Badge variant={tech.badgeVariant}>{tech.badge}</Badge>
                </div>
                <CardTitle className="mt-2">{tech.title}</CardTitle>
                <CardDescription>{tech.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Component Showcase */}
      <section className="mb-20">
        <h2 className="mb-2 text-center text-2xl font-bold">
          Component Showcase
        </h2>
        <p className="mb-8 text-center text-muted-foreground">
          Pre-built UI components ready to use
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Button Variants */}
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>
                All button variants from shadcn/ui
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {buttonShowcaseItems.map((item) => (
                  <Button key={item.variant} variant={item.variant} size="sm">
                    {item.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Badge Variants */}
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
              <CardDescription>Status indicators and labels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {badgeShowcaseItems.map((item) => (
                  <Badge key={item.variant} variant={item.variant}>
                    {item.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Theme Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Theme Colors</CardTitle>
              <CardDescription>
                OKLCH-based semantic color system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: "BG", className: "bg-background border" },
                  { label: "FG", className: "bg-foreground" },
                  { label: "PRI", className: "bg-primary" },
                  { label: "SEC", className: "bg-secondary border" },
                  { label: "MUT", className: "bg-muted" },
                  { label: "ACC", className: "bg-accent border" },
                  { label: "DES", className: "bg-destructive" },
                  { label: "BOR", className: "bg-border" },
                ].map((color) => (
                  <div key={color.label} className="flex flex-col items-center gap-1">
                    <div
                      className={`size-8 rounded-md ${color.className}`}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {color.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
