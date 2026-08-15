export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  submittedAt: string;
  status: 'New' | 'Read' | 'Replied';
}

export const mockContactSubmissions: ContactSubmission[] = [
  {
    id: '1',
    name: 'Rahim Uddin',
    email: 'rahim@example.com',
    phone: '01711000000',
    subject: 'Bulk Purchase Inquiry',
    message: 'I am interested in buying 50 units of Samsung Galaxy S24 for my company. Please let me know if you can offer a corporate discount.',
    submittedAt: '2024-05-15T14:30:00Z',
    status: 'New',
  },
  {
    id: '2',
    name: 'Karim Hasan',
    email: 'karim@example.com',
    phone: '01811000000',
    subject: 'Warranty Claim Issue',
    message: 'My display has a green line after the recent update. Is this covered under warranty?',
    submittedAt: '2024-05-14T09:15:00Z',
    status: 'Replied',
  },
  {
    id: '3',
    name: 'Salma Begum',
    email: 'salma@example.com',
    phone: '01911000000',
    subject: 'Store Location Query',
    message: 'Do you have any branches in Sylhet?',
    submittedAt: '2024-05-13T16:45:00Z',
    status: 'Read',
  },
];
