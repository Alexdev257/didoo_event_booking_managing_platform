"use client";

import { useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useGetMe, useUser } from "@/hooks/useAuth";
import { handleErrorApi } from "@/lib/errors";
import { Gender } from "@/utils/enum";
import { UserUpdateBody, userUpdateSchema } from "@/schemas/auth";
import ChangeEmailForm from "./ChangeEmailForm";
import ChangePasswordForm from "./ChangePasswordForm";
import {
  CalendarDays,
  KeyRound,
  Loader2,
  Mail,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const profileSchema = z.object({
  FullName: z.string().optional(),
  DateOfBirth: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function parseProfileDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed;
}

function getRoleCode(roleName?: string) {
  const normalized = (roleName || "").toLowerCase();
  if (normalized === "admin") return 1;
  if (normalized === "user") return 2;
  if (normalized === "organizer") return 3;
  return 4;
}

export default function ProfileForm() {
  const { data: userData, isLoading } = useGetMe();
  const { update } = useUser();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "general";

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      FullName: "",
      DateOfBirth: "",
    },
  });

  useEffect(() => {
    if (!userData?.data) return;

    form.reset({
      FullName: userData.data.fullName || "",
      DateOfBirth: userData.data.dateOfBirth
        ? new Date(userData.data.dateOfBirth).toISOString().split("T")[0]
        : "",
    });
  }, [form, userData]);

  const user = userData?.data;

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user?.id) return;

    const body: UserUpdateBody = {
      FullName: values.FullName,
      Phone: user.phone || "",
      Gender: user.gender ?? Gender.MALE,
      DateOfBirth: values.DateOfBirth || undefined,
      Address: user.address || undefined,
      AvatarUrl: user.avatarUrl || undefined,
      Status: user.status,
      RoleName: getRoleCode(user.role?.name),
      OrganizerId: user.organizerId ?? undefined,
    };

    try {
      await update.mutateAsync({ id: user.id, body });
    } catch (error) {
      handleErrorApi({ error, setError: form.setError });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-border bg-card">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {tab === 'general' && (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-4 sm:p-8 md:p-10 bg-card flex-1">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Địa chỉ email">
                  <Input
                    value={user?.email || ""}
                    disabled
                    className="h-11 rounded-xl border-border bg-muted/50 text-muted-foreground"
                  />
                </Field>

                <Field label="Vai trò">
                  <Input
                    value={user?.role?.name || "Người dùng"}
                    disabled
                    className="h-11 rounded-xl border-border bg-muted/50 text-muted-foreground"
                  />
                </Field>

                <Field label="Họ và tên" error={form.formState.errors.FullName?.message as string | undefined}>
                  <Input
                    {...form.register("FullName")}
                    placeholder="Nhập họ và tên"
                    className="h-11 rounded-xl border-border bg-card"
                  />
                </Field>

                <Field label="Ngày sinh" error={form.formState.errors.DateOfBirth?.message as string | undefined}>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 w-full justify-start rounded-xl border-border bg-card px-3 text-left text-sm font-medium text-foreground"
                      >
                        <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                        {(() => {
                          const selectedDate = parseProfileDate(form.watch("DateOfBirth"));
                          return selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Chọn ngày sinh";
                        })()}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={parseProfileDate(form.watch("DateOfBirth"))}
                        onSelect={(date) =>
                          form.setValue("DateOfBirth", date ? format(date, "yyyy-MM-dd") : "", {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                </Field>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={update.isPending}
                  className="h-11 rounded-full px-7 font-semibold"
                >
                  {update.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Lưu thay đổi
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-4 sm:p-8 md:p-10 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-foreground">
                  Cài đặt bảo mật
                </h2>
                <p className="text-sm font-medium text-muted-foreground mt-0.5">
                  Quản lý mật khẩu và tăng cường bảo mật tài khoản.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-8 md:p-10 bg-card flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-border bg-card p-6 md:p-10 py-10 md:py-16 shadow-sm transition-all hover:border-primary/40 hover:shadow-md hover:bg-muted/50 outline-none group">
                    <div className="rounded-full bg-muted p-4 group-hover:bg-card group-hover:scale-110 transition-transform">
                      <KeyRound className="h-8 w-8 text-foreground group-hover:text-primary" />
                    </div>
                    <span className="text-lg font-bold text-foreground">Đổi mật khẩu</span>
                    <p className="text-sm font-medium text-muted-foreground text-center max-w-[200px]">Cập nhật thông tin đăng nhập an toàn.</p>
                  </button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 md:p-7">
                  <DialogTitle className="text-2xl font-bold text-foreground">Cập nhật mật khẩu</DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    Dùng mật khẩu mạnh hơn để tăng bảo mật.
                  </DialogDescription>
                  <div className="mt-5">
                    <ChangePasswordForm />
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-border bg-card p-6 md:p-10 py-10 md:py-16 shadow-sm transition-all hover:border-primary/40 hover:shadow-md hover:bg-muted/50 outline-none group">
                    <div className="rounded-full bg-muted p-4 group-hover:bg-card group-hover:scale-110 transition-transform">
                      <Mail className="h-8 w-8 text-foreground group-hover:text-primary" />
                    </div>
                    <span className="text-lg font-bold text-foreground">Đổi email</span>
                    <p className="text-sm font-medium text-muted-foreground text-center max-w-[200px]">Cập nhật email tài khoản của bạn.</p>
                  </button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 md:p-7">
                  <DialogTitle className="text-2xl font-bold text-foreground">Cập nhật email</DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    Hệ thống sẽ gửi OTP để xác nhận email mới.
                  </DialogDescription>
                  <div className="mt-5">
                    <ChangeEmailForm />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      )}
    </>
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
      <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</label>
      {children}
      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}

