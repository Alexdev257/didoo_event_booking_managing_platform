import { Suspense } from "react";
import { SectionFallback } from "@/components/base/SectionFallback";
import { DetailPageHeader } from "@/components/base/DetailPageHeader";
import { OrganizerDetailContent } from "./_components/OrganizerDetailContent";
import { KEY } from "@/utils/constant";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrganizerDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <DetailPageHeader
        title="Chi tiết organizer"
        subtitle="Thông tin nhà tổ chức"
        backHref="/admin/organizers"
        queryKeys={[KEY.organizers]}
      />

      <Suspense fallback={<SectionFallback type="cards" cards={2} />}>
        <OrganizerDetailContent id={id} />
      </Suspense>
    </div>
  );
}
