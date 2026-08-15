export type MockExchange = {
  id: string;
  originalOrderId: string;
  date: string;
  branch: string;
  customerName: string;
  customerPhone: string;
  oldItem: { name: string; price: number; image: string };
  newItem: { name: string; price: number; image: string };
  priceDifference: number; // + if customer pays, - if refund
  status: "Requested" | "Approved" | "Item Received" | "Completed" | "Rejected";
};

export const mockExchanges: MockExchange[] = [
  {
    id: "EXC-001",
    originalOrderId: "#ORD-9002",
    date: "2024-08-16T11:30:00",
    branch: "Chattogram",
    customerName: "Jahid Hasan",
    customerPhone: "01711-223344",
    oldItem: { name: "Samsung A52 Display (TFT)", price: 4500, image: "https://images.unsplash.com/photo-1601784551446-20c9e07cd8d3?w=150&h=150&fit=crop" },
    newItem: { name: "Samsung A52 Display (OLED)", price: 8500, image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=150&h=150&fit=crop" },
    priceDifference: 4000,
    status: "Requested"
  },
  {
    id: "EXC-002",
    originalOrderId: "#ORD-9003",
    date: "2024-08-15T15:20:00",
    branch: "Sylhet",
    customerName: "Ayesha Siddiqua",
    customerPhone: "01811-334455",
    oldItem: { name: "iPhone 11 Battery (Standard)", price: 2500, image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=150&h=150&fit=crop" },
    newItem: { name: "iPhone 11 Battery (High Capacity)", price: 3500, image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=150&h=150&fit=crop" },
    priceDifference: 1000,
    status: "Item Received"
  },
  {
    id: "EXC-003",
    originalOrderId: "#ORD-9014",
    date: "2024-08-14T10:15:00",
    branch: "Rajshahi",
    customerName: "Farhana Islam",
    customerPhone: "01911-445566",
    oldItem: { name: "Pixel 6 Pro Screen", price: 15000, image: "https://images.unsplash.com/photo-1601784551446-20c9e07cd8d3?w=150&h=150&fit=crop" },
    newItem: { name: "Pixel 6 Screen (Wrong order)", price: 12000, image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=150&h=150&fit=crop" },
    priceDifference: -3000,
    status: "Completed"
  },
  {
    id: "EXC-004",
    originalOrderId: "#ORD-9007",
    date: "2024-08-13T17:45:00",
    branch: "Chattogram",
    customerName: "Faisal Mahmud",
    customerPhone: "01611-556677",
    oldItem: { name: "MacBook Air M1 Keyboard", price: 8500, image: "https://images.unsplash.com/photo-1606220588913-b3aecb606f0e?w=150&h=150&fit=crop" },
    newItem: { name: "MacBook Pro M1 Keyboard", price: 10500, image: "https://images.unsplash.com/photo-1606220588913-b3aecb606f0e?w=150&h=150&fit=crop" },
    priceDifference: 2000,
    status: "Approved"
  },
  {
    id: "EXC-005",
    originalOrderId: "#ORD-9011",
    date: "2024-08-12T12:00:00",
    branch: "Chattogram",
    customerName: "Mahmudul Hasan",
    customerPhone: "01511-667788",
    oldItem: { name: "iPad Charger", price: 2000, image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=150&h=150&fit=crop" },
    newItem: { name: "iPad Charger (Fast)", price: 3000, image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=150&h=150&fit=crop" },
    priceDifference: 1000,
    status: "Rejected"
  }
];
