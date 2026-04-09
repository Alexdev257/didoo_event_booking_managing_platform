"use client";

import { useGetMe } from "@/hooks/useAuth";
import { useGetOrganizer } from "@/hooks/useEvent";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export function OrganizerProfileContent() {
  const { data: meRes, isLoading: isMeLoading } = useGetMe();
  const user = meRes?.data;
  const organizerId = user?.organizerId ?? undefined;
  const { data: orgRes, isLoading: isOrgLoading } = useGetOrganizer(organizerId ?? "");

  const organizer = orgRes?.data;
  const isLoading = isMeLoading || (!!organizerId && isOrgLoading);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="border-zinc-200">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="flex gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-zinc-200">
        <CardHeader>
          <h2 className="text-lg font-semibold text-zinc-900">Thông tin cá nhân</h2>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user?.avatarUrl} />
            <AvatarFallback className="bg-zinc-100 text-lg">{user?.fullName?.[0]}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-500">Họ tên</p>
            <p className="text-zinc-900">{user?.fullName}</p>
            <p className="text-sm font-medium text-zinc-500">Email</p>
            <p className="text-zinc-900">{user?.email}</p>
            {user?.phone && (
              <>
                <p className="text-sm font-medium text-zinc-500">Số điện thoại</p>
                <p className="text-zinc-900">{user.phone}</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {organizer && (
        <Card className="border-zinc-200">
          <CardHeader>
            <h2 className="text-lg font-semibold text-zinc-900">Thông tin tổ chức</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            {organizer.bannerUrl && (
              <div className="relative h-36 w-full overflow-hidden rounded-xl bg-zinc-100">
                <img src={organizer.bannerUrl} alt="" className="h-full w-full object-cover" />
              </div>
            )}

            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <Avatar className="h-24 w-24 shrink-0">
                <AvatarImage src={organizer.logoUrl} />
                <AvatarFallback className="bg-zinc-100 text-xl">{organizer.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-zinc-900">{organizer.name}</h3>
                  <p className="font-mono text-sm text-zinc-500">{organizer.slug}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Email</p>
                    <a href={`mailto:${organizer.email}`} className="text-zinc-900 hover:underline">
                      {organizer.email}
                    </a>
                  </div>
                  {organizer.phone && (
                    <div>
                      <p className="text-sm font-medium text-zinc-500">Số điện thoại</p>
                      <a href={`tel:${organizer.phone}`} className="text-zinc-900 hover:underline">
                        {organizer.phone}
                      </a>
                    </div>
                  )}
                  {organizer.address && (
                    <div className="sm:col-span-2">
                      <p className="text-sm font-medium text-zinc-500">Địa chỉ</p>
                      <p className="text-zinc-900">{organizer.address}</p>
                    </div>
                  )}
                </div>

                {(organizer.websiteUrl || organizer.facebookUrl || organizer.instagramUrl || organizer.tiktokUrl) && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-zinc-500">Liên kết</p>
                    <div className="flex flex-wrap gap-2">
                      {organizer.websiteUrl && (
                        <a
                          href={organizer.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
                        >
                          Website
                        </a>
                      )}
                      {organizer.facebookUrl && (
                        <a
                          href={organizer.facebookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
                        >
                          Facebook
                        </a>
                      )}
                      {organizer.instagramUrl && (
                        <a
                          href={organizer.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
                        >
                          Instagram
                        </a>
                      )}
                      {organizer.tiktokUrl && (
                        <a
                          href={organizer.tiktokUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
                        >
                          TikTok
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {organizer.description && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-zinc-500">Mô tả</p>
                    <p className="whitespace-pre-wrap text-zinc-700">{organizer.description}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
