"use client";

import { useEffect, useState, useCallback } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { Check, Shield, Users, Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { apiGet, apiPatch } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";

interface RoleItem {
  id: string;
  name: string;
  description: string | null;
  scope: string;
  isSystem: boolean;
  _count?: { staff: number };
}

interface PermissionItem {
  module: string;
  action: "CREATE" | "READ" | "UPDATE" | "DELETE";
  allowed: boolean;
}

const MODULE_DISPLAY_NAMES: Record<string, string> = {
  DASHBOARD: "Dashboard",
  SALES: "Sales",
  CUSTOMERS: "Customers",
  ORDERS: "Orders",
  SALES_RETURNS: "Sales Returns",
  EXCHANGES: "Exchanges",
  CATEGORY: "Category",
  PRODUCTS: "Products",
  BRANCH: "Branch",
  STOCK_ADJUSTMENTS: "Stock Adjustments",
  HRM: "HRM & Payroll",
  REPORT: "Reports & Analytics",
  WALLET: "Wallet & Accounts",
  EXPENSE: "Expenses",
  SUPPLIERS: "Suppliers",
  PURCHASE: "Purchase Orders",
  PROMOTIONAL_BANNER: "Promotional Banner",
  ADS: "Advertisements",
  PROMO_CODE: "Promo Codes",
  PUSH_NOTIFICATION: "Push Notifications",
  BLOGS: "Blogs & Articles",
  HELP_REQUESTS: "Help Requests",
  HELP_NOTES: "Help Notes",
  BUSINESS_SETTINGS: "Business Settings",
  CMS: "Content Management",
  THIRD_PARTY_CONFIG: "3rd Party Config",
};

export default function RolesPermissionsPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [currentRole, setCurrentRole] = useState<RoleItem | null>(null);
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>({});
  const [roleScope, setRoleScope] = useState<string>("GLOBAL");
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [isLoadingPerms, setIsLoadingPerms] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTitle("Roles & Permissions");
    setBadge("Website");
    setDateFilter(""); 
  }, [setTitle, setBadge, setDateFilter]);

  useEffect(() => {
    setIsLoadingRoles(true);
    apiGet<RoleItem[]>("/roles")
      .then((res) => {
        const list = Array.isArray(res) ? res : [];
        setRoles(list);
        if (list.length > 0) {
          const defaultRole = list.find((r) => r.name === "Branch Manager") || list[0];
          setSelectedRoleId(defaultRole.id);
        }
      })
      .catch((err) => {
        toast.error(err.message || "Failed to load roles");
      })
      .finally(() => {
        setIsLoadingRoles(false);
      });
  }, []);

  const loadRolePermissions = useCallback(async (roleId: string) => {
    if (!roleId) return;
    try {
      setIsLoadingPerms(true);
      const res = await apiGet<{
        role: RoleItem;
        permissions: PermissionItem[];
      }>(`/roles/${roleId}/permissions`);

      setCurrentRole(res.role);
      setRoleScope(res.role.scope || "GLOBAL");

      const map: Record<string, Record<string, boolean>> = {};
      res.permissions.forEach((p) => {
        if (!map[p.module]) map[p.module] = {};
        map[p.module][p.action] = p.allowed;
      });

      setPermissions(map);
    } catch (err: any) {
      toast.error(err.message || "Failed to load role permissions");
    } finally {
      setIsLoadingPerms(false);
    }
  }, []);

  useEffect(() => {
    if (selectedRoleId) {
      loadRolePermissions(selectedRoleId);
    }
  }, [selectedRoleId, loadRolePermissions]);

  const handleToggle = (moduleKey: string, action: "CREATE" | "READ" | "UPDATE" | "DELETE") => {
    if (currentRole?.name === "Admin") {
      toast.error("Super Admin permissions cannot be restricted.");
      return;
    }

    setPermissions((prev) => {
      const moduleObj = { ...(prev[moduleKey] || {}) };
      moduleObj[action] = !moduleObj[action];
      return {
        ...prev,
        [moduleKey]: moduleObj,
      };
    });
  };

  const handleToggleAllForModule = (moduleKey: string, enable: boolean) => {
    if (currentRole?.name === "Admin") {
      toast.error("Super Admin permissions cannot be modified.");
      return;
    }

    setPermissions((prev) => {
      return {
        ...prev,
        [moduleKey]: {
          CREATE: enable,
          READ: enable,
          UPDATE: enable,
          DELETE: enable,
        },
      };
    });
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;
    try {
      setIsSaving(true);

      const flatPerms: PermissionItem[] = [];
      Object.entries(permissions).forEach(([mod, actions]) => {
        Object.entries(actions).forEach(([act, allowed]) => {
          flatPerms.push({
            module: mod,
            action: act as any,
            allowed: Boolean(allowed),
          });
        });
      });

      await apiPatch(`/roles/${selectedRoleId}/permissions`, {
        scope: roleScope,
        permissions: flatPerms,
      });

      toast.success(`${currentRole?.name || "Role"} permissions saved successfully`);
      loadRolePermissions(selectedRoleId);
    } catch (err: any) {
      toast.error(err.message || "Failed to save permissions");
    } finally {
      setIsSaving(false);
    }
  };

  const modulesList = Object.keys(MODULE_DISPLAY_NAMES);

  return (
    <div className="flex flex-col lg:flex-row gap-6 relative items-start">
      
      {/* LEFT SIDEBAR: Role Selection */}
      <div className="w-full lg:w-64 shrink-0 bg-white border border-slate-200 rounded-xl overflow-hidden sticky top-6">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <h3 className="font-semibold text-slate-800">System Roles</h3>
          </div>
          <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
            {roles.length}
          </span>
        </div>

        {isLoadingRoles ? (
          <div className="p-3 space-y-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                  selectedRoleId === role.id 
                    ? "bg-emerald-50 text-emerald-700 font-semibold" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span>{role.name}</span>
                <span className="text-xs text-slate-400 font-normal">
                  {role._count?.staff || 0}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Permission Matrix */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden w-full">
        {/* Header with Scope & Save */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-slate-800">{currentRole?.name || "Select a Role"}</h3>
              {currentRole?.isSystem && (
                <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded font-medium">System Role</span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Configure module-level permissions and access control scope for this role.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600">Scope:</label>
              <select
                value={roleScope}
                onChange={(e) => setRoleScope(e.target.value)}
                disabled={currentRole?.name === "Admin"}
                className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              >
                <option value="GLOBAL">Global (All Data)</option>
                <option value="OWN_BRANCH">Own Branch Only</option>
                <option value="OWN_DATA">Own Data Only</option>
              </select>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving || currentRole?.name === "Admin"}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Matrix"}
            </button>
          </div>
        </div>

        {/* Matrix Grid */}
        {isLoadingPerms ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Module Name</th>
                  <th className="py-3.5 px-4 text-center">View (READ)</th>
                  <th className="py-3.5 px-4 text-center">Create (CREATE)</th>
                  <th className="py-3.5 px-4 text-center">Edit (UPDATE)</th>
                  <th className="py-3.5 px-4 text-center">Delete (DELETE)</th>
                  <th className="py-3.5 px-6 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {modulesList.map((moduleKey) => {
                  const modPerms = permissions[moduleKey] || {
                    READ: false,
                    CREATE: false,
                    UPDATE: false,
                    DELETE: false,
                  };
                  const allEnabled = modPerms.READ && modPerms.CREATE && modPerms.UPDATE && modPerms.DELETE;

                  return (
                    <tr key={moduleKey} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-slate-800">
                        {MODULE_DISPLAY_NAMES[moduleKey] || moduleKey}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <Switch
                          checked={Boolean(modPerms.READ)}
                          onCheckedChange={() => handleToggle(moduleKey, "READ")}
                          disabled={currentRole?.name === "Admin"}
                        />
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <Switch
                          checked={Boolean(modPerms.CREATE)}
                          onCheckedChange={() => handleToggle(moduleKey, "CREATE")}
                          disabled={currentRole?.name === "Admin"}
                        />
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <Switch
                          checked={Boolean(modPerms.UPDATE)}
                          onCheckedChange={() => handleToggle(moduleKey, "UPDATE")}
                          disabled={currentRole?.name === "Admin"}
                        />
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <Switch
                          checked={Boolean(modPerms.DELETE)}
                          onCheckedChange={() => handleToggle(moduleKey, "DELETE")}
                          disabled={currentRole?.name === "Admin"}
                        />
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleAllForModule(moduleKey, !allEnabled)}
                          disabled={currentRole?.name === "Admin"}
                          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-40"
                        >
                          {allEnabled ? "Disable All" : "Enable All"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
