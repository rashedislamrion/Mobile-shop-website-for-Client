"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { DataTable } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { mockSupplierPayments, SupplierPaymentRecord } from "@/lib/mock-data/accounting/supplier-payments";
import { mockSuppliers } from "@/lib/mock-data/accounting/suppliers";
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

export default function SupplierPaymentsPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [localData, setLocalData] = useState<SupplierPaymentRecord[]>(mockSupplierPayments);
  const [suppliersData, setSuppliersData] = useState(mockSuppliers); // Track to update due amounts
  
  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<SupplierPaymentRecord>>({
    date: new Date().toISOString().split("T")[0],
    supplierId: "",
    amountPaid: 0,
    paymentMethod: "Cash",
    paidFromWallet: "",
    relatedPurchaseOrder: "",
    note: ""
  });

  useEffect(() => {
    setTitle("Supplier Payments");
    setBadge("Accounting");
    setDateFilter("This Month"); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = () => {
    if (!formData.supplierId || !formData.amountPaid) {
      toast.error("Please fill all required fields");
      return;
    }

    const supplier = suppliersData.find(s => s.id === formData.supplierId);
    if (!supplier) return;

    if (formData.amountPaid > supplier.totalDue) {
      toast.error("Payment amount exceeds outstanding due");
      return;
    }

    const newRecord: SupplierPaymentRecord = {
      ...formData,
      id: `sp${Date.now()}`,
      referenceNo: `SP-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      supplierName: supplier.supplierName,
      recordedBy: "Admin User", 
    } as SupplierPaymentRecord;
    
    // Update local payments data
    setLocalData(prev => [newRecord, ...prev]);

    // Update supplier due amount
    setSuppliersData(prev => prev.map(s => 
      s.id === supplier.id ? { ...s, totalDue: s.totalDue - (formData.amountPaid || 0) } : s
    ));

    toast.success("Payment recorded successfully");
    setDialogOpen(false);
  };

  const selectedSupplierDue = formData.supplierId 
    ? suppliersData.find(s => s.id === formData.supplierId)?.totalDue || 0
    : 0;

  const columns: ColumnDef<SupplierPaymentRecord>[] = [
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
      accessorKey: "supplierName",
      header: "Supplier",
      cell: ({ row }) => <span className="font-semibold text-slate-800">{row.original.supplierName}</span>
    },
    {
      accessorKey: "amountPaid",
      header: "Amount Paid",
      cell: ({ row }) => <span className="font-bold text-emerald-600">৳{row.original.amountPaid.toLocaleString()}</span>
    },
    {
      accessorKey: "paymentMethod",
      header: "Method & Wallet",
      cell: ({ row }) => (
        <div>
          <div className="text-sm font-medium text-slate-700">{row.original.paymentMethod}</div>
          <div className="text-xs text-slate-500">{row.original.paidFromWallet}</div>
        </div>
      )
    },
    {
      accessorKey: "relatedPurchaseOrder",
      header: "Related PO",
      cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.relatedPurchaseOrder || "N/A"}</span>
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Record Payment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Record Supplier Payment</DialogTitle>
          </DialogHeader>
          <div className="pt-4 space-y-4">
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Select Supplier *</label>
              <select 
                className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                value={formData.supplierId}
                onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
              >
                <option value="">Choose Supplier...</option>
                {suppliersData.filter(s => s.totalDue > 0).map(s => (
                  <option key={s.id} value={s.id}>{s.supplierName} (Due: ৳{s.totalDue.toLocaleString()})</option>
                ))}
              </select>
              {formData.supplierId && (
                <p className="text-xs text-rose-600 font-medium">Outstanding Due: ৳{selectedSupplierDue.toLocaleString()}</p>
              )}
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
                  value={formData.amountPaid}
                  onChange={e => setFormData({ ...formData, amountPaid: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Payment Method</label>
                <select 
                  className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  value={formData.paymentMethod}
                  onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="bKash">bKash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Wallet Account</label>
                <select 
                  className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  value={formData.paidFromWallet}
                  onChange={e => setFormData({ ...formData, paidFromWallet: e.target.value })}
                >
                  <option value="">Select Wallet...</option>
                  {mockWalletTypes.map(w => (
                    <option key={w.id} value={w.name}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Related PO (Optional)</label>
              <Input 
                placeholder="e.g. PO-2608-001"
                value={formData.relatedPurchaseOrder}
                onChange={e => setFormData({ ...formData, relatedPurchaseOrder: e.target.value })}
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
                Record Payment
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center">
        <FilterBar 
          searchPlaceholder="Search supplier or reference..."
          onSearch={() => {}}
          onReset={() => {}}
          filters={[
            {
              key: "supplier",
              label: "Supplier",
              options: mockSuppliers.map(s => ({ label: s.supplierName, value: s.id }))
            },
            {
              key: "method",
              label: "Method",
              options: [
                { label: "Cash", value: "Cash" },
                { label: "Bank Transfer", value: "Bank Transfer" },
                { label: "bKash", value: "bKash" },
                { label: "Cheque", value: "Cheque" }
              ]
            }
          ]}
        />
        <button 
          onClick={() => {
            setFormData({
              date: new Date().toISOString().split("T")[0],
              supplierId: "",
              amountPaid: 0,
              paymentMethod: "Cash",
              paidFromWallet: "",
              relatedPurchaseOrder: "",
              note: ""
            });
            setDialogOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm whitespace-nowrap ml-4 shrink-0"
        >
          <Plus className="w-4 h-4" /> Record Payment
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
