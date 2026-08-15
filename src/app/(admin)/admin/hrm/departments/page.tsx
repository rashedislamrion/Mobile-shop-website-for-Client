"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { DataTable, ActionDropdown } from "@/components/admin/DataTable";
import { TableAction } from "@/types/table";
import { mockDepartments, Department } from "@/lib/mock-data/hrm/departments";
import { mockEmployees } from "@/lib/mock-data/hrm/employees";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2, Plus, Users, Search } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

const departmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  headId: z.string().optional(),
  status: z.enum(["Active", "Inactive"]),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

export default function DepartmentsPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [localData, setLocalData] = useState<Department[]>(mockDepartments);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
      headId: "",
      status: "Active",
    },
  });

  useEffect(() => {
    setTitle("Departments");
    setBadge("Website");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredData = localData.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const createActions = (row: Department): TableAction[] => [
    { label: "Edit", icon: <Edit className="w-4 h-4" />, onClick: () => toast.info(`Editing ${row.name}`) },
    { 
      label: "Delete", 
      icon: <Trash2 className="w-4 h-4 text-red-500" />, 
      variant: "destructive", 
      disabled: row.employeeCount > 0,
      disabledTooltip: "Reassign employees before deleting",
      onClick: () => {
        toast.error(`${row.name} deleted`);
        setLocalData(prev => prev.filter(d => d.id !== row.id));
      }
    },
  ];

  const columns: ColumnDef<Department>[] = [
    {
      accessorKey: "name",
      header: "Department Name",
      cell: ({ row }) => <span className="font-semibold text-slate-800">{row.original.name}</span>
    },
    {
      accessorKey: "headName",
      header: "Department Head",
      cell: ({ row }) => {
        if (!row.original.headName) {
          return <span className="text-slate-400 italic text-sm">Unassigned</span>;
        }
        return (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-100 shrink-0 relative">
              {row.original.headAvatar ? (
                <Image src={row.original.headAvatar} alt="Head" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500 text-xs font-medium">
                  {row.original.headName.charAt(0)}
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-slate-700">{row.original.headName}</span>
          </div>
        );
      }
    },
    {
      accessorKey: "employeeCount",
      header: "Employees",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md w-fit text-slate-600">
          <Users className="w-3.5 h-3.5" />
          <span className="font-semibold text-sm">{row.original.employeeCount}</span>
        </div>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.original.status === "Active";
        return (
          <div className="flex items-center gap-2">
            <Switch 
              checked={isActive} 
              onCheckedChange={(checked) => {
                const newData = [...localData];
                const idx = newData.findIndex(d => d.id === row.original.id);
                if (idx >= 0) {
                  newData[idx].status = checked ? "Active" : "Inactive";
                  setLocalData(newData);
                  toast.success(`Department ${checked ? 'activated' : 'deactivated'}`);
                }
              }}
            />
            <span className={`text-xs font-medium ${isActive ? 'text-emerald-700' : 'text-slate-500'}`}>
              {row.original.status}
            </span>
          </div>
        );
      },
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

  const onSubmit = (data: DepartmentFormValues) => {
    let headName, headAvatar;
    if (data.headId) {
      const emp = mockEmployees.find(e => e.id === data.headId);
      headName = emp?.name;
      headAvatar = emp?.avatar;
    }

    const newDep: Department = {
      id: `dep-new-${Date.now()}`,
      name: data.name,
      headId: data.headId,
      headName,
      headAvatar,
      employeeCount: 0,
      status: data.status,
    };

    setLocalData([newDep, ...localData]);
    toast.success("Department created successfully!");
    setIsDialogOpen(false);
    form.reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder="Search departments..." 
            className="pl-9 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) form.reset();
        }}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm">
              <Plus className="w-4 h-4" /> Add Department
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Add Department</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Sales, HR, IT..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="headId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department Head</FormLabel>
                      <FormControl>
                        <select className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" {...field}>
                          <option value="">Unassigned</option>
                          {mockEmployees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-4 space-y-0 mt-2">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value === "Active"}
                          onCheckedChange={(checked) => field.onChange(checked ? "Active" : "Inactive")}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <button type="button" onClick={() => setIsDialogOpen(false)} className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors text-sm">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm">
                    Save
                  </button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable 
        columns={columns} 
        data={filteredData} 
        pageSize={10}
      />
    </div>
  );
}
