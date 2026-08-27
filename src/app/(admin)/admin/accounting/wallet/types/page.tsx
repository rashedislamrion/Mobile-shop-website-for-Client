"use client";

import { useEffect, useState, useCallback } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { DataTable, ActionDropdown } from "@/components/admin/DataTable";
import { TableAction } from "@/types/table";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Edit, Trash2, Banknote, Building, Smartphone, Wallet as WalletIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";

interface WalletTypeRecord {
  id: string;
  name: string;
  kind: "CASH" | "BANK" | "MOBILE_BANKING";
  currentBalance: number | string;
  status: string;
  _count?: { transactions: number; expenses: number; supplierPayments: number };
}

export default function WalletTypesPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [data, setData] = useState<WalletTypeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<WalletTypeRecord | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    kind: "BANK" as "CASH" | "BANK" | "MOBILE_BANKING",
    initialBalance: 0,
    status: "ACTIVE",
  });

  useEffect(() => {
    setTitle("Wallet Types");
    setBadge("Accounting");
    setDateFilter(""); 
  }, [setTitle, setBadge, setDateFilter]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiGet<WalletTypeRecord[]>("/wallet-types");
      setData(Array.isArray(res) ? res : []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load wallet types");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalBalance = data.reduce((sum, w) => sum + Number(w.currentBalance), 0);

  const handleOpenDialog = (wallet?: WalletTypeRecord) => {
    if (wallet) {
      setEditingWallet(wallet);
      setFormData({
        name: wallet.name,
        kind: wallet.kind,
        initialBalance: Number(wallet.currentBalance),
        status: wallet.status,
      });
    } else {
      setEditingWallet(null);
      setFormData({
        name: "",
        kind: "BANK",
        initialBalance: 0,
        status: "ACTIVE",
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a wallet name");
      return;
    }

    try {
      if (editingWallet) {
        await apiPatch(`/wallet-types/${editingWallet.id}`, {
          name: formData.name,
          kind: formData.kind,
          status: formData.status,
        });
        toast.success("Wallet updated successfully");
      } else {
        await apiPost("/wallet-types", {
          name: formData.name,
          kind: formData.kind,
          initialBalance: Number(formData.initialBalance || 0),
          status: formData.status,
        });
        toast.success("New wallet created successfully");
      }

      setDialogOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save wallet");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDelete(`/wallet-types/${id}`);
      toast.success("Wallet removed successfully");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete wallet");
    }
  };

  const getKindIcon = (kind: string) => {
    switch (kind) {
      case "CASH":
        return <Banknote className="w-5 h-5 text-emerald-600" />;
      case "BANK":
        return <Building className="w-5 h-5 text-blue-600" />;
      case "MOBILE_BANKING":
        return <Smartphone className="w-5 h-5 text-pink-600" />;
      default:
        return <WalletIcon className="w-5 h-5 text-slate-600" />;
    }
  };

  const createActions = (): TableAction[] => [
    {
      label: "Edit Wallet",
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

  const columns: ColumnDef<WalletTypeRecord>[] = [
    {
      accessorKey: "name",
      header: "Wallet Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
            {getKindIcon(row.original.kind)}
          </div>
          <div>
            <p className="font-semibold text-slate-800">{row.original.name}</p>
            <p className="text-xs text-slate-400 capitalize">{row.original.kind.replace("_", " ").toLowerCase()}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "kind",
      header: "Type",
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
          {row.original.kind.replace("_", " ")}
        </span>
      ),
    },
    {
      accessorKey: "currentBalance",
      header: "Current Balance",
      cell: ({ row }) => (
        <span className="font-bold text-slate-900 text-base">
          ৳{Number(row.original.currentBalance).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.original.status === "ACTIVE";
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
          }`}>
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
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
      
      {/* Top Banner Card: Total Balance */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-emerald-100 text-xs font-semibold uppercase tracking-wider">Total Balance Across All Wallets</span>
          <p className="text-3xl font-bold mt-1">৳{totalBalance.toLocaleString()}</p>
          <p className="text-emerald-100 text-xs mt-1">{data.length} active payment channels registered</p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-2 bg-white text-emerald-800 hover:bg-emerald-50 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Wallet Channel
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
            <DialogTitle>{editingWallet ? "Edit Wallet" : "Add New Wallet"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Wallet Name *</label>
              <Input
                placeholder="e.g. City Bank Primary A/C"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Wallet Kind *</label>
              <select
                value={formData.kind}
                onChange={(e) => setFormData({ ...formData, kind: e.target.value as any })}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
              >
                <option value="BANK">Bank Account</option>
                <option value="CASH">Cash Drawer</option>
                <option value="MOBILE_BANKING">Mobile Banking (bKash / Nagad)</option>
              </select>
            </div>

            {!editingWallet && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Opening Balance (৳)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.initialBalance}
                  onChange={(e) => setFormData({ ...formData, initialBalance: Number(e.target.value) })}
                />
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-sm font-medium text-slate-700">Active Channel</span>
              <Switch
                checked={formData.status === "ACTIVE"}
                onCheckedChange={(c) => setFormData({ ...formData, status: c ? "ACTIVE" : "INACTIVE" })}
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
                {editingWallet ? "Save Changes" : "Create Wallet"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
