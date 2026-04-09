"use client";

interface OrganizerAboutProps {
  description?: string;
}

const DEFAULT_DESCRIPTION =
  "Nhà tổ chức sự kiện chuyên nghiệp, tạo ra những trải nghiệm đáng nhớ cho cộng đồng.";

export function OrganizerAbout({ description }: OrganizerAboutProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-bold text-foreground">Về nhà tổ chức</h2>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground font-medium">
        {description || DEFAULT_DESCRIPTION}
      </p>
    </section>
  );
}
