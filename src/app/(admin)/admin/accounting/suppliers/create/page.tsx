"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import Image from "next/image";

export default function CreateSupplierPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const router = useRouter();

  const [formData, setFormData] = useState({
    supplierName: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    paymentTerms: "Cash on Delivery",
    status: "Active",
    logoPreview: ""
  });

  useEffect(() => {
    setTitle("Add New Supplier");
    setBadge("Accounting");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setFormData({ ...formData, logoPreview: url });
    }
  };

  const handleSave = () => {
    if (!formData.supplierName || !formData.phone) {
      toast.error("Please fill in the required fields (Name, Phone).");
      return;
    }
    toast.success("Supplier created successfully");
    router.push("/admin/accounting/suppliers");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 font-medium transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Suppliers
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* LEFT MAIN FORM */}
        <div className="flex-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-800">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2 col-span-2 md:col-span-1">
                <label className="text-sm font-semibold text-slate-700">Company / Supplier Name *</label>
                <Input 
                  placeholder="e.g. Apple Distributors BD" 
                  value={formData.supplierName}
                  onChange={e => setFormData({ ...formData, supplierName: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2 md:col-span-1">
                <label className="text-sm font-semibold text-slate-700">Contact Person</label>
                <Input 
                  placeholder="e.g. Mr. Zaman" 
                  value={formData.contactPerson}
                  onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2 col-span-2 md:col-span-1">
                <label className="text-sm font-semibold text-slate-700">Phone Number *</label>
                <Input 
                  placeholder="+8801XXXXXXXXX" 
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2 md:col-span-1">
                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                <Input 
                  type="email"
                  placeholder="contact@company.com" 
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Full Address</label>
              <Textarea 
                placeholder="Business address" 
                className="h-24 resize-none"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* RIGHT STICKY SIDEBAR */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-6 sticky top-[100px]">
          
          {/* Logo Upload */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Supplier Logo</h3>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors relative cursor-pointer overflow-hidden group">
              <input 
                type="file" 
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleImageUpload}
              />
              {formData.logoPreview ? (
                <div className="relative w-24 h-24 mx-auto">
                  <Image src={formData.logoPreview} alt="Logo preview" fill className="object-contain" />
                </div>
              ) : (
                <div className="py-4">
                  <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                  <span className="text-xs font-medium text-slate-500">Click to upload logo</span>
                </div>
              )}
            </div>
          </div>

          {/* Settings & Save */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-800">Settings</h3>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Payment Terms</label>
              <select 
                className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                value={formData.paymentTerms}
                onChange={e => setFormData({ ...formData, paymentTerms: e.target.value })}
              >
                <option value="Cash on Delivery">Cash on Delivery</option>
                <option value="Net 15">Net 15 Days</option>
                <option value="Net 30">Net 30 Days</option>
                <option value="Net 60">Net 60 Days</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div className="space-y-0.5">
                <label className="text-sm font-semibold text-slate-800">Active Status</label>
                <p className="text-[11px] text-slate-500">Enable/disable supplier</p>
              </div>
              <Switch 
                checked={formData.status === "Active"}
                onCheckedChange={checked => setFormData({ ...formData, status: checked ? "Active" : "Inactive" })}
              />
            </div>

            <button 
              onClick={handleSave}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm shadow-emerald-200 hover:shadow-md hover:shadow-emerald-200"
            >
              <Save className="w-4 h-4" />
              Save Supplier
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
