export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: 'Published' | 'Draft';
  isSystem: boolean;
  metaTitle?: string;
  metaDescription?: string;
  updatedAt: string;
}

export const mockPages: CmsPage[] = [
  {
    id: '1',
    title: 'About Us',
    slug: '/about-us',
    content: '<p>Welcome to NovaMobile...</p>',
    status: 'Published',
    isSystem: true,
    updatedAt: '2024-05-10T10:00:00Z',
  },
  {
    id: '2',
    title: 'Terms & Conditions',
    slug: '/terms-and-conditions',
    content: '<p>These terms apply to all purchases...</p>',
    status: 'Published',
    isSystem: true,
    updatedAt: '2024-05-12T10:00:00Z',
  },
  {
    id: '3',
    title: 'Privacy Policy',
    slug: '/privacy-policy',
    content: '<p>We take your privacy seriously...</p>',
    status: 'Published',
    isSystem: true,
    updatedAt: '2024-05-12T10:00:00Z',
  },
  {
    id: '4',
    title: 'Warranty Policy',
    slug: '/warranty-policy',
    content: '<p>All devices come with a standard 1-year warranty...</p>',
    status: 'Published',
    isSystem: true,
    updatedAt: '2024-05-15T10:00:00Z',
  },
  {
    id: '5',
    title: 'FAQ',
    slug: '/faq',
    content: '<p>Frequently Asked Questions...</p>',
    status: 'Published',
    isSystem: true,
    updatedAt: '2024-05-20T10:00:00Z',
  },
  {
    id: '6',
    title: 'Return Policy',
    slug: '/return-policy',
    content: '<p>Our return policy lasts 30 days...</p>',
    status: 'Draft',
    isSystem: false,
    updatedAt: '2024-06-01T10:00:00Z',
  },
];
