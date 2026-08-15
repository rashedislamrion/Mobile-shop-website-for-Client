export interface BranchOperatingHours {
  day: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  type: "Flagship Store" | "Outlet" | "Warehouse-only";
  address: string;
  city: string;
  managerName: string | null;
  managerAvatar: string | null;
  contactNumber: string;
  alternatePhone?: string;
  email: string;
  staffCount: number;
  status: "Active" | "Inactive";
  operatingHours: BranchOperatingHours[];
  openingStockValue: number;
  vatNumber?: string;
}

export const mockBranches: Branch[] = [
  {
    id: "b1",
    name: "Dhaka Main Branch",
    code: "DHK-01",
    type: "Flagship Store",
    address: "Level 5, Multiplan Center\nElephant Road, Dhaka",
    city: "Dhaka",
    managerName: "Rahim Uddin",
    managerAvatar: "https://i.pravatar.cc/150?u=rahim",
    contactNumber: "01711-000001",
    email: "dhaka.main@mobileshop.com",
    staffCount: 12,
    status: "Active",
    openingStockValue: 2500000,
    vatNumber: "VAT-12345678",
    operatingHours: [
      { day: "Sunday", openTime: "10:00", closeTime: "20:00", isClosed: false },
      { day: "Monday", openTime: "10:00", closeTime: "20:00", isClosed: false },
      { day: "Tuesday", openTime: "10:00", closeTime: "20:00", isClosed: true }, // Market Holiday
      { day: "Wednesday", openTime: "10:00", closeTime: "20:00", isClosed: false },
      { day: "Thursday", openTime: "10:00", closeTime: "20:00", isClosed: false },
      { day: "Friday", openTime: "10:00", closeTime: "20:00", isClosed: false },
      { day: "Saturday", openTime: "10:00", closeTime: "20:00", isClosed: false },
    ],
  },
  {
    id: "b2",
    name: "Chattogram Branch",
    code: "CTG-01",
    type: "Outlet",
    address: "Shop 204, Sanmar Ocean City\nGEC Circle, Chattogram",
    city: "Chattogram",
    managerName: "Karim Hasan",
    managerAvatar: "https://i.pravatar.cc/150?u=karim",
    contactNumber: "01711-000002",
    email: "ctg@mobileshop.com",
    staffCount: 5,
    status: "Active",
    openingStockValue: 800000,
    operatingHours: [
      { day: "Sunday", openTime: "10:00", closeTime: "20:00", isClosed: false },
      { day: "Monday", openTime: "10:00", closeTime: "20:00", isClosed: false },
      { day: "Tuesday", openTime: "10:00", closeTime: "20:00", isClosed: false },
      { day: "Wednesday", openTime: "10:00", closeTime: "20:00", isClosed: false },
      { day: "Thursday", openTime: "10:00", closeTime: "20:00", isClosed: false },
      { day: "Friday", openTime: "10:00", closeTime: "20:00", isClosed: true },
      { day: "Saturday", openTime: "10:00", closeTime: "20:00", isClosed: false },
    ],
  },
  {
    id: "b3",
    name: "Sylhet Outlet",
    code: "SYL-01",
    type: "Outlet",
    address: "Zindabazar, Millennium Plaza\nGround Floor, Sylhet",
    city: "Sylhet",
    managerName: null,
    managerAvatar: null,
    contactNumber: "01711-000003",
    email: "sylhet@mobileshop.com",
    staffCount: 0,
    status: "Inactive",
    openingStockValue: 0,
    operatingHours: [
      { day: "Sunday", openTime: "10:00", closeTime: "20:00", isClosed: false },
      { day: "Monday", openTime: "10:00", closeTime: "20:00", isClosed: false },
      { day: "Tuesday", openTime: "10:00", closeTime: "20:00", isClosed: false },
      { day: "Wednesday", openTime: "10:00", closeTime: "20:00", isClosed: false },
      { day: "Thursday", openTime: "10:00", closeTime: "20:00", isClosed: false },
      { day: "Friday", openTime: "10:00", closeTime: "20:00", isClosed: true },
      { day: "Saturday", openTime: "10:00", closeTime: "20:00", isClosed: false },
    ],
  },
  {
    id: "b4",
    name: "Central Warehouse",
    code: "WH-01",
    type: "Warehouse-only",
    address: "Tongi Industrial Area\nGazipur",
    city: "Gazipur",
    managerName: "Jashim Uddin",
    managerAvatar: "https://i.pravatar.cc/150?u=jashim",
    contactNumber: "01711-000004",
    email: "warehouse@mobileshop.com",
    staffCount: 8,
    status: "Active",
    openingStockValue: 15000000,
    operatingHours: [
      { day: "Sunday", openTime: "08:00", closeTime: "18:00", isClosed: false },
      { day: "Monday", openTime: "08:00", closeTime: "18:00", isClosed: false },
      { day: "Tuesday", openTime: "08:00", closeTime: "18:00", isClosed: false },
      { day: "Wednesday", openTime: "08:00", closeTime: "18:00", isClosed: false },
      { day: "Thursday", openTime: "08:00", closeTime: "18:00", isClosed: false },
      { day: "Friday", openTime: "08:00", closeTime: "18:00", isClosed: true },
      { day: "Saturday", openTime: "08:00", closeTime: "18:00", isClosed: false },
    ],
  },
];
