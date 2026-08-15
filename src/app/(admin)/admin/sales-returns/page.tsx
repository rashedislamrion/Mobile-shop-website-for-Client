"use client";

import { useEffect, useState, useMemo } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { FilterBar } from "@/components/admin/FilterBar";
import { DataTable, StatusBadge, ActionDropdown } from "@/components/admin/DataTable";
import { FilterConfig, StatusVariant, TableAction } from "@/types/table";
import { mockSalesReturns, MockSalesReturn } from "@/lib/mock-data/sales-returns";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, CheckCircle, XCircle, RefreshCcw } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SalesReturnsPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  useEffect(() => {
    setTitle("Sales Returns");
    setBadge("Website");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterConfigs: FilterConfig[] = [
    {
      type: "select",
      label: "Branch",
      key: "branch",
      options: [
        { label: "Dhaka Main", value: "Dhaka Main" },
        { label: "Chattogram", value: "Chattogram" },
        { label: "Sylhet", value: "Sylhet" },
        { label: "Rajshahi", value: "Rajshahi" },
      ],
    },
    {
      type: "select",
      label: "Return Status",
      key: "status",
      options: [
        { label: "Requested", value: "Requested" },
        { label: "Approved", value: "Approved" },
        { label: "Refunded", value: "Refunded" },
        { label: "Rejected", value: "Rejected" },
      ],
    },
    {
      type: "dateRange",
      label: "Date Range",
      key: "dateRange",
    },
  ];

  const filteredData = useMemo(() => {
    let result = [...mockSalesReturns];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.originalOrderId.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q)
      );
    }

    if (filters.branch) {
      result = result.filter((o) => o.branch === filters.branch);
    }
    if (filters.status) {
      result = result.filter((o) => o.status === filters.status);
    }

    const dateRange = filters.dateRange as { from?: Date; to?: Date } | undefined;
    if (dateRange?.from) {
      const from = new Date(dateRange.from).getTime();
      const to = dateRange.to ? new Date(dateRange.to).getTime() : from;
      
      result = result.filter((o) => {
        const orderTime = new Date(o.date).getTime();
        return orderTime >= from && orderTime <= to + 86400000;
      });
    }

    return result;
  }, [searchQuery, filters]);

  const createActions = (): TableAction[] => [
    { label: "View Details", icon: <Eye className="w-4 h-4" />, onClick: (row) => router.push(`/admin/sales-returns/${row.id.replace('#', '')}`) },
    { label: "Approve", icon: <CheckCircle className="w-4 h-4 text-emerald-600" />, onClick: (row) => console.log("Approve", row) },
    { label: "Mark as Refunded", icon: <RefreshCcw className="w-4 h-4 text-blue-600" />, onClick: (row) => console.log("Refunded", row) },
    { label: "Reject", icon: <XCircle className="w-4 h-4 text-red-500" />, variant: "destructive", onClick: (row) => console.log("Reject", row) },
  ];

  const getStatusVariant = (status: string): StatusVariant => {
    switch (status) {
      case "Refunded": return "success";
      case "Approved": return "info";
      case "Requested": return "warning";
      case "Rejected": return "danger";
      default: return "info";
    }
  };

  const columns: ColumnDef<MockSalesReturn>[] = [
    {
      accessorKey: "id",
      header: "Return ID",
      cell: ({ row }) => <span className="font-mono font-bold text-slate-800">{row.original.id}</span>,
    },
    {
      accessorKey: "originalOrderId",
      header: "Order ID",
      cell: ({ row }) => (
        <Link href={`/admin/orders/${row.original.originalOrderId.replace('#', '')}`} className="text-emerald-600 font-medium hover:underline">
          {row.original.originalOrderId}
        </Link>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.original.date);
        return (
          <span className="text-slate-700 whitespace-nowrap">
            {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}<br/>
            <span className="text-xs text-slate-400">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </span>
        );
      }
    },
    {
      accessorKey: "branch",
      header: "Branch",
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => (
        <span className="text-slate-700 font-medium">
          {row.original.customerName}<br/>
          <span className="text-xs text-slate-400 font-normal">{row.original.customerPhone}</span>
        </span>
      ),
    },
    {
      accessorKey: "itemsReturned",
      header: "Item(s) Returned",
      cell: ({ row }) => <span className="text-sm font-medium text-slate-700">{row.original.itemsReturned}</span>
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => {
        const reason = row.original.reason;
        if (reason.length > 25) {
          return (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger className="text-left max-w-[150px] truncate cursor-help">
                  {reason}
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{reason}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
        return reason;
      }
    },
    {
      accessorKey: "refundAmount",
      header: "Refund Amount",
      cell: ({ row }) => <span className="font-bold text-slate-800">৳{row.original.refundAmount.toLocaleString()}</span>,
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
        searchPlaceholder="Search ID, Customer..."
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
