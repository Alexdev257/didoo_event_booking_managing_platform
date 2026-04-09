import { Suspense } from "react";
import { SectionFallback } from "@/components/base/SectionFallback";
import { UsersFilters } from "./_components/UsersFilters";
import { UsersSection } from "./_components/UsersSection";
import { UsersPageHeader } from "./_components/UsersPageHeader";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <UsersPageHeader />

      <UsersFilters params={params} />

      <Suspense key={JSON.stringify(params)} fallback={<SectionFallback type="table" rows={10} />}>
        <UsersSection params={params} />
      </Suspense>
    </div>
  );
}
