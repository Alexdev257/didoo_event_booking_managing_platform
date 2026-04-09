"use client";

import { SectionHeader } from "@/components/base/SectionHeader";
import { KEY } from "@/utils/constant";

export function OrganizerEventsPageHeader() {
  return (
    <SectionHeader
      title="Sự kiện"
      subtitle="Quản lý sự kiện của bạn"
      createHref="/organizer/events/create"
      createLabel="Tạo sự kiện"
      refetchQueryKeys={[KEY.events]}
    />
  );
}
