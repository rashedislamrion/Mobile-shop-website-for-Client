"use client";

import { useEffect, useState, useMemo } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { FilterBar } from "@/components/admin/FilterBar";
import { DataTable, ActionDropdown } from "@/components/admin/DataTable";
import { ReportExportButtons } from "@/components/admin/ReportExportButtons";
import { FilterConfig, TableAction } from "@/types/table";
import { mockSupplierDues, SupplierDueRecord } from "@/lib/mock-data/reports/supplier-due";
import { ColumnDef } from "@tanstack/react-table";
import { Users2, AlertCircle, TrendingDown, Eye, Receipt, CheckCircle } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function SupplierDueReport() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [localData, setLocalData] = useState<SupplierDueRecord[]>(mockSupplierDues);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  
  // Payment Dialog State
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierDueRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>("");

  useEffect(() => {
    setTitle("Supplier Due Report");
    setBadge("Website");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterConfigs: FilterConfig[] = [
    {
      type: "select",
      label: "Branch",
      key: "branch",
      options: [
        { label: "Global", value: "Global" },
        { label: "Dhaka Main Branch", value: "Dhaka Main Branch" },
        { label: "Chattogram Branch", value: "Chattogram Branch" },
      ],
    },
    {
      type: "select",
      label: "Due Range",
      key: "dueRange",
      options: [
        { label: "All", value: "all" },
        { label: "৳0 - ৳50,000", value: "0-50000" },
        { label: "৳50,001 - ৳200,000", value: "50000-200000" },
        { label: "৳200,000+", value: "200000+" },
      ],
    }
  ];

  const filteredData = useMemo(() => {
    let result = [...localData];
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.supplierName.toLowerCase().includes(q)
      );
    }
    
    if (filters.branch) {
      result = result.filter(o => o.branch === filters.branch);
    }
    
    if (filters.dueRange && filters.dueRange !== "all") {
      if (filters.dueRange === "0-50000") result = result.filter(o => o.dueAmount > 0 && o.dueAmount <= 50000);
      else if (filters.dueRange === "50000-200000") result = result.filter(o => o.dueAmount > 50000 && o.dueAmount <= 200000);
      else if (filters.dueRange === "200000+") result = result.filter(o => o.dueAmount > 200000);
    }

    return result.sort((a, b) => b.dueAmount - a.dueAmount);
  }, [searchQuery, filters, localData]);

  // Derived KPIs
  const totalSuppliersWithDue = localData.filter(s => s.dueAmount > 0).length;
  const totalPayableDue = localData.reduce((sum, s) => sum + s.dueAmount, 0);
  const avgDuePerSupplier = totalSuppliersWithDue > 0 ? totalPayableDue / totalSuppliersWithDue : 0;

  const createActions = (row: SupplierDueRecord): TableAction[] => [
    { label: "View Purchase History", icon: <Eye className="w-4 h-4" />, onClick: () => toast.info(`Viewing history for ${row.supplierName}`) },
    { 
      label: "Make Payment", 
      icon: <Receipt className="w-4 h-4" />, 
      onClick: () => {
        setSelectedSupplier(row);
        setPaymentAmount(row.dueAmount.toString());
        setPaymentDialogOpen(true);
      } 
    },
  ];

  const handleMakePayment = () => {
    if (!selectedSupplier) return;
    const amount = Number(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLocalData(prev => prev.map(s => {
      if (s.id === selectedSupplier.id) {
        return {
          ...s,
          totalPaid: s.totalPaid + amount,
          dueAmount: Math.max(0, s.dueAmount - amount),
          lastPaymentDate: new Date().toISOString().split('T')[0]
        };
      }
      return s;
    }));

    toast.success(`Payment of ৳${amount} made to ${selectedSupplier.supplierName}`);
    setPaymentDialogOpen(false);
  };

  const columns: ColumnDef<SupplierDueRecord>[] = [
    {
      id: "supplier",
      header: "Supplier",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 relative shrink-0">
            <Image src={row.original.logo} alt={row.original.supplierName} fill className="object-cover" />
          </div>
          <span className="font-semibold text-slate-800 text-sm">{row.original.supplierName}</span>
        </div>
      ),
    },
    {
      accessorKey: "contact",
      header: "Contact",
      cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.contact}</span>
    },
    {
      accessorKey: "branch",
      header: "Branch",
      cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.branch}</span>
    },
    {
      accessorKey: "totalPurchases",
      header: "Total Purchases",
      cell: ({ row }) => <span className="text-sm font-medium text-slate-700">৳{row.original.totalPurchases.toLocaleString()}</span>
    },
    {
      accessorKey: "totalPaid",
      header: "Total Paid",
      cell: ({ row }) => <span className="text-sm font-medium text-emerald-600">৳{row.original.totalPaid.toLocaleString()}</span>
    },
    {
      accessorKey: "dueAmount",
      header: "Due Amount",
      cell: ({ row }) => {
        const isDue = row.original.dueAmount > 0;
        return (
          <span className={`font-bold ${isDue ? 'text-red-600' : 'text-slate-400'}`}>
            ৳{row.original.dueAmount.toLocaleString()}
          </span>
        );
      }
    },
    {
      accessorKey: "lastPaymentDate",
      header: "Last Payment",
      cell: ({ row }) => <span className="text-sm text-slate-500">{row.original.lastPaymentDate}</span>
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <ActionDropdown actions={createActions(row.original)} rowData={row.original} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Dialog for Making Payment */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Make Payment to Supplier</DialogTitle>
          </DialogHeader>
          <div className="pt-4 space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-slate-800">{selectedSupplier?.supplierName}</p>
                <p className="text-xs text-slate-500">{selectedSupplier?.contact}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Current Due</p>
                <p className="font-bold text-red-600">৳{selectedSupplier?.dueAmount.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Amount (৳)</label>
              <Input 
                type="number" 
                value={paymentAmount}
                onChange={e => setPaymentAmount(e.target.value)}
                placeholder="Enter amount..." 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Payment Method</label>
              <select className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Cash">Cash</option>
                <option value="Mobile Banking">Mobile Banking</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Note (Optional)</label>
              <textarea 
                className="w-full p-3 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 min-h-[80px]"
                placeholder="Add payment notes..."
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setPaymentDialogOpen(false)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleMakePayment}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm"
              >
                <CheckCircle className="w-4 h-4" /> Make Payment
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


      <div className="flex items-center justify-between">
        <FilterBar 
          searchPlaceholder="Search supplier name..."
          filters={filterConfigs}
          onSearchChange={(val) => setSearchQuery(val)}
          onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
          onReset={() => {
            setSearchQuery("");
            setFilters({});
          }}
          className="flex-1"
        />
        <div className="ml-4">
          <ReportExportButtons />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Suppliers with Due</p>
            <p className="text-2xl font-bold text-slate-800">{totalSuppliersWithDue}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-red-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full -translate-y-8 translate-x-8 opacity-50 pointer-events-none"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-600 mb-1">Total Payable Due</p>
            <p className="text-3xl font-extrabold text-red-600">৳{totalPayableDue.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Avg. Due per Supplier</p>
            <p className="text-2xl font-bold text-slate-800">৳{Math.round(avgDuePerSupplier).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5">
        <DataTable 
          columns={columns} 
          data={filteredData} 
          pageSize={10}
        />
      </div>

    </div>
  );
}
