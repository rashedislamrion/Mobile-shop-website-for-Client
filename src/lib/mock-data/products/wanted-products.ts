export type MockWantedProduct = {
  id: string;
  productName: string;
  customerName: string;
  customerPhone: string;
  requestedDate: string;
  status: "New" | "Sourcing" | "Fulfilled" | "Cancelled";
  notes: string;
};

export const mockWantedProducts: MockWantedProduct[] = [
  { id: "WNT-001", productName: "iPhone 16 Pro Max Battery - OEM", customerName: "Ashraful Islam", customerPhone: "+8801711001122", requestedDate: "2024-03-20T10:30:00Z", status: "New", notes: "Customer insists on OEM quality only." },
  { id: "WNT-002", productName: "Google Pixel 8 Pro Display", customerName: "Fahim Rahman", customerPhone: "+8801811223344", requestedDate: "2024-03-18T14:15:00Z", status: "Sourcing", notes: "Supplier checking stock in China." },
  { id: "WNT-003", productName: "Sony Xperia 1 V Motherboard", customerName: "Rakib Hasan", customerPhone: "+8801911445566", requestedDate: "2024-03-15T09:45:00Z", status: "Cancelled", notes: "Too expensive, customer bought a new phone." },
  { id: "WNT-004", productName: "Nothing Phone (2) Transparent Back Glass", customerName: "Tanvir Ahmed", customerPhone: "+8801611778899", requestedDate: "2024-03-10T16:20:00Z", status: "Fulfilled", notes: "Sourced locally and delivered." },
  { id: "WNT-005", productName: "Asus ROG Phone 7 Ultimate Cooling Fan", customerName: "Sajib Khan", customerPhone: "+8801511990011", requestedDate: "2024-03-21T11:10:00Z", status: "New", notes: "Gaming accessory, urgent." },
  { id: "WNT-006", productName: "Huawei Mate 60 Pro Satellite Antenna", customerName: "Jahid Hossain", customerPhone: "+8801722334455", requestedDate: "2024-03-19T13:40:00Z", status: "Sourcing", notes: "Importing via Dubai." },
  { id: "WNT-007", productName: "OnePlus Open Inner Display Flex Cable", customerName: "Monirul Islam", customerPhone: "+8801822556677", requestedDate: "2024-03-12T10:00:00Z", status: "Fulfilled", notes: "Repaired successfully." },
];
