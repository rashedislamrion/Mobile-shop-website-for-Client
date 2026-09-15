import { Role, Module, Action, RolePermission } from "@/types/permissions";

const ALL_MODULES: Module[] = [
  'Dashboard', 'Sales', 'Customers', 'Orders', 'Sales Returns', 'Exchanges', 
  'Category', 'Products', 'Branch', 'Stock Adjustments', 'HRM', 'Report', 
  'Wallet', 'Expense', 'Suppliers', 'Purchase', 'Promotional Banner', 'Ads', 
  'Promo Code', 'Push Notification', 'Blogs', 'Help Requests', 'Help Notes', 
  'Business Settings', 'CMS', '3rd Party Configuration'
];
const ALL_ACTIONS: Action[] = ['Create', 'Read', 'Update', 'Delete'];

const fullAccess = (): RolePermission[] => ALL_MODULES.map(module => ({ module, actions: [...ALL_ACTIONS] }));

export const mockRoles: Role[] = [
  {
    id: "r1",
    name: "Admin",
    description: "Super administrator with access to all modules and global scope.",
    scope: "Global (All Branches)",
    employeeCount: 2,
    permissions: fullAccess()
  },
  {
    id: "r2",
    name: "Branch Admin",
    description: "Administers all operations within their assigned branch.",
    scope: "Own Branch Only",
    employeeCount: 3,
    permissions: fullAccess().map(p => ({ ...p, actions: ['CMS', 'Business Settings', 'HRM'].includes(p.module) ? ['Read'] : [...ALL_ACTIONS] }))
  },
  {
    id: "r3",
    name: "Branch Manager",
    description: "Manages branch sales, inventory, and staff.",
    scope: "Own Branch Only",
    employeeCount: 5,
    permissions: fullAccess().map(p => ({
      ...p,
      actions: ['Sales', 'Orders', 'Products', 'Stock Adjustments'].includes(p.module) ? [...ALL_ACTIONS] : ['Read']
    }))
  },
  {
    id: "r4",
    name: "Salesperson",
    description: "Handles POS and basic customer orders.",
    scope: "Own Branch Only",
    employeeCount: 15,
    permissions: ALL_MODULES.map(module => ({
      module,
      actions: (['Sales', 'Orders', 'Customers'].includes(module) ? ['Create', 'Read', 'Update'] : ['Read']) as Action[]
    })).filter(p => !['HRM', 'Business Settings', 'CMS', 'Report'].includes(p.module))
  },
  {
    id: "r5",
    name: "Purchase Manager",
    description: "Manages suppliers and purchase orders.",
    scope: "Global (All Branches)",
    employeeCount: 2,
    permissions: ALL_MODULES.map(module => ({
      module,
      actions: (['Purchase', 'Suppliers', 'Products', 'Category', 'Stock Adjustments'].includes(module) ? [...ALL_ACTIONS] : ['Read']) as Action[]
    })).filter(p => !['HRM', 'Business Settings', 'Sales'].includes(p.module))
  },
  {
    id: "r6",
    name: "Product Uploader",
    description: "Data entry for products and categories.",
    scope: "Global (All Branches)",
    employeeCount: 4,
    permissions: ALL_MODULES.map(module => ({
      module,
      actions: (['Products', 'Category'].includes(module) ? ['Create', 'Read', 'Update'] : ['Read']) as Action[]
    })).filter(p => !['HRM', 'Sales', 'Purchase'].includes(p.module))
  },
  {
    id: "r7",
    name: "Customer Service",
    description: "Handles customer inquiries and help requests.",
    scope: "Global (All Branches)",
    employeeCount: 8,
    permissions: ALL_MODULES.map(module => ({
      module,
      actions: (['Customers', 'Orders', 'Help Requests', 'Help Notes'].includes(module) ? ['Read', 'Update'] : []) as Action[]
    }))
  },
  {
    id: "r8",
    name: "Technician",
    description: "Repairs and services customer devices.",
    scope: "Own Branch Only",
    employeeCount: 6,
    permissions: ALL_MODULES.map(module => ({
      module,
      actions: (['Orders'].includes(module) ? ['Read', 'Update'] : []) as Action[]
    }))
  },
  {
    id: "r9",
    name: "SEO",
    description: "Manages content, blogs, and SEO metadata.",
    scope: "Global (All Branches)",
    employeeCount: 1,
    permissions: ALL_MODULES.map(module => ({
      module,
      actions: (['CMS', 'Blogs', 'Promotional Banner', 'Ads'].includes(module) ? [...ALL_ACTIONS] : ['Read']) as Action[]
    })).filter(p => !['HRM', 'Sales', 'Orders', 'Business Settings'].includes(p.module))
  }
];
