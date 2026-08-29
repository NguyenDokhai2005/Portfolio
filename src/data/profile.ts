import type { NavItem } from '@/types';

export const profile = {
  name: 'Nguyễn Đỗ Khải',
  nameLines: ['Nguyễn', 'Đỗ Khải'],
  brand: 'crust.dev',
  role: ['Fullstack', 'Developer'],
  availability: '✦ Available for work',
  typedRoles: ['Fullstack Web Developer', 'IT Student — UTH', 'Happy coding!'],
  heroTags: ['TypeScript', 'React', 'NestJS'],
  heroDescription:
    'Building fullstack web products end to end — from a visual AI workflow builder to a realtime e-commerce platform and a blockchain Telegram mini app. Focused on clean architecture, responsive interfaces, and software that holds up in real use.',
  heroNotes: [
    '↓ explore my work below',
    '↗ open to internship & full-time opportunities',
  ],
  aboutDescription:
    'Information Technology student at University of Transport Ho Chi Minh City, intake 2023, working as a fullstack web developer. I have led two team projects and built across React, Next.js, NestJS, PostgreSQL and Move smart contracts — covering web, mobile and on-chain.',
  aboutQuote: '“From idea to shipped product — clean architecture, real problems, working software.”',
  avatar: '/assets/PP.png',
  /**
   * Empty until a real CV is published. The About section hides the download
   * button while this is blank rather than rendering a dead link.
   */
  cvUrl: '',
  siteLabel: 'github.com/NguyenDokhai2005',
  copyright: '© 2026 Nguyễn Đỗ Khải — All rights reserved.',
} as const;

export const navItems: NavItem[] = [
  { label: 'Home', id: 'home' },
  { label: 'About', id: 'about' },
  { label: 'Portfolio', id: 'portfolio' },
  { label: 'Contact', id: 'contact' },
];
