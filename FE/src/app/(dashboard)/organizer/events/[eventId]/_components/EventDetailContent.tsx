"use client";

import { useState } from "react";
import { useGetEvent } from "@/hooks/useEvent";
import { useGetTicketTypes, useTicketType } from "@/hooks/useTicket";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Loader2, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { EventStatus } from "@/utils/enum";
import type { TicketType } from "@/types/ticket";

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
    return new Date(s).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return s;
  }
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

export function EventDetailContent({ eventId }: { eventId: string }) {
  const [ticketTypeToDelete, setTicketTypeToDelete] = useState<{ id: string; name: string } | null>(null);
  const { data: eventRes, isLoading } = useGetEvent(eventId);
  const { data: ticketTypesRes } = useGetTicketTypes({ eventId });
  const { deleteTicketType } = useTicketType();
  const event = eventRes?.data;
  const ticketTypes: TicketType[] = ticketTypesRes?.data?.items ?? [];

  const handleDeleteTicketType = async () => {
    if (!ticketTypeToDelete) return;
    await deleteTicketType.mutateAsync(ticketTypeToDelete.id);
    setTicketTypeToDelete(null);
  };

  if (isLoading || !event) {
    return (
      <Card className="border-zinc-200">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Event info */}
      <Card className="border-zinc-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h2 className="text-lg font-semibold">Thông tin sự kiện</h2>
          <Button size="sm" variant="outline" className="rounded-xl" asChild>
            <Link href={`/organizer/events/${eventId}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Layout: Label bên trái | Nội dung bên phải - giống form tạo sự kiện */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[140px_1fr]">
            {/* Banner */}
            <div className="text-sm font-medium text-zinc-500 md:pt-1">Banner</div>
            <div>
              {event.bannerUrl ? (
                <div className="relative h-40 w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                  <Image src={event.bannerUrl} alt="Banner sự kiện" fill className="object-cover" sizes="100vw" />
                </div>
              ) : (
                <div className="flex h-32 w-full items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50 text-sm text-zinc-400">Chưa có banner</div>
              )}
            </div>

            {/* Thumbnail + Thông tin sự kiện cùng hàng */}
            <div className="text-sm font-medium text-zinc-500 md:pt-1">Thumbnail</div>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="relative h-40 w-56 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                {event.thumbnailUrl ? (
                  <Image src={event.thumbnailUrl} alt={event.name} fill className="object-cover" sizes="224px" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">Chưa có thumbnail</div>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <h3 className="text-xl font-semibold text-zinc-900">{event.name}</h3>
                {event.subtitle && <p className="text-sm text-zinc-600">{event.subtitle}</p>}
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={
                      event.status === EventStatus.OPENED
                        ? "default"
                        : event.status === EventStatus.CANCELLED
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {statusLabels[event.status as EventStatus] ?? event.status}
                  </Badge>
                  {event.category && <Badge variant="outline">{event.category.name}</Badge>}
                  {event.tags?.map((t, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {t.tagName}
                    </Badge>
                  ))}
                </div>
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-zinc-500">Slug</dt>
                    <dd className="font-mono text-zinc-700">{event.slug}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Bắt đầu</dt>
                    <dd>{formatDate(event.startTime)}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Kết thúc</dt>
                    <dd>{formatDate(event.endTime)}</dd>
                  </div>
                  {event.openTime && (
                    <div>
                      <dt className="text-zinc-500">Giờ mở cửa</dt>
                      <dd>{event.openTime}</dd>
                    </div>
                  )}
                  {event.closedTime && (
                    <div>
                      <dt className="text-zinc-500">Giờ đóng cửa</dt>
                      <dd>{event.closedTime}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-zinc-500">Độ tuổi</dt>
                    <dd>{event.ageRestriction > 0 ? `${event.ageRestriction}+` : "Mọi lứa tuổi"}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Sơ đồ chỗ ngồi */}
            <div className="text-sm font-medium text-zinc-500 md:pt-1">Sơ đồ chỗ ngồi</div>
            <div>
              {event.ticketMapUrl ? (
                <div className="space-y-2">
                  <a
                    href={event.ticketMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-xl border border-zinc-200"
                  >
                    <div className="relative aspect-video max-w-md overflow-hidden bg-zinc-100">
                      <Image src={event.ticketMapUrl} alt="Sơ đồ ghế" fill className="object-contain" sizes="448px" />
                    </div>
                  </a>
                  <a
                    href={event.ticketMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-sm text-primary hover:underline"
                  >
                    Xem full size →
                  </a>
                </div>
              ) : (
                <div className="flex h-24 w-full max-w-md items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50 text-sm text-zinc-400">Chưa có sơ đồ</div>
              )}
            </div>
          </div>

          {event.description && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-zinc-500">Mô tả</h4>
              <p className="whitespace-pre-wrap text-zinc-700">{event.description}</p>
            </div>
          )}

          {event.locations && event.locations.length > 0 && (
            <div>
              <h4 className="mb-3 text-sm font-medium text-zinc-500">Địa điểm</h4>
              <div className="space-y-3">
                {event.locations.map((loc, i) => (
                  <div
                    key={loc.id ?? i}
                    className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4"
                  >
                    <p className="font-medium text-zinc-900">{(loc as any).name || (loc as any).Name || `Địa điểm ${i + 1}`}</p>
                    <p className="text-sm text-zinc-600">{(loc as any).address || (loc as any).Address}</p>
                    {((loc as any).province || (loc as any).Province) && (
                      <p className="text-sm text-zinc-500">{(loc as any).province || (loc as any).Province}</p>
                    )}
                    {((loc as any).latitude ?? (loc as any).Latitude) != null && ((loc as any).longitude ?? (loc as any).Longitude) != null && (
                      <a
                        href={`https://maps.google.com/?q=${(loc as any).latitude ?? (loc as any).Latitude},${(loc as any).longitude ?? (loc as any).Longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-sm text-primary hover:underline"
                      >
                        Xem trên bản đồ →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket types */}
      <Card className="border-zinc-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h2 className="text-lg font-semibold">Loại vé</h2>
          <Button size="sm" className="rounded-xl" asChild>
            <Link href={`/organizer/events/${eventId}/ticket-types/create`}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm loại vé
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {ticketTypes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-200 py-12 text-center">
              <p className="text-sm text-zinc-500">Chưa có loại vé nào</p>
              <Button variant="outline" size="sm" className="mt-3 rounded-xl" asChild>
                <Link href={`/organizer/events/${eventId}/ticket-types/create`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm loại vé đầu tiên
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-zinc-200">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-200 hover:bg-transparent">
                    <TableHead>Tên</TableHead>
                    <TableHead>Giá</TableHead>
                    <TableHead>Số vé tối đa/người</TableHead>
                    <TableHead>Tổng số</TableHead>
                    <TableHead>Còn lại</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ticketTypes.map((tt) => (
                    <TableRow key={tt.id} className="border-zinc-100">
                      <TableCell className="font-medium">{tt.name}</TableCell>
                      <TableCell>{tt.price ? formatCurrency(tt.price) : "Miễn phí"}</TableCell>
                      <TableCell>{tt.maxTicketsPerUser ?? "Không giới hạn"}</TableCell>
                      <TableCell>{tt.totalQuantity}</TableCell>
                      <TableCell>{tt.availableQuantity}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem asChild>
                              <Link href={`/organizer/events/${eventId}/ticket-types/${tt.id}/edit`}>
                                Chỉnh sửa
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setTicketTypeToDelete({ id: tt.id, name: tt.name })}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmModal
        open={!!ticketTypeToDelete}
        onOpenChange={(o) => !o && setTicketTypeToDelete(null)}
        title="Xóa loại vé"
        description={`Bạn có chắc muốn xóa "${ticketTypeToDelete?.name}"?`}
        confirmLabel="Xóa"
        onConfirm={handleDeleteTicketType}
        isLoading={deleteTicketType.isPending}
        variant="danger"
      />
    </div>
  );
}
