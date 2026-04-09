"use client";

import { use } from "react";
import Loading from "@/components/loading";
import { useGetMe } from "@/hooks/useAuth";
import { useSessionStore } from "@/stores/sesionStore";
import { useGetEvent } from "@/hooks/useEvent";
import { useGetTicketListing, useGetTicketTypes, useValidateTicketListing } from "@/hooks/useTicket";
import { useOwnedTicketsCountByTicketType } from "@/hooks/useOwnedTicketsByEvent";
import { TradeBookingDetailContent } from "./_components/TradeBookingDetailContent";
import { TradeBookingNotFound } from "./_components/TradeBookingNotFound";
import { getTicketTypeGroups, wouldExceedMaxTicketsPerUser } from "./_components/utils";

export default function TradeBookingListingDetailPage({
  params,
}: {
  params: Promise<{ id: string; listingId: string }>;
}) {
  const { id, listingId } = use(params);
  const { user } = useSessionStore();

  const { data: userRes } = useGetMe();
  const { data: eventRes, isLoading: isEventLoading } = useGetEvent(id);
  const { data: listingRes, isLoading: isListingLoading } = useGetTicketListing(listingId, {
    enabled: !!listingId,
  });
  const { data: validateRes, isLoading: isValidateLoading } = useValidateTicketListing(listingId, {
    enabled: !!listingId,
  });
  const { data: ticketTypesRes } = useGetTicketTypes(
    { eventId: id, pageNumber: 1, pageSize: 100 },
    { enabled: !!id }
  );
  const ownedCountByTicketType = useOwnedTicketsCountByTicketType(id, userRes?.data?.id, {
    enabled: !!id && !!userRes?.data?.id,
  });

  const event = eventRes?.data;
  const listing = listingRes?.data;
  const validateData = validateRes?.data;
  const ticketTypes = ticketTypesRes?.data?.items ?? [];
  const isAvailableFromApi = validateData?.isAvailable ?? false;
  const exceedsMax =
    listing && ticketTypes.length > 0
      ? wouldExceedMaxTicketsPerUser(listing, ticketTypes, ownedCountByTicketType)
      : false;
  const isAvailable = isAvailableFromApi && !exceedsMax;
  const ticketTypeGroups = listing ? getTicketTypeGroups(listing, ticketTypes) : [];

  if (isEventLoading || isListingLoading || isValidateLoading) return <Loading />;

  if (!event || !listing) {
    return <TradeBookingNotFound eventId={id} />;
  }

  return (
    <TradeBookingDetailContent
      eventId={id}
      listingId={listingId}
      event={event}
      listing={listing}
      ticketTypeGroups={ticketTypeGroups}
      isAvailable={isAvailable}
      exceedsMax={exceedsMax}
      isLoggedIn={!!user}
    />
  );
}
