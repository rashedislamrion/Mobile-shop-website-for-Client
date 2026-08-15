"use client";

import { useEffect, useState, useMemo } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { FilterBar } from "@/components/admin/FilterBar";
import { DataTable } from "@/components/admin/DataTable";
import { ReportExportButtons } from "@/components/admin/ReportExportButtons";
import { FilterConfig } from "@/types/table";
import { mockProductAnalytics, mockSalesTrendByCategory, ProductAnalyticsRecord } from "@/lib/mock-data/reports/product-analytics";
import { ColumnDef } from "@tanstack/react-table";
import { Package, DollarSign, TrendingUp, Tag, ArrowUpRight, ArrowDownRight, Star } from "lucide-react";
import Image from "next/image";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ProductAnalyticsReport() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  useEffect(() => {
    setTitle("Product Analytics Report");
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
        { label: "Dhaka Main Branch", value: "Dhaka" },
        { label: "Chattogram Branch", value: "Ctg" },
      ],
    },
    {
      type: "select",
      label: "Category",
      key: "category",
      options: [
        { label: "Smartphones", value: "Smartphones" },
        { label: "Accessories", value: "Accessories" },
        { label: "Laptops", value: "Laptops" },
        { label: "Audio", value: "Audio" },
      ],
    },
  ];

  const filteredData = useMemo(() => {
    let result = [...mockProductAnalytics];
    if (filters.category) {
      result = result.filter(o => o.category === filters.category);
    }
    return result.sort((a, b) => b.unitsSold - a.unitsSold); // Default sort
  }, [filters]);

  const columns: ColumnDef<ProductAnalyticsRecord>[] = [
    {
      accessorKey: "rank",
      header: "Rank",
      cell: ({ row }) => <span className="font-bold text-slate-800">#{row.original.rank}</span>
    },
    {
      id: "product",
      header: "Product",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md overflow-hidden bg-slate-100 border border-slate-200 relative shrink-0">
            <Image src={row.original.productImage} alt={row.original.productName} fill className="object-cover" />
          </div>
          <span className="font-semibold text-slate-800 text-sm">{row.original.productName}</span>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.category}</span>
    },
    {
      accessorKey: "unitsSold",
      header: "Units Sold",
      cell: ({ row }) => <span className="font-bold text-slate-800">{row.original.unitsSold.toLocaleString()}</span>
    },
    {
      accessorKey: "revenue",
      header: "Revenue",
      cell: ({ row }) => <span className="font-semibold text-slate-700">৳{row.original.revenue.toLocaleString()}</span>
    },
    {
      accessorKey: "rating",
      header: "Avg. Rating",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 font-semibold text-sm text-slate-700">
          {row.original.rating.toFixed(1)} <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
        </div>
      )
    },
    {
      accessorKey: "stockRemaining",
      header: "Stock",
      cell: ({ row }) => {
        const stock = row.original.stockRemaining;
        const color = stock > 50 ? "text-emerald-600" : stock > 20 ? "text-amber-600" : "text-red-600";
        return <span className={`font-bold ${color}`}>{stock} left</span>;
      }
    },
    {
      accessorKey: "trend",
      header: "Trend",
      cell: ({ row }) => {
        const trend = row.original.trend;
        const isUp = trend >= 0;
        return (
          <div className={`flex items-center gap-1 text-sm font-semibold ${isUp ? "text-emerald-600" : "text-red-600"}`}>
            {isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(trend)}%
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="w-3.5 h-3.5" /> 12%
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Units Sold</p>
            <p className="text-2xl font-bold text-slate-800">12,450</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="w-3.5 h-3.5" /> 8.5%
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Product Revenue</p>
            <p className="text-2xl font-bold text-slate-800">৳24.5M</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Best Performing Category</p>
            <p className="text-2xl font-bold text-slate-800">Smartphones</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
              <ArrowDownRight className="w-3.5 h-3.5" /> 2.1%
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Avg. Order Value</p>
            <p className="text-2xl font-bold text-slate-800">৳15,400</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Sales Trend by Category (Last 6 Months)</h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={mockSalesTrendByCategory}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="Smartphones" stackId="a" fill="#0ea5e9" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Accessories" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Laptops" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Audio" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Tablets" stackId="a" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5">
        <h3 className="text-lg font-bold text-slate-800 mb-4 px-1">Top Performing Products</h3>
        <DataTable 
          columns={columns} 
          data={filteredData} 
          pageSize={10}
        />
      </div>

    </div>
  );
}
