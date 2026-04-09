"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { useGetMe } from "@/hooks/useAuth";
import { useBooking } from "@/hooks/useBooking";
import { useGetEvent } from "@/hooks/useEvent";
import { useGetTicketTypes } from "@/hooks/useTicket";
import { useOwnedTicketsCountByTicketType } from "@/hooks/useOwnedTicketsByEvent";
import { bookingCreateSchema } from "@/schemas/booking";
import { EventStatus } from "@/utils/enum";
import { handleErrorApi } from "@/lib/errors";
import { TicketType } from "@/types/ticket";
import { useTicketHub } from "@/hooks/useTicketHub";
import { ticketStore$ } from "@/stores/ticketStore";
import { observer } from "@legendapp/state/react";
import { BookingContent } from "./_components/BookingContent";
import { BookingConfirmContent } from "./_components/BookingConfirmContent";

export type BookingDraftItem = {
  ticketTypeId: string;
  quantity: number;
};

const getDraftKey = (eventId: string) => `booking-draft:${eventId}`;

function saveDraft(eventId: string, items: BookingDraftItem[]) {
  const valid = items.filter((i) => i.quantity > 0);
  sessionStorage.setItem(getDraftKey(eventId), JSON.stringify(valid));
}

const bookingContactSchema = bookingCreateSchema.pick({
  fullname: true,
  email: true,
  phone: true,
});

type BookingContactFormValues = z.infer<typeof bookingContactSchema>;

