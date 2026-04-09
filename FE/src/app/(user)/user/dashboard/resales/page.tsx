"use client";

import { Suspense } from "react";
import { SectionFallback } from "@/components/base/SectionFallback";
import DashboardResalesContent from "./_components/DashboardResalesContent";

export default function SellerResalesPage() {
  return (
    <Suspense fallback={<SectionFallback type="cards" cards={4} />}>
      <DashboardResalesContent />
    </Suspense>
  );
}
