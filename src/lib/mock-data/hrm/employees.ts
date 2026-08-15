export type EmployeeRole = 'Admin' | 'Branch Admin' | 'Branch Manager' | 'Salesperson' | 'Purchase Manager' | 'Product Uploader' | 'Customer Service' | 'Technician' | 'SEO';

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  avatar?: string;
  email: string;
  phone: string;
  department: string;
  role: EmployeeRole;
  branch: string;
  joiningDate: string;
  status: "Active" | "Inactive" | "On Leave";
}

export const mockEmployees: Employee[] = [
  { id: "emp-1", employeeId: "EMP-001", name: "System Admin", email: "admin@erp.com", phone: "01711-000000", department: "IT", role: "Admin", branch: "Global", joiningDate: "2023-01-01", status: "Active" },
  { id: "emp-2", employeeId: "EMP-002", name: "Rahim Uddin", avatar: "https://i.pravatar.cc/150?u=rahim", email: "rahim@erp.com", phone: "01711-000001", department: "Sales", role: "Branch Manager", branch: "Dhaka Main Branch", joiningDate: "2023-02-15", status: "Active" },
  { id: "emp-3", employeeId: "EMP-003", name: "Karim Hasan", avatar: "https://i.pravatar.cc/150?u=karim", email: "karim@erp.com", phone: "01711-000002", department: "Sales", role: "Branch Manager", branch: "Chattogram Branch", joiningDate: "2023-03-01", status: "Active" },
  { id: "emp-4", employeeId: "EMP-004", name: "Hasan Tariq", email: "hasan@erp.com", phone: "01711-000003", department: "Sales", role: "Salesperson", branch: "Dhaka Main Branch", joiningDate: "2023-04-10", status: "Active" },
  { id: "emp-5", employeeId: "EMP-005", name: "Farid Ahmed", avatar: "https://i.pravatar.cc/150?u=farid", email: "farid@erp.com", phone: "01711-000004", department: "Purchase", role: "Purchase Manager", branch: "Central Warehouse", joiningDate: "2023-01-20", status: "Active" },
  { id: "emp-6", employeeId: "EMP-006", name: "Mina Akter", email: "mina@erp.com", phone: "01711-000005", department: "IT", role: "Product Uploader", branch: "Global", joiningDate: "2023-05-12", status: "Active" },
  { id: "emp-7", employeeId: "EMP-007", name: "Sadia Islam", avatar: "https://i.pravatar.cc/150?u=sadia", email: "sadia@erp.com", phone: "01711-000006", department: "Customer Support", role: "Customer Service", branch: "Global", joiningDate: "2023-06-01", status: "On Leave" },
  { id: "emp-8", employeeId: "EMP-008", name: "Arif Hossain", avatar: "https://i.pravatar.cc/150?u=arif", email: "arif@erp.com", phone: "01711-000007", department: "Technical/Repair", role: "Technician", branch: "Dhaka Main Branch", joiningDate: "2023-02-01", status: "Active" },
  { id: "emp-9", employeeId: "EMP-009", name: "Bijoy Chandra Sarkar", avatar: "https://i.pravatar.cc/150?u=bijoy", email: "bijoy@erp.com", phone: "01711-000008", department: "Marketing", role: "SEO", branch: "Global", joiningDate: "2023-01-10", status: "Active" },
  { id: "emp-10", employeeId: "EMP-010", name: "Tania Rahman", email: "tania@erp.com", phone: "01711-000009", department: "Sales", role: "Salesperson", branch: "Chattogram Branch", joiningDate: "2023-08-22", status: "Active" },
  { id: "emp-11", employeeId: "EMP-011", name: "Jamal Uddin", email: "jamal@erp.com", phone: "01711-000010", department: "Technical/Repair", role: "Technician", branch: "Chattogram Branch", joiningDate: "2023-09-05", status: "Active" },
  { id: "emp-12", employeeId: "EMP-012", name: "Kamrul Islam", email: "kamrul@erp.com", phone: "01711-000011", department: "Management", role: "Branch Admin", branch: "Dhaka Main Branch", joiningDate: "2023-11-15", status: "Inactive" },
];
