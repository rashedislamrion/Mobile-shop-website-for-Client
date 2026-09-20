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
import { useStaffAuth } from "@/context/AuthContext";

const adminLoginSchema = z.object({
  identifier: z.string().min(3, "Please enter your registered email or mobile number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  roleHint: z.string().optional(),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useStaffAuth();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      identifier: "",
      password: "",
      roleHint: "auto",
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
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-primary/20 text-primary rounded-xl mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">MobileHubBD ERP</h1>
          <p className="text-slate-400 text-sm mt-1">Unified Staff & Management Access Portal</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Role Selection Dropdown (UX Convenience for Shared Devices) */}
          <div className="space-y-1.5">
            <Label htmlFor="roleHint" className="text-slate-300 text-xs font-semibold">
              Select Your Role <span className="text-slate-500 font-normal">(Device Convenience)</span>
            </Label>
            <select
              id="roleHint"
              {...register("roleHint")}
              onChange={(e) => {
                setValue("roleHint", e.target.value);
              }}
              className="w-full h-10 px-3 rounded-xl bg-slate-900/60 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="auto">Auto-detect from Account (Recommended)</option>
              <option value="admin">Global Admin</option>
              <option value="branch_admin">Branch Admin</option>
              <option value="salesperson">Salesperson / POS Operator</option>
              <option value="technician">Technician / Repair Engineer</option>
              <option value="custom">Custom Staff Role</option>
            </select>
            <p className="text-[10px] text-slate-500">
              * Authorization permissions are always determined server-side from your staff database record.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="identifier" className="text-slate-200 text-xs font-semibold">
              Email or Mobile Number
            </Label>
            <Input
              id="identifier"
              type="text"
              placeholder="staff@mobilehubbd.com or 017xxxxxxxx"
              className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-primary h-10 text-sm"
              {...register("identifier")}
            />
            {errors.identifier && <p className="text-xs text-rose-400 mt-0.5">{errors.identifier.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-slate-200 text-xs font-semibold">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-primary pr-10 h-10 text-sm"
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
            {errors.password && <p className="text-xs text-rose-400 mt-0.5">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full h-11 text-sm font-bold mt-2" disabled={isSubmitting}>
            {isSubmitting ? "Authenticating..." : "Sign In to ERP Portal"}
          </Button>
        </form>
      </div>
    </div>
  );
}
