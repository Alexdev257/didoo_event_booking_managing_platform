import { DetailPageHeader } from "@/components/base/DetailPageHeader";
import { EditTicketTypeForm } from "./_components/EditTicketTypeForm";
import { KEY } from "@/utils/constant";

type PageProps = {
  params: Promise<{ eventId: string; ticketTypeId: string }>;
};

export default async function EditTicketTypePage({ params }: PageProps) {
  const { eventId, ticketTypeId } = await params;

  return (
    <div className="space-y-6">
      <DetailPageHeader
        title="Chỉnh sửa loại vé"
        subtitle="Cập nhật thông tin loại vé"
        backHref={`/organizer/events/${eventId}`}
        queryKeys={[KEY.ticketTypes, KEY.events]}
      />

      <EditTicketTypeForm eventId={eventId} ticketTypeId={ticketTypeId} />
    </div>
  );
}
