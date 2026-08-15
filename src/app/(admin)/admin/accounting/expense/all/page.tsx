"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { DataTable, StatusBadge } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { mockExpenses, ExpenseRecord } from "@/lib/mock-data/accounting/expenses";
import { mockExpenseCategories } from "@/lib/mock-data/accounting/expense-categories";
import { mockWalletTypes } from "@/lib/mock-data/accounting/wallet-types";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AllExpensesPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [localData, setLocalData] = useState<ExpenseRecord[]>(mockExpenses);
  
  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ExpenseRecord>>({
    date: new Date().toISOString().split("T")[0],
    category: "",
    amount: 0,
    paidVia: "",
    description: "",
    status: "Paid",
    branch: "Dhaka Main Branch"
  });

  useEffect(() => {
    setTitle("All Expenses");
    setBadge("Accounting");
    setDateFilter("This Month"); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = () => {
    if (!formData.category || !formData.amount || !formData.description) {
      toast.error("Please fill all required fields");
      return;
    }

    const newRecord: ExpenseRecord = {
      ...formData,
      id: `e${Date.now()}`,
      referenceNo: `EXP-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      recordedBy: "Admin User", 
    } as ExpenseRecord;
    
    setLocalData(prev => [newRecord, ...prev]);
    toast.success("Expense recorded successfully");
    setDialogOpen(false);
  };

  const columns: ColumnDef<ExpenseRecord>[] = [
    {
      accessorKey: "date",
      header: "Date & Ref",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-slate-800">{row.original.date}</div>
          <div className="text-xs text-slate-500">{row.original.referenceNo}</div>
        </div>
      )
    },
    {
      accessorKey: "category",
      header: "Category & Branch",
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-slate-800">{row.original.category}</div>
          <div className="text-xs text-slate-500">{row.original.branch}</div>
        </div>
      )
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-[250px] truncate" title={row.original.description}>
          {row.original.description}
        </div>
      )
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => <span className="font-bold text-rose-600">৳{row.original.amount.toLocaleString()}</span>
    },
    {
      accessorKey: "paidVia",
      header: "Paid Via",
      cell: ({ row }) => <span className="text-sm text-slate-700">{row.original.paidVia || "N/A"}</span>
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge 
          status={row.original.status} 
          type={row.original.status === "Paid" ? "success" : "warning"}
        />
      )
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Add Expense Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Record Expense</DialogTitle>
          </DialogHeader>
          <div className="pt-4 space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Date *</label>
                <Input 
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Amount (৳) *</label>
                <Input 
                  type="number"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Category *</label>
              <select 
                className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Select Category...</option>
                {mockExpenseCategories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Paid Via (Wallet)</label>
              <select 
                className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                value={formData.paidVia}
                onChange={e => setFormData({ ...formData, paidVia: e.target.value })}
              >
                <option value="">Select Wallet...</option>
                {mockWalletTypes.map(w => (
                  <option key={w.id} value={w.name}>{w.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Branch</label>
              <select 
                className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                value={formData.branch}
                onChange={e => setFormData({ ...formData, branch: e.target.value })}
              >
                <option value="Global">Global</option>
                <option value="Dhaka Main Branch">Dhaka Main Branch</option>
                <option value="Chattogram Branch">Chattogram Branch</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Description *</label>
              <Textarea 
                placeholder="What was this expense for?"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Status</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => setFormData({ ...formData, status: "Paid" })}
                  className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors ${
                    formData.status === "Paid" ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Paid
                </button>
                <button 
                  onClick={() => setFormData({ ...formData, status: "Pending" })}
                  className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors ${
                    formData.status === "Pending" ? "bg-amber-50 border-amber-500 text-amber-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Pending
                </button>
              </div>
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
                Record Expense
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center">
        <FilterBar 
          searchPlaceholder="Search description..."
          onSearch={() => {}}
          onReset={() => {}}
          filters={[
            {
              key: "category",
              label: "Category",
              options: mockExpenseCategories.map(c => ({ label: c.name, value: c.name }))
            },
            {
              key: "status",
              label: "Status",
              options: [
                { label: "Paid", value: "Paid" },
                { label: "Pending", value: "Pending" }
              ]
            }
          ]}
        />
        <button 
          onClick={() => {
            setFormData({
              date: new Date().toISOString().split("T")[0],
              category: "",
              amount: 0,
              paidVia: "",
              description: "",
              status: "Paid",
              branch: "Dhaka Main Branch"
            });
            setDialogOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm whitespace-nowrap ml-4 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Expense
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
