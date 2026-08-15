"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { FilterBar } from "@/components/admin/FilterBar";
import { DataTable, StatusBadge } from "@/components/admin/DataTable";
import { ColoredStatCard } from "@/components/admin/ColoredStatCard";
import { mockPromoCodes, PromoCodeRecord } from "@/lib/mock-data/marketing/promo-codes";
import { ColumnDef } from "@tanstack/react-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Ticket, Copy, CheckCircle2, RotateCcw, Plus, Activity, HandCoins, Edit, Trash2, Power } from "lucide-react";
import { toast } from "sonner";

export default function PromoCodePage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [data, setData] = useState<PromoCodeRecord[]>(mockPromoCodes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [newPromo, setNewPromo] = useState({
    code: "",
    discountType: "Percentage" as "Percentage" | "Fixed Amount",
    discountValue: 10,
    maxCap: "",
    minOrder: "",
    usageLimit: "",
    customerLimit: "1",
    appliesTo: "All Products" as "All Products" | "Specific Category" | "Specific Products",
    validFrom: "",
    validUntil: "",
    status: "Active" as const
  });

  useEffect(() => {
    setTitle("Promo Code");
    setBadge("Marketing");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerateCode = () => {
    const randomCode = "PROMO" + Math.random().toString(36).substring(2, 6).toUpperCase();
    setNewPromo({ ...newPromo, code: randomCode });
  };

  const handleSavePromo = () => {
    if (!newPromo.code || !newPromo.discountValue) {
      toast.error("Please fill in the required fields");
      return;
    }
    
    const promo: PromoCodeRecord = {
      id: `pc-${Date.now()}`,
      code: newPromo.code,
      discountType: newPromo.discountType,
      discountValue: Number(newPromo.discountValue),
      maxCap: newPromo.maxCap ? Number(newPromo.maxCap) : undefined,
      minOrder: newPromo.minOrder ? Number(newPromo.minOrder) : undefined,
      usageCount: 0,
      usageLimit: newPromo.usageLimit ? Number(newPromo.usageLimit) : undefined,
      customerLimit: newPromo.customerLimit ? Number(newPromo.customerLimit) : undefined,
      appliesTo: newPromo.appliesTo,
      validFrom: newPromo.validFrom,
      validUntil: newPromo.validUntil,
      status: newPromo.status
    };
    
    setData([promo, ...data]);
    setIsDialogOpen(false);
    toast.success("Promo code created successfully");
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this promo code?")) {
      setData(data.filter(p => p.id !== id));
      toast.success("Promo code deleted");
    }
  };

  const handleToggleStatus = (id: string) => {
    setData(data.map(p => {
      if (p.id === id) {
        return { ...p, status: p.status === "Active" ? "Disabled" : "Active" };
      }
      return p;
    }));
    toast.success("Status updated");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied: ${text}`);
  };

  const columns: ColumnDef<PromoCodeRecord>[] = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-slate-800 uppercase px-2 py-1 bg-slate-100 rounded border border-slate-200">
            {row.original.code}
          </span>
          <button 
            onClick={() => copyToClipboard(row.original.code)}
            className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    },
    {
      id: "discount",
      header: "Discount",
      cell: ({ row }) => {
        const { discountType, discountValue } = row.original;
        return (
          <span className="font-bold text-emerald-600">
            {discountType === "Percentage" ? `${discountValue}% OFF` : `৳${discountValue.toLocaleString()} OFF`}
          </span>
        );
      }
    },
    {
      accessorKey: "minOrder",
      header: "Min. Order",
      cell: ({ row }) => row.original.minOrder ? `৳${row.original.minOrder.toLocaleString()}` : <span className="text-slate-400">—</span>
    },
    {
      id: "usage",
      header: "Usage",
      cell: ({ row }) => {
        const { usageCount, usageLimit } = row.original;
        const limitStr = usageLimit ? usageLimit.toLocaleString() : "∞";
        const percent = usageLimit ? Math.min((usageCount / usageLimit) * 100, 100) : 0;
        
        return (
          <div className="w-24">
            <div className="text-xs font-medium text-slate-600 mb-1">{usageCount.toLocaleString()} / {limitStr}</div>
            {usageLimit && (
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${percent >= 90 ? "bg-rose-500" : percent >= 75 ? "bg-amber-500" : "bg-emerald-500"}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            )}
          </div>
        );
      }
    },
    {
      id: "validPeriod",
      header: "Valid Period",
      cell: ({ row }) => (
        <div className="flex flex-col text-xs text-slate-600">
          <span>{row.original.validFrom} to</span>
          <span>{row.original.validUntil}</span>
        </div>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status;
        const type = s === "Active" ? "success" : s === "Scheduled" ? "info" : s === "Disabled" ? "warning" : "neutral";
        return <StatusBadge status={s} type={type as any} />;
      }
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="Edit">
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleToggleStatus(row.original.id)}
            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors" 
            title={row.original.status === "Disabled" ? "Activate" : "Deactivate"}
          >
            <Power className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDelete(row.original.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ColoredStatCard 
          icon={<Activity className="w-5 h-5" />}
          label="Active Codes"
          value={data.filter(p => p.status === "Active").length.toString()}
          colorTint="emerald"
        />
        <ColoredStatCard 
          icon={<RotateCcw className="w-5 h-5" />}
          label="Total Redemptions"
          value={data.reduce((sum, p) => sum + p.usageCount, 0).toLocaleString()}
          colorTint="blue"
        />
        <ColoredStatCard 
          icon={<HandCoins className="w-5 h-5" />}
          label="Total Discount Given"
          value={`৳${(45000).toLocaleString()}`} // Mock static value
          colorTint="orange"
        />
      </div>

      <div className="flex justify-end">
        <button 
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Promo Code
        </button>
      </div>

      <FilterBar 
        onSearch={() => {}}
        onReset={() => {}}
        searchPlaceholder="Search code..."
        filters={[
          {
            key: "status",
            label: "Status",
            type: "select",
            options: ["Active", "Scheduled", "Expired", "Disabled"]
          },
          {
            key: "discountType",
            label: "Discount Type",
            type: "select",
            options: ["Percentage", "Fixed Amount"]
          }
        ]}
      />

      <DataTable 
        columns={columns}
        data={data}
        pageSize={10}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Promo Code</DialogTitle>
          </DialogHeader>
          <div className="pt-4 space-y-5">
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Code *</label>
              <div className="flex gap-2">
                <Input 
                  placeholder="e.g. EASTER20" 
                  value={newPromo.code}
                  onChange={e => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                  className="font-mono uppercase"
                />
                <button 
                  onClick={handleGenerateCode}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-md transition-colors text-sm shrink-0"
                >
                  Generate
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Discount Type *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input 
                      type="radio" 
                      name="discountType" 
                      value="Percentage"
                      checked={newPromo.discountType === "Percentage"}
                      onChange={() => setNewPromo({ ...newPromo, discountType: "Percentage" })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    /> Percentage
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input 
                      type="radio" 
                      name="discountType" 
                      value="Fixed Amount"
                      checked={newPromo.discountType === "Fixed Amount"}
                      onChange={() => setNewPromo({ ...newPromo, discountType: "Fixed Amount" })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    /> Fixed Amount
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Discount Value *</label>
                <Input 
                  type="number"
                  placeholder={newPromo.discountType === "Percentage" ? "20" : "500"} 
                  value={newPromo.discountValue}
                  onChange={e => setNewPromo({ ...newPromo, discountValue: Number(e.target.value) })}
                />
              </div>
            </div>

            {newPromo.discountType === "Percentage" && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Max Discount Cap (Optional)</label>
                <Input 
                  type="number"
                  placeholder="e.g. 500" 
                  value={newPromo.maxCap}
                  onChange={e => setNewPromo({ ...newPromo, maxCap: e.target.value })}
                />
              </div>
            )}

            {/* Live Preview Text */}
            {newPromo.code && newPromo.discountValue ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-sm text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-1">Customer sees:</span>
                  <span>
                    &quot;<span className="font-mono font-bold">{newPromo.code}</span> — Get {newPromo.discountType === "Percentage" ? `${newPromo.discountValue}%` : `৳${newPromo.discountValue}`} off
                    {newPromo.maxCap && newPromo.discountType === "Percentage" ? `, up to ৳${newPromo.maxCap}` : ""}
                    {newPromo.minOrder ? ` on orders above ৳${newPromo.minOrder}` : ""}
                    &quot;
                  </span>
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Min. Order Amount (Optional)</label>
                <Input 
                  type="number"
                  placeholder="e.g. 1000" 
                  value={newPromo.minOrder}
                  onChange={e => setNewPromo({ ...newPromo, minOrder: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Total Usage Limit (Optional)</label>
                <Input 
                  type="number"
                  placeholder="e.g. 100" 
                  value={newPromo.usageLimit}
                  onChange={e => setNewPromo({ ...newPromo, usageLimit: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Per-Customer Limit (Optional)</label>
                <Input 
                  type="number"
                  placeholder="e.g. 1" 
                  value={newPromo.customerLimit}
                  onChange={e => setNewPromo({ ...newPromo, customerLimit: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Applicable To</label>
                <select 
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500"
                  value={newPromo.appliesTo}
                  onChange={e => setNewPromo({ ...newPromo, appliesTo: e.target.value as any })}
                >
                  <option value="All Products">All Products</option>
                  <option value="Specific Category">Specific Category</option>
                  <option value="Specific Products">Specific Products</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Valid From</label>
                <Input 
                  type="date"
                  value={newPromo.validFrom}
                  onChange={e => setNewPromo({ ...newPromo, validFrom: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Valid Until</label>
                <Input 
                  type="date"
                  value={newPromo.validUntil}
                  onChange={e => setNewPromo({ ...newPromo, validUntil: e.target.value })}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3 pt-2">
              <label className="text-sm font-semibold text-slate-700">Status:</label>
              <select 
                className="h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500"
                value={newPromo.status}
                onChange={e => setNewPromo({ ...newPromo, status: e.target.value as any })}
              >
                <option value="Active">Active</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                onClick={() => setIsDialogOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-medium rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleSavePromo}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm shadow-sm"
              >
                Create Code
              </button>
            </div>

          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
