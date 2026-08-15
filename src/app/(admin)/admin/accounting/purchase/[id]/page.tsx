"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { useParams, useRouter } from "next/navigation";
import { mockPurchaseOrders } from "@/lib/mock-data/accounting/purchase-orders";
import { ArrowLeft, Printer, Download, PackageCheck } from "lucide-react";
import { StatusBadge } from "@/components/admin/DataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function PurchaseOrderViewPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const params = useParams();
  const router = useRouter();

  const po = mockPurchaseOrders.find(p => p.id === params.id) || mockPurchaseOrders[0];

  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState(po.status);
  const [localDue, setLocalDue] = useState(po.due);

  useEffect(() => {
    setTitle(`Purchase Order: ${po.poNumber}`);
    setBadge("Accounting");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [po]);

  const handleReceive = () => {
    toast.success("Items received successfully. Status updated to Received.");
    setLocalStatus("Received");
    setReceiveDialogOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 font-medium transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Purchase Orders
        </button>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors text-sm flex items-center gap-2 shadow-sm">
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <button className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors text-sm flex items-center gap-2 shadow-sm">
            <Printer className="w-4 h-4" /> Print
          </button>
          {(localStatus === "Ordered" || localStatus === "Partially Received") && (
            <button 
              onClick={() => setReceiveDialogOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm flex items-center gap-2 shadow-sm"
            >
              <PackageCheck className="w-4 h-4" /> Receive Items
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Header Info */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-8 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800 mb-2">{po.poNumber}</h1>
            <div className="flex items-center gap-3 mb-4">
              <StatusBadge status={localStatus} type={localStatus === "Received" ? "success" : localStatus === "Cancelled" ? "error" : "warning"} />
              <span className="text-sm font-medium text-slate-500">{po.date}</span>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">Supplier</h3>
            <p className="text-lg font-semibold text-emerald-700">{po.supplierName}</p>
            <p className="text-sm text-slate-500 mt-1">Branch: {po.branch}</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-8">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-y border-slate-100 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Product Name</th>
                <th className="px-4 py-3 font-semibold text-center w-24">Qty</th>
                <th className="px-4 py-3 font-semibold text-right w-32">Unit Cost</th>
                <th className="px-4 py-3 font-semibold text-right w-40">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {po.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-4 font-medium text-slate-800">{item.productName}</td>
                  <td className="px-4 py-4 text-center">{item.quantity}</td>
                  <td className="px-4 py-4 text-right">৳{item.unitCost.toLocaleString()}</td>
                  <td className="px-4 py-4 text-right font-semibold text-slate-800">৳{item.lineTotal.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-80 space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-medium text-slate-800">৳{po.subtotal.toLocaleString()}</span>
            </div>
            {po.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span className="font-medium">- ৳{po.discount.toLocaleString()}</span>
              </div>
            )}
            {po.tax > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Tax</span>
                <span className="font-medium">৳{po.tax.toLocaleString()}</span>
              </div>
            )}
            {po.shipping > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="font-medium">৳{po.shipping.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-center border-t border-slate-200 pt-3 mt-3">
              <span className="text-base font-bold text-slate-800">Grand Total</span>
              <span className="text-xl font-black text-emerald-600">৳{po.grandTotal.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg mt-4 border border-slate-100">
              <div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Paid</div>
                <div className="font-bold text-slate-800">৳{po.paid.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-rose-500 font-medium uppercase tracking-wider mb-1">Due</div>
                <div className="font-bold text-rose-600">৳{localDue.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Receive Items Dialog */}
      <Dialog open={receiveDialogOpen} onOpenChange={setReceiveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Receive Items</DialogTitle>
          </DialogHeader>
          <div className="pt-4 space-y-4">
            <p className="text-sm text-slate-600">Confirm receipt of the following items for <strong>{po.poNumber}</strong>:</p>
            
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-2 max-h-[200px] overflow-y-auto">
              {po.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{item.productName}</span>
                  <span className="text-slate-500 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">Qty: {item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button 
                onClick={() => setReceiveDialogOpen(false)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleReceive}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm"
              >
                Confirm Receipt
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
