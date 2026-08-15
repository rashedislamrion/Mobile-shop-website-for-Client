"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { DataTable, ActionDropdown } from "@/components/admin/DataTable";
import { TableAction } from "@/types/table";
import { mockWalletTypes, WalletType } from "@/lib/mock-data/accounting/wallet-types";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Edit, Trash2, Eye, Banknote, Building, Smartphone, Wallet as WalletIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";

export default function WalletTypesPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [localData, setLocalData] = useState<WalletType[]>(mockWalletTypes);
  
  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<WalletType | null>(null);
  const [formData, setFormData] = useState<Partial<WalletType>>({
    name: "",
    type: "Bank",
    currentBalance: 0,
    status: "Active"
  });

  const router = useRouter();

  useEffect(() => {
    setTitle("Wallet Types");
    setBadge("Accounting");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalBalance = localData.reduce((sum, w) => sum + w.currentBalance, 0);

  const handleSave = () => {
    if (!formData.name) {
      toast.error("Please enter a wallet name");
      return;
    }
    
    if (editingWallet) {
      setLocalData(prev => prev.map(w => w.id === editingWallet.id ? { ...w, ...formData } as WalletType : w));
      toast.success("Wallet updated successfully");
    } else {
      const newWallet: WalletType = {
        ...formData,
        id: `w${Date.now()}`
      } as WalletType;
      setLocalData(prev => [...prev, newWallet]);
      toast.success("Wallet added successfully");
    }
    
    setDialogOpen(false);
  };

  const handleDelete = (id: string, balance: number) => {
    if (balance > 0) {
      toast.error("Cannot delete wallet with non-zero balance");
      return;
    }
    if (confirm("Are you sure you want to delete this wallet?")) {
      setLocalData(prev => prev.filter(w => w.id !== id));
      toast.success("Wallet deleted");
    }
  };

  const createActions = (row: WalletType): TableAction[] => [
    { 
      label: "Edit", 
      icon: <Edit className="w-4 h-4" />, 
      onClick: () => {
        setEditingWallet(row);
        setFormData(row);
        setDialogOpen(true);
      } 
    },
    { 
      label: "View Transactions", 
      icon: <Eye className="w-4 h-4" />, 
      onClick: () => {
        router.push(`/admin/accounting/wallet/deposit-history?walletId=${row.id}`);
      } 
    },
    { 
      label: "Delete", 
      icon: <Trash2 className="w-4 h-4 text-red-500" />, 
      onClick: () => handleDelete(row.id, row.currentBalance),
      disabled: row.currentBalance !== 0
    },
  ];

  const columns: ColumnDef<WalletType>[] = [
    {
      accessorKey: "name",
      header: "Wallet Name",
      cell: ({ row }) => {
        const type = row.original.type;
        const Icon = type === "Cash" ? Banknote : type === "Bank" ? Building : Smartphone;
        return (
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center 
              ${type === "Cash" ? "bg-emerald-100 text-emerald-600" : 
                type === "Bank" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="font-semibold text-slate-800">{row.original.name}</span>
          </div>
        );
      }
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const t = row.original.type;
        const color = t === "Cash" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : 
                      t === "Bank" ? "text-blue-700 bg-blue-50 border-blue-200" : 
                      "text-purple-700 bg-purple-50 border-purple-200";
        return <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${color}`}>{t}</span>;
      }
    },
    {
      accessorKey: "currentBalance",
      header: "Current Balance",
      cell: ({ row }) => <span className="font-bold text-slate-800">৳{row.original.currentBalance.toLocaleString()}</span>
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Switch 
          checked={row.original.status === "Active"}
          onCheckedChange={(checked) => {
            setLocalData(prev => prev.map(w => w.id === row.original.id ? { ...w, status: checked ? "Active" : "Inactive" } : w));
            toast.success(`Wallet marked as ${checked ? "Active" : "Inactive"}`);
          }}
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
      
      {/* Dialog for Add/Edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingWallet ? "Edit Wallet Type" : "Add Wallet Type"}</DialogTitle>
          </DialogHeader>
          <div className="pt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Wallet Name</label>
              <Input 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Bank - DBBL" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Type</label>
              <select 
                className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
              >
                <option value="Cash">Cash</option>
                <option value="Bank">Bank</option>
                <option value="Mobile Banking">Mobile Banking</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Opening Balance (৳)</label>
              <Input 
                type="number"
                value={formData.currentBalance}
                onChange={e => setFormData({ ...formData, currentBalance: Number(e.target.value) })}
                disabled={!!editingWallet} // Can only set opening balance on creation
              />
              {editingWallet && <p className="text-xs text-slate-500">Balance can only be modified via transactions.</p>}
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="text-sm font-semibold text-slate-700">Status Active</label>
              <Switch 
                checked={formData.status === "Active"}
                onCheckedChange={checked => setFormData({ ...formData, status: checked ? "Active" : "Inactive" })}
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
                {editingWallet ? "Save Changes" : "Add Wallet"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Summary Card */}
      <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-4 bg-gradient-to-r from-emerald-50 to-white">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
          <WalletIcon className="w-7 h-7" />
        </div>
        <div>
          <p className="text-sm font-medium text-emerald-800/70 mb-1 uppercase tracking-wider">Total Balance Across All Wallets</p>
          <p className="text-3xl font-extrabold text-emerald-700">৳{totalBalance.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={() => {
            setEditingWallet(null);
            setFormData({ name: "", type: "Bank", currentBalance: 0, status: "Active" });
            setDialogOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Add Wallet Type
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
