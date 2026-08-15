export type MockProduct = {
  id: string;
  name: string;
  sku: string;
  image: string;
  category: string;
  brand: string;
  price: number;
  oldPrice?: number;
  stock: number;
  status: "Active" | "Draft" | "Out of Stock";
};

export const mockProducts: MockProduct[] = [
  { id: "PROD-001", name: "iPhone 13 Pro Max Display - OLED", sku: "IP13PM-DIS-OLED", image: "https://images.unsplash.com/photo-1603812859942-0f5ba62283e3?auto=format&fit=crop&q=80&w=200", category: "Display", brand: "Apple", price: 15500, stock: 45, status: "Active" },
  { id: "PROD-002", name: "Samsung Galaxy S22 Ultra Battery - Original", sku: "S22U-BAT-ORG", image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=200", category: "Battery", brand: "Samsung", price: 4200, oldPrice: 5000, stock: 12, status: "Active" },
  { id: "PROD-003", name: "Redmi Note 10 Pro Charging Logic", sku: "RN10P-CHG-LOGIC", image: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&q=80&w=200", category: "Charging Logic", brand: "Xiaomi", price: 850, stock: 150, status: "Active" },
  { id: "PROD-004", name: "iPhone 11 Pro Back Glass - Space Gray", sku: "IP11P-BG-SG", image: "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&q=80&w=200", category: "Back Glass", brand: "Apple", price: 1200, stock: 5, status: "Active" },
  { id: "PROD-005", name: "OnePlus 9 Pro Camera Module", sku: "OP9P-CAM-MOD", image: "https://images.unsplash.com/photo-1512054502232-10a0a035d672?auto=format&fit=crop&q=80&w=200", category: "Camera", brand: "OnePlus", price: 6500, stock: 0, status: "Out of Stock" },
  { id: "PROD-006", name: "Poco X3 Pro Motherboard - 8/128GB", sku: "POCOX3P-MB-8128", image: "https://images.unsplash.com/photo-1562408590-e32931084e23?auto=format&fit=crop&q=80&w=200", category: "Motherboard", brand: "Xiaomi", price: 12000, stock: 2, status: "Active" },
  { id: "PROD-007", name: "Realme 8 Pro Display - IPS LCD", sku: "RLM8P-DIS-IPS", image: "https://images.unsplash.com/photo-1603812859942-0f5ba62283e3?auto=format&fit=crop&q=80&w=200", category: "Display", brand: "Realme", price: 2800, oldPrice: 3200, stock: 85, status: "Active" },
  { id: "PROD-008", name: "Vivo V21e Loud Speaker", sku: "V21E-SPKR", image: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&q=80&w=200", category: "Speaker", brand: "Vivo", price: 450, stock: 20, status: "Draft" },
  { id: "PROD-009", name: "Oppo F19 Pro Sim Tray - Black", sku: "OPF19P-SIM-BLK", image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=200", category: "Sim Tray", brand: "Oppo", price: 150, stock: 300, status: "Active" },
  { id: "PROD-010", name: "Samsung Galaxy Note 20 Ultra S-Pen", sku: "N20U-SPEN-BLK", image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=200", category: "S PEN", brand: "Samsung", price: 3500, stock: 0, status: "Out of Stock" },
  { id: "PROD-011", name: "iPhone 14 Pro Max Camera Glass Lens", sku: "IP14PM-CAM-LENS", image: "https://images.unsplash.com/photo-1512054502232-10a0a035d672?auto=format&fit=crop&q=80&w=200", category: "Camera Glass", brand: "Apple", price: 800, stock: 120, status: "Active" },
  { id: "PROD-012", name: "Xiaomi 12 Pro Housing / Frame - Blue", sku: "MI12P-HSG-BLU", image: "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&q=80&w=200", category: "Housing", brand: "Xiaomi", price: 2200, stock: 15, status: "Active" },
];
