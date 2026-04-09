import { Suspense } from "react";
import { SectionFallback } from "@/components/base/SectionFallback";
import { EventsFilters } from "./_components/EventsFilters";
import { EventsSection } from "./_components/EventsSection";
import { EventsPageHeader } from "./_components/EventsPageHeader";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AdminEventsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <EventsPageHeader />

      <EventsFilters />

      <Suspense key={JSON.stringify(params)} fallback={<SectionFallback type="table" rows={10} />}>
        <EventsSection params={params} />
      </Suspense>
    </div>
  );
}
