"use client";

import { useEffect, useState, useMemo } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { FilterBar } from "@/components/admin/FilterBar";
import { DataTable, StatusBadge, ActionDropdown } from "@/components/admin/DataTable";
import { FilterConfig, StatusVariant, TableAction } from "@/types/table";
import { mockWantedProducts, MockWantedProduct } from "@/lib/mock-data/products/wanted-products";
import { ColumnDef } from "@tanstack/react-table";
import { Search, CheckCircle, MessageSquare, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function WantedProductsPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  useEffect(() => {
    setTitle("Wanted Products");
    setBadge("Website");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterConfigs: FilterConfig[] = [
    {
      type: "select",
      label: "Status",
      key: "status",
      options: [
        { label: "New", value: "New" },
        { label: "Sourcing", value: "Sourcing" },
        { label: "Fulfilled", value: "Fulfilled" },
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
    let result = [...mockWantedProducts];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.productName.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q)
      );
    }

    if (filters.status) {
      result = result.filter((o) => o.status === filters.status);
    }

    const dateRange = filters.dateRange as { from?: Date; to?: Date } | undefined;
    if (dateRange?.from) {
      const from = new Date(dateRange.from).getTime();
      const to = dateRange.to ? new Date(dateRange.to).getTime() : from;
      
      result = result.filter((o) => {
        const orderTime = new Date(o.requestedDate).getTime();
        return orderTime >= from && orderTime <= to + 86400000;
      });
    }

    return result;
  }, [searchQuery, filters]);

  const createActions = (): TableAction[] => [
    { label: "Mark as Sourcing", icon: <Search className="w-4 h-4 text-blue-600" />, onClick: (row) => console.log("Sourcing", row) },
    { label: "Mark as Fulfilled", icon: <CheckCircle className="w-4 h-4 text-emerald-600" />, onClick: (row) => console.log("Fulfilled", row) },
    { label: "Add Note", icon: <MessageSquare className="w-4 h-4" />, onClick: (row) => console.log("Note", row) },
    { label: "Delete", icon: <Trash2 className="w-4 h-4 text-red-500" />, variant: "destructive", onClick: (row) => console.log("Delete", row) },
  ];

  const getStatusVariant = (status: string): StatusVariant => {
    switch (status) {
      case "Fulfilled": return "success";
      case "Sourcing": return "info";
      case "New": return "notice";
      case "Cancelled": return "danger";
      default: return "info";
    }
  };

  const columns: ColumnDef<MockWantedProduct>[] = [
    {
      accessorKey: "productName",
      header: "Requested Product",
      cell: ({ row }) => <span className="font-semibold text-slate-800">{row.original.productName}</span>,
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
      accessorKey: "requestedDate",
      header: "Requested Date",
      cell: ({ row }) => {
        const date = new Date(row.original.requestedDate);
        return (
          <span className="text-slate-700 whitespace-nowrap">
            {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}<br/>
            <span className="text-xs text-slate-400">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </span>
        );
      }
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
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => {
        const notes = row.original.notes;
        if (notes.length > 30) {
          return (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger className="text-left max-w-[200px] truncate cursor-help text-slate-600 text-sm">
                  {notes}
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{notes}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
        return <span className="text-slate-600 text-sm">{notes}</span>;
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
        searchPlaceholder="Search product, customer..."
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
