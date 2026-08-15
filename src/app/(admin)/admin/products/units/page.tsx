"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { FilterBar } from "@/components/admin/FilterBar";
import { DataTable, ActionDropdown } from "@/components/admin/DataTable";
import { TableAction } from "@/types/table";
import { mockUnits, MockUnit } from "@/lib/mock-data/products/units";
import { ColumnDef } from "@tanstack/react-table";
import { Edit2, Trash2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function UnitsPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    setTitle("Units");
    setBadge("Website");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredData = mockUnits.filter((o) => {
    if (searchQuery) {
      return o.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             o.shortCode.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const createActions = (): TableAction[] => [
    { label: "Edit", icon: <Edit2 className="w-4 h-4" />, onClick: (row) => toast.info(`Edit ${row.name}`) },
    { label: "Delete", icon: <Trash2 className="w-4 h-4 text-red-500" />, variant: "destructive", onClick: () => toast.error("Unit deleted") },
  ];

  const columns: ColumnDef<MockUnit>[] = [
    {
      accessorKey: "name",
      header: "Unit Name",
      cell: ({ row }) => <span className="font-semibold text-slate-800">{row.original.name}</span>,
    },
    {
      accessorKey: "shortCode",
      header: "Short Code",
      cell: ({ row }) => <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded text-slate-600">{row.original.shortCode}</span>
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Unit saved successfully!");
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-3">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm">
              <Plus className="w-4 h-4" /> Add Unit
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Unit</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Unit Name *</label>
                <Input placeholder="e.g. Piece" required />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Short Code *</label>
                <Input placeholder="e.g. pc" required />
              </div>
              <div className="pt-4 flex justify-end">
                <button type="submit" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm">
                  Save Unit
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <FilterBar 
        searchPlaceholder="Search unit name or code..."
        onSearchChange={(val) => setSearchQuery(val)}
        onReset={() => setSearchQuery("")}
      />

      <DataTable 
        columns={columns} 
        data={filteredData} 
        pageSize={10}
      />
    </div>
  );
}
