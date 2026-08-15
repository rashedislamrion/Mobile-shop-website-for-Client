"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { FilterBar } from "@/components/admin/FilterBar";
import { DataTable, ActionDropdown } from "@/components/admin/DataTable";
import { TableAction } from "@/types/table";
import { mockAttributes, MockAttribute } from "@/lib/mock-data/products/attributes";
import { ColumnDef } from "@tanstack/react-table";
import { Edit2, Trash2, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AttributesPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Dialog state
  const [attrName, setAttrName] = useState("");
  const [chipInput, setChipInput] = useState("");
  const [chips, setChips] = useState<string[]>([]);

  useEffect(() => {
    setTitle("Attributes");
    setBadge("Website");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredData = mockAttributes.filter((o) => {
    if (searchQuery) {
      return o.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const createActions = (): TableAction[] => [
    { label: "Edit", icon: <Edit2 className="w-4 h-4" />, onClick: (row) => {
      setAttrName(row.name);
      setChips([...row.values]);
      setIsDialogOpen(true);
    }},
    { label: "Delete", icon: <Trash2 className="w-4 h-4 text-red-500" />, variant: "destructive", onClick: () => toast.error("Attribute deleted") },
  ];

  const columns: ColumnDef<MockAttribute>[] = [
    {
      accessorKey: "name",
      header: "Attribute Name",
      cell: ({ row }) => <span className="font-semibold text-slate-800">{row.original.name}</span>,
    },
    {
      accessorKey: "values",
      header: "Values",
      cell: ({ row }) => {
        const vals = row.original.values;
        const display = vals.slice(0, 4).join(", ");
        const extra = vals.length > 4 ? ` +${vals.length - 4} more` : "";
        return <span className="text-sm text-slate-600">{display}{extra}</span>;
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

  const handleAddChip = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && chipInput.trim() !== '') {
      e.preventDefault();
      if (!chips.includes(chipInput.trim())) {
        setChips([...chips, chipInput.trim()]);
      }
      setChipInput("");
    }
  };

  const removeChip = (index: number) => {
    const newChips = [...chips];
    newChips.splice(index, 1);
    setChips(newChips);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Attribute saved successfully!");
    setIsDialogOpen(false);
    setAttrName("");
    setChips([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-3">
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setAttrName("");
            setChips([]);
            setChipInput("");
          }
        }}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm">
              <Plus className="w-4 h-4" /> Add Attribute
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{attrName ? "Edit Attribute" : "Add New Attribute"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-5 pt-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Attribute Name *</label>
                <Input value={attrName} onChange={(e) => setAttrName(e.target.value)} placeholder="e.g. Color" required />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Values</label>
                <div className="p-3 border border-slate-200 rounded-md bg-white flex flex-wrap gap-2 items-center min-h-[100px] content-start">
                  {chips.map((chip, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
                      {chip}
                      <button type="button" onClick={() => removeChip(idx)} className="text-emerald-500 hover:text-emerald-900 ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={chipInput}
                    onChange={(e) => setChipInput(e.target.value)}
                    onKeyDown={handleAddChip}
                    placeholder="Type and press enter..."
                    className="flex-1 min-w-[120px] outline-none text-sm bg-transparent border-none p-0 focus:ring-0"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">Press enter to add multiple values.</p>
              </div>
              <div className="pt-4 flex justify-end">
                <button type="submit" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm">
                  Save Attribute
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <FilterBar 
        searchPlaceholder="Search attribute name..."
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
