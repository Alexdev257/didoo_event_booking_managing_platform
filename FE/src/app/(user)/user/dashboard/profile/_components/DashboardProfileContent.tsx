"use client";

import { Suspense } from "react";
import Loading from "@/components/loading";
import ProfileSidebar from "./ProfileHeader";
import ProfileForm from "./ProfileForm";

export default function DashboardProfileContent() {
  return (
    <div className="overflow-hidden rounded-xl md:rounded-2xl border border-border bg-card shadow-lg mx-2 sm:mx-0">
      <Suspense fallback={<Loading />}>
        <ProfileSidebar />
      </Suspense>

      <div className="border-t border-border/50">
        <Suspense fallback={<Loading />}>
          <ProfileForm />
        </Suspense>
      </div>
    </div>
  );
}
