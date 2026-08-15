"use client";

import { useEffect, useState, useMemo } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { FilterBar } from "@/components/admin/FilterBar";
import { DataTable, ActionDropdown, StatusBadge } from "@/components/admin/DataTable";
import { ReportExportButtons } from "@/components/admin/ReportExportButtons";
import { FilterConfig, TableAction } from "@/types/table";
import { mockDiscountData, DiscountRecord } from "@/lib/mock-data/reports/discount";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Tag, Percent, Receipt } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function DiscountReport() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  useEffect(() => {
    setTitle("Discount Report");
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
    }
  ];

  const filteredData = useMemo(() => {
    let result = [...mockDiscountData];
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.orderCode.toLowerCase().includes(q)
      );
    }
    
    if (filters.branch) {
      result = result.filter(o => o.branch === filters.branch);
    }

    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [searchQuery, filters]);

  // Derived KPIs
  const totalDiscountGiven = filteredData.reduce((sum, d) => sum + d.discountApplied.amount, 0);
  const ordersWithDiscount = filteredData.length;
  const avgDiscountPercentage = ordersWithDiscount > 0 
    ? filteredData.reduce((sum, d) => sum + d.discountApplied.percentage, 0) / ordersWithDiscount 
    : 0;

  const createActions = (row: DiscountRecord): TableAction[] => [
    { 
      label: "View Order", 
      icon: <Eye className="w-4 h-4" />, 
      onClick: () => toast.info(`Viewing Order ${row.orderCode}`) 
    },
  ];

  const columns: ColumnDef<DiscountRecord>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.date}</span>
    },
    {
      accessorKey: "orderCode",
      header: "Order Code",
      cell: ({ row }) => (
        <Link 
          href={`/admin/orders/${row.original.orderCode}`}
          className="text-emerald-600 hover:text-emerald-700 font-mono font-medium text-sm transition-colors"
        >
          {row.original.orderCode}
        </Link>
      )
    },
    {
      accessorKey: "branch",
      header: "Branch",
      cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.branch}</span>
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => <span className="font-semibold text-slate-800">{row.original.customerName}</span>
    },
    {
      accessorKey: "originalTotal",
      header: "Original Total",
      cell: ({ row }) => <span className="text-sm text-slate-600">৳{row.original.originalTotal.toLocaleString()}</span>
    },
    {
      accessorKey: "discountApplied",
      header: "Discount Applied",
      cell: ({ row }) => (
        <span className="font-bold text-red-600">
          -৳{row.original.discountApplied.amount.toLocaleString()} ({row.original.discountApplied.percentage}%)
        </span>
      )
    },
    {
      accessorKey: "finalTotal",
      header: "Final Total",
      cell: ({ row }) => <span className="font-bold text-slate-800">৳{row.original.finalTotal.toLocaleString()}</span>
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment Status",
      cell: ({ row }) => {
        const s = row.original.paymentStatus;
        return <StatusBadge status={s} type={s === "Paid" ? "success" : s === "Pending" ? "warning" : "default"} />;
      }
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
      
      <div className="flex items-center justify-between">
        <FilterBar 
          searchPlaceholder="Search order ID..."
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
        <div className="bg-white p-5 rounded-2xl border border-red-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full -translate-y-8 translate-x-8 opacity-50 pointer-events-none"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-600 mb-1">Total Discount Given</p>
            <p className="text-3xl font-extrabold text-red-600">৳{totalDiscountGiven.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Orders with Discount</p>
            <p className="text-2xl font-bold text-slate-800">{ordersWithDiscount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Avg. Discount %</p>
            <p className="text-2xl font-bold text-slate-800">{avgDiscountPercentage.toFixed(1)}%</p>
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
