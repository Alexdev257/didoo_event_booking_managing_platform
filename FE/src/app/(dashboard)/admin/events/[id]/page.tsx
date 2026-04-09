import { Suspense } from "react";
import { SectionFallback } from "@/components/base/SectionFallback";
import { DetailPageHeader } from "@/components/base/DetailPageHeader";
import { AdminEventDetailContent } from "./_components/AdminEventDetailContent";
import { KEY } from "@/utils/constant";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEventDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <DetailPageHeader
        title="Chi tiết sự kiện"
        subtitle="Thông tin sự kiện"
        backHref="/admin/events"
        queryKeys={[KEY.events]}
      />

      <Suspense fallback={<SectionFallback type="cards" cards={2} />}>
        <AdminEventDetailContent eventId={id} />
      </Suspense>
    </div>
  );
}
