"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { 
  Check, User, Upload, RefreshCw, Key, Trash2, Plus
} from "lucide-react";
import { Employee } from "@/lib/mock-data/hrm/employees";
import { mockDepartments } from "@/lib/mock-data/hrm/departments";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email(),
  phone: z.string().min(10, "Phone is required"),
  gender: z.enum(["Male", "Female", "Other"]),
  dob: z.string(),
  nid: z.string().optional(),
  
  department: z.string().min(1, "Department is required"),
  role: z.string().min(1, "Role is required"),
  branch: z.string().min(1, "Branch is required"),
  joiningDate: z.string(),
  employmentType: z.enum(["Full-time", "Part-time", "Contract"]),
  reportingManager: z.string().optional(),
  
  basicSalary: z.coerce.number().min(0),
  allowances: z.array(z.object({
    name: z.string().min(1, "Name is required"),
    amount: z.coerce.number().min(0),
  })),
  paymentMethod: z.enum(["Bank Transfer", "Cash", "Mobile Banking"]),
  bankAccountNo: z.string().optional(),
  
  loginEmail: z.string().email().optional(),
  tempPassword: z.string().optional(),
  
  status: z.enum(["Active", "Inactive", "On Leave"]),
});

type EmployeeFormValues = z.infer<typeof formSchema>;

interface EmployeeFormProps {
  initialData?: Employee | null;
  isEdit?: boolean;
}

