import { cookies } from "next/headers";
import { decodeJWT } from "@/lib/utils";
import { JWTUserType } from "@/types/auth";
import { redirect } from "next/navigation";

/** Chặn user không phải organizer vào /organizer - bổ sung cho proxy (server-side) */
export default async function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  // Không có accessToken → đang chờ AuthContext refresh, cho phép (layout cha đã xử lý)
  if (!accessToken) {
    return <>{children}</>;
  }

  try {
    const decoded = decodeJWT<JWTUserType & { IsOrganizer?: string; IsOrgainizer?: string }>(accessToken);
    const raw = decoded?.IsOrganizer ?? "";
    const isOrganizer = String(raw).toLowerCase() === "true";

    if (!isOrganizer) {
      redirect("/home");
    }
  } catch {
    redirect("/home");
  }

  return <>{children}</>;
}
