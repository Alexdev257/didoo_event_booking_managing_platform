"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventUpdateSchema, locationSchema  } from "@/schemas/event";
import { useEvent, useGetEvent, useGetCategories } from "@/hooks/useEvent";
import { useMedia } from "@/hooks/useMedia";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { handleErrorApi } from "@/lib/errors";
import { AddressAutocompleteInput } from "@/components/AddressAutocompleteInput";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EventStatus } from "@/utils/enum";
import { z } from "zod";

const eventUpdateFormSchema = eventUpdateSchema.extend({
  Locations: z.array(locationSchema).min(1),
});

type EventUpdateFormValues = z.input<typeof eventUpdateFormSchema>;
type EventLocationForm = EventUpdateFormValues["Locations"][number];

function parseToDate(s: string | undefined): Date | undefined {
  if (!s) return undefined;
  try {
    const d = new Date(s);
    return isNaN(d.getTime()) ? undefined : d;
  } catch {
    return undefined;
  }
}

function formatTime(s: string | undefined) {
  if (!s) return "";
  return s.length >= 5 ? s.slice(0, 5) : s;
}

export function EditEventForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { update } = useEvent();
  const { uploadImage } = useMedia();
  const { data: eventRes, isLoading } = useGetEvent(eventId);
  const { data: categoriesRes } = useGetCategories({});
  const event = eventRes?.data;
  const categories = categoriesRes?.data?.items ?? [];

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const ticketMapInputRef = useRef<HTMLInputElement>(null);

  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [ticketMapPreview, setTicketMapPreview] = useState<string | null>(null);
  const [uploadingType, setUploadingType] = useState<"banner" | "thumbnail" | "ticketMap" | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    watch,
    control,
    formState: { errors },
  } = useForm<EventUpdateFormValues>({
    resolver: zodResolver(eventUpdateFormSchema),
    defaultValues: {
      Name: "",
      Slug: "",
      Subtitle: "",
      Description: "",
      Status: EventStatus.DRAFT,
      CategoryId: "",
      AgeRestriction: 0,
      StartTime: undefined as unknown as Date,
      EndTime: undefined as unknown as Date,
      OpenTime: "",
      ClosedTime: "",
      ThumbnailUrl: "",
      BannerUrl: "",
      TicketMapUrl: "",
      Locations: [
        {
          Address: "",
          Province: "",
          District: "",
          Ward: "",
          Zipcode: "",
          Latitude: 0,
          Longitude: 0,
          ContactEmail: "",
          ContactPhone: "",
        },
      ],
    },
  });

  const { fields, remove } = useFieldArray({ control, name: "Locations" });

  useEffect(() => {
    if (event) {
      const locations: EventLocationForm[] = event.locations?.length
        ? event.locations.map((loc) => ({
          Address: loc.address ?? "",
          Province: loc.province ?? "",
          District: loc.district ?? "",
          Ward: loc.ward ?? "",
          Zipcode: loc.zipcode ?? "",
          Latitude: loc.latitude ?? 0,
          Longitude: loc.longitude ?? 0,
          ContactEmail: loc.contactEmail ?? "",
          ContactPhone: loc.contactPhone ?? "",
        }))
        : [
          {
            Address: "",
            Province: "",
            District: "",
            Ward: "",
            Zipcode: "",
            Latitude: 0,
            Longitude: 0,
            ContactEmail: "",
            ContactPhone: "",
          },
        ];
      reset({
        Name: event.name,
        Slug: event.slug,
        Subtitle: event.subtitle ?? "",
        Description: event.description,
        Status: Number(event.status) as EventStatus,
        CategoryId: event.category?.id ?? (event as any).categoryId ?? "",
        AgeRestriction: event.ageRestriction ?? 0,
        StartTime: parseToDate(event.startTime),
        EndTime: parseToDate(event.endTime),
        OpenTime: formatTime(event.openTime),
        ClosedTime: formatTime(event.closedTime),
        ThumbnailUrl: event.thumbnailUrl ?? "",
        BannerUrl: event.bannerUrl ?? "",
        TicketMapUrl: event.ticketMapUrl ?? "",
        Locations: locations,
      });
      if (event.bannerUrl) setBannerPreview(event.bannerUrl);
      if (event.thumbnailUrl) setThumbnailPreview(event.thumbnailUrl);
      if (event.ticketMapUrl) setTicketMapPreview(event.ticketMapUrl);
    }
  }, [event, reset]);

  const handleFileUpload = async (
    file: File,
    type: "banner" | "thumbnail" | "ticketMap"
  ) => {
    if (!file.type.startsWith("image/")) return;
    if (uploadingType || uploadImage.isPending) return;
    setUploadingType(type);
    try {
      const result = await uploadImage.mutateAsync(file);
      const url = (result as { secure_url: string }).secure_url;
      if (type === "banner") {
        setValue("BannerUrl", url);
        setBannerPreview(URL.createObjectURL(file));
      } else if (type === "thumbnail") {
        setValue("ThumbnailUrl", url);
        setThumbnailPreview(URL.createObjectURL(file));
      } else {
        setValue("TicketMapUrl", url);
        setTicketMapPreview(URL.createObjectURL(file));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingType(null);
    }
  };

  const isUploading = !!uploadingType;

  const onSubmit = async (data: EventUpdateFormValues) => {
    const formatTimeToString = (time?: string) => {
      if (!time) return undefined;
      return time.length === 5 ? `${time}:00` : time;
    };
    try {
      const payload = {
        Name: data.Name,
        Slug: data.Slug,
        Subtitle: data.Subtitle,
        Description: data.Description,
        Status: data.Status,
        StartTime: data.StartTime ? new Date(data.StartTime as any).toISOString() : undefined,
        EndTime: data.EndTime ? new Date(data.EndTime as any).toISOString() : undefined,
        OpenTime: formatTimeToString(data.OpenTime),
        ClosedTime: formatTimeToString(data.ClosedTime),
        ThumbnailUrl: data.ThumbnailUrl,
        BannerUrl: data.BannerUrl,
        TicketMapUrl: data.TicketMapUrl,
        AgeRestriction: data.AgeRestriction,
        CategoryId: data.CategoryId,
        OrganizerId: event?.organizer?.id ?? (event as any).organizerId,
        Locations: data.Locations,
      };
      await update.mutateAsync({ id: eventId, body: payload });
      router.push("/admin/events");
    } catch (err) {
      handleErrorApi({ error: err, setError });
    }
  };

  if (isLoading || !event) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Thumbnail (trái), Banner (phải) - giữ nguyên format design */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_7fr]">
        <div className="space-y-2">
          <Label>Ảnh đại diện</Label>
          <div
            onClick={() => !isUploading && thumbnailInputRef.current?.click()}
            className={`relative flex h-[200px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/30 transition-colors ${isUploading ? "cursor-not-allowed opacity-70" : "hover:border-primary/50 hover:bg-muted/50"
              }`}
          >
            <input
              ref={thumbnailInputRef}
              name="thumbnail"
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isUploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileUpload(f, "thumbnail");
                e.target.value = "";
              }}
            />
            {uploadingType === "thumbnail" && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            )}
            {thumbnailPreview ? (
              <img src={thumbnailPreview} alt="Ảnh đại diện" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImagePlus className="h-10 w-10" />
                <span className="text-sm">Tải lên ảnh đại diện</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Ảnh bìa</Label>
          <div
            onClick={() => !isUploading && bannerInputRef.current?.click()}
            className={`relative flex h-[200px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/30 transition-colors ${isUploading ? "cursor-not-allowed opacity-70" : "hover:border-primary/50 hover:bg-muted/50"
              }`}
          >
            <input
              ref={bannerInputRef}
              name="banner"
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isUploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileUpload(f, "banner");
                e.target.value = "";
              }}
            />
            {uploadingType === "banner" && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            )}
            {bannerPreview ? (
              <img src={bannerPreview} alt="Ảnh bìa" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImagePlus className="h-10 w-10" />
                <span className="text-sm">Tải lên ảnh bìa</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <h2 className="text-lg font-semibold text-foreground">Thông tin cơ bản</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="Name">Tên sự kiện *</Label>
              <Input
                id="Name"
                {...register("Name")}
                className={errors.Name ? "border-destructive" : ""}
              />
              {errors.Name && <p className="text-sm text-destructive">{errors.Name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="Slug">Slug *</Label>
              <Input
                id="Slug"
                {...register("Slug")}
                className={errors.Slug ? "border-destructive" : ""}
              />
              {errors.Slug && <p className="text-sm text-destructive">{errors.Slug.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="Subtitle">Phụ đề</Label>
            <Input id="Subtitle" {...register("Subtitle")} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Organizer *</Label>
              <Input
                value={event.organizer?.name ?? ""}
                readOnly
                disabled
                className="bg-muted cursor-not-allowed border-border text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label>Danh mục *</Label>
              <Select value={watch("CategoryId") || undefined} onValueChange={(v) => setValue("CategoryId", v)}>
                <SelectTrigger className={errors.CategoryId ? "border-destructive" : ""}>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Ngày bắt đầu *</Label>
              <DatePicker
                value={((): Date | undefined => {
                  const v = watch("StartTime");
                  if (v instanceof Date) return v;
                  return v ? parseToDate(String(v)) : undefined;
                })()}
                onChange={(d) => setValue("StartTime", d as Date)}
                placeholder="Chọn ngày bắt đầu"
                error={!!errors.StartTime}
              />
              {errors.StartTime && (
                <p className="text-sm text-destructive">{String(errors.StartTime.message ?? "")}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Ngày kết thúc *</Label>
              <DatePicker
                value={((): Date | undefined => {
                  const v = watch("EndTime");
                  if (v instanceof Date) return v;
                  return v ? parseToDate(String(v)) : undefined;
                })()}
                onChange={(d) => setValue("EndTime", d as Date)}
                placeholder="Chọn ngày kết thúc"
                error={!!errors.EndTime}
              />
              {errors.EndTime && (
                <p className="text-sm text-destructive">{String(errors.EndTime.message ?? "")}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Giờ mở cửa</Label>
              <TimePicker
                value={watch("OpenTime") || ""}
                onChange={(v) => setValue("OpenTime", v)}
                placeholder="HH:mm"
              />
            </div>
            <div className="space-y-2">
              <Label>Giờ đóng cửa</Label>
              <TimePicker
                value={watch("ClosedTime") || ""}
                onChange={(v) => setValue("ClosedTime", v)}
                placeholder="HH:mm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/events">Hủy</Link>
        </Button>
        <Button type="submit" disabled={update.isPending || isUploading}>
          {update.isPending ? "Đang cập nhật..." : "Cập nhật"}
        </Button>
      </div>
    </form>
  );
}