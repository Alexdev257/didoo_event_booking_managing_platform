"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Eye, EyeOff } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { RegisterInput, registerSchema } from "@/schemas/auth";
import { z } from "zod";
import { useState } from "react";
import { handleErrorApi } from "@/lib/errors";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuthContext } from "@/contexts/authContext";
import { format, startOfDay, subDays } from "date-fns";
import { vi } from "date-fns/locale";

const registerFormSchema = registerSchema.extend({
  otp: z.string().optional(),
});

type FormValues = z.input<typeof registerFormSchema>;

function parseDateValue(value: unknown): Date | undefined {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "string" && value) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return undefined;
}




export default function RegisterForm() {
  const { register: registerUser, verifyRegister } = useAuth();
  const { setTokenFromContext } = useAuthContext();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const {
    register: registerField,
    handleSubmit,
    setValue,
    watch,
    setError: setErrorForm,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      gender: 0,
      password: "",
      confirmPassword: "",
      otp: "",
      avatarUrl: "",
      dateOfBirth: undefined,
    },
    mode: "onChange",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const currentOtp = watch("otp");
  const currentEmail = watch("email");
  const currentPassword = watch("password");

  const onSubmit = async (data: FormValues) => {
    const registerPayload: RegisterInput = registerSchema.parse({
      ...data,
      gender: 0,
      phone: data.phone?.trim() || "",
    });

    if (step === 1) {
      if (registerUser.isPending) return;
      setError(null);
      try {
        await registerUser.mutateAsync(registerPayload);
        setStep(2);
      } catch (err: any) {
        handleErrorApi({ error: err, setError: setErrorForm });
        setError(err?.message || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.");
      }
    } else if (step === 2) {
      if (verifyRegister.isPending) return;
      setError(null);
      const submitOtp = currentOtp;
      const submitEmail = currentEmail || data.email;
      if (submitOtp && submitOtp.length === 6) {
        try {
          await verifyRegister.mutateAsync({ email: submitEmail, otp: submitOtp });
        } catch (err: any) {
          handleErrorApi({ error: err, setError: setErrorForm });
          setError(err?.message || "Xác thực thất bại.");
        }
      } else {
        setErrorForm("otp", { message: "Vui lòng nhập đủ 6 số OTP" });
      }
    }
  };

  

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-2 w-full max-w-5xl bg-card rounded-2xl border border-border shadow-xl overflow-hidden lg:min-h-[520px]"
    >
      <div
        className={`p-6 sm:p-8 lg:p-10 ${
          step === 2
            ? "flex min-h-[520px] flex-col justify-center"
            : "max-h-[90vh] overflow-y-auto"
        }`}
      >
        {/* <Link href="/home" className="inline-block mb-6 hover:opacity-80 transition-opacity">
          <Image src="/DiDoo.png" alt="DiDoo" width={48} height={48} className="rounded-xl" priority />
        </Link> */}

        <h1 className="text-2xl font-bold text-foreground">
          {step === 1 ? "Tạo tài khoản" : "Xác thực tài khoản"}
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          {step === 1
            ? "Tham gia và bắt đầu khám phá sự kiện"
            : `Mã OTP đã được gửi đến ${watch("email")}`}
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.form
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
            className={`space-y-4 ${step === 2 ? "mt-8" : "mt-6"}`}
            onSubmit={handleSubmit(onSubmit)}
          >
            {step === 1 && (
              <>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80">Họ tên</label>
                    <Input
                      placeholder="Nguyễn Văn A"
                      {...registerField("fullName")}
                      className={`h-11 rounded-xl border-border bg-muted/50 ${errors.fullName ? "border-rose-300" : ""}`}
                    />
                    {errors.fullName && <p className="text-xs text-rose-600">{errors.fullName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80">Email</label>
                    <Input
                      type="email"
                      placeholder="example@gmail.com"
                      {...registerField("email")}
                      className={`h-11 rounded-xl border-border bg-muted/50 ${errors.email ? "border-rose-300" : ""}`}
                    />
                    {errors.email && <p className="text-xs text-rose-600">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80">Ngày sinh</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={`h-11 w-full justify-start rounded-xl border-border bg-muted/50 px-3 text-left font-normal ${
                            errors.dateOfBirth ? "border-rose-300" : ""
                          }`}
                        >
                          <CalendarDays className="mr-2 h-4 w-4" />
                          {(() => {
                            const selectedDate = parseDateValue(watch("dateOfBirth"));
                            return selectedDate
                              ? format(selectedDate, "dd/MM/yyyy", { locale: vi })
                              : "Chọn ngày sinh";
                          })()}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={parseDateValue(watch("dateOfBirth"))}
                          onSelect={(date) =>
                            setValue("dateOfBirth", date, {
                              shouldValidate: true,
                              shouldDirty: true,
                            })
                          }
                          captionLayout="dropdown"
                          locale={vi}
                          disabled={{ after: subDays(startOfDay(new Date()), 1) }}
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.dateOfBirth && <p className="text-xs text-rose-600">{errors.dateOfBirth.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80">Mật khẩu</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...registerField("password")}
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
                  {currentPassword && (
                    <div className="mt-1 space-y-0.5 text-xs">
                      <p className={currentPassword.length >= 8 ? "text-emerald-600" : "text-zinc-500"}>• Tối thiểu 8 ký tự</p>
                      <p className={/[A-Z]/.test(currentPassword) ? "text-emerald-600" : "text-zinc-500"}>• Ít nhất 1 chữ hoa</p>
                      <p className={/[!@#$%^&*(),.?":{}|<>]/.test(currentPassword) ? "text-emerald-600" : "text-zinc-500"}>• Ít nhất 1 ký tự đặc biệt</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80">Xác nhận mật khẩu</label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...registerField("confirmPassword")}
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

                <Button type="submit" disabled={registerUser.isPending} className="w-full h-12 rounded-xl font-semibold">
                  {registerUser.isPending ? (
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Đăng ký"
                  )}
                </Button>
              </>
            )}

            {step === 2 && (
              <div className="flex flex-col items-center space-y-6 text-center">
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={currentOtp || ""}
                    onChange={(value) => setValue("otp", value, { shouldValidate: true })}
                  >
                    <InputOTPGroup className="gap-2">
                      <InputOTPSlot index={0} className="w-12 h-12 rounded-xl border-border text-center text-lg" />
                      <InputOTPSlot index={1} className="w-12 h-12 rounded-xl border-border text-center text-lg" />
                      <InputOTPSlot index={2} className="w-12 h-12 rounded-xl border-border text-center text-lg" />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup className="gap-2">
                      <InputOTPSlot index={3} className="w-12 h-12 rounded-xl border-border text-center text-lg" />
                      <InputOTPSlot index={4} className="w-12 h-12 rounded-xl border-border text-center text-lg" />
                      <InputOTPSlot index={5} className="w-12 h-12 rounded-xl border-border text-center text-lg" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {errors.otp && <p className="text-center text-xs text-rose-600">{errors.otp.message}</p>}

                <Button
                  type="submit"
                  disabled={verifyRegister.isPending || (currentOtp?.length || 0) !== 6}
                  className="h-12 w-full max-w-md rounded-xl font-semibold"
                >
                  {verifyRegister.isPending ? (
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Xác thực OTP"
                  )}
                </Button>

                <p className="text-sm text-zinc-600">
                  Không nhận được mã?{" "}
                  <button
                    type="button"
                    disabled={registerUser.isPending}
                    onClick={() => {
                      const { otp, ...rest } = watch();
                      const parsed = registerSchema.safeParse({
                        ...rest,
                        gender: 0,
                        phone: rest.phone?.trim() || "",
                      });
                      if (!parsed.success) {
                        setError(parsed.error.issues[0]?.message || "Thông tin đăng ký không hợp lệ.");
                        return;
                      }
                      registerUser.mutate(parsed.data);
                    }}
                    className="font-semibold text-primary hover:underline"
                  >
                    Gửi lại
                  </button>
                </p>
              </div>
            )}
          </motion.form>
        </AnimatePresence>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>

      <div className="hidden lg:flex flex-col justify-center p-10 bg-zinc-900 border-l border-border/10 text-white min-h-[520px]">
        <h2 className="text-2xl font-bold leading-tight">
          Tham gia cộng đồng
          <br />
          <span className="text-zinc-400">người yêu sự kiện</span>
        </h2>
        <p className="mt-4 text-zinc-400 text-sm max-w-sm leading-relaxed">
          Khám phá và đặt vé sự kiện yêu thích một cách dễ dàng. Bắt đầu hành trình với DiDoo ngay hôm nay.
        </p>
      </div>
    </motion.div>
  );
}
