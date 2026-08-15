"use client";

import { useEffect, useState, useMemo } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { FilterBar } from "@/components/admin/FilterBar";
import { DataTable, StatusBadge, ActionDropdown } from "@/components/admin/DataTable";
import { FilterConfig, StatusVariant, TableAction } from "@/types/table";
import { mockTechnicians, Technician } from "@/lib/mock-data/hrm/technicians";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Eye, Tool, Star, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function TechniciansPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [assignJobOpen, setAssignJobOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState<Technician | null>(null);

  useEffect(() => {
    setTitle("Technicians");
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
        { label: "Dhaka Main Branch", value: "Dhaka Main Branch" },
        { label: "Chattogram Branch", value: "Chattogram Branch" },
      ],
    },
    {
      type: "select",
      label: "Specialization",
      key: "specialization",
      options: [
        { label: "Display", value: "Display" },
        { label: "Battery", value: "Battery" },
        { label: "Software", value: "Software" },
        { label: "Camera", value: "Camera" },
        { label: "Charging Port", value: "Charging Port" },
        { label: "General", value: "General" },
      ],
    },
    {
      type: "select",
      label: "Availability",
      key: "availability",
      options: [
        { label: "Available", value: "Available" },
        { label: "Busy", value: "Busy" },
        { label: "Off Duty", value: "Off Duty" },
      ],
    },
  ];

  const filteredData = useMemo(() => {
    let result = [...mockTechnicians];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) => o.name.toLowerCase().includes(q) || o.employeeId.toLowerCase().includes(q)
      );
    }

    if (filters.branch) result = result.filter((o) => o.branch === filters.branch);
    if (filters.availability) result = result.filter((o) => o.availability === filters.availability);
    if (filters.specialization) {
      result = result.filter((o) => o.specializations.includes(filters.specialization as any));
    }

    return result;
  }, [searchQuery, filters]);

  const createActions = (row: Technician): TableAction[] => [
    { label: "View Profile", icon: <Eye className="w-4 h-4" />, onClick: () => toast.info("Viewing profile") },
    { 
      label: "Assign New Job", 
      icon: <Tool className="w-4 h-4" />, 
      onClick: () => {
        setSelectedTech(row);
        setAssignJobOpen(true);
      } 
    },
    { label: "Edit", icon: <Edit className="w-4 h-4" />, onClick: () => router.push(`/admin/hrm/employees/${row.id}/edit`) },
  ];

  const getStatusVariant = (status: string): StatusVariant => {
    switch (status) {
      case "Available": return "success";
      case "Busy": return "warning";
      case "Off Duty": return "neutral";
      default: return "neutral";
    }
  };

  const columns: ColumnDef<Technician>[] = [
    {
      id: "technician",
      header: "Technician",
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
            <p className="text-xs text-slate-500 mt-0.5">{row.original.employeeId} • {row.original.branch}</p>
          </div>
        </div>
      ),
    },
    {
      id: "specializations",
      header: "Specializations",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {row.original.specializations.map(spec => (
            <span key={spec} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold border border-slate-200">
              {spec}
            </span>
          ))}
        </div>
      )
    },
    {
      accessorKey: "activeJobs",
      header: "Active Jobs",
      cell: ({ row }) => (
        <span className={`font-semibold ${row.original.activeJobs > 0 ? 'text-blue-600' : 'text-slate-500'}`}>
          {row.original.activeJobs}
        </span>
      )
    },
    {
      accessorKey: "completedThisMonth",
      header: "Completed (Month)",
      cell: ({ row }) => <span className="font-semibold text-emerald-600">{row.original.completedThisMonth}</span>
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm font-semibold text-slate-700">
          {row.original.rating} <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
        </div>
      )
    },
    {
      accessorKey: "availability",
      header: "Availability",
      cell: ({ row }) => (
        <StatusBadge 
          status={row.original.availability} 
          type={getStatusVariant(row.original.availability)} 
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
      
      {/* Assign Job Dialog */}
      <Dialog open={assignJobOpen} onOpenChange={setAssignJobOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Service Job</DialogTitle>
          </DialogHeader>
          <div className="pt-4 space-y-4">
            <div className="bg-blue-50 text-blue-800 p-3 rounded-lg flex gap-3 text-sm border border-blue-100">
              <Tool className="w-5 h-5 shrink-0 text-blue-600" />
              <p>Assigning job to <strong>{selectedTech?.name}</strong>. They currently have <strong>{selectedTech?.activeJobs}</strong> active jobs.</p>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Pending Jobs in {selectedTech?.branch}</label>
              <div className="border border-slate-200 rounded-lg max-h-60 overflow-y-auto">
                {/* Mock Job List */}
                <div className="p-3 border-b border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">SV-2026-0001</p>
                    <p className="text-xs text-slate-500">iPhone 13 Pro Max • Display Replacement</p>
                  </div>
                  <button 
                    onClick={() => {
                      toast.success(`Job assigned to ${selectedTech?.name}`);
                      setAssignJobOpen(false);
                    }}
                    className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-medium rounded-md text-xs flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Assign
                  </button>
                </div>
                <div className="p-3 border-b border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">SV-2026-0004</p>
                    <p className="text-xs text-slate-500">Samsung S22 Ultra • Battery Issue</p>
                  </div>
                  <button 
                    onClick={() => {
                      toast.success(`Job assigned to ${selectedTech?.name}`);
                      setAssignJobOpen(false);
                    }}
                    className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-medium rounded-md text-xs flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Assign
                  </button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <FilterBar 
        searchPlaceholder="Search technician..."
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
