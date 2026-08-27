"use client";

import { useEffect, useState, useCallback } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { DataTable, ActionDropdown, StatusBadge } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { FilterConfig, StatusVariant, TableAction } from "@/types/table";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Edit, Trash2, Eye, Banknote } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { apiGet, apiDelete } from "@/lib/api-client";
import { PaymentSettlementDialog } from "@/components/admin/PaymentSettlementDialog";

interface SupplierRecord {
  id: string;
  name: string;
  contactPerson: string | null;
  phone: string;
  email: string | null;
  address: string | null;
  totalPurchases: number | string;
  totalPaid: number | string;
  totalDue: number | string;
  status: string;
  _count?: { purchaseOrders: number; payments: number };
}

export default function SupplierListPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [data, setData] = useState<SupplierRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [selectedSupplierForPayment, setSelectedSupplierForPayment] = useState<SupplierRecord | null>(null);
  const router = useRouter();

  useEffect(() => {
    setTitle("Suppliers");
    setBadge("Accounting");
    setDateFilter(""); 
  }, [setTitle, setBadge, setDateFilter]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: Record<string, any> = {};

      if (filters.status) params.status = (filters.status as string).toUpperCase();
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await apiGet<{ data: SupplierRecord[] }>("/suppliers", params);
      setData(res?.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load suppliers");
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: string, due: number) => {
    if (due > 0) {
      toast.error("Cannot delete supplier with outstanding due balance");
      return;
    }
    try {
      await apiDelete(`/suppliers/${id}`);
      toast.success("Supplier deleted successfully");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete supplier");
    }
  };

  const createActions = (row: SupplierRecord): TableAction[] => [
    { 
      label: "View Profile", 
      icon: <Eye className="w-4 h-4" />, 
      onClick: () => router.push(`/admin/accounting/suppliers/${row.id}`) 
    },
    { 
      label: "Edit", 
      icon: <Edit className="w-4 h-4" />, 
      onClick: () => router.push(`/admin/accounting/suppliers/${row.id}/edit`) 
    },
    { 
      label: "Record Payment", 
      icon: <Banknote className="w-4 h-4 text-emerald-600" />, 
      onClick: () => setSelectedSupplierForPayment(row) 
    },
    { 
      label: "Delete", 
      icon: <Trash2 className="w-4 h-4 text-red-500" />, 
      variant: "destructive",
      onClick: () => handleDelete(row.id, Number(row.totalDue)),
      disabled: Number(row.totalDue) > 0,
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: "select",
      label: "Status",
      key: "status",
      options: [
        { label: "Active", value: "ACTIVE" },
        { label: "Inactive", value: "INACTIVE" },
      ],
    },
  ];

  const getStatusVariant = (status: string): StatusVariant => {
    switch (status) {
      case "ACTIVE": return "success";
      case "INACTIVE": return "default";
      default: return "info";
    }
  };

  const columns: ColumnDef<SupplierRecord>[] = [
    {
      accessorKey: "name",
      header: "Supplier Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-100">
            {row.original.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-800 leading-tight">{row.original.name}</p>
            <p className="text-xs text-slate-400">{row.original.contactPerson || "No contact person"}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => <span className="font-mono text-sm text-slate-700">{row.original.phone}</span>,
    },
    {
      accessorKey: "totalPurchases",
      header: "Purchases",
      cell: ({ row }) => (
        <span className="font-semibold text-slate-800 text-sm">
          ৳{Number(row.original.totalPurchases || 0).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "totalPaid",
      header: "Paid",
      cell: ({ row }) => (
        <span className="font-semibold text-emerald-600 text-sm">
          ৳{Number(row.original.totalPaid || 0).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "totalDue",
      header: "Total Due",
      cell: ({ row }) => {
        const due = Number(row.original.totalDue || 0);
        return (
          <span className={`font-bold text-sm ${due > 0 ? "text-rose-600" : "text-emerald-600"}`}>
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
          status={row.original.status} 
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
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Suppliers</h2>
          <p className="text-xs text-slate-500">Manage hardware vendors, parts suppliers, and trade payables</p>
        </div>
        <button
          onClick={() => router.push("/admin/accounting/suppliers/create")}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Supplier
        </button>
      </div>

      <FilterBar 
        searchPlaceholder="Search suppliers by name, contact, phone..."
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

      {selectedSupplierForPayment && (
        <PaymentSettlementDialog
          open={Boolean(selectedSupplierForPayment)}
          onOpenChange={(open) => {
            if (!open) setSelectedSupplierForPayment(null);
          }}
          entityType="supplier"
          entityId={selectedSupplierForPayment.id}
          entityName={selectedSupplierForPayment.name}
          totalDue={Number(selectedSupplierForPayment.totalDue || 0)}
          onPaymentSuccess={loadData}
        />
      )}
    </div>
  );
}
