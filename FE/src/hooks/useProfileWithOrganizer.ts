"use client";

import { useGetMe } from "@/hooks/useAuth";
import { useGetOrganizer } from "@/hooks/useEvent";
import { OrganizerStatus } from "@/utils/enum";

/**
 * Hook dùng TanStack Query: lấy profile (có organizerId) và organizer (status).
 * Dùng cho Header dashboard dropdown, Dashboard layout role check.
 * Flow: User upgrade → có organizerId trong profile → get organizer để check status (PENDING/VERIFIED/BANNED).
 */
export function useProfileWithOrganizer() {
  const { data: meRes, isLoading: isProfileLoading } = useGetMe();
  const profile = meRes?.data;
  const organizerId = profile?.organizerId ?? undefined;

  const { data: orgRes, isLoading: isOrgLoading } = useGetOrganizer(organizerId ?? "");

  const organizer = orgRes?.data ?? null;
  const statusNum = organizer?.status != null ? Number(organizer.status) : null;
  const isVerifiedOrganizer = statusNum === OrganizerStatus.VERIFIED;
  const isLoading = isProfileLoading || (!!organizerId && isOrgLoading);

  return {
    profile,
    organizer,
    organizerId,
    isVerifiedOrganizer,
    isLoading,
  };
}