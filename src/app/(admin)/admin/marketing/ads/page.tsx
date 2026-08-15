"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { FilterBar } from "@/components/admin/FilterBar";
import { DataTable, StatusBadge } from "@/components/admin/DataTable";
import { mockAds, AdRecord } from "@/lib/mock-data/marketing/ads";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Edit, Copy, Trash2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function AdsPage() {
  const router = useRouter();
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [data, setData] = useState<AdRecord[]>(mockAds);

  useEffect(() => {
    setTitle("Ads");
    setBadge("Marketing");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this ad?")) {
      setData(data.filter(a => a.id !== id));
      toast.success("Ad deleted");
    }
  };

  const columns: ColumnDef<AdRecord>[] = [
    {
      accessorKey: "thumbnail",
      header: "Thumbnail",
      cell: ({ row }) => (
        <div className="w-16 h-10 rounded overflow-hidden relative border border-slate-200 bg-slate-50 flex items-center justify-center">
          {row.original.thumbnail ? (
            <Image src={row.original.thumbnail} alt={row.original.title} fill className="object-cover" />
          ) : (
            <ImageIcon className="w-4 h-4 text-slate-400" />
          )}
        </div>
      )
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => <span className="font-bold text-slate-800">{row.original.title}</span>
    },
    {
      accessorKey: "placement",
      header: "Placement",
      cell: ({ row }) => (
        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
          {row.original.placement}
        </span>
      )
    },
    {
      accessorKey: "linkUrl",
      header: "Link URL",
      cell: ({ row }) => <span className="text-slate-500 truncate max-w-[150px] block">{row.original.linkUrl}</span>
    },
    {
      accessorKey: "impressions",
      header: "Impressions",
      cell: ({ row }) => <span className="text-slate-500">{row.original.impressions.toLocaleString()}</span>
    },
    {
      accessorKey: "clicks",
      header: "Clicks",
      cell: ({ row }) => <span className="text-slate-500">{row.original.clicks.toLocaleString()}</span>
    },
    {
      id: "ctr",
      header: "CTR",
      cell: ({ row }) => {
        const { impressions, clicks } = row.original;
        const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : "0.00";
        return <span className="text-xs font-bold text-slate-700">{ctr}%</span>;
      }
    },
    {
      id: "schedule",
      header: "Schedule",
      cell: ({ row }) => {
        const { startDate, endDate } = row.original;
        if (!startDate) return <span className="text-slate-500 text-sm">Always</span>;
        return <span className="text-slate-500 text-sm">{startDate} to {endDate}</span>;
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status;
        const type = s === "Active" ? "success" : s === "Scheduled" ? "info" : s === "Expired" ? "neutral" : "warning";
        return <StatusBadge status={s} type={type as any} />;
      }
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button 
            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
            title="Edit Ad"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Duplicate Ad"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDelete(row.original.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
            title="Delete Ad"
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
          onClick={() => router.push("/admin/marketing/ads/create")}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Add Ad
        </button>
      </div>

      <FilterBar 
        onSearch={() => {}}
        onReset={() => {}}
        searchPlaceholder="Search ad title..."
        filters={[
          {
            key: "placement",
            label: "Placement",
            type: "select",
            options: ["Homepage Sidebar", "Category Page Top", "Popup on Load", "Footer Strip"]
          },
          {
            key: "status",
            label: "Status",
            type: "select",
            options: ["Active", "Scheduled", "Expired", "Inactive"]
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
