"use client";

import { RefreshCw, LayoutGrid } from "lucide-react";

interface ResalePageHeroProps {
  totalEvents: number;
  totalCategories: number;
}

export function ResalePageHero({
  totalEvents,
  totalCategories,
}: ResalePageHeroProps) {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 bg-background/50">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 -z-10 h-64 w-64 bg-primary/5 blur-[100px] rounded-full" />
      <div className="absolute bottom-0 left-0 -z-10 h-64 w-64 bg-orange-500/5 blur-[100px] rounded-full" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 overflow-hidden">
          <div className="space-y-4 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <RefreshCw className="w-3 h-3" />
              Chợ vé Resale
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground max-w-2xl leading-[1]">
              Săn vé <span className="text-gradient">Resale</span> <br />
              Giá hời, an toàn.
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl font-medium">
              Nơi kết nối những người cần nhượng vé và người tìm vé. 
              Mọi giao dịch đều được DiDoo bảo vệ 100%.
            </p>
          </div>

          <div className="flex items-center gap-4 md:gap-6 animate-fade-in delay-200">
            <div className="text-center p-4 rounded-2xl bg-card border border-border/50 shadow-sm min-w-[100px] md:min-w-[120px]">
              <div className="text-2xl md:text-3xl font-black text-foreground">{totalEvents}</div>
              <div className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase mt-1">Sự kiện</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-card border border-border/50 shadow-sm min-w-[100px] md:min-w-[120px]">
              <div className="text-2xl md:text-3xl font-black text-foreground">{totalCategories}</div>
              <div className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase mt-1">Danh mục</div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 h-1 w-24 bg-gradient-to-r from-primary to-orange-300 rounded-full" />
      </div>
    </section>
  );
}
