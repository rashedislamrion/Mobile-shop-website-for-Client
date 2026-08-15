"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { 
  Check, MapPin, ChevronDown 
} from "lucide-react";
import { Branch } from "@/lib/mock-data/branches";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  name: z.string().min(2, "Branch name is required"),
  code: z.string().min(2, "Branch code is required"),
  type: z.enum(["Flagship Store", "Outlet", "Warehouse-only"]),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  contactNumber: z.string().min(5, "Contact number is required"),
  alternatePhone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  managerName: z.string().optional(),
  openingStockValue: z.coerce.number().optional(),
  vatNumber: z.string().optional(),
  status: z.enum(["Active", "Inactive"]),
  operatingHours: z.array(z.object({
    day: z.string(),
    openTime: z.string(),
    closeTime: z.string(),
    isClosed: z.boolean(),
  })),
});

type BranchFormValues = z.infer<typeof formSchema>;

interface BranchFormProps {
  initialData?: Branch | null;
  isEdit?: boolean;
}

const defaultOperatingHours = [
  { day: "Sunday", openTime: "10:00", closeTime: "20:00", isClosed: false },
  { day: "Monday", openTime: "10:00", closeTime: "20:00", isClosed: false },
  { day: "Tuesday", openTime: "10:00", closeTime: "20:00", isClosed: false },
  { day: "Wednesday", openTime: "10:00", closeTime: "20:00", isClosed: false },
  { day: "Thursday", openTime: "10:00", closeTime: "20:00", isClosed: false },
  { day: "Friday", openTime: "10:00", closeTime: "20:00", isClosed: false },
  { day: "Saturday", openTime: "10:00", closeTime: "20:00", isClosed: false },
];

export function BranchForm({ initialData, isEdit }: BranchFormProps) {
  const router = useRouter();
  
  const form = useForm<BranchFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      code: "",
      type: "Flagship Store",
      address: "",
      city: "Dhaka",
      contactNumber: "",
      alternatePhone: "",
      email: "",
      managerName: "",
      openingStockValue: 0,
      vatNumber: "",
      status: "Active",
      operatingHours: defaultOperatingHours,
    },
  });

  const { fields: hoursFields } = useFieldArray({
    name: "operatingHours",
    control: form.control,
  });

  const onSubmit = (data: BranchFormValues) => {
    console.log("Saving branch...", data);
    toast.success(`Branch ${isEdit ? "updated" : "created"} successfully!`);
    router.push("/admin/branch");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-6 relative items-start">
        
        {/* LEFT COLUMN: Main Form Sections */}
        <div className="w-full lg:w-2/3 space-y-6">
          
          {/* Basic Information */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-semibold text-slate-800 text-lg mb-4">Basic Information</h3>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Gulshan Outlet" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch Code *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. GLS-01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch Type *</FormLabel>
                    <FormControl>
                      <select 
                        {...field}
                        className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
                      >
                        <option value="Flagship Store">Flagship Store</option>
                        <option value="Outlet">Outlet</option>
                        <option value="Warehouse-only">Warehouse-only</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Address *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter full branch address..." className="resize-none h-20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City *</FormLabel>
                  <FormControl>
                    <select 
                      {...field}
                      className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="Dhaka">Dhaka</option>
                      <option value="Chattogram">Chattogram</option>
                      <option value="Sylhet">Sylhet</option>
                      <option value="Gazipur">Gazipur</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Location on Map</label>
              <div className="mt-2 h-40 bg-slate-100 border border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400">
                <MapPin className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm font-medium">Map preview placeholder</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-semibold text-slate-800 text-lg mb-4">Contact Info</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactNumber"
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
                name="alternatePhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alternate Phone (Optional)</FormLabel>
                    <FormControl><Input placeholder="+880..." {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl><Input type="email" placeholder="branch@example.com" {...field} value={field.value || ""} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Branch Manager */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-semibold text-slate-800 text-lg mb-4">Branch Manager</h3>
            <FormField
              control={form.control}
              name="managerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign Manager</FormLabel>
                  <FormControl>
                    <select 
                      {...field}
                      className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Unassigned</option>
                      <option value="Rahim Uddin">Rahim Uddin (Manager)</option>
                      <option value="Karim Hasan">Karim Hasan (Manager)</option>
                      <option value="Jashim Uddin">Jashim Uddin (Admin)</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Operating Hours */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 text-lg mb-4">Operating Hours</h3>
            
            <div className="space-y-3">
              {hoursFields.map((field, index) => {
                const isClosed = form.watch(`operatingHours.${index}.isClosed`);
                return (
                  <div key={field.id} className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <div className="w-24 shrink-0">
                      <span className="text-sm font-medium text-slate-700">{field.day}</span>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name={`operatingHours.${index}.openTime`}
                        render={({ field: timeField }) => (
                          <FormItem className="space-y-0">
                            <FormControl>
                              <Input type="time" {...timeField} disabled={isClosed} className={isClosed ? "opacity-50" : ""} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`operatingHours.${index}.closeTime`}
                        render={({ field: timeField }) => (
                          <FormItem className="space-y-0">
                            <FormControl>
                              <Input type="time" {...timeField} disabled={isClosed} className={isClosed ? "opacity-50" : ""} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name={`operatingHours.${index}.isClosed`}
                      render={({ field: switchField }) => (
                        <FormItem className="space-y-0 flex items-center gap-2 w-20 justify-end">
                          <FormControl>
                            <Switch checked={switchField.value} onCheckedChange={switchField.onChange} />
                          </FormControl>
                          <FormLabel className="!mt-0 text-xs">Closed</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Business Settings (Accordion Style) */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <details className="group">
              <summary className="font-semibold text-slate-800 text-lg p-6 flex justify-between items-center cursor-pointer list-none">
                Business Settings (Optional)
                <span className="transition group-open:rotate-180">
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                </span>
              </summary>
              <div className="p-6 pt-0 border-t border-slate-100 space-y-4">
                <FormField
                  control={form.control}
                  name="openingStockValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opening Stock Value (৳)</FormLabel>
                      <FormControl><Input type="number" {...field} value={field.value || ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vatNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax/VAT Registration Number</FormLabel>
                      <FormControl><Input placeholder="e.g. VAT-12345678" {...field} value={field.value || ""} /></FormControl>
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-4 space-y-0">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Branch Status</FormLabel>
                    <div className="text-xs text-slate-500">
                      {field.value === "Active" ? "Branch is visible and operational" : "Branch is currently closed/hidden"}
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

            <div className="flex flex-col gap-2 pt-2">
              <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors">
                <Check className="w-4 h-4" /> {isEdit ? "Update Branch" : "Save Branch"}
              </button>
              <button 
                type="button" 
                onClick={() => router.push("/admin/branch")}
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
