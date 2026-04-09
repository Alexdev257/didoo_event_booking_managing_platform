"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useGetMe } from "@/hooks/useAuth";
import { useGetEvents } from "@/hooks/useEvent";
import { useGetTicketListings, useGetTickets, useTicketListing } from "@/hooks/useTicket";
import { ticketListingCreateSchema } from "@/schemas/ticket";
import Loading from "@/components/loading";
import { handleErrorApi } from "@/lib/errors";
import { EventStatus, TicketListingStatus } from "@/utils/enum";
import { CreateResaleContent } from "./_components/CreateResaleContent";

const createListingFormSchema = ticketListingCreateSchema.pick({
  ticketIds: true,
  askingPrice: true,
  description: true,
});

type FormValues = z.input<typeof createListingFormSchema>;

function isReadyTicket(status: string | number | undefined) {
  const raw = String(status ?? "").toLowerCase();
  return raw === "1" || raw.includes("ready") || raw.includes("available");
}


export default function CreateResalePage() {
  const router = useRouter();
  const { data: meRes, isLoading: isMeLoading } = useGetMe();
  const user = meRes?.data;

  const [selectedEventId, setSelectedEventId] = useState<string>("");

  const { data: eventsRes, isLoading: isEventsLoading } = useGetEvents(
    {
      pageNumber: 1,
      pageSize: 100,
      hasLocations: true,
      isDescending: true,
      status: EventStatus.OPENED,
    },
    true
  );

  const { data: ticketsRes, isLoading: isTicketsLoading } = useGetTickets(
    {
      ownerId: user?.id,
      pageNumber: 1,
      pageSize: 300,
      isDescending: true,
      hasEvent: true,
      hasType: true,
    },
    { enabled: !!user?.id }
  );

  const { data: listingsRes, isLoading: isListingsLoading } = useGetTicketListings(
    { sellerUserId: user?.id, pageNumber: 1, pageSize: 300, isDescending: true },
    { enabled: !!user?.id }
  );

  const { create } = useTicketListing();

  const form = useForm<FormValues>({
    resolver: zodResolver(createListingFormSchema),
    defaultValues: {
      ticketIds: [],
      askingPrice: 0,
      description: "",
    },
  });

  const activeListingTicketIds = useMemo(() => {
    const listings = listingsRes?.data.items || [];
    const set = new Set<string>();
    for (const listing of listings) {
      const status = Number(listing.status ?? 0);
      const ticketIds = (listing.ticket || []).map((t) => t.id).filter(Boolean) as string[];
      if (status !== TicketListingStatus.PENDING && status !== TicketListingStatus.SOLD) {
        for (const ticketId of ticketIds) {
          set.add(ticketId);
        }
        if (ticketIds.length === 0 && listing.ticketId) {
          set.add(listing.ticketId);
        }
      }
    }
    return set;
  }, [listingsRes?.data.items]);

  /** Vé free và vé trả phí đều được phép resale */
  const candidateTickets = useMemo(() => {
    const tickets = ticketsRes?.data.items || [];
    return tickets.filter(
      (ticket) =>
        isReadyTicket(ticket.status) && !activeListingTicketIds.has(ticket.id)
    );
  }, [ticketsRes?.data.items, activeListingTicketIds]);

  const isFreeTicket = (price: number | undefined) => Number(price ?? 0) === 0;

  const ownedCountByEvent = useMemo(() => {
    const map = new Map<string, number>();
    for (const ticket of candidateTickets) {
      const eventId = ticket.event?.id;
      if (!eventId) continue;
      map.set(eventId, (map.get(eventId) || 0) + 1);
    }
    return map;
  }, [candidateTickets]);

  const currentEvents = useMemo(() => {
    const all = eventsRes?.data.items || [];
    return all.filter((e) => (ownedCountByEvent.get(e.id) || 0) > 0);
  }, [eventsRes?.data.items, ownedCountByEvent]);


  const selectedTicketIds = form.watch("ticketIds") || [];

  const ticketsOfSelectedEvent = useMemo(() => {
    if (!selectedEventId) return [];
    return candidateTickets.filter(
      (ticket) => (ticket.event?.id || "") === selectedEventId
    );
  }, [candidateTickets, selectedEventId]);

  /** Nhóm vé theo loại: free vs paid, mỗi nhóm theo ticketTypeId */
  const ticketsByTypeInEvent = useMemo(() => {
    const free: { ticketTypeId: string; name: string; tickets: typeof ticketsOfSelectedEvent }[] = [];
    const paid: { ticketTypeId: string; name: string; price: number; tickets: typeof ticketsOfSelectedEvent }[] = [];
    const seenFree = new Map<string, number>();
    const seenPaid = new Map<string, number>();

    for (const t of ticketsOfSelectedEvent) {
      const ttId = t.ticketType?.id ?? t.ticketTypeId ?? "";
      const name = t.ticketType?.name ?? "N/A";
      const price = Number(t.ticketType?.price ?? 0);

      if (isFreeTicket(price)) {
        const idx = seenFree.get(ttId) ?? free.length;
        if (idx === free.length) {
          free.push({ ticketTypeId: ttId, name, tickets: [] });
          seenFree.set(ttId, idx);
        }
        free[idx].tickets.push(t);
      } else {
        const idx = seenPaid.get(ttId) ?? paid.length;
        if (idx === paid.length) {
          paid.push({ ticketTypeId: ttId, name, price, tickets: [] });
          seenPaid.set(ttId, idx);
        }
        paid[idx].tickets.push(t);
      }
    }
    return { free, paid };
  }, [ticketsOfSelectedEvent]);

  const hasOwnedTicketsForSelectedEvent = ticketsOfSelectedEvent.length > 0;

  /** Vé đã chọn có cùng loại không? Và là free hay paid? (Chỉ được chọn 1 loại vé) */
  const selectedTicketsMeta = useMemo(() => {
    if (selectedTicketIds.length === 0) return { sameType: true, isFree: false, ticketTypeName: "" };
    const selected = ticketsOfSelectedEvent.filter((t) => selectedTicketIds.includes(t.id));
    if (selected.length === 0) return { sameType: true, isFree: false, ticketTypeName: "" };
    const firstTypeId = selected[0].ticketType?.id ?? selected[0].ticketTypeId ?? "";
    const allSame = selected.every(
      (t) => (t.ticketType?.id ?? t.ticketTypeId ?? "") === firstTypeId
    );
    const isFree = isFreeTicket(selected[0].ticketType?.price);
    return {
      sameType: allSame,
      isFree,
      ticketTypeName: selected[0].ticketType?.name ?? "N/A",
    };
  }, [selectedTicketIds, ticketsOfSelectedEvent]);

  const toggleTicket = (ticketId: string) => {
    const current = form.getValues("ticketIds") || [];
    const exists = current.includes(ticketId);
    if (exists) {
      form.setValue(
        "ticketIds",
        current.filter((id) => id !== ticketId),
        { shouldDirty: true, shouldValidate: true }
      );
      return;
    }
    const ticket = ticketsOfSelectedEvent.find((t) => t.id === ticketId);
    if (!ticket) return;
    const ticketTypeId = ticket.ticketType?.id ?? ticket.ticketTypeId ?? "";
    const existing = ticketsOfSelectedEvent.filter((t) => current.includes(t.id));
    const existingTypeId = existing[0]?.ticketType?.id ?? existing[0]?.ticketTypeId ?? "";
    if (existing.length > 0 && existingTypeId !== ticketTypeId) {
      toast.error("Chỉ được chọn vé cùng loại. Vui lòng bỏ chọn vé trước rồi chọn lại.");
      return;
    }
    form.setValue("ticketIds", [...current, ticketId], {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const chooseMany = (ticketTypeId: string) => {
    if (!selectedEventId) {
      toast.error("Vui lòng chọn sự kiện trước.");
      return;
    }
    const group = ticketsByTypeInEvent.free.find((g) => g.ticketTypeId === ticketTypeId)
      ?? ticketsByTypeInEvent.paid.find((g) => g.ticketTypeId === ticketTypeId);
    if (!group) return;
    const ids = "tickets" in group ? group.tickets.map((t) => t.id) : [];
    form.setValue("ticketIds", ids, { shouldDirty: true, shouldValidate: true });
  };

  const clearAll = () => {
    form.setValue("ticketIds", [], { shouldDirty: true, shouldValidate: true });
  };

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    form.setValue("ticketIds", [], { shouldDirty: true, shouldValidate: true });
  };

  const handleFormChange = (field: "askingPrice" | "description", value: number | string) => {
    form.setValue(field, value as never, { shouldDirty: true, shouldValidate: true });
  };

  const onSubmit = async (values: FormValues) => {
    if (!user?.id) return;
    if (!selectedEventId) {
      toast.error("Vui lòng chọn sự kiện.");
      return;
    }
    if (!hasOwnedTicketsForSelectedEvent) {
      toast.error("Bạn chưa có vé phù hợp của sự kiện này để đăng bán.");
      return;
    }
    try {
      const selectedTickets = ticketsOfSelectedEvent.filter((ticket) =>
        values.ticketIds.includes(ticket.id)
      );
      if (selectedTickets.length === 0) {
        form.setError("ticketIds", { message: "Vui lòng chọn ít nhất một vé." });
        return;
      }
      const firstTypeId = selectedTickets[0].ticketType?.id ?? selectedTickets[0].ticketTypeId ?? "";
      const allSameType = selectedTickets.every(
        (t) => (t.ticketType?.id ?? t.ticketTypeId ?? "") === firstTypeId
      );
      if (!allSameType) {
        form.setError("ticketIds", { message: "Vé phải cùng loại mới được đăng bán." });
        return;
      }
      const isFree = isFreeTicket(selectedTickets[0].ticketType?.price);

      const payload = ticketListingCreateSchema.parse({
        ticketIds: values.ticketIds,
        sellerUserId: user.id,
        askingPrice: isFree ? 0 : Number(values.askingPrice ?? 0),
        description: values.description?.trim() || undefined,
      });

      await create.mutateAsync(payload);
      toast.success("Đăng vé bán lại thành công.");
      router.push("/user/dashboard/resales");
    } catch (error) {
      handleErrorApi({ error, setError: form.setError });
    }
  };

  if (isMeLoading || isEventsLoading || isTicketsLoading || isListingsLoading) return <Loading />;

  return (
    <CreateResaleContent
      currentEvents={currentEvents}
      ownedCountByEvent={ownedCountByEvent}
      selectedEventId={selectedEventId}
      ticketsByTypeInEvent={ticketsByTypeInEvent}
      selectedTicketIds={selectedTicketIds}
      selectedTicketsMeta={selectedTicketsMeta}
      formValues={{
        askingPrice: form.watch("askingPrice") ?? 0,
        description: form.watch("description") || "",
      }}
      formErrors={form.formState.errors}
      hasOwnedTicketsForSelectedEvent={hasOwnedTicketsForSelectedEvent}
      isPending={create.isPending}
      onSelectEvent={handleSelectEvent}
      onToggleTicket={toggleTicket}
      onChooseMany={chooseMany}
      onClearAll={clearAll}
      onFormChange={handleFormChange}
      onSubmit={form.handleSubmit(onSubmit)}
    />
  );
}
