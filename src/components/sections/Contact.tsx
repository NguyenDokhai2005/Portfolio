'use client';

import { motion } from 'framer-motion';

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
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        viewport={{ once: true, amount: 0.3 }}
        className="text-center mb-12 sm:mb-14 lg:mb-16"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">
          Contact Me
        </h1>
        <p className="text-white/60 text-sm sm:text-base max-w-xl sm:max-w-2xl mx-auto leading-relaxed">
          Have something in mind? Send a message and let&apos;s connect.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
        viewport={{ once: true, amount: 0.2 }}
        style={{ willChange: 'transform, opacity' }}
      >
        <ContactForm />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        viewport={{ once: true }}
        className="mt-20 text-center text-xs text-white/35"
      >
        {profile.copyright}
      </motion.div>
    </section>
  );
}
