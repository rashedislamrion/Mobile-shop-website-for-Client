export interface SocialLink {
  platform: string;
  url: string;
  status: 'Active' | 'Inactive';
}

export const mockSocialLinks: SocialLink[] = [
  { platform: 'Facebook', url: 'https://facebook.com/mobilehubbd', status: 'Active' },
  { platform: 'Instagram', url: 'https://instagram.com/mobilehubbd', status: 'Active' },
  { platform: 'YouTube', url: 'https://youtube.com/mobilehubbd', status: 'Active' },
  { platform: 'TikTok', url: 'https://tiktok.com/@mobilehubbd', status: 'Inactive' },
  { platform: 'WhatsApp', url: 'https://wa.me/8801234567890', status: 'Active' },
  { platform: 'LinkedIn', url: '', status: 'Inactive' },
];
