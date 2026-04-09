"use client";

import { Mail, Phone, Globe } from "lucide-react";

interface OrganizerContactInfoProps {
  email?: string;
  phone?: string;
  websiteUrl?: string;
}

export function OrganizerContactInfo({
  email,
  phone,
  websiteUrl,
}: OrganizerContactInfoProps) {
  const hasAny = email || phone || websiteUrl;

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-bold text-foreground">Thông tin liên hệ</h2>
      <div className="mt-4 space-y-3">
        {email && (
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-3 text-sm text-muted-foreground font-medium hover:text-primary transition-colors"
          >
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground/70" />
            {email}
          </a>
        )}
        {phone && (
          <a
            href={`tel:${phone}`}
            className="flex items-center gap-3 text-sm text-muted-foreground font-medium hover:text-primary transition-colors"
          >
            <Phone className="h-4 w-4 shrink-0 text-muted-foreground/70" />
            {phone}
          </a>
        )}
        {websiteUrl && (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-muted-foreground font-medium hover:text-primary transition-colors"
          >
            <Globe className="h-4 w-4 shrink-0 text-muted-foreground/70" />
            {websiteUrl.replace(/^https?:\/\//, "")}
          </a>
        )}
        {!hasAny && (
          <p className="text-sm text-muted-foreground/60 font-medium">Chưa có thông tin liên hệ</p>
        )}
      </div>
    </section>
  );
}
