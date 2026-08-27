"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { FilterBar } from "@/components/admin/FilterBar";
import { DataTable, StatusBadge, ActionDropdown } from "@/components/admin/DataTable";
import { FilterConfig, StatusVariant, TableAction } from "@/types/table";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2, Plus, Key, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiGet, apiPatch, apiDelete } from "@/lib/api-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EmployeeRecord {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  photo?: string | null;
  gender?: string | null;
  status: string;
  employmentType: string;
  joiningDate: string;
  basicSalary?: number | string;
  department?: { id: string; name: string } | null;
  role?: { id: string; name: string; scope: string } | null;
  branch?: { id: string; name: string; code: string } | null;
}

export default function EmployeesPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const router = useRouter();
  
  const [data, setData] = useState<EmployeeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  const [departments, setDepartments] = useState<{ label: string; value: string }[]>([]);
  const [roles, setRoles] = useState<{ label: string; value: string }[]>([]);
  const [branches, setBranches] = useState<{ label: string; value: string }[]>([]);

  const [resetModalInfo, setResetModalInfo] = useState<{ name: string; tempPass: string } | null>(null);

  useEffect(() => {
    setTitle("Employees");
    setBadge("Website");
    setDateFilter(""); 
  }, [setTitle, setBadge, setDateFilter]);

  useEffect(() => {
    Promise.all([
      apiGet<any[]>("/departments"),
      apiGet<any[]>("/roles"),
      apiGet<any[]>("/branches/public"),
    ])
      .then(([deptRes, roleRes, branchRes]) => {
        if (Array.isArray(deptRes)) {
          setDepartments(deptRes.map((d) => ({ label: d.name, value: d.id })));
        }
        if (Array.isArray(roleRes)) {
          setRoles(roleRes.map((r) => ({ label: r.name, value: r.id })));
        }
        if (Array.isArray(branchRes)) {
          setBranches(branchRes.map((b) => ({ label: b.name, value: b.id })));
        }
      })
      .catch(() => {});
  }, []);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: Record<string, any> = {};
      if (filters.department) params.department = filters.department;
      if (filters.role) params.role = filters.role;
      if (filters.branch) params.branch = filters.branch;
      if (filters.status) params.status = (filters.status as string).toUpperCase();
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await apiGet<{ data: EmployeeRecord[] }>("/employees", params);
      setData(res?.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load employees");
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleResetPassword = async (row: EmployeeRecord) => {
    try {
      const res = await apiPatch<{ message: string; tempPassword: string }>(
        `/employees/${row.id}/reset-password`,
      );
      setResetModalInfo({ name: row.name, tempPass: res.tempPassword });
      toast.success("Password reset successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDelete(`/employees/${id}`);
      toast.success("Employee removed successfully");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove employee");
    }
  };

  const filterConfigs: FilterConfig[] = useMemo(() => [
    {
      type: "select",
      label: "Department",
      key: "department",
      options: departments,
    },
    {
      type: "select",
      label: "Role",
      key: "role",
      options: roles,
    },
    {
      type: "select",
      label: "Branch",
      key: "branch",
      options: branches,
    },
    {
      type: "select",
      label: "Status",
      key: "status",
      options: [
        { label: "Active", value: "ACTIVE" },
        { label: "Inactive", value: "INACTIVE" },
        { label: "On Leave", value: "ON_LEAVE" },
      ],
    },
  ], [departments, roles, branches]);

  const createActions = (): TableAction[] => [
    {
      label: "Edit Profile",
      icon: <Edit className="w-4 h-4" />,
      onClick: (row) => router.push(`/admin/hrm/employees/${row.id}/edit`),
    },
    {
      label: "Reset Password",
      icon: <Key className="w-4 h-4 text-amber-600" />,
      onClick: (row) => handleResetPassword(row),
    },
    {
      label: "Delete",
      icon: <Trash2 className="w-4 h-4 text-red-500" />,
      variant: "destructive",
      onClick: (row) => handleDelete(row.id),
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

  const columns: ColumnDef<EmployeeRecord>[] = [
    {
      accessorKey: "employeeId",
      header: "EMP ID",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-slate-800">
          {row.original.employeeId}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: "Employee",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600 border border-slate-200">
            {row.original.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-800 leading-tight">{row.original.name}</p>
            <p className="text-xs text-slate-400">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => <span className="text-slate-600 font-mono text-sm">{row.original.phone}</span>,
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => (
        <span className="text-slate-700 text-sm">
          {row.original.department?.name || <span className="text-slate-400 italic">None</span>}
        </span>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
          {row.original.role?.name || "No Role"}
        </span>
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
      {/* Top Header / Action Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-800">All Employees</h2>
          <p className="text-xs text-slate-500">Manage your staff roster, roles, and branch assignments</p>
        </div>
        <Link 
          href="/admin/hrm/employees/create"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Employee
        </Link>
      </div>

      <FilterBar 
        searchPlaceholder="Search by name, ID, email, phone..."
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

      {/* Password Reset Modal */}
      <Dialog open={Boolean(resetModalInfo)} onOpenChange={(open) => !open && setResetModalInfo(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Temporary Password Generated</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-slate-600">
              A new temporary password has been set for <strong className="text-slate-900">{resetModalInfo?.name}</strong>.
            </p>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
              <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1">Temporary Password</p>
              <code className="text-lg font-mono font-bold text-amber-900 select-all">{resetModalInfo?.tempPass}</code>
            </div>
            <p className="text-xs text-slate-400 italic">
              Please convey this temporary password to the employee. They will be required to change it on their next login.
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setResetModalInfo(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
