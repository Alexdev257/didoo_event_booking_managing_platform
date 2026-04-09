"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Image from "next/image";

import Link from "next/link";
import { Category } from "@/types/event";

interface AboutSectionProps {
  categories: Category[];
}

export function AboutSection({ categories }: AboutSectionProps) {
  return (
    <section className="relative py-20 lg:py-28 bg-zinc-900 text-white overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 z-0" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 max-w-xl"
          >
            <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm mb-4">
              <Sparkles className="w-4 h-4" />
              Trải nghiệm
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Nơi ý tưởng
              <br />
              <span className="text-zinc-400">được hiện thực hóa</span>
            </h2>
            <p className="text-lg text-zinc-300 leading-relaxed mb-8">
              Chúng tôi không chỉ liệt kê sự kiện — chúng tôi tuyển chọn những khoảnh khắc đáng nhớ.
              Từ workshop đến hội nghị quốc tế, kết nối đam mê với cơ hội.
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/events?categoryId=${cat.id}`}
                  className="px-4 py-2 rounded-full border border-zinc-600 bg-zinc-800/50 text-sm font-medium text-zinc-300 hover:text-white hover:border-primary transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex-1 relative"
          >
            <div className="relative h-[400px] lg:h-[500px] w-full rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700">
              <Image
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200"
                alt="Event Experience"
                fill
                className="object-cover opacity-70"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-xl">
                  <svg
                    className="w-10 h-10 text-white ml-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-4 bg-white text-zinc-900 p-6 rounded-2xl shadow-xl max-w-[200px]">
              <p className="text-3xl font-bold">500+</p>
              <p className="text-sm font-medium text-zinc-500">Sự kiện mỗi năm</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
