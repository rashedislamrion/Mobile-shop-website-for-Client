"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { Plus, ArrowUp, ArrowDown, Trash2, Loader2, Image as ImageIcon, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiGet, apiPost, apiPatch, apiDelete, getImageUrl } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";

export interface BannerRecord {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  position: number;
  status: "ACTIVE" | "INACTIVE";
}

export default function BannersPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [banners, setBanners] = useState<BannerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newBanner, setNewBanner] = useState({
    title: "",
    subtitle: "",
    linkUrl: "",
    imageUrl: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
  });

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const data = await apiGet<BannerRecord[]>("/banners");
      setBanners(data || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load banners");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setTitle("Promotional Banners");
    setBadge("Marketing");
    setDateFilter("");
    fetchBanners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const newBanners = [...banners];
    const temp = newBanners[index];
    newBanners[index] = newBanners[targetIndex];
    newBanners[targetIndex] = temp;

    const bannerIds = newBanners.map((b) => b.id);
    setBanners(newBanners);

    try {
      await apiPatch("/banners/reorder", { bannerIds });
      toast.success("Banner reordered");
    } catch (err: any) {
      toast.error(err.message || "Failed to reorder");
      fetchBanners();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      await apiDelete(`/banners/${id}`);
      toast.success("Banner deleted successfully");
      fetchBanners();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete banner");
    }
  };

  const handleToggleStatus = async (banner: BannerRecord) => {
    const nextStatus = banner.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await apiPatch(`/banners/${banner.id}`, { status: nextStatus });
      toast.success(`Banner is now ${nextStatus.toLowerCase()}`);
      setBanners(banners.map((b) => (b.id === banner.id ? { ...b, status: nextStatus } : b)));
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBanner.title.trim() || !newBanner.imageUrl.trim()) {
      toast.error("Please enter a title and image URL.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiPost("/banners", {
        title: newBanner.title.trim(),
        subtitle: newBanner.subtitle.trim() || undefined,
        imageUrl: newBanner.imageUrl.trim(),
        linkUrl: newBanner.linkUrl.trim() || undefined,
        status: newBanner.status,
      });
      toast.success("Banner added successfully!");
      setIsAddDialogOpen(false);
      setNewBanner({
        title: "",
        subtitle: "",
        linkUrl: "",
        imageUrl: "",
        status: "ACTIVE",
      });
      fetchBanners();
    } catch (err: any) {
      toast.error(err.message || "Failed to create banner");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-800">Banner Slider Manager</h2>
          <p className="text-xs text-slate-500">Configure homepage carousel slides and promotional banners</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs">
          <Plus className="w-4 h-4 mr-1.5" /> Add New Banner
        </Button>
      </div>

      {/* Banner List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-16 bg-white border rounded-2xl p-8">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-bold">No Banners Found</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">Add your first promotional hero slide.</p>
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
            Add Banner
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white border rounded-2xl shadow-sm gap-4 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleMove(index, "up")}
                    disabled={index === 0}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMove(index, "down")}
                    disabled={index === banners.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-32 h-18 rounded-xl bg-slate-100 border overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <img
                    src={getImageUrl(banner.imageUrl)}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-400">#{index + 1}</span>
                    <h3 className="font-bold text-sm text-slate-900">{banner.title}</h3>
                    <Badge className={banner.status === "ACTIVE" ? "bg-emerald-600 text-white text-[10px]" : "bg-slate-400 text-white text-[10px]"}>
                      {banner.status}
                    </Badge>
                  </div>
                  {banner.subtitle && <p className="text-xs text-slate-500">{banner.subtitle}</p>}
                  {banner.linkUrl && (
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> {banner.linkUrl}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleStatus(banner)}
                  className="text-xs font-semibold"
                >
                  {banner.status === "ACTIVE" ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(banner.id)}
                  className="text-slate-400 hover:text-danger hover:bg-danger/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Banner Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Promotional Banner</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddBanner} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Banner Title *</label>
              <Input
                placeholder="e.g. Mega Smartphone Display Sale"
                value={newBanner.title}
                onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Subtitle / Tagline (Optional)</label>
              <Input
                placeholder="e.g. Up to 40% off genuine AMOLED displays"
                value={newBanner.subtitle}
                onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Image URL *</label>
              <Input
                placeholder="https://images.unsplash.com/... or /uploads/..."
                value={newBanner.imageUrl}
                onChange={(e) => setNewBanner({ ...newBanner, imageUrl: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Target Link URL (Optional)</label>
              <Input
                placeholder="e.g. /category/displays or /product/iphone-14-display"
                value={newBanner.linkUrl}
                onChange={(e) => setNewBanner({ ...newBanner, linkUrl: e.target.value })}
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Banner"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
