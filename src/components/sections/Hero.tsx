'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import Lanyard from '@/components/ui/Lanyard';
import TextType from '@/components/ui/TextType';
import { profile } from '@/data/profile';
import { EASE } from '@/lib/motion';

const HERO_REVEAL_DELAY = 3600;
const HERO_FLAG_DELAY = 5100;

interface HeroProps {
  /** False while the intro overlay is still covering the viewport. */
  showApp: boolean;
}

export default function Hero({ showApp }: HeroProps) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('heroPlayed') === 'true') {
      setRevealed(true);
      return;
    }

    const revealTimer = setTimeout(() => setRevealed(true), HERO_REVEAL_DELAY);
    const flagTimer = setTimeout(
      () => sessionStorage.setItem('heroPlayed', 'true'),
      HERO_FLAG_DELAY,
    );

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(flagTimer);
    };
  }, []);

  return (
    <section
      id="home"
      style={{
        /* `dvh`, not `vh`: on mobile `100vh` ignores the collapsing browser
           chrome and would overshoot the snap slot, letting the next section
           peek in at rest. */
        minHeight: '100dvh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* The shell owns the cap, the gutters and the vertical centring so the
          lanyard canvas (absolute to this box) stays paired with the copy
          instead of drifting to the far edge on wide monitors. */}
      <div
        className="page-shell-wide"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          minHeight: '100dvh',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 40,
            pointerEvents: showApp ? 'auto' : 'none',
          }}
        >
          {showApp && <Lanyard />}
        </div>

        <div
          className="md:max-w-[600px]"
          style={{ width: '100%', position: 'relative', zIndex: 5 }}
        >
        <motion.div
          initial={false}
          animate={
            revealed
              ? { opacity: 1, y: 0, filter: 'blur(0px)' }
              : { opacity: 0, y: 30, filter: 'blur(12px)' }
          }
          transition={{ duration: 0.9, ease: EASE }}
          style={{ marginBottom: 20 }}
        >
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              color: 'var(--text-muted)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            {profile.availability}
          </span>
        </motion.div>

        <div>
          <motion.h1
            initial={false}
            animate={
              revealed
                ? { opacity: 1, scale: 1, y: 0 }
                : { opacity: 0, scale: 0.85, y: 50 }
            }
            transition={{ duration: 1, ease: EASE }}
            style={{
              fontSize: 'clamp(32px, 6vw, 62px)',
              fontWeight: 800,
              lineHeight: 1.05,
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
              marginBottom: 0,
            }}
          >
            {profile.role[0]}
          </motion.h1>
          <motion.h1
            initial={false}
            animate={
              revealed
                ? { opacity: 1, x: 0, rotate: 0 }
                : { opacity: 0, x: -80, rotate: -4 }
            }
            transition={{ duration: 1, delay: 0.2, ease: EASE }}
            style={{
              fontSize: 'clamp(32px, 6vw, 62px)',
              fontWeight: 800,
              lineHeight: 1.05,
              color: 'var(--text-secondary)',
              letterSpacing: '-0.03em',
              marginBottom: 24,
            }}
          >
            {profile.role[1]}
          </motion.h1>
        </div>

        <motion.div
          initial={false}
          animate={revealed ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          style={{ marginBottom: 12 }}
        >
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 15,
              color: 'var(--text-secondary)',
              letterSpacing: '0.1em',
            }}
          >
            <TextType
              text={[...profile.typedRoles]}
              typingSpeed={75}
              pauseDuration={1500}
              showCursor
              cursorCharacter="_"
              deletingSpeed={50}
              cursorBlinkDuration={0.5}
            />
          </span>
        </motion.div>

        <motion.div
          initial={false}
          animate={
            revealed
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 50, scale: 0.96 }
          }
          transition={{ duration: 1, delay: 0.5 }}
          style={{ marginBottom: 28, width: '100%', maxWidth: 460 }}
        >
          <p
            style={{
              fontSize: 14,
              color: 'var(--text-secondary)',
              lineHeight: 1.9,
              letterSpacing: '0.01em',
              textWrap: 'pretty',
            }}
          >
            {profile.heroDescription}
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={revealed ? 'visible' : 'hidden'}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12, delayChildren: 0.7 } },
          }}
          style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}
        >
          {profile.heroTags.map((tag) => (
            <motion.span
              key={tag}
              variants={{
                hidden: { opacity: 0, y: 25, scale: 0.85 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: 0.5 }}
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 999,
                padding: '5px 12px',
                backgroundColor: 'var(--bg-card)',
              }}
            >
              {tag}
            </motion.span>
          ))}
        </motion.div>

        <motion.div
          initial={false}
          animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
          transition={{ duration: 0.8, delay: 1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
        >
          {profile.heroNotes.map((note) => (
            <span
              key={note}
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 13,
                color: 'var(--text-muted)',
              }}
            >
              {note}
            </span>
          ))}
          </motion.div>
        </div>
      </div>

      {/* Outside the shell so it centres on the viewport, not the capped box. */}
      <motion.div
        initial={false}
        animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.9, delay: 1.2, ease: EASE }}
        style={{
          position: 'absolute',
          bottom: 38,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          pointerEvents: 'none',
        }}
      >
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-full flex justify-center">
          <motion.div
            animate={{ y: [0, 6, 0], opacity: [1, 0.65, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center justify-center gap-2"
          >
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
              }}
            >
              Scroll
            </span>
            <span
              style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1 }}
            >
              ↓
            </span>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
