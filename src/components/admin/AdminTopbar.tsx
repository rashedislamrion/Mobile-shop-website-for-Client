"use client";

import { Search, Menu, History, Store, ChevronDown, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AdminSidebar } from "./AdminSidebar";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { useState } from "react";

const mockBranches = [
  "Global Admin",
  "Motijheel Plaza Shopping Complex",
  "Gulistan Shopping Complex",
  "Eastern Plaza Shopping Complex"
];

const mockThemes = [
  { name: "Emerald", color: "bg-emerald-600" },
  { name: "Purple", color: "bg-purple-600" },
  { name: "Blue", color: "bg-blue-600" },
  { name: "Rose", color: "bg-rose-600" },
];

export function AdminTopbar() {
  const { title, badge, isMobileSidebarOpen, setIsMobileSidebarOpen, dateFilter, setDateFilter } = useAdminPage();
  const [activeBranch, setActiveBranch] = useState(mockBranches[0]);

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Sidebar Toggle */}
        <div className="lg:hidden">
          <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-600">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-r-0">
              <AdminSidebar />
            </SheetContent>
          </Sheet>
        </div>

        {/* Page Title & Badge */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-800">{title}</h1>
          {badge && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold uppercase tracking-wider hidden sm:inline-block">
              {badge}
            </span>
          )}
          
          {/* Date Filter */}
          <div className="ml-2 hidden sm:block">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="h-8 border-transparent bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-medium px-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Today">Today</SelectItem>
                <SelectItem value="This Week">This Week</SelectItem>
                <SelectItem value="This Month">This Month</SelectItem>
                <SelectItem value="This Year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        
        {/* Search Icon */}
        <Button variant="ghost" size="icon" className="text-slate-600 hidden sm:flex">
          <Search className="w-5 h-5" />
        </Button>
        
        {/* History Icon */}
        <Button variant="ghost" size="icon" className="text-slate-600 hidden sm:flex">
          <History className="w-5 h-5" />
        </Button>

        {/* POS Button */}
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full h-9 px-4 hidden sm:flex">
          <Store className="w-4 h-4 mr-2" />
          POS
        </Button>

        {/* Branch Selector */}
        <div className="hidden md:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9 rounded-full border-slate-200 text-slate-700 font-normal">
                <Store className="w-4 h-4 mr-2 text-emerald-600" />
                <span className="truncate max-w-[150px]">{activeBranch}</span>
                <ChevronDown className="w-4 h-4 ml-2 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[280px]">
              <DropdownMenuLabel>Select Branch</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {mockBranches.map(branch => (
                <DropdownMenuItem 
                  key={branch} 
                  className={activeBranch === branch ? 'bg-emerald-50 text-emerald-700 font-medium' : ''}
                  onClick={() => setActiveBranch(branch)}
                >
                  {branch}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:bg-slate-50 p-1 rounded-full pr-3 transition-colors text-left outline-none border border-transparent focus-visible:ring-2 focus-visible:ring-emerald-500">
              <Avatar className="h-9 w-9 border border-slate-200">
                <AvatarImage src="https://i.pravatar.cc/150?u=admin_bijoy" alt="Admin" />
                <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">BS</AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col">
                <span className="text-sm font-bold text-slate-800 leading-none">Bijoy Chandra Sarkar</span>
                <span className="text-xs text-slate-500 mt-1 leading-none">SEO</span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal md:hidden">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold leading-none text-slate-900">Bijoy Chandra Sarkar</p>
                <p className="text-xs leading-none text-slate-500">SEO</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="md:hidden" />
            <DropdownMenuItem>My Profile</DropdownMenuItem>
            
            {/* Nested Popover for Color Palette inside Dropdown (using sub menu pattern or just popover) */}
            <Popover>
              <PopoverTrigger asChild>
                <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 focus:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                  <Palette className="w-4 h-4 mr-2 text-slate-500" />
                  Change Color Palette
                </div>
              </PopoverTrigger>
              <PopoverContent side="left" className="w-40 p-2">
                <div className="grid grid-cols-2 gap-2">
                  {mockThemes.map(theme => (
                    <button 
                      key={theme.name}
                      className="flex flex-col items-center gap-1 p-2 rounded hover:bg-slate-50 transition-colors"
                      title={theme.name}
                    >
                      <div className={`w-8 h-8 rounded-full ${theme.color}`} />
                      <span className="text-xs text-slate-500">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-danger focus:text-danger focus:bg-danger/5">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
