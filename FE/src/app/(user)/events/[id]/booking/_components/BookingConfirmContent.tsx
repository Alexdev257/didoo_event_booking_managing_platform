"use client";

import { ChevronLeft, ShieldCheck } from "lucide-react";
import { UseFormRegister, FieldErrors, UseFormHandleSubmit } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { bookingCreateSchema } from "@/schemas/booking";
import { Event } from "@/types/event";
import { TicketType } from "@/types/ticket";

const bookingContactSchema = bookingCreateSchema.pick({
  fullname: true,
  email: true,
  phone: true,
});

export type SelectedItemWithTicketType = {
  ticketTypeId: string;
  quantity: number;
  ticketType?: TicketType;
};

export type BookingContactFormValues = z.infer<typeof bookingContactSchema>;

interface BookingConfirmContentProps {
  event: Event;
  selectedItems: SelectedItemWithTicketType[];
  selectedQuantity: number;
  totalPrice: number;
  register: UseFormRegister<BookingContactFormValues>;
  errors: FieldErrors<BookingContactFormValues>;
  handleSubmit: UseFormHandleSubmit<BookingContactFormValues>;
  onSubmit: (values: BookingContactFormValues) => void;
  onBack: () => void;
  isPending: boolean;
}

export function BookingConfirmContent({
  event,
  selectedItems,
  selectedQuantity,
  totalPrice,
  register,
  errors,
  handleSubmit,
  onSubmit,
  onBack,
  isPending,
}: BookingConfirmContentProps) {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 pb-16 pt-28">
      <form className="mx-auto max-w-5xl" onSubmit={handleSubmit(onSubmit)}>
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Quay lại chọn vé
        </button>

        <div className="grid gap-6 lg:grid-cols-12">
          <section className="space-y-5 lg:col-span-7">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h1 className="text-2xl font-bold text-zinc-900">Xác nhận thông tin </h1>
              <p className="mt-1 text-sm text-zinc-600">{event.name}</p>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-sm font-medium text-zinc-700">Họ tên</label>
                  <input
                    {...register("fullname")}
                    className="mt-1 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-primary"
                    placeholder="Nhập họ tên"
                  />
                  {errors.fullname?.message && (
                    <p className="mt-1 text-xs text-rose-600">{String(errors.fullname.message)}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-700">Email</label>
                  <input
                    {...register("email")}
                    className="mt-1 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-primary"
                    placeholder="Nhập email"
                  />
                  {errors.email?.message && (
                    <p className="mt-1 text-xs text-rose-600">{String(errors.email.message)}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-700">Số điện thoại (Không bắt buộc)</label>
                  <input
                    {...register("phone")}
                    className="mt-1 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-primary"
                    placeholder="Nhập số điện thoại"
                  />
                  {errors.phone?.message && (
                    <p className="mt-1 text-xs text-rose-600">{String(errors.phone.message)}</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <aside className="lg:col-span-5">
            <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-zinc-900">Đơn hàng của bạn</h2>
              <div className="mt-5 space-y-4">
                {selectedItems.map((item) => (
                  <div key={item.ticketTypeId} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="font-semibold text-zinc-900">{item.ticketType?.name}</p>
                    <p className="mt-1 text-sm text-zinc-600">
                      {item.quantity} x{" "}
                      {Number(item.ticketType?.price ?? 0) === 0
                        ? "Miễn phí"
                        : `${Number(item.ticketType?.price).toLocaleString("vi-VN")}đ`}
                    </p>
                  </div>
                ))}

                <div className="space-y-2 border-t border-zinc-200 pt-4">
                  <div className="flex items-center justify-between text-sm text-zinc-600">
                    <span>Tổng số vé</span>
                    <span className="font-semibold text-zinc-900">{selectedQuantity}</span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-bold text-zinc-900">
                    <span>Tổng thanh toán</span>
                    <span>{totalPrice.toLocaleString("vi-VN")}đ</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
                  <p className="flex items-center gap-2 font-semibold">
                    <ShieldCheck className="h-4 w-4" />
                    Xác nhận và thanh toán
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="h-12 w-full rounded-xl text-base font-semibold"
                >
                  {isPending ? "Đang xử lý..." : "Xác nhận đặt vé"}
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </form>
    </main>
  );
}
