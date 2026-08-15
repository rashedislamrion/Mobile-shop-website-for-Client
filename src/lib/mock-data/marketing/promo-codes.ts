export interface PromoCodeRecord {
  id: string;
  code: string;
  discountType: "Percentage" | "Fixed Amount";
  discountValue: number;
  maxCap?: number;
  minOrder?: number;
  usageCount: number;
  usageLimit?: number;
  customerLimit?: number;
  appliesTo: "All Products" | "Specific Category" | "Specific Products";
  validFrom: string;
  validUntil: string;
  status: "Active" | "Scheduled" | "Expired" | "Disabled";
}

export const mockPromoCodes: PromoCodeRecord[] = [
  {
    id: "pc1",
    code: "WELCOME20",
    discountType: "Percentage",
    discountValue: 20,
    maxCap: 500,
    minOrder: 1000,
    usageCount: 145,
    usageLimit: 500,
    customerLimit: 1,
    appliesTo: "All Products",
    validFrom: "2026-01-01",
    validUntil: "2026-12-31",
    status: "Active"
  },
  {
    id: "pc2",
    code: "EID1000",
    discountType: "Fixed Amount",
    discountValue: 1000,
    minOrder: 10000,
    usageCount: 50,
    usageLimit: 100,
    customerLimit: 1,
    appliesTo: "Specific Category",
    validFrom: "2026-08-25",
    validUntil: "2026-09-05",
    status: "Scheduled"
  },
  {
    id: "pc3",
    code: "FLASH50",
    discountType: "Percentage",
    discountValue: 50,
    maxCap: 200,
    usageCount: 1000,
    usageLimit: 1000,
    appliesTo: "All Products",
    validFrom: "2026-07-01",
    validUntil: "2026-07-02",
    status: "Expired"
  }
];
