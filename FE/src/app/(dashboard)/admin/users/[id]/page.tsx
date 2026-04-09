import { Suspense } from "react";
import { SectionFallback } from "@/components/base/SectionFallback";
import { DetailPageHeader } from "@/components/base/DetailPageHeader";
import { UserDetailContent } from "./_components/UserDetailContent";
import { KEY } from "@/utils/constant";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <DetailPageHeader
        title="Chi tiết người dùng"
        subtitle="Thông tin tài khoản"
        backHref="/admin/users"
        queryKeys={[KEY.users]}
      />

      <Suspense fallback={<SectionFallback type="cards" cards={2} />}>
        <UserDetailContent id={id} />
      </Suspense>
    </div>
  );
}
