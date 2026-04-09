"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { userUpdateSchema, type UserUpdateBody } from "@/schemas/auth";
import { useUser, useGetUser } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { handleErrorApi } from "@/lib/errors";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Gender } from "@/utils/enum";

const editUserFormSchema = z.object({
  FullName: z.string().optional(),
  Phone: z.string().optional(),
  Address: z.string().optional(),
  Gender: z.number().int().min(0).max(2).optional(),
  DateOfBirth: z.string().optional(),
});
type EditUserFormValues = z.infer<typeof editUserFormSchema>;

export function EditUserForm({ id }: { id: string }) {
  const router = useRouter();
  const { update } = useUser();
  const { data: userRes, isLoading } = useGetUser(id);
  const user = userRes?.data;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: {
      FullName: "",
      Phone: "",
      Address: "",
      DateOfBirth: "",
      Gender: Gender.OTHER,
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        FullName: user.fullName,
        Phone: user.phone ?? "",
        Address: user.address ?? "",
        DateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split("T")[0]
          : "",
        Gender: user.gender ?? Gender.MALE,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: EditUserFormValues) => {
    try {
      const body: UserUpdateBody = userUpdateSchema.parse({
        ...data,
        DateOfBirth: data.DateOfBirth || undefined,
      });
      await update.mutateAsync({ id, body });
      router.push("/admin/users");
    } catch (err) {
      handleErrorApi({ error: err, setError });
    }
  };

  if (isLoading || !user) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <h2 className="text-lg font-semibold text-foreground">Thông tin người dùng</h2>
        <p className="text-sm text-muted-foreground">Email: {user.email}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="FullName">Họ tên</Label>
            <Input
              id="FullName"
              {...register("FullName")}
              className={errors.FullName ? "border-destructive" : ""}
            />
            {errors.FullName && (
              <p className="text-sm text-destructive">{String(errors.FullName.message ?? "")}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="Phone">Số điện thoại</Label>
              <Input id="Phone" {...register("Phone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="Address">Địa chỉ</Label>
              <Input id="Address" {...register("Address")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="Gender">Giới tính</Label>
              <select
                id="Gender"
                {...register("Gender", { valueAsNumber: true })}
                className={`h-10 w-full rounded-md border bg-muted/50 px-3 text-sm ${
                  errors.Gender ? "border-destructive text-destructive" : "border-border text-foreground"
                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
              >
                <option value={Gender.MALE} className="bg-card">Nam</option>
                <option value={Gender.FEMALE} className="bg-card">Nữ</option>
                <option value={Gender.OTHER} className="bg-card">Khác</option>
              </select>
              {errors.Gender && (
                <p className="text-sm text-destructive">{String(errors.Gender.message ?? "")}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="DateOfBirth">Ngày sinh</Label>
              <Input
                id="DateOfBirth"
                type="date"
                {...register("DateOfBirth")}
                className={errors.DateOfBirth ? "border-destructive" : ""}
              />
              {errors.DateOfBirth && (
                <p className="text-sm text-destructive">{String(errors.DateOfBirth.message ?? "")}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/users">Hủy</Link>
            </Button>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
