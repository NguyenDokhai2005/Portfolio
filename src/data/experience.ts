import type { ExperienceItem } from '@/types';

/**
 * Every entry is drawn from a fact stated in `My Info/portfolio-projects.md` —
 * the two team-leader roles, the self-directed builds and the degree. No
 * employment history is listed because none is recorded there; add internship or
 * job entries here as they happen.
 *
 * `period` is deliberately absent from the role entries: the source file gives no
 * dates for them, and the `created_at` values in `projects.ts` were seeded for
 * ordering, not sourced from reality.
 */
export const experience: ExperienceItem[] = [
  {
    id: 'exp-01',
    role: 'Team Leader & Smart Contract Developer',
    organization: 'Cedra-Pocket',
    kind: 'leadership',
    summary:
      'Led a three-person team building a Telegram Mini App on the Cedra Network, and owned the Move smart contracts behind its on-chain rewards.',
    highlights: [
      'Ran the agile workflow and code review for a team of three',
      'Wrote the Move contracts driving on-chain reward distribution',
      'Designed a non-custodial wallet flow with Ed25519 signature verification',
    ],
  },
  {
    id: 'exp-02',
    role: 'Team Leader & Frontend Developer',
    organization: 'Expense Management',
    kind: 'leadership',
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
    organization: 'Self-directed projects',
    kind: 'development',
    summary:
      'Designed and shipped complete web products solo, from interface through to database.',
    highlights: [
      'AI-WorkFlow — visual automation builder on React 19 and ReactFlow, deployed live',
      'SoftStore — NestJS and PostgreSQL commerce platform with realtime chat over WebSocket',
      'DashBoard-Rental-Car — management dashboard in vanilla JavaScript, no framework',
    ],
  },
  {
    id: 'exp-04',
    role: 'Information Technology',
    organization: 'University of Transport Ho Chi Minh City',
    period: '2023 — Present',
    kind: 'education',
    summary: 'Undergraduate programme in Information Technology, intake 2023.',
    highlights: ['Binance Academy course: Introduction to EDU Chain & Open Campus'],
  },
];
