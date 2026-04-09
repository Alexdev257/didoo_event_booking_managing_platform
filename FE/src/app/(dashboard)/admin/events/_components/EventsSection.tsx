"use client";

import { useState } from "react";
import { EventsTable } from "./EventsTable";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useEvent } from "@/hooks/useEvent";
import { EventStatus } from "@/utils/enum";
import type { Event } from "@/types/event";

export function EventsSection({
  params,
}: {
  params: Record<string, string | string[] | undefined>;
}) {
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const { deleteEvent, updateStatus, restore } = useEvent();

  const handleDelete = async () => {
    if (!eventToDelete) return;
    await deleteEvent.mutateAsync(eventToDelete.id);
    setEventToDelete(null);
  };

  const handleApprove = (e: Event) => {
    updateStatus.mutate({ id: e.id, status: EventStatus.PUBLISHED });
  };

  const handleReject = (e: Event) => {
    updateStatus.mutate({ id: e.id, status: EventStatus.CANCELLED });
  };

  const handleRestore = (e: Event) => {
    restore.mutate(e.id);
  };

  return (
    <>
      <EventsTable
        params={params}
        onDelete={(e) => setEventToDelete(e)}
        onApprove={handleApprove}
        onReject={handleReject}
        onRestore={handleRestore}
        isUpdatingStatus={updateStatus.isPending}
        isRestoring={restore.isPending}
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
