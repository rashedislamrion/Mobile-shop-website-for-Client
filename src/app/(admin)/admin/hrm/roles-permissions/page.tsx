"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { mockRoles } from "@/lib/mock-data/hrm/role-permissions";
import { EmployeeRole } from "@/lib/mock-data/hrm/employees";
import { Check, Shield, Users, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

const ROLES: EmployeeRole[] = [
  "Admin",
  "Branch Admin",
  "Branch Manager",
  "Salesperson",
  "Purchase Manager",
  "Product Uploader",
  "Customer Service",
  "Technician",
  "SEO",
];

const MODULES = [
  'Dashboard', 'Sales', 'Customers', 'Orders', 'Sales Returns', 'Exchanges', 
  'Category', 'Products', 'Branch', 'Stock Adjustments', 'HRM', 'Report', 
  'Wallet', 'Expense', 'Suppliers', 'Purchase', 'Promotional Banner', 'Ads', 
  'Promo Code', 'Push Notification', 'Blogs', 'Help Requests', 'Help Notes', 
  'Business Settings', 'CMS', '3rd Party Configuration'
];

type RolePermissionMap = Record<string, Record<string, Record<string, boolean>>>;

const initialPermissions: RolePermissionMap = {};
mockRoles.forEach(role => {
  initialPermissions[role.name] = {};
  role.permissions.forEach(p => {
    initialPermissions[role.name][p.module] = {
      view: p.actions.includes("Read"),
      create: p.actions.includes("Create"),
      edit: p.actions.includes("Update"),
      delete: p.actions.includes("Delete"),
      export: p.actions.includes("Read"), // Just mapped for UI purposes
    };
  });
});

export default function RolesPermissionsPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [selectedRole, setSelectedRole] = useState<EmployeeRole>("Branch Manager");
  const [permissions, setPermissions] = useState<RolePermissionMap>(initialPermissions);

  useEffect(() => {
    setTitle("Roles & Permissions");
    setBadge("Website");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggle = (moduleName: string, permissionKey: string) => {
    if (selectedRole === "Admin") {
      toast.error("Admin permissions cannot be modified.");
      return;
    }

    setPermissions(prev => {
      const rolePerms = { ...prev[selectedRole] };
      const modulePerms = { ...(rolePerms[moduleName] || { view: false, create: false, edit: false, delete: false, export: false }) };
      
      // @ts-ignore
      modulePerms[permissionKey] = !modulePerms[permissionKey];
      rolePerms[moduleName] = modulePerms;

      return {
        ...prev,
        [selectedRole]: rolePerms
      };
    });
  };

  const handleSave = () => {
    toast.success(`${selectedRole} permissions saved successfully.`);
  };

  const currentPerms = permissions[selectedRole] || {};

  return (
    <div className="flex flex-col lg:flex-row gap-6 relative items-start">
      
      {/* LEFT SIDEBAR: Role Selection */}
      <div className="w-full lg:w-64 shrink-0 bg-white border border-slate-200 rounded-xl overflow-hidden sticky top-6">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          <h3 className="font-semibold text-slate-800">System Roles</h3>
        </div>
        <div className="p-2 space-y-1">
          {ROLES.map(role => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                selectedRole === role 
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className={`w-4 h-4 ${selectedRole === role ? 'text-emerald-500' : 'text-slate-400'}`} />
                {role}
              </div>
              {role === "Admin" && <Shield className="w-3.5 h-3.5 text-purple-500" />}
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT CONTENT: Matrix */}
      <div className="flex-1 min-w-0 bg-white border border-slate-200 rounded-xl overflow-hidden">
        
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Permissions for <span className="text-emerald-600">{selectedRole}</span>
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Configure what users with this role can see and do in the system.
            </p>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={selectedRole === "Admin"}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>

        {selectedRole === "Admin" && (
          <div className="m-5 p-4 bg-purple-50 border border-purple-100 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-purple-900">Full System Access</h4>
              <p className="text-sm text-purple-700 mt-1">The Admin role has unrestricted access to all modules and actions. These permissions cannot be modified.</p>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">Module</th>
                <th className="px-4 py-4 font-semibold text-slate-700 text-center w-24">View</th>
                <th className="px-4 py-4 font-semibold text-slate-700 text-center w-24">Create</th>
                <th className="px-4 py-4 font-semibold text-slate-700 text-center w-24">Edit</th>
                <th className="px-4 py-4 font-semibold text-slate-700 text-center w-24">Delete</th>
                <th className="px-4 py-4 font-semibold text-slate-700 text-center w-24">Export</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MODULES.map(module => {
                const modPerms = currentPerms[module] || { view: false, create: false, edit: false, delete: false, export: false };
                const isAdmin = selectedRole === "Admin";
                
                return (
                  <tr key={module} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{module}</td>
                    
                    {['view', 'create', 'edit', 'delete', 'export'].map((perm) => (
                      <td key={perm} className="px-4 py-4 text-center">
                        {isAdmin ? (
                          <div className="flex justify-center">
                            <Check className="w-4 h-4 text-slate-300" />
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <Switch 
                              // @ts-ignore
                              checked={modPerms[perm] || false}
                              onCheckedChange={() => handleToggle(module, perm)}
                              disabled={isAdmin}
                            />
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
