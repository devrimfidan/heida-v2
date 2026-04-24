"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  BarChart2,
  TrendingUp,
  Users,
  Building2,
  Layers,
  Target,
  ChevronRight,
  BookOpen,
  Plug,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/data", label: "Data Entry", icon: ClipboardList },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart2 },
  { href: "/dashboard/indicators", label: "Indicators", icon: TrendingUp },
  { href: "/dashboard/help", label: "User Guide", icon: BookOpen },
];

const adminItems = [
  { href: "/dashboard/admin/users", label: "Users", icon: Users },
  { href: "/dashboard/admin/departments", label: "Departments", icon: Building2 },
  { href: "/dashboard/admin/groups", label: "Groups", icon: Layers },
  { href: "/dashboard/admin/goals", label: "Goals", icon: Target },
  { href: "/dashboard/admin/connectors", label: "Connectors", icon: Plug },
];

export function Sidebar({ userRole }: { userRole: number }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <span className="font-bold text-lg text-primary">HEIDA</span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive(href)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
            {isActive(href) && (
              <ChevronRight className="w-3 h-3 ml-auto" />
            )}
          </Link>
        ))}

        {userRole >= 4 && (
          <>
            <div className="pt-4 pb-1 px-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Admin
              </p>
            </div>
            {adminItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            ))}
          </>
        )}
      </nav>
    </aside>
  );
}
