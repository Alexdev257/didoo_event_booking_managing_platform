"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { VerifyForgotPasswordInput, verifyForgotPasswordSchema } from "@/schemas/auth";
import { handleErrorApi } from "@/lib/errors";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ConfirmForm({ resetKey }: { resetKey?: string }) {
  const [success, setSuccess] = useState(false);
  const { verifyForgotPassword } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isValid },
  } = useForm<VerifyForgotPasswordInput>({
    resolver: zodResolver(verifyForgotPasswordSchema),
    defaultValues: {
      key: resetKey || "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: VerifyForgotPasswordInput) => {
    if (!resetKey) {
      toast.error("Link không hợp lệ. Vui lòng yêu cầu link mới.");
      return;
    }
    try {
      await verifyForgotPassword.mutateAsync(data);
      setSuccess(true);
      setTimeout(() => router.replace("/login?reset=success"), 3000);
    } catch (error) {
      handleErrorApi({ error, setError });
    }
  };

  if (!resetKey) {
    return (
      <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-xl p-8 text-center">
        <div className="h-16 w-16 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-500 mx-auto mb-6">
          <Lock className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-3">Link không hợp lệ</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Link thiếu mã bảo mật hoặc đã được sử dụng. Vui lòng yêu cầu link mới.
        </p>
        <Button asChild className="w-full h-12 rounded-xl font-semibold">
          <Link href="/forgot-password">Yêu cầu link mới</Link>
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-2 w-full max-w-5xl bg-card rounded-2xl border border-border shadow-xl overflow-hidden lg:min-h-[420px]"
    >
      <div className="p-6 sm:p-8 lg:p-10">
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Đặt lại mật khẩu</h1>
              <p className="mt-1 text-muted-foreground text-sm mb-6">Nhập mật khẩu mới bên dưới.</p>

              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <input type="hidden" {...register("key")} />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80">Mật khẩu mới</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("password")}
                      className={`h-11 rounded-xl border-border bg-muted/50 pr-11 ${errors.password ? "border-rose-300" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-rose-600">{errors.password.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80">Xác nhận mật khẩu mới</label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("confirmPassword")}
                      className={`h-11 rounded-xl border-border bg-muted/50 pr-11 ${errors.confirmPassword ? "border-rose-300" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-rose-600">{errors.confirmPassword.message}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={verifyForgotPassword.isPending || !isValid}
                  className="w-full h-12 rounded-xl font-semibold"
                >
                  {verifyForgotPassword.isPending ? (
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Đặt lại mật khẩu"
                  )}
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 mb-6">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Hoàn tất!</h2>
              <p className="text-muted-foreground text-sm mb-8 max-w-xs mx-auto">
                Mật khẩu đã được đặt lại thành công. Đăng nhập bằng mật khẩu mới.
              </p>

              <div className="space-y-3">
                <Button asChild className="w-full h-12 rounded-xl font-semibold">
                  <Link href="/login">
                    Đăng nhập ngay
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <p className="text-xs text-zinc-500">Đang chuyển đến trang đăng nhập trong 3 giây...</p>
                <button
                  type="button"
                  onClick={() => window.close()}
                  className="text-xs text-zinc-500 hover:text-zinc-700 underline"
                >
                  Đóng tab này
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="hidden lg:flex flex-col justify-center p-10 bg-zinc-900 border-l border-border/10 text-white min-h-[420px]">
        <h2 className="text-2xl font-bold leading-tight">
          Sắp xong rồi!
          <br />
          <span className="text-zinc-400">Chỉ còn một bước nữa</span>
        </h2>
        <p className="mt-4 text-zinc-400 text-sm max-w-sm leading-relaxed">
          Bạn chỉ còn một bước nữa để lấy lại tài khoản và tiếp tục hành trình.
        </p>
      </div>
    </motion.div>
  );
}
