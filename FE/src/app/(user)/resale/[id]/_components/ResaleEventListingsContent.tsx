"use client";

import { useMemo, type SVGProps } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { 
  ChevronLeft, 
  Calendar, 
  MapPin, 
  ChevronRight,
  ShieldCheck,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BaseFilter, { FilterConfig } from "@/components/base/BaseFilter";
import type { Event } from "@/types/event";
import type { TicketListing, TicketType } from "@/types/ticket";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2000&auto=format&fit=crop";

interface ResaleEventListingsContentProps {
  eventId: string;
  event: Event;
  listings: TicketListing[];
  ticketTypes: TicketType[];
  ownedCountByTicketType: Map<string, number>;
}

type ListingWithQuantity = TicketListing & {
  quantity?: number;
  totalQuantity?: number;
};

function wouldExceedMaxTicketsPerUser(
  listing: TicketListing,
  ticketTypes: TicketType[],
  ownedCountByTicketType: Map<string, number>
): boolean {
  const tickets = listing.ticket ?? [];
  const ttById = new Map(ticketTypes.map((tt) => [tt.id, tt]));

  for (const t of tickets) {
    const ttId = t.ticketTypeId;
    if (!ttId) continue;
    const tt = ttById.get(ttId);
    const maxPerUser = tt?.maxTicketsPerUser;
    if (maxPerUser == null || Number(maxPerUser) <= 0) continue;

    const listingCountForType = tickets.filter((x) => x.ticketTypeId === ttId).length;
    const owned = ownedCountByTicketType.get(ttId) ?? 0;
    if (listingCountForType + owned > Number(maxPerUser)) return true;
  }
  return false;
}

export function ResaleEventListingsContent({
  eventId,
  event,
  listings,
  ticketTypes,
  ownedCountByTicketType,
}: ResaleEventListingsContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters: FilterConfig[] = useMemo(
    () => [
      { key: "search", label: "Tìm kiếm", type: "text", placeholder: "Khu vực, hàng hoặc ghế..." },
      {
        key: "quantity",
        label: "SỐ LƯỢNG",
        type: "select",
        options: [
          { label: "Bất kỳ", value: "all" },
          { label: "1 vé", value: "1" },
          { label: "2 vé", value: "2" },
          { label: "4 vé", value: "4" },
        ],
      },
      {
        key: "priceRange",
        label: "Khoảng giá",
        type: "numberRange",
        rangeKeys: ["fromPrice", "toPrice"],
        numberRangeVariant: "inputs",
        rangeLabels: ["Giá thấp nhất", "Giá cao nhất"],
      },
    ],
    []
  );

  const pageNumber = Math.max(1, Number(searchParams.get("pageNumber") ?? 1));
  const pageSize = 9; // Grid of 3x3

  const filteredListings = useMemo(() => {
    const search = searchParams.get("search")?.toLowerCase() ?? "";
    const quantity = searchParams.get("quantity");
    const minPrice = searchParams.get("fromPrice");
    const maxPrice = searchParams.get("toPrice");

    return listings.filter((l) => {
      const matchSearch = !search || 
        l.id.toLowerCase().includes(search) || 
        (l.description?.toLowerCase().includes(search) ?? false);
      
      const lq = l as ListingWithQuantity;
      const lQty = Number(lq.quantity ?? lq.totalQuantity ?? 0);
      const matchQuantity = !quantity || quantity === "all" || lQty === Number(quantity);
      
      const price = Number(l.askingPrice ?? 0);
      const matchMin = !minPrice || price >= Number(minPrice);
      const matchMax = !maxPrice || price <= Number(maxPrice);

      return matchSearch && matchQuantity && matchMin && matchMax;
    });
  }, [listings, searchParams]);

  const totalItems = filteredListings.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const pagedListings = filteredListings.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

  const handlePageChange = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pageNumber", String(p));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-background pb-20 pt-20">
      {/* Breadcrumbs */}
      <div className="mx-auto max-w-7xl px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/resale" className="hover:text-primary transition-colors">Vé bán lại</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-foreground">{event.name} - Vé bán lại</span>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="relative h-[280px] md:h-[320px] w-full overflow-hidden rounded-[24px] md:rounded-[32px] shadow-2xl">
          <Image
            src={event.bannerUrl || FALLBACK_IMAGE}
            alt={event.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          
          <div className="absolute bottom-10 left-10 right-10 flex items-end justify-between">
            <div className="space-y-4">
              <Badge className="bg-[#FF8A3D] hover:bg-[#FF8A3D] text-white px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider border-none">
                TRUNG TÂM BÁN LẠI CHÍNH THỨC
              </Badge>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                {event.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 md:gap-6 text-zinc-200 text-xs md:text-base">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 md:h-5 md:w-5 text-[#FF8A3D]" />
                  <span className="font-semibold">
                    {event.startTime ? new Date(event.startTime).toLocaleDateString("vi-VN", {
                      month: "short",
                      day: "numeric",
                    }) : "Sẽ cập nhật"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 md:h-5 md:w-5 text-[#FF8A3D]" />
                  <span className="font-semibold line-clamp-1">
                    {event.locations?.[0]?.name || "Địa điểm sẽ cập nhật"}
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden md:block">
              {/* <div className="backdrop-blur-md bg-white/10 border border-white/20 p-4 rounded-2xl shadow-xl min-w-[200px]">
                <p className="text-zinc-300 text-xs font-medium mb-1">Giá từ</p>
                <p className="text-white text-3xl font-bold">
                  {minPrice.toLocaleString("vi-VN")}đ
                </p>
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="mx-auto max-w-7xl px-4 mt-6 mb-10">
        <BaseFilter filters={filters} />
      </section>

      {/* Listings Section */}
      <section className="mx-auto max-w-7xl px-4 mt-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-xl font-bold text-foreground">Vé đang bán</h2>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold text-[10px] md:text-xs">
              {totalItems} kết quả
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-muted-foreground">
            <span className="hidden sm:inline">Sắp xếp:</span>
            <button className="text-foreground flex items-center gap-1 hover:text-primary transition-colors">
              Giá thấp nhất
              <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
            </button>
          </div>
        </div>

        {pagedListings.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border">
            <Info className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">Không có vé phù hợp bộ lọc đã chọn.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pagedListings.map((listing) => {
              const lq = listing as ListingWithQuantity;
              const qty = Number(listing.ticket?.length ?? lq.quantity ?? lq.totalQuantity ?? 1);
              const isVerified = true; // Mock constant based on design
              const exceedsMax = wouldExceedMaxTicketsPerUser(listing, ticketTypes, ownedCountByTicketType);

              return (
                <div key={listing.id} className="bg-card rounded-3xl border border-border p-6 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-[9px] md:text-[10px] font-bold text-muted-foreground/50 tracking-wider">
                      MÃ TIN: #{listing.id.slice(-8).toUpperCase()}
                    </div>
                    {isVerified && (
                      <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-none text-[9px] md:text-[10px] font-bold rounded-full px-2 py-0.5 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        ĐÃ XÁC MINH
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-lg md:text-xl font-black text-foreground mb-4 line-clamp-1">
                    {listing.description || "Vé bán lại cho sự kiện"}
                  </h3>
                  
                  <div className="space-y-3 mb-8 flex-1">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <Info className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">Chuyển vé điện tử qua email</span>
                    </div>
                  </div>

                  <div className="flex items-end justify-between pt-6 border-t border-border/50">
                    <div>
                    <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground/50 uppercase mb-1">Tổng cho {qty} vé</p>
                    <p className="text-xl md:text-2xl font-black text-foreground leading-none">
                      {Number(listing.askingPrice ?? 0) === 0 ? "Miễn phí" : `${Number(listing.askingPrice).toLocaleString("vi-VN")}đ`}
                    </p>
                      {exceedsMax && (
                        <p className="mt-2 text-xs font-medium text-amber-500">
                          Bạn đã đạt giới hạn vé cho loại vé này
                        </p>
                      )}
                    </div>
                    {exceedsMax ? (
                      <Button
                        disabled
                        className="bg-muted text-muted-foreground font-bold rounded-xl px-6 cursor-not-allowed min-h-[44px] min-w-[88px]"
                      >
                        Mua ngay
                      </Button>
                    ) : (
                      <Button asChild className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-4 md:px-6 h-10 md:h-11 min-w-[80px] md:min-w-[88px] text-xs md:text-sm">
                        <Link href={`/resale/${eventId}/trade-booking/${listing.id}`}>
                          Mua ngay
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Numeric Pagination */}
        {totalPages > 1 && (
          <div className="mt-16 flex justify-center">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handlePageChange(pageNumber - 1)}
                disabled={pageNumber === 1}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  // Basic pagination logic to show limited numbers
                  if (totalPages > 7) {
                    if (p > 3 && p < totalPages - 1 && Math.abs(p - pageNumber) > 1) {
                      if (p === 4 || p === totalPages - 2) return <span key={p} className="text-muted-foreground/50">...</span>;
                      return null;
                    }
                  }

                  return (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${
                        pageNumber === p 
                          ? "bg-primary text-white shadow-lg shadow-primary/20" 
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={() => handlePageChange(pageNumber + 1)}
                disabled={pageNumber === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function ChevronDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
