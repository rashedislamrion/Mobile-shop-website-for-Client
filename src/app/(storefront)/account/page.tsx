"use client";

import Link from "next/link";
import { 
  ShoppingBag, 
  CreditCard, 
  Heart, 
  XCircle, 
  CheckCircle2, 
  MapPin,
  Plus,
  ShoppingCart,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useMockAuth } from "@/context/MockAuthContext";
// import { mockProducts } from "@/lib/mock-data/products"; // Using if we want to show recently viewed

export default function AccountDashboardPage() {
  const { customerName } = useMockAuth();
  
  // Mock Data
  const hasAddress = false; // Toggle to false to see empty state
  const mockAddress = {
    name: "John Doe",
    phone: "01711223344",
    address: "House 12, Road 5, Block C, Banani",
    city: "Dhaka",
    zip: "1213"
  };

  const statCards = [
    { label: "Orders", value: "0", icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Payment", value: "0", icon: CreditCard, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Wishlist", value: "2", icon: Heart, color: "text-rose-500", bg: "bg-rose-50" },
    { label: "Cancelled", value: "0", icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
    { label: "Completed", value: "0", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Dashboard</h1>
        <p className="text-slate-500">Welcome back, {customerName || "Customer"}!</p>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <span className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</span>
            <span className="text-sm font-medium text-slate-500">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Default Shipping Address */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Default Shipping Address</h2>
          </div>
          
          {hasAddress ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-[200px]">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-slate-900">{mockAddress.name}</h3>
              </div>
              <div className="text-slate-600 text-sm space-y-1 ml-7">
                <p>{mockAddress.address}</p>
                <p>{mockAddress.city}, {mockAddress.zip}</p>
                <p className="pt-2 font-medium">Phone: {mockAddress.phone}</p>
              </div>
              <Button variant="link" className="mt-2 text-primary p-0 h-auto ml-7">Edit Address</Button>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center h-[200px]">
              <MapPin className="w-8 h-8 text-slate-300 mb-3" />
              <p className="text-slate-600 font-medium mb-4">No address added yet</p>
              <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white">
                <Link href="/account/address">
                  <Plus className="w-4 h-4 mr-2" /> Add New Address
                </Link>
              </Button>
            </div>
          )}
        </section>

        {/* My Cart Summary */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">My Cart</h2>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center h-[200px]">
             <ShoppingCart className="w-12 h-12 text-slate-200 mb-3" />
             <p className="text-slate-500 font-medium mb-1">There is no product in your cart.</p>
             <Link href="/" className="text-sm font-semibold text-primary hover:underline">Continue Shopping</Link>
          </div>
        </section>
      </div>

      {/* Recently Viewed */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Recently Viewed</h2>
        </div>
        
        {/* We can use EmptyState here for demonstration as requested */}
        <EmptyState 
          icon={EyeOff}
          title="No products viewed"
          subtitle="No products have been viewed recently. Browse our store to see products here."
          action={<Button asChild variant="outline"><Link href="/">Browse Products</Link></Button>}
        />
      </section>

    </div>
  );
}
