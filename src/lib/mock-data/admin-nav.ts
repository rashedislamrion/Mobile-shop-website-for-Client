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
  module?: string;
};

export type NavGroup = {
  groupLabel?: string;
  items: NavItem[];
};

export const adminNavConfig: NavGroup[] = [
  {
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard, module: "DASHBOARD" }
    ]
  },
  {
    groupLabel: "SALES",
    items: [
      {
        label: "Sales",
        icon: LineChart,
        module: "SALES",
        children: [
          { label: "Diagnosing Orders", href: "/admin/sales/diagnosing", module: "SALES" },
          { label: "Courier Sales", href: "/admin/sales/courier", module: "SALES" },
          { label: "All Sales", href: "/admin/sales/all", module: "SALES" },
          { label: "Service List", href: "/admin/sales/service", module: "SALES" },
          { label: "Courier List", href: "/admin/sales/courier-list", module: "SALES" }
        ]
      }
    ]
  },
  {
    groupLabel: "ORDER HANDLING",
    items: [
      { label: "Orders", href: "/admin/orders", icon: ShoppingCart, module: "ORDERS" },
      { label: "Sales Returns", href: "/admin/sales-returns", icon: Undo2, module: "SALES_RETURNS" },
      { label: "Exchanges", href: "/admin/exchanges", icon: Replace, module: "EXCHANGES" }
    ]
  },
  {
    items: [
      { label: "Category", href: "/admin/category", icon: Layers, module: "CATEGORY" },
      {
        label: "Products",
        icon: Package,
        module: "PRODUCTS",
        children: [
          { label: "All Products", href: "/admin/products", module: "PRODUCTS" },
          { label: "Wanted Products", href: "/admin/products/wanted", module: "PRODUCTS" },
          { label: "Brands", href: "/admin/products/brands", module: "PRODUCTS" },
          { label: "Series", href: "/admin/products/series", module: "PRODUCTS" },
          { label: "Units", href: "/admin/products/units", module: "PRODUCTS" },
          { label: "Attributes", href: "/admin/products/attributes", module: "PRODUCTS" },
          { label: "Bulk Import/Export", href: "/admin/products/bulk", module: "PRODUCTS" },
          { label: "Wasted Products", href: "/admin/products/wasted", module: "PRODUCTS" }
        ]
      }
    ]
  },
  {
    groupLabel: "BRANCH/WAREHOUSE MANAGEMENT",
    items: [
      { label: "Branch", href: "/admin/branch", icon: Store, module: "BRANCH" },
      { label: "Stock Adjustments", href: "/admin/stock-adjustments", icon: SlidersHorizontal, module: "STOCK_ADJUSTMENTS" }
    ]
  },
  {
    items: [
      {
        label: "HRM",
        icon: Briefcase,
        module: "HRM",
        children: [
          { label: "Employees", href: "/admin/hrm/employees", module: "HRM" },
          { label: "Technicians", href: "/admin/hrm/technicians", module: "HRM" },
          { label: "Departments", href: "/admin/hrm/departments", module: "HRM" },
          { label: "Roles & Permissions", href: "/admin/hrm/roles-permissions", module: "HRM" },
          { label: "Payroll", href: "/admin/hrm/payroll", module: "HRM" }
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
        module: "REPORT",
        children: [
          { label: "Product Analytics Report", href: "/admin/reports/product-analytics", module: "REPORT" },
          { label: "Customer Due Report", href: "/admin/reports/customer-due", module: "REPORT" },
          { label: "Supplier Due Report", href: "/admin/reports/supplier-due", module: "REPORT" },
          { label: "Summary Report", href: "/admin/reports/summary", module: "REPORT" },
          { label: "Discount Report", href: "/admin/reports/discount", module: "REPORT" }
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
        module: "WALLET",
        children: [
          { label: "Wallet Types", href: "/admin/accounting/wallet/types", module: "WALLET" },
          { label: "Deposit History", href: "/admin/accounting/wallet/deposit-history", module: "WALLET" },
          { label: "Purpose", href: "/admin/accounting/wallet/purpose", module: "WALLET" }
        ]
      },
      {
        label: "Expense",
        icon: Receipt,
        module: "EXPENSE",
        children: [
          { label: "All Expenses", href: "/admin/accounting/expense/all", module: "EXPENSE" },
          { label: "Expense Categories", href: "/admin/accounting/expense/categories", module: "EXPENSE" },
          { label: "Expense History", href: "/admin/accounting/expense/history", module: "EXPENSE" }
        ]
      },
      {
        label: "Suppliers",
        icon: Users2,
        module: "SUPPLIERS",
        children: [
          { label: "Supplier List", href: "/admin/accounting/suppliers", module: "SUPPLIERS" },
          { label: "Supplier Payments", href: "/admin/accounting/suppliers/payments", module: "SUPPLIERS" }
        ]
      },
      { label: "Purchase", href: "/admin/accounting/purchase", icon: ShoppingCart, module: "PURCHASE" }
    ]
  },
  {
    groupLabel: "MARKETING PROMOTIONS",
    items: [
      { label: "Promotional Banner", href: "/admin/marketing/banners", icon: MonitorPlay, module: "PROMOTIONAL_BANNER" },
      { label: "Ads", href: "/admin/marketing/ads", icon: Megaphone, module: "ADS" },
      { label: "Promo Code", href: "/admin/marketing/promo-code", icon: Ticket, module: "PROMO_CODE" },
      { label: "Push Notification", href: "/admin/marketing/push-notification", icon: BellRing, module: "PUSH_NOTIFICATION" },
      { label: "Blogs", href: "/admin/marketing/blogs", icon: Newspaper, module: "BLOGS" }
    ]
  },
  {
    groupLabel: "ASSISTANCE/SUPPORT",
    items: [
      { label: "Help Requests", href: "/admin/support/requests", icon: HelpCircle, module: "HELP_REQUESTS" },
      { label: "Help Notes", href: "/admin/support/notes", icon: MessageSquare, module: "HELP_NOTES" }
    ]
  },
  {
    groupLabel: "BUSINESS ADMINISTRATION",
    items: [
      {
        label: "Business Settings",
        icon: Settings,
        module: "BUSINESS_SETTINGS",
        children: [
          { label: "General Settings", href: "/admin/business/general", module: "BUSINESS_SETTINGS" }
        ]
      },
      {
        label: "CMS",
        icon: LayoutTemplate,
        module: "CMS",
        children: [
          { label: "Pages", href: "/admin/cms/pages", module: "CMS" },
          { label: "Menus", href: "/admin/cms/menus", module: "CMS" },
          { label: "Footer", href: "/admin/cms/footer", module: "CMS" },
          { label: "Country List", href: "/admin/cms/countries", module: "CMS" },
          { label: "Social Links", href: "/admin/cms/social", module: "CMS" },
          { label: "Contact Us", href: "/admin/cms/contact", module: "CMS" },
          { label: "Ticket Issue Types", href: "/admin/cms/ticket-issues", module: "CMS" }
        ]
      },
      { label: "3rd Party Configuration", href: "/admin/3rd-party", icon: Fingerprint, module: "THIRD_PARTY_CONFIG" }
    ]
  }
];
