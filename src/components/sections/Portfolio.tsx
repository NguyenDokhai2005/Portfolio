'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { useState } from 'react';

import CardCertificate from '@/components/portfolio/CardCertificate';
import CardProject from '@/components/portfolio/CardProject';
import CardTechStack from '@/components/portfolio/CardTechStack';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { EASE } from '@/lib/motion';
import type { PortfolioTab } from '@/types';

const TABS: { key: PortfolioTab; label: string }[] = [
  { key: 'projects', label: 'Projects' },
  { key: 'certificates', label: 'Certificates' },
  { key: 'techstack', label: 'Tech Stack' },
];

/** Projects collapse to the first three until "See More" is pressed. */
const COLLAPSED_PROJECT_COUNT = 3;

export default function Portfolio() {
  const { projects, certificates, techStacks, loading } = usePortfolioData();
  const [activeTab, setActiveTab] = useState<PortfolioTab>('projects');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState('');
  const [showAll, setShowAll] = useState(false);

  const visibleProjects = showAll
    ? projects
    : projects.slice(0, COLLAPSED_PROJECT_COUNT);

  const openLightbox = (imageUrl: string) => {
    setLightboxImage(imageUrl);
    setLightboxOpen(true);
  };

  return (
    <>
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-md flex items-center justify-center px-6"
          >
            <button
              type="button"
              aria-label="Close preview"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <X size={18} />
            </button>
            <motion.img
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.35 }}
              src={lightboxImage}
              alt="Certificate preview"
              className="max-w-[88vw] max-h-[88vh] rounded-3xl object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <section
        id="portfolio"
        className="page-shell pt-16 sm:pt-20 lg:pt-24 pb-16 sm:pb-20 lg:pb-24 text-white"
      >
        <motion.div
          initial={{ opacity: 0, y: 45 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-5xl font-bold mb-3">Portfolio Showcase</h1>
          <p className="text-white/55 max-w-xl mx-auto text-sm md:text-base">
            Explore my journey through projects, certifications, and technical expertise.
          </p>
        </motion.div>

        <div className="flex justify-center mb-10">
          <div className="w-full max-w-3xl rounded-full border border-white/10 bg-white/5 p-2 flex gap-2 backdrop-blur-xl">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  if (tab.key !== 'projects') setShowAll(false);
                }}
                className={`flex-1 rounded-full py-3 text-sm transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.45 }}
          >
            {activeTab === 'projects' && (
              <div className="space-y-8">
                <motion.div
                  layout
                  transition={{ layout: { duration: 0.75, ease: EASE } }}
                  className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 px-1"
                >
                  <AnimatePresence mode="popLayout">
                    {!loading &&
                      visibleProjects.map((project, index) => (
                        <motion.div
                          key={project.id}
                          layout
                          initial={{ opacity: 0, y: 40, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -30, scale: 0.95 }}
                          transition={{ duration: 0.55, delay: index * 0.04, ease: EASE }}
                        >
                          <CardProject
                            id={project.id}
                            index={index}
                            title={project.title}
                            description={project.description}
                            image={project.image_url}
                            liveUrl={project.live_url}
                          />
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </motion.div>

                {!loading && projects.length > COLLAPSED_PROJECT_COUNT && (
                  <motion.div
                    layout
                    transition={{ duration: 0.6, ease: EASE }}
                    className="flex justify-center"
                  >
                    <motion.button
                      layout
                      type="button"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setShowAll((value) => !value)}
                      className="px-6 py-3 rounded-full border border-white/10 bg-white/[0.05] backdrop-blur-xl text-sm text-white/75 hover:text-white transition flex items-center gap-2"
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={showAll ? 'less' : 'more'}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.25 }}
                          className="flex items-center gap-2"
                        >
                          {showAll ? (
                            <>
                              <ChevronUp size={16} />
                              See Less
                            </>
                          ) : (
                            <>
                              <ChevronDown size={16} />
                              See More
                            </>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </motion.button>
                  </motion.div>
                )}
              </div>
            )}

            {activeTab === 'certificates' && (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 px-1">
                {!loading &&
                  certificates.map((certificate, index) => (
                    <CardCertificate
                      key={certificate.id}
                      index={index}
                      title={certificate.title}
                      imageUrl={certificate.image_url}
                      onPreview={openLightbox}
                    />
                  ))}
              </div>
            )}

            {activeTab === 'techstack' && (
              <div className="min-h-[360px] flex justify-center">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 max-w-5xl w-full">
                  {!loading &&
                    techStacks.map((tech, index) => (
                      <CardTechStack
                        key={tech.id}
                        index={index}
                        name={tech.name}
                        logoUrl={tech.logo_url}
                      />
                    ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </>
  );
}
