"use client";

import { useEffect, useState, useMemo } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { FilterBar } from "@/components/admin/FilterBar";
import { DataTable, StatusBadge, ActionDropdown } from "@/components/admin/DataTable";
import { FilterConfig, StatusVariant, TableAction } from "@/types/table";
import { mockProducts, MockProduct } from "@/lib/mock-data/products/all-products";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Copy, ExternalLink, Trash2, Plus, DownloadCloud } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AllProductsPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  useEffect(() => {
    setTitle("All Products");
    setBadge("Website");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterConfigs: FilterConfig[] = [
    {
      type: "select",
      label: "Category",
      key: "category",
      options: [
        { label: "Display", value: "Display" },
        { label: "Battery", value: "Battery" },
        { label: "Charging Logic", value: "Charging Logic" },
        { label: "Speaker", value: "Speaker" },
        { label: "Camera", value: "Camera" },
        { label: "Housing", value: "Housing" },
        { label: "Back Glass", value: "Back Glass" },
      ],
    },
    {
      type: "select",
      label: "Brand",
      key: "brand",
      options: [
        { label: "Apple", value: "Apple" },
        { label: "Samsung", value: "Samsung" },
        { label: "Xiaomi", value: "Xiaomi" },
        { label: "Realme", value: "Realme" },
        { label: "OnePlus", value: "OnePlus" },
        { label: "Oppo", value: "Oppo" },
        { label: "Vivo", value: "Vivo" },
      ],
    },
    {
      type: "select",
      label: "Stock Status",
      key: "stockStatus",
      options: [
        { label: "In Stock", value: "In Stock" },
        { label: "Low Stock", value: "Low Stock" },
        { label: "Out of Stock", value: "Out of Stock" },
      ],
    },
  ];

  const filteredData = useMemo(() => {
    let result = [...mockProducts];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          o.sku.toLowerCase().includes(q)
      );
    }

    if (filters.category) {
      result = result.filter((o) => o.category === filters.category);
    }
    if (filters.brand) {
      result = result.filter((o) => o.brand === filters.brand);
    }
    if (filters.stockStatus) {
      if (filters.stockStatus === "In Stock") {
        result = result.filter((o) => o.stock > 10);
      } else if (filters.stockStatus === "Low Stock") {
        result = result.filter((o) => o.stock > 0 && o.stock <= 10);
      } else if (filters.stockStatus === "Out of Stock") {
        result = result.filter((o) => o.stock === 0);
      }
    }

    return result;
  }, [searchQuery, filters]);

  const createActions = (row: MockProduct): TableAction[] => [
    { label: "Edit", icon: <Edit className="w-4 h-4" />, onClick: () => router.push(`/admin/products/${row.id}/edit`) },
    { label: "Duplicate", icon: <Copy className="w-4 h-4" />, onClick: () => console.log("Duplicate", row) },
    { label: "View on Website", icon: <ExternalLink className="w-4 h-4" />, onClick: () => console.log("View", row) },
    { label: "Delete", icon: <Trash2 className="w-4 h-4 text-red-500" />, variant: "destructive", onClick: () => console.log("Delete", row) },
  ];

  const getStatusVariant = (status: string): StatusVariant => {
    switch (status) {
      case "Active": return "success";
      case "Draft": return "neutral";
      case "Out of Stock": return "danger";
      default: return "neutral";
    }
  };

  const columns: ColumnDef<MockProduct>[] = [
    {
      id: "product",
      header: "Product",
      cell: ({ row }) => (
        <div className="flex items-center gap-3 max-w-[300px]">
          <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-slate-100 border border-slate-200 relative">
            <Image src={row.original.image} alt={row.original.name} fill className="object-cover" />
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-slate-800 text-sm truncate">{row.original.name}</p>
            <p className="text-xs text-slate-500 truncate mt-0.5">SKU: {row.original.sku}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.category}</span>
    },
    {
      accessorKey: "brand",
      header: "Brand",
      cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.brand}</span>
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => (
        <div>
          <span className="font-semibold text-slate-800">৳{row.original.price.toLocaleString()}</span>
          {row.original.oldPrice && (
            <span className="text-xs text-slate-400 line-through ml-2">৳{row.original.oldPrice.toLocaleString()}</span>
          )}
        </div>
      )
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const stock = row.original.stock;
        let colorClass = "text-emerald-600 font-medium";
        if (stock === 0) colorClass = "text-red-500 font-medium";
        else if (stock <= 10) colorClass = "text-amber-500 font-medium";
        return <span className={colorClass}>{stock}</span>;
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge 
          status={row.original.status} 
          type={getStatusVariant(row.original.status)} 
        />
      ),
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

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-3">
        <Link 
          href="/admin/products/bulk"
          className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-medium rounded-lg transition-colors text-sm"
        >
          <DownloadCloud className="w-4 h-4" /> Bulk Import/Export
        </Link>
        <Link 
          href="/admin/products/create"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <FilterBar 
        searchPlaceholder="Search product name, SKU..."
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
