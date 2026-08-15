"use client";

import { useEffect, useState, useMemo } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { FilterBar } from "@/components/admin/FilterBar";
import { DataTable, StatusBadge, ActionDropdown } from "@/components/admin/DataTable";
import { FilterConfig, StatusVariant, TableAction } from "@/types/table";
import { mockDiagnosingOrders, MockDiagnosingOrder } from "@/lib/mock-data/sales/diagnosing";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, FileText, CheckCircle, Edit, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function DiagnosingOrdersPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  useEffect(() => {
    setTitle("Diagnosing Orders");
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
        { label: "Global", value: "Global" },
        { label: "Demo Portal", value: "Demo Portal" },
        { label: "Demo Bashundhara", value: "Demo Bashundhara" },
        { label: "Eastern Plaza", value: "Eastern Plaza" },
        { label: "Gulistan Shopping Complex", value: "Gulistan Shopping Complex" },
        { label: "Motijheel Plaza", value: "Motijheel Plaza" },
      ],
    },
    {
      type: "select",
      label: "Payment Status",
      key: "paymentStatus",
      options: [
        { label: "Paid", value: "Paid" },
        { label: "Due", value: "Due" },
        { label: "Pending", value: "Pending" },
      ],
    },
    {
      type: "select",
      label: "Order Status",
      key: "status",
      options: [
        { label: "Diagnosing", value: "Diagnosing" },
        { label: "Completed", value: "Completed" },
        { label: "Cancelled", value: "Cancelled" },
      ],
    },
    {
      type: "dateRange",
      label: "Date Range",
      key: "dateRange",
    },
  ];

  const filteredData = useMemo(() => {
    let result = [...mockDiagnosingOrders];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q)
      );
    }

    if (filters.branch) {
      result = result.filter((o) => o.branch === filters.branch);
    }
    if (filters.paymentStatus) {
      result = result.filter((o) => o.paymentStatus === filters.paymentStatus);
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
    { label: "View Details", icon: <Eye className="w-4 h-4" />, onClick: (row) => console.log("View", row) },
    { label: "View Invoice", icon: <FileText className="w-4 h-4" />, onClick: (row) => console.log("Invoice", row) },
    { label: "Mark as Delivered", icon: <CheckCircle className="w-4 h-4 text-emerald-600" />, onClick: (row) => console.log("Delivered", row) },
    { label: "Edit Order", icon: <Edit className="w-4 h-4" />, onClick: (row) => console.log("Edit", row) },
  ];

  const getPaymentStatusVariant = (status: string): StatusVariant => {
    switch (status) {
      case "Paid": return "success";
      case "Due": return "danger";
      case "Pending": return "warning";
      default: return "info";
    }
  };

  const getOrderStatusVariant = (status: string): StatusVariant => {
    switch (status) {
      case "Completed": return "success";
      case "Diagnosing": return "info";
      case "Cancelled": return "danger";
      default: return "info";
    }
  };

  const columns: ColumnDef<MockDiagnosingOrder>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <span className="font-mono font-bold text-slate-800">{row.original.id}</span>,
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
      accessorKey: "items",
      header: "Items",
      cell: ({ row }) => {
        const items = row.original.items;
        if (items.length > 25) {
          return (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger className="text-left max-w-[150px] truncate cursor-help">
                  {items}
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{items}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
        return items;
      }
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => <span className="font-bold text-slate-800">৳{row.original.total.toLocaleString()}</span>,
    },
    {
      accessorKey: "paymentStatus",
      header: "Payments",
      cell: ({ row }) => (
        <div className="flex flex-col items-start gap-1">
          <StatusBadge 
            status={row.original.paymentStatus} 
            type={getPaymentStatusVariant(row.original.paymentStatus)} 
          />
          {row.original.dueAmount > 0 && (
            <span className="text-[10px] font-medium text-red-500">
              Due ৳{row.original.dueAmount.toLocaleString()}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge 
          status={row.original.status} 
          type={getOrderStatusVariant(row.original.status)} 
        />
      ),
    },
    {
      accessorKey: "staff",
      header: "Staff",
      cell: ({ row }) => <span className={row.original.staff === "N/A" ? "text-slate-400 italic" : "text-slate-700"}>{row.original.staff}</span>,
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
