import { DetailPageHeader } from "@/components/base/DetailPageHeader";
import { EditUserForm } from "./_components/EditUserForm";
import { KEY } from "@/utils/constant";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditUserPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <DetailPageHeader
        title="Chỉnh sửa người dùng"
        subtitle="Cập nhật thông tin tài khoản"
        backHref="/admin/users"
        queryKeys={[KEY.users]}
      />

      <EditUserForm id={id} />
    </div>
  );
}
