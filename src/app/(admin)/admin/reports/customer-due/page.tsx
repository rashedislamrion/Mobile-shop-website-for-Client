"use client";

import { useEffect, useState, useMemo } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { FilterBar } from "@/components/admin/FilterBar";
import { DataTable, ActionDropdown } from "@/components/admin/DataTable";
import { ReportExportButtons } from "@/components/admin/ReportExportButtons";
import { FilterConfig, TableAction } from "@/types/table";
import { mockCustomerDues, CustomerDueRecord } from "@/lib/mock-data/reports/customer-due";
import { ColumnDef } from "@tanstack/react-table";
import { Users, AlertCircle, TrendingDown, Eye, BellRing, Receipt, CheckCircle } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function CustomerDueReport() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [localData, setLocalData] = useState<CustomerDueRecord[]>(mockCustomerDues);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  
  // Payment Dialog State
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDueRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>("");

  useEffect(() => {
    setTitle("Customer Due Report");
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
        { label: "৳0 - ৳1,000", value: "0-1000" },
        { label: "৳1,001 - ৳5,000", value: "1000-5000" },
        { label: "৳5,000+", value: "5000+" },
      ],
    }
  ];

  const filteredData = useMemo(() => {
    let result = [...localData];
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.customerName.toLowerCase().includes(q) || 
        o.phone.includes(q)
      );
    }
    
    if (filters.branch) {
      result = result.filter(o => o.branch === filters.branch);
    }
    
    if (filters.dueRange && filters.dueRange !== "all") {
      if (filters.dueRange === "0-1000") result = result.filter(o => o.dueAmount > 0 && o.dueAmount <= 1000);
      else if (filters.dueRange === "1000-5000") result = result.filter(o => o.dueAmount > 1000 && o.dueAmount <= 5000);
      else if (filters.dueRange === "5000+") result = result.filter(o => o.dueAmount > 5000);
    }

    return result.sort((a, b) => b.dueAmount - a.dueAmount);
  }, [searchQuery, filters, localData]);

  // Derived KPIs
  const totalCustomersWithDue = localData.filter(c => c.dueAmount > 0).length;
  const totalDueAmount = localData.reduce((sum, c) => sum + c.dueAmount, 0);
  const avgDuePerCustomer = totalCustomersWithDue > 0 ? totalDueAmount / totalCustomersWithDue : 0;

  const createActions = (row: CustomerDueRecord): TableAction[] => [
    { label: "View Order History", icon: <Eye className="w-4 h-4" />, onClick: () => toast.info(`Viewing history for ${row.customerName}`) },
    { label: "Send Reminder", icon: <BellRing className="w-4 h-4" />, onClick: () => toast.success(`Payment reminder sent to ${row.phone}`) },
    { 
      label: "Record Payment", 
      icon: <Receipt className="w-4 h-4" />, 
      onClick: () => {
        setSelectedCustomer(row);
        setPaymentAmount(row.dueAmount.toString());
        setPaymentDialogOpen(true);
      } 
    },
  ];

  const handleRecordPayment = () => {
    if (!selectedCustomer) return;
    const amount = Number(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLocalData(prev => prev.map(c => {
      if (c.id === selectedCustomer.id) {
        return {
          ...c,
          totalPaid: c.totalPaid + amount,
          dueAmount: Math.max(0, c.dueAmount - amount),
          lastPaymentDate: new Date().toISOString().split('T')[0]
        };
      }
      return c;
    }));

    toast.success(`Payment of ৳${amount} recorded for ${selectedCustomer.customerName}`);
    setPaymentDialogOpen(false);
  };

  const columns: ColumnDef<CustomerDueRecord>[] = [
    {
      id: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 relative shrink-0">
            <Image src={row.original.avatar} alt={row.original.customerName} fill className="object-cover" />
          </div>
          <span className="font-semibold text-slate-800 text-sm">{row.original.customerName}</span>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.phone}</span>
    },
    {
      accessorKey: "branch",
      header: "Branch",
      cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.branch}</span>
    },
    {
      accessorKey: "totalOrders",
      header: "Orders",
      cell: ({ row }) => <span className="font-semibold text-slate-700">{row.original.totalOrders}</span>
    },
    {
      accessorKey: "totalPurchased",
      header: "Total Purchased",
      cell: ({ row }) => <span className="text-sm font-medium text-slate-700">৳{row.original.totalPurchased.toLocaleString()}</span>
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
      
      {/* Dialog for Recording Payment */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="pt-4 space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-slate-800">{selectedCustomer?.customerName}</p>
                <p className="text-xs text-slate-500">{selectedCustomer?.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Current Due</p>
                <p className="font-bold text-red-600">৳{selectedCustomer?.dueAmount.toLocaleString()}</p>
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
                <option value="Cash">Cash</option>
                <option value="Card">Card / POS</option>
                <option value="Mobile Banking">Mobile Banking (bKash/Nagad)</option>
                <option value="Bank Transfer">Bank Transfer</option>
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
                onClick={handleRecordPayment}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm"
              >
                <CheckCircle className="w-4 h-4" /> Record Payment
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


      <div className="flex items-center justify-between">
        <FilterBar 
          searchPlaceholder="Search customer name, phone..."
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
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Customers with Due</p>
            <p className="text-2xl font-bold text-slate-800">{totalCustomersWithDue}</p>
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
            <p className="text-sm font-medium text-slate-600 mb-1">Total Due Amount</p>
            <p className="text-3xl font-extrabold text-red-600">৳{totalDueAmount.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Avg. Due per Customer</p>
            <p className="text-2xl font-bold text-slate-800">৳{Math.round(avgDuePerCustomer).toLocaleString()}</p>
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
