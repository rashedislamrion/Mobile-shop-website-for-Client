"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { FilterBar } from "@/components/admin/FilterBar";
import { DataTable, ActionDropdown } from "@/components/admin/DataTable";
import { ReportExportButtons } from "@/components/admin/ReportExportButtons";
import { FilterConfig, TableAction } from "@/types/table";
import { ColumnDef } from "@tanstack/react-table";
import { Users, AlertCircle, TrendingDown, Eye, CheckCircle, Banknote } from "lucide-react";
import { toast } from "sonner";
import { apiGet } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { PaymentSettlementDialog } from "@/components/admin/PaymentSettlementDialog";

interface CustomerDueItem {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  totalDue: number;
  lastOrderDate: string;
  branch: string;
}

export default function CustomerDueReport() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [data, setData] = useState<CustomerDueItem[]>([]);
  const [summary, setSummary] = useState({ totalDue: 0, customersWithDueCount: 0, highDueCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [selectedCustomerForPayment, setSelectedCustomerForPayment] = useState<CustomerDueItem | null>(null);
  const router = useRouter();

  const [branches, setBranches] = useState<any[]>([]);

  useEffect(() => {
    setTitle("Customer Due Report");
    setBadge("Website");
    setDateFilter(""); 
  }, [setTitle, setBadge, setDateFilter]);

  useEffect(() => {
    apiGet<any[]>("/branches/public")
      .then((res) => {
        if (Array.isArray(res)) setBranches(res);
      })
      .catch(() => {});
  }, []);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: Record<string, any> = {};

      if (filters.branch) params.branch = filters.branch;
      if (filters.dueRange) params.dueRange = filters.dueRange;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await apiGet<{
        customerDues: CustomerDueItem[];
        summary: { totalDue: number; customersWithDueCount: number; highDueCount: number };
      }>("/reports/customer-due", params);

      setData(res?.customerDues || []);
      if (res?.summary) setSummary(res.summary);
    } catch (err: any) {
      toast.error(err.message || "Failed to load customer due report");
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filterConfigs: FilterConfig[] = useMemo(() => [
    {
      type: "select",
      label: "Branch",
      key: "branch",
      options: branches.map((b) => ({ label: b.name, value: b.id })),
    },
    {
      type: "select",
      label: "Due Range",
      key: "dueRange",
      options: [
        { label: "All", value: "all" },
        { label: "৳0 - ৳1,000", value: "0-1000" },
        { label: "৳1,001 - ৳5,000", value: "1000-5000" },
        { label: "৳5,000+", value: "5000+" },
      ],
    },
  ], [branches]);

  const createActions = (row: CustomerDueItem): TableAction[] => [
    {
      label: "Record Payment",
      icon: <Banknote className="w-4 h-4 text-emerald-600" />,
      onClick: () => setSelectedCustomerForPayment(row),
    },
    {
      label: "View Customer Profile",
      icon: <Eye className="w-4 h-4" />,
      onClick: () => router.push(`/admin/customers/${row.id}`),
    },
    {
      label: "Send Payment Reminder",
      icon: <CheckCircle className="w-4 h-4 text-blue-600" />,
      onClick: () => toast.success(`SMS/Email reminder queued for ${row.customerName}`),
    },
  ];

  const columns: ColumnDef<CustomerDueItem>[] = [
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
            {row.original.customerName.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-slate-800 leading-tight">
              {row.original.customerName}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {row.original.phone}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "branch",
      header: "Branch",
      cell: ({ row }) => <span className="text-slate-600 text-sm">{row.original.branch}</span>,
    },
    {
      accessorKey: "totalOrders",
      header: "Orders",
      cell: ({ row }) => (
        <span className="font-medium text-slate-700 text-sm">
          {row.original.totalOrders}
        </span>
      ),
    },
    {
      accessorKey: "totalSpent",
      header: "Lifetime Value",
      cell: ({ row }) => (
        <span className="text-slate-600 text-sm">
          ৳{row.original.totalSpent.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "totalDue",
      header: "Total Due",
      cell: ({ row }) => (
        <span className="font-bold text-rose-600 text-base">
          ৳{row.original.totalDue.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "lastOrderDate",
      header: "Last Order",
      cell: ({ row }) => (
        <span className="text-slate-500 text-xs">
          {row.original.lastOrderDate ? new Date(row.original.lastOrderDate).toLocaleDateString("en-GB") : "-"}
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
          searchPlaceholder="Search customer by name, phone..."
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
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Customer Due</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">৳{summary.totalDue.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Customers with Dues</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{summary.customersWithDueCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">High Risk Due (&gt; ৳5,000)</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{summary.highDueCount}</p>
          </div>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        pageSize={10}
      />

      {selectedCustomerForPayment && (
        <PaymentSettlementDialog
          open={Boolean(selectedCustomerForPayment)}
          onOpenChange={(open) => {
            if (!open) setSelectedCustomerForPayment(null);
          }}
          entityType="customer"
          entityId={selectedCustomerForPayment.id}
          entityName={selectedCustomerForPayment.customerName}
          totalDue={selectedCustomerForPayment.totalDue}
          onPaymentSuccess={loadData}
        />
      )}
    </div>
  );
}
