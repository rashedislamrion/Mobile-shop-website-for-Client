export type MockCategory = {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  itemCount: number;
  status: "Active" | "Inactive";
  parentId?: string | null;
  children?: MockCategory[];
};

export const mockCategories: MockCategory[] = [
  {
    id: "CAT-001",
    name: "Mobile Parts",
    slug: "mobile-parts",
    icon: "Smartphone",
    itemCount: 450,
    status: "Active",
    parentId: null,
    children: [
      { id: "CAT-101", name: "Display", slug: "display", icon: "Monitor", itemCount: 120, status: "Active", parentId: "CAT-001" },
      { id: "CAT-102", name: "Battery", slug: "battery", icon: "Battery", itemCount: 85, status: "Active", parentId: "CAT-001" },
      { id: "CAT-103", name: "Charging Logic", slug: "charging-logic", icon: "Zap", itemCount: 60, status: "Active", parentId: "CAT-001" },
      { id: "CAT-104", name: "Speaker", slug: "speaker", icon: "Volume2", itemCount: 40, status: "Active", parentId: "CAT-001" },
      { id: "CAT-105", name: "Camera", slug: "camera", icon: "Camera", itemCount: 35, status: "Active", parentId: "CAT-001" },
      { id: "CAT-106", name: "Housing", slug: "housing", icon: "Box", itemCount: 50, status: "Active", parentId: "CAT-001" },
      { id: "CAT-107", name: "Back Glass", slug: "back-glass", icon: "Layers", itemCount: 45, status: "Active", parentId: "CAT-001" },
    ]
  },
  {
    id: "CAT-002",
    name: "Accessories",
    slug: "accessories",
    icon: "Headphones",
    itemCount: 120,
    status: "Active",
    parentId: null,
    children: [
      { id: "CAT-201", name: "Chargers", slug: "chargers", icon: "Plug", itemCount: 40, status: "Active", parentId: "CAT-002" },
      { id: "CAT-202", name: "Cables", slug: "cables", icon: "Usb", itemCount: 50, status: "Active", parentId: "CAT-002" },
      { id: "CAT-203", name: "Power Banks", slug: "power-banks", icon: "BatteryCharging", itemCount: 15, status: "Active", parentId: "CAT-002" },
      { id: "CAT-204", name: "Earphones", slug: "earphones", icon: "Headphones", itemCount: 15, status: "Active", parentId: "CAT-002" },
    ]
  },
  {
    id: "CAT-003",
    name: "Tools & Equipment",
    slug: "tools-equipment",
    icon: "Wrench",
    itemCount: 75,
    status: "Active",
    parentId: null,
    children: [
      { id: "CAT-301", name: "Screwdrivers", slug: "screwdrivers", icon: "PenTool", itemCount: 25, status: "Active", parentId: "CAT-003" },
      { id: "CAT-302", name: "Soldering Irons", slug: "soldering-irons", icon: "Thermometer", itemCount: 15, status: "Active", parentId: "CAT-003" },
      { id: "CAT-303", name: "Microscopes", slug: "microscopes", icon: "Microscope", itemCount: 10, status: "Active", parentId: "CAT-003" },
    ]
  }
];
