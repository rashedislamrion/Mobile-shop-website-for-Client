"use client";

import { useEffect, useState, useMemo } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { FilterBar } from "@/components/admin/FilterBar";
import { DataTable, ActionDropdown } from "@/components/admin/DataTable";
import { FilterConfig, TableAction } from "@/types/table";
import { mockStockAdjustments, StockAdjustment, AdjustmentType } from "@/lib/mock-data/stock-adjustments";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Trash2, Plus, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const adjustmentFormSchema = z.object({
  branch: z.string().min(1, "Branch is required"),
  productId: z.string().min(1, "Product is required"),
  type: z.enum(["Increase", "Decrease", "Recount/Correction"]),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().optional(),
});

type AdjustmentFormValues = z.infer<typeof adjustmentFormSchema>;

export default function StockAdjustmentsPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [localData, setLocalData] = useState<StockAdjustment[]>(mockStockAdjustments);

  const form = useForm<AdjustmentFormValues>({
    resolver: zodResolver(adjustmentFormSchema),
    defaultValues: {
      branch: "",
      productId: "",
      type: "Increase",
      quantity: 1,
      reason: "",
      notes: "",
    },
  });

  const watchType = form.watch("type");
  const watchReason = form.watch("reason");
  const watchQuantity = form.watch("quantity");
  const watchProductId = form.watch("productId");

  // Mock product lookup for dialog
  const currentStock = watchProductId === "p1" ? 45 : watchProductId === "p2" ? 10 : 0;
  
  let newStock = currentStock;
  if (watchType === "Increase") newStock = currentStock + (watchQuantity || 0);
  if (watchType === "Decrease") newStock = Math.max(0, currentStock - (watchQuantity || 0));
  if (watchType === "Recount/Correction") newStock = watchQuantity || 0;

  useEffect(() => {
    setTitle("Stock Adjustments");
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
        { label: "Dhaka Main Branch", value: "Dhaka Main Branch" },
        { label: "Chattogram Branch", value: "Chattogram Branch" },
        { label: "Central Warehouse", value: "Central Warehouse" },
      ],
    },
    {
      type: "select",
      label: "Type",
      key: "type",
      options: [
        { label: "Increase", value: "Increase" },
        { label: "Decrease", value: "Decrease" },
        { label: "Recount/Correction", value: "Recount/Correction" },
      ],
    },
    {
      type: "dateRange",
      label: "Date Range",
      key: "dateRange",
    },
  ];

  const filteredData = useMemo(() => {
    let result = [...localData];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.productName.toLowerCase().includes(q) ||
          o.productSku.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q)
      );
    }

    if (filters.branch) {
      result = result.filter((o) => o.branch === filters.branch);
    }
    if (filters.type) {
      result = result.filter((o) => o.type === filters.type);
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
  }, [searchQuery, filters, localData]);

  const createActions = (row: StockAdjustment): TableAction[] => {
    const hoursSince = (new Date().getTime() - new Date(row.date).getTime()) / (1000 * 60 * 60);
    const isLocked = hoursSince > 24;

    return [
      { label: "View Details", icon: <Eye className="w-4 h-4" />, onClick: () => toast.info(`Viewing details for ${row.id}`) },
      { 
        label: "Delete", 
        icon: <Trash2 className="w-4 h-4 text-red-500" />, 
        variant: "destructive", 
        disabled: isLocked,
        disabledTooltip: "Adjustment locked after 24h",
        onClick: () => {
          toast.error("Adjustment deleted");
          setLocalData(prev => prev.filter(a => a.id !== row.id));
        }
      },
    ];
  };

  const getAdjustmentTag = (type: AdjustmentType) => {
    if (type === "Increase") {
      return (
        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full w-fit text-xs font-semibold">
          <ArrowUpRight className="w-3.5 h-3.5" /> Increase
        </div>
      );
    }
    if (type === "Decrease") {
      return (
        <div className="flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full w-fit text-xs font-semibold">
          <ArrowDownRight className="w-3.5 h-3.5" /> Decrease
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full w-fit text-xs font-semibold">
        <RefreshCw className="w-3.5 h-3.5" /> Recount
      </div>
    );
  };

  const columns: ColumnDef<StockAdjustment>[] = [
    {
      accessorKey: "id",
      header: "Ref No.",
      cell: ({ row }) => <span className="font-mono text-sm font-semibold text-slate-700">{row.original.id}</span>
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.original.date);
        return (
          <span className="text-slate-600 whitespace-nowrap">
            {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        );
      }
    },
    {
      accessorKey: "branch",
      header: "Branch",
      cell: ({ row }) => <span className="text-slate-700 font-medium">{row.original.branch}</span>
    },
    {
      id: "product",
      header: "Product",
      cell: ({ row }) => (
        <div className="flex items-center gap-3 max-w-[200px]">
          <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-slate-100 border border-slate-200 relative">
            <Image src={row.original.productImage} alt="Product" fill className="object-cover" />
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-slate-800 text-sm truncate" title={row.original.productName}>{row.original.productName}</p>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">{row.original.productSku}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => getAdjustmentTag(row.original.type)
    },
    {
      accessorKey: "quantityChange",
      header: "Change",
      cell: ({ row }) => {
        const val = row.original.quantityChange;
        const color = val > 0 ? "text-emerald-600" : val < 0 ? "text-red-600" : "text-slate-600";
        const sign = val > 0 ? "+" : "";
        return <span className={`font-bold ${color}`}>{sign}{val}</span>;
      }
    },
    {
      id: "beforeAfter",
      header: "Stock (Before → After)",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">{row.original.stockBefore}</span>
          <span className="text-slate-300">→</span>
          <span className="font-semibold text-slate-800">{row.original.stockAfter}</span>
        </div>
      )
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <ActionDropdown actions={createActions(row.original)} rowData={row.original} />
        </div>
      ),
    },
  ];

  const onSubmit = (data: AdjustmentFormValues) => {
    const isRecount = data.type === "Recount/Correction";
    const change = isRecount ? (data.quantity - currentStock) : (data.type === "Decrease" ? -data.quantity : data.quantity);

    const newAdjustment: StockAdjustment = {
      id: `ADJ-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString(),
      branch: data.branch,
      productId: data.productId,
      productName: data.productId === "p1" ? "iPhone 13 Pro Max Display - OLED" : "Test Product",
      productSku: "TEST-SKU",
      productImage: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=200&h=200&fit=crop",
      type: data.type,
      quantityChange: change,
      stockBefore: currentStock,
      stockAfter: newStock,
      reason: data.reason as any,
      notes: data.notes,
      adjustedBy: "Current User",
    };

    setLocalData([newAdjustment, ...localData]);
    toast.success("Stock adjustment created successfully!");
    setIsDialogOpen(false);
    form.reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-3">
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) form.reset();
        }}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm">
              <Plus className="w-4 h-4" /> New Adjustment
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Stock Adjustment</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                
                <FormField
                  control={form.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch *</FormLabel>
                      <FormControl>
                        <select className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" {...field}>
                          <option value="">Select branch...</option>
                          <option value="Dhaka Main Branch">Dhaka Main Branch</option>
                          <option value="Central Warehouse">Central Warehouse</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product *</FormLabel>
                      <FormControl>
                        <select className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" {...field}>
                          <option value="">Search product...</option>
                          <option value="p1">iPhone 13 Pro Max Display - OLED</option>
                          <option value="p2">Samsung Galaxy S22 Ultra Battery</option>
                        </select>
                      </FormControl>
                      {field.value && (
                        <p className="text-xs text-blue-600 font-medium mt-1">Current stock: {currentStock} units</p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-3 pt-2">
                      <FormLabel>Adjustment Type *</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="radio" value="Increase" checked={field.value === "Increase"} onChange={field.onChange} className="text-emerald-600 focus:ring-emerald-600" />
                            Increase
                          </label>
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="radio" value="Decrease" checked={field.value === "Decrease"} onChange={field.onChange} className="text-emerald-600 focus:ring-emerald-600" />
                            Decrease
                          </label>
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="radio" value="Recount/Correction" checked={field.value === "Recount/Correction"} onChange={field.onChange} className="text-emerald-600 focus:ring-emerald-600" />
                            Set Exact Count
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {watchType === "Increase" && "Quantity to Add *"}
                        {watchType === "Decrease" && "Quantity to Remove *"}
                        {watchType === "Recount/Correction" && "New Total Count *"}
                      </FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      {watchProductId && (
                        <p className={`text-xs font-semibold mt-1 ${
                          newStock < currentStock ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          New stock will be: {newStock} units
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason *</FormLabel>
                      <FormControl>
                        <select className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" {...field}>
                          <option value="">Select reason...</option>
                          <option value="New Stock Received">New Stock Received</option>
                          <option value="Damaged">Damaged</option>
                          <option value="Recount Correction">Recount Correction</option>
                          <option value="Theft/Loss">Theft/Loss</option>
                          <option value="Return to Supplier">Return to Supplier</option>
                          <option value="Other">Other</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchReason === "Other" && (
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes *</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Explain reason..." className="resize-none h-20" {...field} required={watchReason === "Other"} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <button type="button" onClick={() => setIsDialogOpen(false)} className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors text-sm">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm">
                    Save Adjustment
                  </button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <FilterBar 
        searchPlaceholder="Search product, reference..."
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
