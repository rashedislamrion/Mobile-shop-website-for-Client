"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Heart, 
  Share2, 
  Star, 
  Minus, 
  Plus, 
  Phone, 
  MessageCircle,
  ShoppingCart,
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { mockProducts } from "@/lib/mock-data/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "@/components/storefront/ProductCard";

// Mock reviews
const mockReviews = [
  { id: 1, name: "Ahmed K.", rating: 5, date: "2 days ago", comment: "Excellent quality, highly recommended! The packaging was great and delivery was very fast." },
  { id: 2, name: "Rahim U.", rating: 4, date: "1 week ago", comment: "Good product, but the delivery took a bit longer than expected. The display works perfectly though." },
  { id: 3, name: "Sakib A.", rating: 5, date: "2 weeks ago", comment: "Perfect fit for my phone. Saved me a lot of money compared to the official service center." }
];

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = mockProducts.find(p => p.slug === params.slug) || mockProducts[0];
  const relatedProducts = mockProducts.filter(p => p.category?.id === product.category?.id && p.id !== product.id).slice(0, 5);
  const recentlyViewed = mockProducts.slice(10, 14);

  // States
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "");
  const [selectedQuality, setSelectedQuality] = useState(product.qualities?.[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [isWishlist, setIsWishlist] = useState(false);

  const isOutOfStock = product.stock === 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    toast.success(`Added ${quantity} ${product.name} to cart!`);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    toast.success("Proceeding to checkout...");
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col gap-12">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/category/${product.category?.slug}`} className="hover:text-primary transition-colors">
          {product.category?.name}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 font-medium line-clamp-1">{product.name}</span>
      </nav>

      {/* Top Section: Image & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        
        {/* LEFT: Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="aspect-square rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden relative">
            {product.saveAmount && (
              <Badge className="absolute top-4 left-4 z-10 bg-danger text-white border-none font-semibold shadow-sm px-3 py-1 text-sm">
                SAVE ৳{product.saveAmount}
              </Badge>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={selectedImage} 
              alt={product.name}
              className="w-full h-full object-contain p-8 mix-blend-multiply"
            />
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-2 snap-x hide-scrollbar">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl border-2 overflow-hidden snap-start transition-all ${
                  selectedImage === img ? 'border-primary shadow-sm' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover bg-slate-50" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: Product Info */}
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 shrink-0 pt-1">
              <Button variant="outline" size="icon" className="w-10 h-10 rounded-full text-slate-500 hover:text-primary">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setIsWishlist(!isWishlist)}
                className={`w-10 h-10 rounded-full transition-colors ${
                  isWishlist ? 'text-danger border-danger bg-danger/5' : 'text-slate-500 hover:text-danger'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlist ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center text-amber-400">
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current opacity-50" />
            </div>
            <span className="text-sm font-medium text-slate-600">4.5</span>
            <span className="text-slate-300">•</span>
            <Link href="#reviews" className="text-sm text-primary hover:underline">128 Reviews</Link>
          </div>

          <div className="flex items-end gap-3 mb-6">
            <span className="text-3xl font-bold text-slate-900">৳{product.price.toLocaleString()}</span>
            {product.oldPrice && (
              <span className="text-lg text-slate-400 line-through mb-1">৳{product.oldPrice.toLocaleString()}</span>
            )}
          </div>

          <p className="text-slate-600 text-sm leading-relaxed mb-8">
            {product.description?.substring(0, 150)}...
          </p>

          <hr className="border-slate-100 mb-8" />

          {/* Variants */}
          <div className="flex flex-col gap-6 mb-8">
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                        selectedColor === color 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.qualities && product.qualities.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Quality</h3>
                <div className="flex flex-wrap gap-2">
                  {product.qualities.map(quality => (
                    <button
                      key={quality}
                      onClick={() => setSelectedQuality(quality)}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                        selectedQuality === quality 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {quality}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Add to Cart actions */}
          <div className="flex flex-col sm:flex-row items-stretch gap-4 mb-6">
            <div className="flex items-center border border-slate-200 rounded-xl h-12 w-full sm:w-32 shrink-0">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-full flex items-center justify-center text-slate-500 hover:text-primary transition-colors disabled:opacity-50"
                disabled={isOutOfStock}
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="flex-1 text-center font-semibold text-slate-900">
                {quantity}
              </div>
              <button 
                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                className="w-10 h-full flex items-center justify-center text-slate-500 hover:text-primary transition-colors disabled:opacity-50"
                disabled={isOutOfStock}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <Button 
              variant="outline" 
              className="flex-1 h-12 text-primary border-primary hover:bg-primary/5 font-semibold text-base"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>
            
            <Button 
              className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white font-semibold text-base shadow-sm"
              onClick={handleBuyNow}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
            </Button>
          </div>

          {/* Secondary actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button variant="outline" className="w-full h-12 border-slate-200 text-slate-700 font-medium">
              <Phone className="w-4 h-4 mr-2" />
              Call to Order
            </Button>
            <Button className="w-full h-12 bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium shadow-sm border-none">
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
          </div>

          {isOutOfStock && (
            <div className="mt-4 flex items-center gap-2 text-danger text-sm font-medium bg-danger/5 p-3 rounded-lg border border-danger/10">
              <AlertCircle className="w-4 h-4" />
              This product is currently out of stock.
            </div>
          )}

        </div>
      </div>

      {/* Tabs & Sidebar Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-8">
        
        {/* LEFT: Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="w-full justify-start border-b border-slate-200 rounded-none bg-transparent p-0 h-auto mb-8 space-x-8">
              <TabsTrigger 
                value="about" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 font-semibold text-base data-[state=active]:text-primary"
              >
                About Product
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 font-semibold text-base data-[state=active]:text-primary"
              >
                Reviews (128)
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="about" className="space-y-10 animate-in fade-in duration-500 outline-none">
              
              {/* Description */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Description</h3>
                <p className="text-slate-600 leading-relaxed">
                  {product.description}
                  <br/><br/>
                  Ensure your mobile device operates at peak performance with our extensively tested spare parts. 
                  Designed to seamlessly integrate with your existing hardware, our components provide a reliable 
                  and cost-effective solution for both personal repairs and professional service centers.
                </p>
              </div>

              {/* Specifications */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Specifications</h3>
                <div className="bg-slate-50 border border-slate-100 rounded-xl overflow-hidden">
                  {product.specifications?.map((spec, idx) => (
                    <div key={idx} className={`flex items-start sm:items-center flex-col sm:flex-row px-4 py-3 sm:py-4 ${idx !== product.specifications!.length - 1 ? 'border-b border-slate-200' : ''}`}>
                      <div className="w-full sm:w-1/3 text-sm font-semibold text-slate-700 mb-1 sm:mb-0">
                        {spec.key}
                      </div>
                      <div className="w-full sm:w-2/3 text-sm text-slate-600">
                        {spec.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Benefits */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Key Benefits</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {product.keyBenefits?.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-600 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </TabsContent>
            
            <TabsContent value="reviews" id="reviews" className="animate-in fade-in duration-500 outline-none">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-slate-900">Customer Reviews</h3>
                <Button variant="outline" className="border-slate-200 text-slate-700">Write a Review</Button>
              </div>
              
              <div className="flex flex-col gap-6">
                {mockReviews.map((review) => (
                  <div key={review.id} className="p-6 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-slate-900">{review.name}</h4>
                        <span className="text-xs text-slate-400">{review.date}</span>
                      </div>
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* RIGHT: Recently Viewed Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm sticky top-24">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Recently Viewed</h3>
            
            {recentlyViewed.length > 0 ? (
              <div className="flex flex-col gap-5">
                {recentlyViewed.map(item => (
                  <Link key={item.id} href={`/product/${item.slug}`} className="flex items-center gap-4 group">
                    <div className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-contain p-2 mix-blend-multiply group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex flex-col">
                      <h4 className="text-sm font-semibold text-slate-800 line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">৳{item.price.toLocaleString()}</span>
                        {item.oldPrice && (
                          <span className="text-xs text-slate-400 line-through">৳{item.oldPrice.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
               <div className="text-center py-8 text-slate-500 text-sm">
                 No products have been viewed recently.
               </div>
            )}
          </div>
        </div>

      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Related Products</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {relatedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
