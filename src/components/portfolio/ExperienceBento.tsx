'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, Code2, GraduationCap, Users } from 'lucide-react';
import Link from 'next/link';

import { getProjectById } from '@/data/projects';
import { EASE } from '@/lib/motion';
import type { ExperienceItem, Project } from '@/types';

const KIND_ICON: Record<ExperienceItem['kind'], typeof Users> = {
  leadership: Users,
  development: Code2,
  education: GraduationCap,
};

const KIND_LABEL: Record<ExperienceItem['kind'], string> = {
  leadership: 'Leadership',
  development: 'Solo',
  education: 'Education',
};

/**
 * Bento placement on the 6-column desktop grid: leadership cards sit three to a
 * row, the solo card takes two thirds and education closes the row beside it.
 */
const SPAN: Record<ExperienceItem['kind'], string> = {
  leadership: 'lg:col-span-2',
  development: 'md:col-span-2 lg:col-span-4',
  education: 'md:col-span-2 lg:col-span-2',
};

/** "AutoRent VN — Peer-to-Peer …" → "AutoRent VN". */
const shortTitle = (project: Project) => project.title.split(' — ')[0];

interface ExperienceBentoProps {
  items: ExperienceItem[];
}

export default function ExperienceBento({ items }: ExperienceBentoProps) {
  const leadership = items.filter((item) => item.kind === 'leadership');
  const soloBuilds = items
    .filter((item) => item.kind === 'development')
    .flatMap((item) => item.projectIds ?? []);

  const stats = [
    { value: leadership.length, label: 'Teams led' },
    { value: Math.max(0, ...leadership.map((item) => item.teamSize ?? 0)), label: 'Largest team' },
    { value: soloBuilds.length, label: 'Solo builds' },
  ];

  // Three leadership cards leave one alone on the 2-column tablet grid; let the
  // odd one out span the row instead.
  const oddLeadershipId =
    leadership.length % 2 === 1 ? leadership[leadership.length - 1].id : null;

  return (
    <div className="grid w-full max-w-6xl grid-cols-1 gap-5 px-1 md:grid-cols-2 lg:grid-cols-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: EASE }}
        className="grid grid-cols-3 divide-x divide-white/10 rounded-[24px] border border-white/10 bg-white/[0.04] backdrop-blur-xl md:col-span-2 lg:col-span-6"
      >
        {stats.map((stat) => (
          <div key={stat.label} className="px-3 py-5 text-center sm:py-6">
            <div className="text-3xl font-bold leading-none md:text-4xl">{stat.value}</div>
            <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-white/45 sm:tracking-[0.18em]">
              {stat.label}
            </div>
          </div>
        ))}
      </motion.div>

      {items.map((item, index) => (
        <ExperienceCard
          key={item.id}
          item={item}
          index={index}
          className={`${SPAN[item.kind]} ${item.id === oddLeadershipId ? 'md:col-span-2' : ''}`}
        />
      ))}
    </div>
  );
}

interface ExperienceCardProps {
  item: ExperienceItem;
  index: number;
  className: string;
}

function ExperienceCard({ item, index, className }: ExperienceCardProps) {
  const Icon = KIND_ICON[item.kind];
  const projects = (item.projectIds ?? [])
    .map(getProjectById)
    .filter((project): project is Project => Boolean(project));

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: EASE }}
      whileHover={{ y: -4 }}
      className={`flex h-full flex-col rounded-[24px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition-colors duration-500 hover:border-white/20 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10">
            <Icon size={15} />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
            {KIND_LABEL[item.kind]}
          </span>
        </div>

        {/* Only rendered where a real date exists — see `experience.ts`. */}
        {item.period ? (
          <span className="shrink-0 rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] text-white/55">
            {item.period}
          </span>
        ) : null}
      </div>

      {item.teamSize ? (
        <TeamDots size={item.teamSize} label={`team of ${item.teamSize}`} />
      ) : item.kind === 'development' ? (
        <TeamDots size={1} label="built alone" />
      ) : null}

      <h3 className="mt-5 text-base font-semibold leading-snug">{item.role}</h3>
      <p className="mt-1 text-[13px] text-white/50">{item.organization}</p>

      <p className="mt-3 text-[13px] leading-relaxed text-white/65">{item.summary}</p>

      {item.highlights.length > 0 ? (
        <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
          {item.highlights.map((highlight) => (
            <li key={highlight} className="flex gap-2.5 text-[12px] leading-relaxed text-white/55">
              <span aria-hidden="true" className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-white/35" />
              {highlight}
            </li>
          ))}
        </ul>
      ) : null}

      {projects.length > 0 ? (
        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/portfolio/${project.id}`}
              className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-[12px] text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            >
              {projects.length === 1 ? 'View project' : shortTitle(project)}
              <ArrowUpRight size={13} />
            </Link>
          ))}
        </div>
      ) : null}

      {/* Education shares a row with the taller solo card; the start year fills
          the space it would otherwise leave empty. */}
      {item.kind === 'education' && item.period ? (
        <div
          aria-hidden="true"
          className="mt-auto hidden pt-6 font-mono text-6xl leading-none tracking-tight text-white/[0.07] lg:block"
        >
          {item.period.split(' ')[0]}
        </div>
      ) : null}
    </motion.article>
  );
}

/** One dot per person; the lit dot is me. */
function TeamDots({ size, label }: { size: number; label: string }) {
  return (
    <div className="mt-5 flex items-center gap-3">
      <div role="img" aria-label={`${label}, including me`} className="flex items-center gap-1.5">
        {Array.from({ length: size }, (_, dot) => (
          <motion.span
            key={dot}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 + dot * 0.07, duration: 0.4, ease: EASE }}
            className={
              dot === 0
                ? 'h-3 w-3 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.55)]'
                : 'h-3 w-3 rounded-full border border-white/35'
            }
          />
        ))}
      </div>
      <span className="font-mono text-[11px] text-white/45">{label}</span>
    </div>
  );
}
