"use client";

import { useState } from "react";
import TicketsList from "@/app/(user)/user/dashboard/tickets/_components/TicketsList";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DashboardTicketsContent() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Vé của tôi</h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">Quản lý vé đã đặt</p>
        </div>
        <div className="flex w-full items-center gap-3 lg:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[190px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="ready">Sẵn sàng</SelectItem>
              <SelectItem value="locked">Đang khóa</SelectItem>
              <SelectItem value="unavailable">Không khả dụng</SelectItem>
              <SelectItem value="used">Đã dùng</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mới nhất</SelectItem>
              <SelectItem value="oldest">Cũ nhất</SelectItem>
              <SelectItem value="priceAsc">Giá tăng dần</SelectItem>
              <SelectItem value="priceDesc">Giá giảm dần</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <TicketsList statusFilter={statusFilter} sortBy={sortBy} />
    </div>
  );
}
