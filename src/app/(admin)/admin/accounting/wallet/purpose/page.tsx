"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { DataTable, ActionDropdown } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { FilterConfig, TableAction } from "@/types/table";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";

interface PurposeRecord {
  id: string;
  name: string;
  category: "INCOME" | "EXPENSE";
  _count?: { transactions: number };
}

export default function PurposePage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [data, setData] = useState<PurposeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  
  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPurpose, setEditingPurpose] = useState<PurposeRecord | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "EXPENSE" as "INCOME" | "EXPENSE",
  });

  useEffect(() => {
    setTitle("Wallet Purpose");
    setBadge("Accounting");
    setDateFilter(""); 
  }, [setTitle, setBadge, setDateFilter]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiGet<PurposeRecord[]>("/purposes");
      let list = Array.isArray(res) ? res : [];

      if (filters.category) {
        list = list.filter((p) => p.category === filters.category);
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        list = list.filter((p) => p.name.toLowerCase().includes(q));
      }

      setData(list);
    } catch (err: any) {
      toast.error(err.message || "Failed to load purposes");
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenDialog = (purpose?: PurposeRecord) => {
    if (purpose) {
      setEditingPurpose(purpose);
      setFormData({
        name: purpose.name,
        category: purpose.category,
      });
    } else {
      setEditingPurpose(null);
      setFormData({
        name: "",
        category: "EXPENSE",
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a purpose name");
      return;
    }
    
    try {
      if (editingPurpose) {
        await apiPatch(`/purposes/${editingPurpose.id}`, {
          name: formData.name.trim(),
          category: formData.category,
        });
        toast.success("Purpose updated successfully");
      } else {
        await apiPost("/purposes", {
          name: formData.name.trim(),
          category: formData.category,
        });
        toast.success("Purpose created successfully");
      }

      setDialogOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save purpose");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDelete(`/purposes/${id}`);
      toast.success("Purpose deleted successfully");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete purpose");
    }
  };

  const filterConfigs: FilterConfig[] = useMemo(() => [
    {
      type: "select",
      label: "Category",
      key: "category",
      options: [
        { label: "Expense", value: "EXPENSE" },
        { label: "Income", value: "INCOME" },
      ],
    },
  ], []);

  const createActions = (): TableAction[] => [
    {
      label: "Edit",
      icon: <Edit className="w-4 h-4" />,
      onClick: (row) => handleOpenDialog(row),
    },
    {
      label: "Delete",
      icon: <Trash2 className="w-4 h-4 text-red-500" />,
      variant: "destructive",
      onClick: (row) => handleDelete(row.id),
    },
  ];

  const columns: ColumnDef<PurposeRecord>[] = [
    {
      accessorKey: "name",
      header: "Purpose Name",
      cell: ({ row }) => (
        <span className="font-semibold text-slate-800 text-sm">
          {row.original.name}
        </span>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const isIncome = row.original.category === "INCOME";
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            isIncome ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}>
            {isIncome ? "Income" : "Expense"}
          </span>
        );
      },
    },
    {
      accessorKey: "usageCount",
      header: "Transaction Usage",
      cell: ({ row }) => (
        <span className="text-slate-600 font-medium text-sm">
          {row.original._count?.transactions || 0} times
        </span>
      ),
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <ActionDropdown actions={createActions()} rowData={row.original} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Transaction Purposes</h2>
          <p className="text-xs text-slate-500">Categories classifying cash-flow and bank movements</p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Purpose
        </button>
      </div>

      <FilterBar 
        searchPlaceholder="Search purpose name..."
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

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingPurpose ? "Edit Purpose" : "Add New Purpose"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Purpose Name *</label>
              <Input
                placeholder="e.g. Courier Charge, Salary Payout"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium"
              >
                {editingPurpose ? "Save Changes" : "Create Purpose"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
