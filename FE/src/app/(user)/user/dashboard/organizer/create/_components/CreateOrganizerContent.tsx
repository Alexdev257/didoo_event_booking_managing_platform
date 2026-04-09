"use client";

import { useRouter } from "next/navigation";
import { useGetMe } from "@/hooks/useAuth";
import BecomeOrganizerForm from "./BecomeOrganizerForm";
import Loading from "@/components/loading";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";

export default function CreateOrganizerContent() {
  const router = useRouter();
  const { data: meRes, isLoading } = useGetMe();
  const user = meRes?.data;

  useEffect(() => {
    if (user?.organizerId) {
      router.replace("/user/dashboard/profile");
    }
  }, [user?.organizerId, router]);

  if (isLoading) return <Loading />;

  if (!user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <p className="text-zinc-600">Vui lòng đăng nhập để đăng ký nhà tổ chức.</p>
          <Link
            href={`/login?redirect=${encodeURIComponent("/user/dashboard/organizer/create")}`}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 font-semibold text-white hover:bg-primary/90"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  if (user.organizerId) {
    return <Loading />;
  }

  const isUserRole = (user.role?.name || "").toLowerCase() === "user";
  if (!isUserRole) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <p className="text-zinc-600">Chỉ tài khoản người dùng mới có thể đăng ký nhà tổ chức.</p>
          <Link
            href="/user/dashboard/profile"
            className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 font-semibold text-white hover:bg-primary/90"
          >
            Về hồ sơ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2 text-zinc-600 hover:text-zinc-900"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay về
        </Button>
        <h1 className="text-2xl font-bold text-zinc-900">Đăng ký nhà tổ chức</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Điền thông tin để gửi hồ sơ xét duyệt tài khoản tổ chức sự kiện.
        </p>
      </div>
      <BecomeOrganizerForm onSuccess={() => router.push("/user/dashboard/profile")} />
    </div>
  );
}
