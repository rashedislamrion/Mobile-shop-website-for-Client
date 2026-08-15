export interface ExpenseRecord {
  id: string;
  date: string;
  referenceNo: string;
  branch: string;
  category: string;
  description: string;
  amount: number;
  paidVia: string;
  status: "Paid" | "Pending";
  recordedBy: string;
}

export const mockExpenses: ExpenseRecord[] = [
  {
    id: "e1",
    date: "2026-08-15",
    referenceNo: "EXP-001",
    branch: "Dhaka Main Branch",
    category: "Utilities",
    description: "August Electricity Bill",
    amount: 12500,
    paidVia: "Bank - DBBL",
    status: "Paid",
    recordedBy: "Admin User"
  },
  {
    id: "e2",
    date: "2026-08-14",
    referenceNo: "EXP-002",
    branch: "Global",
    category: "Marketing",
    description: "Facebook Ads Boost",
    amount: 15000,
    paidVia: "bKash Merchant",
    status: "Paid",
    recordedBy: "Marketing Head"
  },
  {
    id: "e3",
    date: "2026-08-14",
    referenceNo: "EXP-003",
    branch: "Chattogram Branch",
    category: "Rent",
    description: "September Shop Rent Advance",
    amount: 45000,
    paidVia: "Bank - City Bank",
    status: "Pending",
    recordedBy: "Branch Manager"
  },
  {
    id: "e4",
    date: "2026-08-12",
    referenceNo: "EXP-004",
    branch: "Dhaka Main Branch",
    category: "Repair & Maintenance",
    description: "AC servicing",
    amount: 3500,
    paidVia: "Cash in Hand",
    status: "Paid",
    recordedBy: "Admin User"
  },
  {
    id: "e5",
    date: "2026-08-10",
    referenceNo: "EXP-005",
    branch: "Global",
    category: "Transport",
    description: "Delivery van fuel",
    amount: 2000,
    paidVia: "Cash in Hand",
    status: "Paid",
    recordedBy: "Driver Rahim"
  },
  {
    id: "e6",
    date: "2026-08-05",
    referenceNo: "EXP-006",
    branch: "Dhaka Main Branch",
    category: "Salary",
    description: "July Staff Salary",
    amount: 330000,
    paidVia: "Bank - DBBL",
    status: "Paid",
    recordedBy: "Finance Dept"
  }
];
