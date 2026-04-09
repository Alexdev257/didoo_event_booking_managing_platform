"use client";

import { SectionHeader } from "@/components/base/SectionHeader";
import { KEY } from "@/utils/constant";

export function EventsPageHeader() {
  return (
    <SectionHeader
      title="Sự kiện"
      subtitle="Quản lý sự kiện hệ thống"
      refetchQueryKeys={[KEY.events]}
    />
  );
}
