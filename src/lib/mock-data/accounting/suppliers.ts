export interface SupplierRecord {
  id: string;
  supplierName: string;
  logo: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  totalPurchases: number;
  totalDue: number;
  status: "Active" | "Inactive";
  productsSupplied: string[];
  paymentTerms: "Cash on Delivery" | "Net 15" | "Net 30" | "Net 60";
}

export const mockSuppliers: SupplierRecord[] = [
  {
    id: "sup1",
    supplierName: "Apple Distributors BD",
    logo: "https://i.pravatar.cc/150?u=apple",
    contactPerson: "Mr. Zaman",
    phone: "+8801711001100",
    email: "contact@appledist.bd",
    address: "Gulshan-1, Dhaka",
    totalPurchases: 15000000,
    totalDue: 500000,
    status: "Active",
    productsSupplied: ["Smartphones", "Laptops", "Accessories"],
    paymentTerms: "Net 30"
  },
  {
    id: "sup2",
    supplierName: "Samsung Electronics",
    logo: "https://i.pravatar.cc/150?u=samsung",
    contactPerson: "Rahat Hossain",
    phone: "+8801811001100",
    email: "sales@samsung.com.bd",
    address: "Banani, Dhaka",
    totalPurchases: 12000000,
    totalDue: 0,
    status: "Active",
    productsSupplied: ["Smartphones", "Tablets", "Audio"],
    paymentTerms: "Net 15"
  },
  {
    id: "sup3",
    supplierName: "Gadget Wholesalers",
    logo: "https://i.pravatar.cc/150?u=gadget",
    contactPerson: "Sajjad Ali",
    phone: "+8801911001100",
    email: "wholesale@gadgetbd.com",
    address: "Motijheel, Dhaka",
    totalPurchases: 2500000,
    totalDue: 500000,
    status: "Active",
    productsSupplied: ["Accessories", "Audio", "Power Banks"],
    paymentTerms: "Cash on Delivery"
  },
  {
    id: "sup4",
    supplierName: "Baseus Official BD",
    logo: "https://i.pravatar.cc/150?u=baseus",
    contactPerson: "Faisal Ahmed",
    phone: "+8801511001100",
    email: "info@baseus.com.bd",
    address: "Agrabad, Chattogram",
    totalPurchases: 800000,
    totalDue: 50000,
    status: "Active",
    productsSupplied: ["Accessories", "Cables", "Chargers"],
    paymentTerms: "Net 15"
  },
  {
    id: "sup5",
    supplierName: "Old Accessories Shop",
    logo: "https://i.pravatar.cc/150?u=old",
    contactPerson: "Kamrul Hasan",
    phone: "+8801611001100",
    email: "kamrul@oldshop.com",
    address: "Mirpur-10, Dhaka",
    totalPurchases: 120000,
    totalDue: 0,
    status: "Inactive",
    productsSupplied: ["Phone Covers", "Screen Protectors"],
    paymentTerms: "Cash on Delivery"
  }
];
