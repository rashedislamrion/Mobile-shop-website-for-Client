"use client";

import Link from "next/link";
import { HeartCrack } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/ProductCard";
import { mockProducts } from "@/lib/mock-data/products";

export default function WishlistPage() {
  // Use a slice of mock products to simulate a non-empty wishlist
  const mockWishlist = mockProducts.slice(0, 2); 
  // Change to [] to test empty state
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Wishlist ({mockWishlist.length})
        </h1>
      </div>

      {mockWishlist.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mt-4">
          {mockWishlist.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <EmptyState 
            icon={HeartCrack} 
            title="Wishlist is empty" 
            subtitle="You haven't added any products to your wishlist yet."
            action={<Button asChild variant="outline"><Link href="/">Browse Products</Link></Button>}
          />
        </div>
      )}
    </div>
  );
}
