"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useGetCategories } from "@/hooks/useEvent";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BasePagination } from "@/components/base/BasePagination";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { Category } from "@/types/event";

function toQuery(params: Record<string, string | string[] | undefined>) {
  const q: Record<string, string | number | boolean> = {};
  const pageNumber = Number(params.pageNumber ?? params.page ?? 1) || 1;
  const pageSize = Number(params.pageSize) || 10;
  q.pageNumber = pageNumber;
  q.pageSize = pageSize;
  if (params.name && typeof params.name === "string") q.name = params.name;
  if (params.isDescending !== undefined) q.isDescending = params.isDescending === "true";
  return q;
}

export function CategoriesTable({
  params,
  onEdit,
  onDelete,
}: {
  params: Record<string, string | string[] | undefined>;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = toQuery(params);
  const { data, isLoading } = useGetCategories(query);

  if (isLoading || !data) return null;

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
              <TableHead className="text-muted-foreground">Tên</TableHead>
              <TableHead className="text-muted-foreground">Slug</TableHead>
              <TableHead className="text-muted-foreground">Mô tả</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((c) => (
              <TableRow key={c.id} className="border-border hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium text-foreground">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground">{c.description ?? "—"}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(c)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(c)}
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
