"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { ExternalLink, Edit2, Plus, Search, Building2, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiGet, apiPatch } from "@/lib/api-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export interface BranchRow {
  id: string;
  name: string;
  code: string;
  type?: string;
  address: string;
  city?: string;
  phone: string;
  altPhone?: string | null;
  email?: string | null;
  status: "ACTIVE" | "INACTIVE";
}

export default function BranchListPage() {
  const { setTitle, setBadge, setDateFilter, selectBranch } = useAdminPage();
  const router = useRouter();

  const [branches, setBranches] = useState<BranchRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  // Edit Modal State
  const [editingBranch, setEditingBranch] = useState<BranchRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchBranches = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiGet<BranchRow[]>("/branches");
      setBranches(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load branches");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setTitle("Branch List");
    setBadge("Branches");
    setDateFilter("");
    fetchBranches();
  }, [setTitle, setBadge, setDateFilter, fetchBranches]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchInput.trim());
  };

  const filteredBranches = useMemo(() => {
    if (!activeSearch) return branches;
    const q = activeSearch.toLowerCase();
    return branches.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.address?.toLowerCase().includes(q) ||
        b.phone?.toLowerCase().includes(q) ||
        b.code?.toLowerCase().includes(q)
    );
  }, [branches, activeSearch]);

  const handleOpenEdit = (branch: BranchRow) => {
    setEditingBranch(branch);
    setEditName(branch.name || "");
    setEditAddress(branch.address || "");
    setEditPhone(branch.phone || "");
  };

  const handleUpdateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch) return;
    if (!editName.trim()) {
      toast.error("Branch name is required");
      return;
    }
    if (!editAddress.trim()) {
      toast.error("Location / Address is required");
      return;
    }

    try {
      setIsUpdating(true);
      const updated = await apiPatch<BranchRow>(`/branches/${editingBranch.id}`, {
        name: editName.trim(),
        address: editAddress.trim(),
        phone: editPhone.trim() || undefined,
      });

      toast.success(`Branch "${updated.name}" updated successfully!`);
      setEditingBranch(null);
      fetchBranches();
    } catch (err: any) {
      toast.error(err.message || "Failed to update branch");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSwitchToBranch = (branch: BranchRow) => {
    selectBranch(branch.id, branch.name);
    toast.success(`Switched active context to ${branch.name}`);
    router.push("/admin");
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Branch List</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage outlets, warehouses and switch branch views across your organization.
          </p>
        </div>
        <Link href="/admin/branch/create">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm gap-2">
            <Plus className="w-4 h-4" />
            <span>Add Branch</span>
          </Button>
        </Link>
      </div>

      {/* Search Bar matching Reference */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search Branch..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200 rounded-xl text-sm"
            />
          </div>
          <Button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5"
          >
            Search
          </Button>
          {activeSearch && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearchInput("");
                setActiveSearch("");
              }}
              className="rounded-xl border-slate-200 text-slate-600"
            >
              Reset
            </Button>
          )}
        </form>
      </div>

      {/* DataTable Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-16 text-center">SL</th>
                <th className="py-3.5 px-4">NAME</th>
                <th className="py-3.5 px-4">LOCATION</th>
                <th className="py-3.5 px-4">CONTACT NUMBER</th>
                <th className="py-3.5 px-4 text-center w-28">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Building2 className="w-8 h-8 animate-pulse mx-auto mb-2 text-emerald-500" />
                    <p className="text-sm">Loading branches...</p>
                  </td>
                </tr>
              ) : filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium text-slate-600">No branches found</p>
                    <p className="text-xs text-slate-400 mt-1">Try another search or add a new branch</p>
                  </td>
                </tr>
              ) : (
                filteredBranches.map((branch, idx) => (
                  <tr key={branch.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-center text-xs font-medium text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{branch.name}</span>
                        {branch.code && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                            {branch.code}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate max-w-xs">{branch.address || "--"}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                      {branch.phone ? (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{branch.phone}</span>
                        </div>
                      ) : (
                        "--"
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* External Link shortcut to switch dashboard view */}
                        <button
                          type="button"
                          onClick={() => handleSwitchToBranch(branch)}
                          title="Switch to branch dashboard"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>

                        {/* Quick Edit modal */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(branch)}
                          title="Quick Edit Branch"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Edit Dialog */}
      <Dialog open={!!editingBranch} onOpenChange={(open) => !open && setEditingBranch(null)}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Update Branch
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateBranch} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g. Eastern Plaza Outlet"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="bg-slate-50 border-slate-200 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Location <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g. Shop 42, Level 5, Eastern Plaza, Dhaka"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                required
                className="bg-slate-50 border-slate-200 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Contact Number</Label>
              <Input
                placeholder="e.g. 01711223344"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="bg-slate-50 border-slate-200 rounded-xl font-mono text-sm"
              />
            </div>

            <DialogFooter className="pt-3 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingBranch(null)}
                className="rounded-xl border-slate-200"
              >
                Close
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
              >
                {isUpdating ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
