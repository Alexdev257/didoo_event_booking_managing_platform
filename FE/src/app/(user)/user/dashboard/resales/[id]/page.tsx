import { Suspense } from "react";
import { SectionFallback } from "@/components/base/SectionFallback";
import { ResaleListingDetailContent } from "./_components/ResaleListingDetailContent";

export default async function ResaleListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <Suspense fallback={<SectionFallback type="cards" cards={2} />}>
        <ResaleListingDetailContent id={id} />
      </Suspense>
    </div>
  );
}

