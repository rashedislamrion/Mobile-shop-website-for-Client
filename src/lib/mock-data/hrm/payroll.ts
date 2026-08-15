import { mockEmployees } from "./employees";

export interface PayrollRecord {
  id: string;
  employeeId: string; // references mockEmployees
  employeeName: string;
  avatar?: string;
  role: string;
  department: string;
  month: string; // e.g., "2026-08"
  basicSalary: number;
  allowances: { name: string; amount: number }[];
  deductions: { name: string; amount: number }[];
  netSalary: number;
  status: "Paid" | "Pending" | "Processing";
  paymentDate?: string;
}

export const mockPayroll: PayrollRecord[] = mockEmployees.map((emp, i) => {
  const isPaid = i % 3 !== 0;
  
  const basicSalary = emp.role === "Admin" ? 80000 : 
                      emp.role === "Branch Manager" ? 60000 : 
                      emp.role === "Technician" ? 40000 : 30000;
  
  const allowances = [
    { name: "House Rent", amount: basicSalary * 0.4 },
    { name: "Medical", amount: basicSalary * 0.1 },
    { name: "Transport", amount: 2000 }
  ];
  
  const totalAllowances = allowances.reduce((sum, a) => sum + a.amount, 0);
  
  const deductions = i % 4 === 0 ? [{ name: "Advance Loan", amount: 5000 }] : [];
  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);

  return {
    id: `pay-${i + 1}`,
    employeeId: emp.id,
    employeeName: emp.name,
    avatar: emp.avatar,
    role: emp.role,
    department: emp.department,
    month: "2026-08",
    basicSalary,
    allowances,
    deductions,
    netSalary: basicSalary + totalAllowances - totalDeductions,
    status: isPaid ? "Paid" : (i % 2 === 0 ? "Processing" : "Pending"),
    paymentDate: isPaid ? "2026-08-01" : undefined
  };
});
