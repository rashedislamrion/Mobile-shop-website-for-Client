"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";

type Breadcrumb = { label: string; href: string };

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
};

const AdminPageContext = createContext<PageContextType | undefined>(undefined);

export function AdminPageProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState("Dashboard");
  const [badge, setBadge] = useState("Website");
  const [dateFilter, setDateFilter] = useState("This Month");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);

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
      setPageInfo
    }}>
      {children}
    </AdminPageContext.Provider>
  );
}

export function useAdminPage() {
  const context = useContext(AdminPageContext);
  if (context === undefined) {
    throw new Error("useAdminPage must be used within an AdminPageProvider");
  }
  return context;
}
