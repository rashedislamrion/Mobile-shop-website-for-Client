"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { DataTable, ActionDropdown, StatusBadge } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { TableAction } from "@/types/table";
import { mockSuppliers, SupplierRecord } from "@/lib/mock-data/accounting/suppliers";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Edit, Trash2, Eye, Banknote } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SupplierListPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [localData, setLocalData] = useState<SupplierRecord[]>(mockSuppliers);
  const router = useRouter();

  useEffect(() => {
    setTitle("Suppliers");
    setBadge("Accounting");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = (id: string, due: number) => {
    if (due > 0) {
      toast.error("Cannot delete supplier with outstanding due");
      return;
    }
    if (confirm("Are you sure you want to delete this supplier?")) {
      setLocalData(prev => prev.filter(s => s.id !== id));
      toast.success("Supplier deleted");
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
      onClick: () => router.push(`/admin/accounting/suppliers/payments?supplierId=${row.id}`) 
    },
    { 
      label: "Delete", 
      icon: <Trash2 className="w-4 h-4 text-red-500" />, 
      onClick: () => handleDelete(row.id, row.totalDue),
      disabled: row.totalDue > 0
    },
  ];

  const columns: ColumnDef<SupplierRecord>[] = [
    {
      accessorKey: "supplierName",
      header: "Supplier Info",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 relative rounded-lg border border-slate-200 overflow-hidden shrink-0 bg-white">
            <Image src={row.original.logo} alt={row.original.supplierName} fill className="object-contain p-1" />
          </div>
          <div>
            <div className="font-semibold text-slate-800">{row.original.supplierName}</div>
            <div className="text-xs text-slate-500">{row.original.contactPerson}</div>
          </div>
        </div>
      )
    },
    {
      accessorKey: "contact",
      header: "Contact",
      cell: ({ row }) => (
        <div>
          <div className="text-sm font-medium text-slate-700">{row.original.phone}</div>
          <div className="text-xs text-slate-500">{row.original.email}</div>
        </div>
      )
    },
    {
      accessorKey: "totalPurchases",
      header: "Total Purchases",
      cell: ({ row }) => <span className="font-medium text-slate-700">৳{row.original.totalPurchases.toLocaleString()}</span>
    },
    {
      accessorKey: "totalDue",
      header: "Total Due",
      cell: ({ row }) => {
        const due = row.original.totalDue;
        return (
          <span className={`font-bold ${due > 0 ? "text-rose-600" : "text-emerald-600"}`}>
            ৳{due.toLocaleString()}
          </span>
        );
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge 
          status={row.original.status} 
          type={row.original.status === "Active" ? "success" : "default"}
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
      
      <div className="flex justify-between items-center">
        <FilterBar 
          searchPlaceholder="Search supplier name, phone..."
          onSearch={() => {}}
          onReset={() => {}}
          filters={[
            {
              key: "status",
              label: "Status",
              options: [
                { label: "Active", value: "Active" },
                { label: "Inactive", value: "Inactive" }
              ]
            }
          ]}
        />
        <button 
          onClick={() => router.push('/admin/accounting/suppliers/create')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm whitespace-nowrap ml-4 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Supplier
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
