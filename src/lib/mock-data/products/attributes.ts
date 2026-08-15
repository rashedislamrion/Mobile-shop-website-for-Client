export type MockAttribute = {
  id: string;
  name: string;
  values: string[];
};

export const mockAttributes: MockAttribute[] = [
  { id: "ATTR-001", name: "Color", values: ["Black", "White", "Silver", "Gold", "Space Gray", "Midnight Green", "Blue", "Red"] },
  { id: "ATTR-002", name: "Quality", values: ["OEM", "Original Pull", "High Copy", "AA", "AAA", "Premium"] },
  { id: "ATTR-003", name: "Storage", values: ["64GB", "128GB", "256GB", "512GB", "1TB"] },
  { id: "ATTR-004", name: "RAM", values: ["4GB", "6GB", "8GB", "12GB", "16GB"] },
  { id: "ATTR-005", name: "Condition", values: ["New", "Used - Like New", "Used - Good", "Refurbished"] },
  { id: "ATTR-006", name: "Guarantee", values: ["None", "7 Days Replacement", "1 Month", "6 Months", "1 Year"] },
  { id: "ATTR-007", name: "Frame Type", values: ["With Frame", "Without Frame"] },
];
