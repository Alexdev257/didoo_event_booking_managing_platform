import { Suspense } from "react";
import { SectionFallback } from "@/components/base/SectionFallback";
import { DetailPageHeader } from "@/components/base/DetailPageHeader";
import { OrganizerOrderDetailContent } from "./_components/OrganizerOrderDetailContent";
import { KEY } from "@/utils/constant";

export default async function OrganizerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <DetailPageHeader
        title="Chi tiết đơn hàng"
        subtitle={`Mã đơn: ${id}`}
        backHref="/organizer/orders"
        queryKeys={[KEY.bookings]}
      />

      <Suspense fallback={<SectionFallback type="table" rows={8} />}>
        <OrganizerOrderDetailContent id={id} />
      </Suspense>
    </div>
  );
}

