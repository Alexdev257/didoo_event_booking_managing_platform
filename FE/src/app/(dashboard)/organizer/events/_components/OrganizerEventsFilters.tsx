"use client";

import BaseFilter from "@/components/base/BaseFilter";
import type { FilterConfig } from "@/components/base/BaseFilter";
import { useGetCategories } from "@/hooks/useEvent";
import { EventStatus } from "@/utils/enum";

const statusOptions = [
  { label: "Tất cả", value: "" },
  { label: "Nháp", value: String(EventStatus.DRAFT) },
  { label: "Đã duyệt", value: String(EventStatus.PUBLISHED) },
  { label: "Đã hủy", value: String(EventStatus.CANCELLED) },
  { label: "Đang mở", value: String(EventStatus.OPENED) },
  { label: "Đã đóng", value: String(EventStatus.CLOSED) },
];

const sortOptions = [
  { label: "Mới nhất", value: "true" },
  { label: "Cũ nhất", value: "false" },
];

export function OrganizerEventsFilters({ organizerId }: { organizerId: string }) {
  const { data: categoriesRes } = useGetCategories({ pageSize: 100 });
  const categories = categoriesRes?.data?.items ?? [];

  const filters: FilterConfig[] = [
    { key: "name", label: "Tên sự kiện", type: "text", placeholder: "Tìm theo tên" },
    {
      key: "categoryId",
      label: "Danh mục",
      type: "select",
      options: [{ label: "Tất cả", value: "" }, ...categories.map((c) => ({ label: c.name, value: c.id }))],
    },
    { key: "status", label: "Trạng thái", type: "select", options: statusOptions },
    { key: "isDescending", label: "Sắp xếp", type: "select", options: sortOptions, defaultValue: "true" },
  ];

  return <BaseFilter filters={filters} />;
}
