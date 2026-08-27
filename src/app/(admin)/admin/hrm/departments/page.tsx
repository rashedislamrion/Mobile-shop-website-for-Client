"use client";

import { useEffect, useState, useCallback } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { DataTable, ActionDropdown } from "@/components/admin/DataTable";
import { TableAction } from "@/types/table";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2, Plus, Users, Search } from "lucide-react";
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
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";

interface DepartmentRecord {
  id: string;
  name: string;
  headId: string | null;
  status: string;
  head?: { id: string; name: string; email: string; phone: string } | null;
  _count?: { staff: number };
}

interface EmployeeOption {
  id: string;
  name: string;
  employeeId: string;
}

const departmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  headId: z.string().optional(),
  status: z.enum(["Active", "Inactive"]),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

export default function DepartmentsPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [data, setData] = useState<DepartmentRecord[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentRecord | null>(null);

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
  }, [setTitle, setBadge, setDateFilter]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: Record<string, any> = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await apiGet<DepartmentRecord[]>("/departments", params);
      setData(Array.isArray(res) ? res : []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load departments");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    apiGet<{ data: any[] }>("/employees", { limit: 100 })
      .then((res) => {
        if (res?.data) {
          setEmployees(res.data.map((e: any) => ({ id: e.id, name: e.name, employeeId: e.employeeId })));
        }
      })
      .catch(() => {});
  }, []);

  const handleOpenDialog = (dept?: DepartmentRecord) => {
    if (dept) {
      setEditingDept(dept);
      form.reset({
        name: dept.name,
        headId: dept.headId || "",
        status: dept.status === "ACTIVE" || dept.status === "Active" ? "Active" : "Inactive",
      });
    } else {
      setEditingDept(null);
      form.reset({
        name: "",
        headId: "",
        status: "Active",
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: DepartmentFormValues) => {
    try {
      const payload = {
        name: values.name,
        headId: values.headId || undefined,
        status: values.status.toUpperCase(),
      };

      if (editingDept) {
        await apiPatch(`/departments/${editingDept.id}`, payload);
        toast.success("Department updated successfully");
      } else {
        await apiPost("/departments", payload);
        toast.success("Department created successfully");
      }

      setIsDialogOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save department");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDelete(`/departments/${id}`);
      toast.success("Department deleted successfully");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete department");
    }
  };

  const createActions = (): TableAction[] => [
    {
      label: "Edit",
      icon: <Edit className="w-4 h-4" />,
      onClick: (row) => handleOpenDialog(row),
    },
    {
      label: "Delete",
      icon: <Trash2 className="w-4 h-4" />,
      variant: "destructive",
      onClick: (row) => handleDelete(row.id),
    },
  ];

  const columns: ColumnDef<DepartmentRecord>[] = [
    {
      accessorKey: "name",
      header: "Department Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
            {row.original.name.charAt(0)}
          </div>
          <div>
            <span className="font-semibold text-slate-800">{row.original.name}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "head",
      header: "Head of Department",
      cell: ({ row }) => {
        const head = row.original.head;
        if (!head) return <span className="text-slate-400 italic text-sm">Unassigned</span>;

        return (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">{head.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "employeeCount",
      header: "Employees",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-slate-600">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="font-medium text-sm">{row.original._count?.staff || 0}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.original.status === "ACTIVE" || row.original.status === "Active";
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"
          }`}>
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
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
      {/* Top Header / Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder="Search departments..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white"
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button 
              onClick={() => handleOpenDialog()}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" /> Add Department
            </button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingDept ? "Edit Department" : "Add New Department"}</DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Sales & Marketing" {...field} />
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
                      <FormLabel>Head of Department</FormLabel>
                      <FormControl>
                        <select 
                          className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                          {...field}
                          value={field.value || ""}
                        >
                          <option value="">Select an employee (Optional)</option>
                          {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.name} ({emp.employeeId})
                            </option>
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
                    <FormItem className="flex items-center justify-between rounded-lg border border-slate-100 p-3 bg-slate-50">
                      <div className="space-y-0.5">
                        <FormLabel>Status</FormLabel>
                        <div className="text-xs text-slate-500">
                          {field.value === "Active" ? "Department is active" : "Department is inactive"}
                        </div>
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

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsDialogOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium"
                  >
                    {editingDept ? "Save Changes" : "Create Department"}
                  </button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Table */}
      <DataTable 
        columns={columns} 
        data={data} 
        pageSize={10}
      />
    </div>
  );
}
