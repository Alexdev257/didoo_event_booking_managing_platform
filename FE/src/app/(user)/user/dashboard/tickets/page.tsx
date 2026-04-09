"use client";

import { Suspense } from "react";
import { SectionFallback } from "@/components/base/SectionFallback";
import DashboardTicketsContent from "./_components/DashboardTicketsContent";

export default function DashboardTicketsPage() {
  return (
    <Suspense fallback={<SectionFallback type="list" rows={8} />}>
      <DashboardTicketsContent />
    </Suspense>
  );
}
