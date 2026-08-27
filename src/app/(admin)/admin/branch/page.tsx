"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { FilterBar } from "@/components/admin/FilterBar";
import { DataTable, StatusBadge, ActionDropdown } from "@/components/admin/DataTable";
import { FilterConfig, TableAction } from "@/types/table";
import { ColumnDef } from "@tanstack/react-table";
import { Store, Edit2, Users, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiGet, apiDelete } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";

export interface BranchRow {
  id: string;
  name: string;
  code: string;
  type: "OUTLET" | "WAREHOUSE" | "HEAD_OFFICE";
  address: string;
  city: string;
  phone: string;
  altPhone?: string | null;
  email?: string | null;
  status: "ACTIVE" | "INACTIVE";
  manager?: { id: string; name: string; email?: string; phone?: string } | null;
  _count?: { staff: number; orders: number };
}

export default function BranchListPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const router = useRouter();
  
  const [branches, setBranches] = useState<BranchRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  const fetchBranches = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiGet<BranchRow[]>("/branches");
      setBranches(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load branches");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setTitle("Branches");
    setBadge("Website");
    setDateFilter(""); 
    fetchBranches();
  }, [setTitle, setBadge, setDateFilter, fetchBranches]);

  const filterConfigs: FilterConfig[] = useMemo(() => [
    {
      type: "select",
      label: "Status",
      key: "status",
      options: [
        { label: "Active", value: "ACTIVE" },
        { label: "Inactive", value: "INACTIVE" },
      ],
    },
    {
      type: "select",
      label: "Type",
      key: "type",
      options: [
        { label: "Outlet", value: "OUTLET" },
        { label: "Warehouse", value: "WAREHOUSE" },
        { label: "Head Office", value: "HEAD_OFFICE" },
      ],
    },
  ], []);

  const filteredData = useMemo(() => {
    return branches.filter((o) => {
      let match = true;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        match = match && (o.name.toLowerCase().includes(q) || o.code.toLowerCase().includes(q) || o.city.toLowerCase().includes(q));
      }
      if (filters.status) {
        match = match && o.status === filters.status;
      }
      if (filters.type) {
        match = match && o.type === filters.type;
      }
      return match;
    });
  }, [branches, searchQuery, filters]);

  const handleDelete = async (row: BranchRow) => {
    if (!confirm(`Are you sure you want to delete branch "${row.name}"?`)) return;

    try {
      await apiDelete(`/branches/${row.id}`);
      toast.success(`Branch "${row.name}" deleted successfully!`);
      await fetchBranches();
    } catch (err: any) {
      toast.error(err.message || "Cannot delete branch with assigned staff or orders");
    }
  };

  const createActions = (row: BranchRow): TableAction[] => [
    { 
      label: "Edit", 
      icon: <Edit2 className="w-4 h-4" />, 
      onClick: () => router.push(`/admin/branch/${row.id}/edit`)
    },
    { 
      label: "Delete", 
      icon: <Trash2 className="w-4 h-4 text-red-500" />, 
      variant: "destructive", 
      onClick: () => handleDelete(row) 
    },
  ];

  const columns: ColumnDef<BranchRow>[] = [
    {
      accessorKey: "name",
      header: "Branch Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">{row.original.name}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">{row.original.code} • {row.original.type}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => (
        <div className="max-w-[220px]" title={row.original.address}>
          <p className="text-slate-700 truncate">{row.original.address}</p>
          <p className="text-xs text-slate-500 font-medium">{row.original.city}</p>
        </div>
      )
    },
    {
      accessorKey: "manager",
      header: "Branch Manager",
      cell: ({ row }) => {
        const manager = row.original.manager;
        if (!manager) {
          return <span className="text-slate-400 italic text-sm">Unassigned</span>;
        }
        return (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-semibold">
              {manager.name.charAt(0)}
            </div>
            <span className="text-sm font-medium text-slate-700">{manager.name}</span>
          </div>
        );
      }
    },
    {
      accessorKey: "phone",
      header: "Contact",
      cell: ({ row }) => <span className="text-slate-600 font-medium text-sm">{row.original.phone}</span>
    },
    {
      accessorKey: "staffCount",
      header: "Staff",
      cell: ({ row }) => {
        const staffCount = row.original._count?.staff ?? 0;
        return (
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md w-fit text-slate-700">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-sm">{staffCount}</span>
          </div>
        );
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge 
          status={row.original.status} 
          type={row.original.status === "ACTIVE" ? "success" : "neutral"} 
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
          <h2 className="text-xl font-bold text-slate-800">Branches & Outlets</h2>
          <p className="text-xs text-slate-500">Manage all store locations and warehouses</p>
        </div>
        <Link 
          href="/admin/branch/create" 
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Add Branch
        </Link>
      </div>

      <FilterBar 
        searchPlaceholder="Search branch name, code, city..."
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
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={filteredData} 
          pageSize={10}
        />
      )}
    </div>
  );
}