export function EmployeeForm({ initialData, isEdit }: EmployeeFormProps) {
  const router = useRouter();
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.avatar || null);
  
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      gender: "Male",
      dob: "1995-01-01",
      nid: "",
      department: initialData?.department || "",
      role: initialData?.role || "",
      branch: initialData?.branch || "",
      joiningDate: initialData?.joiningDate || new Date().toISOString().split('T')[0],
      employmentType: "Full-time",
      reportingManager: "",
      basicSalary: 30000,
      allowances: [{ name: "Transport", amount: 2000 }],
      paymentMethod: "Bank Transfer",
      bankAccountNo: "",
      loginEmail: initialData?.email || "",
      tempPassword: "",
      status: initialData?.status || "Active",
    },
  });

  const { fields: allowanceFields, append: appendAllowance, remove: removeAllowance } = useFieldArray({
    name: "allowances",
    control: form.control,
  });

  const watchRole = form.watch("role");
  const watchPaymentMethod = form.watch("paymentMethod");
  
  const isGlobalRole = ["Admin", "SEO", "Product Uploader", "Purchase Manager"].includes(watchRole);

  const onSubmit = (data: EmployeeFormValues) => {
    console.log("Saving employee...", data);
    toast.success(`Employee ${isEdit ? "updated" : "created"} successfully!`);
    router.push("/admin/hrm/employees");
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setValue("tempPassword", password);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-6 relative items-start">
        
        {/* LEFT COLUMN: Main Form Sections */}
        <div className="w-full lg:w-2/3 space-y-6">
          
          {/* Personal Information */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-semibold text-slate-800 text-lg mb-4 pb-2 border-b border-slate-100">Personal Information</h3>
            
            <div className="flex items-center gap-6 mb-6">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 flex flex-col items-center justify-center bg-slate-50 text-slate-400 overflow-hidden relative group cursor-pointer">
                {photoPreview ? (
                  <Image src={photoPreview} alt="Preview" fill className="object-cover" />
                ) : (
                  <>
                    <User className="w-8 h-8 mb-1 opacity-50" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Photo</span>
                  </>
                )}
                <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handlePhotoUpload} />
              </div>
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal Email *</FormLabel>
                    <FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl>
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
                    <FormControl><Input placeholder="+880..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender *</FormLabel>
                    <FormControl>
                      <select className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" {...field}>
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
                    <FormLabel>Date of Birth *</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nid"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>NID / Passport Number</FormLabel>
                    <FormControl><Input placeholder="National ID or Passport number..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Employment Details */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-semibold text-slate-800 text-lg mb-4 pb-2 border-b border-slate-100">Employment Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium leading-none mb-2 block">Employee ID</label>
                <div className="h-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-500 font-mono font-semibold flex items-center cursor-not-allowed">
                  {initialData?.employeeId || "EMP-AUTO-GENERATED"}
                </div>
                <p className="text-xs text-slate-400 mt-1">Automatically assigned upon saving.</p>
              </div>

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department *</FormLabel>
                    <FormControl>
                      <select className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" {...field}>
                        <option value="">Select department...</option>
                        {mockDepartments.map(d => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role *</FormLabel>
                    <FormControl>
                      <select className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" {...field}>
                        <option value="">Select role...</option>
                        <option value="Admin">Admin</option>
                        <option value="Branch Admin">Branch Admin</option>
                        <option value="Branch Manager">Branch Manager</option>
                        <option value="Salesperson">Salesperson</option>
                        <option value="Purchase Manager">Purchase Manager</option>
                        <option value="Product Uploader">Product Uploader</option>
                        <option value="Customer Service">Customer Service</option>
                        <option value="Technician">Technician</option>
                        <option value="SEO">SEO</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch Assignment *</FormLabel>
                    <FormControl>
                      <select 
                        className={`w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${isGlobalRole ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`} 
                        {...field}
                        disabled={isGlobalRole}
                        value={isGlobalRole ? "Global" : field.value}
                      >
                        <option value="">Select branch...</option>
                        <option value="Global">Global</option>
                        <option value="Dhaka Main Branch">Dhaka Main Branch</option>
                        <option value="Chattogram Branch">Chattogram Branch</option>
                        <option value="Central Warehouse">Central Warehouse</option>
                      </select>
                    </FormControl>
                    {isGlobalRole && <p className="text-xs text-blue-600 font-medium mt-1">This role has global access across all branches.</p>}
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
                      <select className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" {...field}>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
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
                    <FormLabel>Joining Date *</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reportingManager"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reporting Manager</FormLabel>
                    <FormControl>
                      <select className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" {...field}>
                        <option value="">None (Top Level)</option>
                        <option value="emp-1">System Admin (Admin)</option>
                        <option value="emp-2">Rahim Uddin (Branch Manager)</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Salary Information */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-semibold text-slate-800 text-lg mb-4 pb-2 border-b border-slate-100">Salary Information</h3>
            
            <FormField
              control={form.control}
              name="basicSalary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Basic Salary (Monthly) *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">৳</span>
                      <Input type="number" className="pl-8" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Allowances (Optional)</FormLabel>
              <div className="space-y-3 mt-2">
                {allowanceFields.map((field, index) => (
                  <div key={field.id} className="flex gap-3">
                    <FormField
                      control={form.control}
                      name={`allowances.${index}.name`}
                      render={({ field: nameField }) => (
                        <FormItem className="flex-1 space-y-0">
                          <FormControl>
                            <Input placeholder="e.g. Transport Allowance" {...nameField} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`allowances.${index}.amount`}
                      render={({ field: valField }) => (
                        <FormItem className="w-40 space-y-0">
                          <FormControl>
                            <Input type="number" placeholder="Amount (৳)" {...valField} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => removeAllowance(index)}
                      className="w-10 h-10 shrink-0 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-md transition-colors border border-transparent hover:border-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => appendAllowance({ name: "", amount: 0 })}
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-2"
                >
                  <Plus className="w-4 h-4" /> Add Allowance
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method *</FormLabel>
                    <FormControl>
                      <select className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" {...field}>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cash">Cash</option>
                        <option value="Mobile Banking">Mobile Banking</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {watchPaymentMethod === "Bank Transfer" && (
                <FormField
                  control={form.control}
                  name="bankAccountNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Account Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter account number..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>

          {/* Account Access */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <details className="group" open={!isEdit}>
              <summary className="font-semibold text-slate-800 text-lg p-6 flex justify-between items-center cursor-pointer list-none bg-slate-50/50 hover:bg-slate-50">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-emerald-600" />
                  Account Access & Login
                </div>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24" className="w-5 h-5 text-slate-400"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="p-6 pt-0 border-t border-slate-100 space-y-4 bg-white mt-4">
                <FormField
                  control={form.control}
                  name="loginEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Login Email (Defaults to personal email)</FormLabel>
                      <FormControl><Input type="email" placeholder="login@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tempPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temporary Password</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input placeholder="Enter or generate..." {...field} />
                        </FormControl>
                        <button
                          type="button"
                          onClick={generatePassword}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm flex items-center gap-2 transition-colors shrink-0"
                        >
                          <RefreshCw className="w-4 h-4" /> Generate
                        </button>
                      </div>
                      <p className="text-xs text-amber-600 font-medium mt-1">Note: Employee will be required to change password on first login.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </details>
          </div>

        </div>

        {/* RIGHT COLUMN: Sticky Publish sidebar */}
        <div className="w-full lg:w-1/3 space-y-6 lg:sticky lg:top-6">
          
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
            <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-3">Status</h3>
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base mb-3 block">Employment Status</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${field.value === 'Active' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <input type="radio" value="Active" checked={field.value === 'Active'} onChange={field.onChange} className="text-emerald-600 w-4 h-4" />
                        <div>
                          <p className="font-semibold text-sm text-slate-800">Active</p>
                          <p className="text-xs text-slate-500">Currently employed and working.</p>
                        </div>
                      </label>
                      <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${field.value === 'On Leave' ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <input type="radio" value="On Leave" checked={field.value === 'On Leave'} onChange={field.onChange} className="text-amber-600 w-4 h-4" />
                        <div>
                          <p className="font-semibold text-sm text-slate-800">On Leave</p>
                          <p className="text-xs text-slate-500">Temporarily inactive (vacation/sick).</p>
                        </div>
                      </label>
                      <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${field.value === 'Inactive' ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <input type="radio" value="Inactive" checked={field.value === 'Inactive'} onChange={field.onChange} className="text-red-600 w-4 h-4" />
                        <div>
                          <p className="font-semibold text-sm text-slate-800">Inactive</p>
                          <p className="text-xs text-slate-500">Terminated or resigned.</p>
                        </div>
                      </label>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2 pt-2">
              <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors">
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
