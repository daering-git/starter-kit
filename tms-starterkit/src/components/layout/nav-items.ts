import {
  LayoutDashboard,
  Play,
  TestTubes,
  Server,
  TrendingUp,
  Upload,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Test Runs", href: "/runs", icon: Play },
  { title: "Suites", href: "/suites", icon: TestTubes },
  { title: "Hosts", href: "/hosts", icon: Server },
  { title: "Trends", href: "/trends", icon: TrendingUp },
  { title: "Upload", href: "/upload", icon: Upload },
  { title: "Settings", href: "/settings", icon: Settings },
];
