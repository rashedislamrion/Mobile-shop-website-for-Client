"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { apiPost } from "@/lib/api-client";

export default function CreateSupplierPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    setTitle("Add New Supplier");
    setBadge("Accounting");
    setDateFilter(""); 
  }, [setTitle, setBadge, setDateFilter]);

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error("Please fill in company name and phone number");
      return;
    }

    try {
      setIsSubmitting(true);
      await apiPost("/suppliers", {
        name: formData.name.trim(),
        contactPerson: formData.contactPerson.trim() || undefined,
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        address: formData.address.trim() || undefined,
        status: formData.status,
      });

      toast.success("Supplier registered successfully");
      router.push("/admin/accounting/suppliers");
    } catch (err: any) {
      toast.error(err.message || "Failed to create supplier");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
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
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
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
                  placeholder="+880 1700 000000" 
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
              <label className="text-sm font-semibold text-slate-700">Full Business Address</label>
              <Textarea 
                placeholder="Physical warehouse or office address..." 
                className="h-24 resize-none"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="w-full lg:w-[300px] shrink-0 space-y-6 sticky top-[100px]">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-800">Status Settings</h3>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div className="space-y-0.5">
                <label className="text-sm font-semibold text-slate-800">Active Vendor</label>
                <p className="text-[11px] text-slate-500">Enable in purchase orders</p>
              </div>
              <Switch 
                checked={formData.status === "ACTIVE"}
                onCheckedChange={checked => setFormData({ ...formData, status: checked ? "ACTIVE" : "INACTIVE" })}
              />
            </div>

            <button 
              onClick={handleSave}
              disabled={isSubmitting}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
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
