import { DetailPageHeader } from "@/components/base/DetailPageHeader";
import { AdminCreateEventForm } from "./_components/AdminCreateEventForm";
import { KEY } from "@/utils/constant";

export default function AdminCreateEventPage() {
  return (
    <div className="space-y-6">
      <DetailPageHeader
        title="Tạo sự kiện"
        subtitle="Thêm sự kiện mới cho organizer"
        backHref="/admin/events"
        queryKeys={[KEY.events]}
      />

      <AdminCreateEventForm />
    </div>
  );
}
