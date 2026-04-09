"use client";

import { Suspense, use } from "react";
import { useSearchParams } from "next/navigation";
import Loading from "@/components/loading";
import { TradeBookingCallbackResult } from "./_components/TradeBookingCallbackResult";
import { TradeBookingConfirmForm } from "./_components/TradeBookingConfirmForm";

function ConfirmPageContent({
  params,
}: {
  params: Promise<{ id: string; listingId: string }>;
}) {
  const { id, listingId } = use(params);
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") || "";

  if (bookingId) {
    return (
      <TradeBookingCallbackResult
        eventId={id}
        listingId={listingId}
        bookingId={bookingId}
      />
    );
  }
  return <TradeBookingConfirmForm eventId={id} listingId={listingId} />;
}

export default function TradeBookingConfirmPage({
  params,
}: {
  params: Promise<{ id: string; listingId: string }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <ConfirmPageContent params={params} />
    </Suspense>
  );
}
