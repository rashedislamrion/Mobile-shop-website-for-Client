"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { FilterBar } from "@/components/admin/FilterBar";
import { DataTable, StatusBadge, ActionDropdown } from "@/components/admin/DataTable";
import { FilterConfig, StatusVariant, TableAction } from "@/types/table";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, ExternalLink, Trash2, Plus, DownloadCloud, ImageIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiGet, apiDelete, getImageUrl } from "@/lib/api-client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export interface AdminProductRow {
  id: string;
  name: string;
  slug: string;
  regularPrice: number | string;
  salePrice?: number | string | null;
  costPrice?: number | string | null;
  status: "ACTIVE" | "DRAFT" | "OUT_OF_STOCK";
  totalStock: number;
  category?: { id: string; name: string; slug: string };
  brand?: { id: string; name: string };
  images?: Array<{ id: string; url: string; sortOrder: number }>;
  variants?: Array<{ id: string; sku: string; price: number; stock: number }>;
}

export default function AllProductsPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const router = useRouter();
  
  const [products, setProducts] = useState<AdminProductRow[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  const fetchFiltersData = useCallback(async () => {
    try {
      const [cats, brs] = await Promise.all([
        apiGet<any[]>("/categories"),
        apiGet<any[]>("/brands"),
      ]);
      setCategories(cats || []);
      setBrands(brs || []);
    } catch (e) {
      console.error("Error loading filter categories/brands", e);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.brandId) params.brandId = filters.brandId;
      if (filters.status) params.status = filters.status;

      const res = await apiGet<{ data: AdminProductRow[]; meta: any }>("/products/admin", params);
      setProducts(res.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filters]);

  useEffect(() => {
    setTitle("All Products");
    setBadge("Website");
    setDateFilter(""); 
    fetchFiltersData();
  }, [setTitle, setBadge, setDateFilter, fetchFiltersData]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filterConfigs: FilterConfig[] = useMemo(() => [
    {
      type: "select",
      label: "Category",
      key: "categoryId",
      options: categories.map((c) => ({ label: c.name, value: c.id })),
    },
    {
      type: "select",
      label: "Brand",
      key: "brandId",
      options: brands.map((b) => ({ label: b.name, value: b.id })),
    },
    {
      type: "select",
      label: "Status",
      key: "status",
      options: [
        { label: "Active", value: "ACTIVE" },
        { label: "Draft", value: "DRAFT" },
        { label: "Out of Stock", value: "OUT_OF_STOCK" },
      ],
    },
  ], [categories, brands]);

  const handleDeleteProduct = async (product: AdminProductRow) => {
    if (!confirm(`Are you sure you want to delete product "${product.name}"?`)) return;

    try {
      await apiDelete(`/products/${product.id}`);
      toast.success(`Product "${product.name}" deleted successfully!`);
      await fetchProducts();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete product");
    }
  };

  const createActions = (row: AdminProductRow): TableAction[] => [
    { 
      label: "Edit", 
      icon: <Edit className="w-4 h-4" />, 
      onClick: () => router.push(`/admin/products/${row.id}/edit`) 
    },
    { 
      label: "View on Storefront", 
      icon: <ExternalLink className="w-4 h-4" />, 
      onClick: () => window.open(`/product/${row.slug}`, "_blank") 
    },
    { 
      label: "Delete", 
      icon: <Trash2 className="w-4 h-4 text-red-500" />, 
      variant: "destructive", 
      onClick: () => handleDeleteProduct(row) 
    },
  ];

  const getStatusVariant = (status: string): StatusVariant => {
    switch (status) {
      case "ACTIVE": return "success";
      case "DRAFT": return "neutral";
      case "OUT_OF_STOCK": return "danger";
      default: return "neutral";
    }
  };

  const columns: ColumnDef<AdminProductRow>[] = [
    {
      id: "product",
      header: "Product",
      cell: ({ row }) => {
        const primaryImage = row.original.images?.[0]?.url;
        const firstSku = row.original.variants?.[0]?.sku || row.original.slug;

        return (
          <div className="flex items-center gap-3 max-w-[300px]">
            <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-slate-100 border border-slate-200 relative flex items-center justify-center">
              {primaryImage ? (
                <img 
                  src={getImageUrl(primaryImage)} 
                  alt={row.original.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <ImageIcon className="w-4 h-4 text-slate-400" />
              )}
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-slate-800 text-sm truncate">{row.original.name}</p>
              <p className="text-xs text-slate-500 truncate mt-0.5">SKU: {firstSku}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.category?.name || "—"}</span>
    },
    {
      accessorKey: "brand",
      header: "Brand",
      cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.brand?.name || "—"}</span>
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const regularPrice = Number(row.original.regularPrice) || 0;
        const salePrice = row.original.salePrice ? Number(row.original.salePrice) : null;

        return (
          <div>
            <span className="font-semibold text-slate-800">৳{regularPrice.toLocaleString()}</span>
            {salePrice && salePrice < regularPrice && (
              <span className="text-xs text-emerald-600 ml-2 font-medium">৳{salePrice.toLocaleString()}</span>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: "stock",
      header: "Total Stock",
      cell: ({ row }) => {
        const stock = row.original.totalStock ?? 0;
        let colorClass = "text-emerald-600 font-medium";
        if (stock === 0) colorClass = "text-red-500 font-medium";
        else if (stock <= 10) colorClass = "text-amber-500 font-medium";
        return <span className={colorClass}>{stock} units</span>;
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Products Catalog</h2>
          <p className="text-xs text-slate-500">Live products connected to database</p>
        </div>
        <div className="flex gap-3">
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

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={products} 
          pageSize={10}
        />
      )}
    </div>
  );
}
