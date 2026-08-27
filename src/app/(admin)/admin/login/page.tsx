"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

const adminLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "admin@novamobile.test",
      password: "",
    },
  });

  const onSubmit = async (data: AdminLoginFormValues) => {
    try {
      await login(
        {
          email: data.email,
          emailOrPhone: data.email,
          password: data.password,
        },
        true,
      );
      toast.success("Welcome back! Staff login successful.");
      router.push("/admin");
    } catch (err: any) {
      toast.error(err.message || "Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-primary/20 text-primary rounded-xl mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">NovaMobile ERP</h1>
          <p className="text-slate-400 text-sm mt-1">Staff & Management Access Portal</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200">
              Staff Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@novamobile.test"
              className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-primary"
              {...register("email")}
            />
            {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-200">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-primary pr-10"
                {...register("password")}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isSubmitting}>
            {isSubmitting ? "Authenticating..." : "Sign In to ERP"}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Demo Admin: <code className="text-primary font-mono">admin@novamobile.test / Admin@12345</code>
        </div>
      </div>
    </div>
  );
}
