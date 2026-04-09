"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import BaseFilter, { FilterConfig } from "@/components/base/BaseFilter";
import { EventsContent } from "../../events/_components/EventsContent";
import { ResalePageHero } from "./ResalePageHero";
import type { Event, Category } from "@/types/event";

type SortBy = "featured" | "date" | "name";

interface ResalePageContentProps {
  events: Event[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  categories: Category[];
  filters: FilterConfig[];
}

export function ResalePageContent({
  events,
  totalItems,
  totalPages,
  currentPage,
  itemsPerPage,
  categories,
  filters,
}: ResalePageContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sortBy = (searchParams.get("sortBy") as SortBy) ?? "featured";

  const updateParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set(key, value);
    if (key !== "pageNumber" && key !== "page") p.set("pageNumber", "1");
    router.push(`${pathname}?${p.toString()}`);
  };

  return (
    <>
      <ResalePageHero totalEvents={totalItems} totalCategories={categories.length} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <BaseFilter filters={filters} />

        <EventsContent
          events={events}
          sortBy={sortBy}
          onSortChange={(v) => updateParam("sortBy", v)}
          totalItems={totalItems}
          totalPages={totalPages}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={(p) => updateParam("pageNumber", String(p))}
          onPageSizeChange={(s) => updateParam("pageSize", String(s))}
          clearFiltersLink="/resale"
          variant="resale"
        />
      </div>
    </>
  );
}
