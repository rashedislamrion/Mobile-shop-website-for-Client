export interface DiscountRecord {
  id: string;
  date: string;
  orderCode: string;
  branch: string;
  customerName: string;
  originalTotal: number;
  discountApplied: {
    amount: number;
    percentage: number;
  };
  finalTotal: number;
  paymentStatus: "Paid" | "Pending" | "Partial";
}

export const mockDiscountData: DiscountRecord[] = [
  {
    id: "d1",
    date: "2026-08-15",
    orderCode: "EM009252",
    branch: "Dhaka Main Branch",
    customerName: "Rahim Uddin",
    originalTotal: 150000,
    discountApplied: { amount: 5000, percentage: 3.3 },
    finalTotal: 145000,
    paymentStatus: "Paid"
  },
  {
    id: "d2",
    date: "2026-08-14",
    orderCode: "EM009251",
    branch: "Global",
    customerName: "Sumi Akter",
    originalTotal: 25000,
    discountApplied: { amount: 2500, percentage: 10 },
    finalTotal: 22500,
    paymentStatus: "Paid"
  },
  {
    id: "d3",
    date: "2026-08-14",
    orderCode: "EM009250",
    branch: "Chattogram Branch",
    customerName: "Karim Hassan",
    originalTotal: 8500,
    discountApplied: { amount: 850, percentage: 10 },
    finalTotal: 7650,
    paymentStatus: "Pending"
  },
  {
    id: "d4",
    date: "2026-08-13",
    orderCode: "EM009249",
    branch: "Dhaka Main Branch",
    customerName: "Arifur Rahman",
    originalTotal: 320000,
    discountApplied: { amount: 15000, percentage: 4.7 },
    finalTotal: 305000,
    paymentStatus: "Partial"
  },
  {
    id: "d5",
    date: "2026-08-13",
    orderCode: "EM009248",
    branch: "Global",
    customerName: "Nusrat Jahan",
    originalTotal: 4500,
    discountApplied: { amount: 225, percentage: 5 },
    finalTotal: 4275,
    paymentStatus: "Paid"
  }
];
