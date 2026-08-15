"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { FilterBar } from "@/components/admin/FilterBar";
import { DataTable, ActionDropdown } from "@/components/admin/DataTable";
import { FilterConfig, TableAction } from "@/types/table";
import { mockSeries, MockSeries } from "@/lib/mock-data/products/series";
import { ColumnDef } from "@tanstack/react-table";
import { Edit2, Trash2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";

export default function SeriesPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    setTitle("Series");
    setBadge("Website");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterConfigs: FilterConfig[] = [
    {
      type: "select",
      label: "Brand",
      key: "brandName",
      options: [
        { label: "Apple", value: "Apple" },
        { label: "Samsung", value: "Samsung" },
        { label: "Xiaomi", value: "Xiaomi" },
        { label: "Realme", value: "Realme" },
        { label: "OnePlus", value: "OnePlus" },
      ],
    },
  ];

  const filteredData = mockSeries.filter((o) => {
    let match = true;
    if (searchQuery) {
      match = match && o.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    if (filters.brandName) {
      match = match && o.brandName === filters.brandName;
    }
    return match;
  });

  const createActions = (): TableAction[] => [
    { label: "Edit", icon: <Edit2 className="w-4 h-4" />, onClick: (row) => toast.info(`Edit ${row.name}`) },
    { label: "Delete", icon: <Trash2 className="w-4 h-4 text-red-500" />, variant: "destructive", onClick: () => toast.error("Series deleted") },
  ];

  const columns: ColumnDef<MockSeries>[] = [
    {
      accessorKey: "name",
      header: "Series Name",
      cell: ({ row }) => <span className="font-semibold text-slate-800">{row.original.name}</span>,
    },
    {
      accessorKey: "brandName",
      header: "Brand",
      cell: ({ row }) => (
        <Link href={`/admin/products/brands`} className="font-medium text-emerald-600 hover:underline">
          {row.original.brandName}
        </Link>
      )
    },
    {
      accessorKey: "productCount",
      header: "Products",
      cell: ({ row }) => <span className="text-slate-600">{row.original.productCount}</span>
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
    toast.success("Series saved successfully!");
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-3">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm">
              <Plus className="w-4 h-4" /> Add Series
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Series</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Series Name *</label>
                <Input placeholder="e.g. Galaxy S Series" required />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Brand *</label>
                <select className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" required>
                  <option value="">Select Brand</option>
                  <option value="Apple">Apple</option>
                  <option value="Samsung">Samsung</option>
                  <option value="Xiaomi">Xiaomi</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end">
                <button type="submit" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm">
                  Save Series
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <FilterBar 
        searchPlaceholder="Search series name..."
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
