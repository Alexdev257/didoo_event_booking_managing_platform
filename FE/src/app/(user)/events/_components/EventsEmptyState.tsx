"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventsEmptyStateProps {
  clearLink: string;
}

export function EventsEmptyState({ clearLink }: EventsEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-bold text-foreground">Không tìm thấy sự kiện</h2>
      <p className="mt-2 text-muted-foreground">Thử thay đổi bộ lọc hoặc từ khóa.</p>
      <Button asChild className="mt-6 rounded-xl">
        <Link href={clearLink}>Xóa bộ lọc</Link>
      </Button>
    </div>
  );
}
