"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { AdminPageProvider } from "@/contexts/AdminPageContext";
import { StaffAuthProvider, useStaffAuth } from "@/context/AuthContext";
import { ShieldCheck, Loader2 } from "lucide-react";

function AdminContentWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useStaffAuth();
  const isLoginPage = pathname === "/admin/login";

  // Role-based route redirection for Technician and Branch Admin
  useEffect(() => {
    if (!isLoading && isAuthenticated && user && user.userType === "STAFF") {
      const roleName = user.role?.name?.toLowerCase() || "";
      const isTech = roleName.includes("technician");

      if (isTech) {
        if (pathname === "/admin") {
          router.replace("/admin/technician");
        } else if (
          pathname.startsWith("/admin/customers") ||
          pathname.startsWith("/admin/orders") ||
          pathname.startsWith("/admin/business-settings") ||
          pathname.startsWith("/admin/cms") ||
          pathname.startsWith("/admin/reports") ||
          pathname.startsWith("/admin/accounting")
        ) {
          router.replace("/admin/technician");
        }
      } else if (user.role?.scope === "OWN_BRANCH" || roleName.includes("branch")) {
        // Branch Admin barred from global business settings & CMS
        if (
          pathname.startsWith("/admin/business-settings") ||
          pathname.startsWith("/admin/cms") ||
          pathname.startsWith("/admin/3rd-party")
        ) {
          router.replace("/admin");
        }
      }
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  // If on login page, render children cleanly without dashboard chrome
  if (isLoginPage) {
    return <>{children}</>;
  }

  // If still verifying staff session, show clean isolated loader (NO dashboard chrome)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl animate-pulse">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Verifying Staff Credentials...</span>
        </div>
      </div>
    );
  }

  // If unauthenticated or not staff, redirect to login cleanly
  if (!isAuthenticated || !user || user.userType !== "STAFF") {
    if (typeof window !== "undefined") {
      router.replace("/admin/login");
    }
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <p className="text-slate-400 text-sm">Redirecting to Staff Login Portal...</p>
      </div>
    );
  }

  // Authenticated staff user: render full ERP shell
  return (
    <AdminPageProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block h-full">
          <AdminSidebar />
        </div>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AdminTopbar />

          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </AdminPageProvider>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <StaffAuthProvider>
      <AdminContentWrapper>{children}</AdminContentWrapper>
    </StaffAuthProvider>
  );
}

