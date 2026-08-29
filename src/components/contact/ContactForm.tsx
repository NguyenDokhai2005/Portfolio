'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, Mail, MessageSquare, Send, User } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { primarySocial, socialLinks } from '@/data/socials';
import { EASE, riseItem } from '@/lib/motion';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // No backend in this clone — surface a local confirmation instead.
    setSent(true);
    setForm({ name: '', email: '', message: '' });
    setTimeout(() => setSent(false), 3000);
  };

  const PrimaryIcon = primarySocial.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: EASE }}
      viewport={{ once: false, amount: 0.2 }}
      className="rounded-[28px] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5 md:p-8 flex flex-col h-full"
    >
      <motion.div
        variants={riseItem}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false }}
        transition={{ delay: 0.05 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Get In Touch</h2>
        <p className="text-sm text-white/50 mb-7">
          Feel free to reach out if you want to collaborate, discuss ideas, or simply say
          hello.
        </p>
      </motion.div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <motion.div
          variants={riseItem}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative">
            <User
              size={24}
              aria-hidden="true"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              aria-label="Your Name"
              placeholder="Your Name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="w-full rounded-2xl border border-white/15 bg-black/20 pl-12 pr-4 py-4 outline-none transition duration-200 focus:border-white focus:ring-1 focus:ring-white/40"
            />
          </div>
        </motion.div>

        <motion.div
          variants={riseItem}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false }}
          transition={{ delay: 0.16 }}
        >
          <div className="relative">
            <Mail
              size={24}
              aria-hidden="true"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              type="email"
              aria-label="Your Email"
              placeholder="Your Email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="w-full rounded-2xl border border-white/15 bg-black/20 pl-12 pr-4 py-4 outline-none transition duration-200 focus:border-white focus:ring-1 focus:ring-white/40"
            />
          </div>
        </motion.div>

        <motion.div
          variants={riseItem}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false }}
          transition={{ delay: 0.22 }}
        >
          <div className="relative">
            <MessageSquare
              size={24}
              aria-hidden="true"
              className="absolute left-4 top-5 text-white/40"
            />
            <textarea
              rows={5}
              aria-label="Your Message"
              placeholder="Your Message"
              value={form.message}
              onChange={(event) => setForm({ ...form, message: event.target.value })}
              className="w-full rounded-2xl border border-white/15 bg-black/20 pl-12 pr-4 py-4 outline-none resize-none transition duration-200 focus:border-white focus:ring-1 focus:ring-white/40"
            />
          </div>
        </motion.div>

        <motion.button
          type="submit"
          variants={riseItem}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false }}
          transition={{ delay: 0.28 }}
          whileHover={{ scale: 1.06, transition: { duration: 0.12 } }}
          whileTap={{ scale: 0.97 }}
          className="w-full rounded-2xl py-4 bg-white/10 border border-white/10 flex items-center justify-center gap-2"
        >
          <Send size={16} />
          {sent ? 'Message Sent' : 'Send Message'}
        </motion.button>
      </form>

      <div className="border-t border-white/10 pt-5 mt-6">
        <motion.p
          variants={riseItem}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false }}
          transition={{ delay: 0.34 }}
          className="text-sm text-white/55 mb-4"
        >
          Connect With Me
        </motion.p>

        <motion.a
          href={primarySocial.link}
          target="_blank"
          rel="noopener noreferrer"
          variants={riseItem}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false }}
          transition={{ delay: 0.36 }}
          whileHover={{ scale: 1.05, transition: { duration: 0.12 } }}
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-4 mb-3 flex items-center justify-between"
        >
          <div className="absolute inset-0 bg-white/[0.04] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700 ease-out" />
          <div className="relative z-10 flex items-center gap-3">
            <PrimaryIcon />
            <div>
              <p className="text-sm font-medium">{primarySocial.title}</p>
              <p className="text-xs text-white/35">{primarySocial.user}</p>
            </div>
          </div>
          <div className="relative z-10 opacity-0 group-hover:opacity-100 transition">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
              <ArrowUpRight size={14} />
            </div>
          </div>
        </motion.a>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {socialLinks.map((social, index) => {
            const Icon = social.icon;
            return (
              <motion.a
                key={social.title}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                variants={riseItem}
                initial="hidden"
                whileInView="show"
                viewport={{ once: false }}
                transition={{ delay: 0.4 + index * 0.04 }}
                whileHover={{ scale: 1.05, transition: { duration: 0.12 } }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-3 flex items-center justify-between"
              >
                <div className="absolute inset-0 bg-white/[0.04] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700 ease-out" />
                <div className="relative z-10 flex items-center gap-3">
                  <Icon />
                  <div>
                    <p className="text-sm">{social.title}</p>
                    <p className="text-[11px] text-white/35">{social.user}</p>
                  </div>
                </div>
                <div className="relative z-10 opacity-0 group-hover:opacity-100 transition">
                  <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center">
                    <ArrowUpRight size={12} />
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
