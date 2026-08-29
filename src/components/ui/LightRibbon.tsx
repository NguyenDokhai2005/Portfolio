'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * A bright horizontal filament with a bundle of luminous ribbons braiding around
 * it, swelling and collapsing back onto the axis.
 *
 * Canvas 2D rather than WebGL: the effect is flat by nature, a second WebGL
 * context is avoided, and — the practical reason — the canvas is marked
 * `pointer-events: none`, so unlike the R3F scene it replaced it cannot capture
 * the swipe used to scroll the page.
 *
 * The glow is not a blur filter. Each ribbon is drawn three times — a wide faint
 * halo stroke, the translucent body, then a thin bright filament — and additive
 * compositing lets the overlaps build the bloom, which is how the reference gets
 * its near-white crossings.
 */

type Palette = 'mono' | 'spectrum';

interface Strand {
  /** Wave cycles across the band. */
  freq: number;
  /** Static phase offset, so the strands do not start stacked. */
  phase: number;
  /** Radians per second of travel along the axis. */
  speed: number;
  /** Amplitude multiplier against the band's half height. */
  amp: number;
  /**
   * Phase gap between the ribbon's two edges. The band pinches to nothing where
   * the edges cross and swells where they diverge, which is what reads as a
   * twisting tape rather than a plain stroke.
   */
  edge: number;
  /** Hue used by the `spectrum` palette. */
  hue: number;
  /** Warm strands carry the faint dispersion fringe seen on the thinnest edges. */
  warm?: boolean;
}

const STRANDS: Strand[] = [
  { freq: 1.05, phase: 0.0, speed: 0.44, amp: 1.0, edge: 0.72, hue: 214 },
  { freq: 1.35, phase: 1.7, speed: -0.36, amp: 0.86, edge: 0.58, hue: 232 },
  { freq: 0.85, phase: 3.1, speed: 0.29, amp: 0.94, edge: 0.85, hue: 262 },
  { freq: 1.6, phase: 4.4, speed: -0.47, amp: 0.7, edge: 0.5, hue: 284 },
  { freq: 1.2, phase: 5.6, speed: 0.33, amp: 0.78, edge: 0.66, hue: 28, warm: true },
  { freq: 0.95, phase: 2.4, speed: -0.25, amp: 0.62, edge: 0.94, hue: 196 },
];

/** Samples per curve — smooth at any realistic band width. */
const SAMPLES = 150;
/** Strands live inside this horizontal slice; the filament spans the full width. */
const INSET = 0.12;
/** Peak half-amplitude as a fraction of the band height. */
const AMPLITUDE = 0.21;
const TAU = Math.PI * 2;

/** Fades the ribbons into the filament at both ends. */
const envelope = (u: number) => Math.sin(Math.PI * u) ** 1.35;

/**
 * `mono` keeps the site's palette, with a barely-warm cast on the fringe strands
 * so the bundle is not flat grey. `spectrum` reproduces the reference's blues and
 * violets.
 */
function strandRgb(strand: Strand, palette: Palette): [number, number, number] {
  if (palette === 'spectrum') {
    const light = strand.warm ? 66 : 72;
    return hslToRgb(strand.hue, 92, light);
  }
  return strand.warm ? [255, 238, 218] : [222, 232, 246];
}

function filamentRgb(palette: Palette): [number, number, number] {
  return palette === 'spectrum' ? hslToRgb(220, 100, 62) : [236, 244, 255];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const sat = s / 100;
  const lum = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sat * Math.min(lum, 1 - lum);
  const f = (n: number) => lum - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

const rgba = ([r, g, b]: [number, number, number], alpha: number) =>
  `rgba(${r}, ${g}, ${b}, ${alpha})`;

/**
 * A stroke that fades to nothing at both ends of the strand span.
 *
 * The vertical envelope already collapses each ribbon onto the axis at its ends,
 * but a constant-width stroke keeps its full opacity all the way there, so the
 * strands used to terminate in a visible glowing cap. Fading the paint itself
 * lets them dissolve into the filament instead.
 */
function taperedStroke(
  ctx: CanvasRenderingContext2D,
  left: number,
  span: number,
  colour: [number, number, number],
  alpha: number,
  fade: number,
) {
  const gradient = ctx.createLinearGradient(left, 0, left + span, 0);
  gradient.addColorStop(0, rgba(colour, 0));
  gradient.addColorStop(fade, rgba(colour, alpha));
  gradient.addColorStop(1 - fade, rgba(colour, alpha));
  gradient.addColorStop(1, rgba(colour, 0));
  return gradient;
}

interface DrawContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  time: number;
  palette: Palette;
  scale: number;
}

