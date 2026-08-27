import Link from "next/link";
import { 
  ArrowRight, LayoutGrid, Monitor, Battery, Zap, Volume2, 
  Smartphone, Camera, Shield, CreditCard, Disc, PenTool, 
  Headphones, BatteryCharging, ChevronLeft, ChevronRight,
  PackageSearch
} from "lucide-react";
import { HeroCarousel } from "@/components/storefront/HeroCarousel";
import { ProductCard } from "@/components/storefront/ProductCard";
import { BlogCard } from "@/components/storefront/BlogCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiGet, getImageUrl } from "@/lib/api-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

async function getHomeData() {
  try {
    const [categoriesTree, productsRes, blogsRes] = await Promise.all([
      apiGet<any>("/categories/tree").catch((e) => {
        console.error("Categories fetch error:", e);
        return [];
      }),
      apiGet<any>("/products", { limit: 12, sort: "popular" }).catch((e) => {
        console.error("Products popular fetch error:", e);
        return { data: [] };
      }),
      apiGet<any>("/blogs").catch((e) => {
        console.error("Blogs fetch error:", e);
        return [];
      }),
    ]);

    const categories = Array.isArray(categoriesTree)
      ? categoriesTree
      : categoriesTree?.data || [];

    let products = Array.isArray(productsRes)
      ? productsRes
      : productsRes?.data || [];

    // Cold start fallback: If popular sort returns fewer than 4 items, fall back to newest
    if (products.length < 4) {
      const fallbackRes = await apiGet<any>("/products", { limit: 12, sort: "newest" }).catch((e) => {
        console.error("Products fallback fetch error:", e);
        return { data: [] };
      });
      const fallbackData = Array.isArray(fallbackRes) ? fallbackRes : fallbackRes?.data || [];
      if (fallbackData.length > 0) {
        products = fallbackData;
      }
    }

    const blogs = Array.isArray(blogsRes) ? blogsRes : blogsRes?.data || [];

    return {
      categories,
      products,
      blogs: blogs.slice(0, 3),
    };
  } catch (err) {
    console.error("getHomeData global catch:", err);
    return {
      categories: [],
      products: [],
      blogs: [],
    };
  }
}

export default async function StorefrontHome() {
  const { categories, products, blogs } = await getHomeData();
  const bestDeals = products.slice(0, 10);
  const featuredProducts = products.slice(0, 5);

  return (
    <div className="flex flex-col gap-12 pb-16">
      {/* 1. Hero Banner */}
      <section className="container mx-auto px-4 pt-6">
        <HeroCarousel />
      </section>

      {/* 2. Shop By Category */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Shop by Category</h2>
            <p className="text-sm text-slate-500 mt-1">Explore genuine smartphone parts & premium accessories</p>
          </div>
          <Link href="/category/all" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
            Browse All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {categories.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm border rounded-xl">
            No categories available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 12).map((cat) => {
              const icon = categoryIconMap[cat.name] || <Smartphone className="w-8 h-8" />;
              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug || cat.id}`}
                  className="group flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors mb-3 overflow-hidden">
                    {cat.icon ? (
                      <img src={getImageUrl(cat.icon)} alt={cat.name} className="w-8 h-8 object-contain" />
                    ) : (
                      icon
                    )}
                  </div>
                  <span className="font-semibold text-sm text-slate-800 group-hover:text-primary transition-colors line-clamp-1">
                    {cat.name}
                  </span>
                  <span className="text-xs text-slate-400 mt-0.5">
                    {cat._count?.products || 0} items
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Best Deals & Spare Parts */}
      <section className="container mx-auto px-4">
        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Best Deals & Spare Parts</h2>
            <TabsList className="bg-slate-100 p-1 rounded-xl">
              <TabsTrigger value="all" className="rounded-lg text-xs font-bold px-4 py-2">
                All Popular
              </TabsTrigger>
              <TabsTrigger value="spare" className="rounded-lg text-xs font-bold px-4 py-2">
                Displays & Logic
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-0 outline-none">
            {bestDeals.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm border rounded-xl">
                No products found.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                {bestDeals.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="spare" className="mt-0 outline-none">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {bestDeals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* 4. Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Featured Products</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Ready Blogs */}
      {blogs.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Latest Guides & News</h2>
            <Link href="/blog" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
              All Articles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
