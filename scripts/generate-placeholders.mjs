/**
 * Generates the local SVG artwork used by the seed project / certificate data.
 * Run with: node scripts/generate-placeholders.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = join(here, '..', 'public', 'assets');

const projects = [
  { file: 'project-portfolio.svg', label: 'Portfolio', sub: 'Next.js · Three.js', from: '#1f2937', to: '#0b1120', accent: '#60a5fa' },
  { file: 'project-portfolio-2.svg', label: 'Portfolio', sub: 'Lanyard · Physics', from: '#111827', to: '#0a0a0a', accent: '#a78bfa' },
  { file: 'project-coffee.svg', label: 'Kanto', sub: 'Coffee Shop Landing', from: '#3b2418', to: '#140c07', accent: '#f59e0b' },
  { file: 'project-dashboard.svg', label: 'SIAKAD', sub: 'School Dashboard', from: '#0f2a2a', to: '#04100f', accent: '#2dd4bf' },
  { file: 'project-travel.svg', label: 'Nusantara', sub: 'Travel Booking UI', from: '#12233d', to: '#050b14', accent: '#38bdf8' },
  { file: 'project-notes.svg', label: 'Lumen', sub: 'Notes & Tasks', from: '#2a1f3d', to: '#0d0714', accent: '#c084fc' },
  { file: 'project-blog.svg', label: 'Aksara', sub: 'Blog Platform', from: '#2b1520', to: '#12060b', accent: '#fb7185' },
];

const certificates = [
  { file: 'certificate-web.svg', title: 'Dasar Pemrograman Web', accent: '#f59e0b' },
  { file: 'certificate-frontend.svg', title: 'Front-End Web Pemula', accent: '#38bdf8' },
  { file: 'certificate-react.svg', title: 'React.js Fundamentals', accent: '#22d3ee' },
  { file: 'certificate-responsive.svg', title: 'Responsive Web Design', accent: '#a78bfa' },
  { file: 'certificate-rpl.svg', title: 'Uji Kompetensi RPL', accent: '#34d399' },
];

const escape = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function projectSvg({ label, sub, from, to, accent }, index) {
  const id = `g${index}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500" role="img" aria-label="${escape(label)} preview">
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
    <radialGradient id="${id}glow" cx="0.2" cy="0.15" r="0.8">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="${id}grid" width="26" height="26" patternUnits="userSpaceOnUse">
      <path d="M26 0H0V26" fill="none" stroke="#ffffff" stroke-opacity="0.06" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="800" height="500" fill="url(#${id})"/>
  <rect width="800" height="500" fill="url(#${id}grid)"/>
  <rect width="800" height="500" fill="url(#${id}glow)"/>
  <g opacity="0.5">
    <circle cx="660" cy="120" r="120" fill="${accent}" opacity="0.12"/>
    <circle cx="120" cy="420" r="150" fill="#ffffff" opacity="0.05"/>
  </g>
  <g transform="translate(64 300)">
    <rect x="0" y="-64" width="46" height="4" rx="2" fill="${accent}"/>
    <text x="0" y="0" font-family="Syne, Segoe UI, sans-serif" font-size="62" font-weight="800" fill="#f5f5f5" letter-spacing="-2">${escape(label)}</text>
    <text x="0" y="42" font-family="DM Mono, Consolas, monospace" font-size="20" fill="#ffffff" opacity="0.55">${escape(sub)}</text>
  </g>
</svg>
`;
}

function certificateSvg({ title, accent }, index) {
  const id = `c${index}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="560" viewBox="0 0 800 560" role="img" aria-label="${escape(title)} certificate">
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#141414"/>
      <stop offset="100%" stop-color="#080808"/>
    </linearGradient>
  </defs>
  <rect width="800" height="560" fill="url(#${id})"/>
  <rect x="26" y="26" width="748" height="508" rx="18" fill="none" stroke="${accent}" stroke-opacity="0.35" stroke-width="2"/>
  <rect x="40" y="40" width="720" height="480" rx="12" fill="none" stroke="#ffffff" stroke-opacity="0.08"/>
  <circle cx="400" cy="150" r="46" fill="none" stroke="${accent}" stroke-opacity="0.6" stroke-width="3"/>
  <path d="M382 150l14 14 24-28" fill="none" stroke="${accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="400" y="268" text-anchor="middle" font-family="DM Mono, Consolas, monospace" font-size="16" fill="#ffffff" opacity="0.45" letter-spacing="6">CERTIFICATE</text>
  <text x="400" y="330" text-anchor="middle" font-family="Syne, Segoe UI, sans-serif" font-size="36" font-weight="700" fill="#f0f0f0">${escape(title)}</text>
  <text x="400" y="378" text-anchor="middle" font-family="Syne, Segoe UI, sans-serif" font-size="20" fill="#ffffff" opacity="0.55">Rifqi Muhammad Aliya</text>
  <rect x="300" y="428" width="200" height="2" rx="1" fill="#ffffff" opacity="0.2"/>
  <text x="400" y="462" text-anchor="middle" font-family="DM Mono, Consolas, monospace" font-size="13" fill="#ffffff" opacity="0.35">Verified completion</text>
</svg>
`;
}

mkdirSync(join(publicDir, 'projects'), { recursive: true });
mkdirSync(join(publicDir, 'certificates'), { recursive: true });

projects.forEach((project, index) => {
  writeFileSync(join(publicDir, 'projects', project.file), projectSvg(project, index), 'utf8');
});

certificates.forEach((certificate, index) => {
  writeFileSync(
    join(publicDir, 'certificates', certificate.file),
    certificateSvg(certificate, index),
    'utf8',
  );
});

console.log(
  `Generated ${projects.length} project + ${certificates.length} certificate placeholders.`,
);
