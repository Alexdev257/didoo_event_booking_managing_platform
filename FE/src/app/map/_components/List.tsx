"use client";

import React from "react";
import DetailPlace from "./DetailPlace";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Event } from "@/types/event";
import { BasePagination } from "@/components/base/BasePagination";
import { Search } from "lucide-react";

interface ListProps {
  eventsData: Event[];
  isLoading: boolean;
  setSelectedEvent: React.Dispatch<React.SetStateAction<Event | null>>;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export default function List({
  eventsData,
  isLoading,
  setSelectedEvent,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems = 0,
  itemsPerPage = 10,
}: ListProps) {
  return (
    <div className="flex flex-col h-full min-h-0 items-center w-full">
      <div className="flex-1 w-[90%] overflow-y-auto overflow-x-hidden space-y-3 scroll-smooth pb-2 min-h-0 no-scrollbar">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card/30 rounded-2xl p-3 shadow-none border border-border/30 space-y-3 animate-pulse"
              >
                <div className="flex gap-4">
                  <Skeleton className="h-24 w-24 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-8 w-1/3 mt-auto" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : eventsData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="w-6 h-6 opacity-50" />
            </div>
            <p className="font-semibold text-foreground">Không tìm thấy sự kiện</p>
            <p className="text-sm mt-1 max-w-[200px]">
              Hãy thử tìm kiếm với từ khóa hoặc bộ lọc khác
            </p>
          </div>
        ) : (
          eventsData.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="group"
            >
              <DetailPlace eventData={event} setSelectedEvent={setSelectedEvent} />
            </motion.div>
          ))
        )}
      </div>

      {!isLoading && totalPages > 1 && onPageChange && (
        <div className="w-[90%] pt-3 pb-1 mt-auto border-t border-border/40 shrink-0">
          <BasePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            showSizeSelector={false}
          />
        </div>
      )}
    </div>
  );
}
