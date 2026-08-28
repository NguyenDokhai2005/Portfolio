import type { TechStackItem } from '@/types';

const DEVICON = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons';

/**
 * Mirrors the original `tech_stack` table (id / name / logo_url).
 * Swap `logo_url` for self-hosted files under `public/assets/tech/` if you
 * prefer zero external requests.
 */
export const techStack: TechStackItem[] = [
  { id: 'ts-01', name: 'HTML', logo_url: `${DEVICON}/html5/html5-original.svg` },
  { id: 'ts-02', name: 'CSS', logo_url: `${DEVICON}/css3/css3-original.svg` },
  { id: 'ts-03', name: 'JavaScript', logo_url: `${DEVICON}/javascript/javascript-original.svg` },
  { id: 'ts-04', name: 'Typescript', logo_url: `${DEVICON}/typescript/typescript-original.svg` },
  { id: 'ts-05', name: 'React.js', logo_url: `${DEVICON}/react/react-original.svg` },
  { id: 'ts-06', name: 'Tailwind', logo_url: `${DEVICON}/tailwindcss/tailwindcss-original.svg` },
  { id: 'ts-07', name: 'Bootstrap', logo_url: `${DEVICON}/bootstrap/bootstrap-original.svg` },
  { id: 'ts-08', name: 'Node.js', logo_url: `${DEVICON}/nodejs/nodejs-original.svg` },
  { id: 'ts-09', name: 'Laravel', logo_url: `${DEVICON}/laravel/laravel-original.svg` },
  { id: 'ts-10', name: 'PHP', logo_url: `${DEVICON}/php/php-original.svg` },
  { id: 'ts-11', name: 'MySQL', logo_url: `${DEVICON}/mysql/mysql-original.svg` },
  { id: 'ts-12', name: 'Supabase', logo_url: `${DEVICON}/supabase/supabase-original.svg` },
  { id: 'ts-13', name: 'Firebase', logo_url: `${DEVICON}/firebase/firebase-plain.svg` },
  { id: 'ts-14', name: 'Vite', logo_url: `${DEVICON}/vitejs/vitejs-original.svg` },
  { id: 'ts-15', name: 'Git', logo_url: `${DEVICON}/git/git-original.svg` },
  { id: 'ts-16', name: 'Figma', logo_url: `${DEVICON}/figma/figma-original.svg` },
  { id: 'ts-17', name: 'VS Code', logo_url: `${DEVICON}/vscode/vscode-original.svg` },
  { id: 'ts-18', name: 'Sass', logo_url: `${DEVICON}/sass/sass-original.svg` },
];
