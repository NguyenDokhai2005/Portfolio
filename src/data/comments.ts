import type { Comment } from '@/types';

/**
 * Seed rows for the comment panel. The original persists these in Supabase with
 * a realtime channel; here they live in client state (see `useComments`).
 */
export const seedComments: Comment[] = [
  {
    id: 'c-01',
    name: 'Khai',
    comment: 'Welcome! Leave a message, a question, or any feedback here.',
    likes: 0,
    is_pinned: true,
    created_at: '2026-01-02T09:00:00.000Z',
  },
];
