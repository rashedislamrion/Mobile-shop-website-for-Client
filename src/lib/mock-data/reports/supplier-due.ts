export interface SupplierDueRecord {
  id: string;
  supplierName: string;
  logo: string;
  contact: string;
  branch: string;
  totalPurchases: number;
  totalPaid: number;
  dueAmount: number;
  lastPaymentDate: string;
}

export const mockSupplierDues: SupplierDueRecord[] = [
  {
    id: "s1",
    supplierName: "Apple Distributors BD",
    logo: "https://i.pravatar.cc/150?u=apple",
    contact: "contact@appledist.bd",
    branch: "Global",
    totalPurchases: 15000000,
    totalPaid: 14500000,
    dueAmount: 500000,
    lastPaymentDate: "2026-08-01"
  },
  {
    id: "s2",
    supplierName: "Samsung Electronics",
    logo: "https://i.pravatar.cc/150?u=samsung",
    contact: "sales@samsung.com.bd",
    branch: "Global",
    totalPurchases: 12000000,
    totalPaid: 12000000,
    dueAmount: 0,
    lastPaymentDate: "2026-08-10"
  },
  {
    id: "s3",
    supplierName: "Gadget Wholesalers",
    logo: "https://i.pravatar.cc/150?u=gadget",
    contact: "wholesale@gadgetbd.com",
    branch: "Dhaka Main Branch",
    totalPurchases: 2500000,
    totalPaid: 2000000,
    dueAmount: 500000,
    lastPaymentDate: "2026-07-15"
  },
  {
    id: "s4",
    supplierName: "Baseus Official BD",
    logo: "https://i.pravatar.cc/150?u=baseus",
    contact: "info@baseus.com.bd",
    branch: "Chattogram Branch",
    totalPurchases: 800000,
    totalPaid: 750000,
    dueAmount: 50000,
    lastPaymentDate: "2026-08-12"
  },
  {
    id: "s5",
    supplierName: "Xiaomi Imports",
    logo: "https://i.pravatar.cc/150?u=xiaomi",
    contact: "import@xiaomibd.com",
    branch: "Global",
    totalPurchases: 5000000,
    totalPaid: 4200000,
    dueAmount: 800000,
    lastPaymentDate: "2026-06-30"
  },
  {
    id: "s6",
    supplierName: "Local Accessories Hub",
    logo: "https://i.pravatar.cc/150?u=hub",
    contact: "+8801711000000",
    branch: "Dhaka Main Branch",
    totalPurchases: 450000,
    totalPaid: 450000,
    dueAmount: 0,
    lastPaymentDate: "2026-08-14"
  }
];
