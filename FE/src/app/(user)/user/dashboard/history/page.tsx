"use client";

import { Suspense } from "react";
import { SectionFallback } from "@/components/base/SectionFallback";
import DashboardHistoryContent from "./_components/DashboardHistoryContent";

export default function DashboardHistoryPage() {
  return (
    <Suspense fallback={<SectionFallback type="list" rows={8} />}>
      <DashboardHistoryContent />
    </Suspense>
  );
}
