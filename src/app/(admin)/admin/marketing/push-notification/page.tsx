"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { FilterBar } from "@/components/admin/FilterBar";
import { DataTable, StatusBadge } from "@/components/admin/DataTable";
import { mockPushNotifications, PushNotificationRecord } from "@/lib/mock-data/marketing/push-notifications";
import { ColumnDef } from "@tanstack/react-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, Eye, Copy, XCircle, Trash2, Smartphone, BellRing } from "lucide-react";
import { toast } from "sonner";

export default function PushNotificationPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [data, setData] = useState<PushNotificationRecord[]>(mockPushNotifications);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    targetAudience: "All Customers" as any,
    link: "",
    sendOption: "Send Now",
    sendDate: ""
  });

  useEffect(() => {
    setTitle("Push Notification");
    setBadge("Marketing");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = () => {
    if (!newNotification.title || !newNotification.message) {
      toast.error("Title and message are required");
      return;
    }
    
    const notif: PushNotificationRecord = {
      id: `pn-${Date.now()}`,
      title: newNotification.title,
      message: newNotification.message,
      targetAudience: newNotification.targetAudience,
      link: newNotification.link,
      status: newNotification.sendOption === "Send Now" ? "Sent" : "Scheduled",
      sendDate: newNotification.sendOption === "Send Now" ? new Date().toISOString() : newNotification.sendDate,
      deliveredCount: 0
    };
    
    setData([notif, ...data]);
    setIsDialogOpen(false);
    toast.success(newNotification.sendOption === "Send Now" ? "Notification sent successfully" : "Notification scheduled");
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this notification record?")) {
      setData(data.filter(p => p.id !== id));
      toast.success("Notification deleted");
    }
  };

  const handleCancel = (id: string) => {
    setData(data.map(p => p.id === id ? { ...p, status: "Draft" } : p));
    toast.success("Scheduled notification cancelled");
  };

  const columns: ColumnDef<PushNotificationRecord>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => <span className="font-bold text-slate-800">{row.original.title}</span>
    },
    {
      accessorKey: "message",
      header: "Message",
      cell: ({ row }) => <span className="text-slate-500 truncate max-w-[200px] block" title={row.original.message}>{row.original.message}</span>
    },
    {
      accessorKey: "targetAudience",
      header: "Target Audience",
      cell: ({ row }) => (
        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
          {row.original.targetAudience}
        </span>
      )
    },
    {
      id: "sendDate",
      header: "Date",
      cell: ({ row }) => {
        if (!row.original.sendDate) return <span className="text-slate-400">—</span>;
        const date = new Date(row.original.sendDate);
        return (
          <div className="flex flex-col text-sm text-slate-600">
            <span>{date.toLocaleDateString()}</span>
            <span className="text-xs text-slate-400">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        );
      }
    },
    {
      accessorKey: "deliveredCount",
      header: "Delivered",
      cell: ({ row }) => (
        <span className="text-slate-500">
          {row.original.status === "Sent" ? row.original.deliveredCount.toLocaleString() : "—"}
        </span>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status;
        const type = s === "Sent" ? "success" : s === "Scheduled" ? "info" : s === "Failed" ? "danger" : "neutral";
        return <StatusBadge status={s} type={type as any} />;
      }
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="View Details">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Duplicate">
            <Copy className="w-4 h-4" />
          </button>
          {row.original.status === "Scheduled" && (
            <button 
              onClick={() => handleCancel(row.original.id)}
              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors" 
              title="Cancel"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={() => handleDelete(row.original.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
            title="Delete"
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
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Notification
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
            options: ["Sent", "Scheduled", "Draft", "Failed"]
          }
        ]}
      />

      <DataTable 
        columns={columns}
        data={data}
        pageSize={10}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Push Notification</DialogTitle>
          </DialogHeader>
          <div className="pt-4 flex flex-col md:flex-row gap-6">
            
            {/* Form Side */}
            <div className="flex-1 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex justify-between">
                  Title *
                  <span className="text-xs font-normal text-slate-400">{newNotification.title.length}/50</span>
                </label>
                <Input 
                  placeholder="Notification title..." 
                  value={newNotification.title}
                  onChange={e => setNewNotification({ ...newNotification, title: e.target.value.slice(0, 50) })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex justify-between">
                  Message *
                  <span className="text-xs font-normal text-slate-400">{newNotification.message.length}/150</span>
                </label>
                <textarea 
                  className="w-full min-h-[80px] p-3 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow resize-y"
                  placeholder="Notification message..."
                  value={newNotification.message}
                  onChange={e => setNewNotification({ ...newNotification, message: e.target.value.slice(0, 150) })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Target Audience *</label>
                <select 
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500"
                  value={newNotification.targetAudience}
                  onChange={e => setNewNotification({ ...newNotification, targetAudience: e.target.value as any })}
                >
                  <option value="All Customers">All Customers</option>
                  <option value="Customers with Cart">Customers with Cart</option>
                  <option value="Specific Customer Segment">Specific Customer Segment</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Deep Link (Optional)</label>
                <Input 
                  placeholder="e.g. /offers/summer-sale" 
                  value={newNotification.link}
                  onChange={e => setNewNotification({ ...newNotification, link: e.target.value })}
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input 
                      type="radio" 
                      name="sendOption" 
                      value="Send Now"
                      checked={newNotification.sendOption === "Send Now"}
                      onChange={() => setNewNotification({ ...newNotification, sendOption: "Send Now" })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    /> Send Now
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input 
                      type="radio" 
                      name="sendOption" 
                      value="Schedule for Later"
                      checked={newNotification.sendOption === "Schedule for Later"}
                      onChange={() => setNewNotification({ ...newNotification, sendOption: "Schedule for Later" })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    /> Schedule for Later
                  </label>
                </div>

                {newNotification.sendOption === "Schedule for Later" && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Select Date & Time</label>
                    <Input 
                      type="datetime-local"
                      value={newNotification.sendDate}
                      onChange={e => setNewNotification({ ...newNotification, sendDate: e.target.value })}
                    />
                  </div>
                )}
              </div>

            </div>

            {/* Preview Side */}
            <div className="w-full md:w-64 shrink-0 flex flex-col items-center">
              <span className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">Preview</span>
              
              {/* Phone Mockup */}
              <div className="w-64 h-[450px] bg-slate-900 rounded-[2.5rem] p-3 shadow-xl relative border-[6px] border-slate-800">
                {/* Screen */}
                <div className="w-full h-full bg-slate-100 rounded-[2rem] overflow-hidden relative font-sans">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-900 rounded-b-xl z-10" />
                  
                  {/* Wallpaper Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-blue-500 opacity-20" />
                  
                  {/* Time bar */}
                  <div className="absolute top-2 left-5 text-[10px] font-bold text-slate-800">9:41</div>

                  {/* Notification Card */}
                  <div className="absolute top-12 left-2 right-2 bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-white/40">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-5 h-5 bg-emerald-600 rounded flex items-center justify-center">
                        <BellRing className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Store App</span>
                      <span className="text-[10px] text-slate-400 ml-auto">now</span>
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-800 leading-tight">
                        {newNotification.title || "Notification Title"}
                      </h4>
                      <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                        {newNotification.message || "Your notification message will appear here."}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button 
              onClick={() => setIsDialogOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-medium rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
            <button 
              onClick={handleSend}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm shadow-sm"
            >
              {newNotification.sendOption === "Send Now" ? "Send Now" : "Schedule"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
