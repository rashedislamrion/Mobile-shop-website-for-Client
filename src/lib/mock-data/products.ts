import { Product, Brand } from '@/types';
import { mockCategories } from './categories';

const brands: Brand[] = [
  { id: '1', name: 'Apple', slug: 'apple' },
  { id: '2', name: 'Samsung', slug: 'samsung' },
  { id: '3', name: 'Xiaomi', slug: 'xiaomi' },
  { id: '4', name: 'Google', slug: 'google' },
  { id: '5', name: 'HONOR', slug: 'honor' },
  { id: '6', name: 'HUAWEI', slug: 'huawei' },
  { id: '7', name: 'LG', slug: 'lg' },
];

const qualities = ['Original', 'OEM', 'High Quality', 'GX', 'IPS', 'TFT', 'OLED Small'];
const guarantees = ['N/A', '7 Days', '30 Days'];
const frames = ['With Frame', 'No Frame'];
const types = ['Small Display', 'Big Display'];
const colors = ['Black', 'White', 'Gray', 'Silver', 'Green', 'Bronze', 'Blue'];

// Generate 45 products to make pagination meaningful
export const mockProducts: Product[] = Array.from({ length: 45 }).map((_, i) => {
  const brand = brands[i % brands.length];
  const category = mockCategories[i % mockCategories.length];
  const isDisplay = category.slug === 'display';
  
  return {
    id: `p${i + 1}`,
    name: `${brand.name} Component ${i + 1} - ${category.name}`,
    slug: `product-${i + 1}`,
    price: 1000 + (i * 250) % 5000,
    oldPrice: i % 3 === 0 ? 1200 + (i * 250) % 5000 : undefined,
    saveAmount: i % 3 === 0 ? 200 : undefined,
    images: [
      `https://placehold.co/800x800/f8fafc/94a3b8?text=${brand.name}+${category.name.replace(' ', '+')}+1`,
      `https://placehold.co/800x800/f8fafc/94a3b8?text=${brand.name}+${category.name.replace(' ', '+')}+2`,
      `https://placehold.co/800x800/f8fafc/94a3b8?text=${brand.name}+${category.name.replace(' ', '+')}+3`,
      `https://placehold.co/800x800/f8fafc/94a3b8?text=${brand.name}+${category.name.replace(' ', '+')}+4`,
    ],
    colors: [colors[i % colors.length], colors[(i + 1) % colors.length], colors[(i + 2) % colors.length]],
    qualities: [qualities[i % qualities.length], qualities[(i + 1) % qualities.length]],
    quality: qualities[i % qualities.length],
    guarantee: guarantees[i % guarantees.length],
    frame: isDisplay ? frames[i % frames.length] : undefined,
    type: isDisplay ? types[i % types.length] : undefined,
    service: isDisplay ? 'Display Replacement' : undefined,
    brand: brand,
    category: category,
    stock: i % 5 === 0 ? 0 : 10 + i,
    createdAt: new Date(Date.now() - i * 10000000).toISOString(),
    popularity: (i * 7) % 100,
    description: `This is a premium ${category.name} for ${brand.name} devices, ensuring exact compatibility and exceptional performance. Manufactured using high-quality materials, this replacement part resolves common issues and restores your device to its original factory condition. Trusted by technicians and DIY enthusiasts alike for its reliability and durability.`,
    specifications: [
      { key: "Brand compatibility", value: brand.name },
      { key: "Part type", value: category.name },
      { key: "Material", value: "Premium grade OEM compliant" },
      { key: "Warranty", value: guarantees[i % guarantees.length] },
      { key: "Condition", value: "Brand New" }
    ],
    keyBenefits: [
      "Restores full original functionality to your device",
      "Rigorous quality control and factory testing",
      "Easy installation with standard repair tools",
      "Cost-effective alternative to buying a new phone"
    ]
  };
});
