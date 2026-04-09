"use client";

import { Suspense } from "react";
import { SectionFallback } from "@/components/base/SectionFallback";
import DashboardProfileContent from "./_components/DashboardProfileContent";

export default function DashboardProfilePage() {
  return (
    <Suspense fallback={<SectionFallback type="cards" cards={2} />}>
      <DashboardProfileContent />
    </Suspense>
  );
}
