import type { Project } from '@/types';

/**
 * Mirrors the original `projects` table. `technologies` and `key_features`
 * stay comma-separated strings so the detail page parsing is identical.
 */
export const projects: Project[] = [
  {
    id: '1',
    title: 'Personal Portfolio Website',
    description:
      'Website portfolio pribadi dengan 3D lanyard interaktif, animasi scroll-reveal, dan dashboard konten dinamis. Dibangun dengan fokus pada performa, aksesibilitas, dan pengalaman visual yang halus di semua ukuran layar.',
    technologies: 'Next.js, TypeScript, Tailwind CSS, Framer Motion, Three.js',
    key_features:
      'Intro screen dengan transisi halus, 3D lanyard card berbasis physics, Scroll spy navigation, Tab portfolio (projects / certificates / tech stack), Sistem komentar dengan upload gambar, Fully responsive layout',
    image_url: '/assets/projects/project-portfolio.svg',
    image_urls: ['/assets/projects/project-portfolio.svg', '/assets/projects/project-portfolio-2.svg'],
    live_url: 'https://example.com',
    github_url: 'https://github.com/RifqiMuhammadAliya12',
    created_at: '2026-01-05T00:00:00.000Z',
  },
  {
    id: '2',
    title: 'Kanto — Coffee Shop Landing',
    description:
      'Landing page untuk coffee shop lokal dengan katalog menu, galeri suasana, dan formulir reservasi. Desain hangat dengan tipografi editorial dan micro-interaction pada setiap kartu produk.',
    technologies: 'React.js, Vite, Tailwind CSS, Framer Motion',
    key_features:
      'Hero dengan parallax, Katalog menu filterable, Galeri masonry, Form reservasi tervalidasi, Integrasi WhatsApp, Optimasi Lighthouse 95+',
    image_url: '/assets/projects/project-coffee.svg',
    image_urls: ['/assets/projects/project-coffee.svg'],
    live_url: 'https://example.com',
    github_url: 'https://github.com/RifqiMuhammadAliya12',
    created_at: '2025-11-18T00:00:00.000Z',
  },
  {
    id: '3',
    title: 'SIAKAD — School Dashboard',
    description:
      'Sistem informasi akademik untuk sekolah menengah: manajemen siswa, jadwal, nilai, dan rekap absensi. Dilengkapi role-based access untuk admin, guru, dan siswa.',
    technologies: 'Laravel, PHP, MySQL, Bootstrap, Chart.js',
    key_features:
      'Role-based authentication, CRUD siswa dan guru, Input nilai per mata pelajaran, Rekap absensi bulanan, Export laporan PDF, Dashboard statistik',
    image_url: '/assets/projects/project-dashboard.svg',
    image_urls: ['/assets/projects/project-dashboard.svg'],
    live_url: '',
    github_url: 'https://github.com/RifqiMuhammadAliya12',
    created_at: '2025-09-02T00:00:00.000Z',
  },
  {
    id: '4',
    title: 'Nusantara — Travel Booking UI',
    description:
      'Antarmuka pemesanan perjalanan dengan pencarian destinasi, pemilihan tanggal, dan ringkasan harga real-time. Fokus pada alur checkout yang ringkas dan minim friksi.',
    technologies: 'Next.js, TypeScript, Tailwind CSS, React Query',
    key_features:
      'Pencarian destinasi instan, Date range picker, Ringkasan harga real-time, Checkout multi-step, Skeleton loading state, Dark mode',
    image_url: '/assets/projects/project-travel.svg',
    image_urls: ['/assets/projects/project-travel.svg'],
    live_url: 'https://example.com',
    github_url: '',
    created_at: '2025-07-21T00:00:00.000Z',
  },
  {
    id: '5',
    title: 'Lumen — Notes & Task App',
    description:
      'Aplikasi catatan dan task management dengan sinkronisasi realtime, pencarian cepat, dan pengelompokan berbasis tag. Dirancang untuk penggunaan keyboard-first.',
    technologies: 'React.js, Supabase, Tailwind CSS, Zustand',
    key_features:
      'Sinkronisasi realtime, Pencarian fuzzy, Tag dan filter, Command palette, Offline draft, Keyboard shortcuts',
    image_url: '/assets/projects/project-notes.svg',
    image_urls: ['/assets/projects/project-notes.svg'],
    live_url: 'https://example.com',
    github_url: 'https://github.com/RifqiMuhammadAliya12',
    created_at: '2025-05-14T00:00:00.000Z',
  },
  {
    id: '6',
    title: 'Aksara — Blog Platform',
    description:
      'Platform blog dengan editor markdown, dukungan gambar cover, dan halaman arsip berbasis tag. Rendering statis untuk kecepatan muat maksimal.',
    technologies: 'Next.js, MDX, Tailwind CSS, Vercel',
    key_features:
      'Editor markdown dengan preview, Static generation per artikel, Arsip berbasis tag, Estimasi waktu baca, RSS feed, SEO metadata otomatis',
    image_url: '/assets/projects/project-blog.svg',
    image_urls: ['/assets/projects/project-blog.svg'],
    live_url: '',
    github_url: 'https://github.com/RifqiMuhammadAliya12',
    created_at: '2025-03-08T00:00:00.000Z',
  },
];

export function getProjectById(id: string): Project | undefined {
  return projects.find((project) => project.id === id);
}
