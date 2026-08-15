"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { DataTable, StatusBadge } from "@/components/admin/DataTable";
import { ColoredStatCard } from "@/components/admin/ColoredStatCard";
import { mockSuppliers } from "@/lib/mock-data/accounting/suppliers";
import { mockPurchaseOrders, PurchaseOrderRecord } from "@/lib/mock-data/accounting/purchase-orders";
import { mockSupplierPayments, SupplierPaymentRecord } from "@/lib/mock-data/accounting/supplier-payments";
import { Building2, Phone, Mail, MapPin, Globe, CreditCard, ShoppingBag, ArrowLeft, Edit } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

export default function SupplierProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { setTitle, setBadge, setDateFilter } = useAdminPage();

  const supplier = mockSuppliers.find(s => s.id === params.id) || mockSuppliers[0];
  const supplierPOs = mockPurchaseOrders.filter(po => po.supplierName === supplier.supplierName);
  const supplierPayments = mockSupplierPayments.filter(p => p.supplierName === supplier.supplierName);

  const [activeTab, setActiveTab] = useState<"purchases" | "payments">("purchases");

  useEffect(() => {
    setTitle(`${supplier.supplierName}`);
    setBadge("Supplier Profile");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplier]);

  const poColumns: ColumnDef<PurchaseOrderRecord>[] = [
    {
      accessorKey: "poNumber",
      header: "PO Number",
      cell: ({ row }) => <span className="font-bold text-emerald-600">{row.original.poNumber}</span>
    },
    {
      accessorKey: "date",
      header: "Date",
    },
    {
      accessorKey: "grandTotal",
      header: "Total",
      cell: ({ row }) => <span className="font-bold">৳{row.original.grandTotal.toLocaleString()}</span>
    },
    {
      accessorKey: "due",
      header: "Due",
      cell: ({ row }) => <span className={`font-semibold ${row.original.due > 0 ? "text-rose-600" : "text-emerald-600"}`}>৳{row.original.due.toLocaleString()}</span>
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge 
          status={row.original.status} 
          type={row.original.status === "Received" ? "success" : "warning"} 
        />
      )
    },
  ];

  const paymentColumns: ColumnDef<SupplierPaymentRecord>[] = [
    {
      accessorKey: "paymentId",
      header: "Payment ID",
      cell: ({ row }) => <span className="font-bold text-blue-600">{row.original.paymentId}</span>
    },
    {
      accessorKey: "date",
      header: "Date",
    },
    {
      accessorKey: "wallet",
      header: "Wallet",
    },
    {
      accessorKey: "amount",
      header: "Amount Paid",
      cell: ({ row }) => <span className="font-bold text-emerald-600">৳{row.original.amount.toLocaleString()}</span>
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 font-medium transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Suppliers
        </button>
        <button 
          onClick={() => router.push(`/admin/accounting/suppliers/${supplier.id}/edit`)}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors text-sm flex items-center gap-2 shadow-sm"
        >
          <Edit className="w-4 h-4" /> Edit Supplier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col - Profile */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <Building2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">{supplier.supplierName}</h2>
            <p className="text-sm text-slate-500 mb-4">{supplier.contactPerson}</p>
            <StatusBadge status={supplier.status} type={supplier.status === "Active" ? "success" : "danger"} />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Contact Info</h3>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{supplier.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{supplier.email || "N/A"}</span>
            </div>
            <div className="flex items-start gap-3 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{supplier.address}</span>
            </div>
            {supplier.website && (
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                <a href={supplier.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{supplier.website}</a>
              </div>
            )}
          </div>
        </div>

        {/* Right Col - Stats & Tabs */}
        <div className="md:col-span-2 space-y-6">
          
          <div className="grid grid-cols-2 gap-4">
            <ColoredStatCard 
              icon={<ShoppingBag className="w-5 h-5" />}
              label="Total Purchases"
              value={`৳${supplier.totalPurchase.toLocaleString()}`}
              colorTint="blue"
            />
            <ColoredStatCard 
              icon={<CreditCard className="w-5 h-5" />}
              label="Outstanding Due"
              value={`৳${supplier.due.toLocaleString()}`}
              colorTint={supplier.due > 0 ? "red" : "green"}
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-100">
              <button 
                onClick={() => setActiveTab("purchases")}
                className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === "purchases" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
              >
                Purchase Orders ({supplierPOs.length})
              </button>
              <button 
                onClick={() => setActiveTab("payments")}
                className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === "payments" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
              >
                Payment History ({supplierPayments.length})
              </button>
            </div>
            <div className="p-1">
              {activeTab === "purchases" ? (
                <DataTable 
                  columns={poColumns} 
                  data={supplierPOs} 
                  pageSize={5}
                />
              ) : (
                <DataTable 
                  columns={paymentColumns} 
                  data={supplierPayments} 
                  pageSize={5}
                />
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
