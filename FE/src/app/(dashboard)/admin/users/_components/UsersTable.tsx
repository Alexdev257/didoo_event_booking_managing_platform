"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useGetUsers } from "@/hooks/useAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BasePagination } from "@/components/base/BasePagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import type { User } from "@/types/auth";
import { Roles } from "@/utils/enum";

function toQuery(params: Record<string, string | string[] | undefined>) {
  const q: Record<string, string | number | boolean> = {};
  const pageNumber = Number(params.pageNumber ?? params.page ?? 1) || 1;
  const pageSize = Number(params.pageSize) || 10;
  q.pageNumber = pageNumber;
  q.pageSize = pageSize;
  if (params.fullName && typeof params.fullName === "string") q.fullName = params.fullName;
  if (params.email && typeof params.email === "string") q.email = params.email;
  if (params.phone && typeof params.phone === "string") q.phone = params.phone;
  if (params.roleId && typeof params.roleId === "string") q.roleId = params.roleId;
  if (params.status !== undefined && params.status !== "") q.status = Number(params.status);
  if (params.isDescending !== undefined) q.isDescending = params.isDescending === "true";
  return q;
}

export function UsersTable({
  params,
  onDelete,
}: {
  params: Record<string, string | string[] | undefined>;
  onDelete?: (user: User) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = toQuery(params);
  const { data, isLoading } = useGetUsers({...query, role: Roles.USER});

  if (isLoading || !data) {
    return null;
  }

  const items = data.data?.items ?? [];
  const totalItems = data.data?.totalItems ?? 0;
  const pageNumber = data.data?.pageNumber ?? 1;
  const pageSize = data.data?.pageSize ?? 10;
  const totalPages = data.data?.totalPages ?? 1;

  const updateParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set(key, value);
    if (key !== "pageNumber" && key !== "page") p.set("pageNumber", "1");
    router.push(`${pathname}?${p.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-12 text-muted-foreground">Avatar</TableHead>
              <TableHead className="text-muted-foreground">Họ tên</TableHead>
              <TableHead className="text-muted-foreground">Email</TableHead>
              <TableHead className="text-muted-foreground">SĐT</TableHead>
              <TableHead className="text-muted-foreground">Vai trò</TableHead>
              <TableHead className="text-muted-foreground">Trạng thái</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((u) => (
              <TableRow key={u.id} className="border-border hover:bg-muted/30 transition-colors">
                <TableCell>
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage src={u.avatarUrl} />
                    <AvatarFallback className="bg-muted text-muted-foreground">{u.fullName?.[0]}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium text-foreground">{u.fullName}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell className="text-muted-foreground">{u.phone ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-border text-muted-foreground">{u.role?.name ?? "—"}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={u.isVerified ? "default" : "secondary"}>
                    {u.isVerified ? "Đã xác minh" : "Chưa xác minh"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/users/${u.id}`}>Xem chi tiết</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/users/${u.id}/edit`}>Chỉnh sửa</Link>
                      </DropdownMenuItem>
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(u)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <BasePagination
        currentPage={pageNumber}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={pageSize}
        onPageChange={(p) => updateParam("pageNumber", String(p))}
        onPageSizeChange={(s) => updateParam("pageSize", String(s))}
      />
    </div>
  );
}
