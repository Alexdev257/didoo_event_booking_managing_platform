"use client";

import { useState } from "react";
import { UsersTable } from "./UsersTable";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useUser } from "@/hooks/useAuth";
import type { User } from "@/types/auth";

export function UsersSection({
  params,
}: {
  params: Record<string, string | string[] | undefined>;
}) {
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { deleteUser } = useUser();

  const handleDelete = async () => {
    if (!userToDelete) return;
    await deleteUser.mutateAsync(userToDelete.id);
    setUserToDelete(null);
  };

  return (
    <>
      <UsersTable
        params={params}
        onDelete={(u) => setUserToDelete(u)}
      />

      <ConfirmModal
        open={!!userToDelete}
        onOpenChange={(o) => !o && setUserToDelete(null)}
        title="Xóa người dùng"
        description={`Bạn có chắc muốn xóa "${userToDelete?.fullName}"?`}
        confirmLabel="Xóa"
        onConfirm={handleDelete}
        isLoading={deleteUser.isPending}
        variant="danger"
      />
    </>
  );
}
