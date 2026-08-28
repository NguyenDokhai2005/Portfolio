'use client';

import { motion } from 'framer-motion';

interface CardCertificateProps {
  index: number;
  title: string;
  imageUrl: string;
  onPreview: (imageUrl: string) => void;
}

export default function CardCertificate({
  index,
  title,
  imageUrl,
  onPreview,
}: CardCertificateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.04 }}
      whileHover={{ y: -4 }}
      onClick={() => onPreview(imageUrl)}
      className="group cursor-pointer rounded-[26px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
    >
      <div className="rounded-2xl overflow-hidden border border-white/10 h-56">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
      </div>
      <h3 className="mt-4 text-[15px] font-semibold text-center text-white/90">
        {title}
      </h3>
    </motion.div>
  );
}