function draw({ ctx, width, height, time, palette, scale }: DrawContext) {
  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'lighter';
  // `butt`, not `round`: a round cap on the wide halo stroke pushes half its
  // line width past the end of the curve, and with every strand's envelope at
  // zero there the six caps stack into one bright lozenge on the axis.
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'round';

  const centreY = height / 2;
  const left = width * INSET;
  const span = width * (1 - INSET * 2);
  const peak = height * AMPLITUDE;

  // The bundle breathes: wide open, then almost flat against the axis.
  const breath = 0.34 + 0.66 * (0.5 + 0.5 * Math.sin(time * 0.5));

  drawFilament(ctx, width, centreY, palette, scale);

  STRANDS.forEach((strand, index) => {
    // A second, slower term per strand so they never swell in lockstep.
    const localBreath = breath * (0.76 + 0.24 * Math.sin(time * 0.31 + index * 1.3));
    const amplitude = peak * strand.amp * localBreath;
    const colour = strandRgb(strand, palette);

    const top: number[] = [];
    const bottom: number[] = [];
    const mid: number[] = [];

    for (let i = 0; i <= SAMPLES; i += 1) {
      const u = i / SAMPLES;
      const reach = amplitude * envelope(u);
      const angle = TAU * strand.freq * u + strand.phase + time * strand.speed;
      top.push(centreY + reach * Math.sin(angle));
      bottom.push(centreY + reach * Math.sin(angle + strand.edge));
      mid.push(centreY + reach * Math.sin(angle + strand.edge / 2));
    }

    const xAt = (i: number) => left + (i / SAMPLES) * span;

    // 1 — halo. Wide and faint; the overlaps are what become the bloom. Faded
    // hard at the ends, where all six strands would otherwise pile up on the axis.
    ctx.beginPath();
    ctx.moveTo(xAt(0), mid[0]);
    for (let i = 1; i <= SAMPLES; i += 1) ctx.lineTo(xAt(i), mid[i]);
    ctx.strokeStyle = taperedStroke(ctx, left, span, colour, 0.05, 0.3);
    ctx.lineWidth = 20 * scale;
    ctx.stroke();

    // 2 — body. The tape between the two out-of-phase edges.
    ctx.beginPath();
    ctx.moveTo(xAt(0), top[0]);
    for (let i = 1; i <= SAMPLES; i += 1) ctx.lineTo(xAt(i), top[i]);
    for (let i = SAMPLES; i >= 0; i -= 1) ctx.lineTo(xAt(i), bottom[i]);
    ctx.closePath();
    ctx.fillStyle = rgba(colour, 0.17);
    ctx.fill();

    // 3 — filament highlight along the tape's leading edge.
    ctx.beginPath();
    ctx.moveTo(xAt(0), top[0]);
    for (let i = 1; i <= SAMPLES; i += 1) ctx.lineTo(xAt(i), top[i]);
    ctx.strokeStyle = taperedStroke(ctx, left, span, colour, 0.5, 0.14);
    ctx.lineWidth = 1.3 * scale;
    ctx.stroke();
  });
}

/** The bright axis, spanning edge to edge behind the bundle. */
function drawFilament(
  ctx: CanvasRenderingContext2D,
  width: number,
  centreY: number,
  palette: Palette,
  scale: number,
) {
  const colour = filamentRgb(palette);
  const passes: [number, number][] = [
    [16 * scale, 0.05],
    [5 * scale, 0.14],
    [1.6 * scale, 0.55],
    [0.9 * scale, 0.9],
  ];

  for (const [lineWidth, alpha] of passes) {
    ctx.beginPath();
    ctx.moveTo(0, centreY);
    ctx.lineTo(width, centreY);
    ctx.strokeStyle = rgba(colour, alpha);
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

interface LightRibbonProps {
  palette?: Palette;
  className?: string;
}

export default function LightRibbon({ palette = 'mono', className }: LightRibbonProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setStill(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  // Only animate while the band is on screen.
  useEffect(() => {
    const node = wrapper.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setActive(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      rootMargin: '100px 0px',
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = canvas.current;
    const host = wrapper.current;
    if (!element || !host) return;

    const ctx = element.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let scale = 1;
    let frame = 0;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      scale = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.round(rect.width * scale));
      height = Math.max(1, Math.round(rect.height * scale));
      element.width = width;
      element.height = height;
      element.style.width = `${rect.width}px`;
      element.style.height = `${rect.height}px`;
    };

    resize();

    const paint = (time: number) => {
      draw({ ctx, width, height, time, palette, scale });
    };

    // Reduced motion still gets the artwork — just a single, settled frame.
    if (still) {
      paint(2.2);
      const observer = new ResizeObserver(() => {
        resize();
        paint(2.2);
      });
      observer.observe(host);
      return () => observer.disconnect();
    }

    let start: number | null = null;
    const loop = (now: number) => {
      if (start === null) start = now;
      paint((now - start) / 1000);
      frame = requestAnimationFrame(loop);
    };

    if (active) frame = requestAnimationFrame(loop);

    const observer = new ResizeObserver(() => {
      resize();
      if (!active) paint(0);
    });
    observer.observe(host);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [active, still, palette]);

  return (
    <div
      ref={wrapper}
      data-light-ribbon={active ? 'running' : 'idle'}
      className={
        // No frame and no tint: the band sits directly on the page background so
        // the filament reads as light in the page rather than art in a card.
        // `overflow-hidden` stays as insurance — at full viewport width, a
        // sub-pixel rounding on the canvas would otherwise widen the document.
        className ?? 'relative h-[180px] w-full overflow-hidden sm:h-[220px] lg:h-[280px]'
      }
    >
      {/* Purely decorative, and `pointer-events: none` guarantees it can never
          intercept a scroll gesture. */}
      <canvas ref={canvas} aria-hidden="true" className="block h-full w-full [pointer-events:none]" />
    </div>
  );
}
