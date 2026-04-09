"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Loader2, Ticket as TicketIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Event } from "@/types/event";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2000&auto=format&fit=crop";

export interface TicketForResale {
  id: string;
  status?: string | number;
  event?: { id?: string };
  ticketType?: { id?: string; name?: string; price?: number };
  ticketTypeId?: string;
}

type TicketGroupFree = { ticketTypeId: string; name: string; tickets: TicketForResale[] };
type TicketGroupPaid = { ticketTypeId: string; name: string; price: number; tickets: TicketForResale[] };

interface CreateResaleContentProps {
  currentEvents: Event[];
  ownedCountByEvent: Map<string, number>;
  selectedEventId: string;
  ticketsByTypeInEvent: { free: TicketGroupFree[]; paid: TicketGroupPaid[] };
  selectedTicketIds: string[];
  selectedTicketsMeta: { sameType: boolean; isFree: boolean; ticketTypeName: string };
  formValues: { askingPrice: number; description: string };
  formErrors: { ticketIds?: { message?: string }; askingPrice?: { message?: string } };
  hasOwnedTicketsForSelectedEvent: boolean;
  isPending: boolean;
  onSelectEvent: (eventId: string) => void;
  onToggleTicket: (ticketId: string) => void;
  onChooseMany: (ticketTypeId: string) => void;
  onClearAll: () => void;
  onFormChange: (field: "askingPrice" | "description", value: number | string) => void;
  onSubmit: () => void;
}

