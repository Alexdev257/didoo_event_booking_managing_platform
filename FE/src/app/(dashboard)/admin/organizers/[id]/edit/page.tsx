import { DetailPageHeader } from "@/components/base/DetailPageHeader";
import { EditOrganizerForm } from "./_components/EditOrganizerForm";
import { KEY } from "@/utils/constant";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditOrganizerPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <DetailPageHeader
        title="Chỉnh sửa organizer"
        subtitle="Cập nhật thông tin tổ chức"
        backHref="/admin/organizers"
        queryKeys={[KEY.organizers]}
      />

      <EditOrganizerForm id={id} />
    </div>
  );
}
