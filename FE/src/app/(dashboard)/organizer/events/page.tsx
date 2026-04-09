import { Suspense } from "react";
import { SectionFallback } from "@/components/base/SectionFallback";
import { OrganizerEventsContent } from "./_components/OrganizerEventsContent";
import { OrganizerEventsPageHeader } from "./_components/OrganizerEventsPageHeader";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function OrganizerEventsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <OrganizerEventsPageHeader />

      <Suspense key={JSON.stringify(params)} fallback={<SectionFallback type="table" rows={10} />}>
        <OrganizerEventsContent params={params} />
      </Suspense>
    </div>
  );
}
