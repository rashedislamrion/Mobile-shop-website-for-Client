export type KPICard = {
  id: string;
  label: string;
  value: string;
  trendPercentage: string;
  isPositive: boolean;
};

export const kpiRow1: KPICard[] = [
  { id: "rev", label: "Total Revenue", value: "৳ 1,245,600", trendPercentage: "12.5%", isPositive: true },
  { id: "prod", label: "Net Product Sales", value: "৳ 980,400", trendPercentage: "8.2%", isPositive: true },
  { id: "serv", label: "Net Service Revenue", value: "৳ 150,200", trendPercentage: "4.1%", isPositive: true },
  { id: "liq", label: "Liquid Sales", value: "৳ 115,000", trendPercentage: "2.3%", isPositive: false },
];

export const kpiRow2: KPICard[] = [
  { id: "exp", label: "Total Expense + Payroll", value: "৳ 320,000", trendPercentage: "1.5%", isPositive: false },
  { id: "pur", label: "Total Purchase", value: "৳ 550,000", trendPercentage: "5.4%", isPositive: true },
  { id: "spay", label: "Total Supplier Payment", value: "৳ 420,000", trendPercentage: "3.2%", isPositive: true },
  { id: "sdue", label: "Total Supplier Due", value: "৳ 130,000", trendPercentage: "10.0%", isPositive: false },
];

export const orderStatuses = [
  { label: "Pending", count: 42, color: "text-amber-500", bg: "bg-amber-50", trend: "+5%" },
  { label: "Confirmed", count: 128, color: "text-blue-500", bg: "bg-blue-50", trend: "+12%" },
  { label: "Parcel Booked", count: 85, color: "text-indigo-500", bg: "bg-indigo-50", trend: "+2%" },
  { label: "Delivered", count: 890, color: "text-emerald-500", bg: "bg-emerald-50", trend: "+24%" },
  { label: "Returned", count: 12, color: "text-orange-500", bg: "bg-orange-50", trend: "-1%" },
  { label: "Cancelled", count: 24, color: "text-red-500", bg: "bg-red-50", trend: "-3%" },
  { label: "Diagnosing", count: 18, color: "text-purple-500", bg: "bg-purple-50", trend: "+8%" },
  { label: "Completed", count: 145, color: "text-teal-500", bg: "bg-teal-50", trend: "+15%" },
];

export const chartData = [
  { date: "Aug 10", Order: 45000, IncomeGrowth: 40000, ExpenseGrowth: 15000 },
  { date: "Aug 11", Order: 52000, IncomeGrowth: 48000, ExpenseGrowth: 18000 },
  { date: "Aug 12", Order: 48000, IncomeGrowth: 42000, ExpenseGrowth: 16000 },
  { date: "Aug 13", Order: 61000, IncomeGrowth: 55000, ExpenseGrowth: 20000 },
  { date: "Aug 14", Order: 59000, IncomeGrowth: 52000, ExpenseGrowth: 19000 },
  { date: "Aug 15", Order: 75000, IncomeGrowth: 68000, ExpenseGrowth: 22000 },
  { date: "Aug 16", Order: 82000, IncomeGrowth: 75000, ExpenseGrowth: 25000 },
];

export const topProducts = [
  { id: "1", name: "iPhone 15 Pro Max - 256GB Titanium", sales: "1,120 Sales", image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=100&q=80" },
  { id: "2", name: "Samsung Galaxy S24 Ultra", sales: "985 Sales", image: "https://images.unsplash.com/photo-1610945265064-3234d4ee2920?w=100&q=80" },
  { id: "3", name: "AirPods Pro (2nd Gen)", sales: "850 Sales", image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=100&q=80" },
  { id: "4", name: "Apple Watch Series 9", sales: "640 Sales", image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=100&q=80" },
  { id: "5", name: "MacBook Pro 16-inch M3 Max", sales: "420 Sales", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&q=80" },
];

export const topCustomers = [
  { id: "1", name: "Rashed Islam", initial: "RI", orders: "5 Orders this week", color: "bg-blue-100 text-blue-700" },
  { id: "2", name: "Jahid Hasan", initial: "JH", orders: "4 Orders this week", color: "bg-emerald-100 text-emerald-700" },
  { id: "3", name: "Ayesha Siddiqua", initial: "AS", orders: "4 Orders this week", color: "bg-purple-100 text-purple-700" },
  { id: "4", name: "Tanvir Ahmed", initial: "TA", orders: "3 Orders this week", color: "bg-amber-100 text-amber-700" },
  { id: "5", name: "Nusrat Jahan", initial: "NJ", orders: "3 Orders this week", color: "bg-rose-100 text-rose-700" },
];

export const recentOrders = [
  { id: "#ORD-8901", customer: "Rashed Islam", product: "iPhone 15 Pro Max", date: "Today, 10:42 AM", status: "Pending" },
  { id: "#ORD-8900", customer: "Jahid Hasan", product: "Samsung Galaxy S24 Ultra", date: "Today, 09:15 AM", status: "Confirmed" },
  { id: "#ORD-8899", customer: "Ayesha Siddiqua", product: "AirPods Pro", date: "Yesterday, 04:30 PM", status: "Parcel Booked" },
  { id: "#ORD-8898", customer: "Tanvir Ahmed", product: "MacBook Pro 16-inch", date: "Yesterday, 02:20 PM", status: "Delivered" },
  { id: "#ORD-8897", customer: "Nusrat Jahan", product: "Apple Watch Series 9", date: "Aug 14, 11:10 AM", status: "Delivered" },
  { id: "#ORD-8896", customer: "Mehedi Hasan", product: "iPad Air 5th Gen", date: "Aug 14, 09:45 AM", status: "Returned" },
];
