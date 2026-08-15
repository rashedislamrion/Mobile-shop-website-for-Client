"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { FilterBar } from "@/components/admin/FilterBar";
import { DataTable, ActionDropdown } from "@/components/admin/DataTable";
import { FilterConfig, TableAction } from "@/types/table";
import { mockBrands, MockBrand } from "@/lib/mock-data/products/brands";
import { ColumnDef } from "@tanstack/react-table";
import { Edit2, Trash2, Plus } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export default function BrandsPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    setTitle("Brands");
    setBadge("Website");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterConfigs: FilterConfig[] = [
    {
      type: "select",
      label: "Status",
      key: "status",
      options: [
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" },
      ],
    },
  ];

  const filteredData = mockBrands.filter((o) => {
    let match = true;
    if (searchQuery) {
      match = match && o.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    if (filters.status) {
      match = match && o.status === filters.status;
    }
    return match;
  });

  const createActions = (): TableAction[] => [
    { label: "Edit", icon: <Edit2 className="w-4 h-4" />, onClick: (row) => toast.info(`Edit ${row.name}`) },
    { label: "Delete", icon: <Trash2 className="w-4 h-4 text-red-500" />, variant: "destructive", onClick: () => toast.error("Brand deleted") },
  ];

  const columns: ColumnDef<MockBrand>[] = [
    {
      id: "brand",
      header: "Brand",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-slate-100 border border-slate-200 relative">
            <Image src={row.original.logo} alt={row.original.name} fill className="object-cover p-1" />
          </div>
          <p className="font-semibold text-slate-800">{row.original.name}</p>
        </div>
      ),
    },
    {
      accessorKey: "productCount",
      header: "Products",
      cell: ({ row }) => <span className="font-medium text-slate-600">{row.original.productCount}</span>
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Switch 
          checked={row.original.status === "Active"} 
          onCheckedChange={(checked) => toast.success(`${row.original.name} is now ${checked ? 'Active' : 'Inactive'}`)}
        />
      ),
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
    toast.success("Brand saved successfully!");
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-3">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm">
              <Plus className="w-4 h-4" /> Add Brand
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Brand</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Brand Name *</label>
                <Input placeholder="e.g. Apple" required />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Logo Image</label>
                <Input type="file" accept="image/*" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <label className="text-sm font-medium text-slate-700">Active Status</label>
                <Switch defaultChecked />
              </div>
              <div className="pt-4 flex justify-end">
                <button type="submit" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm">
                  Save Brand
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <FilterBar 
        searchPlaceholder="Search brand name..."
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
