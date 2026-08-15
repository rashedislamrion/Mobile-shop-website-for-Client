export interface PurchaseOrderLineItem {
  id: string;
  productName: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
}

export interface PurchaseOrderRecord {
  id: string;
  poNumber: string;
  date: string;
  branch: string;
  supplierId: string;
  supplierName: string;
  itemsCount: number;
  items: PurchaseOrderLineItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  grandTotal: number;
  paid: number;
  due: number;
  status: "Draft" | "Ordered" | "Partially Received" | "Received" | "Cancelled";
}

export const mockPurchaseOrders: PurchaseOrderRecord[] = [
  {
    id: "po1",
    poNumber: "PO-2608-001",
    date: "2026-08-15",
    branch: "Dhaka Main Branch",
    supplierId: "sup1",
    supplierName: "Apple Distributors BD",
    itemsCount: 50,
    items: [
      { id: "i1", productName: "iPhone 15 Pro Max", quantity: 20, unitCost: 110000, lineTotal: 2200000 },
      { id: "i2", productName: "MacBook Air M3", quantity: 10, unitCost: 105000, lineTotal: 1050000 },
      { id: "i3", productName: "AirPods Pro (2nd Gen)", quantity: 20, unitCost: 20000, lineTotal: 400000 }
    ],
    subtotal: 3650000,
    discount: 50000,
    shipping: 1000,
    tax: 0,
    grandTotal: 3601000,
    paid: 3101000,
    due: 500000,
    status: "Partially Received"
  },
  {
    id: "po2",
    poNumber: "PO-2608-002",
    date: "2026-08-14",
    branch: "Global",
    supplierId: "sup2",
    supplierName: "Samsung Electronics",
    itemsCount: 30,
    items: [
      { id: "i4", productName: "Samsung Galaxy S24 Ultra", quantity: 30, unitCost: 95000, lineTotal: 2850000 }
    ],
    subtotal: 2850000,
    discount: 0,
    shipping: 500,
    tax: 0,
    grandTotal: 2850500,
    paid: 2850500,
    due: 0,
    status: "Received"
  },
  {
    id: "po3",
    poNumber: "PO-2608-003",
    date: "2026-08-13",
    branch: "Chattogram Branch",
    supplierId: "sup3",
    supplierName: "Gadget Wholesalers",
    itemsCount: 100,
    items: [
      { id: "i5", productName: "10000mAh Power Bank", quantity: 50, unitCost: 1200, lineTotal: 60000 },
      { id: "i6", productName: "Type-C Cable 2M", quantity: 50, unitCost: 300, lineTotal: 15000 }
    ],
    subtotal: 75000,
    discount: 5000,
    shipping: 200,
    tax: 0,
    grandTotal: 70200,
    paid: 0,
    due: 70200,
    status: "Draft"
  },
  {
    id: "po4",
    poNumber: "PO-2608-004",
    date: "2026-08-10",
    branch: "Dhaka Main Branch",
    supplierId: "sup4",
    supplierName: "Baseus Official BD",
    itemsCount: 25,
    items: [
      { id: "i7", productName: "65W GaN Charger", quantity: 25, unitCost: 2000, lineTotal: 50000 }
    ],
    subtotal: 50000,
    discount: 0,
    shipping: 0,
    tax: 0,
    grandTotal: 50000,
    paid: 0,
    due: 50000,
    status: "Ordered"
  },
  {
    id: "po5",
    poNumber: "PO-2608-005",
    date: "2026-08-05",
    branch: "Global",
    supplierId: "sup1",
    supplierName: "Apple Distributors BD",
    itemsCount: 15,
    items: [
      { id: "i8", productName: "iPad Pro 11-inch", quantity: 15, unitCost: 85000, lineTotal: 1275000 }
    ],
    subtotal: 1275000,
    discount: 25000,
    shipping: 0,
    tax: 0,
    grandTotal: 1250000,
    paid: 0,
    due: 1250000,
    status: "Cancelled"
  }
];
