'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import Background from '@/components/layout/Background';
import Navbar from '@/components/layout/Navbar';
import SnapScroller from '@/components/layout/SnapScroller';
import SnapSection from '@/components/layout/SnapSection';
import WelcomeScreen from '@/components/layout/WelcomeScreen';
import About from '@/components/sections/About';
import Contact from '@/components/sections/Contact';
import Hero from '@/components/sections/Hero';
import Portfolio from '@/components/sections/Portfolio';

const INTRO_DURATION = 2800;

export default function Home() {
  const [showIntro, setShowIntro] = useState(false);
  const [showApp, setShowApp] = useState(true);

  useEffect(() => {
    const { hash, pathname } = window.location;

    // Returning from a project detail page ("Back" pushes /#portfolio):
    // skip the intro entirely.
    if (hash === '#portfolio') {
      setShowIntro(false);
      setShowApp(true);
      return;
    }

    // A hard reload on the landing page replays the whole intro.
    const navEntries = performance.getEntriesByType(
      'navigation',
    ) as PerformanceNavigationTiming[];
    const navType = navEntries.length > 0 ? navEntries[0].type : null;

    if (navType === 'reload' && pathname === '/') {
      sessionStorage.removeItem('introPlayed');
      sessionStorage.removeItem('heroPlayed');
      if (window.location.hash) history.replaceState(null, '', '/');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    if (sessionStorage.getItem('introPlayed') === 'true') {
      setShowIntro(false);
      setShowApp(true);
      return;
    }

    setShowIntro(true);
    setShowApp(false);

    const timer = setTimeout(() => {
      setShowIntro(false);
      setShowApp(true);
      sessionStorage.setItem('introPlayed', 'true');
    }, INTRO_DURATION);

    return () => clearTimeout(timer);
  }, []);

  return (
    // `overflowX: clip` rather than `overflow: hidden` — `hidden` would make
    // <main> a scroll container and the sections would snap against it instead
    // of the document, disabling snapping entirely.
    <main style={{ position: 'relative', overflowX: 'clip' }}>
      <Background />
      <SnapScroller />

      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Navbar stays outside the snap slots: it is fixed and must not inherit
            a slot's fade or transform. */}
        <Navbar />
        <SnapSection>
          <Hero showApp={showApp} />
        </SnapSection>
        <SnapSection>
          <About />
        </SnapSection>
        <SnapSection>
          <Portfolio />
        </SnapSection>
        <SnapSection>
          <Contact />
        </SnapSection>
      </div>

      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            onAnimationStart={(definition) => {
              if (definition === 'exit') setShowApp(true);
            }}
            transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
          >
            <WelcomeScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
