import { Suspense } from "react";
import { SectionFallback } from "@/components/base/SectionFallback";
import { PageHeaderWithRefetch } from "@/components/base/PageHeaderWithRefetch";
import { OrganizerProfileContent } from "./_components/OrganizerProfileContent";
import { KEY } from "@/utils/constant";

export default function OrganizerProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeaderWithRefetch
        title="Hồ sơ"
        subtitle="Thông tin tài khoản và tổ chức"
        queryKeys={[KEY.users, KEY.organizers]}
      />

      <Suspense fallback={<SectionFallback type="cards" cards={2} />}>
        <OrganizerProfileContent />
      </Suspense>
    </div>
  );
}
