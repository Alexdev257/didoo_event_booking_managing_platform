"use client";

import { Facebook, Instagram, Globe } from "lucide-react";

interface SocialItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  url?: string;
}

interface OrganizerSocialMediaProps {
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
}

export function OrganizerSocialMedia({
  facebookUrl,
  instagramUrl,
  tiktokUrl,
}: OrganizerSocialMediaProps) {
  const socials: SocialItem[] = [
    { label: "Facebook", icon: Facebook, url: facebookUrl },
    { label: "Instagram", icon: Instagram, url: instagramUrl },
    { label: "TikTok", icon: Globe, url: tiktokUrl },
  ].filter((item) => item.url);

  if (socials.length === 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-bold text-foreground">Mạng xã hội</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        {socials.map((s) => (
          <a
            key={s.label}
            href={s.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:border-primary hover:bg-primary/5 hover:text-primary"
            title={s.label}
          >
            <s.icon className="h-5 w-5" />
          </a>
        ))}
      </div>
    </section>
  );
}
