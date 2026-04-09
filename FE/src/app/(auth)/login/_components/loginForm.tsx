"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/schemas/auth";
import { useAuth } from "@/hooks/useAuth";
import { useAuthContext } from "@/contexts/authContext";
import { GoogleLogin } from "@react-oauth/google";
import { useState, useEffect } from "react";
import { useLocationContext } from "@/contexts/locationContext";
import { useSearchParams } from "next/navigation";
import { handleErrorApi } from "@/lib/errors";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginForm() {
  const { login, loginGoogle } = useAuth();
  const { setTokenFromContext } = useAuthContext();
  const { location } = useLocationContext();
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    setError: setErrorForm,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      location: { latitude: 0, longitude: 0, address: "" },
    },
  });

  useEffect(() => {
    if (location) {
      setValue("location", {
        latitude: location.latitude,
        longitude: location.longitude,
        address: "",
      });
    }
  }, [location, setValue]);

  const onSubmit = async (data: LoginInput) => {
    if (login.isPending) return;
    setError(null);
    try {
      await login.mutateAsync(data);
    } catch (err: any) {
      handleErrorApi({ error: err, setError: setErrorForm });
      setError(err?.message || "Đăng nhập thất bại.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-2 w-full max-w-5xl bg-card rounded-2xl border border-border shadow-xl overflow-hidden lg:min-h-[480px]"
    >
      <div className="p-6 sm:p-8 lg:p-10">
        {/* <Link href="/home" className="inline-block mb-6 hover:opacity-80 transition-opacity">
          <Image src="/DiDoo.png" alt="DiDoo" width={48} height={48} className="rounded-xl" priority />
        </Link> */}

        <h1 className="text-2xl font-bold text-foreground">Chào mừng trở lại</h1>
        <p className="mt-1 text-muted-foreground text-sm">Nhập thông tin tài khoản để đăng nhập</p>

        {resetSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
            Đặt lại mật khẩu thành công. Vui lòng đăng nhập.
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Mật khẩu</label>
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
                {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-rose-600">{errors.password.message}</p>}
          </div>

          <div className="text-right">
            <Link href="/forgot-password" className="text-sm text-primary hover:underline font-medium">
              Quên mật khẩu?
            </Link>
          </div>

          <Button type="submit" disabled={login.isPending} className="w-full h-12 rounded-xl font-semibold">
            {login.isPending ? (
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Đăng nhập"
            )}
          </Button>
        </form>

        <div className="mt-6">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground">hoặc</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="mt-4 flex justify-center">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                if (loginGoogle.isPending) return;
                const googleToken = credentialResponse.credential
                if (!googleToken) {
                  toast.error("Không nhận được token từ Google");
                  return;
                }
                try {
                  const result = await loginGoogle.mutateAsync({
                    GoogleToken: googleToken,
                    Location: getValues("location"),
                  });
                  if (result?.accessToken && result?.refreshToken) {
                    setTokenFromContext(result.accessToken, result.refreshToken);
                  }
                } catch (err: any) {
                  handleErrorApi({ error: err, setError: setErrorForm });
                  setError(err?.message || "Đăng nhập Google thất bại.");
                }
              }}
              onError={() => toast.error("Đăng nhập Google thất bại")}
              type="standard"
              theme="outline"
              size="large"
              shape="rectangular"
              text="signin_with"
              width="100%"
            />
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Đăng ký
          </Link>
        </p>
      </div>

      <div className="hidden lg:flex flex-col justify-center p-10 bg-zinc-900 border-l border-border/10 text-white min-h-[480px]">
        <h2 className="text-2xl font-bold leading-tight">
          Khám phá sự kiện
          <br />
          <span className="text-zinc-400">cùng DiDoo</span>
        </h2>
        <p className="mt-4 text-zinc-400 text-sm max-w-sm leading-relaxed">
          Đặt vé dễ dàng, trải nghiệm tuyệt vời. Bắt đầu hành trình của bạn ngay hôm nay.
        </p>
      </div>
    </motion.div>
  );
}
