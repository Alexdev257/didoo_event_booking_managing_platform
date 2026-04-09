"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSessionStore } from "@/stores/sesionStore";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  LayoutDashboard,
  ArrowUpRight,
  User as UserIcon,
  Calendar,
  Menu,
  MapPin,
  Ticket,
} from "lucide-react";
import { NotificationBell } from "@/components/layout/NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Roles } from "@/utils/enum";
import { useAuth } from "@/hooks/useAuth";
import { useProfileWithOrganizer } from "@/hooks/useProfileWithOrganizer";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/layout/buttonMode";

const MAIN_NAV_ITEMS = [
  { href: "/home", label: "Trang chủ", icon: LayoutDashboard },
  { href: "/events", label: "Sự kiện", icon: Calendar },
  { href: "/map", label: "Bản đồ", icon: MapPin },
  { href: "/resale", label: "Vé bán lại", icon: Ticket },
] as const;

const Header = () => {
  const user = useSessionStore((state) => state.user);
  const { isVerifiedOrganizer } = useProfileWithOrganizer();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    if (!user || !user.UserId) return;
    await logout.mutateAsync({ userId: user.UserId });
  };

  const showDashboard = () => {
    if (!user) return false;
    if (user.Role === Roles.ADMIN) return true;
    return user.Role === Roles.USER && isVerifiedOrganizer;
  };

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.Role === Roles.ADMIN) return "/admin/dashboard";
    if (isVerifiedOrganizer) return "/organizer/dashboard";
    return null;
  };

  const dashboardLink = getDashboardLink();

  const isActive = (path: string) =>
    pathname === path || pathname?.startsWith(path + "/");

  return (
    <>
      <div
        className={`fixed left-0 right-0 z-50 flex justify-center px-2 sm:px-4 transition-all duration-300 ${isScrolled ? "top-0" : "top-2 md:top-4"}`}
      >
        <header
          className="w-full max-w-6xl transition-all duration-300 bg-background/90 backdrop-blur-xl border border-border/80 shadow-lg shadow-black/5 rounded-2xl py-2 px-3 md:px-6 md:py-2.5"
        >
          <div className="flex items-center justify-between h-12">
            {/* Logo Section */}
            <Link
              href="/home"
              className="flex items-center gap-2 md:gap-2.5 group shrink-0"
            >
              <div className="relative h-8 w-8 md:h-9 md:w-9 overflow-hidden rounded-xl shadow-sm ring-1 ring-border/60">
                <Image
                  src="/DiDoo.png"
                  alt="DiDoo"
                  width={36}
                  height={36}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <span className="font-bold text-lg md:text-xl tracking-tight text-foreground hidden xs:block font-heading">
                DiDoo
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-0.5 bg-secondary/80 p-1 rounded-xl border border-border/70">
              {MAIN_NAV_ITEMS.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  active={isActive(item.href)}
                  label={item.label}
                />
              ))}
            </nav>

            {/* Right Side Icons & Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Desktop Theme Toggle */}
              <div className="hidden md:flex">
                <ModeToggle />
              </div>

              {/* Mobile Hamburger Menu (Middle-Right as requested) */}
              <div className="md:hidden">
                <Drawer direction="left">
                  <DrawerTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full bg-secondary/50"
                      aria-label="Mở menu"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="h-full w-[280px] max-w-[85vw] rounded-none">
                    <DrawerHeader className="border-b border-border text-left">
                      <DrawerTitle className="flex items-center gap-2 font-heading font-bold">
                        <Image src="/DiDoo.png" alt="DiDoo" width={32} height={32} className="rounded-lg" />
                        DiDoo
                      </DrawerTitle>
                    </DrawerHeader>
                    
                    <nav className="flex flex-col p-4 gap-1">
                      {MAIN_NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors min-h-[44px]",
                              isActive(item.href)
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            )}
                          >
                            <Icon className="h-5 w-5 shrink-0" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </nav>

                    <div className="mt-auto p-4 border-t border-border space-y-4 bg-muted/30">
                      <div className="flex items-center justify-between px-2">
                        <span className="text-sm font-bold text-muted-foreground">Giao diện</span>
                        <ModeToggle />
                      </div>

                      {user ? (
                        <div className="space-y-1">
                          <Link
                            href="/user/dashboard/profile"
                            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                          >
                            <UserIcon className="h-5 w-5" />
                            Hồ sơ
                          </Link>
                          {showDashboard() && dashboardLink && (
                            <Link
                              href={dashboardLink}
                              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                            >
                              <LayoutDashboard className="h-5 w-5" />
                              Bảng điều khiển
                            </Link>
                          )}
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-500/10 transition-colors text-left"
                          >
                            <LogOut className="h-5 w-5" />
                            Đăng xuất
                          </button>
                        </div>
                      ) : (
                        <Button asChild className="w-full h-12 rounded-xl font-bold bg-primary text-white">
                          <Link href="/login">
                            Đăng nhập
                            <ArrowUpRight className="ml-2 h-5 w-5" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </DrawerContent>
                </Drawer>
              </div>

              {/* Notification Bell (Always visible, far right on mobile) */}
              {user && <NotificationBell />}

              {/* Desktop Account / Action Button */}
              {user ? (
                <div className="hidden md:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl px-5 h-10 text-sm font-bold shadow-md shadow-primary/20 transition-all">
                        Tài khoản
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 bg-popover text-popover-foreground rounded-xl border border-border shadow-xl p-2 mt-3"
                    >
                      <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground font-semibold px-2 py-1.5">
                        Quản lý
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        className="rounded-lg cursor-pointer focus:bg-secondary"
                        asChild
                      >
                        <Link
                          href="/user/dashboard/profile"
                          className="flex items-center gap-2.5 px-2 py-2"
                        >
                          <UserIcon className="w-4 h-4" />
                          <span>Hồ sơ cá nhân</span>
                        </Link>
                      </DropdownMenuItem>
                      {showDashboard() && dashboardLink && (
                        <DropdownMenuItem
                          className="rounded-lg cursor-pointer focus:bg-secondary"
                          asChild
                        >
                          <Link
                            href={dashboardLink}
                            className="flex items-center gap-2.5 px-2 py-2"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            <span>Bảng điều khiển</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-rose-600 focus:text-rose-600 focus:bg-rose-500/10 rounded-lg cursor-pointer flex items-center gap-2.5 px-2 py-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="font-medium">Đăng xuất</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="hidden md:block">
                  <Link href="/login">
                    <Button className="rounded-xl px-5 h-10 text-sm font-bold flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all">
                      Đặt vé
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>
      </div>
    </>
  );
};

const NavItem = ({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) => (
  <Link href={href}>
    <div
      className={`px-4 py-2 text-sm font-bold transition-all rounded-lg ${
        active
          ? "bg-card text-primary shadow-sm border border-border"
          : "text-muted-foreground hover:text-foreground hover:bg-card/70"
      }`}
    >
      {label}
    </div>
  </Link>
);

export default Header;
