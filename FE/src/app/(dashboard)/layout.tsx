import { cookies } from "next/headers";
import { decodeJWT } from "@/lib/utils";
import { JWTUserType } from "@/types/auth";
import { Roles } from "@/utils/enum";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/layout/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  // Có refreshToken nhưng chưa có accessToken → AuthContext sẽ refresh, cho phép render
  if (!accessToken) {
    if (!refreshToken) redirect("/login");
    return <DashboardShell userRole={Roles.USER}>{children}</DashboardShell>;
  }

  let userRole: string;
  try {
    const decoded = decodeJWT<JWTUserType>(accessToken);
    userRole = decoded.Role;
    if (userRole !== Roles.ADMIN && userRole !== Roles.USER && userRole !== Roles.ORGANIZER) {
      redirect("/home");
    }
  } catch {
    redirect("/login");
  }

  return <DashboardShell userRole={userRole}>{children}</DashboardShell>;
}
