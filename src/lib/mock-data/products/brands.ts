export type MockBrand = {
  id: string;
  name: string;
  logo: string;
  productCount: number;
  status: "Active" | "Inactive";
};

export const mockBrands: MockBrand[] = [
  { id: "BRD-001", name: "Apple", logo: "/images/brands/apple.png", productCount: 154, status: "Active" },
  { id: "BRD-002", name: "Samsung", logo: "/images/brands/samsung.png", productCount: 231, status: "Active" },
  { id: "BRD-003", name: "Xiaomi", logo: "/images/brands/xiaomi.png", productCount: 189, status: "Active" },
  { id: "BRD-004", name: "Realme", logo: "/images/brands/realme.png", productCount: 92, status: "Active" },
  { id: "BRD-005", name: "OnePlus", logo: "/images/brands/oneplus.png", productCount: 45, status: "Active" },
  { id: "BRD-006", name: "Oppo", logo: "/images/brands/oppo.png", productCount: 78, status: "Active" },
  { id: "BRD-007", name: "Vivo", logo: "/images/brands/vivo.png", productCount: 88, status: "Active" },
  { id: "BRD-008", name: "Nokia", logo: "/images/brands/nokia.png", productCount: 23, status: "Inactive" },
  { id: "BRD-009", name: "Huawei", logo: "/images/brands/huawei.png", productCount: 41, status: "Active" },
  { id: "BRD-010", name: "Sony", logo: "/images/brands/sony.png", productCount: 15, status: "Inactive" },
];
