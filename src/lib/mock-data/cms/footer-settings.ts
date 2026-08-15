export interface FooterSettings {
  support: {
    phoneNumber: string;
    email: string;
    liveChatLink: string;
    faqLink: string;
  };
  visibleBranches: string[]; // array of branch IDs
  copyrightText: string;
}

export const mockFooterSettings: FooterSettings = {
  support: {
    phoneNumber: '+880 1234 567890',
    email: 'support@novamobile.com',
    liveChatLink: 'https://wa.me/8801234567890',
    faqLink: '/faq',
  },
  visibleBranches: ['1', '2', '3'], // Assuming these IDs correspond to mock branches
  copyrightText: '© {year} All Rights Reserved By NovaMobile.',
};
