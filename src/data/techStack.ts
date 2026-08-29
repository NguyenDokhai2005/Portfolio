import type { TechStackItem } from '@/types';

const DEVICON = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons';

/**
 * Drawn from what the listed projects actually use.
 *
 * `invert` marks logos that devicon ships as solid black or near-black, which
 * would be invisible on the site's dark tiles. Verify any additions with
 * `node scripts/check-devicons.mjs`.
 */
export const techStack: TechStackItem[] = [
  // --- Frontend ---
  { id: 'ts-01', name: 'HTML', logo_url: `${DEVICON}/html5/html5-original.svg` },
  { id: 'ts-02', name: 'CSS', logo_url: `${DEVICON}/css3/css3-original.svg` },
  { id: 'ts-03', name: 'JavaScript', logo_url: `${DEVICON}/javascript/javascript-original.svg` },
  { id: 'ts-04', name: 'TypeScript', logo_url: `${DEVICON}/typescript/typescript-original.svg` },
  { id: 'ts-05', name: 'React', logo_url: `${DEVICON}/react/react-original.svg` },
  { id: 'ts-06', name: 'Next.js', logo_url: `${DEVICON}/nextjs/nextjs-original.svg`, invert: true },
  { id: 'ts-07', name: 'Tailwind', logo_url: `${DEVICON}/tailwindcss/tailwindcss-original.svg` },
  {
    id: 'ts-08',
    name: 'Framer Motion',
    logo_url: `${DEVICON}/framermotion/framermotion-original.svg`,
    invert: true,
  },
  { id: 'ts-09', name: 'Zustand', logo_url: `${DEVICON}/zustand/zustand-original.svg` },
  { id: 'ts-10', name: 'Vite', logo_url: `${DEVICON}/vitejs/vitejs-original.svg` },

  // --- Backend ---
  { id: 'ts-11', name: 'Node.js', logo_url: `${DEVICON}/nodejs/nodejs-original.svg` },
  { id: 'ts-12', name: 'NestJS', logo_url: `${DEVICON}/nestjs/nestjs-original.svg` },
  { id: 'ts-13', name: 'PostgreSQL', logo_url: `${DEVICON}/postgresql/postgresql-original.svg` },
  { id: 'ts-14', name: 'Prisma', logo_url: `${DEVICON}/prisma/prisma-original.svg`, invert: true },
  { id: 'ts-15', name: 'Supabase', logo_url: `${DEVICON}/supabase/supabase-original.svg` },
  {
    id: 'ts-16',
    name: 'Socket.io',
    logo_url: `${DEVICON}/socketio/socketio-original.svg`,
    invert: true,
  },

  // --- Mobile ---
  { id: 'ts-17', name: 'Kotlin', logo_url: `${DEVICON}/kotlin/kotlin-original.svg` },
  {
    id: 'ts-18',
    name: 'Jetpack Compose',
    logo_url: `${DEVICON}/jetpackcompose/jetpackcompose-original.svg`,
  },
  { id: 'ts-19', name: 'Android', logo_url: `${DEVICON}/android/android-original.svg` },
  { id: 'ts-20', name: 'SQLite', logo_url: `${DEVICON}/sqlite/sqlite-original.svg` },

  // --- Tooling ---
  { id: 'ts-21', name: 'Git', logo_url: `${DEVICON}/git/git-original.svg` },
  { id: 'ts-22', name: 'Vercel', logo_url: `${DEVICON}/vercel/vercel-original.svg`, invert: true },
  { id: 'ts-23', name: 'Figma', logo_url: `${DEVICON}/figma/figma-original.svg` },
  { id: 'ts-24', name: 'VS Code', logo_url: `${DEVICON}/vscode/vscode-original.svg` },
];
