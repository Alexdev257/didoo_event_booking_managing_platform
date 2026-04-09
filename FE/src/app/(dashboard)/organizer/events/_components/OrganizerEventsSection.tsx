"use client";

import { useState } from "react";
import { OrganizerEventsTable } from "./OrganizerEventsTable";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useEvent } from "@/hooks/useEvent";
import type { Event } from "@/types/event";

export function OrganizerEventsSection({
  params,
  organizerId,
}: {
  params: Record<string, string | string[] | undefined>;
  organizerId: string;
}) {
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const { deleteEvent } = useEvent();

  const handleDelete = async () => {
    if (!eventToDelete) return;
    await deleteEvent.mutateAsync(eventToDelete.id);
    setEventToDelete(null);
  };

  return (
    <>
      <OrganizerEventsTable
        params={params}
        organizerId={organizerId}
        onDelete={(e) => setEventToDelete(e)}
      />

      <ConfirmModal
        open={!!eventToDelete}
        onOpenChange={(o) => !o && setEventToDelete(null)}
        title="Xóa sự kiện"
        description={`Bạn có chắc muốn xóa "${eventToDelete?.name}"?`}
        confirmLabel="Xóa"
        onConfirm={handleDelete}
        isLoading={deleteEvent.isPending}
        variant="danger"
      />
    </>
  );
}
