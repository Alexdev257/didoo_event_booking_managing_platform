"use client";

import BaseFilter from "@/components/base/BaseFilter";
import type { FilterConfig } from "@/components/base/BaseFilter";
import { useGetEvents } from "@/hooks/useEvent";
import { BookingStatus } from "@/utils/enum";

const statusOptions = [
  { label: "Tất cả", value: "" },
  { label: "Chờ thanh toán", value: String(BookingStatus.PENDING) },
  { label: "Đã thanh toán", value: String(BookingStatus.PAID) },
  { label: "Đã hủy", value: String(BookingStatus.CANCELLED) },
];

const sortOptions = [
  { label: "Mới nhất", value: "true" },
  { label: "Cũ nhất", value: "false" },
];

export function OrganizerOrdersFilters({
  organizerId,
  params,
}: {
  organizerId: string;
  params: Record<string, string | string[] | undefined>;
}) {
  const { data: eventsRes } = useGetEvents({ organizerId, pageSize: 100 });
  const events = eventsRes?.data?.items ?? [];

  const filters: FilterConfig[] = [
    {
      key: "eventId",
      label: "Sự kiện",
      type: "select",
      options: [{ label: "Tất cả", value: "" }, ...events.map((e) => ({ label: e.name, value: e.id }))],
    },
    { key: "status", label: "Trạng thái", type: "select", options: statusOptions },
    { key: "isDescending", label: "Sắp xếp", type: "select", options: sortOptions, defaultValue: "true" },
  ];

  return <BaseFilter filters={filters} />;
}
