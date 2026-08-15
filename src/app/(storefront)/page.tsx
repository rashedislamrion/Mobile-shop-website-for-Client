import Link from "next/link";
import { ArrowRight, LayoutGrid, Monitor, Battery, Zap, Volume2, Smartphone, Camera, Shield, CreditCard, Disc, PenTool, Headphones, BatteryCharging, ChevronLeft, ChevronRight } from "lucide-react";
import { HeroCarousel } from "@/components/storefront/HeroCarousel";
import { ProductCard } from "@/components/storefront/ProductCard";
import { BlogCard } from "@/components/storefront/BlogCard";
import { mockCategories } from "@/lib/mock-data/categories";
import { mockProducts } from "@/lib/mock-data/products";
import { mockBlogs } from "@/lib/mock-data/blogs";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categoryIconMap: Record<string, React.ReactNode> = {
  'Display': <Monitor className="w-8 h-8" />,
  'Battery': <Battery className="w-8 h-8" />,
  'Charging Logic': <Zap className="w-8 h-8" />,
  'Speaker': <Volume2 className="w-8 h-8" />,
  'Housing': <Smartphone className="w-8 h-8" />,
  'Camera': <Camera className="w-8 h-8" />,
  'Back Glass': <Shield className="w-8 h-8" />,
  'Sim Tray': <CreditCard className="w-8 h-8" />,
  'Camera Glass': <Disc className="w-8 h-8" />,
  'S PEN': <PenTool className="w-8 h-8" />,
  'Smartphones': <Smartphone className="w-8 h-8" />,
  'AirPods': <Headphones className="w-8 h-8" />,
  'Power Bank': <BatteryCharging className="w-8 h-8" />,
};

export default function StorefrontHome() {
  const bestDeals = mockProducts.slice(0, 10);
  const featuredProducts = mockProducts.slice(10, 15);

  return (
    <div className="flex flex-col gap-12 pb-16">
      {/* 1. Hero Banner */}
      <section className="container mx-auto px-4 pt-6">
        <HeroCarousel />
      </section>

      {/* 2. Popular Categories */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Popular Categories</h2>
          <div className="flex items-center gap-2 hidden sm:flex">
            <Button variant="outline" size="icon" className="w-8 h-8 rounded-full border-slate-200 text-slate-500 hover:text-primary">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="w-8 h-8 rounded-full border-slate-200 text-slate-500 hover:text-primary">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
          {mockCategories.map((cat) => (
            <Link key={cat.id} href={`/category/${cat.slug}`} className="snap-start flex flex-col items-center gap-3 group min-w-[100px]">
              <div className="w-20 h-20 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-slate-500 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all shadow-sm group-hover:shadow-md">
                {categoryIconMap[cat.name] || <LayoutGrid className="w-8 h-8" />}
              </div>
              <span className="text-xs font-semibold text-slate-600 text-center group-hover:text-primary transition-colors line-clamp-1 w-full px-1">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Best Deals */}
      <section className="container mx-auto px-4">
        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Best Deals</h2>
            <TabsList className="bg-slate-100/50 p-1 rounded-full h-11 w-full sm:w-auto">
              <TabsTrigger value="all" className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-white">All</TabsTrigger>
              <TabsTrigger value="spare" className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Spare Parts</TabsTrigger>
              <TabsTrigger value="gadgets" className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Gadgets</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-0 outline-none">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {bestDeals.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="spare" className="mt-0 outline-none">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {bestDeals.filter(p => p.category?.name !== 'AirPods' && p.category?.name !== 'Power Bank' && p.category?.name !== 'Smartphones').map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="gadgets" className="mt-0 outline-none">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {bestDeals.filter(p => ['AirPods', 'Power Bank', 'Smartphones'].includes(p.category?.name || '')).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* 4. Featured Products */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Featured Products</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. Ready Blogs */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Ready Blogs</h2>
          <Link href="/blog" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
            All Blogs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockBlogs.map(blog => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      </section>
    </div>
  );
}
