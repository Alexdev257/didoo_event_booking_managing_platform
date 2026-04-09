"use client";

import { useGetMe } from "@/hooks/useAuth";

import { OrganizerEventsFilters } from "./OrganizerEventsFilters";
import { OrganizerEventsSection } from "./OrganizerEventsSection";

export function OrganizerEventsContent({
  params,
}: {
  params: Record<string, string | string[] | undefined>;
}) {
  const { data: meRes } = useGetMe();
  const organizerId = meRes?.data?.organizerId ?? undefined;

  if (!organizerId) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-zinc-500">
        Bạn chưa có thông tin organizer. Vui lòng cập nhật hồ sơ.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OrganizerEventsFilters organizerId={organizerId} />
      <OrganizerEventsSection params={params} organizerId={organizerId} />
    </div>
  );
}
