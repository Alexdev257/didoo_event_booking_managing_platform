import Link from "next/link";
import { SectionHeader } from "@/components/base/SectionHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CreateUserForm } from "./_components/CreateUserForm";
import { KEY } from "@/utils/constant";

export default function AdminCreateUserPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <SectionHeader
          title="Tạo người dùng"
          subtitle="Thêm tài khoản người dùng mới"
          refetchQueryKeys={[KEY.users]}
        />
      </div>

      <CreateUserForm />
    </div>
  );
}
