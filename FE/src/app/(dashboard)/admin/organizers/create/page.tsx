import { DetailPageHeader } from "@/components/base/DetailPageHeader";
import { CreateOrganizerForm } from "./_components/CreateOrganizerForm";
import { KEY } from "@/utils/constant";

export default function AdminCreateOrganizerPage() {
  return (
    <div className="space-y-6">
      <DetailPageHeader
        title="Tạo organizer"
        subtitle="Thêm tổ chức sự kiện mới"
        backHref="/admin/organizers"
        queryKeys={[KEY.organizers]}
      />

      <CreateOrganizerForm />
    </div>
  );
}
