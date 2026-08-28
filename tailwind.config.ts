import type { Config } from 'tailwindcss';

/**
 * Tailwind v3 is intentional: the original build ships v3 utility syntax
 * (e.g. `bg-[size:26px_26px]`, `bg-white/[0.04]`).
 */
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    /**
     * Declared in full (not via `extend`) so the ascending order is guaranteed
     * — Tailwind emits media queries in key order, and a mis-ordered `xs`
     * would lose to the unprefixed base utilities.
     *
     * xs  400px  small phone → phone
     * sm  640px  large phone
     * md  768px  tablet
     * lg  1024px laptop
     * xl  1280px desktop
     * 2xl 1536px large desktop
     * 3xl 1728px ultra-wide
     */
    screens: {
      xs: '400px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      '3xl': '1728px',
    },
    extend: {
      fontFamily: {
        sans: ['Syne', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          card: 'var(--bg-card)',
        },
        line: 'var(--border)',
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        accent: 'var(--accent)',
      },
    },
  },
  plugins: [],
};

export default config;
