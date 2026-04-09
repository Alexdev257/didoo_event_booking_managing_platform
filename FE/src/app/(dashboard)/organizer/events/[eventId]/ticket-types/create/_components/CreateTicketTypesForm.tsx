"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ticketTypesBatchSchema, type TicketTypesBatchBody, TICKET_SALE_TYPES, type TicketSaleType } from "@/schemas/ticket";
import { useTicketType } from "@/hooks/useTicket";
import { useGetEvent } from "@/hooks/useEvent";
import { useGetTicketTypes } from "@/hooks/useTicket";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { handleErrorApi } from "@/lib/errors";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Check, Loader2, Pencil, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { ConfirmModal } from "@/components/ui/confirm-modal";

const SALE_TYPE_LABELS: Record<TicketSaleType, string> = { paid: "Bán vé", free: "Miễn phí" };

export function CreateTicketTypesForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [ticketTypeToDelete, setTicketTypeToDelete] = useState<{ id: string; name: string } | null>(null);
  const { createArray, deleteTicketType } = useTicketType();
  const { data: eventRes } = useGetEvent(eventId);
  const { data: ticketTypesRes } = useGetTicketTypes({ eventId });

  const event = eventRes?.data;
  const ticketTypes = ticketTypesRes?.data?.items ?? [];

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<TicketTypesBatchBody>({
    resolver: zodResolver(ticketTypesBatchSchema),
    defaultValues: {
      items: [{ saleType: "paid", name: "", price: 0, totalQuantity: 0, maxTicketsPerUser: null, description: "", enableMaxTicketsPerUser: false }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const onSubmit = async (data: TicketTypesBatchBody) => {
    try {
      const payload = {
        ticketTypes: data.items.map((item) => ({
          eventId,
          name: item.name,
          price: item.saleType === "free" ? 0 : (item.price ?? 0),
          totalQuantity: item.totalQuantity,
          availableQuantity: item.totalQuantity,
          maxTicketsPerUser: item.saleType === "free"
            ? (item.maxTicketsPerUser ?? 1)
            : (item.enableMaxTicketsPerUser ? (item.maxTicketsPerUser ?? null) : null),
          description: item.description ?? undefined,
        })),
      };
      await createArray.mutateAsync(payload);
      reset({ items: [{ saleType: "paid", name: "", price: 0, totalQuantity: 0, maxTicketsPerUser: null, description: "", enableMaxTicketsPerUser: false }] });
      router.push(`/organizer/events/${eventId}`);
    } catch (err) {
      handleErrorApi({ error: err, setError });
    }
  };


  const handleDelete = async () => {
    if (!ticketTypeToDelete) return;
    await deleteTicketType.mutateAsync(ticketTypeToDelete.id);
    setTicketTypeToDelete(null);
  };

  if (!event) {
    return (
      <Card className="border-zinc-200">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-zinc-200">
        <CardHeader>
          <h2 className="text-lg font-semibold text-zinc-900">Thêm loại vé</h2>
          <p className="text-sm text-zinc-500">
            Sự kiện: {event.name}
          </p>
        </CardHeader>
        <CardContent>
          <form
            id="ticket-types-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(onSubmit)(e);
            }}
            className="space-y-4"
          >
            {fields.map((field, i) => {
              const saleType = watch(`items.${i}.saleType`) ?? "paid";
              return (
              <div
                key={field.id}
                className="space-y-4 rounded-xl border border-zinc-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-600">
                    Loại vé {i + 1}
                  </span>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => remove(i)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Loại vé</Label>
                  <Select
                    value={saleType}
                    onValueChange={(v) => {
                      const newType = v as TicketSaleType;
                      setValue(`items.${i}.saleType`, newType);
                      if (newType === "free") {
                        setValue(`items.${i}.price`, 0);
                      }
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
                    <Label>Tên loại vé *</Label>
                    <Input
                      placeholder="Ví dụ: Vé thường, VIP"
                      {...register(`items.${i}.name`)}
                      className={errors.items?.[i]?.name ? "border-destructive" : ""}
                    />
                    {errors.items?.[i]?.name && (
                      <p className="text-sm text-destructive">
                        {errors.items[i]?.name?.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Giá (VNĐ) *</Label>
                    {saleType === "free" ? (
                      <Input
                        type="number"
                        value={0}
                        disabled
                        readOnly
                        className="bg-zinc-100 cursor-not-allowed"
                      />
                    ) : (
                      <>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          {...register(`items.${i}.price`, { valueAsNumber: true })}
                          className={errors.items?.[i]?.price ? "border-destructive" : ""}
                        />
                        {errors.items?.[i]?.price && (
                          <p className="text-sm text-destructive">
                            {errors.items[i]?.price?.message}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Tổng số lượng *</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0"
                      {...register(`items.${i}.totalQuantity`, {
                        valueAsNumber: true,
                      })}
                      className={errors.items?.[i]?.totalQuantity ? "border-destructive" : ""}
                    />
                    {errors.items?.[i]?.totalQuantity && (
                      <p className="text-sm text-destructive">
                        {errors.items[i]?.totalQuantity?.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Mô tả</Label>
                    <Input
                      placeholder="Mô tả ngắn về loại vé"
                      {...register(`items.${i}.description`)}
                    />
                  </div>
                </div>
                {saleType === "free" ? (
                  <div className="space-y-2">
                    <Label>Số vé free tối đa / người *</Label>
                    <Input
                      type="number"
                      min={1}
                      placeholder="1"
                      {...register(`items.${i}.maxTicketsPerUser`, { valueAsNumber: true })}
                      className={errors.items?.[i]?.maxTicketsPerUser ? "border-destructive" : ""}
                    />
                    {errors.items?.[i]?.maxTicketsPerUser && (
                      <p className="text-sm text-destructive">
                        {errors.items[i]?.maxTicketsPerUser?.message}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`enable-max-${i}`}
                        checked={watch(`items.${i}.enableMaxTicketsPerUser`) ?? false}
                        onCheckedChange={(checked) => {
                          setValue(`items.${i}.enableMaxTicketsPerUser`, !!checked);
                          if (!checked) setValue(`items.${i}.maxTicketsPerUser`, null);
                        }}
                      />
                      <Label htmlFor={`enable-max-${i}`} className="cursor-pointer font-normal">
                        Giới hạn số vé mỗi người
                      </Label>
                    </div>
                    {(watch(`items.${i}.enableMaxTicketsPerUser`) ?? false) && (
                      <div className="mt-2">
                        <Input
                          type="number"
                          min={1}
                          placeholder="Ví dụ: 5"
                          {...register(`items.${i}.maxTicketsPerUser`, { valueAsNumber: true })}
                          className={errors.items?.[i]?.maxTicketsPerUser ? "border-destructive" : ""}
                        />
                        {errors.items?.[i]?.maxTicketsPerUser && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.items[i]?.maxTicketsPerUser?.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
            })}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({ saleType: "paid", name: "", price: 0, totalQuantity: 0, maxTicketsPerUser: null, description: "", enableMaxTicketsPerUser: false })
                }
              >
                <Plus className="h-4 w-4" />
                Thêm loại vé
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {ticketTypes.length > 0 && (
        <Card className="border-zinc-200">
          <CardHeader>
            <h2 className="text-lg font-semibold text-zinc-900">Các loại vé đã thêm</h2>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {ticketTypes.map((tt) => (
                <li
                  key={tt.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-zinc-900">{tt.name}</p>
                    <p className="text-sm text-zinc-500">
                      {Number(tt.price ?? 0) === 0
                        ? `Miễn phí · Tối đa ${tt.maxTicketsPerUser ?? 1} vé/người · Số lượng: ${tt.totalQuantity}`
                        : `${Number(tt.price).toLocaleString("vi-VN")} VNĐ · Số lượng: ${tt.totalQuantity}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link href={`/organizer/events/${eventId}/ticket-types/${tt.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setTicketTypeToDelete({ id: tt.id, name: tt.name })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Check className="h-5 w-5 text-emerald-600" />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <ConfirmModal
        open={!!ticketTypeToDelete}
        onOpenChange={(o) => !o && setTicketTypeToDelete(null)}
        title="Xóa loại vé"
        description={`Bạn có chắc muốn xóa "${ticketTypeToDelete?.name}"?`}
        confirmLabel="Xóa"
        onConfirm={handleDelete}
        isLoading={deleteTicketType.isPending}
        variant="danger"
      />

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/organizer/events/${eventId}`)}
        >
          Bỏ qua
        </Button>
        <Button
          type="submit"
          form="ticket-types-form"
          disabled={createArray.isPending}
        >
          {createArray.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Tạo {fields.length} loại vé
        </Button>
      </div>
    </div>
  );
}
