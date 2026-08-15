export type MockWastedProduct = {
  id: string;
  productName: string;
  productImage: string;
  branch: string;
  quantityWasted: number;
  reason: "Damaged" | "Expired" | "Lost" | "Defective";
  costImpact: number;
  reportedBy: string;
  date: string;
};

export const mockWastedProducts: MockWastedProduct[] = [
  { id: "WST-001", productName: "iPhone 13 Pro Max Display - OLED", productImage: "https://images.unsplash.com/photo-1603812859942-0f5ba62283e3?auto=format&fit=crop&q=80&w=200", branch: "Dhaka Main", quantityWasted: 1, reason: "Damaged", costImpact: 12500, reportedBy: "Kamrul Islam", date: "2024-03-20T10:30:00Z" },
  { id: "WST-002", productName: "Relife Soldering Paste", productImage: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&q=80&w=200", branch: "Chattogram", quantityWasted: 5, reason: "Expired", costImpact: 750, reportedBy: "Tarek Rahman", date: "2024-03-18T14:15:00Z" },
  { id: "WST-003", productName: "Mechanic UV Glue", productImage: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=200", branch: "Dhaka Main", quantityWasted: 2, reason: "Expired", costImpact: 300, reportedBy: "Kamrul Islam", date: "2024-03-15T09:45:00Z" },
  { id: "WST-004", productName: "Samsung Galaxy S22 Ultra Battery", productImage: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&q=80&w=200", branch: "Sylhet", quantityWasted: 1, reason: "Defective", costImpact: 3200, reportedBy: "Habib Ullah", date: "2024-03-10T16:20:00Z" },
  { id: "WST-005", productName: "Type-C Fast Charging Cable", productImage: "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&q=80&w=200", branch: "Rajshahi", quantityWasted: 3, reason: "Lost", costImpact: 450, reportedBy: "Sumon Ali", date: "2024-03-21T11:10:00Z" },
];
