import { Suspense } from "react";
import { SectionFallback } from "@/components/base/SectionFallback";
import { CategoriesFilters } from "./_components/CategoriesFilters";

import { CategoriesPageHeader } from "./_components/CategoriesPageHeader";
import { CategoriesSection } from "./_components/CategoriesSection";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AdminCategoriesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <CategoriesPageHeader />

      <CategoriesFilters />

      <Suspense key={JSON.stringify(params)} fallback={<SectionFallback type="table" rows={10} />}>
        <CategoriesSection params={params} />
      </Suspense>
    </div>
  );
}
