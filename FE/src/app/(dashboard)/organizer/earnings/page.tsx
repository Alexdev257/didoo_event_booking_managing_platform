import { Suspense } from "react";
import { SectionFallback } from "@/components/base/SectionFallback";
import { PageHeaderWithRefetch } from "@/components/base/PageHeaderWithRefetch";
import { OrganizerEarningsContent } from "./_components/OrganizerEarningsContent";
import { KEY } from "@/utils/constant";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function OrganizerEarningsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <PageHeaderWithRefetch
        title="Ví & Doanh thu"
        subtitle="Thống kê doanh thu từ sự kiện"
        queryKeys={[KEY.bookings, KEY.payments]}
      />

      <Suspense key={JSON.stringify(params)} fallback={<SectionFallback type="cards" cards={4} />}>
        <OrganizerEarningsContent params={params} />
      </Suspense>
    </div>
  );
}
