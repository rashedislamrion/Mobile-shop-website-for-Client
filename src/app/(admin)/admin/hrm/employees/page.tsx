"use client";

import { useEffect, useState, useMemo } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { FilterBar } from "@/components/admin/FilterBar";
import { DataTable, StatusBadge, ActionDropdown } from "@/components/admin/DataTable";
import { FilterConfig, StatusVariant, TableAction } from "@/types/table";
import { mockEmployees, Employee, EmployeeRole } from "@/lib/mock-data/hrm/employees";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2, Plus, Key, Eye, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function EmployeesPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  useEffect(() => {
    setTitle("Employees");
    setBadge("Website");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterConfigs: FilterConfig[] = [
    {
      type: "select",
      label: "Department",
      key: "department",
      options: [
        { label: "Sales", value: "Sales" },
        { label: "Technical/Repair", value: "Technical/Repair" },
        { label: "Customer Support", value: "Customer Support" },
        { label: "Purchase", value: "Purchase" },
        { label: "Marketing", value: "Marketing" },
        { label: "IT", value: "IT" },
        { label: "Management", value: "Management" },
      ],
    },
    {
      type: "select",
      label: "Role",
      key: "role",
      options: [
        { label: "Admin", value: "Admin" },
        { label: "Branch Admin", value: "Branch Admin" },
        { label: "Branch Manager", value: "Branch Manager" },
        { label: "Salesperson", value: "Salesperson" },
        { label: "Purchase Manager", value: "Purchase Manager" },
        { label: "Product Uploader", value: "Product Uploader" },
        { label: "Customer Service", value: "Customer Service" },
        { label: "Technician", value: "Technician" },
        { label: "SEO", value: "SEO" },
      ],
    },
    {
      type: "select",
      label: "Branch",
      key: "branch",
      options: [
        { label: "Global", value: "Global" },
        { label: "Dhaka Main Branch", value: "Dhaka Main Branch" },
        { label: "Chattogram Branch", value: "Chattogram Branch" },
        { label: "Central Warehouse", value: "Central Warehouse" },
      ],
    },
    {
      type: "select",
      label: "Status",
      key: "status",
      options: [
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" },
        { label: "On Leave", value: "On Leave" },
      ],
    },
  ];

  const filteredData = useMemo(() => {
    let result = [...mockEmployees];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q) ||
          o.phone.includes(q) ||
          o.employeeId.toLowerCase().includes(q)
      );
    }

    if (filters.department) result = result.filter((o) => o.department === filters.department);
    if (filters.role) result = result.filter((o) => o.role === filters.role);
    if (filters.branch) result = result.filter((o) => o.branch === filters.branch);
    if (filters.status) result = result.filter((o) => o.status === filters.status);

    return result;
  }, [searchQuery, filters]);

  const getRoleBadgeColor = (role: EmployeeRole) => {
    switch (role) {
      case "Admin": return "bg-purple-100 text-purple-700 border-purple-200";
      case "Branch Admin": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "Branch Manager": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Salesperson": return "bg-green-100 text-green-700 border-green-200";
      case "Purchase Manager": return "bg-teal-100 text-teal-700 border-teal-200";
      case "Product Uploader": return "bg-cyan-100 text-cyan-700 border-cyan-200";
      case "Customer Service": return "bg-amber-100 text-amber-700 border-amber-200";
      case "Technician": return "bg-orange-100 text-orange-700 border-orange-200";
      case "SEO": return "bg-pink-100 text-pink-700 border-pink-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const createActions = (row: Employee): TableAction[] => {
    const isActive = row.status === "Active";
    return [
      { label: "View Profile", icon: <Eye className="w-4 h-4" />, onClick: () => toast.info("Viewing profile") },
      { label: "Edit", icon: <Edit className="w-4 h-4" />, onClick: () => router.push(`/admin/hrm/employees/${row.id}/edit`) },
      { label: "Reset Password", icon: <Key className="w-4 h-4" />, onClick: () => toast.success("Password reset link sent to employee email") },
      { 
        label: isActive ? "Deactivate" : "Activate", 
        icon: isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />, 
        onClick: () => toast.success(`Employee ${isActive ? 'deactivated' : 'activated'}`)
      },
      { label: "Delete", icon: <Trash2 className="w-4 h-4 text-red-500" />, variant: "destructive", onClick: () => toast.error("Employee deleted") },
    ];
  };

  const getStatusVariant = (status: string): StatusVariant => {
    switch (status) {
      case "Active": return "success";
      case "Inactive": return "danger";
      case "On Leave": return "warning";
      default: return "neutral";
    }
  };

  const columns: ColumnDef<Employee>[] = [
    {
      id: "employee",
      header: "Employee",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 relative shrink-0">
            {row.original.avatar ? (
              <Image src={row.original.avatar} alt={row.original.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500 font-medium">
                {row.original.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">{row.original.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{row.original.employeeId}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(row.original.role)}`}>
          {row.original.role}
        </span>
      )
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => <span className="text-sm font-medium text-slate-700">{row.original.department}</span>
    },
    {
      accessorKey: "branch",
      header: "Branch",
      cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.branch}</span>
    },
    {
      id: "contact",
      header: "Contact",
      cell: ({ row }) => (
        <div>
          <p className="text-sm text-slate-800">{row.original.phone}</p>
          <p className="text-xs text-slate-500">{row.original.email}</p>
        </div>
      )
    },
    {
      accessorKey: "joiningDate",
      header: "Joining Date",
      cell: ({ row }) => (
        <span className="text-sm text-slate-600">
          {new Date(row.original.joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      )
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
      <div className="flex justify-end gap-3 mb-2">
        <Link 
          href="/admin/hrm/employees/create"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Add Employee
        </Link>
      </div>

      <FilterBar 
        searchPlaceholder="Search name, phone, email..."
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
