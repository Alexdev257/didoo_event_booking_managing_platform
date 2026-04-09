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
import { MoreHorizontal, Trash2, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import Link from "next/link";
import { EventStatus } from "@/utils/enum";
import type { Event } from "@/types/event";
import Image from "next/image";

function toQuery(params: Record<string, string | string[] | undefined>) {
  const q: Record<string, string | number | boolean> = {};
  const pageNumber = Number(params.pageNumber ?? params.page ?? 1) || 1;
  const pageSize = Number(params.pageSize) || 10;
  q.pageNumber = pageNumber;
  q.pageSize = pageSize;
  q.hasCategory = true;
  q.hasOrganizer = true;
  if (params.isDeleted !== undefined && params.isDeleted !== "") {
    q.isDeleted = params.isDeleted === "true";
  } else {
    q.isDeleted = false;
  }
  if (params.name && typeof params.name === "string") q.name = params.name;
  if (params.categoryId && typeof params.categoryId === "string" && params.categoryId !== "all") q.categoryId = params.categoryId;
  if (params.organizerId && typeof params.organizerId === "string" && params.organizerId !== "all") q.organizerId = params.organizerId;
  if (params.status && params.status !== "" && params.status !== "all") q.status = Number(params.status) as EventStatus;
  if (params.startTime && typeof params.startTime === "string") q.startTime = params.startTime;
  if (params.endTime && typeof params.endTime === "string") q.endTime = params.endTime;
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

// Component hiển thị vé
function TicketCell({ eventId }: { eventId: string }) {
  const { data: ticketRes } = useGetTicketTypes({ eventId }, { enabled: !!eventId });
  const ticketTypes = ticketRes?.data?.items || [];
  const { sold, available } = getTicketStats(ticketTypes);

  return sold > 0 || available > 0 ? (
    <span className="text-xs">
      <span className="text-emerald-500 font-medium">{sold}</span>
      <span className="text-muted-foreground"> / </span>
      <span className="text-muted-foreground">{sold + available}</span>
    </span>
  ) : "—";
}

interface EventsTableProps {
  params: Record<string, string | string[] | undefined>;
  onDelete?: (event: Event) => void;
  onApprove?: (event: Event) => void;
  onReject?: (event: Event) => void;
  onRestore?: (event: Event) => void;
  isUpdatingStatus?: boolean;
  isRestoring?: boolean;
}

export function EventsTable({ params, onDelete, onApprove, onReject, onRestore, isUpdatingStatus, isRestoring }: EventsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = toQuery(params);
  const showDeleted = query.isDeleted === true;
  const { data, isLoading } = useGetEvents(query);

  if (isLoading || !data) return null;

  const items = data.data?.items ?? [];
  const totalItems = data.data?.totalItems ?? 0;
  const pageNumber = data.data?.pageNumber ?? 1;
  const pageSize = data.data?.pageSize ?? 10;
  const totalPages = data.data?.totalPages ?? 1;

  const updateParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set(key, value);
    if (key !== "pageNumber" && key !== "page") p.set("pageNumber", "1");
    router.push(`${pathname}?${p.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-20 text-muted-foreground">Ảnh</TableHead>
              <TableHead className="text-muted-foreground">Tên</TableHead>
              <TableHead className="text-muted-foreground">Danh mục</TableHead>
              <TableHead className="text-muted-foreground">Organizer</TableHead>
              <TableHead className="text-muted-foreground">Ngày bắt đầu</TableHead>
              <TableHead className="text-muted-foreground">Vé</TableHead>
              <TableHead className="text-muted-foreground">Trạng thái</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((e) => (
              <TableRow key={e.id} className="border-border hover:bg-muted/30 transition-colors">
                <TableCell>
                  <div className="relative h-12 w-16 overflow-hidden rounded-lg bg-muted border border-border">
                    {e.thumbnailUrl ? (
                      <Image src={e.thumbnailUrl} alt="" fill className="object-cover" sizes="64px" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">—</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-foreground">{e.name}</TableCell>
                <TableCell className="text-muted-foreground">{e.category?.name ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{e.organizer?.name ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(e.startTime)}</TableCell>
                <TableCell className="text-muted-foreground">
                  <TicketCell eventId={e.id} />
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      e.status === EventStatus.OPENED
                        ? "default"
                        : e.status === EventStatus.CANCELLED
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {statusLabels[e.status as EventStatus] ?? e.status}
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
                        <Link href={`/admin/events/${e.id}`}>Xem chi tiết</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/events/${e.id}/edit`}>Chỉnh sửa</Link>
                      </DropdownMenuItem>
                      {e.status === EventStatus.DRAFT && onApprove && (
                        <DropdownMenuItem
                          onClick={() => onApprove(e)}
                          disabled={isUpdatingStatus}
                          className="text-emerald-600 focus:text-emerald-600"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Duyệt 
                        </DropdownMenuItem>
                      )}
                      {e.status === EventStatus.DRAFT && onReject && (
                        <DropdownMenuItem
                          onClick={() => onReject(e)}
                          disabled={isUpdatingStatus}
                          className="text-amber-600 focus:text-amber-600"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Từ chối
                        </DropdownMenuItem>
                      )}
                      {showDeleted &&
                        e.status === EventStatus.CANCELLED &&
                        onRestore &&
                        new Date(e.startTime) > new Date() && (
                          <DropdownMenuItem
                            onClick={() => onRestore(e)}
                            disabled={isRestoring}
                            className="text-emerald-600 focus:text-emerald-600"
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Khôi phục
                          </DropdownMenuItem>
                        )}
                      {onDelete && !showDeleted && (
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
