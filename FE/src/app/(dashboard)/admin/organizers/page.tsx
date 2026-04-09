import { Suspense } from "react";
import { SectionFallback } from "@/components/base/SectionFallback";
import { OrganizersFilters } from "./_components/OrganizersFilters";
import { OrganizersSection } from "./_components/OrganizersSection";
import { OrganizersPageHeader } from "./_components/OrganizersPageHeader";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AdminOrganizersPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <OrganizersPageHeader />

      <OrganizersFilters />

      <Suspense key={JSON.stringify(params)} fallback={<SectionFallback type="table" rows={10} />}>
        <OrganizersSection params={params} />
      </Suspense>
    </div>
  );
}
