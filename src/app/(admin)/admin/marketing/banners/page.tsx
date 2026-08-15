"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { mockBanners, BannerRecord } from "@/lib/mock-data/marketing/banners";
import { Plus, GripVertical, Image as ImageIcon, Link, ArrowUp, ArrowDown, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/admin/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export default function BannersPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  
  // Sort banners by position initially
  const [banners, setBanners] = useState<BannerRecord[]>([...mockBanners].sort((a, b) => a.position - b.position));
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const [newBanner, setNewBanner] = useState({
    title: "",
    linkUrl: "",
    status: "Active" as const,
    imageFile: null as File | null,
    previewUrl: ""
  });

  useEffect(() => {
    setTitle("Promotional Banners");
    setBadge("Marketing");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newBanners = [...banners];
    const temp = newBanners[index];
    newBanners[index] = newBanners[index - 1];
    newBanners[index - 1] = temp;
    
    // Update positions
    newBanners.forEach((b, i) => b.position = i + 1);
    setBanners(newBanners);
    toast.success("Banner moved up");
  };

  const handleMoveDown = (index: number) => {
    if (index === banners.length - 1) return;
    const newBanners = [...banners];
    const temp = newBanners[index];
    newBanners[index] = newBanners[index + 1];
    newBanners[index + 1] = temp;
    
    // Update positions
    newBanners.forEach((b, i) => b.position = i + 1);
    setBanners(newBanners);
    toast.success("Banner moved down");
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this banner?")) {
      const filtered = banners.filter(b => b.id !== id);
      filtered.forEach((b, i) => b.position = i + 1);
      setBanners(filtered);
      toast.success("Banner deleted");
    }
  };

  const handleToggleStatus = (id: string) => {
    setBanners(banners.map(b => b.id === id ? { ...b, status: b.status === "Active" ? "Inactive" : "Active" } : b));
    toast.success("Status updated");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewBanner({
        ...newBanner,
        imageFile: file,
        previewUrl: URL.createObjectURL(file)
      });
    }
  };

  const handleAddBanner = () => {
    if (!newBanner.imageFile && !newBanner.previewUrl) {
      toast.error("Please select an image");
      return;
    }
    
    const banner: BannerRecord = {
      id: `bn-${Date.now()}`,
      image: newBanner.previewUrl || "https://placehold.co/1600x600/f1f5f9/94a3b8?text=New+Banner",
      title: newBanner.title || "Untitled Banner",
      linkUrl: newBanner.linkUrl || "/",
      position: banners.length + 1,
      status: newBanner.status
    };

    setBanners([...banners, banner]);
    setNewBanner({ title: "", linkUrl: "", status: "Active", imageFile: null, previewUrl: "" });
    setIsAddDialogOpen(false);
    toast.success("Banner added successfully");
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center">
        <p className="text-slate-500 text-sm">Drag or use arrows to reorder homepage slider banners.</p>
        <button 
          onClick={() => setIsAddDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Add Banner
        </button>
      </div>

      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div className="space-y-3">
          {banners.map((banner, index) => (
            <div key={banner.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 group transition-all hover:border-emerald-200 hover:shadow-md">
              
              {/* Drag Handle & Order */}
              <div className="flex flex-col items-center gap-1 shrink-0 px-2 border-r border-slate-100 pr-4">
                <button 
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="p-1 text-slate-300 hover:text-emerald-600 disabled:opacity-30 disabled:hover:text-slate-300 transition-colors"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                  {banner.position}
                </div>
                <button 
                  onClick={() => handleMoveDown(index)}
                  disabled={index === banners.length - 1}
                  className="p-1 text-slate-300 hover:text-emerald-600 disabled:opacity-30 disabled:hover:text-slate-300 transition-colors"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>

              {/* Image Thumbnail */}
              <div className="w-48 h-16 shrink-0 rounded-lg overflow-hidden relative border border-slate-100 bg-slate-50">
                <Image src={banner.image} alt={banner.title} fill className="object-cover" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-800 truncate">{banner.title}</h4>
                <div className="flex items-center gap-1 mt-1 text-xs text-slate-500 truncate">
                  <Link className="w-3 h-3 shrink-0" />
                  <span className="truncate">{banner.linkUrl}</span>
                </div>
              </div>

              {/* Status */}
              <div className="shrink-0 w-32 flex justify-center">
                <button onClick={() => handleToggleStatus(banner.id)} className="transition-opacity hover:opacity-80">
                  <StatusBadge status={banner.status} type={banner.status === "Active" ? "success" : "warning"} />
                </button>
              </div>

              {/* Actions */}
              <div className="shrink-0 flex items-center gap-2 pl-4 border-l border-slate-100">
                <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(banner.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}

          {banners.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p>No banners found. Add one to show on the homepage.</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Promotional Banner</DialogTitle>
          </DialogHeader>
          <div className="pt-4 space-y-5">
            
            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex justify-between">
                Banner Image *
                <span className="text-slate-400 font-normal">Recommended: 1600x600px</span>
              </label>
              
              {newBanner.previewUrl ? (
                <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200 group">
                  <Image src={newBanner.previewUrl} alt="Preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => setNewBanner({ ...newBanner, previewUrl: "", imageFile: null })}
                      className="px-4 py-2 bg-white text-slate-800 rounded-lg text-sm font-medium hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      Remove Image
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-500 font-medium">Click to upload image</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Title (Optional Overlay Text)</label>
              <Input 
                placeholder="e.g. Summer Sale 2026" 
                value={newBanner.title}
                onChange={e => setNewBanner({ ...newBanner, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Link URL</label>
              <Input 
                placeholder="e.g. /category/smartphones" 
                value={newBanner.linkUrl}
                onChange={e => setNewBanner({ ...newBanner, linkUrl: e.target.value })}
              />
            </div>
            
            <div className="flex items-center gap-3 pt-2">
              <label className="text-sm font-semibold text-slate-700">Status:</label>
              <select 
                className="h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500"
                value={newBanner.status}
                onChange={e => setNewBanner({ ...newBanner, status: e.target.value as "Active" | "Inactive" })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                onClick={() => setIsAddDialogOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-medium rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddBanner}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm"
              >
                Add Banner
              </button>
            </div>

          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
