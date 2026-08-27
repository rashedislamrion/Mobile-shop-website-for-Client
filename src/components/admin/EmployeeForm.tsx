"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { 
  Check, User, Upload, RefreshCw, Key, Trash2, Plus
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { apiGet, apiPost, apiPatch } from "@/lib/api-client";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(6, "Phone is required"),
  gender: z.string().optional(),
  dob: z.string().optional(),
  nid: z.string().optional(),
  
  departmentId: z.string().optional(),
  roleId: z.string().min(1, "Role is required"),
  branchId: z.string().optional(),
  joiningDate: z.string().optional(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT"]),
  reportingManagerId: z.string().optional(),
  
  basicSalary: z.coerce.number().min(0),
  allowances: z.array(z.object({
    name: z.string().min(1, "Name is required"),
    amount: z.coerce.number().min(0),
  })),
  paymentMethod: z.enum(["BANK_TRANSFER", "CASH", "MOBILE_BANKING"]).optional(),
  bankAccountNo: z.string().optional(),
  
  tempPassword: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ON_LEAVE"]),
});

type EmployeeFormValues = z.infer<typeof formSchema>;

interface EmployeeFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export function EmployeeForm({ initialData, isEdit }: EmployeeFormProps) {
  const router = useRouter();
  
  const [departments, setDepartments] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultAllowances = initialData?.allowances
    ? Object.entries(initialData.allowances).map(([name, amount]) => ({
        name,
        amount: Number(amount),
      }))
    : [{ name: "Transport", amount: 2000 }];

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      gender: initialData?.gender || "Male",
      dob: initialData?.dob ? new Date(initialData.dob).toISOString().split("T")[0] : "1995-01-01",
      nid: initialData?.nidNumber || "",
      departmentId: initialData?.departmentId || initialData?.department?.id || "",
      roleId: initialData?.roleId || initialData?.role?.id || "",
      branchId: initialData?.branchId || initialData?.branch?.id || "",
      joiningDate: initialData?.joiningDate ? new Date(initialData.joiningDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      employmentType: initialData?.employmentType || "FULL_TIME",
      reportingManagerId: initialData?.reportingManagerId || "",
      basicSalary: initialData?.basicSalary ? Number(initialData.basicSalary) : 30000,
      allowances: defaultAllowances,
      paymentMethod: initialData?.paymentMethod || "BANK_TRANSFER",
      bankAccountNo: initialData?.bankAccountNo || "",
      tempPassword: "",
      status: initialData?.status || "ACTIVE",
    },
  });

  useEffect(() => {
    Promise.all([
      apiGet<any[]>("/departments"),
      apiGet<any[]>("/roles"),
      apiGet<any[]>("/branches/public"),
      apiGet<{ data: any[] }>("/employees", { limit: 100 }),
    ])
      .then(([deptRes, roleRes, branchRes, empRes]) => {
        if (Array.isArray(deptRes)) setDepartments(deptRes);
        if (Array.isArray(roleRes)) setRoles(roleRes);
        if (Array.isArray(branchRes)) setBranches(branchRes);
        if (empRes?.data) setManagers(empRes.data.filter((e: any) => e.id !== initialData?.id));
      })
      .catch(() => {});
  }, [initialData?.id]);

  const { fields: allowanceFields, append: appendAllowance, remove: removeAllowance } = useFieldArray({
    name: "allowances",
    control: form.control,
  });

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setValue("tempPassword", pwd);
  };

  const onSubmit = async (data: EmployeeFormValues) => {
    try {
      setIsSubmitting(true);

      const allowancesObj: Record<string, number> = {};
      data.allowances.forEach((a) => {
        if (a.name.trim()) allowancesObj[a.name.trim()] = Number(a.amount);
      });

      const payload: any = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        gender: data.gender,
        dob: data.dob,
        nidNumber: data.nid || undefined,
        departmentId: data.departmentId || undefined,
        roleId: data.roleId,
        branchId: data.branchId || undefined,
        joiningDate: data.joiningDate,
        employmentType: data.employmentType,
        reportingManagerId: data.reportingManagerId || undefined,
        basicSalary: data.basicSalary,
        allowances: allowancesObj,
        paymentMethod: data.paymentMethod,
        bankAccountNo: data.bankAccountNo || undefined,
        status: data.status,
      };

      if (data.tempPassword?.trim()) {
        payload.password = data.tempPassword.trim();
      }

      if (isEdit && initialData?.id) {
        await apiPatch(`/employees/${initialData.id}`, payload);
        toast.success("Employee profile updated successfully");
      } else {
        await apiPost("/employees", payload);
        toast.success("New employee registered successfully");
      }

      router.push("/admin/hrm/employees");
    } catch (err: any) {
      toast.error(err.message || "Failed to save employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-6">
        
        {/* LEFT COLUMN: Main Form Inputs */}
        <div className="w-full lg:w-2/3 space-y-6">
          
          {/* Card 1: Personal Details */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" /> Personal Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl><Input placeholder="e.g. John Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl><Input placeholder="john@novamobile.test" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl><Input placeholder="+880 1700 000000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <select className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm" {...field}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NID Number</FormLabel>
                    <FormControl><Input placeholder="National ID number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Card 2: Employment & Organization */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-3">Organization & Placement</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <select className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm" {...field}>
                        <option value="">Select Department</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role & Scope *</FormLabel>
                    <FormControl>
                      <select className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm font-medium" {...field}>
                        <option value="">Select Role</option>
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>{r.name} ({r.scope})</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch Assignment</FormLabel>
                    <FormControl>
                      <select className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm" {...field}>
                        <option value="">Global / All Branches</option>
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Type</FormLabel>
                    <FormControl>
                      <select className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm" {...field}>
                        <option value="FULL_TIME">Full-time</option>
                        <option value="PART_TIME">Part-time</option>
                        <option value="CONTRACT">Contract</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="joiningDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Joining Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reportingManagerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reporting Manager</FormLabel>
                    <FormControl>
                      <select className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm" {...field}>
                        <option value="">None / Direct to Admin</option>
                        {managers.map((m) => (
                          <option key={m.id} value={m.id}>{m.name} ({m.employeeId})</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Card 3: Compensation & Payroll Settings */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-3">Compensation & Payroll</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="basicSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Basic Salary (৳) *</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <FormControl>
                      <select className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm" {...field}>
                        <option value="BANK_TRANSFER">Bank Transfer</option>
                        <option value="CASH">Cash</option>
                        <option value="MOBILE_BANKING">Mobile Banking</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bankAccountNo"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Bank Account / Mobile Wallet Number</FormLabel>
                    <FormControl><Input placeholder="Account details" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-3">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-slate-700">Allowances Breakdown</span>
                <button
                  type="button"
                  onClick={() => appendAllowance({ name: "", amount: 0 })}
                  className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Allowance
                </button>
              </div>

              <div className="space-y-2">
                {allowanceFields.map((field, idx) => (
                  <div key={field.id} className="flex items-center gap-3">
                    <Input
                      placeholder="Allowance Name (e.g. Transport, Food)"
                      {...form.register(`allowances.${idx}.name` as const)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Amount (৳)"
                      {...form.register(`allowances.${idx}.amount` as const)}
                      className="w-36"
                    />
                    <button
                      type="button"
                      onClick={() => removeAllowance(idx)}
                      className="p-2 text-slate-400 hover:text-red-500 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 4: Access & Password */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-600" /> Account Security & Password
            </h3>

            <FormField
              control={form.control}
              name="tempPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isEdit ? "Set New Password (Leave empty to keep current)" : "Temporary Password *"}</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="Enter temporary password..." {...field} />
                    </FormControl>
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm flex items-center gap-2 shrink-0"
                    >
                      <RefreshCw className="w-4 h-4" /> Generate
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

        </div>

        {/* RIGHT COLUMN: Sticky Sidebar */}
        <div className="w-full lg:w-1/3 space-y-6 lg:sticky lg:top-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
            <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-3">Status</h3>
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="space-y-2">
                      <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${field.value === 'ACTIVE' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <input type="radio" value="ACTIVE" checked={field.value === 'ACTIVE'} onChange={() => field.onChange('ACTIVE')} className="text-emerald-600 w-4 h-4" />
                        <div>
                          <p className="font-semibold text-sm text-slate-800">Active</p>
                          <p className="text-xs text-slate-500">Currently active on platform</p>
                        </div>
                      </label>
                      <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${field.value === 'ON_LEAVE' ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <input type="radio" value="ON_LEAVE" checked={field.value === 'ON_LEAVE'} onChange={() => field.onChange('ON_LEAVE')} className="text-amber-600 w-4 h-4" />
                        <div>
                          <p className="font-semibold text-sm text-slate-800">On Leave</p>
                          <p className="text-xs text-slate-500">Temporarily inactive</p>
                        </div>
                      </label>
                      <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${field.value === 'INACTIVE' ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <input type="radio" value="INACTIVE" checked={field.value === 'INACTIVE'} onChange={() => field.onChange('INACTIVE')} className="text-red-600 w-4 h-4" />
                        <div>
                          <p className="font-semibold text-sm text-slate-800">Inactive</p>
                          <p className="text-xs text-slate-500">Disabled / Resigned</p>
                        </div>
                      </label>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2 pt-2">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                <Check className="w-4 h-4" /> {isEdit ? "Update Employee" : "Save Employee"}
              </button>
              <button 
                type="button" 
                onClick={() => router.push("/admin/hrm/employees")}
                className="w-full flex items-center justify-center px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

      </form>
    </Form>
  );
}
