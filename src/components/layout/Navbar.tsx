'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, type MouseEvent } from 'react';

import { navItems, profile } from '@/data/profile';
import { EASE } from '@/lib/motion';
import { smoothScrollTo } from '@/lib/scroll';

const SECTION_IDS = navItems.map((item) => item.id);
/** The navbar waits for the intro + hero reveal before dropping in. */
const NAVBAR_REVEAL_DELAY = 3800;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [mounted, setMounted] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleResize = () => setIsMobile(window.innerWidth < 768);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      for (const id of SECTION_IDS) {
        const section = document.getElementById(id);
        if (!section) continue;
        const rect = section.getBoundingClientRect();
        if (rect.top <= 140 && rect.bottom >= 140) {
          setActiveSection(id);
          break;
        }
      }
    };

    handleResize();
    handleScroll();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem('navbarPlayed')) {
      setRevealed(true);
      return;
    }

    const timer = setTimeout(() => {
      setRevealed(true);
      sessionStorage.setItem('navbarPlayed', 'true');
    }, NAVBAR_REVEAL_DELAY);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, selector: string) => {
    event.preventDefault();
    smoothScrollTo(selector);
    setMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : -40 }}
      transition={{ duration: 0.8, ease: EASE }}
      style={{
        position: 'fixed',
        top: 20,
        left: 0,
        right: 0,
        zIndex: 50,
        paddingInline: 'var(--nav-gutter)',
      }}
    >
      {/* Capped to the same box as the sections so the pill stops stretching
          across ultra-wide monitors. */}
      <div style={{ width: '100%', maxWidth: 'var(--page-max)', marginInline: 'auto' }}>
      <div
        className="px-5 sm:px-[30px]"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBlock: 10,
          width: '100%',
          borderRadius: 999,
          backgroundColor: scrolled ? 'rgba(13,13,13,0.85)' : 'rgba(13,13,13,0.5)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border)',
        }}
      >
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 13,
            color: 'var(--text-secondary)',
            letterSpacing: '0.1em',
          }}
        >
          {profile.brand}
        </span>

        {!isMobile && (
          <div style={{ display: 'flex', gap: 40 }}>
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(event) => handleNavClick(event, `#${item.id}`)}
                  style={{
                    position: 'relative',
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 13,
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    textDecoration: 'none',
                    letterSpacing: '0.08em',
                    cursor: 'pointer',
                    paddingBottom: 4,
                    transition: '0.25s ease',
                  }}
                >
                  {item.label}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: 1,
                      background: 'white',
                      transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                      transformOrigin: 'left',
                      transition: 'transform 0.25s ease',
                    }}
                  />
                </a>
              );
            })}
          </div>
        )}

        {isMobile && (
          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              cursor: 'pointer',
              background: 'transparent',
              border: 'none',
              padding: 0,
            }}
          >
            <span style={{ width: 20, height: 2, background: 'white' }} />
            <span style={{ width: 20, height: 2, background: 'white' }} />
            <span style={{ width: 20, height: 2, background: 'white' }} />
          </button>
        )}
      </div>

      {isMobile && menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            marginTop: 10,
            borderRadius: 16,
            background: 'rgba(13,13,13,0.9)',
            border: '1px solid var(--border)',
            backdropFilter: 'blur(12px)',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(event) => handleNavClick(event, `#${item.id}`)}
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 13,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                {item.label}
              </a>
            );
          })}
        </motion.div>
      )}
      </div>
    </motion.nav>
  );
}
