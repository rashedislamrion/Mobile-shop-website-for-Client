"use client";

import { useEffect } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import {
  kpiRow1,
  kpiRow2,
  orderStatuses,
  chartData,
  topProducts,
  topCustomers,
  recentOrders
} from "@/lib/mock-data/admin-dashboard";
import {
  Wallet,
  Package,
  Wrench,
  Banknote,
  Receipt,
  ShoppingBag,
  HandCoins,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  PackageCheck,
  Truck,
  Undo2,
  XCircle,
  Activity,
  CheckCircle,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import Image from "next/image";
import Link from "next/link";

const getIconForKpi = (id: string) => {
  switch (id) {
    case "rev": return <Wallet className="w-5 h-5 text-emerald-600" />;
    case "prod": return <Package className="w-5 h-5 text-blue-600" />;
    case "serv": return <Wrench className="w-5 h-5 text-indigo-600" />;
    case "liq": return <Banknote className="w-5 h-5 text-purple-600" />;
    case "exp": return <Receipt className="w-5 h-5 text-amber-600" />;
    case "pur": return <ShoppingBag className="w-5 h-5 text-cyan-600" />;
    case "spay": return <HandCoins className="w-5 h-5 text-teal-600" />;
    case "sdue": return <AlertCircle className="w-5 h-5 text-red-600" />;
    default: return <Wallet className="w-5 h-5" />;
  }
};

const getBgForKpi = (id: string) => {
  switch (id) {
    case "rev": return "bg-emerald-100";
    case "prod": return "bg-blue-100";
    case "serv": return "bg-indigo-100";
    case "liq": return "bg-purple-100";
    case "exp": return "bg-amber-100";
    case "pur": return "bg-cyan-100";
    case "spay": return "bg-teal-100";
    case "sdue": return "bg-red-100";
    default: return "bg-gray-100";
  }
};

const getStatusIcon = (label: string) => {
  switch (label) {
    case "Pending": return <Clock className="w-5 h-5 text-amber-500" />;
    case "Confirmed": return <CheckCircle2 className="w-5 h-5 text-blue-500" />;
    case "Parcel Booked": return <PackageCheck className="w-5 h-5 text-indigo-500" />;
    case "Delivered": return <Truck className="w-5 h-5 text-emerald-500" />;
    case "Returned": return <Undo2 className="w-5 h-5 text-orange-500" />;
    case "Cancelled": return <XCircle className="w-5 h-5 text-red-500" />;
    case "Diagnosing": return <Activity className="w-5 h-5 text-purple-500" />;
    case "Completed": return <CheckCircle className="w-5 h-5 text-teal-500" />;
    default: return <Clock className="w-5 h-5" />;
  }
};

export default function AdminDashboardPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();

  useEffect(() => {
    setTitle("Dashboard");
    setBadge("Website");
    setDateFilter("This Month");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      
      {/* ROW 1: KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiRow1.map((kpi) => (
          <Card key={kpi.id} className="rounded-xl border-none shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getBgForKpi(kpi.id)}`}>
                  {getIconForKpi(kpi.id)}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
                  <h3 className="text-2xl font-bold text-slate-800">{kpi.value}</h3>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                {kpi.isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                )}
                <span className={`font-semibold ${kpi.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                  {kpi.trendPercentage}
                </span>
                <span className="text-slate-400">vs last period</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ROW 2: KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiRow2.map((kpi) => (
          <Card key={kpi.id} className="rounded-xl border-none shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getBgForKpi(kpi.id)}`}>
                  {getIconForKpi(kpi.id)}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
                  <h3 className="text-2xl font-bold text-slate-800">{kpi.value}</h3>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                {kpi.isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                )}
                <span className={`font-semibold ${kpi.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                  {kpi.trendPercentage}
                </span>
                <span className="text-slate-400">vs last period</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ORDER STATUS OVERVIEW */}
      <Card className="rounded-xl border-none shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-white p-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-800">Order Status Overview</CardTitle>
          <div className="w-32">
            <Select defaultValue="this-month">
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {orderStatuses.map((status) => (
            <div key={status.label} className="flex flex-col items-center justify-center text-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${status.bg}`}>
                {getStatusIcon(status.label)}
              </div>
              <p className="text-xl font-bold text-slate-800 leading-tight">{status.count}</p>
              <p className="text-xs font-medium text-slate-500 mt-1">{status.label}</p>
              <span className={`text-[10px] font-semibold mt-1 ${status.trend.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                {status.trend}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* SUMMARY CHART */}
      <Card className="rounded-xl border-none shadow-sm">
        <CardHeader className="border-b bg-white p-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-800">Summary</CardTitle>
          <div className="w-36">
            <Select defaultValue="7d">
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="1y">Last 1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-4 h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOrder" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `৳${value / 1000}k`} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                formatter={(value: unknown) => [`৳ ${Number(value).toLocaleString()}`, undefined]}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }} />
              <Area type="monotone" dataKey="Order" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorOrder)" />
              <Area type="monotone" dataKey="IncomeGrowth" name="Income Growth" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
              <Area type="monotone" dataKey="ExpenseGrowth" name="Expense Growth" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* TWO COLUMNS: TOP PRODUCTS & TOP CUSTOMERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Selling Products */}
        <Card className="rounded-xl border-none shadow-sm">
          <CardHeader className="border-b bg-white p-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-800">Most Selling Products</CardTitle>
            <Link href="/admin/products" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">View All</Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {topProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                  <div className="relative w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{product.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Top Rated</p>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none shrink-0">
                    {product.sales}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Top Customers */}
        <Card className="rounded-xl border-none shadow-sm">
          <CardHeader className="border-b bg-white p-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-800">Weekly Top Customers</CardTitle>
            <Link href="/admin/customers" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">View All</Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {topCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold ${customer.color}`}>
                    {customer.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{customer.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{customer.orders}</p>
                  </div>
                  <button className="text-xs font-semibold text-slate-400 hover:text-emerald-600 flex items-center gap-1 transition-colors">
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RECENT ORDERS TABLE */}
      <Card className="rounded-xl border-none shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-white p-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-800">Recent Orders</CardTitle>
          <Link href="/admin/orders" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">View All</Link>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[100px] whitespace-nowrap text-slate-500 font-medium">Order ID</TableHead>
                <TableHead className="min-w-[200px] text-slate-500 font-medium">Product</TableHead>
                <TableHead className="whitespace-nowrap text-slate-500 font-medium">Customer</TableHead>
                <TableHead className="whitespace-nowrap text-slate-500 font-medium">Date</TableHead>
                <TableHead className="whitespace-nowrap text-slate-500 font-medium">Status</TableHead>
                <TableHead className="text-right whitespace-nowrap text-slate-500 font-medium">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-semibold text-slate-800">{order.id}</TableCell>
                  <TableCell className="font-medium text-slate-700">{order.product}</TableCell>
                  <TableCell className="text-slate-600">{order.customer}</TableCell>
                  <TableCell className="text-slate-500 text-sm">{order.date}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`
                        border-none font-semibold px-2 py-0.5
                        ${order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' : ''}
                        ${order.status === 'Pending' ? 'bg-amber-50 text-amber-600' : ''}
                        ${order.status === 'Confirmed' ? 'bg-blue-50 text-blue-600' : ''}
                        ${order.status === 'Parcel Booked' ? 'bg-indigo-50 text-indigo-600' : ''}
                        ${order.status === 'Returned' ? 'bg-orange-50 text-orange-600' : ''}
                        ${order.status === 'Cancelled' ? 'bg-red-50 text-red-600' : ''}
                      `}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors inline-flex">
                      <Eye className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
    </div>
  );
}
