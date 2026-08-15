export interface AdRecord {
  id: string;
  thumbnail: string;
  title: string;
  description?: string;
  placement: string;
  linkUrl: string;
  startDate?: string;
  endDate?: string;
  impressions: number;
  clicks: number;
  status: "Active" | "Scheduled" | "Expired" | "Inactive";
}

export const mockAds: AdRecord[] = [
  {
    id: "ad1",
    thumbnail: "https://placehold.co/300x250/f1f5f9/94a3b8?text=Sidebar+Ad",
    title: "50% Off Accessories",
    description: "Get half price on all cases and chargers.",
    placement: "Homepage Sidebar",
    linkUrl: "/category/accessories",
    impressions: 45200,
    clicks: 1205,
    status: "Active"
  },
  {
    id: "ad2",
    thumbnail: "https://placehold.co/728x90/f1f5f9/94a3b8?text=Header+Strip",
    title: "Flash Sale Alert",
    placement: "Category Page Top",
    linkUrl: "/flash-sale",
    startDate: "2026-08-20",
    endDate: "2026-08-22",
    impressions: 0,
    clicks: 0,
    status: "Scheduled"
  },
  {
    id: "ad3",
    thumbnail: "https://placehold.co/400x400/f1f5f9/94a3b8?text=Popup",
    title: "Welcome Newsletter Discount",
    description: "Sign up to get 10% off your first order.",
    placement: "Popup on Load",
    linkUrl: "/newsletter",
    impressions: 125000,
    clicks: 8400,
    status: "Active"
  }
];
