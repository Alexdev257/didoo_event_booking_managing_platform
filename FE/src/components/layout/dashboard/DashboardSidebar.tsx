"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSessionStore } from "@/stores/sesionStore";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  FolderTree,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Wallet,
  ShoppingBag,
  UserCircle,
} from "lucide-react";

const adminNavItems = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Người dùng", href: "/admin/users", icon: Users },
  { title: "Organizer", href: "/admin/organizers", icon: Building2 },
  { title: "Sự kiện", href: "/admin/events", icon: Calendar },
  { title: "Danh mục", href: "/admin/categories", icon: FolderTree },
  { title: "Doanh thu", href: "/admin/revenue", icon: DollarSign },
];

const organizerNavItems = [
  { title: "Bảng điều khiển", href: "/organizer/dashboard", icon: LayoutDashboard },
  { title: "Sự kiện", href: "/organizer/events", icon: Calendar },
  { title: "Ví & Doanh thu", href: "/organizer/earnings", icon: Wallet },
  { title: "Đơn hàng", href: "/organizer/orders", icon: ShoppingBag },
  { title: "Hồ sơ", href: "/organizer/profile", icon: UserCircle },
];

type Role = "admin" | "organizer";

export default function DashboardSidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const user = useSessionStore((state) => state.user);
  const [collapsed, setCollapsed] = useState(false);

  const navItems = role === "admin" ? adminNavItems : organizerNavItems;
  const label = role === "admin" ? "Admin" : "Organizer";

  return (
    <aside
      className={cn(
        "flex h-full flex-col rounded-2xl border border-border bg-card p-3 shadow-sm transition-all duration-200 dashboard-sidebar",
        collapsed ? "w-[88px]" : "w-[260px]"
      )}
    >
      <div className={cn("mb-4 flex items-center", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && (
          <Link href={role === "admin" ? "/admin/dashboard" : "/organizer/dashboard"} className="flex items-center gap-2">
            <div className="h-9 w-9 overflow-hidden rounded-xl border border-border">
              <Image src="/DiDoo.png" alt="DiDoo" width={36} height={36} className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
              <p className="text-sm font-semibold text-foreground">DiDoo</p>
            </div>
          </Link>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label={collapsed ? "Mở sidebar" : "Thu gọn sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== (role === "admin" ? "/admin/dashboard" : "/organizer/dashboard") &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition",
                collapsed ? "justify-center" : "gap-3",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={cn("mt-auto rounded-2xl border border-border bg-secondary/50", collapsed ? "p-2" : "p-3")}>
        <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-2")}>
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.FullName || label}`} />
            <AvatarFallback className="bg-muted text-foreground">{user?.FullName?.[0] || label[0]}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{user?.FullName || label}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.Email || ""}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
