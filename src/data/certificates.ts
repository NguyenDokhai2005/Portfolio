import type { Certificate } from '@/types';

/**
 * Only certifications that actually exist are listed. Images are renders of the
 * issued certificate PDFs.
 */
export const certificates: Certificate[] = [
  {
    id: 'cert-01',
    title: 'Binance Academy — Introduction to EDU Chain & Open Campus',
    image_url: '/assets/certificates/certificate-binance-edu-chain.webp',
    created_at: '2025-06-01T00:00:00.000Z',
  },
];
