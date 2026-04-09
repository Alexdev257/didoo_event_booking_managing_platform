"use client";

import BaseFilter from "@/components/base/BaseFilter";
import type { FilterConfig } from "@/components/base/BaseFilter";
import { useGetCategories, useGetOrganizers } from "@/hooks/useEvent";
import { EventStatus } from "@/utils/enum";

const statusOptions = [
  { label: "Tất cả", value: "all" },
  { label: "Nháp (chờ duyệt)", value: String(EventStatus.DRAFT) },
  { label: "Đã duyệt", value: String(EventStatus.PUBLISHED) },
  { label: "Đã hủy", value: String(EventStatus.CANCELLED) },
  { label: "Đang mở", value: String(EventStatus.OPENED) },
  { label: "Đã đóng", value: String(EventStatus.CLOSED) },
];

const isDeletedOptions = [
  { label: "Chưa xóa", value: "false" },
  { label: "Đã xóa", value: "true" },
];

const sortOptions = [
  { label: "Mới nhất", value: "true" },
  { label: "Cũ nhất", value: "false" },
];

export function EventsFilters() {
  const { data: categoriesRes } = useGetCategories({ pageSize: 100 });
  const { data: organizersRes } = useGetOrganizers({ pageSize: 100 });
  const categories = categoriesRes?.data?.items ?? [];
  const organizers = organizersRes?.data?.items ?? [];

  const filters: FilterConfig[] = [
    { key: "name", label: "Tên sự kiện", type: "text", placeholder: "Tìm theo tên" },
    {
      key: "categoryId",
      label: "Danh mục",
      type: "select",
      options: [{ label: "Tất cả", value: "all" }, ...categories.map((c) => ({ label: c.name, value: c.id }))],
    },
    {
      key: "organizerId",
      label: "Organizer",
      type: "select",
      options: [{ label: "Tất cả", value: "all" }, ...organizers.map((o) => ({ label: o.name, value: o.id }))],
    },
    { key: "status", label: "Trạng thái", type: "select", options: statusOptions },
    { key: "isDeleted", label: "Trạng thái xóa", type: "select", options: isDeletedOptions, defaultValue: "false" },
    {
      key: "dateRange",
      label: "Khoảng thời gian",
      type: "dateRange",
      rangeKeys: ["startTime", "endTime"],
      dateRangeVariant: "separate",
      className: "flex-1",
    },
    { key: "isDescending", label: "Sắp xếp", type: "select", options: sortOptions, defaultValue: "true" },
  ];

  return <BaseFilter filters={filters} />;
}
