"use client";

import { useGetMe } from "@/hooks/useAuth";
import { OrganizerOrdersFilters } from "./OrganizerOrdersFilters";
import { OrganizerOrdersTable } from "./OrganizerOrdersTable";

export function OrganizerOrdersContent({
  params,
}: {
  params: Record<string, string | string[] | undefined>;
}) {
  const { data: meRes } = useGetMe();
  const organizerId = meRes?.data?.organizerId ?? undefined;

  if (!organizerId) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-zinc-500">
        Bạn chưa có thông tin organizer.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OrganizerOrdersFilters organizerId={organizerId} params={params} />
      <OrganizerOrdersTable params={params} organizerId={organizerId} />
    </div>
  );
}
