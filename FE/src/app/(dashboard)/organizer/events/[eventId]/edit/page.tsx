import { DetailPageHeader } from "@/components/base/DetailPageHeader";
import { EditEventForm } from "./_components/EditEventForm";
import { KEY } from "@/utils/constant";

type PageProps = {
  params: Promise<{ eventId: string }>;
};

export default async function OrganizerEditEventPage({ params }: PageProps) {
  const { eventId } = await params;

  return (
    <div className="space-y-6">
      <DetailPageHeader
        title="Chỉnh sửa sự kiện"
        subtitle="Cập nhật thông tin sự kiện"
        backHref="/organizer/events"
        queryKeys={[KEY.events]}
      />

      <EditEventForm eventId={eventId} />
    </div>
  );
}
