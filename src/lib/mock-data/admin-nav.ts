import {
  LayoutDashboard,
  LineChart,
  Users,
  ShoppingCart,
  Undo2,
  Replace,
  Layers,
  Package,
  Store,
  SlidersHorizontal,
  Briefcase,
  PieChart,
  Receipt,
  Users2,
  Wallet,
  MonitorPlay,
  Megaphone,
  Ticket,
  BellRing,
  Newspaper,
  HelpCircle,
  MessageSquare,
  Globe,
  Settings,
  LayoutTemplate,
  Fingerprint,
  PhoneCall
} from "lucide-react";
import { ElementType } from "react";

export type NavItem = {
  label: string;
  href?: string;
  icon?: ElementType;
  children?: NavItem[];
};

export type NavGroup = {
  groupLabel?: string;
  items: NavItem[];
};

export const adminNavConfig: NavGroup[] = [
  {
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard }
    ]
  },
  {
    groupLabel: "SALES",
    items: [
      {
        label: "Sales",
        icon: LineChart,
        children: [
          { label: "Diagnosing Orders", href: "/admin/sales/diagnosing" },
          { label: "Courier Sales", href: "/admin/sales/courier" },
          { label: "All Sales", href: "/admin/sales/all" },
          { label: "Service List", href: "/admin/sales/service" },
          { label: "Courier List", href: "/admin/sales/courier-list" }
        ]
      },
      { label: "Customers", href: "/admin/customers", icon: Users }
    ]
  },
  {
    groupLabel: "ORDER HANDLING",
    items: [
      { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { label: "Sales Returns", href: "/admin/sales-returns", icon: Undo2 },
      { label: "Exchanges", href: "/admin/exchanges", icon: Replace }
    ]
  },
  {
    items: [
      { label: "Category", href: "/admin/category", icon: Layers },
      {
        label: "Products",
        icon: Package,
        children: [
          { label: "All Products", href: "/admin/products" },
          { label: "Wanted Products", href: "/admin/products/wanted" },
          { label: "Brands", href: "/admin/products/brands" },
          { label: "Series", href: "/admin/products/series" },
          { label: "Units", href: "/admin/products/units" },
          { label: "Attributes", href: "/admin/products/attributes" },
          { label: "Bulk Import/Export", href: "/admin/products/bulk" },
          { label: "Wasted Products", href: "/admin/products/wasted" }
        ]
      }
    ]
  },
  {
    groupLabel: "BRANCH/WAREHOUSE MANAGEMENT",
    items: [
      { label: "Branch", href: "/admin/branch", icon: Store },
      { label: "Stock Adjustments", href: "/admin/stock-adjustments", icon: SlidersHorizontal }
    ]
  },
  {
    items: [
      {
        label: "HRM",
        icon: Briefcase,
        children: [
          { label: "Employees", href: "/admin/hrm/employees" },
          { label: "Technicians", href: "/admin/hrm/technicians" },
          { label: "Departments", href: "/admin/hrm/departments" },
          { label: "Roles & Permissions", href: "/admin/hrm/roles-permissions" },
          { label: "Payroll", href: "/admin/hrm/payroll" }
        ]
      }
    ]
  },
  {
    groupLabel: "SUMMARY",
    items: [
      {
        label: "Report",
        icon: PieChart,
        children: [
          { label: "Product Analytics Report", href: "/admin/reports/product-analytics" },
          { label: "Customer Due Report", href: "/admin/reports/customer-due" },
          { label: "Supplier Due Report", href: "/admin/reports/supplier-due" },
          { label: "Summary Report", href: "/admin/reports/summary" },
          { label: "Discount Report", href: "/admin/reports/discount" }
        ]
      }
    ]
  },
  {
    groupLabel: "ACCOUNTING",
    items: [
      {
        label: "Wallet",
        icon: Wallet,
        children: [
          { label: "Wallet Types", href: "/admin/accounting/wallet/types" },
          { label: "Deposit History", href: "/admin/accounting/wallet/deposit-history" },
          { label: "Purpose", href: "/admin/accounting/wallet/purpose" }
        ]
      },
      {
        label: "Expense",
        icon: Receipt,
        children: [
          { label: "All Expenses", href: "/admin/accounting/expense/all" },
          { label: "Expense Categories", href: "/admin/accounting/expense/categories" },
          { label: "Expense History", href: "/admin/accounting/expense/history" }
        ]
      },
      {
        label: "Suppliers",
        icon: Users2,
        children: [
          { label: "Supplier List", href: "/admin/accounting/suppliers" },
          { label: "Supplier Payments", href: "/admin/accounting/suppliers/payments" }
        ]
      },
      { label: "Purchase", href: "/admin/accounting/purchase", icon: ShoppingCart }
    ]
  },
  {
    groupLabel: "MARKETING PROMOTIONS",
    items: [
      { label: "Promotional Banner", href: "/admin/marketing/banners", icon: MonitorPlay },
      { label: "Ads", href: "/admin/marketing/ads", icon: Megaphone },
      { label: "Promo Code", href: "/admin/marketing/promo-code", icon: Ticket },
      { label: "Push Notification", href: "/admin/marketing/push-notification", icon: BellRing },
      { label: "Blogs", href: "/admin/marketing/blogs", icon: Newspaper }
    ]
  },
  {
    groupLabel: "ASSISTANCE/SUPPORT",
    items: [
      { label: "Help Requests", href: "/admin/support/requests", icon: HelpCircle },
      { label: "Help Notes", href: "/admin/support/notes", icon: MessageSquare }
    ]
  },
  {
    groupLabel: "LANGUAGE SETTINGS",
    items: [
      { label: "Languages", href: "/admin/languages", icon: Globe }
    ]
  },
  {
    groupLabel: "BUSINESS ADMINISTRATION",
    items: [
      {
        label: "Business Settings",
        icon: Settings,
        children: [
          { label: "General Settings", href: "/admin/business/general" }
        ]
      },
      {
        label: "CMS",
        icon: LayoutTemplate,
        children: [
          { label: "Pages", href: "/admin/cms/pages" },
          { label: "Menus", href: "/admin/cms/menus" },
          { label: "Footer", href: "/admin/cms/footer" },
          { label: "Country List", href: "/admin/cms/countries" },
          { label: "Social Links", href: "/admin/cms/social" },
          { label: "Contact Us", href: "/admin/cms/contact" },
          { label: "Ticket Issue Types", href: "/admin/cms/ticket-issues" }
        ]
      },
      { label: "3rd Party Configuration", href: "/admin/3rd-party", icon: Fingerprint },
      { label: "Country", href: "/admin/country", icon: Globe },
      { label: "Contact Us", href: "/admin/contact", icon: PhoneCall }
    ]
  }
];
