"use client";

import { useMemo } from "react";
import { useGetBooking, useGetBookingDetails } from "@/hooks/useBooking";
import { useGetEvent } from "@/hooks/useEvent";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

function formatDate(s: string | undefined | null) {
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
    return String(s);
  }
}

export function OrganizerOrderDetailContent({ id }: { id: string }) {
  const { data: bookingRes, isLoading: isBookingLoading } = useGetBooking(id);
  const booking = bookingRes?.data;

  const { data: eventRes } = useGetEvent(booking?.eventId || "");
  const event = eventRes?.data;

  const { data: detailsRes, isLoading: isDetailsLoading } = useGetBookingDetails(
    { bookingId: id, pageNumber: 1, pageSize: 100 },
    { enabled: !!id }
  );

  const details = detailsRes?.data?.items ?? booking?.bookingDetails ?? [];

  const statusVariant = useMemo(() => {
    const s = String(booking?.status ?? "").toLowerCase();
    if (s === "paid") return "default";
    if (s === "pending") return "secondary";
    return "secondary";
  }, [booking?.status]);

  if (isBookingLoading || isDetailsLoading) return null;

  if (!booking) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-zinc-500">
        Không tìm thấy đơn hàng.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-zinc-200">
        <CardHeader className="pb-0">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm text-zinc-500">Sự kiện</p>
              <p className="text-base font-semibold text-zinc-900">
                {event?.name || booking.eventId}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={statusVariant}>{booking.status}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-medium text-zinc-500">Khách hàng</p>
              <p className="mt-1 font-semibold text-zinc-900">{booking.fullname}</p>
              <p className="mt-1 text-sm text-zinc-600">{booking.email}</p>
              {booking.phone && <p className="text-sm text-zinc-600">{booking.phone}</p>}
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-medium text-zinc-500">Số lượng</p>
              <p className="mt-1 text-lg font-bold text-zinc-900">{booking.amount}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-medium text-zinc-500">Tổng tiền</p>
              <p className="mt-1 text-lg font-bold text-zinc-900">
                {formatCurrency(Number(booking.totalPrice || 0))}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-medium text-zinc-500">Ngày thanh toán</p>
              <p className="mt-1 font-semibold text-zinc-900">
                {formatDate(booking.paidAt ?? booking.createdAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-2xl border border-zinc-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-200 hover:bg-transparent">
              <TableHead>Vé</TableHead>
              <TableHead>Ghế</TableHead>
              <TableHead className="text-right">Số lượng</TableHead>
              <TableHead className="text-right">Giá</TableHead>
              <TableHead className="text-right">Thành tiền</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {details.length === 0 ? (
              <TableRow className="border-zinc-100">
                <TableCell colSpan={5} className="py-10 text-center text-zinc-500">
                  Không có chi tiết đơn hàng.
                </TableCell>
              </TableRow>
            ) : (
              details.map((d: any) => (
                <TableRow key={d.id} className="border-zinc-100">
                  <TableCell className="font-medium">{d.ticketId ?? "—"}</TableCell>
                  <TableCell className="text-zinc-600">{d.seatId ?? "—"}</TableCell>
                  <TableCell className="text-right text-zinc-600">{d.quantity}</TableCell>
                  <TableCell className="text-right text-zinc-600">
                    {formatCurrency(Number(d.pricePerTicket || 0))}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(Number(d.totalPrice || 0))}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

