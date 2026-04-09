import { Suspense } from "react";
import Header from "@/components/layout/Header";

export default function MapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full overflow-hidden bg-background">
      <Header />

      <div className="h-full">
        <Suspense fallback={<div className="h-full w-full flex items-center justify-center bg-muted/30" />}>
          {children}
        </Suspense>
      </div>
    </div>
  );
}
