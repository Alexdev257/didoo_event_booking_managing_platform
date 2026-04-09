import { Suspense } from "react";
import { SectionFallback } from "@/components/base/SectionFallback";
import { DetailPageHeader } from "@/components/base/DetailPageHeader";
import { CreateEventForm } from "./_components/CreateEventForm";
import { KEY } from "@/utils/constant";

export default function OrganizerCreateEventPage() {
  return (
    <div className="space-y-6">
      <DetailPageHeader
        title="Tạo sự kiện"
        subtitle="Thêm sự kiện mới"
        backHref="/organizer/events"
        queryKeys={[KEY.events]}
      />

      <Suspense fallback={<SectionFallback type="cards" cards={3} />}>
        <CreateEventForm />
      </Suspense>
    </div>
  );
}
