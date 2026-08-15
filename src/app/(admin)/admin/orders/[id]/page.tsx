"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { StatusBadge } from "@/components/admin/DataTable";
import { mockOrderDetails } from "@/lib/mock-data/orders";
import { StatusTimeline } from "@/components/admin/StatusTimeline";
import { StatusVariant } from "@/types/table";
import { toast } from "sonner";
import { Phone, Mail, User, MapPin, CreditCard, Printer, Check, X, Tag } from "lucide-react";
import Image from "next/image";

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const rawId = params.id;
  const orderId = rawId.startsWith("ORD") ? `#${rawId}` : rawId;
  const order = mockOrderDetails[orderId];

  const [notes, setNotes] = useState(order?.staffNotes || []);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    if (order) {
      setTitle(`Order ${order.id}`);
      setBadge("Website");
      setDateFilter("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  if (!order) {
    return <div className="p-6 text-slate-500">Order not found.</div>;
  }

  const getOrderStatusVariant = (status: string): StatusVariant => {
    switch (status) {
      case "Delivered":
      case "Completed": return "success";
      case "Confirmed":
      case "Parcel Booked": return "info";
      case "Pending": return "warning";
      case "Returned": return "notice";
      case "Cancelled": return "danger";
      default: return "info";
    }
  };

  const getPaymentStatusVariant = (status: string): StatusVariant => {
    switch (status) {
      case "Paid": return "success";
      case "Unpaid": return "danger";
      case "Due": return "warning";
      default: return "info";
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note = {
      id: Date.now().toString(),
      staffName: "Current User",
      timestamp: new Date().toISOString(),
      note: newNote.trim()
    };
    setNotes([note, ...notes]);
    setNewNote("");
    toast.success("Note added successfully");
  };

  const handleAction = (action: string) => {
    toast.success(`Action "${action}" triggered for ${order.id}`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      
      {/* LEFT COLUMN */}
      <div className="w-full lg:w-2/3 space-y-6">
        
        {/* Order Items */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800">Order Items</h3>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium text-center">Qty</th>
                  <th className="px-5 py-3 font-medium text-right">Unit Price</th>
                  <th className="px-5 py-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.orderItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-slate-100 overflow-hidden relative shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.variant}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center text-slate-600">{item.qty}</td>
                    <td className="px-5 py-3 text-right text-slate-600">৳{item.unitPrice.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right font-medium text-slate-800">৳{item.lineTotal.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-5 bg-slate-50/50 border-t border-slate-100 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>৳{order.subtotal.toLocaleString()}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Discount</span>
                <span>- ৳{order.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Delivery Charge</span>
              <span>৳{order.deliveryCharge.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-base text-slate-800">
              <span>Grand Total</span>
              <span>৳{order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Order Timeline */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Order Timeline</h3>
            <StatusBadge status={order.status} type={getOrderStatusVariant(order.status)} />
          </div>
          <div className="p-6">
            <StatusTimeline steps={order.timeline} />
          </div>
        </div>

        {/* Staff Notes */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800">Staff Notes</h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-2">
              <textarea 
                className="w-full min-h-[80px] rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                placeholder="Type an internal note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <div className="flex justify-end">
                <button 
                  onClick={handleAddNote}
                  className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Add Note
                </button>
              </div>
            </div>
            
            <div className="space-y-3 pt-4">
              {notes.map((note) => (
                <div key={note.id} className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-slate-700">{note.staffName}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(note.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{note.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN */}
      <div className="w-full lg:w-1/3 space-y-6">
        
        {/* Customer Info */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            Customer Info
          </h3>
          <div className="space-y-3 text-sm">
            <p className="font-medium text-slate-800 text-base">{order.customer}</p>
            <div className="flex flex-col gap-1.5">
              <a href={`tel:${order.customerPhone}`} className="flex items-center gap-2 text-emerald-600 hover:underline">
                <Phone className="w-4 h-4" /> {order.customerPhone}
              </a>
              <a href={`mailto:${order.customerEmail}`} className="flex items-center gap-2 text-emerald-600 hover:underline">
                <Mail className="w-4 h-4" /> {order.customerEmail}
              </a>
            </div>
            <div className="pt-2">
              <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700 underline underline-offset-2">
                View Customer Profile
              </button>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden p-5">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              Shipping Address
            </h3>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
              {order.addressTag}
            </span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            {order.shippingAddress}
          </p>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-slate-400" />
            Payment Info
          </h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-slate-500">Method</span>
              <span className="font-medium text-slate-800">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-slate-500">Status</span>
              <StatusBadge status={order.paymentStatus} type={getPaymentStatusVariant(order.paymentStatus)} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Paid Amount</span>
              <span className="font-medium text-slate-800">৳{order.paidAmount.toLocaleString()}</span>
            </div>
            {order.dueAmount > 0 && (
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500">Due Amount</span>
                <span className="font-bold text-red-500">৳{order.dueAmount.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Order Actions</h3>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => handleAction("Mark as Confirmed")}
              className="w-full flex justify-center items-center gap-2 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-lg transition-colors text-sm"
            >
              <Check className="w-4 h-4" /> Mark as Confirmed
            </button>
            <button 
              onClick={() => handleAction("Mark as Diagnosing")}
              className="w-full flex justify-center items-center gap-2 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-lg transition-colors text-sm"
            >
              <Tag className="w-4 h-4" /> Mark as Diagnosing
            </button>
            <button 
              onClick={() => handleAction("Mark as Delivered")}
              className="w-full flex justify-center items-center gap-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm"
            >
              <Check className="w-4 h-4" /> Mark as Delivered
            </button>
            <button 
              onClick={() => handleAction("Print Invoice")}
              className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors text-sm mt-2"
            >
              <Printer className="w-4 h-4" /> Print Invoice
            </button>
            <button 
              onClick={() => handleAction("Print Label")}
              className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors text-sm"
            >
              <Printer className="w-4 h-4" /> Print Label
            </button>
            <button 
              onClick={() => handleAction("Cancel Order")}
              className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-red-200 text-red-600 hover:bg-red-50 font-medium rounded-lg transition-colors text-sm mt-2"
            >
              <X className="w-4 h-4" /> Cancel Order
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
