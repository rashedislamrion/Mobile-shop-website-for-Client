"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Printer, CheckCircle2, ShoppingBag, ArrowRight, Download, Store, User, Phone, MapPin, Calendar, Clock } from "lucide-react";

export interface PosInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
  onNewSale: () => void;
}

export function PosInvoiceModal({
  open,
  onOpenChange,
  order,
  onNewSale,
}: PosInvoiceModalProps) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const isDiagnosing = order.status === "DIAGNOSING" || order.saleType === "DIAGNOSING";
  const isCourier = order.saleType === "COURIER";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden rounded-2xl border border-slate-200 print:border-none print:shadow-none print:max-w-full">
        {/* Screen Only Header Banner */}
        <div className="bg-emerald-600 px-6 py-4 text-white print:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/80 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base">
                  {isDiagnosing ? "Diagnostic Order Created!" : "Sale Completed Successfully!"}
                </h3>
                <p className="text-xs text-emerald-100">
                  Invoice Ref: <span className="font-mono font-bold text-white">{order.orderCode}</span>
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white text-emerald-800 uppercase tracking-wider">
              {order.saleType || "POS"}
            </span>
          </div>
        </div>

        {/* Printable Receipt Content */}
        <div id="printable-receipt" className="p-6 space-y-5 bg-white text-slate-800 text-sm">
          {/* Brand & Store Header */}
          <div className="text-center border-b border-slate-200 pb-4 space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">NOVA MOBILE</h2>
            <p className="text-xs text-slate-500 font-medium">Smart Retail & Device Repair Specialists</p>
            <p className="text-xs text-slate-600 flex items-center justify-center gap-1.5 pt-0.5">
              <Store className="w-3.5 h-3.5 text-slate-400" />
              {order.branch?.name || "Main Branch"}
            </p>
          </div>

          {/* Invoice Metadata Row */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="space-y-1">
              <div>
                <span className="text-slate-400 font-semibold">INVOICE NO:</span>
                <span className="font-mono font-bold text-slate-900 ml-1.5">{order.orderCode}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">DATE:</span>
                <span className="font-medium text-slate-700 ml-1.5">
                  {new Date(order.createdAt || Date.now()).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">STATUS:</span>
                <span className="font-semibold text-emerald-700 ml-1.5 uppercase">{order.status}</span>
              </div>
            </div>

            <div className="space-y-1 text-right">
              <div>
                <span className="text-slate-400 font-semibold">CUSTOMER:</span>
                <span className="font-bold text-slate-900 ml-1.5">{order.customer?.name || "Walk-in Customer"}</span>
              </div>
              {order.customer?.phone && (
                <div>
                  <span className="text-slate-400 font-semibold">PHONE:</span>
                  <span className="font-mono text-slate-700 ml-1.5">{order.customer.phone}</span>
                </div>
              )}
              <div>
                <span className="text-slate-400 font-semibold">PAYMENT:</span>
                <span className="font-bold text-slate-800 ml-1.5 uppercase">{order.paymentStatus}</span>
              </div>
            </div>
          </div>

          {/* Diagnostic Details (if Diagnosing Order) */}
          {isDiagnosing && order.serviceJob && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs space-y-1 text-blue-900">
              <div className="font-bold flex items-center gap-1.5 text-blue-800">
                <Store className="w-3.5 h-3.5" /> Diagnostic Intake Details:
              </div>
              <div><span className="font-semibold text-blue-700">Device:</span> {order.serviceJob.device}</div>
              <div><span className="font-semibold text-blue-700">Reported Issue:</span> {order.serviceJob.issueDescription}</div>
              {order.serviceJob.serviceCharge && (
                <div><span className="font-semibold text-blue-700">Est. Charge:</span> ৳{Number(order.serviceJob.serviceCharge).toLocaleString()}</div>
              )}
            </div>
          )}

          {/* Courier Details (if Courier Order) */}
          {isCourier && order.shipment && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs space-y-1 text-amber-900">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <MapPin className="w-3.5 h-3.5" /> Courier Delivery Details:
              </div>
              <div><span className="font-semibold text-amber-700">Partner:</span> {order.shipment.courierPartner}</div>
              <div><span className="font-semibold text-amber-700">Tracking:</span> <span className="font-mono font-bold">{order.shipment.trackingNo}</span></div>
              {order.shipment.address && (
                <div><span className="font-semibold text-amber-700">Address:</span> {order.shipment.address}</div>
              )}
            </div>
          )}

          {/* Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="py-2.5 px-3 text-left">Item Description</th>
                  <th className="py-2.5 px-3 text-center w-14">Qty</th>
                  <th className="py-2.5 px-3 text-right w-24">Unit (৳)</th>
                  <th className="py-2.5 px-3 text-right w-24">Total (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items?.map((item: any, idx: number) => (
                  <tr key={item.id || idx}>
                    <td className="py-2 px-3">
                      <div className="font-semibold text-slate-800">{item.productNameSnapshot || item.product?.name || "Item"}</div>
                      {item.variant && (
                        <div className="text-[10px] text-slate-500">
                          {item.variant.color ? `Color: ${item.variant.color}` : ""} {item.variant.quality ? `(${item.variant.quality})` : ""}
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-slate-700">{item.quantity}</td>
                    <td className="py-2 px-3 text-right font-medium text-slate-600">
                      {Number(item.unitPrice).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      {Number(item.lineTotal || item.quantity * item.unitPrice).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Totals */}
          <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs max-w-xs ml-auto">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-medium">৳{Number(order.subtotal || 0).toLocaleString()}</span>
            </div>
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount Applied:</span>
                <span className="font-medium">-৳{Number(order.discountAmount).toLocaleString()}</span>
              </div>
            )}
            {Number(order.deliveryCharge) > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge:</span>
                <span className="font-medium">+৳{Number(order.deliveryCharge).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-200 pt-1.5">
              <span>Net Payable:</span>
              <span>৳{Number(order.totalAmount || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-emerald-800 font-bold">
              <span>Amount Paid:</span>
              <span>৳{Number(order.paidAmount || 0).toLocaleString()}</span>
            </div>
            {Number(order.dueAmount) > 0 && (
              <div className="flex justify-between text-xs text-rose-600 font-bold">
                <span>Due Balance:</span>
                <span>৳{Number(order.dueAmount).toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Footer Receipt Note */}
          <div className="text-center text-[10px] text-slate-400 border-t border-slate-100 pt-3">
            Thank you for shopping with Nova Mobile! Please preserve this invoice for warranty and support claims.
          </div>
        </div>

        {/* Modal Actions (Screen Only) */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3 print:hidden">
          <button
            type="button"
            onClick={onNewSale}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
          >
            <ArrowRight className="w-4 h-4" /> Start New Sale
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
            >
              <Download className="w-4 h-4 text-slate-500" /> Download PDF
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" /> Print Invoice
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
