"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { userCreateSchema, type UserCreateBody } from "@/schemas/auth";
import { useUser } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { handleErrorApi } from "@/lib/errors";
import { useRouter } from "next/navigation";
import { Gender } from "@/utils/enum";

export function CreateUserForm() {
  const router = useRouter();
  const { create } = useUser();

  type UserCreateFormValues = z.input<typeof userCreateSchema>;
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<UserCreateFormValues>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      FullName: "",
      Email: "",
      Phone: "",
      Password: "",
      AvatarUrl: "",
      Gender: Gender.OTHER,
      DateOfBirth: "",
      Address: "",
      Status: 1,
      RoleName: 2,
      OrganizerId: null,
    },
  });

  const onSubmit = async (data: UserCreateFormValues) => {
    try {
      const body: UserCreateBody = userCreateSchema.parse(data);
      await create.mutateAsync(body);
      router.push("/admin/users");
    } catch (err) {
      handleErrorApi({ error: err, setError });
    }
  };

  const roleId = watch("RoleName");
  const gender = watch("Gender");

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <h2 className="text-lg font-semibold text-foreground">Thông tin người dùng</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="FullName">Họ tên *</Label>
              <Input
                id="FullName"
                {...register("FullName")}
                className={errors.FullName ? "border-destructive" : ""}
              />
              {errors.FullName && (
                <p className="text-sm text-destructive">{String(errors.FullName.message ?? "")}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="Email">Email *</Label>
              <Input
                id="Email"
                type="email"
                {...register("Email")}
                className={errors.Email ? "border-destructive" : ""}
              />
              {errors.Email && (
                <p className="text-sm text-destructive">{String(errors.Email.message ?? "")}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="Password">Mật khẩu *</Label>
              <Input
                id="Password"
                type="password"
                {...register("Password")}
                className={errors.Password ? "border-destructive" : ""}
              />
              {errors.Password && (
                <p className="text-sm text-destructive">{String(errors.Password.message ?? "")}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="Phone">Số điện thoại (optional)</Label>
              <Input id="Phone" {...register("Phone")} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Giới tính</Label>
              <Select
                value={String(gender ?? Gender.OTHER)}
                onValueChange={(v) => setValue("Gender", Number(v), { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={String(Gender.MALE)}>Nam</SelectItem>
                  <SelectItem value={String(Gender.FEMALE)}>Nữ</SelectItem>
                  <SelectItem value={String(Gender.OTHER)}>Khác</SelectItem>
                </SelectContent>
              </Select>
              {errors.Gender && (
                <p className="text-sm text-destructive">{String(errors.Gender.message ?? "")}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="DateOfBirth">Ngày sinh *</Label>
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
            <div className="space-y-2">
              <Label>Vai trò</Label>
              <Select
                value={String(roleId ?? 2)}
                onValueChange={(v) => setValue("RoleName", Number(v) as 1 | 2 | 3 | 4)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Admin</SelectItem>
                  <SelectItem value="2">Người dùng</SelectItem>
                  <SelectItem value="3">Nhà tổ chức</SelectItem>
                  <SelectItem value="4">Khách</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="Address">Địa chỉ (optional)</Label>
            <Input id="Address" {...register("Address")} />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Hủy
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Đang tạo..." : "Tạo"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
