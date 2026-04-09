"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useGetCategories, useGetEvents } from "@/hooks/useEvent";
import Loading from "@/components/loading";
import BaseFilter, { FilterConfig } from "@/components/base/BaseFilter";
import { ResalePageContent } from "./_components/ResalePageContent";
import { EventStatus } from "@/utils/enum";

export default function ResalePage() {
  const searchParams = useSearchParams();

  const name = searchParams.get("name") ?? "";
  const categoryIdParam = searchParams.get("categoryId");
  const categoryId = categoryIdParam && categoryIdParam.trim() ? categoryIdParam : "all";
  const fromPriceParam = searchParams.get("fromPrice");
  const toPriceParam = searchParams.get("toPrice");
  const startTimeParam = searchParams.get("startTime");
  const endTimeParam = searchParams.get("endTime");
  const pageNumber = Math.max(
    1,
    Number(searchParams.get("pageNumber") ?? searchParams.get("page") ?? 1)
  );
  const pageSize = Number(searchParams.get("pageSize") ?? 12);

  const query = useMemo(
    () => ({
      pageNumber,
      pageSize,
      hasCategory: true,
      hasOrganizer: true,
      hasLocations: true,
      status: EventStatus.OPENED,
      isDeleted: false,
      ...(name && { name }),
      ...(categoryId && categoryId !== "all" && { categoryId }),
      ...(fromPriceParam && { fromPrice: Number(fromPriceParam) }),
      ...(toPriceParam && { toPrice: Number(toPriceParam) }),
      ...(startTimeParam && { startTime: startTimeParam }),
      ...(endTimeParam && { endTime: endTimeParam }),
      isDescending: true,
    }),
    [pageNumber, pageSize, name, categoryId, fromPriceParam, toPriceParam, startTimeParam, endTimeParam]
  );

  const { data: eventsResponse, isLoading: isEventsLoading } = useGetEvents(query);
  const { data: categoriesResponse, isLoading: isCategoriesLoading } =
    useGetCategories({ pageSize: 20 });

  const eventsData = eventsResponse?.data;
  const events = eventsData?.items ?? [];
  const totalItems = eventsData?.totalItems ?? 0;
  const totalPages = eventsData?.totalPages ?? 1;
  const currentPage = eventsData?.pageNumber ?? pageNumber;
  const itemsPerPage = eventsData?.pageSize ?? pageSize;

  const allCategories = categoriesResponse?.data.items ?? [];

  const filters: FilterConfig[] = [
    { key: "name", label: "Tìm kiếm", type: "text", placeholder: "Tên sự kiện..." },
    {
      key: "categoryId",
      label: "Danh mục",
      type: "select",
      options: [{ label: "Tất cả", value: "all" }, ...allCategories.map((c) => ({ label: c.name, value: c.id }))],
    },
    {
      key: "priceRange",
      label: "Khoảng giá",
      type: "numberRange",
      rangeKeys: ["fromPrice", "toPrice"],
      numberRangeVariant: "slider",
      rangeMin: 0,
      rangeMax: 10_000_000,
      rangeStep: 50_000,
      className: "flex-1 min-w-[200px]",
    },
    {
      key: "dateRange",
      label: "Khoảng thời gian",
      type: "dateRange",
      rangeKeys: ["startTime", "endTime"],
      placeholder: "Từ ngày - Đến ngày",
      className: "min-w-[220px]",
    },
  ];

  if (isEventsLoading || isCategoriesLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-background pb-20 pt-20">
      <ResalePageContent
        events={events}
        totalItems={totalItems}
        totalPages={totalPages}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        categories={allCategories}
        filters={filters}
      />
    </div>
  );
}
