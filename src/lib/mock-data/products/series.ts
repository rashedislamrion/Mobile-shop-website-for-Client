export type MockSeries = {
  id: string;
  name: string;
  brandId: string;
  brandName: string;
  productCount: number;
};

export const mockSeries: MockSeries[] = [
  { id: "SER-001", name: "iPhone 15 Series", brandId: "BRD-001", brandName: "Apple", productCount: 24 },
  { id: "SER-002", name: "iPhone 14 Series", brandId: "BRD-001", brandName: "Apple", productCount: 32 },
  { id: "SER-003", name: "Galaxy S24 Series", brandId: "BRD-002", brandName: "Samsung", productCount: 18 },
  { id: "SER-004", name: "Galaxy A Series", brandId: "BRD-002", brandName: "Samsung", productCount: 45 },
  { id: "SER-005", name: "Redmi Note 13", brandId: "BRD-003", brandName: "Xiaomi", productCount: 15 },
  { id: "SER-006", name: "POCO Series", brandId: "BRD-003", brandName: "Xiaomi", productCount: 12 },
  { id: "SER-007", name: "Realme 12 Series", brandId: "BRD-004", brandName: "Realme", productCount: 8 },
  { id: "SER-008", name: "OnePlus 12 Series", brandId: "BRD-005", brandName: "OnePlus", productCount: 6 },
  { id: "SER-009", name: "Nord Series", brandId: "BRD-005", brandName: "OnePlus", productCount: 10 },
  { id: "SER-010", name: "Reno Series", brandId: "BRD-006", brandName: "Oppo", productCount: 22 },
];
