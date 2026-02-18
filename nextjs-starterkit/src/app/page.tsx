import {
  ArrowRight,
  Github,
  Users,
  Activity,
  TrendingUp,
  Package,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";

import { StatCard } from "@/components/common/stat-card";
import { UserAvatar } from "@/components/common/user-avatar";

import { PatternsSection } from "./_patterns-section";

// ─── Section 1: Hero (Layer 1 primitives) ───────────────────────────────────

function HeroSection() {
  return (
    <Section className="pb-12 pt-20">
      <Container>
        <div className="text-center">
          <Badge variant="outline" className="mb-4 gap-1.5">
            <Package className="size-3" />
            4-Layer Component Architecture
          </Badge>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-6xl">
            Next.js Starter Kit
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Production-ready with Next.js 15, TypeScript, Tailwind v4, shadcn/ui,
            TanStack Query, React Hook Form + Zod, and Sonner.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="gap-2">
              Get Started <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              <Github className="size-4" /> View on GitHub
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── Section 2: Stats (Layer 3 → Layer 1) ───────────────────────────────────

function StatsSection() {
  const stats = [
    {
      title: "Total Users",
      value: "12,340",
      icon: <Users className="size-4" />,
      trend: { value: 12, label: "from last month" },
      description: "from last month",
    },
    {
      title: "Active Sessions",
      value: "1,893",
      icon: <Activity className="size-4" />,
      trend: { value: 5.2, label: "from yesterday" },
      description: "from yesterday",
    },
    {
      title: "Revenue",
      value: "$48,295",
      icon: <TrendingUp className="size-4" />,
      trend: { value: 8.1, label: "from last week" },
      description: "from last week",
    },
    {
      title: "Packages",
      value: "234",
      icon: <Package className="size-4" />,
      trend: { value: -2.4, label: "from last month" },
      description: "from last month",
    },
  ];

  return (
    <Section
      title="Stats"
      description="Layer 3 StatCard composites built on Layer 1 Card + Badge primitives"
      centered
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
    </Section>
  );
}

// ─── Section 3: UI Primitives showcase (Layer 1) ────────────────────────────

function PrimitivesSection() {
  const buttonVariants = [
    { variant: "default" as const, label: "Default" },
    { variant: "secondary" as const, label: "Secondary" },
    { variant: "outline" as const, label: "Outline" },
    { variant: "ghost" as const, label: "Ghost" },
    { variant: "destructive" as const, label: "Destructive" },
    { variant: "link" as const, label: "Link" },
  ] as const;

  const avatarUsers = [
    { name: "Alice Kim", src: undefined },
    { name: "Bob Lee", src: undefined },
    { name: "Charlie Park", src: undefined },
  ];

  return (
    <Section
      title="UI Primitives (Layer 1)"
      description="shadcn/ui components — CVA variants, Radix Slot, semantic tokens"
      centered
    >
      <Tabs defaultValue="buttons" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="avatars">Avatars</TabsTrigger>
        </TabsList>

        <TabsContent value="buttons">
          <div className="flex flex-wrap gap-3">
            {buttonVariants.map((item) => (
              <Button key={item.variant} variant={item.variant}>
                {item.label}
              </Button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-3">
          <Alert>
            <AlertTitle>Default alert</AlertTitle>
            <AlertDescription>
              This is a default alert with semantic background tokens.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>Destructive alert</AlertTitle>
            <AlertDescription>
              This action is irreversible. Proceed with caution.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="avatars">
          <div className="flex flex-wrap items-center gap-6">
            {avatarUsers.map((user) => (
              <div key={user.name} className="flex flex-col items-center gap-2">
                <UserAvatar name={user.name} size="lg" />
                <span className="text-xs text-muted-foreground">{user.name}</span>
              </div>
            ))}
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-1.5">
                <UserAvatar name="Dan" size="sm" />
                <UserAvatar name="Eve" size="md" />
                <UserAvatar name="Frank" size="lg" />
              </div>
              <span className="text-xs text-muted-foreground">sm / md / lg</span>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <PrimitivesSection />
      <PatternsSection />
    </>
  );
}
