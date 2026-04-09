"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useGetEvents } from "@/hooks/useEvent";
import { useGetBookings } from "@/hooks/useBooking";
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
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { BookingTypeStatus } from "@/utils/enum";

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

export function OrganizerOrdersTable({
  params,
  organizerId,
}: {
  params: Record<string, string | string[] | undefined>;
  organizerId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const eventIdParam = typeof params.eventId === "string" ? params.eventId : undefined;
  const pageNumber = Number(params.pageNumber ?? params.page ?? 1) || 1;
  const pageSize = Number(params.pageSize) || 10;
  const isDescending = params.isDescending !== "false";
  const status = params.status && params.status !== "" ? Number(params.status) : undefined;

  const { data: eventsRes } = useGetEvents({ organizerId, pageSize: 200 });
  const events = eventsRes?.data?.items ?? [];
  const eventIds = events.map((e) => e.id);
  const eventId = eventIdParam || (eventIds[0] ?? undefined);

  const { data: bookingsRes, isLoading } = useGetBookings(
    eventId
      ? { eventId, pageNumber, pageSize, isDescending, status, bookingType: BookingTypeStatus.NORMAL }
      : { pageNumber: 1, pageSize: 1 }
  );

  const totalItems = bookingsRes?.data?.totalItems ?? 0;
  const totalPages = bookingsRes?.data?.totalPages ?? 1;

  const updateParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set(key, value);
    if (key !== "pageNumber" && key !== "page") p.set("pageNumber", "1");
    router.push(`${pathname}?${p.toString()}`);
  };

  if (isLoading || !bookingsRes) return null;

  const items = bookingsRes.data?.items ?? [];

  if (eventIds.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-zinc-500">
        Chưa có sự kiện nào. Tạo sự kiện để xem đơn hàng.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-200 hover:bg-transparent">
              <TableHead>Khách hàng</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Số lượng</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead>Ngày thanh toán</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((b) => (
              <TableRow key={b.id} className="border-zinc-100">
                <TableCell className="font-medium">{b.fullname}</TableCell>
                <TableCell className="text-zinc-600">{b.email}</TableCell>
                <TableCell className="text-zinc-600">{b.amount}</TableCell>
                <TableCell className="font-medium">{formatCurrency(b.totalPrice)}</TableCell>
                <TableCell className="text-zinc-600">{formatDate(b.paidAt ?? b.createdAt)}</TableCell>
                <TableCell>
                  <Badge variant={b.status === "Paid" ? "default" : "secondary"}>{b.status}</Badge>
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
                        <Link href={`/organizer/orders/${b.id}`}>Xem chi tiết</Link>
                      </DropdownMenuItem>
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
