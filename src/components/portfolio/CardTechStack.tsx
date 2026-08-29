'use client';

import { motion } from 'framer-motion';

interface CardTechStackProps {
  index: number;
  name: string;
  logoUrl?: string;
  /** Flips solid-black devicon logos so they read on the dark tile. */
  invert?: boolean;
}

export default function CardTechStack({
  index,
  name,
  logoUrl,
  invert = false,
}: CardTechStackProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.04 }}
      whileHover={{ y: -5, scale: 1.04 }}
      className="group rounded-[24px] border border-white/10 bg-white/[0.04] backdrop-blur-xl flex flex-col items-center justify-center gap-3 h-[125px] w-[125px] mx-auto"
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute w-[70px] h-[70px] rounded-full bg-white/20 blur-2xl opacity-0 group-hover:opacity-100 transition duration-500" />
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={name}
            className={`relative z-10 w-[56px] h-[56px] object-contain${invert ? ' invert' : ''}`}
          />
        ) : (
          <div className="relative z-10 w-[56px] h-[56px] rounded-2xl bg-white/10" />
        )}
      </div>
      <p className="text-[11px] text-white/80 text-center leading-tight px-2 line-clamp-1">
        {name}
      </p>
    </motion.div>
  );
}
