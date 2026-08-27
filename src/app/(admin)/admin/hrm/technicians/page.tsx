"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { FilterBar } from "@/components/admin/FilterBar";
import { DataTable, StatusBadge, ActionDropdown } from "@/components/admin/DataTable";
import { FilterConfig, StatusVariant, TableAction } from "@/types/table";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiGet, apiPatch } from "@/lib/api-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface TechnicianRecord {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  specializations: string[];
  activeJobsCount: number;
  completedJobsCount: number;
  totalJobsCount: number;
  branch?: { id: string; name: string; code: string } | null;
}

export default function TechniciansPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const router = useRouter();
  
  const [data, setData] = useState<TechnicianRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [branches, setBranches] = useState<{ label: string; value: string }[]>([]);

  const [specDialogOpen, setSpecDialogOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState<TechnicianRecord | null>(null);
  const [specInput, setSpecInput] = useState("");

  useEffect(() => {
    setTitle("Technicians");
    setBadge("Website");
    setDateFilter(""); 
  }, [setTitle, setBadge, setDateFilter]);

  useEffect(() => {
    apiGet<any[]>("/branches/public")
      .then((res) => {
        if (Array.isArray(res)) {
          setBranches(res.map((b) => ({ label: b.name, value: b.id })));
        }
      })
      .catch(() => {});
  }, []);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiGet<TechnicianRecord[]>("/employees/technicians");
      let list = Array.isArray(res) ? res : [];

      if (filters.branch) {
        list = list.filter((t) => t.branch?.id === filters.branch);
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        list = list.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.employeeId.toLowerCase().includes(q) ||
            t.phone.toLowerCase().includes(q),
        );
      }

      setData(list);
    } catch (err: any) {
      toast.error(err.message || "Failed to load technicians");
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenSpecDialog = (tech: TechnicianRecord) => {
    setSelectedTech(tech);
    setSpecInput(tech.specializations?.join(", ") || "");
    setSpecDialogOpen(true);
  };

  const handleSaveSpecs = async () => {
    if (!selectedTech) return;
    try {
      const specsArray = specInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await apiPatch(`/employees/${selectedTech.id}/specializations`, {
        specializations: specsArray,
      });

      toast.success("Specializations updated successfully");
      setSpecDialogOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update specializations");
    }
  };

  const filterConfigs: FilterConfig[] = useMemo(() => [
    {
      type: "select",
      label: "Branch",
      key: "branch",
      options: branches,
    },
  ], [branches]);

  const createActions = (): TableAction[] => [
    {
      label: "Edit Profile",
      icon: <Edit className="w-4 h-4" />,
      onClick: (row) => router.push(`/admin/hrm/employees/${row.id}/edit`),
    },
    {
      label: "Manage Specializations",
      icon: <Wrench className="w-4 h-4 text-emerald-600" />,
      onClick: (row) => handleOpenSpecDialog(row),
    },
  ];

  const getStatusVariant = (status: string): StatusVariant => {
    switch (status) {
      case "ACTIVE":
      case "Active": return "success";
      case "ON_LEAVE":
      case "On Leave": return "warning";
      case "INACTIVE":
      case "Inactive": return "default";
      default: return "info";
    }
  };

  const columns: ColumnDef<TechnicianRecord>[] = [
    {
      accessorKey: "employeeId",
      header: "TECH ID",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-slate-800">
          {row.original.employeeId}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: "Technician",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs border border-emerald-100">
            {row.original.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-800 leading-tight">{row.original.name}</p>
            <p className="text-xs text-slate-400">{row.original.phone}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "branch",
      header: "Branch",
      cell: ({ row }) => (
        <span className="text-slate-600 text-sm">
          {row.original.branch?.name || "Global"}
        </span>
      ),
    },
    {
      accessorKey: "specializations",
      header: "Specializations",
      cell: ({ row }) => {
        const specs = row.original.specializations || [];
        if (specs.length === 0) return <span className="text-slate-400 italic text-xs">None specified</span>;

        return (
          <div className="flex flex-wrap gap-1">
            {specs.map((spec, i) => (
              <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-emerald-50 text-emerald-700 font-medium">
                {spec}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "activeJobsCount",
      header: "Active Jobs",
      cell: ({ row }) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          row.original.activeJobsCount > 0 ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"
        }`}>
          {row.original.activeJobsCount} Active
        </span>
      ),
    },
    {
      accessorKey: "completedJobsCount",
      header: "Completed Jobs",
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-slate-700">
          {row.original.completedJobsCount}
        </span>
      ),
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
          <ActionDropdown actions={createActions()} rowData={row.original} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <FilterBar 
        searchPlaceholder="Search technicians by name, ID, phone..."
        filters={filterConfigs}
        onSearchChange={(val) => setSearchQuery(val)}
        onFilterChange={(key, val) => setFilters((prev) => ({ ...prev, [key]: val }))}
        onReset={() => {
          setSearchQuery("");
          setFilters({});
        }}
      />

      <DataTable 
        columns={columns} 
        data={data} 
        pageSize={10}
      />

      {/* Specializations Dialog */}
      <Dialog open={specDialogOpen} onOpenChange={setSpecDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manage Specializations</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-slate-600">
              Update repair specializations for <strong className="text-slate-900">{selectedTech?.name}</strong>. Enter comma-separated skills (e.g. Display, Battery, Software, Motherboard).
            </p>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Specializations</label>
              <Input
                placeholder="Display, Battery, Software..."
                value={specInput}
                onChange={(e) => setSpecInput(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSpecDialogOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSpecs}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium"
              >
                Save Specializations
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
