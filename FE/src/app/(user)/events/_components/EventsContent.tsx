"use client";

import { motion } from "framer-motion";
import { EventCard } from "./EventCard";
import { EventsEmptyState } from "./EventsEmptyState";
import { BasePagination } from "@/components/base/BasePagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Event } from "@/types/event";

export type SortBy = "featured" | "date" | "name";

interface EventsContentProps {
  events: Event[];
  sortBy: SortBy;
  onSortChange: (value: SortBy) => void;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  clearFiltersLink: string;
  variant?: "events" | "resale";
}

export function EventsContent({
  events,
  sortBy,
  onSortChange,
  totalItems,
  totalPages,
  currentPage,
  itemsPerPage,
  onPageChange,
  onPageSizeChange,
  clearFiltersLink,
  variant = "events",
}: EventsContentProps) {
  const isResale = variant === "resale";

  return (
    <div className="min-w-0">

      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="hidden sm:block" />
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs sm:text-sm text-muted-foreground font-bold uppercase tracking-wider whitespace-nowrap">Sắp xếp:</span>
          <Select
            value={sortBy}
            onValueChange={(value) => onSortChange(value as SortBy)}
          >
            <SelectTrigger
              className="h-9 sm:h-10 flex-1 sm:w-[170px] rounded-xl border border-border bg-card text-xs sm:text-sm font-bold text-foreground focus:ring-2 focus:ring-ring transition-all"
            >
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border border-border shadow-2xl">
              <SelectItem value="featured" className="text-xs sm:text-sm font-medium">Nổi bật</SelectItem>
              <SelectItem value="date" className="text-xs sm:text-sm font-medium">Theo ngày</SelectItem>
              <SelectItem value="name" className="text-xs sm:text-sm font-medium">Theo tên</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {events.length === 0 ? (
        <EventsEmptyState clearLink={clearFiltersLink} />
      ) : (
        <>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {events.map((event) => (
              <motion.div
                key={event.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <EventCard
                  event={event}
                  badge={isResale ? "Vé bán lại" : undefined}
                  badgeClassName={isResale ? "bg-amber-500" : "bg-primary"}
                  href={isResale ? `/resale/${event.id}` : `/events/${event.id}`}
                />
              </motion.div>
            ))}
          </motion.div>

          {(totalPages > 1 || totalItems > itemsPerPage) && (
            <div className="mt-12 flex justify-center">
              <BasePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                pageSizeOptions={[9, 12, 18, 24]}
                showInfo={false}
                showSizeSelector={false}
              />
            </div>
          )}

          {/* <EventsCtaBanner
            title={isResale ? "Mua vé bán lại an toàn" : "Đừng bỏ lỡ sự kiện"}
            description={
              isResale
                ? "Tìm vé sự kiện từ người bán uy tín. Đảm bảo giao dịch an toàn, minh bạch."
                : "Đăng ký nhận thông báo sự kiện mới, giá vé ưu đãi trước mọi người."
            }
            primaryLink={isResale ? "/events" : "/home"}
            primaryLabel={isResale ? "Xem sự kiện" : "Về trang chủ"}
            secondaryLink="/user/dashboard/tickets"
            secondaryLabel="Vé của tôi"
            variant={isResale ? "amber" : "primary"}
          /> */}
        </>
      )}
    </div>
  );
}
