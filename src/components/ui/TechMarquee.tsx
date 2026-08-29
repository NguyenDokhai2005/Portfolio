'use client';

import type { TechStackItem } from '@/types';

interface TechMarqueeProps {
  items: TechStackItem[];
  /** `left` scrolls content leftwards; `right` reverses the same keyframes. */
  direction?: 'left' | 'right';
  /** Seconds for one full pass. Longer list, longer duration, to keep speed even. */
  durationSeconds?: number;
  gapPx?: number;
  label: string;
}

/**
 * One continuously scrolling row of technology logos.
 *
 * The list is rendered twice: the CSS slides the track by exactly half its width,
 * so the duplicate lands where the original began and the loop never shows a
 * seam. Only the first copy is exposed to assistive tech — the second exists
 * purely to fill the gap left behind.
 *
 * Animation lives in CSS rather than Framer Motion so it runs on the compositor
 * and is unaffected by React re-renders.
 */
export default function TechMarquee({
  items,
  direction = 'left',
  durationSeconds = 38,
  gapPx = 14,
  label,
}: TechMarqueeProps) {
  if (items.length === 0) return null;

  return (
    <div
      className="tech-marquee"
      role="group"
      aria-label={label}
      style={{ '--tech-marquee-gap': `${gapPx}px` } as React.CSSProperties}
    >
      <ul
        className="tech-marquee__track"
        style={{
          animationDuration: `${durationSeconds}s`,
          animationDirection: direction === 'right' ? 'reverse' : 'normal',
        }}
      >
        {[...items, ...items].map((item, index) => {
          const isDuplicate = index >= items.length;
          return (
            <li
              key={`${item.id}-${isDuplicate ? 'dup' : 'src'}`}
              className="tech-marquee__item"
              aria-hidden={isDuplicate || undefined}
            >
              <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 backdrop-blur-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {/* Eager on purpose. `loading="lazy"` left 32 of 48 tiles blank at
                    375px: most of the track sits outside the viewport, and items
                    that only arrive via a CSS transform never trip the lazy-load
                    intersection, so they would slide in empty and stay empty.
                    These are ~1-2 KB SVGs over 24 unique URLs, so eager is cheap. */}
                <img
                  src={item.logo_url}
                  alt=""
                  width={26}
                  height={26}
                  className={`h-[26px] w-[26px] shrink-0 object-contain${
                    item.invert ? ' invert' : ''
                  }`}
                />
                <span className="whitespace-nowrap text-[11px] text-white/75">
                  {item.name}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
