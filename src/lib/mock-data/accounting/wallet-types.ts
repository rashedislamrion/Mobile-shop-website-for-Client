export interface WalletType {
  id: string;
  name: string;
  type: "Cash" | "Bank" | "Mobile Banking";
  currentBalance: number;
  status: "Active" | "Inactive";
}

export const mockWalletTypes: WalletType[] = [
  {
    id: "w1",
    name: "Cash in Hand",
    type: "Cash",
    currentBalance: 125000,
    status: "Active"
  },
  {
    id: "w2",
    name: "Bank - DBBL",
    type: "Bank",
    currentBalance: 4500000,
    status: "Active"
  },
  {
    id: "w3",
    name: "Bank - City Bank",
    type: "Bank",
    currentBalance: 1200000,
    status: "Active"
  },
  {
    id: "w4",
    name: "bKash Merchant",
    type: "Mobile Banking",
    currentBalance: 45000,
    status: "Active"
  },
  {
    id: "w5",
    name: "Nagad Merchant",
    type: "Mobile Banking",
    currentBalance: 32000,
    status: "Active"
  },
  {
    id: "w6",
    name: "Old Cash Box",
    type: "Cash",
    currentBalance: 0,
    status: "Inactive"
  }
];
