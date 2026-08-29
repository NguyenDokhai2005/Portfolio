'use client';

import { motion } from 'framer-motion';
import { Code2, GraduationCap, Users } from 'lucide-react';

import type { ExperienceItem } from '@/types';

const KIND_ICON: Record<ExperienceItem['kind'], typeof Users> = {
  leadership: Users,
  development: Code2,
  education: GraduationCap,
};

const KIND_LABEL: Record<ExperienceItem['kind'], string> = {
  leadership: 'Leadership',
  development: 'Development',
  education: 'Education',
};

interface CardExperienceProps extends ExperienceItem {
  index: number;
}

export default function CardExperience({
  index,
  role,
  organization,
  period,
  kind,
  summary,
  highlights,
}: CardExperienceProps) {
  const Icon = KIND_ICON[kind];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      whileHover={{ y: -4 }}
      className="flex h-full flex-col rounded-[24px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10">
            <Icon size={15} />
          </div>
          <span className="text-[10px] uppercase tracking-[0.18em] text-white/45">
            {KIND_LABEL[kind]}
          </span>
        </div>

        {/* Only rendered where a real date exists — see `experience.ts`. */}
        {period ? (
          <span className="shrink-0 rounded-full border border-white/10 px-3 py-1 text-[10px] text-white/55">
            {period}
          </span>
        ) : null}
      </div>

      <h3 className="text-base font-semibold leading-snug">{role}</h3>
      <p className="mt-1 text-[13px] text-white/50">{organization}</p>

      <p className="mt-3 text-[13px] leading-relaxed text-white/65">{summary}</p>

      {highlights.length > 0 ? (
        <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
          {highlights.map((highlight) => (
            <li key={highlight} className="flex gap-2.5 text-[12px] leading-relaxed text-white/55">
              <span aria-hidden="true" className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-white/35" />
              {highlight}
            </li>
          ))}
        </ul>
      ) : null}
    </motion.div>
  );
}
