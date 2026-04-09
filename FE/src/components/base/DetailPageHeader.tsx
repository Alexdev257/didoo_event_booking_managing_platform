"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { RefetchButton } from "./RefetchButton";

type DetailPageHeaderProps = {
  title: string;
  subtitle?: string;
  backHref: string;
  queryKeys: readonly (readonly string[])[];
};

export function DetailPageHeader({
  title,
  subtitle,
  backHref,
  queryKeys,
}: DetailPageHeaderProps) {
  return (
    <div className="flex flex-1 items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <RefetchButton queryKeys={queryKeys} />
    </div>
  );
}
