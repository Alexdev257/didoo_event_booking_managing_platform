import { Suspense } from "react";
import { SectionFallback } from "@/components/base/SectionFallback";
import { PageHeaderWithRefetch } from "@/components/base/PageHeaderWithRefetch";
import { RevenueContent } from "./_components/RevenueContent";
import { KEY } from "@/utils/constant";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AdminRevenuePage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <PageHeaderWithRefetch
        title="Doanh thu"
        subtitle="Thống kê doanh thu hệ thống"
        queryKeys={[KEY.bookings, KEY.payments]}
      />

      <Suspense key={JSON.stringify(params)} fallback={<SectionFallback type="cards" cards={4} />}>
        <RevenueContent params={params} />
      </Suspense>
    </div>
  );
}
