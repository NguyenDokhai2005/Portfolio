# Nguyen Do Khai — Portfolio

A modern, interactive portfolio website showcasing my projects, skills, and professional experience. Built with cutting-edge web technologies and featuring smooth animations, 3D graphics, and a unique visual design.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS **v3** + CSS custom properties |
| Animation | Framer Motion + GSAP (typing cursor) |
| 3D | three.js · @react-three/fiber · drei · rapier · meshline |
| Icons | lucide-react (UI) · react-icons (brands) |

Tailwind v3 powers the entire styling layer with custom design tokens and utility-first approach.

## Features

- **Interactive 3D Elements**: Physics-driven lanyard badge and animated light ribbon using Canvas 2D
- **Smooth Animations**: Framer Motion powers page transitions, scroll reveals, and micro-interactions
- **Responsive Design**: Optimized for all devices from mobile to desktop
- **Project Showcase**: Tabbed portfolio section with project details and certificates
- **Contact Integration**: Direct messaging form with social media links
- **Performance Optimized**: Built with Next.js 16 and Turbopack for blazing-fast development

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm start
```

## Project structure

```
src/
├── app/
│   ├── layout.tsx                  # html shell + Google Fonts (Syne, DM Mono)
│   ├── globals.css                 # design tokens, hidden scrollbar, resets
│   ├── page.tsx                     # intro overlay orchestration + section order
│   └── portfolio/[id]/page.tsx      # project detail route
├── components/
│   ├── layout/
│   │   ├── Background.tsx           # Animated background orbs with grid overlay
│   │   ├── Navbar.tsx               # Responsive navigation with scroll spy
│   │   └── WelcomeScreen.tsx        # Animated intro screen
│   ├── sections/
│   │   ├── Hero.tsx                 # Landing section with 3D lanyard
│   │   ├── About.tsx                # Bio, stats, and LightRibbon canvas animation
│   │   ├── Portfolio.tsx            # Projects, certificates, and experience tabs
│   │   └── Contact.tsx              # Contact form with social links
│   ├── portfolio/                   # Project and certificate card components
│   ├── contact/                     # Contact form component
│   └── ui/
│       ├── Lanyard.tsx              # 3D physics-based badge with mesh-line strap
│       ├── LightRibbon.tsx          # Canvas 2D animated light filaments
│       └── TextType.tsx             # Typewriter effect with GSAP cursor
├── data/                            # Static content: profile, projects, certificates, tech stack
├── hooks/                           # Custom React hooks for data and responsive behavior
├── lib/                             # Utilities: motion configs, scroll helpers
└── types/                           # TypeScript type definitions
```

## Design system

Custom design tokens defining the visual language:

| Token | Value | Usage |
| --- | --- | --- |
| `--bg-primary` | `#0d0d0d` | Main background |
| `--bg-secondary` | `#141414` | Section backgrounds |
| `--bg-card` | `#1a1a1a` | Card surfaces |
| `--border` | `#2a2a2a` | Borders and dividers |
| `--text-primary` | `#f0f0f0` | Primary text |
| `--text-secondary` | `#888888` | Secondary text |
| `--text-muted` | `#555555` | Muted text |
| `--accent` | `#d4d4d4` | Accent elements |

**Typography**: **Syne** (400–800) for headings and body text, **DM Mono** (300–500) for technical labels and navigation.

## Key interactions

- **Welcome sequence**: Animated intro screen plays once per session, stored in `sessionStorage`
- **Smooth scrolling**: Custom 1.2s ease-in-out-cubic scroll animation for anchor navigation
- **Scroll spy navigation**: Active section highlighting when scrolled past 140px threshold
- **3D lanyard**: Physics-driven badge with rope joints and mesh-line strap (desktop only)
- **Tab animations**: Smooth transitions with sliding background indicator and spring physics
- **Responsive behavior**: Adaptive layouts and SSR-safe mobile detection

## Content management

Portfolio data is structured in TypeScript files under `src/data/`:

- **Projects**: Showcase of development work with technologies, descriptions, and links
- **Certificates**: Professional certifications and achievements
- **Tech Stack**: Skills and technologies organized by category
- **Social Links**: Contact information and social media profiles

To integrate a backend (e.g., Supabase, Firebase), update these hooks:

- `src/hooks/usePortfolioData.ts` → Fetch projects, certificates, tech stack
- `src/hooks/useComments.ts` → Handle comment submission and likes
- `src/data/projects.ts` → `getProjectById` for detail pages

## Assets

| Path | Description |
| --- | --- |
| `public/assets/kartu.glb` | 3D model for lanyard badge |
| `public/assets/bandd.png` | Texture for lanyard strap |
| `public/assets/PP.png` | Profile photo |
| `public/favicon.ico` | Site favicon |
| `public/assets/projects/*.svg` | Project thumbnails |
| `public/assets/certificates/*.svg` | Certificate previews |

Tech stack logos are loaded from [devicon](https://devicon.dev/) CDN. To use local assets, update `logo_url` paths in `src/data/techStack.ts`.

Generate placeholder images:

```bash
node scripts/generate-placeholders.mjs
```

## Development notes

- **Contact form**: Currently shows local confirmation. For production, connect to an email service or backend API
- **Image uploads**: Use `URL.createObjectURL` for local preview. Implement cloud storage (e.g., Cloudinary, AWS S3) for persistence
- **Accessibility**: Enhanced with explicit button types, ARIA labels, and semantic HTML
- **Performance**: Animations optimized with `willChange`, GPU acceleration, and `viewport: once` to prevent re-triggers

## License

Personal portfolio project by Nguyen Do Khai.
