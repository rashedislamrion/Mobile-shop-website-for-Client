"use client";

import { useEffect, useState, useMemo } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { FilterBar } from "@/components/admin/FilterBar";
import { DataTable, StatusBadge, ActionDropdown } from "@/components/admin/DataTable";
import { FilterConfig, StatusVariant, TableAction } from "@/types/table";
import { mockPayroll, PayrollRecord } from "@/lib/mock-data/hrm/payroll";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Download, CheckCircle, Calculator } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

export default function PayrollPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [localData, setLocalData] = useState<PayrollRecord[]>(mockPayroll);

  useEffect(() => {
    setTitle("Payroll & Salaries");
    setBadge("Website");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterConfigs: FilterConfig[] = [
    {
      type: "select",
      label: "Month",
      key: "month",
      options: [
        { label: "August 2026", value: "2026-08" },
        { label: "July 2026", value: "2026-07" },
        { label: "June 2026", value: "2026-06" },
      ],
    },
    {
      type: "select",
      label: "Department",
      key: "department",
      options: [
        { label: "Sales", value: "Sales" },
        { label: "Technical/Repair", value: "Technical/Repair" },
        { label: "Management", value: "Management" },
      ],
    },
    {
      type: "select",
      label: "Status",
      key: "status",
      options: [
        { label: "Paid", value: "Paid" },
        { label: "Pending", value: "Pending" },
        { label: "Processing", value: "Processing" },
      ],
    },
  ];

  const filteredData = useMemo(() => {
    let result = [...localData];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) => o.employeeName.toLowerCase().includes(q) || o.employeeId.toLowerCase().includes(q)
      );
    }

    if (filters.month) result = result.filter((o) => o.month === filters.month);
    if (filters.department) result = result.filter((o) => o.department === filters.department);
    if (filters.status) result = result.filter((o) => o.status === filters.status);

    return result;
  }, [searchQuery, filters, localData]);

  const createActions = (row: PayrollRecord): TableAction[] => {
    const isPending = row.status === "Pending";
    return [
      { label: "View Payslip", icon: <Eye className="w-4 h-4" />, onClick: () => toast.info("Opening payslip PDF...") },
      { label: "Download", icon: <Download className="w-4 h-4" />, onClick: () => toast.success("Payslip downloaded") },
      ...(isPending ? [
        { 
          label: "Mark as Paid", 
          icon: <CheckCircle className="w-4 h-4 text-emerald-600" />, 
          onClick: () => {
            const newData = [...localData];
            const idx = newData.findIndex(d => d.id === row.id);
            if (idx >= 0) {
              newData[idx].status = "Paid";
              setLocalData(newData);
              toast.success(`Salary marked as paid for ${row.employeeName}`);
            }
          }
        }
      ] : []),
    ];
  };

  const getStatusVariant = (status: string): StatusVariant => {
    switch (status) {
      case "Paid": return "success";
      case "Processing": return "info";
      case "Pending": return "warning";
      default: return "neutral";
    }
  };

  const columns: ColumnDef<PayrollRecord>[] = [
    {
      id: "employee",
      header: "Employee",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 relative shrink-0">
            {row.original.avatar ? (
              <Image src={row.original.avatar} alt={row.original.employeeName} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500 font-medium">
                {row.original.employeeName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">{row.original.employeeName}</p>
            <p className="text-xs text-slate-500 mt-0.5">{row.original.employeeId} • {row.original.department}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "month",
      header: "Salary Month",
      cell: ({ row }) => {
        const [year, month] = row.original.month.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return <span className="text-sm font-medium text-slate-700">{date.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>;
      }
    },
    {
      accessorKey: "basicSalary",
      header: "Basic Salary",
      cell: ({ row }) => <span className="text-sm text-slate-600">৳{row.original.basicSalary.toLocaleString()}</span>
    },
    {
      accessorKey: "allowances",
      header: "Allowances",
      cell: ({ row }) => {
        const total = row.original.allowances.reduce((sum, a) => sum + a.amount, 0);
        return <span className="text-sm text-emerald-600">+৳{total.toLocaleString()}</span>;
      }
    },
    {
      accessorKey: "deductions",
      header: "Deductions",
      cell: ({ row }) => {
        const total = row.original.deductions.reduce((sum, d) => sum + d.amount, 0);
        return <span className="text-sm text-red-500">-৳{total.toLocaleString()}</span>;
      }
    },
    {
      accessorKey: "netSalary",
      header: "Net Payable",
      cell: ({ row }) => <span className="font-bold text-slate-800">৳{row.original.netSalary.toLocaleString()}</span>
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
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Payroll Overview (August 2026)</h3>
          <p className="text-sm text-slate-500 mt-1">Manage and generate salaries for all employees.</p>
        </div>
        <Link 
          href="/admin/hrm/payroll/run"
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm shadow-sm"
        >
          <Calculator className="w-4 h-4" /> Run Payroll
        </Link>
      </div>

      <FilterBar 
        searchPlaceholder="Search employee name or ID..."
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
