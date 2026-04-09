"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { RefetchButton } from "./RefetchButton";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  /** Nếu có, hiển thị nút Create. href = link đến trang create, onClick = mở drawer */
  createHref?: string;
  createOnClick?: () => void;
  createLabel?: string;
  /** Query keys để invalidate khi bấm Làm mới (trừ overview) */
  refetchQueryKeys?: readonly (readonly string[])[];
};

export function SectionHeader({
  title,
  subtitle,
  createHref,
  createOnClick,
  createLabel = "Tạo mới",
  refetchQueryKeys,
}: SectionHeaderProps) {
  const createButton = createHref ? (
    <Button asChild size="sm" className="rounded-xl">
      <Link href={createHref}>
        <Plus className="h-4 w-4" />
        {createLabel}
      </Link>
    </Button>
  ) : createOnClick ? (
    <Button size="sm" className="rounded-xl" onClick={createOnClick}>
      <Plus className="h-4 w-4" />
      {createLabel}
    </Button>
  ) : null;

  const refetchButton = refetchQueryKeys?.length ? (
    <RefetchButton queryKeys={refetchQueryKeys} />
  ) : null;

  const actions = (
    <div className="flex shrink-0 items-center gap-2">
      {refetchButton}
      {createButton}
    </div>
  );

  return (
    <div className="flex flex-1 items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {(refetchButton || createButton) && actions}
    </div>
  );
}
