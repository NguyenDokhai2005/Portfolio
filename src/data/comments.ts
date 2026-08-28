import type { Comment } from '@/types';

/**
 * Seed rows for the comment panel. The original persists these in Supabase
 * with a realtime channel; here they live in client state (see `useComments`).
 */
export const seedComments: Comment[] = [
  {
    id: 'c-01',
    name: 'Rifqi',
    comment: 'Selamat datang! Tinggalkan pesan atau masukan apa pun di sini.',
    likes: 12,
    is_pinned: true,
    created_at: '2026-01-02T09:00:00.000Z',
  },
  {
    id: 'c-02',
    name: 'Dimas',
    comment: 'Animasi lanyard-nya halus banget, bagus!',
    likes: 5,
    created_at: '2026-01-08T14:20:00.000Z',
  },
  {
    id: 'c-03',
    name: 'Nabila',
    comment: 'Layout-nya clean, enak dibaca di HP juga.',
    likes: 3,
    created_at: '2026-01-15T08:45:00.000Z',
  },
];
