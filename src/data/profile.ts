import type { NavItem } from '@/types';

export const profile = {
  /**
   * Written without diacritics on purpose: neither Syne nor DM Mono serves
   * ễ U+1EC5, ỗ U+1ED7 or ả U+1EA3, so the browser substitutes a fallback family
   * for just those letters and the name renders in two fonts mid-word. Verify
   * with `node scripts/check-font-vietnamese.mjs` before restoring the accents.
   */
  name: 'Nguyen Do Khai',
  nameLines: ['Nguyen', 'Do Khai'],
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
    'Information Technology student at University of Transport Ho Chi Minh City, intake 2023, working as a fullstack web developer. I have led three team projects and built across React, Next.js, NestJS, PostgreSQL and Move smart contracts — covering web, mobile and on-chain.',
  aboutQuote: '“From idea to shipped product — clean architecture, real problems, working software.”',
  avatar: '/assets/PP.png',
  /**
   * Empty until a real CV is published. The About section hides the download
   * button while this is blank rather than rendering a dead link.
   */
  cvUrl: '',
  siteLabel: 'github.com/NguyenDokhai2005',
  copyright: '© 2026 Nguyen Do Khai — All rights reserved.',
} as const;

export const navItems: NavItem[] = [
  { label: 'Home', id: 'home' },
  { label: 'About', id: 'about' },
  { label: 'Portfolio', id: 'portfolio' },
  { label: 'Contact', id: 'contact' },
];
