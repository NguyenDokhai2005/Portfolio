import type { ExperienceItem } from '@/types';

/**
 * Every entry is drawn from a fact stated in `My Info/portfolio-projects.md` or
 * confirmed by the owner — the three team-leader roles, the solo builds and the
 * degree. No employment history is listed because none exists yet; add
 * internship or job entries here as they happen.
 *
 * `period` is deliberately absent from the role entries: no dates are recorded
 * for them, and the `created_at` values in `projects.ts` were seeded for
 * ordering, not sourced from reality.
 */
export const experience: ExperienceItem[] = [
  {
    id: 'exp-01',
    role: 'Team Leader & Smart Contract Developer',
    organization: 'Cedra-Pocket',
    kind: 'leadership',
    teamSize: 3,
    projectIds: ['2'],
    summary:
      'Led a three-person team building a Telegram Mini App on the Cedra Network, and owned the Move smart contracts behind its on-chain rewards.',
    highlights: [
      'Ran the agile workflow and code review for a team of three',
      'Wrote the Move contracts driving on-chain reward distribution',
      'Designed a non-custodial wallet flow with Ed25519 signature verification',
    ],
  },
  {
    id: 'exp-05',
    role: 'Team Leader & Backend Developer',
    organization: 'AI-WorkFlow',
    kind: 'leadership',
    teamSize: 2,
    projectIds: ['1'],
    summary:
      'Led a two-person team on a visual AI workflow builder and owned its backend.',
    highlights: [
      'Split the work between front end and back end across a team of two',
      'Built the backend on Supabase, including Gmail OAuth',
      'Shipped live on Vercel',
    ],
  },
  {
    id: 'exp-02',
    role: 'Team Leader & Frontend Developer',
    organization: 'Expense Management',
    kind: 'leadership',
    teamSize: 5,
    projectIds: ['3'],
    summary:
      'Led a five-person team on an offline-first Android expense tracker and built its analytics dashboard.',
    highlights: [
      'Split work and reviewed code across a team of five',
      'Built the dashboard: category spending charts and over-budget warnings',
      'Contributed roughly 20% of the codebase',
    ],
  },
  {
    id: 'exp-03',
    role: 'Fullstack Web Developer',
    organization: 'Solo projects',
    kind: 'development',
    projectIds: ['6', '4'],
    summary:
      'Built fullstack web products on my own, end to end — interface, API and database.',
    highlights: [
      'AutoRent VN — car rental marketplace on Next.js, NestJS and PostgreSQL, with CI/CD deploying to two servers',
      'SoftStore — NestJS and PostgreSQL commerce platform with realtime chat over WebSocket',
    ],
  },
  {
    id: 'exp-04',
    role: 'Information Technology',
    organization: 'University of Transport Ho Chi Minh City',
    period: '2023 — Present',
    kind: 'education',
    summary: 'Undergraduate programme in Information Technology, intake 2023.',
    highlights: [],
  },
];
