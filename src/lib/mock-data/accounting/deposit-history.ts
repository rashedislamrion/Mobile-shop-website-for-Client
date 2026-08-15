export interface DepositHistoryRecord {
  id: string;
  date: string;
  walletId: string;
  walletName: string;
  walletType: string;
  transactionType: "Deposit" | "Withdrawal";
  amount: number;
  purpose: string;
  referenceNo: string;
  note: string;
  recordedBy: string;
  balanceAfter: number;
}

export const mockDepositHistory: DepositHistoryRecord[] = [
  {
    id: "tx1",
    date: "2026-08-15",
    walletId: "w1",
    walletName: "Cash in Hand",
    walletType: "Cash",
    transactionType: "Deposit",
    amount: 15000,
    purpose: "Sales Revenue",
    referenceNo: "INV-009252",
    note: "Daily sales collection",
    recordedBy: "Admin User",
    balanceAfter: 125000
  },
  {
    id: "tx2",
    date: "2026-08-14",
    walletId: "w2",
    walletName: "Bank - DBBL",
    walletType: "Bank",
    transactionType: "Withdrawal",
    amount: 45000,
    purpose: "Supplier Payment",
    referenceNo: "TRF-9921",
    note: "Payment to Apple Distributors",
    recordedBy: "Finance Dept",
    balanceAfter: 4500000
  },
  {
    id: "tx3",
    date: "2026-08-14",
    walletId: "w4",
    walletName: "bKash Merchant",
    walletType: "Mobile Banking",
    transactionType: "Deposit",
    amount: 5000,
    purpose: "Sales Revenue",
    referenceNo: "BK-8822A",
    note: "Online order #EM009250",
    recordedBy: "System",
    balanceAfter: 45000
  },
  {
    id: "tx4",
    date: "2026-08-13",
    walletId: "w1",
    walletName: "Cash in Hand",
    walletType: "Cash",
    transactionType: "Withdrawal",
    amount: 1200,
    purpose: "Utility Bill",
    referenceNo: "UTIL-08",
    note: "Electricity bill for showroom",
    recordedBy: "Admin User",
    balanceAfter: 110000
  },
  {
    id: "tx5",
    date: "2026-08-12",
    walletId: "w3",
    walletName: "Bank - City Bank",
    walletType: "Bank",
    transactionType: "Deposit",
    amount: 500000,
    purpose: "Sales Revenue",
    referenceNo: "CASH-DEP-01",
    note: "Cash deposit from showroom to bank",
    recordedBy: "Finance Dept",
    balanceAfter: 1200000
  }
];
