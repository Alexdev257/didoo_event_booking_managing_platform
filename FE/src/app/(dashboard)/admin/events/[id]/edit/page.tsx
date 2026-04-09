import { DetailPageHeader } from "@/components/base/DetailPageHeader";
import { EditEventForm } from "./_components/EditEventForm";
import { KEY } from "@/utils/constant";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditEventPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <DetailPageHeader
        title="Chỉnh sửa sự kiện"
        subtitle="Cập nhật thông tin sự kiện"
        backHref="/admin/events"
        queryKeys={[KEY.events]}
      />

      <EditEventForm eventId={id} />
    </div>
  );
}
