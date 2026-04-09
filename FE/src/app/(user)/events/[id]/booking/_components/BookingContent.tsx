"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ChevronLeft, HelpCircle, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Event } from "@/types/event";
import { TicketType } from "@/types/ticket";

export type BookingDraftItem = {
  ticketTypeId: string;
  quantity: number;
};

interface BookingContentProps {
  eventId: string;
  event: Event;
  ticketTypes: TicketType[];
  selected: BookingDraftItem | null;
  totalPrice: number;
  realtimeAvailability: Record<string, number>;
  maxPerUser: (tt: TicketType) => number | null;
  maxAllowed: (tt: TicketType) => number;
  ownedCountByTicketType: Map<string, number>;
  onQuantityChange: (tt: TicketType, delta: number) => void;
  onGoToConfirm: () => void;
}

export function BookingContent({
  eventId,
  event,
  ticketTypes,
  selected,
  totalPrice,
  realtimeAvailability,
  maxPerUser,
  maxAllowed,
  ownedCountByTicketType,
  onQuantityChange,
  onGoToConfirm,
}: BookingContentProps) {
  const TicketCard = ({
    tt,
    soldOut,
    isSelected,
    limit,
    ownedCount,
  }: {
    tt: TicketType;
    soldOut: boolean;
    isSelected: boolean;
    limit: number;
    ownedCount: number;
  }) => {
    const lastClickRef = useRef(0);

    const handleQuantityClick = (delta: number) => {
      const now = Date.now();
      if (now - lastClickRef.current < 300) return;
      lastClickRef.current = now;
      onQuantityChange(tt, delta);
    };
    const total = tt.totalQuantity ?? 0;
    const avail = realtimeAvailability[tt.id] ?? Math.max(0, Number(tt.availableQuantity ?? 0));
    const sold = total - avail;
    const cap = maxPerUser(tt);
    const limitReached = cap != null && ownedCount >= cap;

    return (
      <div
        className={`rounded-xl border p-4 transition ${
          soldOut
            ? "border-zinc-200 bg-zinc-50 opacity-60"
            : isSelected
              ? "border-primary bg-primary/5"
              : "border-zinc-200 bg-white hover:border-zinc-300"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-zinc-900">{tt.name}</h3>
            {tt.description && (
              <p className="mt-1 text-sm text-zinc-500">{tt.description}</p>
            )}
            <p className="mt-2 text-lg font-bold text-zinc-900">
              {Number(tt.price ?? 0) === 0
                ? "Miễn phí"
                : `${Number(tt.price).toLocaleString("vi-VN")}đ`}
            </p>
            {!soldOut && (
              <span className="text-xs font-medium text-zinc-600">
                {sold}/{total} đã bán
                {cap != null && ` · Tối đa ${cap} vé/người`}
              </span>
            )}
            {cap != null && ownedCount > 0 && (
              <p className="mt-1 text-xs font-medium text-primary">
                Bạn đã mua: {ownedCount}/{cap} vé
                {limitReached && (
                  <span className="ml-1 text-amber-600">· Đã đủ số lượng</span>
                )}
              </p>
            )}
            {soldOut && (
              <span className="mt-2 inline-block text-xs font-medium text-rose-600">
                Hết vé
              </span>
            )}
          </div>
          {!soldOut && (
            <span className="text-xs font-medium text-zinc-600">
              Còn {avail} vé
            </span>
          )}
        </div>
        {!soldOut && (
          <div className="mt-6 flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleQuantityClick(-1)}
              disabled={!isSelected || (selected?.quantity ?? 0) <= 0}
              className="flex h-9 w-9 min-h-[36px] min-w-[36px] items-center justify-center rounded-full border border-zinc-200 text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-50"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-[2rem] text-center font-semibold text-zinc-900">
              {isSelected ? selected?.quantity ?? 0 : 0}
            </span>
            <button
              type="button"
              onClick={() => handleQuantityClick(1)}
              disabled={(isSelected && (selected?.quantity ?? 0) >= limit) || limitReached}
              className="flex h-9 w-9 min-h-[36px] min-w-[36px] items-center justify-center rounded-full border border-zinc-200 text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
            </button>
            {!isSelected && !limitReached && (
              <span className="ml-2 text-xs text-zinc-500">
                Chỉ được chọn 1 loại vé
              </span>
            )}
            {limitReached && (
              <span className="ml-2 text-xs font-medium text-amber-600">
                Đã đủ số lượng vé
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  const SidebarContent = () => (
    <>
      <h2 className="text-lg font-bold text-zinc-900">Chọn vé</h2>
      <p className="mt-1 text-xs text-zinc-500">Chỉ được chọn 1 loại vé trong 1 đơn</p>

      <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
        {selected ? (
          <div>
            <p className="font-semibold text-zinc-900">
              {ticketTypes.find((t) => t.id === selected.ticketTypeId)?.name}
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              {selected.quantity} x{" "}
              {Number(
                ticketTypes.find((t) => t.id === selected.ticketTypeId)?.price ?? 0
              ) === 0
                ? "Miễn phí"
                : `${Number(
                    ticketTypes.find((t) => t.id === selected.ticketTypeId)?.price
                  ).toLocaleString("vi-VN")}đ`}
            </p>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">Chưa chọn vé</p>
        )}
      </div>

      <div className="mt-6 border-t border-zinc-200 pt-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-zinc-900">Tổng</span>
          <span className="text-xl font-bold text-zinc-900">
            {totalPrice.toLocaleString("vi-VN")}đ
          </span>
        </div>
      </div>

      <Button
        type="button"
        onClick={onGoToConfirm}
        disabled={!selected || selected.quantity <= 0}
        className="mt-6 h-14 w-full rounded-xl text-base font-semibold shadow-lg shadow-primary/20"
      >
        Mua vé ngay
        <ArrowUpRight className="ml-2 h-5 w-5" />
      </Button>

      <p className="mt-4 text-center text-xs text-zinc-500">
        Bằng việc mua vé, bạn đồng ý với Điều khoản sử dụng của chúng tôi.
      </p>

      <div className="mt-6 flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <HelpCircle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-900">Cần hỗ trợ?</p>
          <p className="text-xs text-zinc-600">Liên hệ bộ phận chăm sóc khách hàng</p>
        </div>
      </div>
    </>
  );

  const hasMap = !!(event.ticketMapUrl || (event as any).TicketMapUrl);

  const TicketList = () => (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm h-fit">
      <h2 className="text-xl font-bold text-zinc-900">Loại vé</h2>
      <div className="mt-4 space-y-4">
        {ticketTypes.map((tt) => {
          const avail = realtimeAvailability[tt.id] ?? Math.max(0, Number(tt.availableQuantity ?? 0));
          const soldOut = avail <= 0;
          const isSelected = selected?.ticketTypeId === tt.id;
          const limit = maxAllowed(tt);
          const ownedCount = ownedCountByTicketType.get(tt.id) ?? 0;
          return (
            <TicketCard
              key={tt.id}
              tt={tt}
              soldOut={soldOut}
              isSelected={isSelected}
              limit={limit}
              ownedCount={ownedCount}
            />
          );
        })}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-zinc-50 px-4 pb-16 pt-28">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/events/${eventId}`}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Quay lại sự kiện
        </Link>

        <div className="grid gap-6 lg:grid-cols-12">
          {hasMap ? (
            <>
              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-zinc-900 mb-4">Sơ đồ ghế</h2>
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50">
                    <Image
                      src={event.ticketMapUrl || (event as any).TicketMapUrl || ""}
                      alt="Sơ đồ ghế"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-6">
                <TicketList />
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <SidebarContent />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="lg:col-span-7">
                <TicketList />
              </div>

              <div className="lg:col-span-5">
                <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <SidebarContent />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
