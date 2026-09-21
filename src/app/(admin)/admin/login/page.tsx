"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Mail, Lock, ShieldCheck, LogIn } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStaffAuth } from "@/context/AuthContext";

const adminLoginSchema = z.object({
  identifier: z.string().min(3, "Please enter your registered email or mobile number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useStaffAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: AdminLoginFormValues) => {
    try {
      const res = await login(
        {
          email: data.identifier,
          emailOrPhone: data.identifier,
          password: data.password,
        },
        true,
      );
      toast.success("Welcome back! Staff login successful.");

      // Role is always resolved server-side from staff database record
      const roleName = (res?.user?.role?.name || "").toLowerCase();
      if (roleName.includes("technician")) {
        router.push("/admin/technician");
      } else {
        router.push("/admin");
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials or unauthorized staff account");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50 px-4 py-12">
      <div className="w-full max-w-[420px]">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-10">
          {/* Logo */}
          <div className="flex justify-center mb-5">
            <Image
              src="/images/logo-icon.jpeg"
              alt="Mobile Hub BD Logo"
              width={80}
              height={80}
              className="rounded-full"
              priority
            />
          </div>

          {/* Brand Name */}
          <h1 className="text-center text-2xl md:text-3xl font-black tracking-tight mb-1">
            <span className="text-primary">MOBILE</span>{" "}
            <span className="text-slate-900">HUB BD</span>
          </h1>

          {/* Welcome Text */}
          <p className="text-center text-lg text-slate-700 mt-4 mb-1">
            Welcome to <span className="font-bold text-primary">Mobile Hub BD</span>
          </p>
          <p className="text-center text-sm text-slate-500 mb-8">Login To Admin</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="identifier"
                  type="text"
                  placeholder="Email Address"
                  className="pl-11 h-12 text-sm border-slate-200 focus-visible:ring-primary bg-white"
                  {...register("identifier")}
                />
              </div>
              {errors.identifier && <p className="text-xs text-rose-500 ml-1">{errors.identifier.message}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="pl-11 pr-11 h-12 text-sm border-slate-200 focus-visible:ring-primary bg-white"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-rose-500 ml-1">{errors.password.message}</p>}
            </div>

            {/* Login Button — matches mockup: gradient green with arrow icon */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-bold bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white shadow-lg shadow-primary/25 rounded-xl gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Authenticating..."
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Login
                </>
              )}
            </Button>
          </form>

          {/* Secure Access badge */}
          <div className="flex items-center justify-center gap-2 mt-6 pt-5 border-t border-slate-100">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-sm text-slate-400 font-medium">Secure Access</span>
          </div>
        </div>
      </div>
    </div>
  );
}
