"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Roles } from "@/utils/enum";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";

type DashboardShellProps = {
  userRole: string;
  children: React.ReactNode;
};

/**
 * Client shell: kiểm tra path + role, redirect nếu sai.
 * Token chỉ có USER và ADMIN. Organizer = User có organizerId (verified).
 */
export default function DashboardShell({ userRole, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isAdminPath = pathname?.startsWith("/admin");
  const isOrganizerPath = pathname?.startsWith("/organizer");
  const canAccessAdmin = userRole === Roles.ADMIN;
  const canAccessOrganizer = userRole === Roles.USER || userRole === Roles.ORGANIZER;

  const shouldRedirect =
    (isAdminPath && !canAccessAdmin) || (isOrganizerPath && !canAccessOrganizer);

  useEffect(() => {
    if (shouldRedirect) router.replace("/home");
  }, [shouldRedirect, router]);

  const role: "admin" | "organizer" = isAdminPath ? "admin" : "organizer";

  if (shouldRedirect) return null;

  return (
    <div className="flex h-screen gap-4 overflow-hidden bg-background p-4">
      <div className="shrink-0">
        <DashboardSidebar role={role} />
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm dashboard-card">
        <DashboardHeader />
        <main className="min-h-0 flex-1 overflow-auto bg-muted/40 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
