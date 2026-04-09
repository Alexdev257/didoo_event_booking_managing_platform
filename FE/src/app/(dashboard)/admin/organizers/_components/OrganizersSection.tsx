"use client";

import { useState } from "react";
import { OrganizersTable } from "./OrganizersTable";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useOrganizer } from "@/hooks/useEvent";
import type { Organizer } from "@/types/event";

export function OrganizersSection({
  params,
}: {
  params: Record<string, string | string[] | undefined>;
}) {
  const [organizerToDelete, setOrganizerToDelete] = useState<Organizer | null>(null);
  const { deleteOrganizer, restore } = useOrganizer();

  const handleDelete = async () => {
    if (!organizerToDelete) return;
    await deleteOrganizer.mutateAsync(organizerToDelete.id);
    setOrganizerToDelete(null);
  };

  const handleRestore = (o: Organizer) => {
    restore.mutate(o.id);
  };

  return (
    <>
      <OrganizersTable
        params={params}
        onDelete={(o) => setOrganizerToDelete(o)}
        onRestore={handleRestore}
      />

      <ConfirmModal
        open={!!organizerToDelete}
        onOpenChange={(o) => !o && setOrganizerToDelete(null)}
        title="Xóa organizer"
        description={`Bạn có chắc muốn xóa "${organizerToDelete?.name}"?`}
        confirmLabel="Xóa"
        onConfirm={handleDelete}
        isLoading={deleteOrganizer.isPending}
        variant="danger"
      />
    </>
  );
}
