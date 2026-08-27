"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { FilterBar } from "@/components/admin/FilterBar";
import { DataTable, StatusBadge, ActionDropdown } from "@/components/admin/DataTable";
import { FilterConfig, StatusVariant, TableAction } from "@/types/table";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, CheckCircle, Calculator, FileText, Wallet } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { apiGet, apiPatch } from "@/lib/api-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PayrollRecord {
  id: string;
  month: string;
  basicSalary: number | string;
  allowances: Record<string, number> | null;
  deductions: Record<string, number> | null;
  netSalary: number | string;
  status: string;
  paymentDate: string | null;
  paymentMethod: string | null;
  staff?: {
    id: string;
    employeeId: string;
    name: string;
    email: string;
    phone: string;
    department?: { id: string; name: string };
    role?: { id: string; name: string };
    branch?: { id: string; name: string };
  };
}

interface WalletOption {
  id: string;
  name: string;
  currentBalance: number | string;
}

export default function PayrollPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  
  const [data, setData] = useState<PayrollRecord[]>([]);
  const [summary, setSummary] = useState({ totalThisMonth: 0, paidThisMonth: 0, pendingThisMonth: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({
    month: new Date().toISOString().slice(0, 7),
  });

  const [departments, setDepartments] = useState<{ label: string; value: string }[]>([]);
  const [wallets, setWallets] = useState<WalletOption[]>([]);
  
  // Mark as Paid dialog
  const [payModalRecord, setPayModalRecord] = useState<PayrollRecord | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");

  // Payslip modal
  const [payslipData, setPayslipData] = useState<any | null>(null);
  const [isPayslipOpen, setIsPayslipOpen] = useState(false);

  useEffect(() => {
    setTitle("Payroll & Salaries");
    setBadge("Website");
    setDateFilter(""); 
  }, [setTitle, setBadge, setDateFilter]);

  useEffect(() => {
    Promise.all([
      apiGet<any[]>("/departments"),
      apiGet<any[]>("/wallet-types"),
    ])
      .then(([deptRes, walletRes]) => {
        if (Array.isArray(deptRes)) {
          setDepartments(deptRes.map((d) => ({ label: d.name, value: d.id })));
        }
        if (Array.isArray(walletRes)) {
          setWallets(walletRes);
          if (walletRes.length > 0) setSelectedWalletId(walletRes[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: Record<string, any> = {};

      if (filters.month) params.month = filters.month;
      if (filters.department) params.department = filters.department;
      if (filters.status) params.status = (filters.status as string).toUpperCase();
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await apiGet<{
        data: PayrollRecord[];
        summary: { totalThisMonth: number; paidThisMonth: number; pendingThisMonth: number };
      }>("/payroll", params);

      setData(res?.data || []);
      if (res?.summary) setSummary(res.summary);
    } catch (err: any) {
      toast.error(err.message || "Failed to load payroll records");
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenPayModal = (row: PayrollRecord) => {
    setPayModalRecord(row);
  };

  const handleConfirmMarkPaid = async () => {
    if (!payModalRecord) return;
    try {
      await apiPatch(`/payroll/${payModalRecord.id}/mark-paid`, {
        walletTypeId: selectedWalletId || undefined,
      });

      toast.success(`Salary marked as PAID for ${payModalRecord.staff?.name}`);
      setPayModalRecord(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to process payroll payment");
    }
  };

  const handleViewPayslip = async (row: PayrollRecord) => {
    try {
      const res = await apiGet(`/payroll/${row.id}/payslip`);
      setPayslipData(res);
      setIsPayslipOpen(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to load payslip");
    }
  };

  const filterConfigs: FilterConfig[] = useMemo(() => [
    {
      type: "select",
      label: "Month",
      key: "month",
      options: [
        { label: "August 2026", value: "2026-08" },
        { label: "July 2026", value: "2026-07" },
        { label: "June 2026", value: "2026-06" },
        { label: "May 2026", value: "2026-05" },
      ],
    },
    {
      type: "select",
      label: "Department",
      key: "department",
      options: departments,
    },
    {
      type: "select",
      label: "Status",
      key: "status",
      options: [
        { label: "Paid", value: "PAID" },
        { label: "Pending", value: "PENDING" },
      ],
    },
  ], [departments]);

  const createActions = (): TableAction[] => [
    {
      label: "View Payslip",
      icon: <Eye className="w-4 h-4" />,
      onClick: (row) => handleViewPayslip(row),
    },
    {
      label: "Mark as Paid",
      icon: <CheckCircle className="w-4 h-4 text-emerald-600" />,
      onClick: (row) => handleOpenPayModal(row),
    },
  ];

  const getStatusVariant = (status: string): StatusVariant => {
    switch (status) {
      case "PAID":
      case "Paid": return "success";
      case "PENDING":
      case "Pending": return "warning";
      default: return "info";
    }
  };

  const columns: ColumnDef<PayrollRecord>[] = [
    {
      accessorKey: "employee",
      header: "Employee",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600 border border-slate-200">
            {row.original.staff?.name.charAt(0) || "E"}
          </div>
          <div>
            <p className="font-semibold text-slate-800 leading-tight">{row.original.staff?.name}</p>
            <p className="text-xs text-slate-400 font-mono">{row.original.staff?.employeeId}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "month",
      header: "Month",
      cell: ({ row }) => {
        const d = new Date(row.original.month);
        return (
          <span className="font-medium text-slate-700">
            {d.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          </span>
        );
      },
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => (
        <span className="text-slate-600 text-sm">
          {row.original.staff?.department?.name || "General"}
        </span>
      ),
    },
    {
      accessorKey: "basicSalary",
      header: "Basic",
      cell: ({ row }) => (
        <span className="text-slate-600 font-medium text-sm">
          ৳{Number(row.original.basicSalary).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "netSalary",
      header: "Net Payable",
      cell: ({ row }) => (
        <span className="font-bold text-slate-900 text-base">
          ৳{Number(row.original.netSalary).toLocaleString()}
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
      accessorKey: "paymentDate",
      header: "Payment Date",
      cell: ({ row }) => {
        if (!row.original.paymentDate) return <span className="text-slate-400 italic text-xs">Unpaid</span>;
        return (
          <span className="text-slate-600 text-xs">
            {new Date(row.original.paymentDate).toLocaleDateString("en-GB")}
          </span>
        );
      },
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
      {/* Top Header / Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Payroll</span>
          <p className="text-2xl font-bold text-slate-800 mt-2">৳{summary.totalThisMonth.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Paid Amount</span>
          <p className="text-2xl font-bold text-emerald-700 mt-2">৳{summary.paidThisMonth.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending Amount</span>
          <p className="text-2xl font-bold text-amber-700 mt-2">৳{summary.pendingThisMonth.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-5 rounded-xl text-white shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-emerald-100 uppercase tracking-wider">Payroll Processing</span>
            <p className="text-sm text-emerald-50 mt-1">Generate new salary sheets for active staff</p>
          </div>
          <Link
            href="/admin/hrm/payroll/run"
            className="mt-3 inline-flex items-center justify-center gap-2 bg-white text-emerald-800 hover:bg-emerald-50 font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <Calculator className="w-4 h-4" /> Run Payroll
          </Link>
        </div>
      </div>

      <FilterBar 
        searchPlaceholder="Search by employee name or ID..."
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

      {/* Mark As Paid Dialog */}
      <Dialog open={Boolean(payModalRecord)} onOpenChange={(open) => !open && setPayModalRecord(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mark Salary as Paid</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-slate-600">
              Confirm salary disbursement of <strong className="text-slate-900">৳{Number(payModalRecord?.netSalary).toLocaleString()}</strong> to <strong className="text-slate-900">{payModalRecord?.staff?.name}</strong>.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-emerald-600" /> Disburse From Wallet
              </label>
              <select
                value={selectedWalletId}
                onChange={(e) => setSelectedWalletId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
              >
                <option value="">Do not deduct wallet (Manual reconciliation)</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} (Balance: ৳{Number(w.currentBalance).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPayModalRecord(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMarkPaid}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payslip View Modal */}
      <Dialog open={isPayslipOpen} onOpenChange={setIsPayslipOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" /> Employee Payslip
            </DialogTitle>
          </DialogHeader>
          {payslipData && (
            <div className="space-y-4 pt-2 text-sm">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <p className="font-bold text-slate-900 text-base">{payslipData.employee.name}</p>
                <p className="text-xs text-slate-500 font-mono">{payslipData.employee.employeeId} • {payslipData.employee.department} • {payslipData.employee.role}</p>
                <p className="text-xs text-slate-400">Month: {payslipData.month} • Status: <span className="font-semibold text-emerald-600">{payslipData.status}</span></p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Earnings</p>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Basic Salary</span>
                  <span className="font-medium text-slate-800">৳{payslipData.earnings.basicSalary.toLocaleString()}</span>
                </div>
                {Object.entries(payslipData.earnings.allowances || {}).map(([name, val]: [string, any]) => (
                  <div key={name} className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">{name} Allowance</span>
                    <span className="font-medium text-emerald-600">+৳{Number(val).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center">
                <span className="font-bold text-emerald-900">Net Payable Amount</span>
                <span className="text-xl font-bold text-emerald-800">৳{payslipData.netSalary.toLocaleString()}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
