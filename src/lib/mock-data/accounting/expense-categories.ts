export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string; // lucide icon name
  monthlyBudget: number | null;
  thisMonthSpend: number;
}

export const mockExpenseCategories: ExpenseCategory[] = [
  {
    id: "ec1",
    name: "Rent",
    icon: "Building2",
    monthlyBudget: 150000,
    thisMonthSpend: 150000
  },
  {
    id: "ec2",
    name: "Utilities",
    icon: "Zap",
    monthlyBudget: 25000,
    thisMonthSpend: 28500 // over budget
  },
  {
    id: "ec3",
    name: "Salary",
    icon: "Users",
    monthlyBudget: 350000,
    thisMonthSpend: 330000
  },
  {
    id: "ec4",
    name: "Marketing",
    icon: "Megaphone",
    monthlyBudget: 50000,
    thisMonthSpend: 42000
  },
  {
    id: "ec5",
    name: "Repair & Maintenance",
    icon: "Wrench",
    monthlyBudget: null,
    thisMonthSpend: 12500
  },
  {
    id: "ec6",
    name: "Transport",
    icon: "Truck",
    monthlyBudget: 15000,
    thisMonthSpend: 8000
  }
];
