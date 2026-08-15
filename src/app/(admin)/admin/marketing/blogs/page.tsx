"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { FilterBar } from "@/components/admin/FilterBar";
import { DataTable, StatusBadge } from "@/components/admin/DataTable";
import { mockBlogs, BlogWithMeta } from "@/lib/mock-data/blogs";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Edit, Copy, Trash2, Eye, ExternalLink, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function BlogsPage() {
  const router = useRouter();
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [data, setData] = useState<BlogWithMeta[]>(mockBlogs);

  useEffect(() => {
    setTitle("Blogs");
    setBadge("Marketing");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      setData(data.filter(b => b.id !== id));
      toast.success("Blog post deleted");
    }
  };

  const columns: ColumnDef<BlogWithMeta>[] = [
    {
      accessorKey: "coverImage",
      header: "Thumbnail",
      cell: ({ row }) => (
        <div className="w-16 h-12 rounded overflow-hidden relative border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
          {row.original.coverImage ? (
            <Image src={row.original.coverImage} alt={row.original.title} fill className="object-cover" />
          ) : (
            <ImageIcon className="w-4 h-4 text-slate-400" />
          )}
        </div>
      )
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => <span className="font-bold text-slate-800 line-clamp-1" title={row.original.title}>{row.original.title}</span>
    },
    {
      accessorKey: "author",
      header: "Author"
    },
    {
      accessorKey: "viewCount",
      header: "Views",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-slate-500">
          <Eye className="w-4 h-4" />
          <span>{row.original.viewCount.toLocaleString()}</span>
        </div>
      )
    },
    {
      id: "publishedDate",
      header: "Date",
      cell: ({ row }) => {
        if (row.original.status === "Draft") {
          return <span className="text-slate-400 text-sm">Draft</span>;
        }
        const date = new Date(row.original.createdAt);
        return <span className="text-slate-600 text-sm">{date.toLocaleDateString()}</span>;
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status;
        const type = s === "Published" ? "success" : s === "Scheduled" ? "info" : "neutral";
        return <StatusBadge status={s} type={type as any} />;
      }
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => router.push(`/admin/marketing/blogs/${row.original.id}/edit`)}
            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
            title="Edit Post"
          >
            <Edit className="w-4 h-4" />
          </button>
          <a 
            href={`/blog/${row.original.slug}`}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="View on Website"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <button 
            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
            title="Duplicate Post"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDelete(row.original.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
            title="Delete Post"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      
      <div className="flex justify-end">
        <button 
          onClick={() => router.push("/admin/marketing/blogs/create")}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Add Blog Post
        </button>
      </div>

      <FilterBar 
        onSearch={() => {}}
        onReset={() => {}}
        searchPlaceholder="Search title..."
        filters={[
          {
            key: "status",
            label: "Status",
            type: "select",
            options: ["Published", "Draft", "Scheduled"]
          },
          {
            key: "author",
            label: "Author",
            type: "select",
            options: ["Admin", "John Doe", "Jane Smith"]
          }
        ]}
      />

      <DataTable 
        columns={columns}
        data={data}
        pageSize={10}
      />

    </div>
  );
}
