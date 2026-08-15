"use client";

import { useEffect, useState, useMemo } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { FilterBar } from "@/components/admin/FilterBar";
import { DataTable, StatusBadge, ActionDropdown } from "@/components/admin/DataTable";
import { FilterConfig, StatusVariant, TableAction } from "@/types/table";
import { mockServices, MockService } from "@/lib/mock-data/sales/service";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, UserPlus, CheckCircle, PackageCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ServiceListPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  useEffect(() => {
    setTitle("Service List");
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
      label: "Service Status",
      key: "status",
      options: [
        { label: "Pending", value: "Pending" },
        { label: "In Progress", value: "In Progress" },
        { label: "Ready for Pickup", value: "Ready for Pickup" },
        { label: "Delivered", value: "Delivered" },
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
    let result = [...mockServices];

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
    { label: "Assign Technician", icon: <UserPlus className="w-4 h-4" />, onClick: (row) => console.log("Assign", row) },
    { label: "Mark as Ready", icon: <PackageCheck className="w-4 h-4 text-purple-600" />, onClick: (row) => console.log("Ready", row) },
    { label: "Mark as Delivered", icon: <CheckCircle className="w-4 h-4 text-emerald-600" />, onClick: (row) => console.log("Delivered", row) },
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
      case "Delivered": return "success";
      case "Ready for Pickup": return "purple" as StatusVariant; 
      // Note: "purple" isn't standard in our table types but we'll map it to "notice" or similar if needed
      // Actually we'll just return a base string and handle the color in a custom badge if we strictly need purple.
      // Wait, let's use standard variants or add purple to our StatusBadge mapping.
      // We will map Ready to 'info', In Progress to 'default' (blue-ish), Pending to 'warning'.
      case "In Progress": return "info"; // Blue
      case "Pending": return "warning"; // Amber
      case "Cancelled": return "danger"; // Red
      default: return "info";
    }
  };

  const columns: ColumnDef<MockService>[] = [
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
      accessorKey: "device",
      header: "Device",
      cell: ({ row }) => <span className="text-slate-700 font-medium">{row.original.device}</span>,
    },
    {
      accessorKey: "technician",
      header: "Technician",
      cell: ({ row }) => <span className={row.original.technician === "Unassigned" ? "text-slate-400 italic" : "text-slate-700 font-medium"}>{row.original.technician}</span>,
    },
    {
      accessorKey: "serviceCharge",
      header: "Service Charge",
      cell: ({ row }) => <span className="font-bold text-slate-800">৳{row.original.serviceCharge.toLocaleString()}</span>,
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => (
        <div className="flex flex-col items-start gap-1">
          <StatusBadge 
            status={row.original.paymentStatus} 
            type={getPaymentStatusVariant(row.original.paymentStatus)} 
          />
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const st = row.original.status;
        if (st === "Ready for Pickup") {
          return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none">Ready for Pickup</Badge>;
        }
        return (
          <StatusBadge 
            status={st} 
            type={getOrderStatusVariant(st)} 
          />
        );
      }
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
