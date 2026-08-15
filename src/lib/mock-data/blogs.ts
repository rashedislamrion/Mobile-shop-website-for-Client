import { Blog } from '@/types';

export interface BlogWithMeta extends Blog {
  viewCount: number;
  status: "Published" | "Draft" | "Scheduled";
}

export const mockBlogs: BlogWithMeta[] = [
  {
    id: 'b1',
    title: 'How to Identify Original vs Fake iPhone Displays',
    slug: 'identify-original-vs-fake-iphone-display',
    excerpt: 'Learn the key differences between genuine Apple displays and aftermarket screens to ensure you get the best quality repair.',
    content: 'Full content goes here...',
    author: 'Admin',
    coverImage: 'https://placehold.co/600x400/f1f5f9/94a3b8?text=iPhone+Display',
    createdAt: '2026-08-10T10:00:00Z',
    viewCount: 1250,
    status: "Published"
  },
  {
    id: 'b2',
    title: 'Top 5 Tips for Extending Your Smartphone Battery Life',
    slug: 'tips-extend-smartphone-battery-life',
    excerpt: 'Is your battery draining too fast? Try these 5 proven methods to maximize your phone battery health and daily lifespan.',
    content: 'Full content goes here...',
    author: 'Admin',
    coverImage: 'https://placehold.co/600x400/f1f5f9/94a3b8?text=Battery+Tips',
    createdAt: '2026-08-12T14:30:00Z',
    viewCount: 890,
    status: "Published"
  },
  {
    id: 'b3',
    title: 'When Should You Replace Your Phone\'s Charging Logic?',
    slug: 'when-to-replace-charging-logic',
    excerpt: 'If your phone is charging slowly or not connecting to PC, the charging sub-board might be the culprit. Here is how to know.',
    content: 'Full content goes here...',
    author: 'Admin',
    coverImage: 'https://placehold.co/600x400/f1f5f9/94a3b8?text=Charging+Logic',
    createdAt: '2026-08-14T09:15:00Z',
    viewCount: 432,
    status: "Draft"
  },
  {
    id: 'b4',
    title: 'The Ultimate Guide to Purchasing Used Mobile Parts',
    slug: 'guide-purchasing-used-mobile-parts',
    excerpt: 'Buying pulled original parts can save you money. Learn what to look for when buying used cameras, housings, and logic boards.',
    content: 'Full content goes here...',
    author: 'Admin',
    coverImage: 'https://placehold.co/600x400/f1f5f9/94a3b8?text=Used+Parts',
    createdAt: '2026-08-01T11:00:00Z',
    viewCount: 2105,
    status: "Published"
  },
  {
    id: 'b5',
    title: 'Why Genuine Back Glass Matters for Water Resistance',
    slug: 'genuine-back-glass-water-resistance',
    excerpt: 'Replacing a broken back glass with a cheap alternative can ruin your phone\'s IP68 rating. We explain why the adhesive and material matter.',
    content: 'Full content goes here...',
    author: 'Admin',
    coverImage: 'https://placehold.co/600x400/f1f5f9/94a3b8?text=Back+Glass',
    createdAt: '2026-07-28T16:45:00Z',
    viewCount: 678,
    status: "Published"
  },
  {
    id: 'b6',
    title: 'Upcoming Tech: What to Expect from Mobile Displays in 2027',
    slug: 'future-mobile-displays-2027',
    excerpt: 'From micro-LEDs to rollable screens, discover the next generation of mobile display technology hitting the market soon.',
    content: 'Full content goes here...',
    author: 'Admin',
    coverImage: 'https://placehold.co/600x400/f1f5f9/94a3b8?text=Future+Tech',
    createdAt: '2026-07-20T08:20:00Z',
    viewCount: 340,
    status: "Scheduled"
  }
];
