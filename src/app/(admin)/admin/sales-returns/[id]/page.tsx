"use client";

import { useEffect } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { mockSalesReturns } from "@/lib/mock-data/sales-returns";
import { StatusTimeline } from "@/components/admin/StatusTimeline";
import { StatusBadge } from "@/components/admin/DataTable";
import { StatusVariant } from "@/types/table";
import { toast } from "sonner";
import { Check, X, RefreshCcw, Package, AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function SalesReturnDetailsPage({ params }: { params: { id: string } }) {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const returnObj = mockSalesReturns.find(r => r.id === params.id);

  useEffect(() => {
    if (returnObj) {
      setTitle(`Return ${returnObj.id}`);
      setBadge("Website");
      setDateFilter("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [returnObj]);

  if (!returnObj) {
    return <div className="p-6 text-slate-500">Return request not found.</div>;
  }

  const getStatusVariant = (status: string): StatusVariant => {
    switch (status) {
      case "Refunded": return "success";
      case "Approved": return "info";
      case "Requested": return "warning";
      case "Rejected": return "danger";
      default: return "info";
    }
  };

  const timelineSteps = [
    { label: "Return Requested", timestamp: returnObj.date, isCompleted: true, isCurrent: false },
    { label: "Approved", timestamp: undefined, isCompleted: ["Approved", "Refunded"].includes(returnObj.status), isCurrent: returnObj.status === "Approved" },
    { label: "Refunded", timestamp: undefined, isCompleted: returnObj.status === "Refunded", isCurrent: returnObj.status === "Refunded" },
  ];

  if (returnObj.status === "Rejected") {
    timelineSteps[1] = { label: "Rejected", timestamp: undefined, isCompleted: true, isCurrent: true };
    timelineSteps.pop();
  }

  const handleAction = (action: string) => {
    toast.success(`Action "${action}" triggered`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      
      {/* LEFT COLUMN - Return Details */}
      <div className="w-full lg:w-2/3 space-y-6">
        
        {/* Returned Item Info */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden p-6">
          <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-800 text-lg mb-1">Return Details</h3>
              <p className="text-slate-500 text-sm">Customer: {returnObj.customerName} ({returnObj.customerPhone})</p>
            </div>
            <StatusBadge status={returnObj.status} type={getStatusVariant(returnObj.status)} />
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" /> Item(s)
              </h4>
              <div className="flex items-start gap-4">
                {returnObj.itemImages.length > 0 ? (
                  <div className="w-20 h-20 rounded-lg overflow-hidden relative bg-slate-100 shrink-0 border border-slate-200">
                    <Image src={returnObj.itemImages[0]} alt="Return Item" fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-slate-300" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-slate-800 text-lg">{returnObj.itemsReturned}</p>
                  <p className="text-emerald-600 font-medium text-sm mt-1">Requested Refund: ৳{returnObj.refundAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
              <h4 className="text-sm font-medium text-amber-800 mb-1 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Reason for Return
              </h4>
              <p className="text-amber-900 text-sm leading-relaxed">{returnObj.reason}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button onClick={() => handleAction("Approve")} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm">
            <Check className="w-4 h-4" /> Approve Return
          </button>
          <button onClick={() => handleAction("Mark as Refunded")} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm">
            <RefreshCcw className="w-4 h-4" /> Mark as Refunded
          </button>
          <button onClick={() => handleAction("Reject")} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-medium rounded-lg transition-colors text-sm">
            <X className="w-4 h-4" /> Reject Return
          </button>
        </div>

      </div>

      {/* RIGHT COLUMN - Meta & Timeline */}
      <div className="w-full lg:w-1/3 space-y-6">
        
        {/* Original Order Reference */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Original Order</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-slate-500">Order ID</span>
              <Link href={`/admin/orders/${returnObj.originalOrderId.replace('#', '')}`} className="font-medium text-emerald-600 hover:underline">
                {returnObj.originalOrderId}
              </Link>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-slate-500">Branch</span>
              <span className="font-medium text-slate-800">{returnObj.branch}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Date Requested</span>
              <span className="font-medium text-slate-800">
                {new Date(returnObj.date).toLocaleDateString('en-GB')}
              </span>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden p-5">
          <h3 className="font-semibold text-slate-800 mb-6">Return Status</h3>
          <StatusTimeline steps={timelineSteps} />
        </div>

      </div>
    </div>
  );
}
