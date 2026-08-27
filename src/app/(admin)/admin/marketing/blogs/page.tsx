"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { DataTable, StatusBadge } from "@/components/admin/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Eye, ExternalLink, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPost, apiPatch, apiDelete, getImageUrl } from "@/lib/api-client";
import { format } from "date-fns";

export interface BlogAdminRecord {
  id: string;
  title: string;
  slug: string;
  author: string;
  category?: string | null;
  excerpt?: string | null;
  content: string;
  coverImage?: string | null;
  viewCount: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  createdAt: string;
}

export default function BlogsPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [data, setData] = useState<BlogAdminRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newBlog, setNewBlog] = useState({
    title: "",
    slug: "",
    author: "NovaMobile Editorial",
    category: "Guides",
    excerpt: "",
    content: "",
    coverImage: "",
    status: "PUBLISHED" as "PUBLISHED" | "DRAFT",
  });

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const res = await apiGet<BlogAdminRecord[]>("/blogs/admin");
      setData(res || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load blogs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setTitle("Blogs & Articles");
    setBadge("Marketing");
    setDateFilter("");
    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTitleChange = (val: string) => {
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setNewBlog({ ...newBlog, title: val, slug: autoSlug });
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlog.title.trim() || !newBlog.content.trim()) {
      toast.error("Title and article content are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiPost("/blogs", {
        title: newBlog.title.trim(),
        slug: newBlog.slug.trim() || undefined,
        author: newBlog.author.trim() || undefined,
        category: newBlog.category.trim() || undefined,
        excerpt: newBlog.excerpt.trim() || undefined,
        content: newBlog.content.trim(),
        coverImage: newBlog.coverImage.trim() || undefined,
        status: newBlog.status,
      });
      toast.success("Blog article saved successfully!");
      setIsDialogOpen(false);
      setNewBlog({
        title: "",
        slug: "",
        author: "NovaMobile Editorial",
        category: "Guides",
        excerpt: "",
        content: "",
        coverImage: "",
        status: "PUBLISHED",
      });
      fetchBlogs();
    } catch (err: any) {
      toast.error(err.message || "Failed to create article");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this blog post?")) return;
    try {
      await apiDelete(`/blogs/${id}`);
      toast.success("Blog post deleted");
      fetchBlogs();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete blog post");
    }
  };

  const handleToggleStatus = async (blog: BlogAdminRecord) => {
    const nextStatus = blog.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      await apiPatch(`/blogs/${blog.id}`, { status: nextStatus });
      toast.success(`Post is now ${nextStatus.toLowerCase()}`);
      setData(data.map((b) => (b.id === blog.id ? { ...b, status: nextStatus } : b)));
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const columns: ColumnDef<BlogAdminRecord>[] = [
    {
      accessorKey: "coverImage",
      header: "Thumbnail",
      cell: ({ row }) => (
        <div className="w-16 h-10 rounded overflow-hidden relative border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
          {row.original.coverImage ? (
            <img src={getImageUrl(row.original.coverImage)} alt={row.original.title} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-4 h-4 text-slate-400" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => <span className="font-bold text-slate-800 line-clamp-1">{row.original.title}</span>,
    },
    {
      accessorKey: "author",
      header: "Author",
      cell: ({ row }) => <span className="text-xs text-slate-600">{row.original.author}</span>,
    },
    {
      accessorKey: "viewCount",
      header: "Views",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold">
          <Eye className="w-3.5 h-3.5" />
          <span>{(row.original.viewCount || 0).toLocaleString()}</span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-xs text-slate-500">
          {format(new Date(row.original.createdAt), "MMM d, yyyy")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status;
        const type = s === "PUBLISHED" ? "success" : s === "DRAFT" ? "warning" : "neutral";
        return <StatusBadge status={s} type={type as any} />;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 justify-end">
          <a
            href={`/blog/${row.original.slug}`}
            target="_blank"
            rel="noreferrer"
            className="p-1 text-slate-400 hover:text-emerald-600"
            title="View Live"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleStatus(row.original)}
            className="text-xs text-slate-600"
          >
            {row.original.status === "PUBLISHED" ? "Unpublish" : "Publish"}
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
          <h2 className="text-base font-bold text-slate-800">Blog Posts & Repair Guides</h2>
          <p className="text-xs text-slate-500">Publish articles, tech guides, and announcements</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs">
          <Plus className="w-4 h-4 mr-1.5" /> Write New Article
        </Button>
      </div>

      <div className="bg-white border rounded-xl shadow-sm">
        <DataTable columns={columns} data={data} isLoading={isLoading} />
      </div>

      {/* Article Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Write New Article</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveBlog} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Article Title *</label>
              <Input
                placeholder="e.g. How to Replace an iPhone 14 OLED Screen Safely"
                value={newBlog.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">URL Slug</label>
                <Input
                  value={newBlog.slug}
                  onChange={(e) => setNewBlog({ ...newBlog, slug: e.target.value })}
                  placeholder="auto-generated-slug"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Author Name</label>
                <Input
                  value={newBlog.author}
                  onChange={(e) => setNewBlog({ ...newBlog, author: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Cover Image URL</label>
              <Input
                placeholder="https://images.unsplash.com/... or /uploads/..."
                value={newBlog.coverImage}
                onChange={(e) => setNewBlog({ ...newBlog, coverImage: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Short Excerpt</label>
              <Input
                placeholder="Brief 1-2 sentence preview"
                value={newBlog.excerpt}
                onChange={(e) => setNewBlog({ ...newBlog, excerpt: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Full HTML Content *</label>
              <Textarea
                placeholder="<p>Detailed article text goes here...</p>"
                value={newBlog.content}
                onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                rows={8}
                required
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publish Article"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