function EventBookingPageInner({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: userRes, isLoading: isUserLoading } = useGetMe();
  const { data: eventRes, isLoading: isEventLoading } = useGetEvent(id);
  const { data: ticketTypesRes, isLoading: isTicketTypesLoading } = useGetTicketTypes(
    { eventId: id, pageNumber: 1, pageSize: 100 },
    { enabled: !!id }
  );
  const { create } = useBooking();
  const { selectTicket } = useTicketHub(id);
  const user = userRes?.data;
  const event = eventRes?.data;
  const ticketTypes = ticketTypesRes?.data?.items || [];

  const [step, setStep] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<BookingDraftItem | null>(null);
  const [loaded, setLoaded] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    getValues,
    formState: { errors },
  } = useForm<BookingContactFormValues>({
    resolver: zodResolver(bookingContactSchema),
    defaultValues: { fullname: "", email: "", phone: "" },
  });

  useEffect(() => {
    const raw = sessionStorage.getItem(getDraftKey(id));
    if (!raw) {
      setSelected(null);
      setLoaded(true);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as BookingDraftItem[];
      const valid = Array.isArray(parsed)
        ? parsed.find((i) => i?.ticketTypeId && Number(i?.quantity) > 0)
        : null;
      setSelected(valid || null);
    } catch {
      setSelected(null);
    } finally {
      setLoaded(true);
    }
  }, [id]);

  useEffect(() => {
    if (!user) return;
    if (!getValues("fullname")) setValue("fullname", user.fullName || "");
    if (!getValues("email")) setValue("email", user.email || "");
    if (!getValues("phone")) setValue("phone", user.phone || "");
  }, [user, getValues, setValue]);

  const selectedItems = useMemo(() => {
    if (!selected) return [];
    const tt = ticketTypes.find((t) => t.id === selected.ticketTypeId);
    return tt ? [{ ...selected, ticketType: tt }] : [];
  }, [selected, ticketTypes]);

  const totalPrice = selected
    ? (() => {
      const tt = ticketTypes.find((t) => t.id === selected.ticketTypeId);
      return (tt?.price ?? 0) * selected.quantity;
    })()
    : 0;

  const ownedCountByTicketType = useOwnedTicketsCountByTicketType(id, user?.id, {
    enabled: !!user?.id && !!id,
  });

  const maxPerUser = (tt: TicketType) => {
    const v = tt.maxTicketsPerUser;
    return v != null && Number(v) > 0 ? Number(v) : null;
  };

  const realtimeAvailability: Record<string, number> = (() => {
    const all = ticketStore$.availability.get() ?? {};
    const ev = all[id] ?? {};
    return typeof ev === "object" ? ev : {};
  })();

  const maxAllowed = (tt: TicketType) => {
    const avail = realtimeAvailability[tt.id] ?? Math.max(0, Number(tt.availableQuantity ?? 0));
    const cap = maxPerUser(tt);
    const owned = ownedCountByTicketType.get(tt.id) ?? 0;
    if (cap != null) {
      const remainingByCap = Math.max(0, cap - owned);
      return Math.min(remainingByCap, avail);
    }
    return avail;
  };

  const prevSelectedRef = useRef<BookingDraftItem | null>(null);

  useEffect(() => {
    const prev = prevSelectedRef.current;
    const next = selected;

    if (prev?.ticketTypeId === next?.ticketTypeId) {
      const delta = (next?.quantity ?? 0) - (prev?.quantity ?? 0);
      if (delta !== 0 && next) {
        selectTicket(next.ticketTypeId, delta);
      } else if (!next && prev) {
        selectTicket(prev.ticketTypeId, -(prev.quantity ?? 0));
      }
    } else {
      if (prev) selectTicket(prev.ticketTypeId, -(prev.quantity ?? 0));
      if (next) selectTicket(next.ticketTypeId, next.quantity);
    }
    prevSelectedRef.current = next;
  }, [selected, selectTicket]);

  const handleQuantity = (tt: TicketType, delta: number) => {
    const avail = realtimeAvailability[tt.id] ?? Math.max(0, Number(tt.availableQuantity ?? 0));
    if (avail <= 0 && delta > 0) return;

    const limit = maxAllowed(tt);

    setSelected((prev) => {
      const isSame = prev?.ticketTypeId === tt.id;
      const nextQty = isSame
        ? Math.max(0, Math.min(limit, (prev?.quantity ?? 0) + delta))
        : delta > 0
          ? Math.min(limit, 1)
          : 0;

      if (nextQty <= 0) {
        saveDraft(id, []);
        return null;
      }

      saveDraft(id, [{ ticketTypeId: tt.id, quantity: nextQty }]);
      return { ticketTypeId: tt.id, quantity: nextQty };
    });
  };

  const handleGoToConfirm = () => {
    if (!selected || selected.quantity <= 0) {
      toast.error("Vui lòng chọn ít nhất 1 vé (chỉ được chọn 1 loại vé trong 1 đơn)");
      return;
    }
    setStep(2);
  };

  const handleConfirm = async (formValues: BookingContactFormValues) => {
    if (!user?.id || !event?.id) {
      toast.error("Thiếu thông tin người dùng hoặc sự kiện");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Không có vé để xác nhận");
      return;
    }

    const payload = {
      ticketTypeId: selectedItems[0].ticketTypeId,
      quantity: selectedItems[0].quantity,
      userId: user.id,
      eventId: event.id,
      fullname: formValues.fullname.trim(),
      email: formValues.email.trim(),
      phone: (formValues.phone || "").trim(),
    };

    const parsed = bookingCreateSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Thông tin xác nhận không hợp lệ");
      return;
    }

    try {
      const result = await create.mutateAsync(parsed.data);
      sessionStorage.removeItem(getDraftKey(id));
      if (result?.paymentUrl) {
        window.location.href = result.paymentUrl;
        return;
      }
      window.location.href = "/user/dashboard/tickets";
    } catch (error) {
      handleErrorApi({ error, setError });
    }
  };

  if (isEventLoading || isTicketTypesLoading || isUserLoading || !loaded) return <Loading />;

  if (!event) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-muted-foreground">Không tìm thấy sự kiện.</p>
          <Button asChild className="mt-4 rounded-xl">
            <Link href="/events">Quay lại danh sách sự kiện</Link>
          </Button>
        </div>
      </main>
    );
  }



  if ((event.status as number) !== EventStatus.OPENED) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-muted-foreground">
            {(event.status as number) === EventStatus.PUBLISHED
              ? "Sự kiện chưa mở bán vé."
              : (event.status as number) === EventStatus.CLOSED
                ? "Sự kiện đã đóng đăng ký."
                : "Hiện không thể mua vé sự kiện này."}
          </p>
          <Button asChild className="mt-5 rounded-xl">
            <Link href={`/events/${id}`}>Quay lại sự kiện</Link>
          </Button>
        </div>
      </main>
    );
  }

  if (ticketTypes.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-muted-foreground">Sự kiện chưa mở bán vé.</p>
          <Button asChild className="mt-4 rounded-xl">
            <Link href={`/events/${id}`}>Quay lại sự kiện</Link>
          </Button>
        </div>
      </main>
    );
  }

  if (step === 2) {
    if (selectedItems.length === 0) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
          <div className="max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
            <p className="text-zinc-600">Bạn chưa chọn vé. Vui lòng quay lại chọn vé.</p>
            <Button className="mt-5 rounded-xl" onClick={() => setStep(1)}>
              Chọn vé
            </Button>
          </div>
        </main>
      );
    }

    return (
      <BookingConfirmContent
        event={event}
        selectedItems={selectedItems}
        selectedQuantity={selected?.quantity ?? 0}
        totalPrice={totalPrice}
        register={register}
        errors={errors}
        handleSubmit={handleSubmit}
        onSubmit={handleConfirm}
        onBack={() => setStep(1)}
        isPending={create.isPending}
      />
    );
  }

  return (
    <BookingContent
      eventId={id}
      event={event}
      ticketTypes={ticketTypes}
      selected={selected}
      totalPrice={totalPrice}
      realtimeAvailability={realtimeAvailability}
      maxPerUser={maxPerUser}
      maxAllowed={maxAllowed}
      ownedCountByTicketType={ownedCountByTicketType}
      onQuantityChange={handleQuantity}
      onGoToConfirm={handleGoToConfirm}
    />
  );
}

export default observer(EventBookingPageInner);
