import type { Certificate } from '@/types';

/**
 * Only certifications that actually exist are listed. Replace `image_url` with a
 * scan of the real certificate when available — the SVG is a generated stand-in.
 */
export const certificates: Certificate[] = [
  {
    id: 'cert-01',
    title: 'Binance',
    image_url: '/assets/certificates/certificate-binance.svg',
    created_at: '2025-06-01T00:00:00.000Z',
  },
];
