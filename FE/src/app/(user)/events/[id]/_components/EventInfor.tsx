"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock3,
  ShieldCheck,
  Tag,
  Users,
  Zap,
} from "lucide-react";
import { Event } from "@/types/event";
import { EventStatus } from "@/utils/enum";
import { useGetOrganizer } from "@/hooks/useEvent";
import { Button } from "@/components/ui/button";

interface EventInforProps {
  event: Event;
}

const FALLBACK_ORGANIZER_IMAGE =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop";

function getStatusLabel(status: EventStatus) {
  if (status === EventStatus.OPENED) return "Đang mở bán";
  if (status === EventStatus.PUBLISHED) return "Đã công bố";
  if (status === EventStatus.CLOSED) return "Đã đóng";
  if (status === EventStatus.CANCELLED) return "Đã hủy";
  return "Sắp diễn ra";
}

function formatDate(s: string | undefined) {
  if (!s) return "Đang cập nhật";
  return new Date(s).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function EventInfor({ event }: EventInforProps) {
  const quickInfoItems = [
    {
      label: "Danh mục",
      value: event.category?.name || "Sự kiện chung",
      icon: Tag,
    },
    {
      label: "Độ tuổi",
      value: event.ageRestriction > 0 ? `${event.ageRestriction}+` : "Mọi lứa tuổi",
      icon: Users,
    },
    {
      label: "Trạng thái",
      value: getStatusLabel(event.status),
      icon: Zap,
    },
    {
      label: "Thời gian",
      value: `${event.openTime || "Sẽ cập nhật"} - ${event.closedTime || "Sẽ cập nhật"}`,
      icon: Clock3,
    },
    {
      label: "Ngày bắt đầu",
      value: formatDate(event.startTime),
      icon: CalendarDays,
    },
    {
      label: "Ngày kết thúc",
      value: formatDate(event.endTime),
      icon: CalendarDays,
    },
  ];

  const orgId = event.organizer?.id;
  const { data: orgDataResponse } = useGetOrganizer(orgId || "");
  const organizerDetails = orgDataResponse?.data;
  const orgImage =
    organizerDetails?.bannerUrl ||
    organizerDetails?.logoUrl ||
    event.organizer?.logoUrl ||
    FALLBACK_ORGANIZER_IMAGE;

  return (
    <section className="grid gap-12 lg:grid-cols-12">
      <div className="space-y-12 lg:col-span-8">
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-sm"
        >
          <div className="absolute top-0 right-0 w-64 h-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
          <div className="relative">
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Thông tin sự kiện
            </h2>
            <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-muted-foreground">
              {event.description}
            </p>
            {event.subtitle && (
              <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
                <p className="text-sm font-medium text-foreground/90">{event.subtitle}</p>
              </div>
            )}
            {event.tags && event.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                  <span
                    key={`${tag.tagName}-${index}`}
                    className="rounded-full border border-border bg-muted/30 px-4 py-1.5 text-sm font-medium text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5"
                  >
                    #{tag.tagName}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h3 className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
            Thông tin nhanh
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickInfoItems.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 + i * 0.03 }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-primary/15 group-hover:scale-105">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                      {item.label}
                    </p>
                    <p className="mt-1.5 text-base font-semibold text-foreground leading-snug">
                      {item.value}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.article>
      </div>

      <aside className="lg:col-span-4 pl-0 lg:pl-10">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="sticky top-24"
        >
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
            Nhà tổ chức
          </p>

          <div className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-lg transition-all duration-300 hover:shadow-xl hover:border-primary/20">
            <div className="relative h-36 w-full overflow-hidden">
              <Image
                src={orgImage}
                alt={organizerDetails?.name || event.organizer?.name || "Nhà tổ chức"}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
            </div>

            <div className="relative px-6 pb-6 pt-6">
              {organizerDetails?.logoUrl && organizerDetails.logoUrl !== orgImage && (
                <div className="absolute -top-12 left-6">
                  <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-4 border-background bg-background shadow-lg">
                    <Image
                      src={organizerDetails.logoUrl}
                      alt="Logo nhà tổ chức"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              <div
                className={
                  organizerDetails?.logoUrl && organizerDetails.logoUrl !== orgImage ? "mt-6" : ""
                }
              >
                <h3 className="text-xl font-bold text-foreground line-clamp-1">
                  {organizerDetails?.name || event.organizer?.name || "Nhà tổ chức"}
                </h3>
                {organizerDetails?.isVerified && (
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Đã xác minh
                  </div>
                )}
              </div>

              <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground/90">
                {organizerDetails?.description ||
                  "Nhà tổ chức cung cấp lịch trình, địa điểm và hướng dẫn check-in. Theo dõi để nhận cập nhật sớm nhất."}
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <Button
                  asChild
                  className="h-12 w-full rounded-xl font-semibold shadow-md shadow-primary/20"
                >
                  <Link href={`/organizers/${event.organizer?.id || ""}`}>Xem trang</Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-12 w-full rounded-xl border-border font-medium hover:bg-muted"
                >
                  Theo dõi
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </aside>
    </section>
  );
}
