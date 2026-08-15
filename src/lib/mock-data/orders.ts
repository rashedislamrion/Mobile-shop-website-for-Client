export type MockOrder = {
  id: string;
  date: string;
  branch: string;
  customer: string;
  items: number;
  total: number;
  paymentStatus: "Paid" | "Unpaid" | "Due";
  status: "Pending" | "Confirmed" | "Delivered" | "Cancelled" | "Returned" | "Parcel Booked";
  staff: string;
};

export type OrderTimelineStep = {
  label: string;
  timestamp?: string;
  isCompleted: boolean;
  isCurrent: boolean;
};

export type StaffNote = {
  id: string;
  staffName: string;
  timestamp: string;
  note: string;
};

export type OrderItem = {
  id: string;
  name: string;
  variant: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
  image: string;
};

export type MockOrderDetail = MockOrder & {
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  addressTag: "Home" | "Office" | "Other";
  paymentMethod: "bKash" | "SSLCommerz" | "COD";
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  paidAmount: number;
  dueAmount: number;
  timeline: OrderTimelineStep[];
  staffNotes: StaffNote[];
  orderItems: OrderItem[];
};

export const mockOrders: MockOrder[] = [
  { id: "#ORD-9001", date: "2024-08-15T09:00:00", branch: "Dhaka Main", customer: "Rashed Islam", items: 2, total: 125000, paymentStatus: "Paid", status: "Delivered", staff: "Admin" },
  { id: "#ORD-9002", date: "2024-08-15T10:15:00", branch: "Chattogram", customer: "Jahid Hasan", items: 1, total: 45000, paymentStatus: "Unpaid", status: "Pending", staff: "Saleem" },
  { id: "#ORD-9003", date: "2024-08-15T11:30:00", branch: "Sylhet", customer: "Ayesha Siddiqua", items: 3, total: 210000, paymentStatus: "Due", status: "Confirmed", staff: "Nusrat" },
  { id: "#ORD-9004", date: "2024-08-14T14:20:00", branch: "Dhaka Main", customer: "Tanvir Ahmed", items: 1, total: 85000, paymentStatus: "Paid", status: "Parcel Booked", staff: "Admin" },
  { id: "#ORD-9005", date: "2024-08-14T16:45:00", branch: "Rajshahi", customer: "Kamrul Islam", items: 4, total: 12000, paymentStatus: "Paid", status: "Delivered", staff: "Saleem" },
  { id: "#ORD-9006", date: "2024-08-13T09:10:00", branch: "Dhaka Main", customer: "Sumaiya Akter", items: 2, total: 54000, paymentStatus: "Unpaid", status: "Cancelled", staff: "Nusrat" },
  { id: "#ORD-9007", date: "2024-08-13T12:05:00", branch: "Chattogram", customer: "Faisal Mahmud", items: 1, total: 110000, paymentStatus: "Paid", status: "Returned", staff: "Admin" },
  { id: "#ORD-9008", date: "2024-08-12T15:30:00", branch: "Sylhet", customer: "Sadia Rahman", items: 1, total: 15000, paymentStatus: "Due", status: "Pending", staff: "Saleem" },
  { id: "#ORD-9009", date: "2024-08-12T17:50:00", branch: "Dhaka Main", customer: "Imran Khan", items: 5, total: 320000, paymentStatus: "Paid", status: "Delivered", staff: "Admin" },
  { id: "#ORD-9010", date: "2024-08-11T10:25:00", branch: "Rajshahi", customer: "Nabila Haque", items: 2, total: 42000, paymentStatus: "Paid", status: "Confirmed", staff: "Nusrat" },
  { id: "#ORD-9011", date: "2024-08-11T14:40:00", branch: "Chattogram", customer: "Mahmudul Hasan", items: 1, total: 95000, paymentStatus: "Unpaid", status: "Pending", staff: "Saleem" },
  { id: "#ORD-9012", date: "2024-08-10T11:15:00", branch: "Dhaka Main", customer: "Ritu Akter", items: 3, total: 68000, paymentStatus: "Paid", status: "Delivered", staff: "Admin" },
  { id: "#ORD-9013", date: "2024-08-10T16:00:00", branch: "Sylhet", customer: "Arif Hossain", items: 1, total: 22000, paymentStatus: "Due", status: "Parcel Booked", staff: "Nusrat" },
  { id: "#ORD-9014", date: "2024-08-09T09:30:00", branch: "Rajshahi", customer: "Farhana Islam", items: 2, total: 135000, paymentStatus: "Paid", status: "Returned", staff: "Saleem" },
  { id: "#ORD-9015", date: "2024-08-09T13:45:00", branch: "Dhaka Main", customer: "Shafiqul Islam", items: 4, total: 280000, paymentStatus: "Unpaid", status: "Cancelled", staff: "Admin" },
];

export const mockOrderDetails: Record<string, MockOrderDetail> = {};

mockOrders.forEach(order => {
  mockOrderDetails[order.id] = {
    ...order,
    customerPhone: "+880 1711-223344",
    customerEmail: "customer@example.com",
    shippingAddress: "House 12, Road 5, Block C, Banani, Dhaka-1213",
    addressTag: "Home",
    paymentMethod: order.paymentStatus === "Paid" ? "bKash" : "COD",
    subtotal: order.total - 100, // mock delivery charge
    discount: 0,
    deliveryCharge: 100,
    paidAmount: order.paymentStatus === "Paid" ? order.total : (order.paymentStatus === "Due" ? order.total / 2 : 0),
    dueAmount: order.paymentStatus === "Paid" ? 0 : (order.paymentStatus === "Due" ? order.total / 2 : order.total),
    orderItems: Array.from({ length: order.items }).map((_, i) => ({
      id: `ITEM-${i + 1}`,
      name: `iPhone ${13 + i} Pro Max Display`,
      variant: "OLED, Grade A",
      qty: 1,
      unitPrice: Math.floor(order.total / order.items) - (i === 0 ? 100 : 0),
      lineTotal: Math.floor(order.total / order.items) - (i === 0 ? 100 : 0),
      image: "https://images.unsplash.com/photo-1601784551446-20c9e07cd8d3?w=150&h=150&fit=crop"
    })),
    timeline: [
      { label: "Order Placed", timestamp: order.date, isCompleted: true, isCurrent: false },
      { label: "Confirmed", timestamp: order.date, isCompleted: ["Confirmed", "Delivered", "Parcel Booked"].includes(order.status), isCurrent: order.status === "Confirmed" },
      { label: "Processing", timestamp: undefined, isCompleted: ["Delivered", "Parcel Booked"].includes(order.status), isCurrent: order.status === "Parcel Booked" },
      { label: "Delivered", timestamp: undefined, isCompleted: order.status === "Delivered", isCurrent: order.status === "Delivered" },
    ],
    staffNotes: [
      { id: "1", staffName: order.staff, timestamp: order.date, note: "Verified address with customer." }
    ]
  };
});
