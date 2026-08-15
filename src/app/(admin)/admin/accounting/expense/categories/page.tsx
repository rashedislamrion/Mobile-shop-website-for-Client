"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { DataTable, ActionDropdown } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { TableAction } from "@/types/table";
import { mockExpenseCategories, ExpenseCategory } from "@/lib/mock-data/accounting/expense-categories";
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

export default function ExpenseCategoriesPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [localData, setLocalData] = useState<ExpenseCategory[]>(mockExpenseCategories);
  
  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [formData, setFormData] = useState<Partial<ExpenseCategory>>({
    name: "",
    icon: "Building2",
    monthlyBudget: null
  });

  useEffect(() => {
    setTitle("Expense Categories");
    setBadge("Accounting");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = () => {
    if (!formData.name) {
      toast.error("Please enter a category name");
      return;
    }
    
    if (editingCategory) {
      setLocalData(prev => prev.map(c => c.id === editingCategory.id ? { ...c, ...formData } as ExpenseCategory : c));
      toast.success("Category updated successfully");
    } else {
      const newCategory: ExpenseCategory = {
        ...formData,
        id: `ec${Date.now()}`,
        thisMonthSpend: 0
      } as ExpenseCategory;
      setLocalData(prev => [...prev, newCategory]);
      toast.success("Category added successfully");
    }
    
    setDialogOpen(false);
  };

  const handleDelete = (id: string, spend: number) => {
    if (spend > 0) {
      toast.error("Cannot delete category with expenses this month");
      return;
    }
    if (confirm("Are you sure you want to delete this category?")) {
      setLocalData(prev => prev.filter(c => c.id !== id));
      toast.success("Category deleted");
    }
  };

  const createActions = (row: ExpenseCategory): TableAction[] => [
    { 
      label: "Edit", 
      icon: <Edit className="w-4 h-4" />, 
      onClick: () => {
        setEditingCategory(row);
        setFormData(row);
        setDialogOpen(true);
      } 
    },
    { 
      label: "Delete", 
      icon: <Trash2 className="w-4 h-4 text-red-500" />, 
      onClick: () => handleDelete(row.id, row.thisMonthSpend),
      disabled: row.thisMonthSpend > 0
    },
  ];

  const columns: ColumnDef<ExpenseCategory>[] = [
    {
      accessorKey: "name",
      header: "Category Name",
      cell: ({ row }) => <span className="font-semibold text-slate-800">{row.original.name}</span>
    },
    {
      accessorKey: "monthlyBudget",
      header: "Monthly Budget",
      cell: ({ row }) => {
        const budget = row.original.monthlyBudget;
        return <span className="font-medium text-slate-700">{budget ? `৳${budget.toLocaleString()}` : "No Limit"}</span>;
      }
    },
    {
      accessorKey: "thisMonthSpend",
      header: "This Month Spend",
      cell: ({ row }) => {
        const spend = row.original.thisMonthSpend;
        const budget = row.original.monthlyBudget;
        const isOver = budget ? spend > budget : false;
        
        return (
          <div className="flex flex-col gap-1">
            <span className={`font-bold ${isOver ? "text-rose-600" : "text-slate-800"}`}>
              ৳{spend.toLocaleString()}
            </span>
            {budget && (
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
                <div 
                  className={`h-full ${isOver ? "bg-rose-500" : "bg-emerald-500"}`} 
                  style={{ width: `${Math.min((spend / budget) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>
        );
      }
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
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Expense Category" : "Add Expense Category"}</DialogTitle>
          </DialogHeader>
          <div className="pt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Category Name *</label>
              <Input 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Office Supplies" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Monthly Budget (৳) (Optional)</label>
              <Input 
                type="number"
                value={formData.monthlyBudget || ""}
                onChange={e => setFormData({ ...formData, monthlyBudget: e.target.value ? Number(e.target.value) : null })}
                placeholder="Leave blank for no limit" 
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button 
                onClick={() => setDialogOpen(false)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm"
              >
                {editingCategory ? "Save Changes" : "Add Category"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center">
        <div className="w-1/3">
           <FilterBar 
            searchPlaceholder="Search category..."
            onSearch={() => {}}
            onReset={() => {}}
            filters={[]}
          />
        </div>
        <button 
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: "", icon: "Tag", monthlyBudget: null });
            setDialogOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Add Category
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
