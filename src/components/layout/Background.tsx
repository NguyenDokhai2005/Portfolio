'use client';

import { useEffect, useRef } from 'react';

/**
 * Fixed backdrop: four blurred orbs that drift on a sine/cosine curve driven by
 * scroll position, plus a static 26px grid overlay.
 */
export default function Background() {
  const orbs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let frame = 0;

    const animate = () => {
      const offset = window.pageYOffset;

      orbs.current.forEach((orb, index) => {
        if (!orb) return;
        const x = Math.sin(offset / 120 + index * 0.6) * 100;
        const y = Math.cos(offset / 120 + index * 0.6) * 35;
        orb.style.transform = `translate(${x}px, ${y}px)`;
        orb.style.transition = 'transform 1.2s ease-out';
      });

      frame = requestAnimationFrame(animate);
    };

    window.addEventListener('scroll', animate);
    animate();

    return () => {
      window.removeEventListener('scroll', animate);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0">
        <div
          ref={(node) => {
            orbs.current[0] = node;
          }}
          className="absolute top-10 left-10 w-40 h-40 md:w-56 md:h-56 rounded-full bg-white blur-[90px] opacity-30"
        />
        <div
          ref={(node) => {
            orbs.current[1] = node;
          }}
          className="absolute top-10 right-10 w-40 h-40 md:w-56 md:h-56 rounded-full bg-zinc-300 blur-[100px] opacity-25"
        />
        <div
          ref={(node) => {
            orbs.current[2] = node;
          }}
          className="absolute bottom-10 left-10 w-44 h-44 md:w-60 md:h-60 rounded-full bg-zinc-400 blur-[110px] opacity-30"
        />
        <div
          ref={(node) => {
            orbs.current[3] = node;
          }}
          className="absolute bottom-10 right-10 w-40 h-40 md:w-56 md:h-56 rounded-full bg-white blur-[100px] opacity-20"
        />
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:26px_26px]" />
    </div>
  );
}
