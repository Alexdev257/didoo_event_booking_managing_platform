"use client";

import { use } from "react";
import Link from "next/link";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { EventStatus } from "@/utils/enum";
import { useGetEvents, useGetOrganizer } from "@/hooks/useEvent";
import { OrganizerBanner } from "./_components/OrganizerBanner";
import { OrganizerProfileHeader } from "./_components/OrganizerProfileHeader";
import { OrganizerStats } from "./_components/OrganizerStats";
import { OrganizerAbout } from "./_components/OrganizerAbout";
import { OrganizerEventsSection } from "./_components/OrganizerEventsSection";
import { OrganizerContactInfo } from "./_components/OrganizerContactInfo";
import { OrganizerSocialMedia } from "./_components/OrganizerSocialMedia";
import { OrganizerQuickInfo } from "./_components/OrganizerQuickInfo";

export default function OrganizerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: organizerResponse, isLoading: isOrganizerLoading } =
    useGetOrganizer(id);
  const organizer = organizerResponse?.data;

  const { data: eventsResponse, isLoading: isEventsLoading } = useGetEvents({
    organizerId: id,
    pageSize: 50,
    hasCategory: true,
    hasLocations: true,
    isDeleted: false,
  });
  const rawEvents = eventsResponse?.data.items || [];
  const allEvents = rawEvents.filter(
    (e) => (e.status as number) !== EventStatus.DRAFT
  );

  if (isOrganizerLoading) return <Loading />;

  if (!organizer) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-muted-foreground">Không tìm thấy nhà tổ chức.</p>
          <Button asChild className="mt-4 rounded-xl">
            <Link href="/events">Quay lại sự kiện</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-24">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 left-0 h-96 w-96 rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute top-1/3 right-0 h-80 w-80 rounded-full bg-primary/5 blur-[80px]" />
      </div>

      <OrganizerBanner
        bannerUrl={organizer.bannerUrl}
        name={organizer.name}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <OrganizerProfileHeader organizer={organizer} />
        <OrganizerStats eventCount={allEvents.length} />

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-10 lg:col-span-8">
            <OrganizerAbout description={organizer.description} />
            <OrganizerEventsSection
              events={allEvents}
              isLoading={isEventsLoading}
            />
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <OrganizerContactInfo
              email={organizer.email}
              phone={organizer.phone}
              websiteUrl={organizer.websiteUrl}
            />
            <OrganizerSocialMedia
              facebookUrl={organizer.facebookUrl}
              instagramUrl={organizer.instagramUrl}
              tiktokUrl={organizer.tiktokUrl}
            />
            <OrganizerQuickInfo
              eventCount={allEvents.length}
              createdAt={organizer.createdAt}
              isVerified={organizer.isVerified}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
