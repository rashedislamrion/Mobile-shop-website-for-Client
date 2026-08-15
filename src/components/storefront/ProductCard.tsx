import Link from "next/link";

import { Heart } from "lucide-react";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ProductCard({ product }: { product: Product }) {
  const isOutOfStock = product.stock === 0;

  return (
    <div className="group relative bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
      {/* Badges */}
      {product.saveAmount && product.saveAmount > 0 ? (
        <Badge className="absolute top-2 left-2 z-10 bg-danger text-white border-none font-semibold shadow-sm">
          SAVE ৳{product.saveAmount}
        </Badge>
      ) : null}

      {/* Image Area */}
      <Link href={`/product/${product.slug}`} className="relative block aspect-square bg-slate-50 w-full overflow-hidden">
        {/* Placeholder image tag for mock data. Note: you might need to configure next.config.mjs if using external image domains like placehold.co */}
        {/* For simplicity we'll use a standard img tag with object-contain since it's mock placehold.co */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={product.images[0] || 'https://placehold.co/400x400/f8fafc/94a3b8'} 
          alt={product.name}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
        />
      </Link>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/category/${product.category?.slug}`} className="text-xs text-slate-400 font-medium hover:text-primary mb-1">
          {product.category?.name || "Uncategorized"}
        </Link>
        <Link href={`/product/${product.slug}`} className="block mb-2 flex-1">
          <h3 className="font-semibold text-slate-800 line-clamp-2 text-sm leading-snug group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Pricing */}
        <div className="flex items-end gap-2 mb-4">
          <span className="text-lg font-bold text-slate-900">৳{product.price.toLocaleString()}</span>
          {product.oldPrice && (
            <span className="text-xs text-slate-400 line-through mb-0.5">৳{product.oldPrice.toLocaleString()}</span>
          )}
        </div>

        {/* Action Row */}
        <div className="flex items-center gap-2 mt-auto">
          <Button variant="outline" size="icon" className="shrink-0 text-slate-400 hover:text-danger hover:border-danger hover:bg-danger/5 transition-colors">
            <Heart className="w-5 h-5" />
          </Button>
          
          {isOutOfStock ? (
            <Button variant="outline" className="w-full text-slate-400 border-slate-200 cursor-not-allowed" disabled>
              Out of Stock
            </Button>
          ) : (
            <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold shadow-sm">
              Buy Now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
