"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { apiGet } from "@/lib/api-client";

type Breadcrumb = { label: string; href: string };

export interface AdminBranch {
  id: string;
  name: string;
  code?: string;
  isHeadquarters?: boolean;
}

type PageContextType = {
  title: string;
  setTitle: (title: string) => void;
  badge: string;
  setBadge: (badge: string) => void;
  dateFilter: string;
  setDateFilter: (filter: string) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (v: boolean) => void;
  breadcrumbs: Breadcrumb[];
  setBreadcrumbs: (b: Breadcrumb[]) => void;
  setPageInfo: (info: { title?: string; badge?: string; breadcrumbs?: Breadcrumb[] }) => void;
  
  // Branch filter app-wide single source of truth
  selectedBranchId: string;
  setSelectedBranchId: (id: string) => void;
  selectedBranchName: string;
  setSelectedBranchName: (name: string) => void;
  branches: AdminBranch[];
  setBranches: (branches: AdminBranch[]) => void;
  selectBranch: (id: string, name: string) => void;
};

const AdminPageContext = createContext<PageContextType | undefined>(undefined);

export function AdminPageProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState("Dashboard");
  const [badge, setBadge] = useState("Website");
  const [dateFilter, setDateFilter] = useState("This Month");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);

  // Branch state
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [selectedBranchName, setSelectedBranchName] = useState<string>("All Branches");
  const [branches, setBranches] = useState<AdminBranch[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedBranchId = localStorage.getItem("admin_selected_branch_id") || "";
      const savedBranchName = localStorage.getItem("admin_selected_branch_name") || "All Branches";
      setSelectedBranchId(savedBranchId);
      setSelectedBranchName(savedBranchName);
    }
  }, []);

  useEffect(() => {
    apiGet<AdminBranch[]>("/branches/public")
      .then((res) => {
        if (Array.isArray(res)) {
          setBranches(res);
        }
      })
      .catch(() => {});
  }, []);

  const selectBranch = useCallback((id: string, name: string) => {
    setSelectedBranchId(id);
    setSelectedBranchName(name);
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_selected_branch_id", id);
      localStorage.setItem("admin_selected_branch_name", name);
    }
  }, []);

  const setPageInfo = useCallback((info: { title?: string; badge?: string; breadcrumbs?: Breadcrumb[] }) => {
    if (info.title) setTitle(info.title);
    if (info.badge !== undefined) setBadge(info.badge);
    if (info.breadcrumbs) setBreadcrumbs(info.breadcrumbs);
  }, []);

  return (
    <AdminPageContext.Provider value={{
      title, setTitle,
      badge, setBadge,
      dateFilter, setDateFilter,
      isSidebarCollapsed, setIsSidebarCollapsed,
      isMobileSidebarOpen, setIsMobileSidebarOpen,
      breadcrumbs, setBreadcrumbs,
      setPageInfo,
      selectedBranchId, setSelectedBranchId,
      selectedBranchName, setSelectedBranchName,
      branches, setBranches,
      selectBranch,
    }}>
      {children}
    </AdminPageContext.Provider>
  );
}

const defaultPageContext: PageContextType = {
  title: "Dashboard",
  setTitle: () => {},
  badge: "Website",
  setBadge: () => {},
  dateFilter: "This Month",
  setDateFilter: () => {},
  isSidebarCollapsed: false,
  setIsSidebarCollapsed: () => {},
  isMobileSidebarOpen: false,
  setIsMobileSidebarOpen: () => {},
  breadcrumbs: [],
  setBreadcrumbs: () => {},
  setPageInfo: () => {},
};

export function useAdminPage() {
  const context = useContext(AdminPageContext);
  return context || defaultPageContext;
}
