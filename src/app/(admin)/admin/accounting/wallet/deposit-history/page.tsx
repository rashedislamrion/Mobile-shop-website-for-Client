"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { DataTable } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { FilterConfig } from "@/types/table";
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
import { apiGet, apiPost } from "@/lib/api-client";

interface WalletTransactionRecord {
  id: string;
  referenceNo: string;
  type: "DEPOSIT" | "WITHDRAWAL";
  amount: number | string;
  balanceAfter: number | string;
  note: string | null;
  createdAt: string;
  walletType?: { id: string; name: string; kind: string };
  purpose?: { id: string; name: string; category: string } | null;
  recordedBy?: { id: string; name: string; employeeId: string };
}

export default function DepositHistoryPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [data, setData] = useState<WalletTransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  const [wallets, setWallets] = useState<any[]>([]);
  const [purposes, setPurposes] = useState<any[]>([]);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    walletTypeId: "",
    type: "DEPOSIT" as "DEPOSIT" | "WITHDRAWAL",
    amount: 0,
    purposeId: "",
    note: "",
  });

  useEffect(() => {
    setTitle("Deposit & Transaction History");
    setBadge("Accounting");
    setDateFilter(""); 
  }, [setTitle, setBadge, setDateFilter]);

  useEffect(() => {
    Promise.all([
      apiGet<any[]>("/wallet-types"),
      apiGet<any[]>("/purposes"),
    ])
      .then(([walletRes, purpRes]) => {
        if (Array.isArray(walletRes)) {
          setWallets(walletRes);
          if (walletRes.length > 0) {
            setFormData((prev) => ({ ...prev, walletTypeId: walletRes[0].id }));
          }
        }
        if (Array.isArray(purpRes)) setPurposes(purpRes);
      })
      .catch(() => {});
  }, []);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: Record<string, any> = {};

      if (filters.walletType) params.walletType = filters.walletType;
      if (filters.purpose) params.purpose = filters.purpose;
      if (filters.type) params.type = (filters.type as string).toUpperCase();
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await apiGet<{ data: WalletTransactionRecord[] }>("/wallet-transactions", params);
      setData(res?.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    if (!formData.walletTypeId || !formData.amount || Number(formData.amount) <= 0) {
      toast.error("Please enter a valid amount and select a wallet");
      return;
    }

    try {
      await apiPost("/wallet-transactions", {
        walletTypeId: formData.walletTypeId,
        type: formData.type,
        amount: Number(formData.amount),
        purposeId: formData.purposeId || undefined,
        note: formData.note || undefined,
      });

      toast.success(`${formData.type === "DEPOSIT" ? "Deposit" : "Withdrawal"} recorded successfully`);
      setDialogOpen(false);
      setFormData({
        walletTypeId: wallets[0]?.id || "",
        type: "DEPOSIT",
        amount: 0,
        purposeId: "",
        note: "",
      });
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to record transaction");
    }
  };

  const filterConfigs: FilterConfig[] = useMemo(() => [
    {
      type: "select",
      label: "Wallet",
      key: "walletType",
      options: wallets.map((w) => ({ label: w.name, value: w.id })),
    },
    {
      type: "select",
      label: "Type",
      key: "type",
      options: [
        { label: "Deposit", value: "DEPOSIT" },
        { label: "Withdrawal", value: "WITHDRAWAL" },
      ],
    },
    {
      type: "select",
      label: "Purpose",
      key: "purpose",
      options: purposes.map((p) => ({ label: p.name, value: p.id })),
    },
  ], [wallets, purposes]);

  const columns: ColumnDef<WalletTransactionRecord>[] = [
    {
      accessorKey: "referenceNo",
      header: "Reference",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-slate-800 text-xs">
          {row.original.referenceNo}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => {
        const d = new Date(row.original.createdAt);
        return (
          <span className="text-slate-700 whitespace-nowrap text-sm">
            {d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}<br/>
            <span className="text-xs text-slate-400">{d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </span>
        );
      },
    },
    {
      accessorKey: "walletType",
      header: "Wallet",
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-slate-800 text-sm">{row.original.walletType?.name}</p>
          <p className="text-xs text-slate-400">{row.original.walletType?.kind}</p>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const isDeposit = row.original.type === "DEPOSIT";
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
            isDeposit ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}>
            {isDeposit ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
            {row.original.type}
          </span>
        );
      },
    },
    {
      accessorKey: "purpose",
      header: "Purpose / Note",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-slate-800 text-sm">{row.original.purpose?.name || "General Transfer"}</p>
          {row.original.note && <p className="text-xs text-slate-400 truncate max-w-xs">{row.original.note}</p>}
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const isDeposit = row.original.type === "DEPOSIT";
        return (
          <span className={`font-bold text-base ${isDeposit ? "text-emerald-600" : "text-red-600"}`}>
            {isDeposit ? "+" : "-"}৳{Number(row.original.amount).toLocaleString()}
          </span>
        );
      },
    },
    {
      accessorKey: "balanceAfter",
      header: "Balance After",
      cell: ({ row }) => (
        <span className="font-semibold text-slate-700 text-sm">
          ৳{Number(row.original.balanceAfter).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "recordedBy",
      header: "Recorded By",
      cell: ({ row }) => (
        <span className="text-xs text-slate-600 font-medium">
          {row.original.recordedBy?.name || "System"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Transaction History</h2>
          <p className="text-xs text-slate-500">Live ledger of deposits, withdrawals, and account balancing</p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Record Transaction
        </button>
      </div>

      <FilterBar 
        searchPlaceholder="Search by reference, note..."
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

      {/* Record Transaction Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Record Wallet Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Transaction Type *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "DEPOSIT" })}
                  className={`py-2 px-3 rounded-lg text-sm font-semibold border flex items-center justify-center gap-2 transition-colors ${
                    formData.type === "DEPOSIT"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" /> Deposit
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "WITHDRAWAL" })}
                  className={`py-2 px-3 rounded-lg text-sm font-semibold border flex items-center justify-center gap-2 transition-colors ${
                    formData.type === "WITHDRAWAL"
                      ? "bg-red-50 border-red-500 text-red-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" /> Withdrawal
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Target Wallet *</label>
              <select
                value={formData.walletTypeId}
                onChange={(e) => setFormData({ ...formData, walletTypeId: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} (Balance: ৳{Number(w.currentBalance).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Amount (৳) *</label>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.amount || ""}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Purpose</label>
              <select
                value={formData.purposeId}
                onChange={(e) => setFormData({ ...formData, purposeId: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
              >
                <option value="">Select Purpose (Optional)</option>
                {purposes.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Notes / Description</label>
              <Textarea
                placeholder="Details of the deposit or withdrawal..."
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
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
                Submit Transaction
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
