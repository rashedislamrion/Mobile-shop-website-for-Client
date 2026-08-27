"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { DataTable, StatusBadge } from "@/components/admin/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { apiGet, apiPatch, apiDelete } from "@/lib/api-client";

export interface SupportTicketRecord {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  createdAt: string;
  customer?: { id: string; name: string; email?: string; phone?: string };
  issueType?: { id: string; name: string };
  assignedTo?: { id: string; name: string; email: string };
}

export default function SupportRequestsPage() {
  const { setTitle, setBadge } = useAdminPage();
  const [tickets, setTickets] = useState<SupportTicketRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const query: Record<string, any> = {};
      if (statusFilter !== "ALL") query.status = statusFilter;
      const res = await apiGet<{ data: SupportTicketRecord[]; meta: any }>("/support-tickets", query);
      setTickets(res.data || []);
    } catch (e: any) {
      toast.error(e.message || "Failed to load support requests");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    setTitle("Help Requests");
    setBadge("Support");
    fetchTickets();
  }, [setTitle, setBadge, fetchTickets]);

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      await apiPatch(`/support-tickets/${ticketId}/status`, { status: newStatus });
      toast.success("Ticket status updated successfully");
      fetchTickets();
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus as any });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update ticket status");
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm("Are you sure you want to delete this ticket?")) return;
    try {
      await apiDelete(`/support-tickets/${ticketId}`);
      toast.success("Ticket deleted");
      fetchTickets();
      setIsDetailOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete ticket");
    }
  };

  const columns: ColumnDef<SupportTicketRecord>[] = [
    {
      accessorKey: "ticketNumber",
      header: "Ticket #",
      cell: ({ row }) => <span className="font-mono font-bold text-slate-800">{row.original.ticketNumber}</span>,
    },
    {
      accessorKey: "subject",
      header: "Subject & Issue",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-slate-900 line-clamp-1">{row.original.subject}</p>
          <p className="text-xs text-slate-500">{row.original.issueType?.name || "General Query"}</p>
        </div>
      ),
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-slate-900">{row.original.customer?.name || "Guest"}</p>
          <p className="text-xs text-slate-500">{row.original.customer?.phone || row.original.customer?.email || "—"}</p>
        </div>
      ),
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const p = row.original.priority;
        const color = p === "URGENT" || p === "HIGH" ? "bg-red-50 text-red-700 border-red-200" : "bg-slate-50 text-slate-700 border-slate-200";
        return <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${color}`}>{p}</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const st = row.original.status;
        const type = st === "RESOLVED" || st === "CLOSED" ? "success" : st === "IN_PROGRESS" ? "warning" : "default";
        return <StatusBadge status={st} type={type} />;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => <span className="text-xs text-slate-500">{new Date(row.original.createdAt).toLocaleDateString("en-GB")}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => {
              setSelectedTicket(row.original);
              setIsDetailOpen(true);
            }}
          >
            <Eye className="w-4 h-4 text-slate-600" />
          </Button>
          <Select
            value={row.original.status}
            onValueChange={(val) => handleUpdateStatus(row.original.id, val)}
          >
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-emerald-600" />
          <div>
            <h2 className="font-semibold text-slate-800">Support & Help Requests</h2>
            <p className="text-xs text-slate-500">Track and respond to customer service tickets</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-9 text-xs">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={tickets}
        isLoading={isLoading}
        searchKey="subject"
        searchPlaceholder="Search by subject..."
      />

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ticket Details: {selectedTicket?.ticketNumber}</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center text-sm border-b pb-3">
                <div>
                  <span className="text-slate-500">Subject:</span>
                  <p className="font-semibold text-slate-800">{selectedTicket.subject}</p>
                </div>
                <div>
                  <span className="text-slate-500">Priority:</span>
                  <p className="font-semibold text-slate-800">{selectedTicket.priority}</p>
                </div>
              </div>
              <div className="text-sm">
                <span className="text-slate-500">Customer:</span>
                <p className="font-medium text-slate-800">{selectedTicket.customer?.name} ({selectedTicket.customer?.phone || selectedTicket.customer?.email || "No contact"})</p>
              </div>
              <div className="text-sm">
                <span className="text-slate-500">Description:</span>
                <p className="bg-slate-50 p-3 rounded-lg border text-slate-700 mt-1 whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>
              <div className="flex justify-between items-center pt-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteTicket(selectedTicket.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Ticket
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDetailOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
