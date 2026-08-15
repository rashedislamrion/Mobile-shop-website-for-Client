"use client";

import { useEffect, useState, useMemo } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { FilterBar } from "@/components/admin/FilterBar";
import { DataTable, StatusBadge, ActionDropdown } from "@/components/admin/DataTable";
import { FilterConfig, StatusVariant, TableAction } from "@/types/table";
import { mockExchanges, MockExchange } from "@/lib/mock-data/exchanges";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, CheckCircle, PackageCheck, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ExchangesPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  useEffect(() => {
    setTitle("Exchanges");
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
      label: "Exchange Status",
      key: "status",
      options: [
        { label: "Requested", value: "Requested" },
        { label: "Approved", value: "Approved" },
        { label: "Item Received", value: "Item Received" },
        { label: "Completed", value: "Completed" },
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
    let result = [...mockExchanges];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.originalOrderId.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q)
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
    { label: "View Details", icon: <Eye className="w-4 h-4" />, onClick: (row) => router.push(`/admin/exchanges/${row.id.replace('#', '')}`) },
    { label: "Approve", icon: <CheckCircle className="w-4 h-4 text-emerald-600" />, onClick: (row) => console.log("Approve", row) },
    { label: "Mark Received", icon: <PackageCheck className="w-4 h-4 text-blue-600" />, onClick: (row) => console.log("Received", row) },
    { label: "Complete", icon: <CheckCircle className="w-4 h-4 text-emerald-600" />, onClick: (row) => console.log("Complete", row) },
    { label: "Reject", icon: <XCircle className="w-4 h-4 text-red-500" />, variant: "destructive", onClick: (row) => console.log("Reject", row) },
  ];

  const getStatusVariant = (status: string): StatusVariant => {
    switch (status) {
      case "Completed": return "success";
      case "Item Received": return "info";
      case "Approved": return "notice";
      case "Requested": return "warning";
      case "Rejected": return "danger";
      default: return "info";
    }
  };

  const columns: ColumnDef<MockExchange>[] = [
    {
      accessorKey: "id",
      header: "Exchange ID",
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
      cell: ({ row }) => <span className="text-slate-700 font-medium">{row.original.customerName}</span>,
    },
    {
      accessorKey: "oldItem",
      header: "Old Item",
      cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.oldItem.name}</span>
    },
    {
      accessorKey: "newItem",
      header: "New Item",
      cell: ({ row }) => <span className="text-sm font-medium text-emerald-700">{row.original.newItem.name}</span>
    },
    {
      accessorKey: "priceDifference",
      header: "Difference",
      cell: ({ row }) => {
        const diff = row.original.priceDifference;
        if (diff > 0) {
          return <span className="font-bold text-red-500">+৳{diff.toLocaleString()} (Due)</span>;
        } else if (diff < 0) {
          return <span className="font-bold text-emerald-600">-৳{Math.abs(diff).toLocaleString()} (Refund)</span>;
        }
        return <span className="font-bold text-slate-500">৳0</span>;
      },
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
