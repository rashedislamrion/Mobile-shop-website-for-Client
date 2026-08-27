"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { apiGet, apiPost } from "@/lib/api-client";
import { Wallet, Calendar, Banknote, Tag, FileText, CheckSquare, Square, Info, ShieldCheck } from "lucide-react";

export interface PaymentSettlementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: "customer" | "supplier";
  entityId: string;
  entityName: string;
  totalDue: number;
  onPaymentSuccess?: () => void;
}

interface InvoiceItem {
  id: string;
  code: string;
  date: string;
  totalAmount: number;
  dueAmount: number;
}

export function PaymentSettlementDialog({
  open,
  onOpenChange,
  entityType,
  entityId,
  entityName,
  totalDue,
  onPaymentSuccess,
}: PaymentSettlementDialogProps) {
  const [settlementMethod, setSettlementMethod] = useState<"quick" | "invoice">("quick");
  const [wallets, setWallets] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [payingAmount, setPayingAmount] = useState<number | string>("");
  const [extraDiscount, setExtraDiscount] = useState<number | string>(0);
  const [walletTypeId, setWalletTypeId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSettlementMethod("quick");
      setPayingAmount("");
      setExtraDiscount(0);
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setNotes("");
      setSelectedInvoiceIds([]);

      // Fetch wallets
      apiGet<any[]>("/wallet-types")
        .then((res) => {
          if (Array.isArray(res) && res.length > 0) {
            setWallets(res);
            setWalletTypeId(res[0].id);
          }
        })
        .catch(() => {});
    }
  }, [open]);

  // Fetch unpaid invoices for Invoice Wise mode
  useEffect(() => {
    if (!open || !entityId) return;

    setIsLoadingInvoices(true);
    if (entityType === "customer") {
      apiGet<any[]>(`/reports/customer-due/${entityId}/unpaid-orders`)
        .then((res) => {
          if (Array.isArray(res)) {
            const mapped = res.map((item: any) => ({
              id: item.id,
              code: item.orderNumber ? `ORD-${item.orderNumber}` : item.id.slice(-8).toUpperCase(),
              date: item.createdAt,
              totalAmount: Number(item.totalAmount || 0),
              dueAmount: Number(item.dueAmount || 0),
            }));
            setInvoices(mapped);
          }
        })
        .catch(() => {
          setInvoices([]);
        })
        .finally(() => setIsLoadingInvoices(false));
    } else {
      // Supplier unpaid POs
      apiGet<any>(`/suppliers/${entityId}`)
        .then((res) => {
          if (res?.purchaseOrders && Array.isArray(res.purchaseOrders)) {
            const unpaidPOs = res.purchaseOrders
              .filter((po: any) => Number(po.dueAmount || 0) > 0)
              .map((po: any) => ({
                id: po.id,
                code: po.poNumber || `PO-${po.id.slice(-6).toUpperCase()}`,
                date: po.createdAt || po.orderDate,
                totalAmount: Number(po.grandTotal || 0),
                dueAmount: Number(po.dueAmount || 0),
              }));
            setInvoices(unpaidPOs);
          }
        })
        .catch(() => {
          setInvoices([]);
        })
        .finally(() => setIsLoadingInvoices(false));
    }
  }, [open, entityId, entityType]);

  // Invoice selection logic
  const handleToggleInvoice = (invId: string) => {
    let next: string[];
    if (selectedInvoiceIds.includes(invId)) {
      next = selectedInvoiceIds.filter((id) => id !== invId);
    } else {
      next = [...selectedInvoiceIds, invId];
    }
    setSelectedInvoiceIds(next);

    // Auto-sum selected invoices into paying amount
    const sum = next.reduce((total, id) => {
      const inv = invoices.find((i) => i.id === id);
      return total + (inv ? Number(inv.dueAmount) : 0);
    }, 0);

    setPayingAmount(sum > 0 ? sum : "");
  };

  const handleSelectAllInvoices = () => {
    if (selectedInvoiceIds.length === invoices.length) {
      setSelectedInvoiceIds([]);
      setPayingAmount("");
    } else {
      const allIds = invoices.map((i) => i.id);
      setSelectedInvoiceIds(allIds);
      const sum = invoices.reduce((total, i) => total + Number(i.dueAmount), 0);
      setPayingAmount(sum);
    }
  };

  // Safe live calculations with explicit Number() casting
  const numericTotalDue = Number(totalDue) || 0;
  const numericPaying = Number(payingAmount) || 0;
  const numericDiscount = Number(extraDiscount) || 0;
  const numericRemainingUnpaid = Math.max(0, numericTotalDue - (numericPaying + numericDiscount));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (numericPaying <= 0 && numericDiscount <= 0) {
      toast.error("Please enter a valid payment amount or discount");
      return;
    }

    if (!walletTypeId && numericPaying > 0) {
      toast.error("Please select a deposit / payment wallet account");
      return;
    }

    if (numericPaying + numericDiscount > numericTotalDue) {
      toast.error(`Total payment (৳${(numericPaying + numericDiscount).toLocaleString()}) cannot exceed total due balance (৳${numericTotalDue.toLocaleString()})`);
      return;
    }

    try {
      setIsSubmitting(true);

      if (entityType === "customer") {
        await apiPost("/reports/customer-due/payment", {
          customerId: entityId,
          amount: numericPaying,
          extraDiscount: numericDiscount,
          walletTypeId,
          paymentMethod,
          paymentDate,
          notes: notes.trim() || undefined,
          orderIds: settlementMethod === "invoice" && selectedInvoiceIds.length > 0 ? selectedInvoiceIds : undefined,
        });
        toast.success(`Payment of ৳${numericPaying.toLocaleString()} recorded for customer ${entityName}`);
      } else {
        await apiPost("/supplier-payments", {
          supplierId: entityId,
          amount: numericPaying,
          amountPaid: numericPaying,
          extraDiscount: numericDiscount,
          walletTypeId,
          paymentMethod,
          method: paymentMethod,
          paymentDate,
          note: notes.trim() || undefined,
          purchaseOrderIds: settlementMethod === "invoice" && selectedInvoiceIds.length > 0 ? selectedInvoiceIds : undefined,
        });
        toast.success(`Payment of ৳${numericPaying.toLocaleString()} recorded for supplier ${entityName}`);
      }

      onOpenChange(false);
      if (onPaymentSuccess) onPaymentSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] p-0 overflow-hidden rounded-2xl border border-slate-200">
        <DialogHeader className="px-6 pt-6 pb-3 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                {entityType === "customer" ? "Record Customer Payment" : "Make Supplier Payment"}
              </DialogTitle>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {entityType === "customer" ? "Customer" : "Supplier"}: <span className="font-semibold text-slate-800">{entityName}</span>
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              entityType === "customer" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
            }`}>
              {entityType}
            </span>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Top 3 Summary Cards Row */}
          <div className="grid grid-cols-3 gap-3">
            {/* Box 1: TOTAL UNPAID (Amber/Orange Tint) */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-center">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                TOTAL UNPAID
              </span>
              <p className="text-base sm:text-lg font-extrabold text-amber-900 mt-1">
                ৳{numericTotalDue.toLocaleString()}
              </p>
            </div>

            {/* Box 2: PAYING (Green Tint) */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 text-center">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                PAYING
              </span>
              <p className="text-base sm:text-lg font-extrabold text-emerald-900 mt-1">
                ৳{numericPaying.toLocaleString()}
              </p>
            </div>

            {/* Box 3: REMAINING UNPAID (Blue Tint) */}
            <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 text-center">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                REMAINING UNPAID
              </span>
              <p className="text-base sm:text-lg font-extrabold text-blue-900 mt-1">
                ৳{numericRemainingUnpaid.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Settlement Method Tabs Toggle */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
              Settlement Method
            </label>
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setSettlementMethod("quick")}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  settlementMethod === "quick"
                    ? "bg-white text-emerald-800 shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Quick Payment
              </button>
              <button
                type="button"
                onClick={() => setSettlementMethod("invoice")}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  settlementMethod === "invoice"
                    ? "bg-white text-emerald-800 shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Invoice Wise ({invoices.length})
              </button>
            </div>

            {/* Helper Text for Quick Payment */}
            {settlementMethod === "quick" && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                Oldest invoices will be cleared automatically based on the total amount.
              </p>
            )}
          </div>

          {/* Invoice Wise Selection Table */}
          {settlementMethod === "invoice" && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-2 max-h-48 overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <button
                  type="button"
                  onClick={handleSelectAllInvoices}
                  className="flex items-center gap-1.5 hover:text-emerald-700 text-slate-700"
                >
                  {selectedInvoiceIds.length === invoices.length && invoices.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  Select All
                </button>
                <span>Due Balance</span>
              </div>

              {isLoadingInvoices ? (
                <p className="text-xs text-slate-400 py-3 text-center">Loading unpaid invoices...</p>
              ) : invoices.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">No individual unpaid invoices found.</p>
              ) : (
                invoices.map((inv) => {
                  const isChecked = selectedInvoiceIds.includes(inv.id);
                  return (
                    <div
                      key={inv.id}
                      onClick={() => handleToggleInvoice(inv.id)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                        isChecked ? "bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium" : "bg-white border border-slate-100 hover:bg-slate-100/60 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <div>
                          <span className="font-mono font-bold">{inv.code}</span>
                          <span className="text-[10px] text-slate-400 ml-2">
                            {new Date(inv.date).toLocaleDateString("en-GB")}
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-rose-600">৳{inv.dueAmount.toLocaleString()}</span>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Form Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Deposit Account / Wallet */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                {entityType === "customer" ? "Deposit Account *" : "Payment Wallet Account *"}
              </label>
              <select
                value={walletTypeId}
                onChange={(e) => setWalletTypeId(e.target.value)}
                className="w-full h-10 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-800"
                required
              >
                <option value="">Select Account...</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} (Bal: ৳{Number(w.currentBalance).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Transaction Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                Transaction Date *
              </label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="h-10 text-xs font-medium"
                required
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full h-10 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-800"
              >
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="BKASH">bKash</option>
                <option value="SSLCOMMERZ">SSLCommerz / Card</option>
                <option value="CHEQUE">Cheque</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Paying Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                {entityType === "customer" ? "Collection Amount (৳) *" : "Payment Amount (৳) *"}
              </label>
              <Input
                type="number"
                min={0}
                max={numericTotalDue}
                value={payingAmount}
                onChange={(e) => setPayingAmount(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="0"
                className="h-10 text-sm font-bold text-emerald-700"
                required
              />
            </div>
          </div>

          {/* Extra Discount Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-amber-600" />
              Extra Goodwill Discount (৳) <span className="text-slate-400 font-normal">(Optional, reduces due without cash payment)</span>
            </label>
            <Input
              type="number"
              min={0}
              value={extraDiscount}
              onChange={(e) => setExtraDiscount(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="0"
              className="h-9 text-xs font-medium"
            />
          </div>

          {/* Settlement Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              Settlement Notes
            </label>
            <Textarea
              placeholder="Add payment reference, cheque number, or transaction ID..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none h-16 text-xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-xl transition-colors text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (numericPaying <= 0 && numericDiscount <= 0)}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-xs flex items-center gap-1.5 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              {isSubmitting ? "Processing..." : entityType === "customer" ? "Record Customer Payment" : "Make Supplier Payment"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
