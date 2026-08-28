import type { NavItem } from '@/types';

export const profile = {
  name: 'Rifqi Muhammad Aliya',
  nameLines: ['Rifqi', 'Muhammad', 'Aliya'],
  brand: 'rifqi.dev',
  role: ['Frontend', 'Developer'],
  availability: '✦ Available for work',
  typedRoles: ['Junior Programmer', 'fresh Graduate', 'Happy coding!'],
  heroTags: ['Typescript', 'React.js', 'Tailwind'],
  heroDescription:
    'Menciptakan website modern dengan tampilan clean, responsif, dan elegan. Mengubah ide dan desain menjadi pengalaman digital yang menarik dan mudah digunakan.',
  heroNotes: ['↓ explore my work below', '↗ open to full-time & freelance opportunities'],
  aboutDescription:
    'Fresh Graduate SMK Rekayasa Perangkat Lunak lulusan 2026 dengan passion di bidang frontend development dan UI modern. Berfokus pada pembuatan website clean, responsif, dan visual yang kuat untuk menghadirkan pengalaman digital yang optimal.',
  aboutQuote: '“Turning ideas into clean, modern, and meaningful digital experiences.”',
  avatar: '/assets/PP.png',
  cvUrl:
    'https://drive.google.com/file/d/1cFqZ0TY0U0I51K0Tchv8E4sbOv5yAZ9x/view?usp=drive_link',
  siteLabel: 'www.rifqi.vercel.app',
  copyright: '© 2026 Rifqi Muhammad Aliya — All rights reserved.',
} as const;

export const navItems: NavItem[] = [
  { label: 'Home', id: 'home' },
  { label: 'About', id: 'about' },
  { label: 'Portfolio', id: 'portfolio' },
  { label: 'Contact', id: 'contact' },
];
