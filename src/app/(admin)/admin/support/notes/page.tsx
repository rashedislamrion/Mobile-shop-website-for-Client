"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { DataTable } from "@/components/admin/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, StickyNote, Trash2, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { apiGet, apiPost, apiDelete } from "@/lib/api-client";

export interface HelpNoteRecord {
  id: string;
  name: string;
  phone: string;
  subject: string;
  note?: string | null;
  createdAt: string;
}

export default function HelpNotesPage() {
  const { setTitle, setBadge } = useAdminPage();
  const [notes, setNotes] = useState<HelpNoteRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedNote, setSelectedNote] = useState<HelpNoteRecord | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    subject: "",
    note: "",
  });

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiGet<{ data: HelpNoteRecord[]; meta: any }>("/help-notes");
      setNotes(res.data || []);
    } catch (e: any) {
      toast.error(e.message || "Failed to load help notes");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setTitle("Help Notes");
    setBadge("Support");
    fetchNotes();
  }, [setTitle, setBadge, fetchNotes]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.subject.trim()) {
      toast.error("Name, phone, and subject are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      await apiPost("/help-notes", formData);
      toast.success("Help note saved successfully");
      setIsDialogOpen(false);
      setFormData({ name: "", phone: "", subject: "", note: "" });
      fetchNotes();
    } catch (err: any) {
      toast.error(err.message || "Failed to create help note");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this help note?")) return;
    try {
      await apiDelete(`/help-notes/${id}`);
      toast.success("Help note deleted");
      fetchNotes();
      setIsViewOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete note");
    }
  };

  const columns: ColumnDef<HelpNoteRecord>[] = [
    {
      accessorKey: "name",
      header: "Caller / Customer",
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-slate-900">{row.original.name}</p>
          <p className="font-mono text-xs text-slate-500">{row.original.phone}</p>
        </div>
      ),
    },
    {
      accessorKey: "subject",
      header: "Subject / Reason",
      cell: ({ row }) => <span className="font-medium text-slate-800">{row.original.subject}</span>,
    },
    {
      accessorKey: "note",
      header: "Note Content",
      cell: ({ row }) => (
        <span className="text-xs text-slate-600 line-clamp-1 max-w-xs">
          {row.original.note || "No additional notes"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-xs text-slate-500">
          {new Date(row.original.createdAt).toLocaleDateString("en-GB")}
        </span>
      ),
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
              setSelectedNote(row.original);
              setIsViewOpen(true);
            }}
          >
            <Eye className="w-4 h-4 text-slate-600" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => handleDelete(row.original.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-3">
          <StickyNote className="w-5 h-5 text-amber-600" />
          <div>
            <h2 className="font-semibold text-slate-800">Support Help Notes</h2>
            <p className="text-xs text-slate-500">Log inquiry notes, customer call logs, and support reminders</p>
          </div>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90 text-white gap-2">
          <Plus className="w-4 h-4" /> Add Help Note
        </Button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={notes}
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder="Search notes by name or phone..."
      />

      {/* Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Help Note</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Customer / Caller Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Tanvir Ahmed"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number *</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. 01712345678"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Subject / Issue Topic *</label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g. Display warranty query"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Note Details</label>
              <Textarea
                rows={4}
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Write customer conversation summary or reminder..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-white">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Note"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Help Note Details</DialogTitle>
          </DialogHeader>
          {selectedNote && (
            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center text-sm border-b pb-3">
                <div>
                  <span className="text-slate-500 text-xs">Customer</span>
                  <p className="font-semibold text-slate-800">{selectedNote.name}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-xs">Phone</span>
                  <p className="font-mono text-sm font-semibold text-slate-800">{selectedNote.phone}</p>
                </div>
              </div>
              <div>
                <span className="text-slate-500 text-xs">Subject</span>
                <p className="font-medium text-slate-800 mt-0.5">{selectedNote.subject}</p>
              </div>
              <div>
                <span className="text-slate-500 text-xs">Notes</span>
                <p className="bg-slate-50 p-3 rounded-lg border text-slate-700 mt-1 text-sm whitespace-pre-wrap">
                  {selectedNote.note || "No additional text provided."}
                </p>
              </div>
              <div className="flex justify-between items-center pt-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(selectedNote.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Note
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsViewOpen(false)}
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
