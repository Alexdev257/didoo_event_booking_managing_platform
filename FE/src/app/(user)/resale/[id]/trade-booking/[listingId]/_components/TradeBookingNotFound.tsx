"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface TradeBookingNotFoundProps {
  eventId: string;
}

export function TradeBookingNotFound({ eventId }: TradeBookingNotFoundProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <p className="text-muted-foreground">Không tìm thấy thông tin vé.</p>
        <Button asChild className="mt-4 rounded-xl">
          <Link href={`/resale/${eventId}`}>Quay lại danh sách vé</Link>
        </Button>
      </div>
    </main>
  );
}
