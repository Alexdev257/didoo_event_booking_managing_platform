"use client";

import { use } from "react";
import { TradeBookingSuccessContent } from "./_components/TradeBookingSuccessContent";

export default function TradeBookingSuccessPage({
  params,
}: {
  params: Promise<{ id: string; listingId: string }>;
}) {
  const { id } = use(params);

  return <TradeBookingSuccessContent eventId={id} />;
}
