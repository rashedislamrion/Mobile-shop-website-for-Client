"use client";

import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, ExternalLink, Lock, Loader2 } from "lucide-react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { DataTable, StatusBadge } from "@/components/admin/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import { format } from "date-fns";

export interface PageRecord {
  id: string;
  title: string;
  slug: string;
  content: string;
  isSystem: boolean;
  status: "PUBLISHED" | "DRAFT";
  updatedAt: string;
}

export default function PagesManagementPage() {
  const { setTitle, setBadge } = useAdminPage();
  const [pages, setPages] = useState<PageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newPage, setNewPage] = useState({
    title: "",
    slug: "",
    content: "",
    status: "PUBLISHED" as "PUBLISHED" | "DRAFT",
  });

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const data = await apiGet<PageRecord[]>("/pages");
      setPages(data || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load CMS pages");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setTitle("Pages");
    setBadge("CMS");
    fetchPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTitleChange = (val: string) => {
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setNewPage({ ...newPage, title: val, slug: autoSlug });
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPage.title.trim() || !newPage.content.trim()) {
      toast.error("Title and content are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiPost("/pages", {
        title: newPage.title.trim(),
        slug: newPage.slug.trim(),
        content: newPage.content.trim(),
        status: newPage.status,
      });
      toast.success("Page created successfully!");
      setIsDialogOpen(false);
      setNewPage({
        title: "",
        slug: "",
        content: "",
        status: "PUBLISHED",
      });
      fetchPages();
    } catch (err: any) {
      toast.error(err.message || "Failed to create page");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return;
    try {
      await apiDelete(`/pages/${id}`);
      toast.success("Page deleted successfully");
      fetchPages();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete page");
    }
  };

  const columns = [
    {
      header: "Page Title",
      accessor: (page: PageRecord) => <span className="font-bold text-slate-900">{page.title}</span>,
    },
    {
      header: "Slug",
      accessor: (page: PageRecord) => <span className="text-slate-500 font-mono text-xs">{page.slug}</span>,
    },
    {
      header: "Last Updated",
      accessor: (page: PageRecord) => (
        <span className="text-slate-500 text-xs">
          {format(new Date(page.updatedAt), "MMM d, yyyy")}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (page: PageRecord) => {
        const s = page.status;
        const type = s === "PUBLISHED" ? "success" : "neutral";
        return <StatusBadge status={s} type={type as any} />;
      },
    },
    {
      header: "Action",
      accessor: (page: PageRecord) => (
        <div className="flex items-center gap-2">
          <a
            href={`/${page.slug === 'terms-and-conditions' ? 'terms' : page.slug === 'privacy-policy' ? 'privacy' : page.slug === 'about-us' ? 'about' : page.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg"
            title="View Live"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          {page.isSystem ? (
            <span className="p-1.5 text-slate-300" title="System Page">
              <Lock className="w-4 h-4" />
            </span>
          ) : (
            <button
              className="p-1.5 text-slate-400 hover:text-danger rounded-lg"
              title="Delete"
              onClick={() => handleDelete(page.id)}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-800">Static Pages Management</h2>
          <p className="text-xs text-slate-500">Manage legal, informational, and policy pages</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs">
          <Plus className="w-4 h-4 mr-1.5" /> Add New Page
        </Button>
      </div>

      <div className="bg-white border rounded-xl shadow-sm">
        <DataTable columns={columns} data={pages} isLoading={isLoading} />
      </div>

      {/* Add Page Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Static Page</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSavePage} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Page Title *</label>
              <Input
                placeholder="e.g. Return & Refund Policy"
                value={newPage.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">URL Slug *</label>
              <Input
                placeholder="return-and-refund-policy"
                value={newPage.slug}
                onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">HTML Content *</label>
              <Textarea
                placeholder="<p>Detailed page text goes here...</p>"
                value={newPage.content}
                onChange={(e) => setNewPage({ ...newPage, content: e.target.value })}
                rows={6}
                required
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Page"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
