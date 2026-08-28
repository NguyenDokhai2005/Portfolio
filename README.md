# Rifqi Portfolio — Next.js Clone

A pixel-accurate reconstruction of [portofolio-rho-sand-92.vercel.app](https://portofolio-rho-sand-92.vercel.app/),
rebuilt as an organized Next.js App Router project.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS **v3** + CSS custom properties |
| Animation | Framer Motion + GSAP (typing cursor) |
| 3D | three.js · @react-three/fiber · drei · rapier · meshline |
| Icons | lucide-react (UI) · react-icons (brands) |

Tailwind v3 is deliberate: the original ships v3 utility syntax such as
`bg-[size:26px_26px]` and `bg-white/[0.04]`, which v4 renames.

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
│   │   ├── Background.tsx           # scroll-driven blurred orbs + 26px grid
│   │   ├── Navbar.tsx               # scroll spy, delayed reveal, mobile sheet
│   │   └── WelcomeScreen.tsx        # full-screen intro
│   ├── sections/
│   │   ├── Hero.tsx                 # headline reveal + 3D lanyard slot
│   │   ├── About.tsx                # bio, CV button, stat cards
│   │   ├── Portfolio.tsx            # tabbed showcase + certificate lightbox
│   │   └── Contact.tsx              # form + comments grid + footer
│   ├── portfolio/                   # CardProject / CardCertificate / CardTechStack
│   ├── contact/                     # ContactForm / Comments
│   └── ui/
│       ├── Lanyard.tsx              # physics-driven badge on a mesh-line strap
│       └── TextType.tsx             # typewriter with GSAP blinking cursor
├── data/                            # profile, projects, certificates, techStack, comments, socials
├── hooks/                           # useIsMobile, usePortfolioData, useComments
├── lib/                             # motion tokens (EASE, variants), scroll helpers
└── types/                           # shared interfaces
```

## Design tokens

Lifted verbatim from the original `:root`:

| Token | Value |
| --- | --- |
| `--bg-primary` | `#0d0d0d` |
| `--bg-secondary` | `#141414` |
| `--bg-card` | `#1a1a1a` |
| `--border` | `#2a2a2a` |
| `--text-primary` | `#f0f0f0` |
| `--text-secondary` | `#888888` |
| `--text-muted` | `#555555` |
| `--accent` | `#d4d4d4` |

Typefaces: **Syne** (400–800) for display/body, **DM Mono** (300–500) for
labels, nav, and metadata.

## Behaviour notes

- **Intro sequencing.** `introPlayed`, `heroPlayed`, and `navbarPlayed` live in
  `sessionStorage`. The intro plays once per session; a hard reload on `/`
  clears the flags and replays it. Arriving at `/#portfolio` (the detail page's
  Back button) skips it entirely.
- **Reveal delays.** Hero content unblurs at 3.6s, the navbar drops in at 3.8s —
  both measured from the original.
- **Navigation.** Anchor clicks run a hand-rolled 1.2s ease-in-out-cubic rAF
  tween (`src/lib/scroll.ts`); native smooth scroll is too fast for the feel.
  Scroll spy marks a section active when it crosses the 140px line.
- **3D lanyard.** A fixed anchor plus three rope-jointed spheres drive a
  spherical joint on the card; the strap is a `meshline` textured with
  `bandd.png`. Physics and pointer interaction are skipped below 768px, matching
  the original.
- **Mobile.** `useIsMobile` returns `null` on first render so `About` renders
  nothing during SSR — this is how the original avoids a desktop→mobile flash.

## Data layer

The original reads `projects`, `certificates`, `tech_stack`, and `comments` from
Supabase. Those tables are not publicly readable, so this clone ships typed
local seed data with the **same shape** (including the comma-separated
`technologies` / `key_features` columns the detail page parses).

To wire a real backend, replace the bodies of:

- `src/hooks/usePortfolioData.ts` → `projects` / `certificates` / `techStacks`
- `src/hooks/useComments.ts` → `addComment` / `likeComment`
- `src/data/projects.ts` → `getProjectById` (used by the detail route)

Nothing else needs to change.

### Assets

| Path | Source |
| --- | --- |
| `public/assets/kartu.glb` | original site (lanyard card model) |
| `public/assets/bandd.png` | original site (strap texture) |
| `public/assets/PP.png` | original site (About portrait) |
| `public/favicon.ico` | original site |
| `public/assets/projects/*.svg` | generated locally |
| `public/assets/certificates/*.svg` | generated locally |

Regenerate the placeholders with:

```bash
node scripts/generate-placeholders.mjs
```

Tech-stack logos are loaded from the [devicon](https://devicon.dev/) CDN. Point
`logo_url` at files under `public/assets/tech/` if you want zero external
requests.

## Known deviations

- Contact form and comments have no backend — the form shows a local
  confirmation, comments live in React state, and uploaded images use
  `URL.createObjectURL` (they do not persist across reloads).
- Project/certificate imagery is generated placeholder art.
- Buttons carry explicit `type`, form fields have `aria-label`s, and the contact
  fields are wrapped in a real `<form>` — small accessibility additions the
  original omits.
