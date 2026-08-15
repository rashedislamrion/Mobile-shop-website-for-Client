"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { FilterBar } from "@/components/admin/FilterBar";
import { ReportExportButtons } from "@/components/admin/ReportExportButtons";
import { ColoredStatCard } from "@/components/admin/ColoredStatCard";
import { FilterConfig } from "@/types/table";
import { mockSummaryData } from "@/lib/mock-data/reports/summary";
import { ShoppingCart, Wrench, Receipt, ShoppingBag, Banknote, PackageX, CheckCircle, Wallet, ArrowRightLeft, CreditCard } from "lucide-react";

export default function SummaryReport() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  useEffect(() => {
    setTitle("Summary Report");
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
        { label: "All Branches", value: "all" },
        { label: "Global", value: "Global" },
        { label: "Dhaka Main Branch", value: "Dhaka" },
        { label: "Chattogram Branch", value: "Ctg" },
      ],
    }
  ];

  const formatCurrency = (val: number) => `৳${val.toLocaleString()}`;

  return (
    <div className="space-y-8">
      
      {/* Top Filter Bar */}
      <div className="flex items-center justify-between">
        <FilterBar 
          filters={filterConfigs}
          onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
          onReset={() => setFilters({})}
          className="flex-1"
        />
        <div className="ml-4">
          <ReportExportButtons />
        </div>
      </div>

      {/* Sales Summary */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="w-5 h-5 text-slate-700" />
          <h2 className="text-lg font-bold text-slate-800">Sales Summary</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ColoredStatCard 
            icon={<Banknote className="w-5 h-5" />}
            label="Total Sales"
            value={formatCurrency(mockSummaryData.sales.totalSales)}
            colorTint="blue"
          />
          <ColoredStatCard 
            icon={<CheckCircle className="w-5 h-5" />}
            label="Net Sales"
            value={formatCurrency(mockSummaryData.sales.netSales)}
            colorTint="teal"
          />
          <ColoredStatCard 
            icon={<CreditCard className="w-5 h-5" />}
            label="Total Unpaid"
            value={formatCurrency(mockSummaryData.sales.totalUnpaid)}
            colorTint="orange"
          />
          <ColoredStatCard 
            icon={<ArrowRightLeft className="w-5 h-5" />}
            label="Returned"
            value={formatCurrency(mockSummaryData.sales.returned)}
            colorTint="peach"
          />
        </div>
      </section>

      {/* Service Summary */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Wrench className="w-5 h-5 text-slate-700" />
          <h2 className="text-lg font-bold text-slate-800">Service Summary</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ColoredStatCard 
            icon={<Wrench className="w-5 h-5" />}
            label="Total Services"
            value={mockSummaryData.service.totalServices}
            colorTint="blue"
          />
          <ColoredStatCard 
            icon={<CheckCircle className="w-5 h-5" />}
            label="Total Paid"
            value={formatCurrency(mockSummaryData.service.totalPaid)}
            colorTint="green"
          />
          <ColoredStatCard 
            icon={<CreditCard className="w-5 h-5" />}
            label="Total Unpaid"
            value={formatCurrency(mockSummaryData.service.totalUnpaid)}
            colorTint="orange"
          />
          <ColoredStatCard 
            icon={<Banknote className="w-5 h-5" />}
            label="Net Service Revenue"
            value={formatCurrency(mockSummaryData.service.netServiceRevenue)}
            colorTint="purple"
          />
        </div>
      </section>

      {/* Expense Summary */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="w-5 h-5 text-slate-700" />
          <h2 className="text-lg font-bold text-slate-800">Expense Summary</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ColoredStatCard 
            icon={<Receipt className="w-5 h-5" />}
            label="Total Expense + Payroll"
            value={formatCurrency(mockSummaryData.expense.totalExpenseAndPayroll)}
            colorTint="yellow"
          />
          <ColoredStatCard 
            icon={<PackageX className="w-5 h-5" />}
            label="Total Expense"
            value={formatCurrency(mockSummaryData.expense.totalExpense)}
            colorTint="pink"
          />
          <ColoredStatCard 
            icon={<Wallet className="w-5 h-5" />}
            label="Total Payroll"
            value={formatCurrency(mockSummaryData.expense.totalPayroll)}
            colorTint="gray"
          />
        </div>
      </section>

      {/* Purchase Summary */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <ShoppingBag className="w-5 h-5 text-slate-700" />
          <h2 className="text-lg font-bold text-slate-800">Purchase Summary</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ColoredStatCard 
            icon={<ShoppingBag className="w-5 h-5" />}
            label="Total Purchase"
            value={formatCurrency(mockSummaryData.purchase.totalPurchase)}
            colorTint="teal"
          />
          <ColoredStatCard 
            icon={<CheckCircle className="w-5 h-5" />}
            label="Total Paid"
            value={formatCurrency(mockSummaryData.purchase.totalPaid)}
            colorTint="green"
          />
          <ColoredStatCard 
            icon={<CreditCard className="w-5 h-5" />}
            label="Total Unpaid"
            value={formatCurrency(mockSummaryData.purchase.totalUnpaid)}
            colorTint="red"
          />
        </div>
      </section>

    </div>
  );
}
