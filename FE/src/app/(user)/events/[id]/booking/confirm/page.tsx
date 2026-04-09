"use client";

import { Suspense, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ChevronLeft, CalendarDays, Ticket } from "lucide-react";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { useGetBooking } from "@/hooks/useBooking";
import { useGetEvent } from "@/hooks/useEvent";

const totalPrice = (booking: { totalPrice?: number; amount?: number }) =>
  Number(booking.totalPrice ?? booking.amount ?? 0).toLocaleString("vi-VN") + "đ";

function ConfirmContent({ eventId }: { eventId: string }) {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") || "";

  const { data: bookingRes, isLoading, isError } = useGetBooking(bookingId);
  const { data: eventRes } = useGetEvent(eventId);

  const booking = bookingRes?.data;
  const event = eventRes?.data;
  const ticketMapUrl = event?.ticketMapUrl || (event as any)?.TicketMapUrl || "";

  if (!bookingId)
    return <ErrorBox message="Thiếu mã booking trong đường dẫn." eventId={eventId} />;

  if (isLoading) return <Loading />;

  if (isError || !booking)
    return <ErrorBox message="Không tìm thấy thông tin đặt vé." eventId={eventId} />;

  const infoSection = (
    <>
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        <Info label="Mã đặt vé" value={booking.id?.slice(0, 12)} />
        <Info label="Họ tên" value={booking.fullname} />
        <Info
          label="Ngày đặt"
          value={
            booking.createdAt
              ? new Date(booking.createdAt).toLocaleString("vi-VN")
              : "--"
          }
        />
        <div className="col-span-2">
          <Info label="Email" value={booking.email} />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border-2 border-primary/30 bg-primary/5 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Tổng thanh toán</p>
        <p className="mt-1 text-2xl font-black text-primary">{totalPrice(booking)}</p>
      </div>

      <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
          <CalendarDays size={16} />
          Lưu ý quan trọng
        </div>
        <p className="mt-2 text-sm text-zinc-600">
          Vui lòng đến trước 30 phút so với giờ mở cửa và chuẩn bị mã QR của bạn.
        </p>
      </div>
    </>
  );

  const actionsSection = (
    <div className="flex flex-col sm:flex-row gap-3 mt-8">
      <Button asChild className="flex-1 rounded-xl h-12">
        <Link href="/user/dashboard/tickets">Xem vé của tôi</Link>
      </Button>
      <Button asChild variant="outline" className="flex-1 rounded-xl h-12">
        <Link href={`/events/${eventId}`}>Quay lại sự kiện</Link>
      </Button>
    </div>
  );

  if (ticketMapUrl) {
    return (
      <main className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-5xl bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden flex flex-col lg:flex-row">
          {/* LEFT: Sơ đồ vé (TicketMapUrl) */}
          <div className="lg:w-1/2 min-h-[280px] lg:min-h-[480px] bg-zinc-100 relative">
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="relative w-full max-w-lg aspect-[4/3] rounded-xl overflow-hidden border border-zinc-200 bg-white shadow-inner">
                <Image
                  src={ticketMapUrl}
                  alt="Sơ đồ chỗ ngồi / Map vé"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
            <div className="absolute top-4 left-4 flex items-center gap-2 rounded-lg bg-white/95 backdrop-blur px-3 py-2 border border-zinc-200 shadow-sm">
              <Ticket className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-zinc-800">Sơ đồ vé</span>
            </div>
          </div>

          {/* RIGHT: Thông tin vé + tổng */}
          <div className="lg:w-1/2 p-6 sm:p-8 flex flex-col">
            <Link
              href={`/events/${eventId}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-900 mb-6 w-fit"
            >
              <ChevronLeft size={16} />
              Quay lại sự kiện
            </Link>

            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-900">Đặt vé thành công</h1>
                <p className="text-sm text-zinc-600 line-clamp-1">{event?.name || "Đơn đặt vé"}</p>
              </div>
            </div>

            {infoSection}
            {actionsSection}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <Link
            href={`/events/${eventId}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-900 mb-6 w-fit"
          >
            <ChevronLeft size={16} />
            Quay lại sự kiện
          </Link>

          <div className="flex flex-col items-center text-center mb-8">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900">Đặt vé thành công</h1>
            <p className="mt-2 text-zinc-600 line-clamp-2">{event?.name || "Đơn đặt vé của bạn"}</p>
          </div>

          {infoSection}
          {actionsSection}
        </div>
      </div>
    </main>
  );
}

function Info({
  label,
  value,
  highlight,
}: {
  label: string;
  value?: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-xs font-semibold uppercase text-zinc-400">
        {label}
      </span>
      <span
        className={`text-lg font-bold ${highlight ? "text-primary" : "text-zinc-900"
          }`}
      >
        {value || "--"}
      </span>
    </div>
  );
}

function ErrorBox({
  message,
  eventId,
}: {
  message: string;
  eventId: string;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
      <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-lg text-center">
        <p className="text-zinc-600">{message}</p>
        <Button asChild className="mt-4 rounded-xl">
          <Link href={`/events/${eventId}`}>Quay lại sự kiện</Link>
        </Button>
      </div>
    </main>
  );
}

export default function BookingConfirmPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <Suspense fallback={<Loading />}>
      <ConfirmContent eventId={id} />
    </Suspense>
  );
}