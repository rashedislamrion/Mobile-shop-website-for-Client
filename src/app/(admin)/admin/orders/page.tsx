"use client";

import { useEffect, useState, useMemo } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { FilterBar } from "@/components/admin/FilterBar";
import { DataTable, StatusBadge, ActionDropdown } from "@/components/admin/DataTable";
import { FilterConfig, StatusVariant, TableAction } from "@/types/table";
import { mockOrders, MockOrder } from "@/lib/mock-data/orders";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, FileText, CheckCircle, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const router = useRouter();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  // Filter state
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  useEffect(() => {
    setTitle("Orders");
    setBadge("Website");
    setDateFilter(""); // Clear date filter from topbar as we use page-level filters here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter configuration
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
      label: "Payment Status",
      key: "paymentStatus",
      options: [
        { label: "Paid", value: "Paid" },
        { label: "Unpaid", value: "Unpaid" },
        { label: "Due", value: "Due" },
      ],
    },
    {
      type: "select",
      label: "Order Status",
      key: "status",
      options: [
        { label: "Pending", value: "Pending" },
        { label: "Confirmed", value: "Confirmed" },
        { label: "Parcel Booked", value: "Parcel Booked" },
        { label: "Delivered", value: "Delivered" },
        { label: "Returned", value: "Returned" },
        { label: "Cancelled", value: "Cancelled" },
      ],
    },
    {
      type: "dateRange",
      label: "Date Range",
      key: "dateRange",
    },
  ];

  // Derived filtered data
  const filteredData = useMemo(() => {
    let result = [...mockOrders];

    // Text Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.toLowerCase().includes(q)
      );
    }

    // Select Filters
    if (filters.branch) {
      result = result.filter((o) => o.branch === filters.branch);
    }
    if (filters.paymentStatus) {
      result = result.filter((o) => o.paymentStatus === filters.paymentStatus);
    }
    if (filters.status) {
      result = result.filter((o) => o.status === filters.status);
    }

    // Date Range Filter (mocked simple comparison)
    const dateRange = filters.dateRange as { from?: Date; to?: Date } | undefined;
    if (dateRange?.from) {
      const from = new Date(dateRange.from).getTime();
      const to = dateRange.to ? new Date(dateRange.to).getTime() : from;
      
      result = result.filter((o) => {
        const orderTime = new Date(o.date).getTime();
        return orderTime >= from && orderTime <= to + 86400000; // Add 1 day to include end date fully
      });
    }

    return result;
  }, [searchQuery, filters]);

  // Handle table actions
  const createActions = (): TableAction[] => [
    { label: "View Details", icon: <Eye className="w-4 h-4" />, onClick: (row) => router.push(`/admin/orders/${row.id.replace('#', '')}`) },
    { label: "View Invoice", icon: <FileText className="w-4 h-4" />, onClick: (row) => console.log("Invoice", row) },
    { label: "Mark Delivered", icon: <CheckCircle className="w-4 h-4" />, onClick: (row) => console.log("Delivered", row) },
    { label: "Edit Order", icon: <Edit className="w-4 h-4" />, onClick: (row) => console.log("Edit", row) },
    { label: "Delete", icon: <Trash2 className="w-4 h-4" />, onClick: (row) => console.log("Delete", row), variant: "destructive" },
  ];

  // Map status to badge colors
  const getPaymentStatusVariant = (status: string): StatusVariant => {
    switch (status) {
      case "Paid": return "success";
      case "Unpaid": return "danger";
      case "Due": return "warning";
      default: return "info";
    }
  };

  const getOrderStatusVariant = (status: string): StatusVariant => {
    switch (status) {
      case "Delivered":
      case "Completed": return "success";
      case "Confirmed":
      case "Parcel Booked": return "info";
      case "Pending": return "warning";
      case "Returned": return "notice";
      case "Cancelled": return "danger";
      default: return "info";
    }
  };

  // Define Columns
  const columns: ColumnDef<MockOrder>[] = [
    {
      accessorKey: "id",
      header: "Order ID",
      cell: ({ row }) => <span className="font-semibold text-slate-800">{row.original.id}</span>,
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.original.date);
        return <span className="text-slate-600 whitespace-nowrap">{date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}<br/><span className="text-xs text-slate-400">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></span>;
      }
    },
    {
      accessorKey: "branch",
      header: "Branch",
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => <span className="font-medium text-slate-700">{row.original.customer}</span>,
    },
    {
      accessorKey: "items",
      header: "Items",
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => <span className="font-semibold text-slate-800">৳{row.original.total.toLocaleString()}</span>,
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => (
        <StatusBadge 
          status={row.original.paymentStatus} 
          type={getPaymentStatusVariant(row.original.paymentStatus)} 
        />
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
