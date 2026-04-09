import { Suspense } from "react";
import { SectionFallback } from "@/components/base/SectionFallback";
import { PageHeaderWithRefetch } from "@/components/base/PageHeaderWithRefetch";
import { AdminProfileContent } from "./_components/AdminProfileContent";
import { KEY } from "@/utils/constant";

export default function AdminProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeaderWithRefetch
        title="Hồ sơ"
        subtitle="Thông tin tài khoản admin"
        queryKeys={[KEY.users]}
      />

      <Suspense fallback={<SectionFallback type="cards" cards={2} />}>
        <AdminProfileContent />
      </Suspense>
    </div>
  );
}
