"use client";

import { useGetMe } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminProfileContent() {
  const { data, isLoading } = useGetMe();

  if (isLoading || !data?.data) {
    return (
      <Card className="border-zinc-200">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  const user = data.data;

  return (
    <Card className="border-zinc-200">
      <CardHeader>
        <h2 className="text-lg font-semibold text-zinc-900">Thông tin cá nhân</h2>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.avatarUrl} />
          <AvatarFallback className="bg-zinc-100 text-lg">{user.fullName?.[0]}</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-500">Họ tên</p>
          <p className="text-zinc-900">{user.fullName}</p>
          <p className="text-sm font-medium text-zinc-500">Email</p>
          <p className="text-zinc-900">{user.email}</p>
          {user.phone && (
            <>
              <p className="text-sm font-medium text-zinc-500">Số điện thoại</p>
              <p className="text-zinc-900">{user.phone}</p>
            </>
          )}
          <p className="text-sm font-medium text-zinc-500">Vai trò</p>
          <p className="text-zinc-900">{user.role?.name ?? "Admin"}</p>
        </div>
      </CardContent>
    </Card>
  );
}
