import { DetailPageHeader } from "@/components/base/DetailPageHeader";
import { CreateTicketTypesForm } from "./_components/CreateTicketTypesForm";
import { KEY } from "@/utils/constant";

type PageProps = {
  params: Promise<{ eventId: string }>;
};

export default async function CreateTicketTypesPage({ params }: PageProps) {
  const { eventId } = await params;

  return (
    <div className="space-y-6">
      <DetailPageHeader
        title="Tạo loại vé"
        subtitle="Thêm các loại vé cho sự kiện của bạn"
        backHref={`/organizer/events/${eventId}`}
        queryKeys={[KEY.ticketTypes, KEY.events]}
      />

      <CreateTicketTypesForm eventId={eventId} />
    </div>
  );
}
