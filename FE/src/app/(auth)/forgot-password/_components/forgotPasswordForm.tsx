"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { ForgotPasswordInput, forgotPasswordSchema } from "@/schemas/auth";
import { handleErrorApi } from "@/lib/errors";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordForm() {
  const [step, setStep] = useState(1);
  const { forgotPassword } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onChange",
  });

  const email = watch("email");

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      await forgotPassword.mutateAsync({
        ...data,
        clientUri: `${window.location.origin}/confirm`,
      });
      setStep(2);
      toast.success("Đã gửi link đặt lại mật khẩu");
    } catch (error) {
      handleErrorApi({ error, setError });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-2 w-full max-w-5xl bg-card rounded-2xl border border-border shadow-xl overflow-hidden lg:min-h-[420px]"
    >
      <div className="p-6 sm:p-8 lg:p-10">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Quay lại đăng nhập
        </Link>

        <div className="flex justify-center mb-4">
          <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            {step === 1 ? <Mail className="h-7 w-7" /> : <CheckCircle2 className="h-7 w-7" />}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground text-center">
          {step === 1 ? "Quên mật khẩu?" : "Kiểm tra email"}
        </h1>
        <p className="mt-2 text-muted-foreground text-sm text-center max-w-sm mx-auto">
          {step === 1
            ? "Nhập email và chúng tôi sẽ gửi link đặt lại mật khẩu."
            : `Đã gửi link đặt lại mật khẩu đến ${email}`}
        </p>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="mt-8 space-y-4"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Email</label>
                <Input
                  type="email"
                  placeholder="example@gmail.com"
                  {...register("email")}
                  className={`h-11 rounded-xl border-border bg-muted/50 ${errors.email ? "border-rose-300" : ""}`}
                />
                {errors.email && <p className="text-xs text-rose-600">{errors.email.message}</p>}
              </div>

              <Button
                type="submit"
                disabled={forgotPassword.isPending || !isValid}
                className="w-full h-12 rounded-xl font-semibold"
              >
                {forgotPassword.isPending ? (
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Gửi link đặt lại"
                )}
              </Button>
            </motion.form>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 space-y-6"
            >
              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Vui lòng kiểm tra hộp thư và nhấp vào link đặt lại. Link có hiệu lực 30 phút. Nếu không thấy, hãy kiểm tra thư mục spam.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="block mx-auto text-sm font-semibold text-primary hover:underline"
              >
                Không nhận được email? Thử lại
              </button>

              <Button asChild variant="outline" className="w-full h-12 rounded-xl">
                <Link href="/login">Quay lại đăng nhập</Link>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="hidden lg:flex flex-col justify-center p-10 bg-zinc-900 border-l border-border/10 text-white min-h-[420px]">
        <h2 className="text-2xl font-bold leading-tight">
          Bảo mật là ưu tiên
          <br />
          <span className="text-zinc-400">của chúng tôi</span>
        </h2>
        <p className="mt-4 text-zinc-400 text-sm max-w-sm leading-relaxed">
          Chúng tôi sử dụng mã hóa tiên tiến để đảm bảo dữ liệu của bạn an toàn khi bạn khám phá những sự kiện tuyệt vời.
        </p>
      </div>
    </motion.div>
  );
}
