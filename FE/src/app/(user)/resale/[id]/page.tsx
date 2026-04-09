"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { useGetMe } from "@/hooks/useAuth";
import { useGetEvent } from "@/hooks/useEvent";
import { useGetTicketListings, useGetTicketTypes } from "@/hooks/useTicket";
import { useOwnedTicketsCountByTicketType } from "@/hooks/useOwnedTicketsByEvent";
import { TicketListingStatus } from "@/utils/enum";
import { ResaleEventListingsContent } from "./_components/ResaleEventListingsContent";

export default function ResaleEventListingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const listingQuery = useMemo(
    () => ({
      eventId: id,
      pageNumber: 1,
      pageSize: 500,
      status: TicketListingStatus.ACTIVE,
      isDeleted: false,
      isDescending: true,
    }),
    [id]
  );

  const { data: userRes } = useGetMe();
  const { data: eventRes, isLoading: isEventLoading } = useGetEvent(id);
  const { data: listingsRes, isLoading: isListingsLoading } = useGetTicketListings(
    listingQuery,
    { enabled: !!id }
  );
  const { data: ticketTypesRes } = useGetTicketTypes(
    { eventId: id, pageNumber: 1, pageSize: 100 },
    { enabled: !!id }
  );
  const ownedCountByTicketType = useOwnedTicketsCountByTicketType(id, userRes?.data?.id, {
    enabled: !!id && !!userRes?.data?.id,
  });

  const event = eventRes?.data;
  const listings = listingsRes?.data?.items ?? [];
  const ticketTypes = ticketTypesRes?.data?.items ?? [];

  if (isEventLoading || isListingsLoading) return <Loading />;

  if (!event) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-muted-foreground">Không tìm thấy sự kiện.</p>
          <Button asChild className="mt-4 rounded-xl">
            <Link href="/resale">Quay lại vé bán lại</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <ResaleEventListingsContent
      eventId={id}
      event={event}
      listings={listings}
      ticketTypes={ticketTypes}
      ownedCountByTicketType={ownedCountByTicketType}
    />
  );
}
