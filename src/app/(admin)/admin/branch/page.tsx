"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { FilterBar } from "@/components/admin/FilterBar";
import { DataTable, StatusBadge, ActionDropdown } from "@/components/admin/DataTable";
import { FilterConfig, TableAction } from "@/types/table";
import { mockBranches, Branch } from "@/lib/mock-data/branches";
import { ColumnDef } from "@tanstack/react-table";
import { Store, Edit2, Users, CheckCircle, XCircle, Trash2, Plus } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BranchListPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  useEffect(() => {
    setTitle("Branches");
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

  const filteredData = mockBranches.filter((o) => {
    let match = true;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      match = match && (o.name.toLowerCase().includes(q) || o.code.toLowerCase().includes(q));
    }
    if (filters.status) {
      match = match && o.status === filters.status;
    }
    return match;
  });

  const createActions = (row: Branch): TableAction[] => {
    const isActive = row.status === "Active";
    return [
      { 
        label: "Edit", 
        icon: <Edit2 className="w-4 h-4" />, 
        onClick: () => router.push(`/admin/branch/${row.id}/edit`)
      },
      { 
        label: "View Staff", 
        icon: <Users className="w-4 h-4" />, 
        onClick: () => toast.info(`Viewing staff for ${row.name}`)
      },
      { 
        label: isActive ? "Deactivate" : "Activate", 
        icon: isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />, 
        onClick: () => toast.success(`Branch ${isActive ? 'deactivated' : 'activated'}`)
      },
      { 
        label: "Delete", 
        icon: <Trash2 className="w-4 h-4 text-red-500" />, 
        variant: "destructive", 
        disabled: row.staffCount > 0,
        disabledTooltip: "Cannot delete branch with active staff",
        onClick: () => toast.error("Branch deleted") 
      },
    ];
  };

  const columns: ColumnDef<Branch>[] = [
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
        <div className="max-w-[200px]" title={row.original.address}>
          <p className="text-slate-700 truncate">{row.original.address.split('\n')[0]}</p>
          <p className="text-xs text-slate-500">{row.original.city}</p>
        </div>
      )
    },
    {
      accessorKey: "managerName",
      header: "Branch Manager",
      cell: ({ row }) => {
        if (!row.original.managerName) {
          return <span className="text-slate-400 italic text-sm">Unassigned</span>;
        }
        return (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-100 shrink-0 relative">
              {row.original.managerAvatar ? (
                <Image src={row.original.managerAvatar} alt="Manager" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500 text-xs font-medium">
                  {row.original.managerName.charAt(0)}
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-slate-700">{row.original.managerName}</span>
          </div>
        );
      }
    },
    {
      accessorKey: "contactNumber",
      header: "Contact",
      cell: ({ row }) => <span className="text-slate-600 font-medium">{row.original.contactNumber}</span>
    },
    {
      accessorKey: "staffCount",
      header: "Staff",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md w-fit text-slate-600">
          <Users className="w-3.5 h-3.5" />
          <span className="font-semibold text-sm">{row.original.staffCount}</span>
        </div>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge 
          status={row.original.status} 
          type={row.original.status === "Active" ? "success" : "neutral"} 
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
          href="/admin/branch/create" 
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Add Branch
        </Link>
      </div>

      <FilterBar 
        searchPlaceholder="Search branch name, code..."
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
