"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EventsCtaBannerProps {
  title: string;
  description: string;
  primaryLink: string;
  primaryLabel: string;
  secondaryLink: string;
  secondaryLabel: string;
  variant?: "primary" | "amber";
}

export function EventsCtaBanner({
  title,
  description,
  primaryLink,
  primaryLabel,
  secondaryLink,
  secondaryLabel,
  variant = "primary",
}: EventsCtaBannerProps) {
  const gradientClass =
    variant === "amber"
      ? "from-amber-500/5 via-white to-amber-500/5"
      : "from-primary/5 via-white to-primary/5";

  return (
    <div
      className={`rounded-2xl border border-zinc-200 bg-gradient-to-br ${gradientClass} p-8 sm:p-12 shadow-sm`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-bold text-zinc-900">{title}</h3>
          <p className="mt-2 text-zinc-600 max-w-xl">{description}</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Button asChild className="rounded-xl">
            <Link href={primaryLink}>{primaryLabel}</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href={secondaryLink}>{secondaryLabel}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
