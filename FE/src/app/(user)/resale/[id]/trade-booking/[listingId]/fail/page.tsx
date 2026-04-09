"use client";

import { Suspense, use } from "react";
import { useSearchParams } from "next/navigation";
import Loading from "@/components/loading";
import { TradeBookingFailContent } from "./_components/TradeBookingFailContent";

function FailPageContent({
  params,
}: {
  params: Promise<{ id: string; listingId: string }>;
}) {
  const { id, listingId } = use(params);
  const searchParams = useSearchParams();
  const reasonKey = searchParams.get("reason") || "";

  return (
    <TradeBookingFailContent
      eventId={id}
      listingId={listingId}
      reasonKey={reasonKey}
    />
  );
}

export default function TradeBookingFailPage({
  params,
}: {
  params: Promise<{ id: string; listingId: string }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <FailPageContent params={params} />
    </Suspense>
  );
}
