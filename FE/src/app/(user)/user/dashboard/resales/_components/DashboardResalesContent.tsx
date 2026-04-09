"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CircleDollarSign, Receipt, ShoppingBag, Ticket } from "lucide-react";
import Loading from "@/components/loading";
import { useGetMe } from "@/hooks/useAuth";
import { useGetBookings } from "@/hooks/useBooking";
import { useGetTicketListings } from "@/hooks/useTicket";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import type { Booking } from "@/types/booking";
import { BookingTypeStatus } from "@/utils/enum";
import { ListingCard } from "./ListingCard";
import { TransactionListingCard } from "./TransactionListingCard";

function isTradePurchaseBooking(booking: Booking) {
  const bt = booking.bookingType;
  const btStr = String(bt ?? "").toLowerCase();
  return bt === BookingTypeStatus.TRADE_PURCHASE || btStr === "2" || btStr.includes("trade");
}

export default function DashboardResalesContent() {
  const { data: meRes, isLoading: isMeLoading } = useGetMe();
  const user = meRes?.data;
  const [txPage, setTxPage] = useState(1);
  const txPageSize = 8;

  const { data: listingsRes, isLoading: isListingsLoading } = useGetTicketListings(
    { sellerUserId: user?.id, pageNumber: 1, pageSize: 200, isDescending: true },
    { enabled: !!user?.id }
  );
  const { data: tradeBookingsRes, isLoading: isTradeLoading } = useGetBookings(
    user?.id
      ? {
          userId: user.id,
          bookingType: BookingTypeStatus.TRADE_PURCHASE,
          pageNumber: txPage,
          pageSize: txPageSize,
          isDescending: true,
        }
      : { pageNumber: 1, pageSize: 1 },
    { enabled: !!user?.id }
  );

  const listings = listingsRes?.data?.items ?? [];
  const tradeBookings = (tradeBookingsRes?.data?.items ?? []).filter(isTradePurchaseBooking);
  const tradeTotalPages = tradeBookingsRes?.data?.totalPages ?? 1;

  const txPages = useMemo(() => {
    const pages: number[] = [];
    const start = Math.max(1, txPage - 1);
    const end = Math.min(tradeTotalPages, txPage + 1);
    for (let i = start; i <= end; i += 1) pages.push(i);
    return pages;
  }, [txPage, tradeTotalPages]);

  if (isMeLoading || isListingsLoading || isTradeLoading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Vé bán lại của tôi</h1>
          <p className="mt-1 text-muted-foreground font-medium">
            Quản lý vé đang bán, xem lịch sử giao dịch và người mua vé của bạn.
          </p>
        </div>
        <Button asChild>
          <Link href="/user/dashboard/resales/create">Đăng vé bán lại</Link>
        </Button>
      </div>

      <Tabs defaultValue="listings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="listings">
            <Ticket className="mr-1 h-4 w-4" />
            Tất cả vé ({listings.length})
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <Receipt className="mr-1 h-4 w-4" />
            Giao dịch ({tradeBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="space-y-4">
          {listings.length === 0 ? (
            <Card className="border-dashed border-border bg-card shadow-sm">
              <CardContent className="p-10 text-center">
                <CircleDollarSign className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <p className="mt-3 text-muted-foreground font-medium">Bạn chưa đăng vé bán lại nào.</p>
                <Button asChild className="mt-4">
                  <Link href="/user/dashboard/tickets">Đi tới vé của tôi</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} sellerUserId={user?.id || ""} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-3">
          {tradeBookings.length === 0 ? (
            <Card className="border-dashed border-border bg-card shadow-sm">
              <CardContent className="p-10 text-center">
                <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <p className="mt-3 text-muted-foreground font-medium">Chưa có giao dịch bán vé nào.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4">
                {tradeBookings.map((booking: Booking) => (
                  <TransactionListingCard key={booking.id} booking={booking} />
                ))}
              </div>

              {tradeTotalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-3"
                    disabled={txPage <= 1}
                    onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                  >
                    ‹
                  </Button>
                  {txPages.map((page) => (
                    <Button
                      key={page}
                      type="button"
                      size="sm"
                      variant={page === txPage ? "default" : "outline"}
                      className="h-8 min-w-8 px-3"
                      onClick={() => setTxPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-3"
                    disabled={txPage >= tradeTotalPages}
                    onClick={() => setTxPage((p) => Math.min(tradeTotalPages, p + 1))}
                  >
                    ›
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
