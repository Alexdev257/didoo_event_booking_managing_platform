"use client";

import BaseFilter from "@/components/base/BaseFilter";
import type { FilterConfig } from "@/components/base/BaseFilter";

const sortOptions = [
  { label: "Mới nhất", value: "true" },
  { label: "Cũ nhất", value: "false" },
];

export function CategoriesFilters() {
  const filters: FilterConfig[] = [
    { key: "name", label: "Tên danh mục", type: "text", placeholder: "Tìm theo tên" },
    { key: "isDescending", label: "Sắp xếp", type: "select", options: sortOptions, defaultValue: "true" },
  ];

  return <BaseFilter filters={filters} />;
}
