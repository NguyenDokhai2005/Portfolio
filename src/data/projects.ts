import type { Project } from '@/types';

/**
 * Real project data. `technologies` and `key_features` stay comma-separated
 * strings so the detail page's parsing is unchanged.
 *
 * Order follows strongest-first: live demo and technical depth, then leadership,
 * then breadth (mobile), then fullstack proof, then UI craft.
 */
export const projects: Project[] = [
  {
    id: '1',
    title: 'AI-WorkFlow — Workflow Automation Platform',
    description:
      'A visual automation platform where AI nodes (Research, Code, Marketing, Imagine, Video) are dragged onto an infinite canvas and wired into an executable pipeline. Styled after Figma Weave with a glassmorphism interface. Built as a fullstack developer: React 19 and ReactFlow on the front, Supabase and Gmail OAuth behind it.',
    technologies:
      'React 19, ReactFlow, Tailwind CSS, Framer Motion, Supabase, Gmail OAuth, Vercel',
    key_features:
      'Infinite canvas on a 24px dot grid, 5 Pillars architecture: Research → Code → Marketing → Imagine → Video, Glassmorphism nodes with animated neon edges, Execution engine using DFS traversal, Modular node registry for adding new node types, Custom rendering pipeline and lazy loading to keep the canvas smooth under many nodes',
    image_url: '/assets/projects/project-ai-workflow.svg',
    image_urls: ['/assets/projects/project-ai-workflow.svg'],
    live_url: 'https://ai-work-flow-khaki.vercel.app/#/',
    github_url: 'https://github.com/NguyenDokhai2005/Font-end-Auto-Office',
    created_at: '2026-01-05T00:00:00.000Z',
  },
  {
    id: '2',
    title: 'Cedra-Pocket — Blockchain Telegram Mini App',
    description:
      'A Telegram Mini App on the Cedra Network with a virtual pet, energy management, a quest system and a non-custodial wallet. Users play inside Telegram and receive on-chain rewards for completing quests. Team of three; I led the project and wrote the Move smart contracts.',
    technologies:
      'Next.js 16, React 19, Zustand, Tailwind CSS, NestJS 10, PostgreSQL, Prisma, Move, Cedra Network',
    key_features:
      'Team Leader of 3 and smart contract developer, Non-custodial wallet — the user keeps their private key, Ed25519 signature verification, 6-tier ranking system from Bronze to Leviathan, On-chain reward distribution, Pet system with mining rewards, Custom wallet flow bridging Telegram Mini App and chain',
    image_url: '/assets/projects/project-cedra-pocket.svg',
    image_urls: ['/assets/projects/project-cedra-pocket.svg'],
    live_url: '',
    github_url: 'https://github.com/Cedra-Pocket/Cedra-Pocket',
    created_at: '2025-11-18T00:00:00.000Z',
  },
  {
    id: '3',
    title: 'Expense Management — Personal Finance Android App',
    description:
      'An Android app for tracking income and spending, managing monthly budgets and analysing personal finances. Its standout feature scans a receipt with the camera and extracts the amount and merchant name via ML Kit OCR — entirely offline. Team of five; I led the project and built the analytics dashboard.',
    technologies:
      'Kotlin, Jetpack Compose, Material 3, Room, CameraX, ML Kit OCR, MPAndroidChart, Clean Architecture',
    key_features:
      'Team Leader of 5, owning the dashboard and roughly 20% of the codebase, Receipt scanning that auto-fills the entry form, fully offline OCR, Spending breakdown charts by category, Monthly budgets with over-budget warnings, Clean Architecture across Presentation → Domain ← Data, Dark and light themes, Image pre-processing plus custom regex extraction to handle varied receipt formats',
    image_url: '/assets/projects/project-expense.svg',
    image_urls: ['/assets/projects/project-expense.svg'],
    live_url: '',
    github_url: 'https://github.com/ExpenseManagement2026/MobileApp',
    created_at: '2025-09-02T00:00:00.000Z',
  },
  {
    id: '4',
    title: 'SoftStore — E-commerce Platform',
    description:
      'A complete e-commerce platform with authentication, product and order management, and realtime chat over WebSocket. A React front end talks to a NestJS and PostgreSQL back end, with MoMo and bank transfer payments. Built end to end as a fullstack developer.',
    technologies:
      'React 18, Vite, Tailwind CSS, React Router, Socket.io, NestJS, TypeORM, PostgreSQL, JWT',
    key_features:
      'JWT auth with user and admin roles, Product and order CRUD with status tracking from pending → paid → processing → completed, Realtime chat over WebSocket with unread counts, Order statistics and admin reporting, MoMo and bank transfer payment integration, PostgreSQL with UUID primary keys, Seed script for a fast demo',
    image_url: '/assets/projects/project-softstore.svg',
    image_urls: ['/assets/projects/project-softstore.svg'],
    live_url: '',
    github_url: 'https://github.com/NguyenDokhai2005/SoftStore',
    created_at: '2025-07-21T00:00:00.000Z',
  },
  {
    id: '5',
    title: 'DashBoard-Rental-Car — Rental Management Dashboard',
    description:
      'A car rental management dashboard written entirely in vanilla JavaScript — no framework, no backend. Covers the vehicle catalogue, customer records, rental history, filtering and search, and a membership tier system driven by total spend.',
    technologies: 'Vanilla JavaScript (ES6+), HTML5, CSS3, Responsive Grid',
    key_features:
      'Customer management with rental history, profile and total spend, Four-column car grid with hover states and filters for type, transmission and capacity, Membership tiers from Bronze to Silver to Gold based on total spend, Responsive grid collapsing from four columns to one on mobile, Pure CSS animations with no libraries',
    image_url: '/assets/projects/project-rental-car.svg',
    image_urls: ['/assets/projects/project-rental-car.svg'],
    live_url: '',
    github_url: 'https://github.com/NguyenDokhai2005/DashBoard-Rental-Car',
    created_at: '2025-05-14T00:00:00.000Z',
  },
];

export function getProjectById(id: string): Project | undefined {
  return projects.find((project) => project.id === id);
}
