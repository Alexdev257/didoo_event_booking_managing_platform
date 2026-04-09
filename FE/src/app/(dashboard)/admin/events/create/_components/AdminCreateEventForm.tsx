"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventCreateSchema, type EventCreateBody } from "@/schemas/event";
import { useEvent, useGetOrganizers, useGetCategories } from "@/hooks/useEvent";
import { useMedia } from "@/hooks/useMedia";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ImagePlus, Upload, Plus, Trash2, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type EventLocationForm = EventCreateBody["Locations"][number];

export function AdminCreateEventForm() {
  const router = useRouter();
  const { create } = useEvent();
  const { uploadImage } = useMedia();
  const { data: organizersRes } = useGetOrganizers({ pageSize: 200 });
  const { data: categoriesRes } = useGetCategories({});
  const organizers = organizersRes?.data?.items ?? [];
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
    setValue,
    setError,
    watch,
    control,
    formState: { errors },
  } = useForm<EventCreateBody>({
    resolver: zodResolver(eventCreateSchema),
    defaultValues: {
      Name: "",
      Slug: "",
      Subtitle: "",
      Description: "",
      Tags: [],
      StartTime: undefined as unknown as Date,
      EndTime: undefined as unknown as Date,
      OpenTime: "",
      ClosedTime: "",
      ThumbnailUrl: "",
      BannerUrl: "",
      TicketMapUrl: "",
      AgeRestriction: 0,
      CategoryId: "",
      OrganizerId: "",
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

  const { fields, append, remove } = useFieldArray({ control, name: "Locations" });

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
    } catch {
      // handleErrorApi in useMedia
    } finally {
      setUploadingType(null);
    }
  };

  const isUploading = !!uploadingType;

  const onSubmit = async (data: EventCreateBody) => {
    if (!data.OrganizerId) return;

    const formatTime = (time?: string) => {
      if (!time) return undefined;
      return time.length === 5 ? `${time}:00` : time;
    };

    try {
      const payload: EventCreateBody = {
        ...data,
        OrganizerId: data.OrganizerId,
        StartTime: data.StartTime instanceof Date ? data.StartTime : new Date(data.StartTime as string),
        EndTime: data.EndTime instanceof Date ? data.EndTime : new Date(data.EndTime as string),
        OpenTime: formatTime(data.OpenTime),
        ClosedTime: formatTime(data.ClosedTime),
      };
      const event = await create.mutateAsync(payload) as { id?: string };
      const eventId = event?.id;
      if (eventId) {
        router.push(`/admin/events/${eventId}/edit`);
      } else {
        router.push("/admin/events");
      }
    } catch (err) {
      handleErrorApi({ error: err, setError });
    }
  };

  if (organizers.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            Chưa có organizer nào. Vui lòng tạo organizer trước khi tạo sự kiện.
          </p>
          <Button variant="outline" className="mt-4 border-border text-foreground hover:bg-muted" asChild>
            <Link href="/admin/organizers/create">Tạo organizer</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_7fr]">
        <div className="space-y-2">
          <Label>Banner</Label>
          <div
            onClick={() => !isUploading && bannerInputRef.current?.click()}
            className={`relative flex h-[200px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/30 transition-colors ${
              isUploading ? "cursor-not-allowed opacity-70" : "hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            <input
              ref={bannerInputRef}
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
              <img src={bannerPreview} alt="Banner" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImagePlus className="h-10 w-10" />
                <span className="text-sm">Tải lên banner</span>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Thumbnail</Label>
          <div
            onClick={() => !isUploading && thumbnailInputRef.current?.click()}
            className={`relative flex h-[200px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/30 transition-colors ${
              isUploading ? "cursor-not-allowed opacity-70" : "hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            <input
              ref={thumbnailInputRef}
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
              <img src={thumbnailPreview} alt="Thumbnail" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImagePlus className="h-10 w-10" />
                <span className="text-sm">Tải lên thumbnail</span>
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
                placeholder="Ví dụ: AI Conference 2026"
                {...register("Name")}
                className={errors.Name ? "border-destructive" : ""}
              />
              {errors.Name && <p className="text-sm text-destructive">{String(errors.Name.message ?? "")}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="Slug">Slug *</Label>
              <Input
                id="Slug"
                placeholder="ai-conference-2026"
                {...register("Slug")}
                className={errors.Slug ? "border-destructive" : ""}
              />
              {errors.Slug && <p className="text-sm text-destructive">{String(errors.Slug.message ?? "")}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="Subtitle">Phụ đề</Label>
            <Input
              id="Subtitle"
              placeholder="Mô tả ngắn hiển thị bên dưới tên"
              {...register("Subtitle")}
              className={errors.Subtitle ? "border-destructive" : ""}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Organizer *</Label>
              <Select value={watch("OrganizerId")} onValueChange={(v) => setValue("OrganizerId", v)}>
                <SelectTrigger className={errors.OrganizerId ? "border-destructive" : ""}>
                  <SelectValue placeholder="Chọn organizer" />
                </SelectTrigger>
                <SelectContent>
                  {organizers.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.OrganizerId && (
                <p className="text-sm text-destructive">{String(errors.OrganizerId.message ?? "")}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Danh mục *</Label>
              <Select value={watch("CategoryId")} onValueChange={(v) => setValue("CategoryId", v)}>
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
              {errors.CategoryId && (
                <p className="text-sm text-destructive">{String(errors.CategoryId.message ?? "")}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="AgeRestriction">Độ tuổi tối thiểu </Label>
            <Input
              id="AgeRestriction"
              type="number"
              min={0}
              {...register("AgeRestriction", { valueAsNumber: true })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="StartTime">Thời gian bắt đầu *</Label>
              <Input
                id="StartTime"
                type="datetime-local"
                {...register("StartTime")}
                className={errors.StartTime ? "border-destructive" : ""}
              />
              {errors.StartTime && (
                <p className="text-sm text-destructive">{String(errors.StartTime.message ?? "")}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="EndTime">Thời gian kết thúc *</Label>
              <Input
                id="EndTime"
                type="datetime-local"
                {...register("EndTime")}
                className={errors.EndTime ? "border-destructive" : ""}
              />
              {errors.EndTime && (
                <p className="text-sm text-destructive">{String(errors.EndTime.message ?? "")}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="OpenTime">Giờ mở cửa </Label>
              <Input id="OpenTime" type="time" {...register("OpenTime")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ClosedTime">Giờ đóng cửa </Label>
              <Input id="ClosedTime" type="time" {...register("ClosedTime")} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <h2 className="text-lg font-semibold text-foreground">Mô tả & Sơ đồ ghế</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="Description">Mô tả *</Label>
            <Textarea
              id="Description"
              placeholder="Mô tả chi tiết về sự kiện"
              rows={6}
              {...register("Description")}
              className={errors.Description ? "border-destructive" : ""}
            />
            {errors.Description && (
              <p className="text-sm text-destructive">{String(errors.Description.message ?? "")}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Ảnh sơ đồ ghế </Label>
            <div
              onClick={() => !isUploading && ticketMapInputRef.current?.click()}
              className={`relative flex aspect-video w-full max-w-lg cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/30 transition-colors ${
                isUploading ? "cursor-not-allowed opacity-70" : "hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <input
                ref={ticketMapInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isUploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileUpload(f, "ticketMap");
                  e.target.value = "";
                }}
              />
              {uploadingType === "ticketMap" && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              )}
              {ticketMapPreview ? (
                <img src={ticketMapPreview} alt="Sơ đồ ghế" className="h-full w-full object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload className="h-10 w-10" />
                  <span className="text-sm">Tải lên ảnh sơ đồ ghế</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <h2 className="text-lg font-semibold text-foreground">Địa điểm *</h2>
          <p className="text-sm text-muted-foreground">Ít nhất một địa điểm</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, i) => (
            <div key={field.id} className="space-y-4 rounded-xl border border-border p-4 bg-muted/10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Địa điểm {i + 1}</span>
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
                <Label>Địa chỉ *</Label>
                <AddressAutocompleteInput
                  value={watch(`Locations.${i}.Address`)}
                  onChange={(result) => {
                    setValue(`Locations.${i}.Address`, result.address);
                    setValue(`Locations.${i}.Latitude`, result.latitude);
                    setValue(`Locations.${i}.Longitude`, result.longitude);
                    // Populate province/district/ward from Mapbox
                    if (result.province) setValue(`Locations.${i}.Province`, result.province);
                    if (result.district) setValue(`Locations.${i}.District`, result.district);
                    if (result.ward) setValue(`Locations.${i}.Ward`, result.ward);
                  }}
                  placeholder="Tìm địa chỉ (gõ để gợi ý)"
                  error={!!errors.Locations?.[i]?.Address}
                />
                {errors.Locations?.[i]?.Address && (
                  <p className="text-sm text-destructive">{String(errors.Locations[i]?.Address?.message ?? "")}</p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tỉnh/Thành phố *</Label>
                  <Input placeholder="Ví dụ: Hồ Chí Minh" {...register(`Locations.${i}.Province`)} />
                  {errors.Locations?.[i]?.Province && (
                    <p className="text-sm text-destructive">{String(errors.Locations[i]?.Province?.message ?? "")}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Quận/Huyện *</Label>
                  <Input placeholder="Ví dụ: Quận 1" {...register(`Locations.${i}.District`)} />
                  {errors.Locations?.[i]?.District && (
                    <p className="text-sm text-destructive">{String(errors.Locations[i]?.District?.message ?? "")}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Phường/Xã *</Label>
                  <Input placeholder="Ví dụ: Bến Nghé" {...register(`Locations.${i}.Ward`)} />
                  {errors.Locations?.[i]?.Ward && (
                    <p className="text-sm text-destructive">{String(errors.Locations[i]?.Ward?.message ?? "")}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Mã bưu điện </Label>
                  <Input placeholder="Ví dụ: 700000" {...register(`Locations.${i}.Zipcode`)} />
                  {errors.Locations?.[i]?.Zipcode && (
                    <p className="text-sm text-destructive">{String(errors.Locations[i]?.Zipcode?.message ?? "")}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Email liên hệ</Label>
                  <Input placeholder="contact@example.com" {...register(`Locations.${i}.ContactEmail`)} />
                </div>
                <div className="space-y-2">
                  <Label>SĐT liên hệ</Label>
                  <Input placeholder="0912345678" {...register(`Locations.${i}.ContactPhone`)} />
                </div>
              </div>
            </div>
          ))}
          {/* <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                Address: "",
                Province: "",
                District: "",
                Ward: "",
                Zipcode: "",
                Latitude: 0,
                Longitude: 0,
                ContactEmail: "",
                ContactPhone: "",
              } as EventLocationForm)
            }
          >
            <Plus className="h-4 w-4" />
            Thêm địa điểm
          </Button> */}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Hủy
        </Button>
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? "Đang tạo..." : "Tạo sự kiện"}
        </Button>
      </div>
    </form>
  );
}
