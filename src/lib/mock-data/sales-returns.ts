export type MockSalesReturn = {
  id: string;
  originalOrderId: string;
  date: string;
  branch: string;
  customerName: string;
  customerPhone: string;
  itemsReturned: string;
  itemImages: string[];
  reason: string;
  refundAmount: number;
  status: "Requested" | "Approved" | "Refunded" | "Rejected";
};

export const mockSalesReturns: MockSalesReturn[] = [
  {
    id: "RET-001",
    originalOrderId: "#ORD-9001",
    date: "2024-08-16T10:30:00",
    branch: "Dhaka Main",
    customerName: "Rashed Islam",
    customerPhone: "01711-223344",
    itemsReturned: "iPhone 13 Pro Max Display",
    itemImages: ["https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=150&h=150&fit=crop"],
    reason: "Display showing green line after 2 days",
    refundAmount: 125000,
    status: "Requested"
  },
  {
    id: "RET-002",
    originalOrderId: "#ORD-9005",
    date: "2024-08-15T14:20:00",
    branch: "Rajshahi",
    customerName: "Kamrul Islam",
    customerPhone: "01811-334455",
    itemsReturned: "Samsung S22 Ultra Battery",
    itemImages: ["https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=150&h=150&fit=crop"],
    reason: "Battery drains very fast, seems defective",
    refundAmount: 6000,
    status: "Approved"
  },
  {
    id: "RET-003",
    originalOrderId: "#ORD-9009",
    date: "2024-08-14T09:15:00",
    branch: "Dhaka Main",
    customerName: "Imran Khan",
    customerPhone: "01911-445566",
    itemsReturned: "MacBook Pro Screen Panel",
    itemImages: [],
    reason: "Customer ordered wrong model by mistake",
    refundAmount: 85000,
    status: "Refunded"
  },
  {
    id: "RET-004",
    originalOrderId: "#ORD-9012",
    date: "2024-08-13T16:45:00",
    branch: "Dhaka Main",
    customerName: "Ritu Akter",
    customerPhone: "01611-556677",
    itemsReturned: "AirPods Pro Case",
    itemImages: ["https://images.unsplash.com/photo-1606220588913-b3aecb606f0e?w=150&h=150&fit=crop"],
    reason: "Found a scratch on the back",
    refundAmount: 4500,
    status: "Rejected"
  },
  {
    id: "RET-005",
    originalOrderId: "#ORD-9010",
    date: "2024-08-12T11:00:00",
    branch: "Rajshahi",
    customerName: "Nabila Haque",
    customerPhone: "01511-667788",
    itemsReturned: "iPad Air Screen",
    itemImages: [],
    reason: "Dead pixels noticed",
    refundAmount: 21000,
    status: "Refunded"
  }
];
