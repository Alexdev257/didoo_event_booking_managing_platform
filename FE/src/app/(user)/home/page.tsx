"use client";

import HeroSection from "@/app/(user)/home/_components/HeroSection";
import { SpecialEvents } from "@/app/(user)/home/_components/SpecialEvents";
import { AboutSection } from "@/app/(user)/home/_components/AboutSection";
import { TrendingEvents } from "@/app/(user)/home/_components/TrendingEvents";
import { MonthOverview } from "@/app/(user)/home/_components/MonthOverview";
import { useGetEvents, useGetCategories, useGetOrganizers } from "@/hooks/useEvent";
import Loading from "@/components/loading";
import { EventStatus, OrganizerStatus } from "@/utils/enum";
import CategorySection from "./_components/CategorySection";
import BecomeOrganizerSection from "./_components/BecomeOrganizerSection";

export default function Home() {
  const { data: openedEventsResponse, isLoading: isOpenedLoading, isError: isOpenedError } = useGetEvents({
    pageSize: 12,
    hasCategory: true,
    hasOrganizer: true,
    isDeleted: false,
    status: EventStatus.OPENED,
  });
  const { data: publishedEventsResponse, isLoading: isPublishedLoading, isError: isPublishedError } = useGetEvents({
    pageSize: 12,
    hasCategory: true,
    hasOrganizer: true,
    isDeleted: false,
    status: EventStatus.PUBLISHED,
  });

  const { data: categoriesResponse, isLoading: isCategoriesLoading } = useGetCategories({
    pageSize: 20,
  });
  const { data: organizersResponse, isLoading: isOrganizersLoading } = useGetOrganizers({
    pageSize: 8,status: OrganizerStatus.VERIFIED
  });

  if (isOpenedLoading || isPublishedLoading || isCategoriesLoading || isOrganizersLoading) return <Loading />;
  if ((isOpenedError && isPublishedError) || (!openedEventsResponse && !publishedEventsResponse)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Không thể tải dữ liệu. Vui lòng thử lại.
      </div>
    );
  }

  const openedEvents = openedEventsResponse?.data.items || [];
  const publishedEvents = publishedEventsResponse?.data.items || [];
  const categories = categoriesResponse?.data.items || [];
  const organizers = organizersResponse?.data.items || [];
  const heroEvents = openedEvents.length > 0 ? openedEvents : publishedEvents;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSection events={heroEvents.slice(0, 5)} />

      <CategorySection openedEvents={openedEvents.slice(0, 6)} />

      {
        publishedEvents.length > 0 && (
            <SpecialEvents events={publishedEvents} />
        )
      }
      <AboutSection categories={categories} />
      <TrendingEvents organizers={organizers} />
      <MonthOverview categories={categories} />
      <BecomeOrganizerSection />
    </div>
  );
}
