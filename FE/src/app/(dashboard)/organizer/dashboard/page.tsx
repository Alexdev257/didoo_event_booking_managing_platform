import { Suspense } from "react";
import { SectionFallback } from "@/components/base/SectionFallback";
import { OrganizerDashboardContent } from "./_components/OrganizerDashboardContent";

export default function OrganizerDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">Dashboard Nhà Tổ Chức</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tổng quan hiệu suất bán vé và thị trường thứ cấp</p>
      </div>

      <Suspense fallback={<SectionFallback type="cards" cards={4} />}>
        <OrganizerDashboardContent />
      </Suspense>
    </div>
  );
}
