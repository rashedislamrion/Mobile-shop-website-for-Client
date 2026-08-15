export interface BannerRecord {
  id: string;
  image: string;
  title: string;
  linkUrl: string;
  position: number;
  startDate?: string;
  endDate?: string;
  status: "Active" | "Inactive";
}

export const mockBanners: BannerRecord[] = [
  {
    id: "bn1",
    image: "https://placehold.co/1600x600/f1f5f9/94a3b8?text=Summer+Sale+Banner",
    title: "Summer Sale 2026",
    linkUrl: "/offers/summer-sale",
    position: 1,
    status: "Active"
  },
  {
    id: "bn2",
    image: "https://placehold.co/1600x600/f1f5f9/94a3b8?text=iPhone+16+Preorder",
    title: "iPhone 16 Pro Pre-order",
    linkUrl: "/products/iphone-16-pro",
    position: 2,
    status: "Active"
  },
  {
    id: "bn3",
    image: "https://placehold.co/1600x600/f1f5f9/94a3b8?text=Free+Shipping",
    title: "Free Shipping Nationwide",
    linkUrl: "/shipping-policy",
    position: 3,
    status: "Inactive"
  }
];
