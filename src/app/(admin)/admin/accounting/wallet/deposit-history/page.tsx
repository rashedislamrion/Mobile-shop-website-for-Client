"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { DataTable } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { mockDepositHistory, DepositHistoryRecord } from "@/lib/mock-data/accounting/deposit-history";
import { mockWalletTypes } from "@/lib/mock-data/accounting/wallet-types";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function DepositHistoryPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [localData, setLocalData] = useState<DepositHistoryRecord[]>(mockDepositHistory);
  
  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<DepositHistoryRecord>>({
    date: new Date().toISOString().split("T")[0],
    walletId: "",
    transactionType: "Deposit",
    amount: 0,
    purpose: "",
    referenceNo: "",
    note: ""
  });

  useEffect(() => {
    setTitle("Deposit & Transaction History");
    setBadge("Accounting");
    setDateFilter("This Month"); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = () => {
    if (!formData.walletId || !formData.amount || !formData.purpose) {
      toast.error("Please fill all required fields");
      return;
    }
    
    const wallet = mockWalletTypes.find(w => w.id === formData.walletId);
    if (!wallet) return;

    const newRecord: DepositHistoryRecord = {
      ...formData,
      id: `tx${Date.now()}`,
      walletName: wallet.name,
      walletType: wallet.type,
      recordedBy: "Admin User", // mock
      balanceAfter: wallet.currentBalance + (formData.transactionType === "Deposit" ? (formData.amount || 0) : -(formData.amount || 0))
    } as DepositHistoryRecord;
    
    setLocalData(prev => [newRecord, ...prev]);
    toast.success("Transaction recorded successfully");
    setDialogOpen(false);
  };

  const columns: ColumnDef<DepositHistoryRecord>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-slate-800">{row.original.date}</div>
          <div className="text-xs text-slate-500">{row.original.referenceNo}</div>
        </div>
      )
    },
    {
      accessorKey: "walletName",
      header: "Wallet",
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-slate-800">{row.original.walletName}</div>
          <div className="text-xs text-slate-500">{row.original.walletType}</div>
        </div>
      )
    },
    {
      accessorKey: "purpose",
      header: "Purpose / Note",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-slate-800">{row.original.purpose}</div>
          <div className="text-xs text-slate-500 truncate max-w-[200px]" title={row.original.note}>{row.original.note}</div>
        </div>
      )
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const isDeposit = row.original.transactionType === "Deposit";
        return (
          <div className={`font-bold flex items-center gap-1 ${isDeposit ? "text-emerald-600" : "text-rose-600"}`}>
            {isDeposit ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
            ৳{row.original.amount.toLocaleString()}
          </div>
        );
      }
    },
    {
      accessorKey: "balanceAfter",
      header: "Balance After",
      cell: ({ row }) => <span className="font-semibold text-slate-700">৳{row.original.balanceAfter.toLocaleString()}</span>
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Dialog for Add Transaction */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Transaction</DialogTitle>
          </DialogHeader>
          <div className="pt-4 space-y-4">
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Transaction Type</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => setFormData({ ...formData, transactionType: "Deposit" })}
                  className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors ${
                    formData.transactionType === "Deposit" ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Deposit (In)
                </button>
                <button 
                  onClick={() => setFormData({ ...formData, transactionType: "Withdrawal" })}
                  className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors ${
                    formData.transactionType === "Withdrawal" ? "bg-rose-50 border-rose-500 text-rose-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Withdrawal (Out)
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Wallet *</label>
              <select 
                className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                value={formData.walletId}
                onChange={e => setFormData({ ...formData, walletId: e.target.value })}
              >
                <option value="">Select Wallet...</option>
                {mockWalletTypes.map(w => (
                  <option key={w.id} value={w.id}>{w.name} (৳{w.currentBalance.toLocaleString()})</option>
                ))}
              </select>
            </div>

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
              <label className="text-sm font-semibold text-slate-700">Purpose *</label>
              <Input 
                placeholder="e.g. Owner Capital"
                value={formData.purpose}
                onChange={e => setFormData({ ...formData, purpose: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Reference No.</label>
              <Input 
                placeholder="e.g. TRF-12345"
                value={formData.referenceNo}
                onChange={e => setFormData({ ...formData, referenceNo: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Note</label>
              <Textarea 
                placeholder="Brief description..."
                value={formData.note}
                onChange={e => setFormData({ ...formData, note: e.target.value })}
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
                Record Transaction
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center">
        <FilterBar 
          searchPlaceholder="Search reference, note..."
          onSearch={() => {}}
          onReset={() => {}}
          filters={[
            {
              key: "wallet",
              label: "Wallet",
              options: mockWalletTypes.map(w => ({ label: w.name, value: w.id }))
            },
            {
              key: "type",
              label: "Type",
              options: [
                { label: "Deposit", value: "Deposit" },
                { label: "Withdrawal", value: "Withdrawal" }
              ]
            }
          ]}
        />
        <button 
          onClick={() => {
            setFormData({
              date: new Date().toISOString().split("T")[0],
              walletId: "",
              transactionType: "Deposit",
              amount: 0,
              purpose: "",
              referenceNo: "",
              note: ""
            });
            setDialogOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm whitespace-nowrap ml-4 shrink-0"
        >
          <Plus className="w-4 h-4" /> New Transaction
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
