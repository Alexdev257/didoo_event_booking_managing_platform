"use client";

import BaseFilter from "@/components/base/BaseFilter";
import type { FilterConfig } from "@/components/base/BaseFilter";
import { OrganizerStatus } from "@/utils/enum";

const statusOptions = [
  { label: "Tất cả", value: "" },
  { label: "Chờ duyệt", value: String(OrganizerStatus.PENDING) },
  { label: "Đã xác minh", value: String(OrganizerStatus.VERIFIED) },
  { label: "Bị cấm", value: String(OrganizerStatus.BANNED) },
];

const isDeletedOptions = [
  { label: "Chưa xóa", value: "false" },
  { label: "Đã xóa", value: "true" },
];

const sortOptions = [
  { label: "Mới nhất", value: "true" },
  { label: "Cũ nhất", value: "false" },
];

export function OrganizersFilters() {
  const filters: FilterConfig[] = [
    { key: "name", label: "Tên", type: "text", placeholder: "Tìm theo tên" },
    { key: "slug", label: "Slug", type: "text", placeholder: "Tìm theo slug" },
    { key: "status", label: "Trạng thái", type: "select", options: statusOptions },
    { key: "isDeleted", label: "Trạng thái xóa", type: "select", options: isDeletedOptions, defaultValue: "false" },
    { key: "isDescending", label: "Sắp xếp", type: "select", options: sortOptions, defaultValue: "true" },
  ];

  return <BaseFilter filters={filters} />;
}
