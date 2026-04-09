"use client";

import { useRef } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Facebook, Globe, ImageIcon, Instagram, Loader2, Music2, Plus, SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMedia } from "@/hooks/useMedia";
import { useOrganizer } from "@/hooks/useEvent";
import { OrganizerCreateBody, organizerCreateSchema } from "@/schemas/event";
import { OrganizerStatus } from "@/utils/enum";
import { handleErrorApi } from "@/lib/errors";
import { useSessionStore } from "@/stores/sesionStore";

export default function BecomeOrganizerForm({ onSuccess }: { onSuccess?: () => void }) {
  const { create } = useOrganizer();
  const { uploadImage } = useMedia();
  const userId = useSessionStore((state) => state.user?.UserId ?? "");

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<OrganizerCreateBody>({
    resolver: zodResolver(organizerCreateSchema),
    mode: "onTouched",
    defaultValues: {
      Name: "",
      Slug: "",
      Description: "",
      Email: "",
      Phone: "",
      Address: "",
      WebsiteUrl: "",
      FacebookUrl: "",
      InstagramUrl: "",
      TiktokUrl: "",
      LogoUrl: "",
      BannerUrl: "",
      UserId: userId,
      IsVerified: false,
      HasSendEmail: true,
      Status: OrganizerStatus.PENDING,
    },
  });

  const logoUrl = useWatch({ control: form.control, name: "LogoUrl" });
  const bannerUrl = useWatch({ control: form.control, name: "BannerUrl" });

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    field: "LogoUrl" | "BannerUrl",
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await uploadImage.mutateAsync(file);
    form.setValue(field, result.secure_url, { shouldValidate: true });
  };

  const onSubmit = async (values: OrganizerCreateBody) => {
    try {
      await create.mutateAsync(values);
      onSuccess?.();
    } catch (error) {
      handleErrorApi({ error, setError: form.setError });
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 p-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-4">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Logo</p>
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 transition hover:border-primary"
              >
                {logoUrl ? (
                  <Image src={logoUrl} alt="Logo preview" fill className="object-cover" />
                ) : (
                  <div className="text-zinc-400">
                    {uploadImage.isPending ? (
                      <Loader2 className="h-7 w-7 animate-spin" />
                    ) : (
                      <Plus className="h-8 w-8" />
                    )}
                  </div>
                )}
                <span className="absolute inset-x-0 bottom-0 bg-black/45 py-1 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
                  Tải logo
                </span>
              </button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleFileChange(event, "LogoUrl")}
              />
              <ErrorText message={form.formState.errors.LogoUrl?.message} />
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Ảnh bìa</p>
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="group relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 transition hover:border-primary"
              >
                {bannerUrl ? (
                  <Image src={bannerUrl} alt="Xem trước ảnh bìa" fill className="object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-zinc-400">
                    {uploadImage.isPending ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <ImageIcon className="h-6 w-6" />
                    )}
                    <span className="text-xs font-medium">Tải banner</span>
                  </div>
                )}
              </button>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleFileChange(event, "BannerUrl")}
              />
              <ErrorText message={form.formState.errors.BannerUrl?.message} />
            </div>
          </div>

          <div className="space-y-4 lg:col-span-8">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="Tên tổ chức *" error={form.formState.errors.Name?.message}>
                <Input {...form.register("Name")} placeholder="Nhập tên tổ chức" className="h-11 rounded-xl" />
              </Field>

              <Field label="Slug *" error={form.formState.errors.Slug?.message}>
                <Input {...form.register("Slug")} placeholder="organization-slug" className="h-11 rounded-xl" />
              </Field>

              <Field label="Email *" error={form.formState.errors.Email?.message}>
                <Input {...form.register("Email")} placeholder="contact@example.com" className="h-11 rounded-xl" />
              </Field>

              <Field label="Số điện thoại *" error={form.formState.errors.Phone?.message}>
                <Input {...form.register("Phone")} placeholder="0912345678" className="h-11 rounded-xl" />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="Website" error={form.formState.errors.WebsiteUrl?.message}>
                <IconInput icon={Globe} placeholder="https://your-site.com" {...form.register("WebsiteUrl")} />
              </Field>
              <Field label="Facebook" error={form.formState.errors.FacebookUrl?.message}>
                <IconInput icon={Facebook} placeholder="https://facebook.com/..." {...form.register("FacebookUrl")} />
              </Field>
              <Field label="Instagram" error={form.formState.errors.InstagramUrl?.message}>
                <IconInput icon={Instagram} placeholder="https://instagram.com/..." {...form.register("InstagramUrl")} />
              </Field>
              <Field label="TikTok" error={form.formState.errors.TiktokUrl?.message}>
                <IconInput icon={Music2} placeholder="https://tiktok.com/..." {...form.register("TiktokUrl")} />
              </Field>
            </div>

            <Field label="Mô tả" error={form.formState.errors.Description?.message}>
              <Textarea
                {...form.register("Description")}
                placeholder="Mô tả ngắn về tổ chức của bạn..."
                className="min-h-[96px] rounded-xl"
              />
            </Field>

            <Field label="Địa chỉ" error={form.formState.errors.Address?.message}>
              <Input {...form.register("Address")} placeholder="Địa chỉ văn phòng" className="h-11 rounded-xl" />
            </Field>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-4">
          <p className="text-xs text-zinc-500">Các trường có * là bắt buộc.</p>
          <Button type="submit" disabled={create.isPending} className="h-10 rounded-full px-6 font-semibold">
            {create.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <SendHorizonal className="h-4 w-4" />
                Gửi yêu cầu
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">{label}</label>
      {children}
      <ErrorText message={error} />
    </div>
  );
}

function IconInput({
  icon: Icon,
  ...props
}: React.ComponentProps<typeof Input> & { icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      <Input {...props} className={`h-11 rounded-xl pl-10 ${props.className || ""}`} />
    </div>
  );
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs font-medium text-rose-600">{message}</p>;
}
