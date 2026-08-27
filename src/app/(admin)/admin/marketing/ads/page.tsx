"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { DataTable, StatusBadge } from "@/components/admin/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiGet, apiPost, apiPatch, apiDelete, getImageUrl } from "@/lib/api-client";

export interface AdRecord {
  id: string;
  title: string;
  placement: "HOME_BANNER" | "HOME_SIDEBAR" | "PRODUCT_PAGE" | "POPUP";
  imageUrl: string;
  linkUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  impressions: number;
  clicks: number;
  status: "ACTIVE" | "INACTIVE" | "SCHEDULED" | "EXPIRED";
}

export default function AdsPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [data, setData] = useState<AdRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newAd, setNewAd] = useState({
    title: "",
    placement: "HOME_SIDEBAR" as "HOME_BANNER" | "HOME_SIDEBAR" | "PRODUCT_PAGE" | "POPUP",
    imageUrl: "",
    linkUrl: "",
    startDate: "",
    endDate: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
  });

  const fetchAds = async () => {
    setIsLoading(true);
    try {
      const res = await apiGet<AdRecord[]>("/ads");
      setData(res || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load ads");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setTitle("Ads");
    setBadge("Marketing");
    setDateFilter("");
    fetchAds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;
    try {
      await apiDelete(`/ads/${id}`);
      toast.success("Ad deleted");
      fetchAds();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete ad");
    }
  };

  const handleToggleStatus = async (ad: AdRecord) => {
    const nextStatus = ad.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await apiPatch(`/ads/${ad.id}`, { status: nextStatus });
      toast.success(`Ad is now ${nextStatus.toLowerCase()}`);
      setData(data.map((a) => (a.id === ad.id ? { ...a, status: nextStatus } : a)));
    } catch (err: any) {
      toast.error(err.message || "Failed to update ad status");
    }
  };

  const handleAddAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAd.title.trim() || !newAd.imageUrl.trim()) {
      toast.error("Please enter a title and image URL.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiPost("/ads", {
        title: newAd.title.trim(),
        placement: newAd.placement,
        imageUrl: newAd.imageUrl.trim(),
        linkUrl: newAd.linkUrl.trim() || undefined,
        startDate: newAd.startDate ? new Date(newAd.startDate).toISOString() : undefined,
        endDate: newAd.endDate ? new Date(newAd.endDate).toISOString() : undefined,
        status: newAd.status,
      });
      toast.success("Ad campaign created successfully!");
      setIsAddDialogOpen(false);
      setNewAd({
        title: "",
        placement: "HOME_SIDEBAR",
        imageUrl: "",
        linkUrl: "",
        startDate: "",
        endDate: "",
        status: "ACTIVE",
      });
      fetchAds();
    } catch (err: any) {
      toast.error(err.message || "Failed to create ad");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<AdRecord>[] = [
    {
      accessorKey: "imageUrl",
      header: "Thumbnail",
      cell: ({ row }) => (
        <div className="w-16 h-10 rounded overflow-hidden relative border border-slate-200 bg-slate-50 flex items-center justify-center">
          {row.original.imageUrl ? (
            <img src={getImageUrl(row.original.imageUrl)} alt={row.original.title} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-4 h-4 text-slate-400" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => <span className="font-bold text-slate-800">{row.original.title}</span>,
    },
    {
      accessorKey: "placement",
      header: "Placement",
      cell: ({ row }) => (
        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
          {row.original.placement}
        </span>
      ),
    },
    {
      accessorKey: "linkUrl",
      header: "Link URL",
      cell: ({ row }) => <span className="text-slate-500 truncate max-w-[150px] block text-xs">{row.original.linkUrl || "—"}</span>,
    },
    {
      accessorKey: "impressions",
      header: "Impressions",
      cell: ({ row }) => <span className="text-slate-700 text-xs font-semibold">{row.original.impressions.toLocaleString()}</span>,
    },
    {
      accessorKey: "clicks",
      header: "Clicks",
      cell: ({ row }) => <span className="text-slate-700 text-xs font-semibold">{row.original.clicks.toLocaleString()}</span>,
    },
    {
      id: "ctr",
      header: "CTR",
      cell: ({ row }) => {
        const { impressions, clicks } = row.original;
        const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : "0.00";
        return <span className="text-xs font-bold text-emerald-600">{ctr}%</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status;
        const type = s === "ACTIVE" ? "success" : s === "SCHEDULED" ? "info" : s === "EXPIRED" ? "neutral" : "warning";
        return <StatusBadge status={s} type={type as any} />;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleStatus(row.original)}
            className="text-xs text-slate-600"
          >
            {row.original.status === "ACTIVE" ? "Pause" : "Activate"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(row.original.id)}
            className="text-slate-400 hover:text-danger"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-800">Advertisement Campaigns</h2>
          <p className="text-xs text-slate-500">Track and manage on-site promotional banners and sidebar ads</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs">
          <Plus className="w-4 h-4 mr-1.5" /> Create New Ad
        </Button>
      </div>

      <div className="bg-white border rounded-xl shadow-sm">
        <DataTable columns={columns} data={data} isLoading={isLoading} />
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Ad Campaign</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddAd} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Campaign Title *</label>
              <Input
                placeholder="e.g. Winter Battery Replacement Promo"
                value={newAd.title}
                onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Ad Placement *</label>
              <Select value={newAd.placement} onValueChange={(val: any) => setNewAd({ ...newAd, placement: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOME_BANNER">Home Banner</SelectItem>
                  <SelectItem value="HOME_SIDEBAR">Home Sidebar</SelectItem>
                  <SelectItem value="PRODUCT_PAGE">Product Detail Page</SelectItem>
                  <SelectItem value="POPUP">Popup Modal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Image URL *</label>
              <Input
                placeholder="https://... or /uploads/..."
                value={newAd.imageUrl}
                onChange={(e) => setNewAd({ ...newAd, imageUrl: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Destination Link URL</label>
              <Input
                placeholder="e.g. /category/batteries"
                value={newAd.linkUrl}
                onChange={(e) => setNewAd({ ...newAd, linkUrl: e.target.value })}
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Ad"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
