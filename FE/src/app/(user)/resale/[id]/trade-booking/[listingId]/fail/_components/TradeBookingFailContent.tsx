"use client";

import Link from "next/link";
import { AlertCircle, ChevronLeft, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const reasonMap: Record<string, string> = {
  "listing-unavailable": "Tin đăng không còn khả dụng hoặc đã được bán.",
  payment_failed: "Thanh toán thất bại hoặc đã bị hủy.",
};

interface TradeBookingFailContentProps {
  eventId: string;
  listingId: string;
  reasonKey: string;
}

export function TradeBookingFailContent({
  eventId,
  listingId,
  reasonKey,
}: TradeBookingFailContentProps) {
  const reasonMessage = reasonMap[reasonKey] || "Không thể hoàn tất giao dịch mua lại. Vui lòng thử lại.";

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10">
          <AlertCircle className="h-8 w-8 text-rose-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Giao dịch mua lại thất bại</h1>
        <p className="mt-2 text-sm text-muted-foreground font-medium">{reasonMessage}</p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button asChild className="rounded-xl">
            <Link href={`/resale/${eventId}/trade-booking/${listingId}/confirm`}>
              <RotateCw className="mr-1 h-4 w-4" />
              Thử lại
            </Link>
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
