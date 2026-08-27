"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { DataTable, StatusBadge } from "@/components/admin/DataTable";
import { ColoredStatCard } from "@/components/admin/ColoredStatCard";
import { ColumnDef } from "@tanstack/react-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ticket, Copy, RotateCcw, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import { format } from "date-fns";

export interface PromoCodeRecord {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  maxDiscountCap?: number | null;
  minOrderAmount?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
}

export default function PromoCodePage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [data, setData] = useState<PromoCodeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newPromo, setNewPromo] = useState({
    code: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED_AMOUNT",
    discountValue: 10,
    maxDiscountCap: "",
    minOrderAmount: "",
    usageLimit: "",
    validFrom: new Date().toISOString().split("T")[0],
    validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
  });

  const fetchPromoCodes = async () => {
    setIsLoading(true);
    try {
      const res = await apiGet<PromoCodeRecord[]>("/promo-codes");
      setData(res || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load promo codes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setTitle("Promo Codes & Coupons");
    setBadge("Marketing");
    setDateFilter("");
    fetchPromoCodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerateCode = () => {
    const randomCode = "NOVA" + Math.random().toString(36).substring(2, 6).toUpperCase();
    setNewPromo({ ...newPromo, code: randomCode });
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromo.code || !newPromo.discountValue) {
      toast.error("Please fill in code and discount value.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiPost("/promo-codes", {
        code: newPromo.code.trim().toUpperCase(),
        discountType: newPromo.discountType,
        discountValue: Number(newPromo.discountValue),
        maxDiscountCap: newPromo.maxDiscountCap ? Number(newPromo.maxDiscountCap) : undefined,
        minOrderAmount: newPromo.minOrderAmount ? Number(newPromo.minOrderAmount) : undefined,
        usageLimit: newPromo.usageLimit ? Number(newPromo.usageLimit) : undefined,
        validFrom: new Date(newPromo.validFrom).toISOString(),
        validUntil: new Date(newPromo.validUntil).toISOString(),
        status: newPromo.status,
      });
      toast.success("Promo code created successfully!");
      setIsDialogOpen(false);
      setNewPromo({
        code: "",
        discountType: "PERCENTAGE",
        discountValue: 10,
        maxDiscountCap: "",
        minOrderAmount: "",
        usageLimit: "",
        validFrom: new Date().toISOString().split("T")[0],
        validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        status: "ACTIVE",
      });
      fetchPromoCodes();
    } catch (err: any) {
      toast.error(err.message || "Failed to create promo code");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await apiDelete(`/promo-codes/${id}`);
      toast.success("Promo code deleted");
      fetchPromoCodes();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete coupon");
    }
  };

  const handleToggleStatus = async (promo: PromoCodeRecord) => {
    const nextStatus = promo.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await apiPatch(`/promo-codes/${promo.id}`, { status: nextStatus });
      toast.success(`Coupon is now ${nextStatus.toLowerCase()}`);
      setData(data.map((p) => (p.id === promo.id ? { ...p, status: nextStatus } : p)));
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied: ${text}`);
  };

  const activeCount = data.filter((p) => p.status === "ACTIVE").length;
  const totalUsed = data.reduce((acc, p) => acc + (p.usedCount || 0), 0);

  const columns: ColumnDef<PromoCodeRecord>[] = [
    {
      accessorKey: "code",
      header: "Coupon Code",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-extrabold text-sm text-slate-800 bg-slate-100 px-2 py-0.5 rounded border">
            {row.original.code}
          </span>
          <button
            onClick={() => copyToClipboard(row.original.code)}
            className="text-slate-400 hover:text-slate-700"
            title="Copy Code"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
    {
      accessorKey: "discountValue",
      header: "Discount",
      cell: ({ row }) => (
        <span className="font-bold text-emerald-600">
          {row.original.discountType === "PERCENTAGE"
            ? `${row.original.discountValue}%`
            : `৳${Number(row.original.discountValue).toLocaleString()}`}
          {row.original.maxDiscountCap && (
            <span className="text-[11px] text-slate-400 block font-normal">
              Max Cap: ৳{Number(row.original.maxDiscountCap).toLocaleString()}
            </span>
          )}
        </span>
      ),
    },
    {
      accessorKey: "minOrderAmount",
      header: "Min Order",
      cell: ({ row }) => (
        <span className="text-xs text-slate-600">
          {row.original.minOrderAmount ? `৳${Number(row.original.minOrderAmount).toLocaleString()}` : "No min"}
        </span>
      ),
    },
    {
      accessorKey: "usedCount",
      header: "Redemptions",
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-slate-700">
          {row.original.usedCount} {row.original.usageLimit ? `/ ${row.original.usageLimit}` : ""}
        </span>
      ),
    },
    {
      id: "validity",
      header: "Validity Period",
      cell: ({ row }) => (
        <span className="text-xs text-slate-500">
          {format(new Date(row.original.validFrom), "MMM d")} - {format(new Date(row.original.validUntil), "MMM d, yyyy")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status;
        const type = s === "ACTIVE" ? "success" : s === "EXPIRED" ? "neutral" : "warning";
        return <StatusBadge status={s} type={type as any} />;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleStatus(row.original)}
            className="text-xs text-slate-600"
          >
            {row.original.status === "ACTIVE" ? "Disable" : "Enable"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(row.original.id)}
            className="text-slate-400 hover:text-danger"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ColoredStatCard label="Total Coupons" value={data.length.toString()} icon={<Ticket className="w-5 h-5" />} colorTint="blue" />
        <ColoredStatCard label="Active Promos" value={activeCount.toString()} icon={<Ticket className="w-5 h-5" />} colorTint="green" />
        <ColoredStatCard label="Total Redemptions" value={totalUsed.toString()} icon={<Ticket className="w-5 h-5" />} colorTint="yellow" />
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-800">Coupon Code Manager</h2>
          <p className="text-xs text-slate-500">Create and manage discounts and promotional coupon codes</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs">
          <Plus className="w-4 h-4 mr-1.5" /> Create Promo Code
        </Button>
      </div>

      <div className="bg-white border rounded-xl shadow-sm">
        <DataTable columns={columns} data={data} isLoading={isLoading} />
      </div>

      {/* Create Promo Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Promo Code</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSavePromo} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">Coupon Code *</label>
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  className="text-xs text-emerald-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3 h-3" /> Auto-Generate
                </button>
              </div>
              <Input
                placeholder="e.g. SUMMER2026"
                value={newPromo.code}
                onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                required
                className="font-mono font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Discount Type</label>
                <Select
                  value={newPromo.discountType}
                  onValueChange={(val: any) => setNewPromo({ ...newPromo, discountType: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">Fixed Amount (৳)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Discount Value *</label>
                <Input
                  type="number"
                  placeholder="10"
                  value={newPromo.discountValue}
                  onChange={(e) => setNewPromo({ ...newPromo, discountValue: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Max Discount Cap (৳)</label>
                <Input
                  type="number"
                  placeholder="Optional max cap"
                  value={newPromo.maxDiscountCap}
                  onChange={(e) => setNewPromo({ ...newPromo, maxDiscountCap: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Min Order Amount (৳)</label>
                <Input
                  type="number"
                  placeholder="Optional min order"
                  value={newPromo.minOrderAmount}
                  onChange={(e) => setNewPromo({ ...newPromo, minOrderAmount: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Valid From</label>
                <Input
                  type="date"
                  value={newPromo.validFrom}
                  onChange={(e) => setNewPromo({ ...newPromo, validFrom: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Valid Until</label>
                <Input
                  type="date"
                  value={newPromo.validUntil}
                  onChange={(e) => setNewPromo({ ...newPromo, validUntil: e.target.value })}
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Coupon"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
