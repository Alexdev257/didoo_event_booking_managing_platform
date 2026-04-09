"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Rocket, Calendar, Users, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetMe } from "@/hooks/useAuth";

const benefits = [
  {
    icon: Calendar,
    title: "Tổ chức sự kiện",
    desc: "Đăng tải và quản lý sự kiện của bạn dễ dàng",
  },
  {
    icon: Users,
    title: "Kết nối khán giả",
    desc: "Tiếp cận hàng nghìn người tham gia tiềm năng",
  },
  {
    icon: BarChart3,
    title: "Theo dõi doanh thu",
    desc: "Dashboard quản lý vé và doanh thu trực quan",
  },
];

export default function BecomeOrganizerSection() {
  const { data: meRes } = useGetMe();
  const user = meRes?.data;
  const isUserRole = (user?.role?.name || "").toLowerCase() === "user";
  const canBecomeOrganizer = user && isUserRole && !user.organizerId;
  const isOrganizer = !!user?.organizerId;

  return (
    <section className="py-20 lg:py-28 bg-zinc-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm mb-4">
            <Rocket className="w-4 h-4" />
            Dành cho nhà tổ chức
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Trở thành Organizer
          </h2>
          <p className="mt-4 text-zinc-400 max-w-2xl mx-auto text-lg">
            Đăng ký tài khoản Organizer để tổ chức sự kiện, bán vé và kết nối với khán giả.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14"
        >
          {benefits.map((item, idx) => (
            <motion.div
              key={item.title}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
              }}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-zinc-800/50 border border-zinc-700/50"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-zinc-400">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {!user ? (
            <Button asChild size="lg" className="h-14 px-8 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-white">
              <Link href={`/login?redirect=${encodeURIComponent("/user/dashboard/organizer/create")}`}>
                Đăng nhập để đăng ký
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          ) : isOrganizer ? (
            <Button asChild size="lg"  className="h-14 px-8 rounded-xl font-semibold border-zinc-600 text-white hover:bg-zinc-800">
              <Link href="/organizer/dashboard">
                Vào Dashboard Organizer
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          ) : canBecomeOrganizer ? (
            <Button asChild size="lg" className="h-14 px-8 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-white">
              <Link href="/user/dashboard/organizer/create">
                <Rocket className="mr-2 h-5 w-5" />
                Đăng ký Organizer ngay
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg" variant="outline" className="h-14 px-8 rounded-xl font-semibold border-zinc-600 text-white hover:bg-zinc-800">
              <Link href="/user/dashboard/profile">
                Xem hồ sơ của tôi
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          )}
        </motion.div>
      </div>
    </section>
  );
}
