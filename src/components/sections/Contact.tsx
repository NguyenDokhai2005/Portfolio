'use client';

import { motion } from 'framer-motion';

import Comments from '@/components/contact/Comments';
import ContactForm from '@/components/contact/ContactForm';
import { profile } from '@/data/profile';
import { EASE } from '@/lib/motion';

export default function Contact() {
  return (
    <section
      id="contact"
      className="page-shell pt-20 sm:pt-24 lg:pt-28 pb-24 sm:pb-28 lg:pb-36 text-white"
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        viewport={{ once: false, amount: 0.3 }}
        className="text-center mb-12 sm:mb-14 lg:mb-16"
      >
        {/* Both headings keep a slow idle float once revealed. */}
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          viewport={{ once: false }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4"
        >
          Contact Me
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
          viewport={{ once: false }}
          className="text-white/60 text-sm sm:text-base max-w-xl sm:max-w-2xl mx-auto leading-relaxed"
        >
          Have something in mind? Send a message and let&apos;s connect.
        </motion.p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 sm:gap-8 md:gap-10 lg:gap-12">
        <div className="w-full">
          <ContactForm />
        </div>
        <div className="w-full">
          <Comments />
        </div>
      </div>

      <div className="mt-20 text-center text-xs text-white/35">{profile.copyright}</div>
    </section>
  );
}
