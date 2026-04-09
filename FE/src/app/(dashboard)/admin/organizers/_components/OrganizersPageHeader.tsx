"use client";

import { SectionHeader } from "@/components/base/SectionHeader";
import { KEY } from "@/utils/constant";

export function OrganizersPageHeader() {
  return (
    <SectionHeader
      title="Organizer"
      subtitle="Quản lý tổ chức sự kiện"
      createHref="/admin/organizers/create"
      createLabel="Tạo organizer"
      refetchQueryKeys={[KEY.organizers]}
    />
  );
}
