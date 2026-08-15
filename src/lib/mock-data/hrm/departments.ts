export interface Department {
  id: string;
  name: string;
  headId?: string;
  headName?: string;
  headAvatar?: string;
  employeeCount: number;
  status: "Active" | "Inactive";
}

export const mockDepartments: Department[] = [
  {
    id: "dep-1",
    name: "Sales",
    headId: "emp-2",
    headName: "Rahim Uddin",
    headAvatar: "https://i.pravatar.cc/150?u=rahim",
    employeeCount: 15,
    status: "Active"
  },
  {
    id: "dep-2",
    name: "Technical/Repair",
    headId: "emp-8",
    headName: "Arif Hossain",
    headAvatar: "https://i.pravatar.cc/150?u=arif",
    employeeCount: 8,
    status: "Active"
  },
  {
    id: "dep-3",
    name: "Customer Support",
    headId: "emp-7",
    headName: "Sadia Islam",
    headAvatar: "https://i.pravatar.cc/150?u=sadia",
    employeeCount: 12,
    status: "Active"
  },
  {
    id: "dep-4",
    name: "Purchase",
    headId: "emp-5",
    headName: "Farid Ahmed",
    headAvatar: "https://i.pravatar.cc/150?u=farid",
    employeeCount: 4,
    status: "Active"
  },
  {
    id: "dep-5",
    name: "Marketing",
    headId: "emp-9",
    headName: "Bijoy Chandra Sarkar",
    headAvatar: "https://i.pravatar.cc/150?u=bijoy",
    employeeCount: 3,
    status: "Active"
  }
];
