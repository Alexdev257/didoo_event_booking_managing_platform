import { DetailPageHeader } from "@/components/base/DetailPageHeader";
import { EventDetailContent } from "./_components/EventDetailContent";
import { KEY } from "@/utils/constant";

type PageProps = {
  params: Promise<{ eventId: string }>;
};

export default async function OrganizerEventDetailPage({ params }: PageProps) {
  const { eventId } = await params;

  return (
    <div className="space-y-6">
      <DetailPageHeader
        title="Chi tiết sự kiện"
        subtitle="Xem thông tin và quản lý loại vé"
        backHref="/organizer/events"
        queryKeys={[KEY.events, KEY.ticketTypes]}
      />

      <EventDetailContent eventId={eventId} />
    </div>
  );
}
