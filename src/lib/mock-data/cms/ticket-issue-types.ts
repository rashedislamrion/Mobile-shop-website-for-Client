export interface TicketIssueType {
  id: string;
  name: string;
  category: 'Product Issue' | 'Order Issue' | 'Payment Issue' | 'Other';
  autoAssignTo: string; // role or department
  ticketCount: number;
  status: 'Active' | 'Inactive';
}

export const mockTicketIssueTypes: TicketIssueType[] = [
  { id: '1', name: 'Broken Display', category: 'Product Issue', autoAssignTo: 'Technician', ticketCount: 45, status: 'Active' },
  { id: '2', name: 'Battery Issue', category: 'Product Issue', autoAssignTo: 'Technician', ticketCount: 30, status: 'Active' },
  { id: '3', name: 'Order Not Received', category: 'Order Issue', autoAssignTo: 'Customer Support', ticketCount: 12, status: 'Active' },
  { id: '4', name: 'Wrong Item Delivered', category: 'Order Issue', autoAssignTo: 'Customer Support', ticketCount: 5, status: 'Active' },
  { id: '5', name: 'Refund Request', category: 'Payment Issue', autoAssignTo: 'Accounts', ticketCount: 8, status: 'Active' },
  { id: '6', name: 'General Inquiry', category: 'Other', autoAssignTo: 'Customer Support', ticketCount: 0, status: 'Inactive' },
];
