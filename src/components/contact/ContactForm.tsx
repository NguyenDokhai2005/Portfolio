'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, Mail, MessageSquare, Send, User } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { primarySocial, socialLinks } from '@/data/socials';
import { EASE } from '@/lib/motion';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
    setForm({ name: '', email: '', message: '' });
    setTimeout(() => setSent(false), 3000);
  };

  const PrimaryIcon = primarySocial.icon;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Social Contacts */}
      <div className="space-y-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Get In Touch</h2>
          <p className="text-sm text-white/50">
            Connect with me on social media or send a direct message.
          </p>
        </div>

        {/* Primary Social - LinkedIn */}
        <motion.a
          href={primarySocial.link}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.02, y: -4 }}
          style={{ willChange: 'transform' }}
          className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl p-6 block"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
              <PrimaryIcon className="text-xl" />
            </div>
            <h3 className="text-lg font-semibold mb-1">{primarySocial.title}</h3>
            <p className="text-sm text-white/50 mb-4">{primarySocial.user}</p>
            <div className="flex items-center gap-2 text-sm text-white/70 group-hover:text-white transition-colors">
              Connect <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        </motion.a>

        {/* Secondary Socials Grid */}
        <div className="grid grid-cols-2 gap-4">
          {socialLinks.map((social, index) => {
            const Icon = social.icon;
            const gradients = [
              'from-gray-500/10 to-gray-600/10',
              'from-red-500/10 to-pink-500/10',
            ];
            const hoverGradients = [
              'from-gray-500/20 to-gray-600/20',
              'from-red-500/20 to-pink-500/20',
            ];

            return (
              <motion.a
                key={social.title}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: EASE }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -4 }}
                style={{ willChange: 'transform' }}
                className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${gradients[index]} backdrop-blur-xl p-6 block`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${hoverGradients[index]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                    <Icon className="text-xl" />
                  </div>
                  <h3 className="text-base font-semibold mb-1">{social.title}</h3>
                  <p className="text-xs text-white/50 mb-3 truncate">{social.user}</p>
                  <div className="flex items-center gap-2 text-xs text-white/70 group-hover:text-white transition-colors">
                    View <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>

      {/* Right Column - Send Message Form */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl p-6 lg:p-8 h-fit">
        <h2 className="text-2xl font-bold mb-2">Send a Message</h2>
        <p className="text-sm text-white/50 mb-6">
          Let&apos;s discuss your next project or idea.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <User
              size={18}
              aria-hidden="true"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              aria-label="Your Name"
              placeholder="Your Name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="w-full rounded-xl border border-white/10 bg-black/30 pl-11 pr-4 py-3.5 text-sm outline-none transition-all duration-300 focus:border-white/30 focus:bg-black/40"
            />
          </div>

          <div className="relative">
            <Mail
              size={18}
              aria-hidden="true"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              type="email"
              aria-label="Your Email"
              placeholder="Your Email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="w-full rounded-xl border border-white/10 bg-black/30 pl-11 pr-4 py-3.5 text-sm outline-none transition-all duration-300 focus:border-white/30 focus:bg-black/40"
            />
          </div>

          <div className="relative">
            <MessageSquare
              size={18}
              aria-hidden="true"
              className="absolute left-4 top-4 text-white/40"
            />
            <textarea
              rows={6}
              aria-label="Your Message"
              placeholder="Your Message"
              value={form.message}
              onChange={(event) => setForm({ ...form, message: event.target.value })}
              className="w-full rounded-xl border border-white/10 bg-black/30 pl-11 pr-4 py-3.5 text-sm outline-none resize-none transition-all duration-300 focus:border-white/30 focus:bg-black/40"
            />
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-xl py-3.5 bg-white text-black font-medium text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
          >
            <Send size={16} />
            {sent ? 'Message Sent!' : 'Send Message'}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
