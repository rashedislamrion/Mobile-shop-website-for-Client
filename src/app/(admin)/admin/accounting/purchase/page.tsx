"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { DataTable, ActionDropdown, StatusBadge } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { ColoredStatCard } from "@/components/admin/ColoredStatCard";
import { TableAction } from "@/types/table";
import { mockPurchaseOrders, PurchaseOrderRecord } from "@/lib/mock-data/accounting/purchase-orders";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Eye, Edit, Trash2, ShoppingCart, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function PurchaseOrdersPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [localData, setLocalData] = useState<PurchaseOrderRecord[]>(mockPurchaseOrders);
  const router = useRouter();

  useEffect(() => {
    setTitle("Purchase Orders");
    setBadge("Accounting");
    setDateFilter("This Month"); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPurchases = localData.reduce((sum, po) => sum + po.grandTotal, 0);
  const totalDue = localData.reduce((sum, po) => sum + po.due, 0);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this purchase order?")) {
      setLocalData(prev => prev.filter(po => po.id !== id));
      toast.success("Purchase order deleted");
    }
  };

  const createActions = (row: PurchaseOrderRecord): TableAction[] => [
    { 
      label: "View / Receive", 
      icon: <Eye className="w-4 h-4" />, 
      onClick: () => router.push(`/admin/accounting/purchase/${row.id}`) 
    },
    { 
      label: "Edit", 
      icon: <Edit className="w-4 h-4" />, 
      onClick: () => router.push(`/admin/accounting/purchase/create?edit=${row.id}`),
      disabled: row.status !== "Draft"
    },
    { 
      label: "Delete", 
      icon: <Trash2 className="w-4 h-4 text-red-500" />, 
      onClick: () => handleDelete(row.id),
      disabled: row.status !== "Draft" && row.status !== "Cancelled"
    },
  ];

  const columns: ColumnDef<PurchaseOrderRecord>[] = [
    {
      accessorKey: "poNumber",
      header: "PO Details",
      cell: ({ row }) => (
        <div>
          <div className="font-bold text-emerald-600">{row.original.poNumber}</div>
          <div className="text-xs text-slate-500">{row.original.date} • {row.original.branch}</div>
        </div>
      )
    },
    {
      accessorKey: "supplierName",
      header: "Supplier",
      cell: ({ row }) => <span className="font-semibold text-slate-800">{row.original.supplierName}</span>
    },
    {
      accessorKey: "items",
      header: "Items",
      cell: ({ row }) => <span className="text-slate-600 font-medium">{row.original.itemsCount} items</span>
    },
    {
      accessorKey: "grandTotal",
      header: "Total & Due",
      cell: ({ row }) => (
        <div>
          <div className="font-bold text-slate-800">৳{row.original.grandTotal.toLocaleString()}</div>
          <div className={`text-xs font-semibold ${row.original.due > 0 ? "text-rose-600" : "text-emerald-600"}`}>
            Due: ৳{row.original.due.toLocaleString()}
          </div>
        </div>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge 
          status={row.original.status} 
          type={
            row.original.status === "Received" ? "success" : 
            row.original.status === "Partially Received" ? "warning" : 
            row.original.status === "Cancelled" ? "error" : "default"
          } 
        />
      )
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
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ColoredStatCard 
          icon={<ShoppingCart className="w-5 h-5" />}
          label="Total Purchases (This Month)"
          value={`৳${totalPurchases.toLocaleString()}`}
          colorTint="blue"
        />
        <ColoredStatCard 
          icon={<AlertCircle className="w-5 h-5" />}
          label="Total Unpaid Due (This Month)"
          value={`৳${totalDue.toLocaleString()}`}
          colorTint="red"
        />
      </div>

      <div className="flex justify-between items-center">
        <FilterBar 
          searchPlaceholder="Search PO Number, Supplier..."
          onSearch={() => {}}
          onReset={() => {}}
          filters={[
            {
              key: "status",
              label: "Status",
              options: [
                { label: "Draft", value: "Draft" },
                { label: "Ordered", value: "Ordered" },
                { label: "Partially Received", value: "Partially Received" },
                { label: "Received", value: "Received" },
                { label: "Cancelled", value: "Cancelled" }
              ]
            }
          ]}
        />
        <button 
          onClick={() => router.push('/admin/accounting/purchase/create')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm whitespace-nowrap ml-4 shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Purchase Order
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5">
        <DataTable 
          columns={columns} 
          data={localData} 
          pageSize={10}
        />
      </div>

    </div>
  );
}
