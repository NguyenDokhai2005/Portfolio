'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * A snap slot large enough for one full viewport. The wrapper — not the section
 * itself — carries `scroll-snap-align`, so the sections stay untouched and
 * Portfolio's `position: fixed` lightbox (a sibling of its `<section>`) is not
 * re-parented into an animated element.
 *
 * `threshold: 0.15` rather than a `rootMargin` band: Portfolio and Contact are
 * up to 3x the viewport height, and a centred band would leave them faded out
 * while already partly on screen.
 */
const VISIBILITY_THRESHOLD = 0.15;

/** `idle` renders no modifier class, so SSR output and the no-JS fallback stay
 *  fully visible; only once the observer has reported does fading kick in. */
type Visibility = 'idle' | 'in' | 'out';

interface SnapSectionProps {
  children: ReactNode;
}

export default function SnapSection({ children }: SnapSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visibility, setVisibility] = useState<Visibility>('idle');

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Without IntersectionObserver the slot simply never fades — content stays
    // readable rather than stuck at opacity 0.
    if (typeof IntersectionObserver === 'undefined') {
      setVisibility('in');
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setVisibility(entry.isIntersecting ? 'in' : 'out'),
      { threshold: VISIBILITY_THRESHOLD },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const modifier = visibility === 'idle' ? '' : ` is-${visibility}`;

  return (
    <div ref={ref} className={`snap-section${modifier}`}>
      {/* The slot carries the snap alignment and the fade; the inner wrapper
          carries the translate, so the animation can never move the snap point. */}
      <div className="snap-section__inner">{children}</div>
    </div>
  );
}
