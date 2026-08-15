"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { Input } from "@/components/ui/input";
import { Save, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function CreateAdPage() {
  const router = useRouter();
  const { setTitle, setBadge, setDateFilter } = useAdminPage();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    placement: "Homepage Sidebar",
    linkUrl: "",
    alwaysShow: true,
    startDate: "",
    endDate: "",
    status: "Active"
  });

  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    setTitle("Create Ad");
    setBadge("Marketing");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = () => {
    toast.success("Ad created successfully!");
    router.push("/admin/marketing/ads");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto">
      
      {/* LEFT CONTENT */}
      <div className="flex-1 space-y-6">
        
        {/* Ad Creative */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-800">Ad Creative</h2>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Ad Image *</label>
            {imagePreview ? (
              <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-200 group">
                <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => setImagePreview("")}
                    className="px-4 py-2 bg-white text-slate-800 rounded-lg text-sm font-medium hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  >
                    Remove Image
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500 font-medium">Click to upload image</p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF up to 5MB</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Title</label>
            <Input 
              placeholder="e.g. Flash Sale" 
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Description (Optional)</label>
            <textarea 
              className="w-full min-h-[80px] p-3 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow resize-y"
              placeholder="Ad copy..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        {/* Targeting */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-800">Targeting</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Placement *</label>
              <select 
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500"
                value={formData.placement}
                onChange={e => setFormData({ ...formData, placement: e.target.value })}
              >
                <option value="Homepage Sidebar">Homepage Sidebar</option>
                <option value="Category Page Top">Category Page Top</option>
                <option value="Popup on Load">Popup on Load</option>
                <option value="Footer Strip">Footer Strip</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Link URL *</label>
              <Input 
                placeholder="https://..." 
                value={formData.linkUrl}
                onChange={e => setFormData({ ...formData, linkUrl: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Schedule</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                checked={formData.alwaysShow}
                onChange={e => setFormData({ ...formData, alwaysShow: e.target.checked })}
              />
              <span className="text-sm font-medium text-slate-700">Always show</span>
            </label>
          </div>
          
          {!formData.alwaysShow && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Start Date</label>
                <Input 
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">End Date</label>
                <Input 
                  type="date"
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

      </div>

      {/* RIGHT STICKY SIDEBAR */}
      <div className="w-full md:w-80 shrink-0 space-y-6">
        <div className="sticky top-24 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Status</label>
            <select 
              className="w-full h-10 px-3 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <button 
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm shadow-sm"
          >
            <Save className="w-4 h-4" /> Save Ad
          </button>

          <button 
            onClick={() => router.back()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Cancel
          </button>

        </div>
      </div>

    </div>
  );
}
