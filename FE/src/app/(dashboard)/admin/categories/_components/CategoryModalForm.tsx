"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categoryCreateSchema, type CategoryCreateBody } from "@/schemas/event";
import { useCategory } from "@/hooks/useEvent";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CategoryStatus } from "@/utils/enum";
import { handleErrorApi } from "@/lib/errors";

export function CategoryModalForm({
  open,
  onOpenChange,
  defaultValues,
  mode = "create",
  categoryId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Partial<CategoryCreateBody>;
  mode?: "create" | "update";
  categoryId?: string;
}) {
  const { create, update } = useCategory();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CategoryCreateBody>({
    resolver: zodResolver(categoryCreateSchema),
    defaultValues: {
      Name: "",
      Slug: "",
      Description: "",
      IconUrl: "",
      Status: CategoryStatus.ACTIVE, // Mặc định ACTIVE, không hiện UI
      ParentCategoryId: null,
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (open && defaultValues) {
      reset({
        Name: defaultValues.Name ?? "",
        Slug: defaultValues.Slug ?? "",
        Description: defaultValues.Description ?? "",
        IconUrl: defaultValues.IconUrl ?? "",
        Status: defaultValues.Status ?? CategoryStatus.ACTIVE,
        ParentCategoryId: defaultValues.ParentCategoryId ?? null,
      });
    }
  }, [open, defaultValues, reset]);

  const onSubmit = async (data: CategoryCreateBody) => {
    try {
      if (mode === "update" && categoryId) {
        await update.mutateAsync({ id: categoryId, body: data });
      } else {
        await create.mutateAsync(data);
      }
      onOpenChange(false);
      reset();
    } catch (err) {
      handleErrorApi({ error: err, setError });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <DialogHeader>
        <DialogTitle className="text-foreground">{mode === "create" ? "Tạo danh mục" : "Cập nhật danh mục"}</DialogTitle>
        <DialogDescription className="text-muted-foreground">
          {mode === "create"
            ? "Điền thông tin để tạo danh mục mới"
            : "Cập nhật thông tin danh mục"}
        </DialogDescription>
      </DialogHeader>

      <div className="max-h-[60vh] space-y-4 overflow-y-auto px-2 scrollbar-thin scrollbar-thumb-border">
        <div className="space-y-2">
          <Label htmlFor="Name">Tên danh mục *</Label>
          <Input
            id="Name"
            placeholder="Ví dụ: Âm nhạc"
            {...register("Name")}
            className={errors.Name ? "border-destructive" : "border-border"}
          />
          {errors.Name && <p className="text-sm text-destructive">{errors.Name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="Slug">Slug *</Label>
          <Input
            id="Slug"
            placeholder="am-nhac"
            {...register("Slug")}
            className={errors.Slug ? "border-destructive" : "border-border"}
          />
          {errors.Slug && <p className="text-sm text-destructive">{errors.Slug.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="Description">Mô tả </Label>
          <Textarea
            id="Description"
            placeholder="Mô tả ngắn về danh mục"
            {...register("Description")}
            rows={3}
            className={errors.Description ? "border-destructive" : "border-border"}
          />
          {errors.Description && <p className="text-sm text-destructive">{errors.Description.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="IconUrl">Link icon </Label>
          <Input
            id="IconUrl"
            type="url"
            placeholder="https://..."
            {...register("IconUrl")}
            className={errors.IconUrl ? "border-destructive" : "border-border"}
          />
          {errors.IconUrl && <p className="text-sm text-destructive">{errors.IconUrl.message}</p>}
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Hủy
        </Button>
        <Button type="submit" disabled={create.isPending || update.isPending}>
          {create.isPending || update.isPending ? "Đang xử lý..." : mode === "create" ? "Tạo" : "Cập nhật"}
        </Button>
      </DialogFooter>
    </form>
  );
}
