export type MockCourierTracking = {
  trackingNo: string;
  orderId: string;
  courierPartner: "Pathao" | "Steadfast" | "RedX";
  customerName: string;
  address: string;
  status: "Pending Pickup" | "Picked Up" | "In Transit" | "Delivered" | "Returned";
  lastUpdated: string; // ISO date string
};

export const mockCourierList: MockCourierTracking[] = [
  {
    trackingNo: "PTH-12345678",
    orderId: "CS001",
    courierPartner: "Pathao",
    customerName: "Rashed Islam",
    address: "House 12, Road 5, Dhanmondi, Dhaka",
    status: "Delivered",
    lastUpdated: "2024-03-15T15:30:00Z",
  },
  {
    trackingNo: "STF-98765432",
    orderId: "CS002",
    courierPartner: "Steadfast",
    customerName: "Sumi Akter",
    address: "Flat 4B, Rupayan City, Uttara, Dhaka",
    status: "In Transit",
    lastUpdated: "2024-03-15T18:45:00Z",
  },
  {
    trackingNo: "RDX-55667788",
    orderId: "CS003",
    courierPartner: "RedX",
    customerName: "Fahim Rahman",
    address: "Shop 105, Agrabad C/A, Chattogram",
    status: "Pending Pickup",
    lastUpdated: "2024-03-16T10:20:00Z",
  },
  {
    trackingNo: "PTH-22334455",
    orderId: "CS004",
    courierPartner: "Pathao",
    customerName: "Mahmud Hasan",
    address: "Kazi Nazrul Avenue, Shahbagh, Dhaka",
    status: "Returned",
    lastUpdated: "2024-03-16T16:10:00Z",
  },
  {
    trackingNo: "STF-33445566",
    orderId: "CS005",
    courierPartner: "Steadfast",
    customerName: "Tariqul Islam",
    address: "Block C, Bashundhara R/A, Dhaka",
    status: "Delivered",
    lastUpdated: "2024-03-17T14:00:00Z",
  },
  {
    trackingNo: "RDX-77889900",
    orderId: "CS006",
    courierPartner: "RedX",
    customerName: "Nusrat Jahan",
    address: "Zindabazar, Sylhet",
    status: "Picked Up",
    lastUpdated: "2024-03-17T18:30:00Z",
  },
  {
    trackingNo: "PTH-11223344",
    orderId: "CS007",
    courierPartner: "Pathao",
    customerName: "Kamrul Hasan",
    address: "Mirpur 10 Roundabout, Dhaka",
    status: "Pending Pickup",
    lastUpdated: "2024-03-18T10:25:00Z",
  },
  {
    trackingNo: "STF-99887766",
    orderId: "CS008",
    courierPartner: "Steadfast",
    customerName: "Shabana Akter",
    address: "Sector 7, Uttara, Dhaka",
    status: "Returned",
    lastUpdated: "2024-03-18T15:20:00Z",
  },
  {
    trackingNo: "RDX-44556677",
    orderId: "CS009",
    courierPartner: "RedX",
    customerName: "Imran Khan",
    address: "GEC Circle, Chattogram",
    status: "Delivered",
    lastUpdated: "2024-03-19T14:45:00Z",
  },
  {
    trackingNo: "PTH-99001122",
    orderId: "CS010",
    courierPartner: "Pathao",
    customerName: "Asif Akbar",
    address: "Banani Super Market, Dhaka",
    status: "In Transit",
    lastUpdated: "2024-03-19T17:10:00Z",
  },
  {
    trackingNo: "STF-11223344",
    orderId: "CS011",
    courierPartner: "Steadfast",
    customerName: "Rubel Mia",
    address: "Jatrabari Bus Stand, Dhaka",
    status: "Picked Up",
    lastUpdated: "2024-03-20T10:30:00Z",
  },
  {
    trackingNo: "RDX-66778899",
    orderId: "CS012",
    courierPartner: "RedX",
    customerName: "Sabina Yasmin",
    address: "New Market Area, Rajshahi",
    status: "In Transit",
    lastUpdated: "2024-03-20T16:45:00Z",
  }
];
