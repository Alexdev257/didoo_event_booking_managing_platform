"use client";

import Link from "next/link";
import { CheckCircle2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TradeBookingSuccessContentProps {
  eventId: string;
}

export function TradeBookingSuccessContent({ eventId }: TradeBookingSuccessContentProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Mua vé bán lại thành công</h1>
        <p className="mt-2 text-sm text-muted-foreground font-medium">
          Giao dịch của bạn đã hoàn tất. Vé sẽ được cập nhật trong khu vực vé của tôi.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button asChild className="rounded-xl">
            <Link href="/user/dashboard/tickets">Xem vé của tôi</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href={`/resale/${eventId}`}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Quay lại vé bán lại
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
