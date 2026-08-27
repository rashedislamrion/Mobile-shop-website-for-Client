"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { FilterBar } from "@/components/admin/FilterBar";
import { DataTable, ActionDropdown } from "@/components/admin/DataTable";
import { ReportExportButtons } from "@/components/admin/ReportExportButtons";
import { FilterConfig, TableAction } from "@/types/table";
import { ColumnDef } from "@tanstack/react-table";
import { Users2, AlertCircle, TrendingDown, Eye, Banknote } from "lucide-react";
import { toast } from "sonner";
import { apiGet } from "@/lib/api-client";
import { useRouter } from "next/navigation";

interface SupplierDueItem {
  id: string;
  supplierName: string;
  contactPerson: string | null;
  phone: string;
  email: string | null;
  totalOrders: number;
  totalPurchases: number;
  totalPaid: number;
  totalDue: number;
  lastPurchaseDate: string | null;
}

export default function SupplierDueReport() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [data, setData] = useState<SupplierDueItem[]>([]);
  const [summary, setSummary] = useState({ totalDue: 0, suppliersWithDueCount: 0, highDueCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const router = useRouter();

  useEffect(() => {
    setTitle("Supplier Due Report");
    setBadge("Website");
    setDateFilter(""); 
  }, [setTitle, setBadge, setDateFilter]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: Record<string, any> = {};

      if (filters.dueRange) params.dueRange = filters.dueRange;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await apiGet<{
        supplierDues: SupplierDueItem[];
        summary: { totalDue: number; suppliersWithDueCount: number; highDueCount: number };
      }>("/reports/supplier-due", params);

      setData(res?.supplierDues || []);
      if (res?.summary) setSummary(res.summary);
    } catch (err: any) {
      toast.error(err.message || "Failed to load supplier due report");
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filterConfigs: FilterConfig[] = [
    {
      type: "select",
      label: "Due Range",
      key: "dueRange",
      options: [
        { label: "All", value: "all" },
        { label: "৳0 - ৳50,000", value: "0-50000" },
        { label: "৳50,001 - ৳200,000", value: "50000-200000" },
        { label: "৳200,000+", value: "200000+" },
      ],
    },
  ];

  const createActions = (row: SupplierDueItem): TableAction[] => [
    {
      label: "View Supplier Profile",
      icon: <Eye className="w-4 h-4" />,
      onClick: () => router.push(`/admin/accounting/suppliers/${row.id}`),
    },
    {
      label: "Disburse Payment",
      icon: <Banknote className="w-4 h-4 text-emerald-600" />,
      onClick: () => router.push(`/admin/accounting/suppliers/payments?supplierId=${row.id}`),
    },
  ];

  const columns: ColumnDef<SupplierDueItem>[] = [
    {
      accessorKey: "supplierName",
      header: "Supplier / Vendor",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-100">
            {row.original.supplierName.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-slate-800 leading-tight">
              {row.original.supplierName}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {row.original.contactPerson || row.original.phone}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "totalOrders",
      header: "POs Count",
      cell: ({ row }) => (
        <span className="font-medium text-slate-700 text-sm">
          {row.original.totalOrders}
        </span>
      ),
    },
    {
      accessorKey: "totalPurchases",
      header: "Total Purchased",
      cell: ({ row }) => (
        <span className="text-slate-700 text-sm">
          ৳{row.original.totalPurchases.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "totalPaid",
      header: "Paid So Far",
      cell: ({ row }) => (
        <span className="text-emerald-600 font-medium text-sm">
          ৳{row.original.totalPaid.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "totalDue",
      header: "Outstanding Due",
      cell: ({ row }) => (
        <span className="font-bold text-rose-600 text-base">
          ৳{row.original.totalDue.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "lastPurchaseDate",
      header: "Last Purchase",
      cell: ({ row }) => (
        <span className="text-slate-500 text-xs">
          {row.original.lastPurchaseDate ? new Date(row.original.lastPurchaseDate).toLocaleDateString("en-GB") : "-"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <ActionDropdown actions={createActions(row.original)} rowData={row.original} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <FilterBar 
          searchPlaceholder="Search supplier by name, contact..."
          filters={filterConfigs}
          onSearchChange={(val) => setSearchQuery(val)}
          onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
          onReset={() => {
            setSearchQuery("");
            setFilters({});
          }}
          className="flex-1"
        />
        <ReportExportButtons />
      </div>

      {/* KPI Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Supplier Payables</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">৳{summary.totalDue.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Suppliers with Dues</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{summary.suppliersWithDueCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">High Volume Payables (&gt; ৳200,000)</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{summary.highDueCount}</p>
          </div>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        pageSize={10}
      />
    </div>
  );
}
