"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  Search, Heart, ShoppingCart, ChevronDown, Menu, LayoutGrid, 
  Monitor, Battery, Zap, Volume2, Smartphone, Camera, Shield, CreditCard, 
  Disc, PenTool, Headphones, BatteryCharging, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { mockCategories } from "@/lib/mock-data/categories";
import { useMockAuth } from "@/context/MockAuthContext";

const categoryIconMap: Record<string, React.ReactNode> = {
  'Display': <Monitor className="w-6 h-6" />,
  'Battery': <Battery className="w-6 h-6" />,
  'Charging Logic': <Zap className="w-6 h-6" />,
  'Speaker': <Volume2 className="w-6 h-6" />,
  'Housing': <Smartphone className="w-6 h-6" />,
  'Camera': <Camera className="w-6 h-6" />,
  'Back Glass': <Shield className="w-6 h-6" />,
  'Sim Tray': <CreditCard className="w-6 h-6" />,
  'Camera Glass': <Disc className="w-6 h-6" />,
  'S PEN': <PenTool className="w-6 h-6" />,
  'Smartphones': <Smartphone className="w-6 h-6" />,
  'AirPods': <Headphones className="w-6 h-6" />,
  'Power Bank': <BatteryCharging className="w-6 h-6" />,
};

export function Header() {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const { isLoggedIn, customerName, logout } = useMockAuth();

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      {/* Top Row */}
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Mobile Menu & Logo */}
        <div className="flex items-center gap-4 lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0">
              <SheetHeader className="p-4 border-b text-left">
                <SheetTitle className="text-primary font-bold text-xl">NovaMobile</SheetTitle>
              </SheetHeader>
              <div className="p-4 flex flex-col gap-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="categories">
                    <AccordionTrigger className="text-base font-semibold">Categories</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col gap-2 pl-2">
                        {mockCategories.map(cat => (
                          <Link key={cat.id} href={`/category/${cat.slug}`} className="text-sm py-2 text-slate-600 hover:text-primary flex items-center gap-3">
                            <span className="text-slate-400">{categoryIconMap[cat.name] || <LayoutGrid className="w-4 h-4"/>}</span>
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <div className="flex flex-col gap-4 mt-2">
                  <Link href="/category/display" className="font-semibold text-slate-700 hover:text-primary">Display</Link>
                  <Link href="/category/battery" className="font-semibold text-slate-700 hover:text-primary">Battery</Link>
                  <Link href="/category/smartphones" className="font-semibold text-slate-700 hover:text-primary">Gadgets</Link>
                  <Link href="/blog" className="font-semibold text-slate-700 hover:text-primary">Blogs</Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/" className="text-2xl font-bold text-primary tracking-tight">NovaMobile</Link>
        </div>

        {/* Desktop Logo */}
        <div className="hidden lg:flex items-center">
          <Link href="/" className="text-3xl font-bold text-primary tracking-tight">NovaMobile</Link>
        </div>

        {/* Search Bar - Hidden on small mobile, visible on lg */}
        <div className="hidden lg:flex flex-1 max-w-xl relative mx-8">
          <Input 
            type="search" 
            placeholder="Search product..." 
            className="w-full pl-4 pr-12 rounded-full border-slate-300 focus-visible:ring-primary h-11"
          />
          <Button size="icon" className="absolute right-1 top-1 h-9 w-9 rounded-full bg-primary hover:bg-primary/90 text-white">
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 lg:gap-6">
          {/* Mobile Search Icon */}
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Search className="w-5 h-5" />
          </Button>

          <Link href="/account/wishlist" className="relative text-slate-600 hover:text-primary hidden sm:block">
            <Heart className="w-6 h-6" />
            <Badge className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 bg-danger text-white rounded-full text-[10px] border-2 border-white">2</Badge>
          </Link>
          
          <Link href="/cart" className="relative text-slate-600 hover:text-primary">
            <ShoppingCart className="w-6 h-6" />
            <Badge className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 bg-danger text-white rounded-full text-[10px] border-2 border-white">5</Badge>
          </Link>

          <div className="hidden lg:block h-8 w-px bg-slate-200 mx-2"></div>

          <div className="hidden lg:flex items-center">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3 py-1 hover:bg-slate-50 rounded-full h-10">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-left">
                      <span className="text-sm font-semibold leading-none text-slate-700">{customerName || "Customer"}</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">My Account <ChevronDown className="w-3 h-3"/></span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2">
                  <DropdownMenuItem asChild><Link href="/account" className="cursor-pointer">Dashboard</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/account/orders" className="cursor-pointer">Order History</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/account/profile" className="cursor-pointer">My Profile</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/account/change-password" className="cursor-pointer">Change Password</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-danger focus:text-danger focus:bg-danger/10 cursor-pointer"
                    onClick={logout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3 text-sm font-medium">
                <Link href="/login" className="text-slate-600 hover:text-primary transition-colors">Login</Link>
                <span className="text-slate-300">|</span>
                <Link href="/register" className="text-slate-600 hover:text-primary transition-colors">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Second Row - Desktop Nav */}
      <div className="hidden lg:block border-t bg-white">
        <div className="container mx-auto px-4 h-12 flex items-center gap-8 relative">
          
          <div 
            className="h-full flex items-center"
            onMouseEnter={() => setIsMegaMenuOpen(true)}
            onMouseLeave={() => setIsMegaMenuOpen(false)}
          >
            <Button variant="ghost" className="h-9 px-4 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 flex items-center gap-2 font-semibold">
              <LayoutGrid className="w-4 h-4" />
              Categories
            </Button>
            
            {/* Mega Menu Dropdown */}
            {isMegaMenuOpen && (
              <div className="absolute top-[48px] left-4 w-[800px] bg-white border rounded-xl shadow-lg p-6 z-50">
                <div className="grid grid-cols-4 gap-4">
                  {mockCategories.map(cat => (
                    <Link key={cat.id} href={`/category/${cat.slug}`} className="flex items-center gap-3 group p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        {categoryIconMap[cat.name] || <LayoutGrid className="w-5 h-5"/>}
                      </div>
                      <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <nav className="flex items-center gap-8 text-sm font-semibold text-slate-600">
            <Link href="/category/display" className="hover:text-primary transition-colors">Display</Link>
            <Link href="/category/battery" className="hover:text-primary transition-colors">Battery</Link>
            <Link href="/category/smartphones" className="hover:text-primary transition-colors">Gadgets</Link>
            <Link href="/blog" className="hover:text-primary transition-colors">Blogs</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
