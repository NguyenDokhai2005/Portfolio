import type { Certificate } from '@/types';

/** Mirrors the original `certificates` table. */
export const certificates: Certificate[] = [
  {
    id: 'cert-01',
    title: 'Belajar Dasar Pemrograman Web',
    image_url: '/assets/certificates/certificate-web.svg',
    created_at: '2025-02-10T00:00:00.000Z',
  },
  {
    id: 'cert-02',
    title: 'Belajar Membuat Front-End Web untuk Pemula',
    image_url: '/assets/certificates/certificate-frontend.svg',
    created_at: '2025-04-02T00:00:00.000Z',
  },
  {
    id: 'cert-03',
    title: 'React.js Fundamentals',
    image_url: '/assets/certificates/certificate-react.svg',
    created_at: '2025-06-19T00:00:00.000Z',
  },
  {
    id: 'cert-04',
    title: 'Responsive Web Design',
    image_url: '/assets/certificates/certificate-responsive.svg',
    created_at: '2025-08-27T00:00:00.000Z',
  },
  {
    id: 'cert-05',
    title: 'Uji Kompetensi Keahlian RPL',
    image_url: '/assets/certificates/certificate-rpl.svg',
    created_at: '2025-12-01T00:00:00.000Z',
  },
];
