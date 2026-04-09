"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ticketTypeUpdateSchema, type TicketTypeUpdateBody, TICKET_SALE_TYPES, type TicketSaleType } from "@/schemas/ticket";
import { useTicketType } from "@/hooks/useTicket";
import { useGetEvent } from "@/hooks/useEvent";
import { useGetTicketType } from "@/hooks/useTicket";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { handleErrorApi } from "@/lib/errors";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

const SALE_TYPE_LABELS: Record<TicketSaleType, string> = { paid: "Bán vé", free: "Miễn phí" };

export function EditTicketTypeForm({
  eventId,
  ticketTypeId,
}: {
  eventId: string;
  ticketTypeId: string;
}) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { update, deleteTicketType } = useTicketType();
  const { data: eventRes } = useGetEvent(eventId);
  const { data: ticketTypeRes, isLoading } = useGetTicketType(ticketTypeId);

  const event = eventRes?.data;
  const ticketType = ticketTypeRes?.data;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<TicketTypeUpdateBody>({
    resolver: zodResolver(ticketTypeUpdateSchema),
    defaultValues: {
      saleType: "paid",
      name: "",
      price: 0,
      maxTicketsPerUser: null,
      totalQuantity: 0,
      availableQuantity: 0,
      description: "",
      enableMaxTicketsPerUser: false,
    },
  });

  useEffect(() => {
    if (ticketType) {
      const isFree = Number(ticketType.price ?? 0) === 0;
      const hasMaxPerUser = ticketType.maxTicketsPerUser != null && ticketType.maxTicketsPerUser >= 1;
      reset({
        saleType: isFree ? "free" : "paid",
        name: ticketType.name,
        price: ticketType.price ?? 0,
        maxTicketsPerUser: ticketType.maxTicketsPerUser ?? null,
        totalQuantity: ticketType.totalQuantity,
        availableQuantity: ticketType.availableQuantity,
        description: ticketType.description ?? "",
        enableMaxTicketsPerUser: !isFree && hasMaxPerUser,
      });
    }
  }, [ticketType, reset]);

  const saleType = watch("saleType") ?? "paid";

  const onSubmit = async (data: TicketTypeUpdateBody) => {
    try {
      const body = {
        name: data.name,
        price: data.saleType === "free" ? 0 : (data.price ?? 0),
        maxTicketsPerUser: data.saleType === "free"
          ? (data.maxTicketsPerUser ?? 1)
          : (data.enableMaxTicketsPerUser ? (data.maxTicketsPerUser ?? null) : null),
        totalQuantity: data.totalQuantity,
        availableQuantity: data.availableQuantity,
        description: data.description,
      };
      await update.mutateAsync({ id: ticketTypeId, body });
      router.push(`/organizer/events/${eventId}`);
    } catch (err) {
      handleErrorApi({ error: err, setError });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTicketType.mutateAsync(ticketTypeId);
      router.push(`/organizer/events/${eventId}`);
    } catch (err) {
      handleErrorApi({ error: err });
    } finally {
      setShowDeleteModal(false);
    }
  };

  if (isLoading || !ticketType) {
    return (
      <Card className="border-zinc-200">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <Card className="border-zinc-200">
      <CardHeader>
        <h2 className="text-lg font-semibold text-zinc-900">Thông tin loại vé</h2>
        <p className="text-sm text-zinc-500">
          Sự kiện: {event?.name ?? "—"}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Loại vé</Label>
            <Select
              value={saleType}
              onValueChange={(v) => {
                const newType = v as TicketSaleType;
                setValue("saleType", newType);
                if (newType === "free") setValue("price", 0);
              }}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">{SALE_TYPE_LABELS.paid}</SelectItem>
                <SelectItem value="free">{SALE_TYPE_LABELS.free}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Tên loại vé *</Label>
              <Input
                id="name"
                placeholder="Ví dụ: Vé thường, VIP"
                {...register("name")}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Giá (VNĐ) *</Label>
              {saleType === "free" ? (
                <Input
                  id="price"
                  type="number"
                  value={0}
                  disabled
                  readOnly
                  className="bg-zinc-100 cursor-not-allowed"
                />
              ) : (
                <>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    placeholder="0"
                    {...register("price", { valueAsNumber: true })}
                    className={errors.price ? "border-destructive" : ""}
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive">{errors.price.message}</p>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="totalQuantity">Tổng số lượng *</Label>
              <Input
                id="totalQuantity"
                type="number"
                min={0}
                placeholder="0"
                {...register("totalQuantity", { valueAsNumber: true })}
                className={errors.totalQuantity ? "border-destructive" : ""}
              />
              {errors.totalQuantity && (
                <p className="text-sm text-destructive">{errors.totalQuantity.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Input
                id="description"
                placeholder="Mô tả ngắn về loại vé"
                {...register("description")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="availableQuantity">Số lượng còn lại *</Label>
            <Input
              id="availableQuantity"
              type="number"
              min={0}
              placeholder="0"
              {...register("availableQuantity", { valueAsNumber: true })}
              className={errors.availableQuantity ? "border-destructive" : ""}
            />
            {errors.availableQuantity && (
              <p className="text-sm text-destructive">{errors.availableQuantity.message}</p>
            )}
          </div>

          {saleType === "free" ? (
            <div className="space-y-2">
              <Label htmlFor="maxTicketsPerUser">Số vé free tối đa / người *</Label>
              <Input
                id="maxTicketsPerUser"
                type="number"
                min={1}
                placeholder="1"
                {...register("maxTicketsPerUser", { valueAsNumber: true })}
                className={errors.maxTicketsPerUser ? "border-destructive" : ""}
              />
              {errors.maxTicketsPerUser && (
                <p className="text-sm text-destructive">{errors.maxTicketsPerUser.message}</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="enableMaxTicketsPerUser"
                  checked={watch("enableMaxTicketsPerUser") ?? false}
                  onCheckedChange={(checked) => {
                    setValue("enableMaxTicketsPerUser", !!checked);
                    if (!checked) setValue("maxTicketsPerUser", null);
                  }}
                />
                <Label htmlFor="enableMaxTicketsPerUser" className="cursor-pointer font-normal">
                  Giới hạn số vé mỗi người
                </Label>
              </div>
              {(watch("enableMaxTicketsPerUser") ?? false) && (
                <div className="mt-2">
                  <Input
                    id="maxTicketsPerUser"
                    type="number"
                    min={1}
                    placeholder="Ví dụ: 5"
                    {...register("maxTicketsPerUser", { valueAsNumber: true })}
                    className={errors.maxTicketsPerUser ? "border-destructive" : ""}
                  />
                  {errors.maxTicketsPerUser && (
                    <p className="text-sm text-destructive mt-1">{errors.maxTicketsPerUser.message}</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/organizer/events/${eventId}`}>
                  <ArrowLeft className="h-4 w-4" />
                  Quay lại
                </Link>
              </Button>
              <Button type="submit" disabled={update.isPending}>
                {update.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Cập nhật
              </Button>
            </div>
            <Button
              variant="outline"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa loại vé
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>

    <ConfirmModal
      open={showDeleteModal}
      onOpenChange={setShowDeleteModal}
      title="Xóa loại vé"
      description={`Bạn có chắc muốn xóa "${ticketType?.name}"?`}
      confirmLabel="Xóa"
      onConfirm={handleDelete}
      isLoading={deleteTicketType.isPending}
      variant="danger"
    />
  </>
  );
}
