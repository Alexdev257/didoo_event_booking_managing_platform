"use client";

import { Suspense } from "react";
import { SectionFallback } from "@/components/base/SectionFallback";
import CreateOrganizerContent from "./_components/CreateOrganizerContent";

export default function CreateOrganizerPage() {
  return (
    <Suspense fallback={<SectionFallback type="cards" cards={2} />}>
      <CreateOrganizerContent />
    </Suspense>
  );
}
