"use client";

import { useGetUser } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function UserDetailContent({ id }: { id: string }) {
  const { data, isLoading } = useGetUser(id);

  if (isLoading || !data?.data) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <Skeleton className="h-20 w-20 rounded-full mb-4 bg-muted" />
          <Skeleton className="h-4 w-full mb-2 bg-muted" />
          <Skeleton className="h-4 w-3/4 bg-muted" />
        </CardContent>
      </Card>
    );
  }

  const user = data.data;

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <h2 className="text-lg font-semibold text-foreground">Thông tin</h2>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <Avatar className="h-20 w-20 border border-border">
          <AvatarImage src={user.avatarUrl} />
          <AvatarFallback className="bg-primary/10 text-lg font-medium text-primary">{user.fullName?.[0]}</AvatarFallback>
        </Avatar>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Họ tên</p>
            <p className="text-foreground">{user.fullName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-foreground">{user.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Số điện thoại</p>
            <p className="text-foreground">{user.phone ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Vai trò</p>
            <Badge variant="outline" className="border-border text-foreground">{user.role?.name ?? "—"}</Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Trạng thái</p>
            <Badge variant={user.isVerified ? "default" : "secondary"} className={!user.isVerified ? "bg-muted text-muted-foreground border-border" : ""}>
              {user.isVerified ? "Đã xác minh" : "Chưa xác minh"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
