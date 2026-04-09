import { Suspense } from "react";
import { SectionFallback } from "@/components/base/SectionFallback";
import { PageHeaderWithRefetch } from "@/components/base/PageHeaderWithRefetch";
import { OrganizerOrdersContent } from "./_components/OrganizerOrdersContent";
import { KEY } from "@/utils/constant";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function OrganizerOrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <PageHeaderWithRefetch
        title="Đơn hàng"
        subtitle="Quản lý đơn đặt vé"
        queryKeys={[KEY.bookings]}
      />

      <Suspense key={JSON.stringify(params)} fallback={<SectionFallback type="table" rows={10} />}>
        <OrganizerOrdersContent params={params} />
      </Suspense>
    </div>
  );
}
