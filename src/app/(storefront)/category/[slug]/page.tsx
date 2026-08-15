"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, Filter, X } from "lucide-react";
import { ProductCard } from "@/components/storefront/ProductCard";
import { mockProducts } from "@/lib/mock-data/products";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Extract unique filter options from mockProducts (or hardcode)
const BRANDS = ["Apple", "Samsung", "Xiaomi", "Google", "HONOR", "HUAWEI", "LG"];
const COLORS = ["Black", "White", "Gray", "Silver", "Green", "Bronze", "Blue"];
const QUALITIES = ["Original", "OEM", "High Quality", "GX", "IPS", "TFT", "OLED Small"];
const GUARANTEES = ["N/A", "7 Days", "30 Days"];
const FRAMES = ["With Frame", "No Frame"];
const TYPES = ["Small Display", "Big Display"];
const SERVICES = ["Display Replacement"];

export default function CategoryPage({ params }: { params: { slug: string } }) {
  // We mock loading the category name
  const categoryName = params.slug === 'all' ? 'All Products' : params.slug.replace(/-/g, ' ').toUpperCase();

  // Filter states
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedQualities, setSelectedQualities] = useState<string[]>([]);
  const [selectedGuarantees, setSelectedGuarantees] = useState<string[]>([]);
  const [selectedFrames, setSelectedFrames] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  
  // Sort & Pagination
  const [sortParam, setSortParam] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Toggle filter helper
  const toggleFilter = (setFn: React.Dispatch<React.SetStateAction<string[]>>, val: string) => {
    setFn(prev => {
      const newFilter = prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val];
      setCurrentPage(1); // Reset to page 1 on filter change
      return newFilter;
    });
  };

  const clearAll = () => {
    setSelectedBrands([]);
    setSelectedColors([]);
    setSelectedQualities([]);
    setSelectedGuarantees([]);
    setSelectedFrames([]);
    setSelectedTypes([]);
    setSelectedServices([]);
    setCurrentPage(1);
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    // 1. Filter by Category Slug
    let res = mockProducts; 
    
    // In our mock, if they click a specific category, let's filter by it.
    // If it's too few products, pagination won't show. That's fine.
    if (params.slug && params.slug !== 'all') {
       res = res.filter(p => p.category?.slug === params.slug);
    }

    // 2. Filter by checkbox selections
    if (selectedBrands.length > 0) {
      res = res.filter(p => p.brand && selectedBrands.includes(p.brand.name));
    }
    if (selectedColors.length > 0) {
      res = res.filter(p => p.colors?.some(c => selectedColors.includes(c)));
    }
    if (selectedQualities.length > 0) {
      res = res.filter(p => p.quality && selectedQualities.includes(p.quality));
    }
    if (selectedGuarantees.length > 0) {
      res = res.filter(p => p.guarantee && selectedGuarantees.includes(p.guarantee));
    }
    if (selectedFrames.length > 0) {
      res = res.filter(p => p.frame && selectedFrames.includes(p.frame));
    }
    if (selectedTypes.length > 0) {
      res = res.filter(p => p.type && selectedTypes.includes(p.type));
    }
    if (selectedServices.length > 0) {
      res = res.filter(p => p.service && selectedServices.includes(p.service));
    }

    // 3. Sort
    res.sort((a, b) => {
      if (sortParam === "price-low") return a.price - b.price;
      if (sortParam === "price-high") return b.price - a.price;
      if (sortParam === "newest") return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      // popular
      return (b.popularity || 0) - (a.popularity || 0);
    });

    return res;
  }, [selectedBrands, selectedColors, selectedQualities, selectedGuarantees, selectedFrames, selectedTypes, selectedServices, sortParam, params.slug]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const FilterSidebar = () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">Filters</h3>
        <button onClick={clearAll} className="text-sm text-primary hover:underline">Clear all</button>
      </div>

      <Accordion type="multiple" defaultValue={["brand", "color", "quality"]} className="w-full">
        {/* Brand */}
        <AccordionItem value="brand" className="border-slate-100">
          <AccordionTrigger className="py-3 hover:no-underline font-semibold text-slate-700">Brand</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3 mt-1 pb-1">
              {BRANDS.map(b => (
                <label key={b} className="flex items-center gap-3 cursor-pointer group">
                  <Checkbox 
                    checked={selectedBrands.includes(b)}
                    onCheckedChange={() => toggleFilter(setSelectedBrands, b)}
                    className="rounded-sm border-slate-300 data-[state=checked]:bg-primary" 
                  />
                  <span className="text-sm text-slate-600 group-hover:text-primary transition-colors">{b}</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Color */}
        <AccordionItem value="color" className="border-slate-100">
          <AccordionTrigger className="py-3 hover:no-underline font-semibold text-slate-700">Color</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3 mt-1 pb-1">
              {COLORS.map(c => (
                <label key={c} className="flex items-center gap-3 cursor-pointer group">
                  <Checkbox 
                    checked={selectedColors.includes(c)}
                    onCheckedChange={() => toggleFilter(setSelectedColors, c)}
                    className="rounded-sm border-slate-300 data-[state=checked]:bg-primary"
                  />
                  <span className="text-sm text-slate-600 group-hover:text-primary transition-colors">{c}</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Quality */}
        <AccordionItem value="quality" className="border-slate-100">
          <AccordionTrigger className="py-3 hover:no-underline font-semibold text-slate-700">Quality</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3 mt-1 pb-1">
              {QUALITIES.map(q => (
                <label key={q} className="flex items-center gap-3 cursor-pointer group">
                  <Checkbox 
                    checked={selectedQualities.includes(q)}
                    onCheckedChange={() => toggleFilter(setSelectedQualities, q)}
                    className="rounded-sm border-slate-300 data-[state=checked]:bg-primary"
                  />
                  <span className="text-sm text-slate-600 group-hover:text-primary transition-colors">{q}</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Guarantee */}
        <AccordionItem value="guarantee" className="border-slate-100">
          <AccordionTrigger className="py-3 hover:no-underline font-semibold text-slate-700">Guarantee</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3 mt-1 pb-1">
              {GUARANTEES.map(g => (
                <label key={g} className="flex items-center gap-3 cursor-pointer group">
                  <Checkbox 
                    checked={selectedGuarantees.includes(g)}
                    onCheckedChange={() => toggleFilter(setSelectedGuarantees, g)}
                    className="rounded-sm border-slate-300 data-[state=checked]:bg-primary"
                  />
                  <span className="text-sm text-slate-600 group-hover:text-primary transition-colors">{g}</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Frame */}
        <AccordionItem value="frame" className="border-slate-100">
          <AccordionTrigger className="py-3 hover:no-underline font-semibold text-slate-700">Frame</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3 mt-1 pb-1">
              {FRAMES.map(f => (
                <label key={f} className="flex items-center gap-3 cursor-pointer group">
                  <Checkbox 
                    checked={selectedFrames.includes(f)}
                    onCheckedChange={() => toggleFilter(setSelectedFrames, f)}
                    className="rounded-sm border-slate-300 data-[state=checked]:bg-primary"
                  />
                  <span className="text-sm text-slate-600 group-hover:text-primary transition-colors">{f}</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Type */}
        <AccordionItem value="type" className="border-slate-100">
          <AccordionTrigger className="py-3 hover:no-underline font-semibold text-slate-700">Type</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3 mt-1 pb-1">
              {TYPES.map(t => (
                <label key={t} className="flex items-center gap-3 cursor-pointer group">
                  <Checkbox 
                    checked={selectedTypes.includes(t)}
                    onCheckedChange={() => toggleFilter(setSelectedTypes, t)}
                    className="rounded-sm border-slate-300 data-[state=checked]:bg-primary"
                  />
                  <span className="text-sm text-slate-600 group-hover:text-primary transition-colors">{t}</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Service */}
        <AccordionItem value="service" className="border-slate-100">
          <AccordionTrigger className="py-3 hover:no-underline font-semibold text-slate-700">Service</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3 mt-1 pb-1">
              {SERVICES.map(s => (
                <label key={s} className="flex items-center gap-3 cursor-pointer group">
                  <Checkbox 
                    checked={selectedServices.includes(s)}
                    onCheckedChange={() => toggleFilter(setSelectedServices, s)}
                    className="rounded-sm border-slate-300 data-[state=checked]:bg-primary"
                  />
                  <span className="text-sm text-slate-600 group-hover:text-primary transition-colors">{s}</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button & Title */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/">
          <Button variant="outline" size="icon" className="w-10 h-10 rounded-full border-slate-200">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{categoryName}</h1>
      </div>

      <div className="flex gap-8 items-start">
        {/* LEFT: Desktop Sidebar */}
        <div className="hidden lg:block w-[260px] shrink-0 sticky top-24">
          <FilterSidebar />
        </div>

        {/* RIGHT: Main Content */}
        <div className="flex-1 min-w-0">
          
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              {/* Mobile Filter Trigger */}
              <div className="lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 border-slate-200">
                      <Filter className="w-4 h-4" /> Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[350px] overflow-y-auto">
                    <SheetHeader className="mb-6">
                      <SheetTitle>Filter Products</SheetTitle>
                    </SheetHeader>
                    <FilterSidebar />
                  </SheetContent>
                </Sheet>
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Showing {paginatedProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} results
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Sort By:</span>
              <Select value={sortParam} onValueChange={(val) => { setSortParam(val); setCurrentPage(1); }}>
                <SelectTrigger className="w-[180px] bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="price-low">Price Low-High</SelectItem>
                  <SelectItem value="price-high">Price High-Low</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Product Grid */}
          {paginatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {paginatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center flex flex-col items-center justify-center bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400">
                <X className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">No products found</h3>
              <p className="text-slate-500 mt-2 text-sm">Try adjusting your filters or search criteria.</p>
              <Button variant="outline" className="mt-6 border-slate-200" onClick={clearAll}>Clear Filters</Button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }).map((_, i) => {
                    // Logic to show limited pages if we have too many, but for now we only have up to ~4 pages (45 items).
                    return (
                      <PaginationItem key={i}>
                        <PaginationLink 
                          href="#" 
                          isActive={currentPage === i + 1}
                          onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)); }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
