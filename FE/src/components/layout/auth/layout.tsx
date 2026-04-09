"use client";

import React from "react";

export default function LayoutAuth({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -bottom-20 -right-20 w-[480px] h-[480px] rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute top-1/2 -left-20 w-64 h-64 rounded-full bg-primary/5 blur-[80px]" />
      </div>
      <main className="relative z-10 w-full max-w-[1200px] flex items-center justify-center">
        {children}
      </main>
    </div>
  );
}