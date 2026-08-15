export interface Country {
  id: string;
  name: string;
  code: string;
  currency: string;
  status: 'Active' | 'Inactive';
}

export const mockCountries: Country[] = [
  { id: '1', name: 'Bangladesh', code: 'BD', currency: 'BDT - ৳', status: 'Active' },
  { id: '2', name: 'United States', code: 'US', currency: 'USD - $', status: 'Inactive' },
  { id: '3', name: 'India', code: 'IN', currency: 'INR - ₹', status: 'Inactive' },
  { id: '4', name: 'United Kingdom', code: 'GB', currency: 'GBP - £', status: 'Inactive' },
];
