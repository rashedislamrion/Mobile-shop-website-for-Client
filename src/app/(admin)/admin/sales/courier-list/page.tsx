"use client";

import { useEffect, useState, useMemo } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { FilterBar } from "@/components/admin/FilterBar";
import { DataTable, StatusBadge, ActionDropdown } from "@/components/admin/DataTable";
import { FilterConfig, StatusVariant, TableAction } from "@/types/table";
import { mockCourierList, MockCourierTracking } from "@/lib/mock-data/sales/courier-list";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, ExternalLink, CheckCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function CourierListPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  useEffect(() => {
    setTitle("Courier List");
    setBadge("Website");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterConfigs: FilterConfig[] = [
    {
      type: "select",
      label: "Courier Partner",
      key: "courierPartner",
      options: [
        { label: "Pathao", value: "Pathao" },
        { label: "Steadfast", value: "Steadfast" },
        { label: "RedX", value: "RedX" },
      ],
    },
    {
      type: "select",
      label: "Status",
      key: "status",
      options: [
        { label: "Pending Pickup", value: "Pending Pickup" },
        { label: "Picked Up", value: "Picked Up" },
        { label: "In Transit", value: "In Transit" },
        { label: "Delivered", value: "Delivered" },
        { label: "Returned", value: "Returned" },
      ],
    },
    {
      type: "dateRange",
      label: "Date Range",
      key: "dateRange",
    },
  ];

  const filteredData = useMemo(() => {
    let result = [...mockCourierList];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.trackingNo.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.orderId.toLowerCase().includes(q)
      );
    }

    if (filters.courierPartner) {
      result = result.filter((o) => o.courierPartner === filters.courierPartner);
    }
    if (filters.status) {
      result = result.filter((o) => o.status === filters.status);
    }

    const dateRange = filters.dateRange as { from?: Date; to?: Date } | undefined;
    if (dateRange?.from) {
      const from = new Date(dateRange.from).getTime();
      const to = dateRange.to ? new Date(dateRange.to).getTime() : from;
      
      result = result.filter((o) => {
        const orderTime = new Date(o.lastUpdated).getTime();
        return orderTime >= from && orderTime <= to + 86400000;
      });
    }

    return result;
  }, [searchQuery, filters]);

  const createActions = (): TableAction[] => [
    { label: "View Details", icon: <Eye className="w-4 h-4" />, onClick: (row) => console.log("View", row) },
    { label: "Track on Courier Site", icon: <ExternalLink className="w-4 h-4" />, onClick: (row) => console.log("Track", row) },
    { label: "Mark as Delivered", icon: <CheckCircle className="w-4 h-4 text-emerald-600" />, onClick: (row) => console.log("Delivered", row) },
  ];

  const getOrderStatusVariant = (status: string): StatusVariant => {
    switch (status) {
      case "Delivered": return "success";
      case "In Transit": 
      case "Picked Up": return "info";
      case "Pending Pickup": return "warning";
      case "Returned": return "danger";
      default: return "info";
    }
  };

  const columns: ColumnDef<MockCourierTracking>[] = [
    {
      accessorKey: "trackingNo",
      header: "Tracking No.",
      cell: ({ row }) => <span className="font-mono font-bold text-slate-800">{row.original.trackingNo}</span>,
    },
    {
      accessorKey: "orderId",
      header: "Order ID",
      cell: ({ row }) => (
        <Link href={`/admin/sales/courier?search=${row.original.orderId}`} className="text-emerald-600 font-medium hover:underline">
          {row.original.orderId}
        </Link>
      ),
    },
    {
      accessorKey: "courierPartner",
      header: "Courier Partner",
      cell: ({ row }) => <span className="font-medium text-slate-700">{row.original.courierPartner}</span>,
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => <span className="font-medium text-slate-700">{row.original.customerName}</span>,
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => {
        const addr = row.original.address;
        if (addr.length > 25) {
          return (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger className="text-left max-w-[180px] truncate cursor-help">
                  {addr}
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{addr}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
        return addr;
      }
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
      accessorKey: "lastUpdated",
      header: "Last Updated",
      cell: ({ row }) => {
        const date = new Date(row.original.lastUpdated);
        return (
          <span className="text-slate-600 text-sm whitespace-nowrap">
            {formatDistanceToNow(date, { addSuffix: true })}
          </span>
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
        searchPlaceholder="Search Tracking No, Customer..."
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
