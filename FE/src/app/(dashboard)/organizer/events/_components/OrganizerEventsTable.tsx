"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useGetEvents } from "@/hooks/useEvent";
import { useGetTicketTypes } from "@/hooks/useTicket";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BasePagination } from "@/components/base/BasePagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { EventStatus } from "@/utils/enum";
import type { Event } from "@/types/event";
import Image from "next/image";

function toQuery(
  params: Record<string, string | string[] | undefined>,
  organizerId: string
) {
  const q: Record<string, string | number | boolean> = {
    organizerId,
    hasCategory: true,
    isDeleted: false, // BE: mặc định chỉ lấy event chưa xóa
  };
  const pageNumber = Number(params.pageNumber ?? params.page ?? 1) || 1;
  const pageSize = Number(params.pageSize) || 10;
  q.pageNumber = pageNumber;
  q.pageSize = pageSize;
  if (params.name && typeof params.name === "string") q.name = params.name;
  if (params.categoryId && typeof params.categoryId === "string") q.categoryId = params.categoryId;
  if (params.status && params.status !== "") q.status = Number(params.status);
  if (params.isDescending !== undefined) q.isDescending = params.isDescending === "true";
  return q;
}

const statusLabels: Record<EventStatus, string> = {
  [EventStatus.DRAFT]: "Nháp",
  [EventStatus.PUBLISHED]: "Đã duyệt",
  [EventStatus.CANCELLED]: "Đã hủy",
  [EventStatus.OPENED]: "Đang mở",
  [EventStatus.CLOSED]: "Đã đóng",
};

function formatDate(s: string | undefined) {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return s;
  }
}

// Tính tổng vé đã bán và còn lại
function getTicketStats(ticketTypes?: { totalQuantity: number; availableQuantity: number }[]) {
  if (!ticketTypes || ticketTypes.length === 0) return { sold: 0, available: 0, total: 0 };
  const total = ticketTypes.reduce((sum, t) => sum + (t.totalQuantity || 0), 0);
  const available = ticketTypes.reduce((sum, t) => sum + (t.availableQuantity || 0), 0);
  const sold = total - available;
  return { sold, available, total };
}

export function OrganizerEventsTable({
  params,
  organizerId,
  onDelete,
}: {
  params: Record<string, string | string[] | undefined>;
  organizerId: string;
  onDelete?: (event: Event) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = toQuery(params, organizerId);
  const { data, isLoading } = useGetEvents(query);

  if (isLoading || !data) return null;

  const items = data.data?.items ?? [];
  const totalItems = data.data?.totalItems ?? 0;
  const pageNumber = data.data?.pageNumber ?? 1;
  const pageSize = data.data?.pageSize ?? 10;
  const totalPages = data.data?.totalPages ?? 1;

  // Component hiển thị vé
function TicketCell({ eventId }: { eventId: string }) {
  const { data: ticketRes } = useGetTicketTypes({ eventId }, { enabled: !!eventId });
  const ticketTypes = ticketRes?.data?.items || [];
  const { sold, available } = getTicketStats(ticketTypes);

  return sold > 0 || available > 0 ? (
    <span className="text-xs">
      <span className="text-green-600 font-medium">{sold}</span>
      <span className="text-zinc-400"> / </span>
      <span className="text-zinc-600">{sold + available}</span>
    </span>
  ) : "—";
}

  const updateParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set(key, value);
    if (key !== "pageNumber" && key !== "page") p.set("pageNumber", "1");
    router.push(`${pathname}?${p.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-200 hover:bg-transparent">
              <TableHead className="w-20">Ảnh</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Ngày bắt đầu</TableHead>
              <TableHead>Vé</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((e) => (
              <TableRow key={e.id} className="border-zinc-100">
                <TableCell>
                  <div className="relative h-12 w-16 overflow-hidden rounded-lg bg-zinc-100">
                    {e.thumbnailUrl ? (
                      <Image src={e.thumbnailUrl} alt="" fill className="object-cover" sizes="64px" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">—</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{e.name}</TableCell>
                <TableCell className="text-zinc-600">{e.category?.name ?? "—"}</TableCell>
                <TableCell className="text-zinc-600">{formatDate(e.startTime)}</TableCell>
                <TableCell className="text-zinc-600">
                  <TicketCell eventId={e.id} />
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      (e.status as EventStatus) === EventStatus.OPENED
                        ? "default"
                        : (e.status as EventStatus) === EventStatus.CANCELLED
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {statusLabels[(e.status as EventStatus) ?? 0] ?? e.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem asChild>
                        <Link href={`/organizer/events/${e.id}`}>Xem chi tiết</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/organizer/events/${e.id}/edit`}>Chỉnh sửa</Link>
                      </DropdownMenuItem>
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(e)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <BasePagination
        currentPage={pageNumber}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={pageSize}
        onPageChange={(p) => updateParam("pageNumber", String(p))}
        onPageSizeChange={(s) => updateParam("pageSize", String(s))}
      />
    </div>
  );
}
