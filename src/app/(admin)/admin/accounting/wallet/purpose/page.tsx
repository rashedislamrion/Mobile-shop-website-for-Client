"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { DataTable, ActionDropdown } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { TableAction } from "@/types/table";
import { mockPurposes, Purpose } from "@/lib/mock-data/accounting/purpose";
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

export default function PurposePage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [localData, setLocalData] = useState<Purpose[]>(mockPurposes);
  
  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPurpose, setEditingPurpose] = useState<Purpose | null>(null);
  const [formData, setFormData] = useState<Partial<Purpose>>({
    name: "",
    category: "Expense"
  });

  useEffect(() => {
    setTitle("Wallet Purpose");
    setBadge("Accounting");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = () => {
    if (!formData.name) {
      toast.error("Please enter a purpose name");
      return;
    }
    
    if (editingPurpose) {
      setLocalData(prev => prev.map(p => p.id === editingPurpose.id ? { ...p, ...formData } as Purpose : p));
      toast.success("Purpose updated successfully");
    } else {
      const newPurpose: Purpose = {
        ...formData,
        id: `p${Date.now()}`,
        usageCount: 0
      } as Purpose;
      setLocalData(prev => [...prev, newPurpose]);
      toast.success("Purpose added successfully");
    }
    
    setDialogOpen(false);
  };

  const handleDelete = (id: string, count: number) => {
    if (count > 0) {
      toast.error("Cannot delete purpose that has been used in transactions");
      return;
    }
    if (confirm("Are you sure you want to delete this purpose?")) {
      setLocalData(prev => prev.filter(p => p.id !== id));
      toast.success("Purpose deleted");
    }
  };

  const createActions = (row: Purpose): TableAction[] => [
    { 
      label: "Edit", 
      icon: <Edit className="w-4 h-4" />, 
      onClick: () => {
        setEditingPurpose(row);
        setFormData(row);
        setDialogOpen(true);
      } 
    },
    { 
      label: "Delete", 
      icon: <Trash2 className="w-4 h-4 text-red-500" />, 
      onClick: () => handleDelete(row.id, row.usageCount),
      disabled: row.usageCount > 0
    },
  ];

  const columns: ColumnDef<Purpose>[] = [
    {
      accessorKey: "name",
      header: "Purpose Name",
      cell: ({ row }) => <span className="font-semibold text-slate-800">{row.original.name}</span>
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const cat = row.original.category;
        return (
          <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
            cat === "Income" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-rose-700 bg-rose-50 border-rose-200"
          }`}>
            {cat}
          </span>
        );
      }
    },
    {
      accessorKey: "usageCount",
      header: "Times Used",
      cell: ({ row }) => <span className="text-slate-600">{row.original.usageCount}</span>
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
      
      {/* Dialog for Add/Edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingPurpose ? "Edit Purpose" : "Add Purpose"}</DialogTitle>
          </DialogHeader>
          <div className="pt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Purpose Name</label>
              <Input 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Supplier Payment" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Category</label>
              <select 
                className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as any })}
              >
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
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
                {editingPurpose ? "Save Changes" : "Add Purpose"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center">
        <div className="w-1/3">
           <FilterBar 
            searchPlaceholder="Search purpose..."
            onSearch={() => {}}
            onReset={() => {}}
            filters={[]}
          />
        </div>
        <button 
          onClick={() => {
            setEditingPurpose(null);
            setFormData({ name: "", category: "Expense" });
            setDialogOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Add Purpose
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
