export interface CustomerDueRecord {
  id: string;
  customerName: string;
  avatar: string;
  phone: string;
  branch: string;
  totalOrders: number;
  totalPurchased: number;
  totalPaid: number;
  dueAmount: number;
  lastPaymentDate: string;
}

export const mockCustomerDues: CustomerDueRecord[] = [
  {
    id: "c1",
    customerName: "Rahim Uddin",
    avatar: "https://i.pravatar.cc/150?u=rahim",
    phone: "+8801711223344",
    branch: "Dhaka Main Branch",
    totalOrders: 12,
    totalPurchased: 250000,
    totalPaid: 245000,
    dueAmount: 5000,
    lastPaymentDate: "2026-08-10"
  },
  {
    id: "c2",
    customerName: "Karim Hassan",
    avatar: "https://i.pravatar.cc/150?u=karim",
    phone: "+8801811223344",
    branch: "Chattogram Branch",
    totalOrders: 5,
    totalPurchased: 120000,
    totalPaid: 100000,
    dueAmount: 20000,
    lastPaymentDate: "2026-07-25"
  },
  {
    id: "c3",
    customerName: "Sumi Akter",
    avatar: "https://i.pravatar.cc/150?u=sumi",
    phone: "+8801911223344",
    branch: "Dhaka Main Branch",
    totalOrders: 3,
    totalPurchased: 85000,
    totalPaid: 85000,
    dueAmount: 0,
    lastPaymentDate: "2026-08-12"
  },
  {
    id: "c4",
    customerName: "Arifur Rahman",
    avatar: "https://i.pravatar.cc/150?u=arif",
    phone: "+8801611223344",
    branch: "Global",
    totalOrders: 8,
    totalPurchased: 450000,
    totalPaid: 440000,
    dueAmount: 10000,
    lastPaymentDate: "2026-08-01"
  },
  {
    id: "c5",
    customerName: "Nusrat Jahan",
    avatar: "https://i.pravatar.cc/150?u=nusrat",
    phone: "+8801511223344",
    branch: "Chattogram Branch",
    totalOrders: 2,
    totalPurchased: 45000,
    totalPaid: 44500,
    dueAmount: 500,
    lastPaymentDate: "2026-08-14"
  },
  {
    id: "c6",
    customerName: "Mehedi Hasan",
    avatar: "https://i.pravatar.cc/150?u=mehedi",
    phone: "+8801722334455",
    branch: "Dhaka Main Branch",
    totalOrders: 15,
    totalPurchased: 680000,
    totalPaid: 650000,
    dueAmount: 30000,
    lastPaymentDate: "2026-06-30"
  },
  {
    id: "c7",
    customerName: "Tariqul Islam",
    avatar: "https://i.pravatar.cc/150?u=tariqul",
    phone: "+8801822334455",
    branch: "Global",
    totalOrders: 1,
    totalPurchased: 12000,
    totalPaid: 12000,
    dueAmount: 0,
    lastPaymentDate: "2026-08-15"
  },
  {
    id: "c8",
    customerName: "Sabrina Rahman",
    avatar: "https://i.pravatar.cc/150?u=sabrina",
    phone: "+8801922334455",
    branch: "Chattogram Branch",
    totalOrders: 4,
    totalPurchased: 110000,
    totalPaid: 108000,
    dueAmount: 2000,
    lastPaymentDate: "2026-08-05"
  }
];
