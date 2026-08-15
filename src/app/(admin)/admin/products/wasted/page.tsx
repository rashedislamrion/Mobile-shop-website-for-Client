"use client";

import { useEffect, useState, useMemo } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { FilterBar } from "@/components/admin/FilterBar";
import { DataTable, StatusBadge, ActionDropdown } from "@/components/admin/DataTable";
import { FilterConfig, StatusVariant, TableAction } from "@/types/table";
import { mockWastedProducts, MockWastedProduct } from "@/lib/mock-data/products/wasted";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Trash2, Plus } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function WastedProductsPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    setTitle("Wasted Products");
    setBadge("Website");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterConfigs: FilterConfig[] = [
    {
      type: "select",
      label: "Branch",
      key: "branch",
      options: [
        { label: "Dhaka Main", value: "Dhaka Main" },
        { label: "Chattogram", value: "Chattogram" },
        { label: "Sylhet", value: "Sylhet" },
        { label: "Rajshahi", value: "Rajshahi" },
      ],
    },
    {
      type: "select",
      label: "Reason",
      key: "reason",
      options: [
        { label: "Damaged", value: "Damaged" },
        { label: "Expired", value: "Expired" },
        { label: "Lost", value: "Lost" },
        { label: "Defective", value: "Defective" },
      ],
    },
    {
      type: "dateRange",
      label: "Date Range",
      key: "dateRange",
    },
  ];

  const filteredData = useMemo(() => {
    let result = [...mockWastedProducts];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.productName.toLowerCase().includes(q) ||
          o.reportedBy.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q)
      );
    }

    if (filters.branch) {
      result = result.filter((o) => o.branch === filters.branch);
    }
    if (filters.reason) {
      result = result.filter((o) => o.reason === filters.reason);
    }

    const dateRange = filters.dateRange as { from?: Date; to?: Date } | undefined;
    if (dateRange?.from) {
      const from = new Date(dateRange.from).getTime();
      const to = dateRange.to ? new Date(dateRange.to).getTime() : from;
      
      result = result.filter((o) => {
        const orderTime = new Date(o.date).getTime();
        return orderTime >= from && orderTime <= to + 86400000;
      });
    }

    return result;
  }, [searchQuery, filters]);

  const createActions = (): TableAction[] => [
    { label: "View Details", icon: <Eye className="w-4 h-4" />, onClick: (row) => toast.info(`Viewing details for ${row.id}`) },
    { label: "Delete", icon: <Trash2 className="w-4 h-4 text-red-500" />, variant: "destructive", onClick: () => toast.error("Report deleted") },
  ];

  const getReasonVariant = (reason: string): StatusVariant => {
    switch (reason) {
      case "Damaged": return "danger";
      case "Expired": return "warning";
      case "Lost": return "neutral";
      case "Defective": return "notice";
      default: return "neutral";
    }
  };

  const columns: ColumnDef<MockWastedProduct>[] = [
    {
      id: "product",
      header: "Product",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-slate-100 border border-slate-200 relative">
            <Image src={row.original.productImage} alt="Product" fill className="object-cover" />
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-slate-800 text-sm truncate">{row.original.productName}</p>
            <p className="text-xs text-slate-500 mt-0.5">ID: {row.original.id}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "branch",
      header: "Branch",
    },
    {
      accessorKey: "quantityWasted",
      header: "Qty",
      cell: ({ row }) => <span className="font-semibold">{row.original.quantityWasted}</span>
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => (
        <StatusBadge 
          status={row.original.reason} 
          type={getReasonVariant(row.original.reason)} 
        />
      ),
    },
    {
      accessorKey: "costImpact",
      header: "Cost Impact",
      cell: ({ row }) => <span className="font-bold text-red-500">-৳{row.original.costImpact.toLocaleString()}</span>,
    },
    {
      accessorKey: "reportedBy",
      header: "Reported By",
      cell: ({ row }) => (
        <span className="text-slate-700 font-medium">{row.original.reportedBy}</span>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.original.date);
        return (
          <span className="text-slate-700 whitespace-nowrap">
            {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        );
      }
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <ActionDropdown actions={createActions()} rowData={row.original} />
        </div>
      ),
    },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Wasted item reported successfully!");
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-3">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm">
              <Plus className="w-4 h-4" /> Report Wasted Item
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Report Wasted Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Product *</label>
                <select className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" required>
                  <option value="">Select product...</option>
                  <option value="1">iPhone 13 Pro Max Display - OLED</option>
                  <option value="2">Samsung Galaxy S22 Ultra Battery</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Branch *</label>
                <select className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" required>
                  <option value="">Select branch...</option>
                  <option value="Dhaka Main">Dhaka Main</option>
                  <option value="Chattogram">Chattogram</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Quantity *</label>
                  <Input type="number" min={1} required />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Reason *</label>
                  <select className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" required>
                    <option value="">Select...</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Expired">Expired</option>
                    <option value="Lost">Lost</option>
                    <option value="Defective">Defective</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Notes</label>
                <Textarea placeholder="Explain what happened..." className="resize-none" />
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-md flex justify-between items-center mt-2">
                <span className="text-sm text-slate-600 font-medium">Estimated Cost Impact</span>
                <span className="text-sm font-bold text-red-500">৳0.00</span>
              </div>
              <div className="pt-2 flex justify-end">
                <button type="submit" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm">
                  Submit Report
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <FilterBar 
        searchPlaceholder="Search product, reported by..."
        filters={filterConfigs}
        onSearchChange={(val) => setSearchQuery(val)}
        onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
        onReset={() => {
          setSearchQuery("");
          setFilters({});
        }}
      />

      <DataTable 
        columns={columns} 
        data={filteredData} 
        pageSize={10}
      />
    </div>
  );
}
