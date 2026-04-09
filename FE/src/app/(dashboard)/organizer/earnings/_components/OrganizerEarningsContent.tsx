"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useGetMe } from "@/hooks/useAuth";
import { useGetEvents } from "@/hooks/useEvent";
import { useGetBookings } from "@/hooks/useBooking";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { BookingStatus } from "@/utils/enum";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

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

export function OrganizerEarningsContent({
  params,
}: {
  params: Record<string, string | string[] | undefined>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: meRes } = useGetMe();
  const organizerId = meRes?.data?.organizerId ?? undefined;
  const eventId = typeof params.eventId === "string" ? params.eventId : undefined;
  const pageNumber = Number(params.pageNumber ?? params.page ?? 1) || 1;
  const pageSize = Number(params.pageSize) || 20;

  const { data: eventsRes } = useGetEvents({ organizerId: organizerId ?? "", pageSize: 200 });
  const events = eventsRes?.data?.items ?? [];
  const eventIds = events.map((e) => e.id);
  const eventMap = new Map(events.map((e) => [e.id, e.name]));
  const effectiveEventId = eventId || eventIds[0];

  const { data: bookingsRes, isLoading } = useGetBookings(
    effectiveEventId
      ? { eventId: effectiveEventId, status: BookingStatus.PAID, pageNumber, pageSize, isDescending: true }
      : { pageNumber: 1, pageSize: 1 }
  );

  if (!organizerId) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-zinc-500">
        Bạn chưa có thông tin organizer.
      </div>
    );
  }

  if (isLoading || !bookingsRes) return null;

  const items = bookingsRes.data?.items ?? [];
  const totalItems = bookingsRes.data?.totalItems ?? 0;
  const totalPages = bookingsRes.data?.totalPages ?? 1;
  const totalRevenue = items.reduce((sum, b) => sum + (b.totalPrice ?? 0), 0);

  const updateParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set(key, value);
    if (key !== "pageNumber" && key !== "page") p.set("pageNumber", "1");
    router.push(`${pathname}?${p.toString()}`);
  };

  if (eventIds.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-zinc-500">
        Chưa có sự kiện nào.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-zinc-200">
          <CardHeader className="pb-2">
            <p className="text-sm font-medium text-zinc-500">Tổng thu (trang)</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-zinc-900">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-200">
          <CardHeader className="pb-2">
            <p className="text-sm font-medium text-zinc-500">Đơn đã thanh toán</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-zinc-900">{totalItems}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-200">
        <CardHeader>
          <h2 className="text-lg font-semibold text-zinc-900">Giao dịch</h2>
          {effectiveEventId && (
            <p className="text-sm text-zinc-500">Sự kiện: {eventMap.get(effectiveEventId) ?? effectiveEventId}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-zinc-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-200 hover:bg-transparent">
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Ngày thanh toán</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((b) => (
                  <TableRow key={b.id} className="border-zinc-100">
                    <TableCell className="font-medium">{b.fullname}</TableCell>
                    <TableCell className="text-zinc-600">{b.amount}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(b.totalPrice)}</TableCell>
                    <TableCell className="text-zinc-600">{formatDate(b.paidAt ?? b.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant="default">{b.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4">
            <BasePagination
              currentPage={pageNumber}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={pageSize}
              onPageChange={(p) => updateParam("pageNumber", String(p))}
              onPageSizeChange={(s) => updateParam("pageSize", String(s))}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
