"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetOrganizer, useOrganizer } from "@/hooks/useEvent";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Loader2, Pencil, CheckCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { OrganizerStatus } from "@/utils/enum";

const statusLabels: Record<OrganizerStatus, string> = {
  [OrganizerStatus.PENDING]: "Chờ duyệt",
  [OrganizerStatus.VERIFIED]: "Đã xác minh",
  [OrganizerStatus.BANNED]: "Bị cấm",
};

export function OrganizerDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const { data, isLoading } = useGetOrganizer(id);
  const { verify, deleteOrganizer } = useOrganizer();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = async () => {
    await deleteOrganizer.mutateAsync(id);
    router.push("/admin/organizers");
  };

  if (isLoading || !data?.data) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const organizer = data.data;
  const isPending = organizer.status === OrganizerStatus.PENDING;

  return (
    <div className="space-y-6">
      {isPending && (
        <Card className="border-amber-500/20 bg-amber-500/10">
          <CardHeader className="pb-2">
            <h2 className="text-lg font-semibold text-amber-600 dark:text-amber-500">Duyệt organizer</h2>
            <p className="text-sm text-amber-700 dark:text-amber-400/90">
              Organizer đang chờ admin xác minh. Bấm nút bên dưới để duyệt.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end gap-2">
              <Button
                variant="destructive"
                onClick={() => setShowDeleteModal(true)}
                disabled={deleteOrganizer.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => verify.mutate(id)}
                disabled={verify.isPending}
              >
                {verify.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Duyệt organizer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h2 className="text-lg font-semibold text-foreground">Thông tin</h2>
          <div className="flex justify-end gap-2">
            {!isPending && (
              <Button size="sm" variant="destructive" className="rounded-xl" onClick={() => setShowDeleteModal(true)} disabled={deleteOrganizer.isPending}>
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </Button>
            )}
            <Button size="sm" variant="outline" className="rounded-xl" asChild>
              <Link href={`/admin/organizers/${id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {organizer.bannerUrl && (
            <div className="relative h-36 w-full overflow-hidden rounded-xl border border-border bg-muted/30">
              <img src={organizer.bannerUrl} alt="" className="h-full w-full object-cover" />
            </div>
          )}

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex shrink-0 flex-col gap-3">
              <Avatar className="h-24 w-24 border border-border">
                <AvatarImage src={organizer.logoUrl} />
                <AvatarFallback className="bg-primary/10 text-xl font-medium text-primary">{organizer.name?.[0]}</AvatarFallback>
              </Avatar>
            </div>
            <div className="min-w-0 flex-1 space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground">{organizer.name}</h3>
                <p className="font-mono text-sm text-muted-foreground">{organizer.slug}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <a href={`mailto:${organizer.email}`} className="text-foreground hover:text-primary transition-colors hover:underline">
                    {organizer.email}
                  </a>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Số điện thoại</p>
                  <a href={`tel:${organizer.phone}`} className="text-foreground hover:text-primary transition-colors hover:underline">
                    {organizer.phone ?? "—"}
                  </a>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Trạng thái</p>
                  <Badge
                    variant={
                      organizer.status === OrganizerStatus.VERIFIED
                        ? "default"
                        : organizer.status === OrganizerStatus.BANNED
                          ? "destructive"
                          : "secondary"
                    }
                    className={organizer.status === OrganizerStatus.PENDING ? "bg-muted text-muted-foreground border-border" : ""}
                  >
                    {statusLabels[organizer.status as OrganizerStatus] ?? organizer.status}
                  </Badge>
                </div>
                {organizer.address && (
                  <div className="sm:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Địa chỉ</p>
                    <p className="text-foreground">{organizer.address}</p>
                  </div>
                )}
              </div>

              {(organizer.websiteUrl || organizer.facebookUrl || organizer.instagramUrl || organizer.tiktokUrl) && (
                <div>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">Liên kết</p>
                  <div className="flex flex-wrap gap-2">
                    {organizer.websiteUrl && (
                      <a
                        href={organizer.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted/80 transition-colors"
                      >
                        Website
                      </a>
                    )}
                    {organizer.facebookUrl && (
                      <a
                        href={organizer.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted/80 transition-colors"
                      >
                        Facebook
                      </a>
                    )}
                    {organizer.instagramUrl && (
                      <a
                        href={organizer.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted/80 transition-colors"
                      >
                        Instagram
                      </a>
                    )}
                    {organizer.tiktokUrl && (
                      <a
                        href={organizer.tiktokUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted/80 transition-colors"
                      >
                        TikTok
                      </a>
                    )}
                  </div>
                </div>
              )}

              {organizer.description && (
                <div>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">Mô tả</p>
                  <p className="whitespace-pre-wrap text-foreground/90">{organizer.description}</p>
                </div>
              )}

              {(organizer.createdAt || organizer.updatedAt) && (
                <div className="flex gap-4 text-xs text-muted-foreground">
                  {organizer.createdAt && <span>Tạo: {new Date(organizer.createdAt).toLocaleDateString("vi-VN")}</span>}
                  {organizer.updatedAt && <span>Cập nhật: {new Date(organizer.updatedAt).toLocaleDateString("vi-VN")}</span>}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Xóa organizer"
        description={`Bạn có chắc muốn xóa "${organizer.name}"?`}
        confirmLabel="Xóa"
        onConfirm={handleDelete}
        isLoading={deleteOrganizer.isPending}
        variant="danger"
      />
    </div>
  );
}
