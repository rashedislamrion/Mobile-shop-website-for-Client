export interface MenuItem {
  id: string;
  label: string;
  linkType: 'Category' | 'Product' | 'Custom Page' | 'Custom URL';
  linkTarget: string;
  openInNewTab: boolean;
  status: 'Active' | 'Inactive';
  position: number;
}

export interface Menu {
  id: string;
  name: string;
  items: MenuItem[];
}

export const mockMenus: Menu[] = [
  {
    id: 'header-nav',
    name: 'Header Navigation',
    items: [
      { id: '1', label: 'Display', linkType: 'Category', linkTarget: '/category/display', openInNewTab: false, status: 'Active', position: 1 },
      { id: '2', label: 'Battery', linkType: 'Category', linkTarget: '/category/battery', openInNewTab: false, status: 'Active', position: 2 },
      { id: '3', label: 'Gadgets', linkType: 'Category', linkTarget: '/category/gadgets', openInNewTab: false, status: 'Active', position: 3 },
      { id: '4', label: 'Blogs', linkType: 'Custom Page', linkTarget: '/blogs', openInNewTab: false, status: 'Active', position: 4 },
    ]
  },
  {
    id: 'footer-quick',
    name: 'Footer Quick Links',
    items: [
      { id: '1', label: 'About Us', linkType: 'Custom Page', linkTarget: '/about-us', openInNewTab: false, status: 'Active', position: 1 },
      { id: '2', label: 'Contact Us', linkType: 'Custom Page', linkTarget: '/contact-us', openInNewTab: false, status: 'Active', position: 2 },
      { id: '3', label: 'Privacy Policy', linkType: 'Custom Page', linkTarget: '/privacy-policy', openInNewTab: false, status: 'Active', position: 3 },
      { id: '4', label: 'Terms & Conditions', linkType: 'Custom Page', linkTarget: '/terms-and-conditions', openInNewTab: false, status: 'Active', position: 4 },
    ]
  },
  {
    id: 'footer-support',
    name: 'Footer Support Links',
    items: [
      { id: '1', label: 'FAQ', linkType: 'Custom Page', linkTarget: '/faq', openInNewTab: false, status: 'Active', position: 1 },
      { id: '2', label: 'Warranty Policy', linkType: 'Custom Page', linkTarget: '/warranty-policy', openInNewTab: false, status: 'Active', position: 2 },
    ]
  }
];
