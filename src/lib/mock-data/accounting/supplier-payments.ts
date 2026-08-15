export interface SupplierPaymentRecord {
  id: string;
  date: string;
  referenceNo: string;
  supplierId: string;
  supplierName: string;
  amountPaid: number;
  paymentMethod: "Cash" | "Bank Transfer" | "bKash" | "Cheque";
  paidFromWallet: string;
  relatedPurchaseOrder: string;
  note: string;
  recordedBy: string;
}

export const mockSupplierPayments: SupplierPaymentRecord[] = [
  {
    id: "sp1",
    date: "2026-08-15",
    referenceNo: "SP-001",
    supplierId: "sup1",
    supplierName: "Apple Distributors BD",
    amountPaid: 45000,
    paymentMethod: "Bank Transfer",
    paidFromWallet: "Bank - DBBL",
    relatedPurchaseOrder: "PO-2608-001",
    note: "Partial payment for August delivery",
    recordedBy: "Finance Dept"
  },
  {
    id: "sp2",
    date: "2026-08-14",
    referenceNo: "SP-002",
    supplierId: "sup3",
    supplierName: "Gadget Wholesalers",
    amountPaid: 15000,
    paymentMethod: "Cash",
    paidFromWallet: "Cash in Hand",
    relatedPurchaseOrder: "PO-2608-005",
    note: "Paid on delivery",
    recordedBy: "Branch Manager"
  },
  {
    id: "sp3",
    date: "2026-08-12",
    referenceNo: "SP-003",
    supplierId: "sup2",
    supplierName: "Samsung Electronics",
    amountPaid: 120000,
    paymentMethod: "Cheque",
    paidFromWallet: "Bank - City Bank",
    relatedPurchaseOrder: "PO-2608-002",
    note: "Full settlement for July invoices",
    recordedBy: "Finance Dept"
  },
  {
    id: "sp4",
    date: "2026-08-10",
    referenceNo: "SP-004",
    supplierId: "sup4",
    supplierName: "Baseus Official BD",
    amountPaid: 25000,
    paymentMethod: "bKash",
    paidFromWallet: "bKash Merchant",
    relatedPurchaseOrder: "PO-2608-010",
    note: "Advance payment",
    recordedBy: "Admin User"
  }
];
