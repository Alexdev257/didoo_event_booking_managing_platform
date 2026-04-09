import { Suspense } from "react";
import { SectionFallback } from "@/components/base/SectionFallback";
import DashboardHomeContent from "./_components/DashboardHomeContent";

export default function UserDashboardPage() {
  return (
    <Suspense fallback={<SectionFallback type="cards" cards={6} />}>
      <DashboardHomeContent />
    </Suspense>
  );
}
