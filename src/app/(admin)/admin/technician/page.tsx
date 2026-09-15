"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  User, 
  Smartphone, 
  Loader2, 
  RefreshCw,
  Search,
  Filter
} from "lucide-react";
import { apiGet, apiPatch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ServiceJob {
  id: string;
  orderId: string;
  device: string;
  issueDescription: string;
  specialization: string | null;
  serviceCharge: number;
  status: "PENDING" | "IN_PROGRESS" | "READY_FOR_PICKUP" | "DELIVERED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  order: {
    orderCode: string;
    customer?: {
      name: string;
      phone: string;
      email?: string | null;
    } | null;
    branch?: {
      name: string;
    } | null;
  };
}

export default function TechnicianWorkspacePage() {
  const [jobs, setJobs] = useState<ServiceJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null);

  const fetchMyJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiGet<ServiceJob[]>("/service-jobs/my");
      setJobs(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load assigned service jobs.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyJobs();
  }, [fetchMyJobs]);

  const handleStatusUpdate = async (jobId: string, newStatus: ServiceJob["status"]) => {
    setUpdatingJobId(jobId);
    try {
      await apiPatch(`/service-jobs/${jobId}/status`, { status: newStatus });
      toast.success(`Job status updated to ${newStatus.replace(/_/g, " ")}`);
      // Update local state
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to update status.");
    } finally {
      setUpdatingJobId(null);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    if (statusFilter !== "ALL" && j.status !== statusFilter) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      const matchDevice = j.device?.toLowerCase().includes(s);
      const matchIssue = j.issueDescription?.toLowerCase().includes(s);
      const matchCustomer = j.order?.customer?.name?.toLowerCase().includes(s);
      const matchPhone = j.order?.customer?.phone?.includes(s);
      const matchOrder = j.order?.orderCode?.toLowerCase().includes(s);
      return matchDevice || matchIssue || matchCustomer || matchPhone || matchOrder;
    }
    return true;
  });

  const countByStatus = {
    ALL: jobs.length,
    PENDING: jobs.filter((j) => j.status === "PENDING").length,
    IN_PROGRESS: jobs.filter((j) => j.status === "IN_PROGRESS").length,
    READY_FOR_PICKUP: jobs.filter((j) => j.status === "READY_FOR_PICKUP").length,
    DELIVERED: jobs.filter((j) => j.status === "DELIVERED").length,
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Technician Workspace</h1>
              <p className="text-xs text-slate-500">
                Manage your assigned repair and servicing jobs
              </p>
            </div>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={fetchMyJobs}
          className="gap-2 border-slate-200 text-slate-600 hover:text-slate-900"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Jobs
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setStatusFilter("PENDING")}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === "PENDING"
              ? "bg-amber-50/80 border-amber-300 ring-2 ring-amber-400"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-semibold uppercase">Pending</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{countByStatus.PENDING}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("IN_PROGRESS")}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === "IN_PROGRESS"
              ? "bg-blue-50/80 border-blue-300 ring-2 ring-blue-400"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-semibold uppercase">In Progress</span>
            <Wrench className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{countByStatus.IN_PROGRESS}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("READY_FOR_PICKUP")}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === "READY_FOR_PICKUP"
              ? "bg-purple-50/80 border-purple-300 ring-2 ring-purple-400"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-purple-600">
            <span className="text-xs font-semibold uppercase">Ready For Pickup</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{countByStatus.READY_FOR_PICKUP}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("ALL")}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === "ALL"
              ? "bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-semibold uppercase">Total Assigned</span>
            <Filter className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{countByStatus.ALL}</p>
        </button>
      </div>

      {/* Search & Filter bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by device, issue, customer, order #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-md text-slate-700 w-full sm:w-48"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="READY_FOR_PICKUP">Ready for Pickup</option>
          <option value="DELIVERED">Delivered / Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Jobs List */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
          <Wrench className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-base font-semibold text-slate-700">No Service Jobs Found</p>
          <p className="text-xs text-slate-400 mt-1">
            {jobs.length === 0
              ? "You currently have no service jobs assigned to you."
              : "No jobs match your current search or status filter."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job) => {
            const isUpdating = updatingJobId === job.id;
            return (
              <div
                key={job.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all"
              >
                {/* Header with order code and status */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-xs text-slate-400">ORDER CODE</span>
                    <p className="font-mono font-bold text-emerald-600 text-sm">
                      #{job.order?.orderCode}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`text-xs font-semibold ${
                      job.status === "PENDING"
                        ? "bg-amber-100 text-amber-800"
                        : job.status === "IN_PROGRESS"
                        ? "bg-blue-100 text-blue-800"
                        : job.status === "READY_FOR_PICKUP"
                        ? "bg-purple-100 text-purple-800"
                        : job.status === "DELIVERED"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {job.status.replace(/_/g, " ")}
                  </Badge>
                </div>

                {/* Device & Issue details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-slate-500" />
                    <span className="font-bold text-slate-900 text-sm">{job.device}</span>
                    {job.specialization && (
                      <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {job.specialization}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-md leading-relaxed">
                    <strong className="text-slate-700">Issue: </strong>
                    {job.issueDescription}
                  </p>
                </div>

                {/* Customer info */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.order?.customer?.name || "Walk-In Customer"}</span>
                  </div>
                  {job.order?.customer?.phone && (
                    <div className="flex items-center gap-1 font-mono text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.order.customer.phone}</span>
                    </div>
                  )}
                </div>

                {/* Status Update Quick Action Controls */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Update Status:</span>

                  {job.status === "PENDING" && (
                    <Button
                      size="sm"
                      disabled={isUpdating}
                      onClick={() => handleStatusUpdate(job.id, "IN_PROGRESS")}
                      className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1"
                    >
                      Start Repair
                    </Button>
                  )}

                  {job.status === "IN_PROGRESS" && (
                    <Button
                      size="sm"
                      disabled={isUpdating}
                      onClick={() => handleStatusUpdate(job.id, "READY_FOR_PICKUP")}
                      className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1"
                    >
                      Ready for Pickup
                    </Button>
                  )}

                  {job.status === "READY_FOR_PICKUP" && (
                    <Button
                      size="sm"
                      disabled={isUpdating}
                      onClick={() => handleStatusUpdate(job.id, "DELIVERED")}
                      className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                    >
                      Mark Completed
                    </Button>
                  )}

                  {job.status !== "PENDING" && job.status !== "CANCELLED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isUpdating}
                      onClick={() => handleStatusUpdate(job.id, "PENDING")}
                      className="h-7 text-xs text-slate-600 border-slate-200"
                    >
                      Reset to Pending
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
