"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { organizerUpdateSchema, type OrganizerUpdateBody } from "@/schemas/event";
import { useOrganizer, useGetOrganizer } from "@/hooks/useEvent";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { handleErrorApi } from "@/lib/errors";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export function EditOrganizerForm({ id }: { id: string }) {
  const router = useRouter();
  const { update } = useOrganizer();
  const { data: organizerRes, isLoading } = useGetOrganizer(id);
  const organizer = organizerRes?.data;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<OrganizerUpdateBody>({
    resolver: zodResolver(organizerUpdateSchema),
    defaultValues: {
      Name: "",
      Slug: "",
      Description: "",
      Email: "",
      Phone: "",
      Address: "",
    },
  });

  useEffect(() => {
    if (organizer) {
      reset({
        Name: organizer.name,
        Slug: organizer.slug,
        Description: organizer.description ?? "",
        Email: organizer.email,
        Phone: organizer.phone ?? "",
        Address: organizer.address ?? "",
      });
    }
  }, [organizer, reset]);

  const onSubmit = async (data: OrganizerUpdateBody) => {
    try {
      await update.mutateAsync({ id, body: data });
      router.push("/admin/organizers");
    } catch (err) {
      handleErrorApi({ error: err, setError });
    }
  };

  if (isLoading || !organizer) {
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
        <h2 className="text-lg font-semibold text-foreground">Thông tin organizer</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="Name">Tên</Label>
              <Input
                id="Name"
                {...register("Name")}
                className={errors.Name ? "border-destructive" : ""}
              />
              {errors.Name && (
                <p className="text-sm text-destructive">{errors.Name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="Slug">Slug</Label>
              <Input
                id="Slug"
                {...register("Slug")}
                className={errors.Slug ? "border-destructive" : ""}
              />
              {errors.Slug && (
                <p className="text-sm text-destructive">{errors.Slug.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="Email">Email</Label>
              <Input
                id="Email"
                type="email"
                {...register("Email")}
                className={errors.Email ? "border-destructive" : ""}
              />
              {errors.Email && (
                <p className="text-sm text-destructive">{errors.Email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="Phone">Số điện thoại</Label>
              <Input
                id="Phone"
                {...register("Phone")}
                className={errors.Phone ? "border-destructive" : ""}
              />
              {errors.Phone && (
                <p className="text-sm text-destructive">{errors.Phone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="Description">Mô tả</Label>
            <Textarea
              id="Description"
              {...register("Description")}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="Address">Địa chỉ</Label>
            <Input id="Address" {...register("Address")} />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/organizers">Hủy</Link>
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
