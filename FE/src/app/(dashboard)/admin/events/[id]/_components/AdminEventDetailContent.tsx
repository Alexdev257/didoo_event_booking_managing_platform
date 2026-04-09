"use client";

import { useGetEvent, useEvent } from "@/hooks/useEvent";
import { useGetTicketTypes } from "@/hooks/useTicket";
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
import { Loader2, Pencil, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { EventStatus } from "@/utils/enum";
import { TicketType } from "@/types/ticket";

const statusLabels: Record<EventStatus, string> = {
  [EventStatus.DRAFT]: "Nháp",
  [EventStatus.PUBLISHED]: "Đã duyệt ",
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

export function AdminEventDetailContent({ eventId }: { eventId: string }) {
  const { data: eventRes, isLoading } = useGetEvent(eventId);
  const { updateStatus } = useEvent();
  const { data: ticketTypesRes } = useGetTicketTypes({ eventId });
  const event = eventRes?.data;
  const ticketTypes: TicketType[] = ticketTypesRes?.data?.items ?? [];

  if (isLoading || !event) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const isDraft = event.status === EventStatus.DRAFT;

  return (
    <div className="space-y-6">
      {isDraft && (
        <Card className="border-amber-500/20 bg-amber-500/10">
          <CardHeader className="pb-2">
            <h2 className="text-lg font-semibold text-amber-600 dark:text-amber-500">Duyệt sự kiện</h2>
            <p className="text-sm text-amber-700 dark:text-amber-400/90">
              Sự kiện do organizer tạo đang chờ admin xác duyệt. Duyệt để xuất bản hoặc từ chối để trả về nháp.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="border-amber-600 text-amber-600 hover:bg-amber-600/10 dark:text-amber-500 dark:border-amber-500/50"
                onClick={() => updateStatus.mutate({ id: eventId, status: EventStatus.CANCELLED })}
                disabled={updateStatus.isPending}
              >
                {updateStatus.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4" />
                )}
                Từ chối
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => updateStatus.mutate({ id: eventId, status: EventStatus.PUBLISHED })}
                disabled={updateStatus.isPending}
              >
                {updateStatus.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Duyệt 
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h2 className="text-lg font-semibold">Thông tin sự kiện</h2>
          <Button size="sm" variant="outline" className="rounded-xl" asChild>
            <Link href={`/admin/events/${eventId}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Layout: Label bên trái | Nội dung bên phải - giống form tạo sự kiện */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[140px_1fr]">
            {/* Banner */}
            <div className="text-sm font-medium text-muted-foreground md:pt-1">Banner</div>
            <div>
              {event.bannerUrl ? (
                <div className="relative h-40 w-full overflow-hidden rounded-xl border border-border bg-muted/30">
                  <Image src={event.bannerUrl} alt="Banner sự kiện" fill className="object-cover" sizes="100vw" />
                </div>
              ) : (
                <div className="flex h-32 w-full items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 text-sm text-muted-foreground">Chưa có banner</div>
              )}
            </div>

            {/* Thumbnail + Thông tin sự kiện cùng hàng */}
            <div className="text-sm font-medium text-muted-foreground md:pt-1">Thumbnail</div>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="relative h-40 w-56 shrink-0 overflow-hidden rounded-xl border border-border bg-muted/30">
                {event.thumbnailUrl ? (
                  <Image src={event.thumbnailUrl} alt={event.name} fill className="object-cover" sizes="224px" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">Chưa có thumbnail</div>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <h3 className="text-xl font-semibold text-foreground">{event.name}</h3>
                {event.subtitle && <p className="text-sm text-muted-foreground">{event.subtitle}</p>}
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
                  {event.organizer && <Badge variant="outline">{event.organizer.name}</Badge>}
                  {event.tags?.map((t, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {t.tagName}
                    </Badge>
                  ))}
                </div>
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Slug</dt>
                    <dd className="font-mono text-foreground/80">{event.slug}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Bắt đầu</dt>
                    <dd className="text-foreground">{formatDate(event.startTime)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Kết thúc</dt>
                    <dd className="text-foreground">{formatDate(event.endTime)}</dd>
                  </div>
                  {event.openTime && (
                    <div>
                      <dt className="text-muted-foreground">Giờ mở cửa</dt>
                      <dd className="text-foreground">{event.openTime}</dd>
                    </div>
                  )}
                  {event.closedTime && (
                    <div>
                      <dt className="text-muted-foreground">Giờ đóng cửa</dt>
                      <dd className="text-foreground">{event.closedTime}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-muted-foreground">Độ tuổi</dt>
                    <dd className="text-foreground">{event.ageRestriction > 0 ? `${event.ageRestriction}+` : "Mọi lứa tuổi"}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Sơ đồ chỗ ngồi */}
            <div className="text-sm font-medium text-muted-foreground md:pt-1">Sơ đồ chỗ ngồi</div>
            <div>
              {event.ticketMapUrl ? (
                <div className="space-y-2">
                  <a
                    href={event.ticketMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-xl border border-border"
                  >
                    <div className="relative aspect-video max-w-md overflow-hidden bg-muted/10">
                      <Image src={event.ticketMapUrl} alt="Sơ đồ ghế" fill className="object-contain" sizes="448px" />
                    </div>
                  </a>
                  <a
                    href={event.ticketMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-sm text-primary hover:underline font-medium"
                  >
                    Xem full size →
                  </a>
                </div>
              ) : (
                <div className="flex h-24 w-full max-w-md items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 text-sm text-muted-foreground">Chưa có sơ đồ</div>
              )}
            </div>
          </div>

          {event.description && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-muted-foreground">Mô tả</h4>
              <p className="whitespace-pre-wrap text-foreground/90">{event.description}</p>
            </div>
          )}

          {event.locations && event.locations.length > 0 && (
            <div>
              <h4 className="mb-3 text-sm font-medium text-muted-foreground">Địa điểm</h4>
              <div className="space-y-3">
                {event.locations.map((loc, i) => (
                  <div
                    key={loc.id ?? i}
                    className="rounded-xl border border-border bg-muted/20 p-4"
                  >
                    <p className="font-medium text-foreground">{loc.name || `Địa điểm ${i + 1}`}</p>
                    <p className="text-sm text-muted-foreground">{loc.address}</p>
                    {loc.province && (
                      <p className="text-sm text-muted-foreground/80">{loc.province}</p>
                    )}
                    {loc.latitude != null && loc.longitude != null && (
                      <a
                        href={`https://maps.google.com/?q=${loc.latitude},${loc.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-sm text-primary hover:underline font-medium"
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

      {ticketTypes.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <h2 className="text-lg font-semibold text-foreground">Loại vé</h2>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-2xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Tên</TableHead>
                    <TableHead className="text-muted-foreground">Giá</TableHead>
                    <TableHead className="text-muted-foreground">Số vé tối đa/người</TableHead>
                    <TableHead className="text-muted-foreground">Tổng số</TableHead>
                    <TableHead className="text-muted-foreground">Còn lại</TableHead>
                    <TableHead className="hidden sm:table-cell text-muted-foreground">Mô tả</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ticketTypes.map((tt) => (
                    <TableRow key={tt.id} className="border-border hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium text-foreground">{tt.name}</TableCell>
                      <TableCell className="text-foreground">{Number(tt.price ?? 0) === 0 ? "Miễn phí" : formatCurrency(tt.price ?? 0)}</TableCell>
                      <TableCell className="text-muted-foreground">{tt.maxTicketsPerUser ?? "Không giới hạn"}</TableCell>
                      <TableCell className="text-muted-foreground">{tt.totalQuantity}</TableCell>
                      <TableCell className="text-muted-foreground">{tt.availableQuantity}</TableCell>
                      <TableCell className="max-w-[200px] truncate hidden sm:table-cell text-muted-foreground">
                        {tt.description || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
