export interface PushNotificationRecord {
  id: string;
  title: string;
  message: string;
  targetAudience: "All Customers" | "Customers with Cart" | "Specific Customer Segment";
  link?: string;
  status: "Sent" | "Scheduled" | "Draft" | "Failed";
  sendDate?: string;
  deliveredCount: number;
}

export const mockPushNotifications: PushNotificationRecord[] = [
  {
    id: "pn1",
    title: "Don't miss our Summer Sale! ☀️",
    message: "Up to 50% off on selected items. Tap to shop now.",
    targetAudience: "All Customers",
    link: "/offers/summer-sale",
    status: "Sent",
    sendDate: "2026-08-10T09:00:00Z",
    deliveredCount: 45210
  },
  {
    id: "pn2",
    title: "You left something behind...",
    message: "Your cart is waiting. Complete your purchase now and get 10% off with code CART10.",
    targetAudience: "Customers with Cart",
    link: "/cart",
    status: "Scheduled",
    sendDate: "2026-08-16T18:00:00Z",
    deliveredCount: 0
  },
  {
    id: "pn3",
    title: "New iPhone Cases Arrived!",
    message: "Check out the new collection of premium leather cases.",
    targetAudience: "Specific Customer Segment",
    link: "/category/cases",
    status: "Draft",
    deliveredCount: 0
  }
];
