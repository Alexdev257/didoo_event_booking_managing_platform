"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGetMe } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import Loading from "@/components/loading";
import { LayoutDashboard, Ticket, History, UserCircle, CircleDollarSign, Bell } from "lucide-react";

const navItems = [
  { title: "Tổng quan", href: "/user/dashboard", icon: LayoutDashboard },
  { title: "Vé của tôi", href: "/user/dashboard/tickets", icon: Ticket },
  { title: "Vé bán lại", href: "/user/dashboard/resales", icon: CircleDollarSign },
  { title: "Lịch sử mua hàng", href: "/user/dashboard/history", icon: History },
  { title: "Thông báo", href: "/user/dashboard/notifications", icon: Bell },
  { title: "Hồ sơ", href: "/user/dashboard/profile", icon: UserCircle },
];

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: meRes, isLoading } = useGetMe();
  const user = meRes?.data;

  if (isLoading) return <Loading />;

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm max-w-md">
          <p className="text-muted-foreground">Vui lòng đăng nhập để truy cập dashboard.</p>
          <Link
            href={`/login?redirect=${encodeURIComponent("/user/dashboard")}`}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 font-semibold text-white hover:bg-primary/90"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background px-4 py-24 pb-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 right-0 w-80 h-80 rounded-full bg-primary/5 blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-primary/5 blur-[60px]" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-64">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <h2 className="mb-4 px-3 text-sm font-semibold text-foreground">Tài khoản của tôi</h2>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href || 
                  (item.href !== "/user/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
