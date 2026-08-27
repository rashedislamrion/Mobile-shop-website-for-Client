"use client";

import { useEffect, useState, useCallback } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { DataTable, ActionDropdown } from "@/components/admin/DataTable";
import { TableAction } from "@/types/table";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Edit, Trash2, Tag } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";

interface ExpenseCategoryRecord {
  id: string;
  name: string;
  icon?: string | null;
  monthlyBudget?: number | string | null;
  thisMonthSpend: number;
  _count?: { expenses: number };
}

export default function ExpenseCategoriesPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [data, setData] = useState<ExpenseCategoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategoryRecord | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    icon: "Tag",
    monthlyBudget: 0,
  });

  useEffect(() => {
    setTitle("Expense Categories");
    setBadge("Accounting");
    setDateFilter(""); 
  }, [setTitle, setBadge, setDateFilter]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiGet<ExpenseCategoryRecord[]>("/expense-categories");
      setData(Array.isArray(res) ? res : []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load expense categories");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenDialog = (cat?: ExpenseCategoryRecord) => {
    if (cat) {
      setEditingCategory(cat);
      setFormData({
        name: cat.name,
        icon: cat.icon || "Tag",
        monthlyBudget: Number(cat.monthlyBudget || 0),
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        icon: "Tag",
        monthlyBudget: 0,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      if (editingCategory) {
        await apiPatch(`/expense-categories/${editingCategory.id}`, {
          name: formData.name.trim(),
          icon: formData.icon,
          monthlyBudget: Number(formData.monthlyBudget || 0),
        });
        toast.success("Category updated successfully");
      } else {
        await apiPost("/expense-categories", {
          name: formData.name.trim(),
          icon: formData.icon,
          monthlyBudget: Number(formData.monthlyBudget || 0),
        });
        toast.success("Category created successfully");
      }

      setDialogOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save category");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDelete(`/expense-categories/${id}`);
      toast.success("Category deleted successfully");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete category");
    }
  };

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

  const columns: ColumnDef<ExpenseCategoryRecord>[] = [
    {
      accessorKey: "name",
      header: "Category Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">{row.original.name}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "monthlyBudget",
      header: "Monthly Budget",
      cell: ({ row }) => {
        const budget = Number(row.original.monthlyBudget || 0);
        if (budget === 0) return <span className="text-slate-400 italic text-xs">No limit</span>;
        return <span className="font-medium text-slate-700 text-sm">৳{budget.toLocaleString()}</span>;
      },
    },
    {
      accessorKey: "thisMonthSpend",
      header: "This Month Spend",
      cell: ({ row }) => {
        const spend = Number(row.original.thisMonthSpend || 0);
        const budget = Number(row.original.monthlyBudget || 0);
        const isOver = budget > 0 && spend > budget;

        return (
          <div>
            <span className={`font-bold text-sm ${isOver ? "text-red-600" : "text-slate-800"}`}>
              ৳{spend.toLocaleString()}
            </span>
            {isOver && <span className="text-xs text-red-500 block">Over budget!</span>}
          </div>
        );
      },
    },
    {
      accessorKey: "usageCount",
      header: "Total Expenses",
      cell: ({ row }) => (
        <span className="text-slate-600 text-sm font-medium">
          {row.original._count?.expenses || 0} entries
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
          <h2 className="text-lg font-bold text-slate-800">Expense Categories</h2>
          <p className="text-xs text-slate-500">Track and categorize company expenditures & overheads</p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        pageSize={10}
      />

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Category Name *</label>
              <Input
                placeholder="e.g. Office Utilities, Equipment"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Monthly Budget Limit (৳)</label>
              <Input
                type="number"
                placeholder="0.00 (Optional)"
                value={formData.monthlyBudget || ""}
                onChange={(e) => setFormData({ ...formData, monthlyBudget: Number(e.target.value) })}
              />
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
                {editingCategory ? "Save Changes" : "Create Category"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
