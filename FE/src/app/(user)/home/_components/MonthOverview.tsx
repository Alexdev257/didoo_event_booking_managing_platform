"use client";

import { ArrowRight } from "lucide-react";
import { Category } from "@/types/event";
import Link from "next/link";
import { motion } from "framer-motion";

interface MonthOverviewProps {
  categories: Category[];
}

export function MonthOverview({ categories }: MonthOverviewProps) {
  const topCategories = categories.slice(0, 3);

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Khám phá thêm
          </h2>
          <p className="mt-2 text-muted-foreground">Danh mục nổi bật dành cho bạn</p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {topCategories.map((category) => (
            <motion.div
              key={category.id}
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
            >
              <Link
                href={`/events?categoryId=${category.id}`}
                className="group flex h-[300px] flex-col justify-between rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg"
              >
                <span className="inline-flex w-fit rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                  Danh mục
                </span>
                <div>
                  <h3 className="line-clamp-2 text-2xl font-bold text-foreground">{category.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {category.description || "Khám phá các sự kiện nổi bật theo danh mục này."}
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Xem sự kiện
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </motion.div>
          ))}

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 24 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
          >
            <Link
              href="/events"
              className="group flex h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted p-6 text-center transition-all hover:border-primary/40 hover:bg-primary/5"
            >
              <span className="rounded-full bg-white p-4 shadow-sm">
                <ArrowRight className="h-6 w-6 text-primary" />
              </span>
              <h3 className="mt-4 text-xl font-bold text-foreground">Xem thêm</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Mở toàn bộ danh sách sự kiện và bộ lọc nâng cao.
              </p>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
