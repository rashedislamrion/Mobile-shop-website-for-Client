"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { DataTable, ActionDropdown, StatusBadge } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { FilterConfig, StatusVariant, TableAction } from "@/types/table";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Eye, XCircle, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { apiGet, apiPatch } from "@/lib/api-client";

interface PurchaseOrderItem {
  id: string;
  poNumber: string;
  orderDate: string;
  expectedDate?: string | null;
  subtotal: number | string;
  taxAmount: number | string;
  shippingCost: number | string;
  discount: number | string;
  grandTotal: number | string;
  amountPaid: number | string;
  dueAmount: number | string;
  status: string;
  supplier?: { id: string; name: string };
  branch?: { id: string; name: string; code: string } | null;
  recordedBy?: { id: string; name: string };
  _count?: { items: number };
}

export default function PurchaseOrdersPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [data, setData] = useState<PurchaseOrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    setTitle("Purchase Orders");
    setBadge("Accounting");
    setDateFilter(""); 
  }, [setTitle, setBadge, setDateFilter]);

  useEffect(() => {
    apiGet<{ data: any[] }>("/suppliers", { limit: 100 })
      .then((res) => {
        if (res?.data) setSuppliers(res.data);
      })
      .catch(() => {});
  }, []);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: Record<string, any> = {};

      if (filters.supplier) params.supplier = filters.supplier;
      if (filters.status) params.status = (filters.status as string).toUpperCase();
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await apiGet<{ data: PurchaseOrderItem[] }>("/purchase-orders", params);
      setData(res?.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load purchase orders");
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalPurchases = data.reduce((sum, po) => sum + Number(po.grandTotal || 0), 0);
  const totalDue = data.reduce((sum, po) => sum + Number(po.dueAmount || 0), 0);

  const handleCancelPO = async (id: string) => {
    if (confirm("Are you sure you want to cancel this purchase order?")) {
      try {
        await apiPatch(`/purchase-orders/${id}/cancel`, {});
        toast.success("Purchase order cancelled");
        loadData();
      } catch (err: any) {
        toast.error(err.message || "Failed to cancel purchase order");
      }
    }
  };

  const createActions = (row: PurchaseOrderItem): TableAction[] => [
    { 
      label: "View / Receive Items", 
      icon: <Eye className="w-4 h-4" />, 
      onClick: () => router.push(`/admin/accounting/purchase/${row.id}`) 
    },
    { 
      label: "Cancel Order", 
      icon: <XCircle className="w-4 h-4 text-red-500" />, 
      variant: "destructive",
      onClick: () => handleCancelPO(row.id),
      disabled: row.status === "RECEIVED" || row.status === "CANCELLED"
    },
  ];

  const filterConfigs: FilterConfig[] = useMemo(() => [
    {
      type: "select",
      label: "Supplier",
      key: "supplier",
      options: suppliers.map((s) => ({ label: s.name, value: s.id })),
    },
    {
      type: "select",
      label: "Status",
      key: "status",
      options: [
        { label: "Ordered", value: "ORDERED" },
        { label: "Partially Received", value: "PARTIALLY_RECEIVED" },
        { label: "Received", value: "RECEIVED" },
        { label: "Cancelled", value: "CANCELLED" },
      ],
    },
  ], [suppliers]);

  const getStatusVariant = (status: string): StatusVariant => {
    switch (status) {
      case "RECEIVED": return "success";
      case "PARTIALLY_RECEIVED": return "info";
      case "ORDERED": return "warning";
      case "CANCELLED": return "default";
      default: return "default";
    }
  };

  const columns: ColumnDef<PurchaseOrderItem>[] = [
    {
      accessorKey: "poNumber",
      header: "PO Details",
      cell: ({ row }) => (
        <div>
          <span 
            onClick={() => router.push(`/admin/accounting/purchase/${row.original.id}`)}
            className="font-mono font-bold text-emerald-600 cursor-pointer hover:underline"
          >
            {row.original.poNumber}
          </span>
          <p className="text-xs text-slate-400">
            {new Date(row.original.orderDate).toLocaleDateString("en-GB")} • {row.original._count?.items || 0} items
          </p>
        </div>
      ),
    },
    {
      accessorKey: "supplier",
      header: "Supplier",
      cell: ({ row }) => (
        <span className="font-semibold text-slate-800 text-sm">
          {row.original.supplier?.name || "Unknown Supplier"}
        </span>
      ),
    },
    {
      accessorKey: "branch",
      header: "Receiving Branch",
      cell: ({ row }) => (
        <span className="text-slate-600 text-sm">
          {row.original.branch?.name || "Global / Headquarters"}
        </span>
      ),
    },
    {
      accessorKey: "grandTotal",
      header: "Grand Total",
      cell: ({ row }) => (
        <span className="font-bold text-slate-900 text-base">
          ৳{Number(row.original.grandTotal || 0).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "dueAmount",
      header: "Outstanding Due",
      cell: ({ row }) => {
        const due = Number(row.original.dueAmount || 0);
        return (
          <span className={`font-semibold text-sm ${due > 0 ? "text-rose-600" : "text-emerald-600"}`}>
            ৳{due.toLocaleString()}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge 
          status={row.original.status.replace("_", " ")} 
          type={getStatusVariant(row.original.status)} 
        />
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
      
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Purchase Value</span>
            <p className="text-2xl font-bold text-slate-800 mt-1">৳{totalPurchases.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Outstanding Vendor Due</span>
            <p className="text-2xl font-bold text-rose-600 mt-1">৳{totalDue.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 rounded-xl text-white shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-emerald-100 uppercase tracking-wider">Procurement</span>
            <p className="text-sm text-emerald-50 mt-0.5">Order stock from certified suppliers</p>
          </div>
          <button
            onClick={() => router.push("/admin/accounting/purchase/create")}
            className="bg-white text-emerald-800 hover:bg-emerald-50 font-semibold px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" /> Create PO
          </button>
        </div>
      </div>

      <FilterBar 
        searchPlaceholder="Search by PO number..."
        filters={filterConfigs}
        onSearchChange={(val) => setSearchQuery(val)}
        onFilterChange={(key, val) => setFilters((prev) => ({ ...prev, [key]: val }))}
        onReset={() => {
          setSearchQuery("");
          setFilters({});
        }}
      />

      <DataTable 
        columns={columns} 
        data={data} 
        pageSize={10}
      />
    </div>
  );
}
