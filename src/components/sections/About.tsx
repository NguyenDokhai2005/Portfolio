'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, Award, Code, FileText, Globe } from 'lucide-react';
import Image from 'next/image';
import type { ReactNode } from 'react';

import { profile } from '@/data/profile';
import { usePortfolioCounts } from '@/hooks/usePortfolioData';
import { blurUpItem, containerStagger, popCard, slideInRight } from '@/lib/motion';
import { scrollToPortfolio } from '@/lib/scroll';

interface StatCard {
  icon: ReactNode;
  value: string;
  title: string;
}

export default function About() {
  const { projectCount, certificateCount } = usePortfolioCounts();

  const stats: StatCard[] = [
    { icon: <Code size={16} />, value: String(projectCount), title: 'PROJECTS' },
    { icon: <Award size={16} />, value: String(certificateCount), title: 'CERTIFICATES' },
    {
      icon: <Globe size={16} />,
      value: String(projectCount + certificateCount),
      title: 'COMPLETED WORKS',
    },
  ];

  return (
    <section
      id="about"
      className="pt-[60px] md:pt-20 pb-[30px]"
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'flex-start',
      }}
    >
      <div className="page-shell-wide">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <motion.div
            variants={containerStagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, margin: '-80px' }}
            style={{ maxWidth: '600px', width: '100%' }}
          >
            <motion.div variants={blurUpItem} style={{ marginBottom: 18 }}>
              {/* An `h2` rather than a `span`: this is the section's title, which
                  matches how Portfolio and Contact label themselves and gives the
                  section a heading it previously lacked entirely. */}
              <h2
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 12,
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 13,
                  fontWeight: 500,
                  /* #d4d4d4 on #0d0d0d is 13.1:1. The previous --text-muted was
                     2.6:1, below the 4.5:1 AA floor at this size, which is why
                     the label barely registered. */
                  color: 'var(--accent)',
                  letterSpacing: '0.28em',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 30,
                    height: 2,
                    flex: 'none',
                    borderRadius: 999,
                    background: 'linear-gradient(90deg, var(--accent), transparent)',
                  }}
                />
                ABOUT ME
              </h2>
            </motion.div>

            <motion.div variants={blurUpItem}>
              <div
                style={{
                  fontSize: 'clamp(32px, 5vw, 46px)',
                  fontWeight: 800,
                  lineHeight: 1.03,
                  color: 'var(--text-primary)',
                }}
              >
                {profile.nameLines.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
            </motion.div>

            <motion.p
              variants={{
                hidden: { opacity: 0, y: 40 },
                show: { opacity: 1, y: 0, transition: { duration: 1.1, delay: 0.2 } },
              }}
              className="max-w-full lg:max-w-[490px]"
              style={{
                marginTop: 18,
                fontSize: 14,
                color: 'var(--text-secondary)',
                lineHeight: 1.75,
              }}
            >
              {profile.aboutDescription}
            </motion.p>

            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.94 },
                show: { opacity: 1, scale: 1, transition: { duration: 0.9, delay: 0.3 } },
              }}
              style={{
                marginTop: 18,
                padding: '12px 25px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                fontSize: 12,
                fontStyle: 'italic',
                display: 'inline-block',
                width: 'fit-content',
              }}
            >
              {profile.aboutQuote}
            </motion.div>

            <motion.div
              variants={blurUpItem}
              style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}
            >
              <a
                href={profile.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <button
                  type="button"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '10px 18px',
                    borderRadius: 8,
                    border: '1px solid white',
                    background: 'white',
                    color: 'black',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'transform 0.25s ease, opacity 0.25s ease',
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
                    event.currentTarget.style.opacity = '0.92';
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.transform = 'translateY(0) scale(1)';
                    event.currentTarget.style.opacity = '1';
                  }}
                >
                  <FileText size={14} />
                  Download CV
                </button>
              </a>

              <button
                type="button"
                onClick={scrollToPortfolio}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 18px',
                  borderRadius: 8,
                  border: '1px solid white',
                  background: 'transparent',
                  color: 'white',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'transform 0.25s ease, opacity 0.25s ease',
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
                  event.currentTarget.style.opacity = '0.85';
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.transform = 'translateY(0) scale(1)';
                  event.currentTarget.style.opacity = '1';
                }}
              >
                <ArrowUpRight size={14} />
                View Projects
              </button>
            </motion.div>
          </motion.div>

          {/* Hidden below `lg`: at tablet widths the 48% ring collides with the
              copy, so those breakpoints get the same text-only treatment as
              phones and the paragraph reclaims the full shell width. */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false }}
            className="hidden lg:flex w-[48%] justify-end"
          >
            <div
              style={{
                padding: 12,
                borderRadius: '50%',
                border: '1px solid var(--border)',
                transform: 'translateX(-80px)',
              }}
            >
              <Image
                src={profile.avatar}
                alt="Profile"
                width={240}
                height={240}
                sizes="240px"
                style={{
                  width: 240,
                  height: 240,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  objectPosition: 'center 45%',
                  display: 'block',
                }}
              />
            </div>
          </motion.div>
        </div>

        <motion.div
          variants={containerStagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-[18px] mt-9"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.title}
              variants={popCard}
              whileHover={{ scale: 1.03 }}
              style={{
                position: 'relative',
                padding: 18,
                borderRadius: 16,
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                }}
              >
                {stat.icon}
              </div>
              <div
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: 11, letterSpacing: '0.08em' }}>{stat.title}</div>
              <div
                onClick={scrollToPortfolio}
                style={{ position: 'absolute', bottom: 14, right: 14, cursor: 'pointer' }}
              >
                <ArrowUpRight size={15} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
