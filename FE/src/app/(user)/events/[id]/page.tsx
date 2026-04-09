"use client";

import { use } from "react";
import Loading from "@/components/loading";

import { useGetTicketTypes } from "@/hooks/useTicket";
import HeroSection from "./_components/HeroSection";
import EventDetailContent from "./_components/EventDetailContent";
import { EventStatus } from "@/utils/enum";
import { useGetEvent, useGetEvents } from "@/hooks/useEvent";

export default function DetailEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: detailEventResponse, isLoading: isLoadingDetail } = useGetEvent(id);
  const detailEvent = detailEventResponse?.data;

  const { data: relatedEventsResponse } = useGetEvents({
    categoryId: detailEvent?.category?.id,
    pageSize: 6,
    hasCategory: true,
  });

  const eventRelated = (relatedEventsResponse?.data.items || []).filter(
    (event) => event.id !== id
  );

  const { data: ticketTypesResponse } = useGetTicketTypes({ eventId: id });
  const ticketTypes = ticketTypesResponse?.data.items || [];

  if (isLoadingDetail) return <Loading />;

  if (!detailEvent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="font-medium text-muted-foreground">Không tìm thấy sự kiện</p>
          <a
            href="/events"
            className="mt-4 inline-block font-semibold text-primary hover:underline"
          >
            Quay lại danh sách
          </a>
        </div>
      </div>
    );
  }

  if ((detailEvent.status as number) === EventStatus.DRAFT) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="font-medium text-muted-foreground">Sự kiện chưa được công bố.</p>
          <a
            href="/events"
            className="mt-4 inline-block font-semibold text-primary hover:underline"
          >
            Quay lại danh sách
          </a>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 left-0 h-96 w-96 rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute top-1/3 right-0 h-80 w-80 rounded-full bg-primary/5 blur-[80px]" />
      </div>

      <div className="relative z-10">
        <HeroSection event={detailEvent} />

        <EventDetailContent
          event={detailEvent}
          ticketTypes={ticketTypes}
          eventRelated={eventRelated}
        />
      </div>
    </main>
  );
}
