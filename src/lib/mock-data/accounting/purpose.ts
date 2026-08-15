export interface Purpose {
  id: string;
  name: string;
  category: "Income" | "Expense";
  usageCount: number;
}

export const mockPurposes: Purpose[] = [
  { id: "p1", name: "Salary Payment", category: "Expense", usageCount: 45 },
  { id: "p2", name: "Supplier Payment", category: "Expense", usageCount: 128 },
  { id: "p3", name: "Rent", category: "Expense", usageCount: 12 },
  { id: "p4", name: "Utility Bill", category: "Expense", usageCount: 36 },
  { id: "p5", name: "Product Purchase", category: "Expense", usageCount: 250 },
  { id: "p6", name: "Sales Revenue", category: "Income", usageCount: 1450 },
  { id: "p7", name: "Service Charge", category: "Income", usageCount: 320 },
  { id: "p8", name: "Owner Withdrawal", category: "Expense", usageCount: 5 },
  { id: "p9", name: "Bank Interest", category: "Income", usageCount: 0 },
];
