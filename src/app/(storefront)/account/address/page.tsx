"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { MapPin, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const mockAddresses = [
  { id: 1, name: "John Doe", phone: "01711223344", address: "House 12, Road 5, Block C, Banani", city: "Dhaka", zip: "1213", tag: "Home", isDefault: true },
];

const addressSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  phone: z.string().min(11, "Valid phone number required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().min(5, "Full address is required"),
  tag: z.enum(["Home", "Office", "Other"]),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export default function AddressPage() {
  const [activeTag, setActiveTag] = useState<"Home" | "Office" | "Other">("Home");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { tag: "Home" }
  });

  const onSubmit = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    toast.success("Address saved successfully!");
  };

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Manage Address <span className="text-slate-300 mx-2">/</span> <span className="text-slate-500 text-lg">Add New Address</span>
        </h1>
      </div>

      {/* Existing Addresses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {mockAddresses.map((addr) => (
          <div key={addr.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm relative group hover:border-primary/50 transition-colors">
            {addr.isDefault && (
              <span className="absolute top-4 right-4 text-[10px] font-bold tracking-wider uppercase text-primary bg-primary/10 px-2 py-1 rounded-full">Default</span>
            )}
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-900">{addr.tag}</span>
            </div>
            <div className="text-sm text-slate-600 space-y-1 mb-4 ml-6">
              <p className="font-medium text-slate-900">{addr.name}</p>
              <p>{addr.address}</p>
              <p>{addr.city}, {addr.zip}</p>
              <p className="pt-1">{addr.phone}</p>
            </div>
            <div className="flex items-center gap-2 ml-6">
              <Button variant="outline" size="sm" className="h-8 text-xs font-medium border-slate-200">
                <Edit className="w-3 h-3 mr-1.5" /> Edit
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs font-medium border-slate-200 text-danger hover:text-danger hover:bg-danger/5">
                <Trash2 className="w-3 h-3 mr-1.5" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Add New Address</h3>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                placeholder="Receiver name"
                className={errors.fullName ? "border-danger focus-visible:ring-danger" : ""}
                {...register("fullName")} 
              />
              {errors.fullName && <p className="text-xs text-danger mt-1">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                placeholder="Receiver phone"
                className={errors.phone ? "border-danger focus-visible:ring-danger" : ""}
                {...register("phone")} 
              />
              {errors.phone && <p className="text-xs text-danger mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email <span className="text-slate-400 font-normal">(Optional)</span></Label>
            <Input 
              id="email" 
              type="email"
              placeholder="For order updates"
              className={errors.email ? "border-danger focus-visible:ring-danger" : ""}
              {...register("email")} 
            />
            {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Full Address</Label>
            <Textarea 
              id="address" 
              placeholder="House, Road, Block, Area, City"
              className={`min-h-[100px] resize-none ${errors.address ? "border-danger focus-visible:ring-danger" : ""}`}
              {...register("address")} 
            />
            {errors.address && <p className="text-xs text-danger mt-1">{errors.address.message}</p>}
          </div>

          <div className="space-y-3">
            <Label>Address Tag</Label>
            <div className="flex flex-wrap gap-3">
              {(["Home", "Office", "Other"] as const).map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setActiveTag(tag);
                    setValue("tag", tag);
                  }}
                  className={`px-6 py-2 rounded-full border text-sm font-medium transition-all ${
                    activeTag === tag
                      ? 'border-primary bg-primary text-white' 
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-6">
            <Button type="submit" className="w-full sm:w-auto px-8" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save And Update"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
