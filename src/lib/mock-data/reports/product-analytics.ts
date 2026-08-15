export interface ProductAnalyticsRecord {
  id: string;
  rank: number;
  productName: string;
  productImage: string;
  category: string;
  unitsSold: number;
  revenue: number;
  rating: number;
  stockRemaining: number;
  trend: number; // percentage change, e.g. 12.5 or -5.2
}

export const mockProductAnalytics: ProductAnalyticsRecord[] = [
  {
    id: "p1",
    rank: 1,
    productName: "iPhone 15 Pro Max",
    productImage: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    category: "Smartphones",
    unitsSold: 420,
    revenue: 50400000,
    rating: 4.9,
    stockRemaining: 45,
    trend: 12.5
  },
  {
    id: "p2",
    rank: 2,
    productName: "Samsung Galaxy S24 Ultra",
    productImage: "https://i.pravatar.cc/150?u=a042581f4e29026703d",
    category: "Smartphones",
    unitsSold: 385,
    revenue: 46200000,
    rating: 4.8,
    stockRemaining: 22,
    trend: 8.2
  },
  {
    id: "p3",
    rank: 3,
    productName: "AirPods Pro (2nd Gen)",
    productImage: "https://i.pravatar.cc/150?u=a042581f4e29026702d",
    category: "Accessories",
    unitsSold: 850,
    revenue: 21250000,
    rating: 4.7,
    stockRemaining: 120,
    trend: 25.4
  },
  {
    id: "p4",
    rank: 4,
    productName: "MacBook Air M3",
    productImage: "https://i.pravatar.cc/150?u=a042581f4e29026701d",
    category: "Laptops",
    unitsSold: 125,
    revenue: 15000000,
    rating: 4.9,
    stockRemaining: 15,
    trend: -2.5
  },
  {
    id: "p5",
    rank: 5,
    productName: "20W USB-C Power Adapter",
    productImage: "https://i.pravatar.cc/150?u=a042581f4e29026700d",
    category: "Accessories",
    unitsSold: 1200,
    revenue: 2400000,
    rating: 4.5,
    stockRemaining: 500,
    trend: 5.0
  },
  {
    id: "p6",
    rank: 6,
    productName: "Apple Watch Series 9",
    productImage: "https://i.pravatar.cc/150?u=a042581f4e29026705d",
    category: "Smartwatches",
    unitsSold: 210,
    revenue: 10500000,
    rating: 4.6,
    stockRemaining: 8,
    trend: -1.2
  },
  {
    id: "p7",
    rank: 7,
    productName: "iPad Pro 11-inch",
    productImage: "https://i.pravatar.cc/150?u=a042581f4e29026706d",
    category: "Tablets",
    unitsSold: 95,
    revenue: 9500000,
    rating: 4.8,
    stockRemaining: 30,
    trend: 10.1
  },
  {
    id: "p8",
    rank: 8,
    productName: "Samsung 45W Fast Charger",
    productImage: "https://i.pravatar.cc/150?u=a042581f4e29026707d",
    category: "Accessories",
    unitsSold: 450,
    revenue: 1350000,
    rating: 4.4,
    stockRemaining: 210,
    trend: 15.0
  },
  {
    id: "p9",
    rank: 9,
    productName: "Sony WH-1000XM5",
    productImage: "https://i.pravatar.cc/150?u=a042581f4e29026708d",
    category: "Audio",
    unitsSold: 180,
    revenue: 6300000,
    rating: 4.9,
    stockRemaining: 40,
    trend: 2.3
  },
  {
    id: "p10",
    rank: 10,
    productName: "Xiaomi 14 Pro",
    productImage: "https://i.pravatar.cc/150?u=a042581f4e29026709d",
    category: "Smartphones",
    unitsSold: 150,
    revenue: 12000000,
    rating: 4.5,
    stockRemaining: 65,
    trend: -8.4
  }
];

export const mockSalesTrendByCategory = [
  { month: "Jan", Smartphones: 400, Accessories: 240, Laptops: 100, Audio: 150, Tablets: 80 },
  { month: "Feb", Smartphones: 300, Accessories: 139, Laptops: 120, Audio: 120, Tablets: 70 },
  { month: "Mar", Smartphones: 450, Accessories: 380, Laptops: 150, Audio: 180, Tablets: 110 },
  { month: "Apr", Smartphones: 390, Accessories: 390, Laptops: 180, Audio: 190, Tablets: 90 },
  { month: "May", Smartphones: 480, Accessories: 420, Laptops: 140, Audio: 160, Tablets: 130 },
  { month: "Jun", Smartphones: 520, Accessories: 450, Laptops: 200, Audio: 210, Tablets: 150 }
];