export function CreateResaleContent({
  currentEvents,
  ownedCountByEvent,
  selectedEventId,
  ticketsByTypeInEvent,
  selectedTicketIds,
  selectedTicketsMeta,
  formValues,
  formErrors,
  hasOwnedTicketsForSelectedEvent,
  isPending,
  onSelectEvent,
  onToggleTicket,
  onChooseMany,
  onClearAll,
  onFormChange,
  onSubmit,
}: CreateResaleContentProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Đăng vé bán lại</h1>
          <p className="mt-1 text-muted-foreground font-medium">
            Chọn vé cùng loại để đăng bán. Vé trả phí cần nhập giá; vé miễn phí không cần.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/user/dashboard/resales">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Link>
        </Button>
      </div>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <h2 className="text-xl font-semibold text-foreground">Các sự kiện hiện tại</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground font-medium">Bạn chưa có vé phù hợp của sự kiện nào để đăng bán lại.</p>
          ) : (
            currentEvents.map((event) => {
              const ownedCount = ownedCountByEvent.get(event.id) || 0;
              const isActive = selectedEventId === event.id;
              return (
                <div
                  key={event.id}
                  className={`overflow-hidden rounded-2xl border ${isActive ? "border-primary" : "border-border shadow-sm"}`}
                >
                  <div className="grid gap-0 md:grid-cols-[1fr_220px]">
                    <div className="p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Sự kiện hiện tại
                      </p>
                      <p className="mt-1 text-xl font-bold text-foreground">{event.name}</p>
                      <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground font-medium">
                        <CalendarDays className="h-4 w-4" />
                        {new Date(event.startTime).toLocaleString("vi-VN")}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <Badge variant="outline">{ownedCount} vé đủ điều kiện</Badge>
                        <Button
                          type="button"
                          size="sm"
                          variant={isActive ? "default" : "outline"}
                          onClick={() => onSelectEvent(event.id)}
                        >
                          Chọn sự kiện
                        </Button>
                      </div>
                    </div>
                    <div className="relative min-h-[140px]">
                      <Image
                        src={event.thumbnailUrl || event.bannerUrl || FALLBACK_IMAGE}
                        alt={event.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Vé của tôi</h2>
            <p className="mt-1 text-sm text-muted-foreground font-medium">Chỉ được chọn vé cùng loại trong một đơn bán lại.</p>
          </div>
          {hasOwnedTicketsForSelectedEvent && selectedTicketIds.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={onClearAll}
            >
              Xóa tất cả ({selectedTicketIds.length})
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedEventId ? (
            <p className="text-sm text-muted-foreground font-medium">Vui lòng chọn sự kiện để hiển thị vé của bạn.</p>
          ) : !hasOwnedTicketsForSelectedEvent ? (
            <p className="text-sm text-rose-600">
              Bạn chưa mua vé phù hợp của sự kiện này hoặc vé đã dùng/hết điều kiện đăng bán.
            </p>
          ) : (
            <>
              {ticketsByTypeInEvent.free.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground/80">Vé miễn phí</h3>
                  {ticketsByTypeInEvent.free.map((group) => (
                    <div key={group.ticketTypeId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">
                          {group.name} ({group.tickets.length} vé)
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => onChooseMany(group.ticketTypeId)}
                        >
                          Chọn tất cả
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {group.tickets.map((ticket) => {
                          const checked = selectedTicketIds.includes(ticket.id);
                          const shortId = `#TKT-${ticket.id.replace(/-/g, "").slice(-6)}`;
                          return (
                            <label
                              key={ticket.id}
                              className={`flex cursor-pointer items-center gap-4 rounded-xl border p-3 transition-all hover:shadow-sm ${checked ? "border-primary bg-primary/5 dark:bg-primary/10" : "border-border bg-card hover:border-muted-foreground/30"}`}
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white">
                                <TicketIcon className="h-5 w-5" />
                              </div>
                              <div className="min-w-0 flex-1 space-y-1">
                                <p className="text-sm font-bold text-foreground">ID: {shortId}</p>
                                <p className="text-xs text-muted-foreground font-medium">Hạng vé: {group.name}</p>
                                <Badge className="bg-emerald-500/90 text-[10px] font-medium text-white">
                                  MIỄN PHÍ
                                </Badge>
                              </div>
                              <Checkbox checked={checked} onCheckedChange={() => onToggleTicket(ticket.id)} />
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {ticketsByTypeInEvent.paid.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground/80">Vé trả phí</h3>
                  {ticketsByTypeInEvent.paid.map((group) => (
                    <div key={group.ticketTypeId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">
                          {group.name} · {group.price.toLocaleString("vi-VN")}đ ({group.tickets.length} vé)
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => onChooseMany(group.ticketTypeId)}
                        >
                          Chọn tất cả
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {group.tickets.map((ticket) => {
                          const checked = selectedTicketIds.includes(ticket.id);
                          const shortId = `#TKT-${ticket.id.replace(/-/g, "").slice(-6)}`;
                          return (
                            <label
                              key={ticket.id}
                              className={`flex cursor-pointer items-center gap-4 rounded-xl border p-3 transition-all hover:shadow-sm ${checked ? "border-primary bg-primary/5 dark:bg-primary/10" : "border-border bg-card hover:border-muted-foreground/30"}`}
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                                <TicketIcon className="h-5 w-5" />
                              </div>
                              <div className="min-w-0 flex-1 space-y-1">
                                <p className="text-sm font-bold text-foreground">ID: {shortId}</p>
                                <p className="text-xs text-muted-foreground font-medium">Hạng vé: {group.name}</p>
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge className="bg-emerald-500/90 text-[10px] font-medium text-white">
                                    CÓ SẴN
                                  </Badge>
                                  <span className="text-xs text-muted-foreground font-medium">
                                    Giá gốc: {group.price.toLocaleString("vi-VN")}đ
                                  </span>
                                </div>
                              </div>
                              <Checkbox checked={checked} onCheckedChange={() => onToggleTicket(ticket.id)} />
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!selectedTicketsMeta.sameType && selectedTicketIds.length > 1 && (
                <p className="text-sm text-amber-600">Vé phải cùng loại. Vui lòng bỏ chọn vé khác loại.</p>
              )}
            </>
          )}

          {formErrors.ticketIds?.message ? (
            <p className="text-sm text-rose-600">{String(formErrors.ticketIds.message)}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <h2 className="text-xl font-semibold text-foreground">Thông tin bán lại</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedTicketsMeta.isFree && selectedTicketIds.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80">Giá bán mong muốn (VNĐ)</label>
              <Input
                type="number"
                min={0}
                value={formValues.askingPrice ?? 0}
                onChange={(e) =>
                  onFormChange("askingPrice", Number(e.target.value || 0))
                }
              />
              {formErrors.askingPrice?.message ? (
                <p className="text-sm text-rose-600">{String(formErrors.askingPrice.message)}</p>
              ) : null}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/80">Mô tả (tuỳ chọn)</label>
            <Textarea
              rows={3}
              value={formValues.description || ""}
              onChange={(e) => onFormChange("description", e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              className="flex-1"
              onClick={onSubmit}
              disabled={
                isPending ||
                !selectedEventId ||
                !hasOwnedTicketsForSelectedEvent ||
                selectedTicketIds.length === 0 ||
                !selectedTicketsMeta.sameType
              }
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang đăng...
                </>
              ) : (
                "Đăng bán vé ngay"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClearAll}>
              Hủy bỏ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
