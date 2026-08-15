"use client";

import { useState } from "react";
import Link from "next/link";
import { PackageX, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Mock Orders
const mockOrders = [
  { id: "#ORD-001", date: "2023-10-25", items: 3, total: 3500, status: "Pending" },
  { id: "#ORD-002", date: "2023-10-20", items: 1, total: 1200, status: "Delivered" },
  { id: "#ORD-003", date: "2023-10-15", items: 2, total: 2400, status: "Delivered" },
  { id: "#ORD-004", date: "2023-10-10", items: 1, total: 500, status: "Cancelled" },
];

const TABS = ["Pending", "Confirmed", "Parcel Booked", "Delivered", "Returned", "Cancelled", "All"];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("All");

  const getFilteredOrders = (status: string) => {
    if (status === "All") return mockOrders;
    return mockOrders.filter(o => o.status === status);
  };

  const getCount = (status: string) => getFilteredOrders(status).length;

  const renderOrderTable = (status: string) => {
    const orders = getFilteredOrders(status);

    if (orders.length === 0) {
      return (
        <EmptyState 
          icon={PackageX} 
          title="No Order Found" 
          subtitle={`There are no orders with the status "${status}".`}
          action={<Button asChild variant="outline"><Link href="/">Continue Shopping</Link></Button>}
        />
      );
    }

    return (
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-700">
              <th className="py-4 px-6">Order ID</th>
              <th className="py-4 px-6">Date</th>
              <th className="py-4 px-6">Items</th>
              <th className="py-4 px-6">Total</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-6 font-semibold text-primary">{order.id}</td>
                <td className="py-4 px-6 text-sm text-slate-600">{order.date}</td>
                <td className="py-4 px-6 text-sm text-slate-600">{order.items} items</td>
                <td className="py-4 px-6 font-bold text-slate-900">৳{order.total.toLocaleString()}</td>
                <td className="py-4 px-6">
                  <Badge variant="outline" className={`
                    ${order.status === 'Pending' ? 'text-amber-600 border-amber-200 bg-amber-50' : ''}
                    ${order.status === 'Delivered' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : ''}
                    ${order.status === 'Cancelled' ? 'text-danger border-danger/20 bg-danger/5' : ''}
                  `}>
                    {order.status}
                  </Badge>
                </td>
                <td className="py-4 px-6 text-right">
                  <Button variant="outline" size="sm" className="h-8 gap-2">
                    <Eye className="w-3 h-3" /> View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Order History</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-2 hide-scrollbar">
          <TabsList className="bg-transparent p-0 h-auto gap-2">
            {TABS.map((tab) => (
              <TabsTrigger 
                key={tab} 
                value={tab}
                className="rounded-full border border-slate-200 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary"
              >
                {tab} ({getCount(tab)})
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="mt-6">
          {TABS.map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-0 outline-none">
              {renderOrderTable(tab)}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
