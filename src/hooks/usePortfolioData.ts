'use client';

import { useEffect, useState } from 'react';

import { certificates as certificateSeed } from '@/data/certificates';
import { projects as projectSeed } from '@/data/projects';
import type { Certificate, Project } from '@/types';

interface PortfolioData {
  projects: Project[];
  certificates: Certificate[];
  loading: boolean;
}

/**
 * Drop-in replacement for the original Supabase fetch hook. It keeps the same
 * contract (`loading` flag + sessionStorage warm cache) so swapping the local
 * arrays for a real API only means editing the `load()` body.
 *
 * Tech stack is no longer served here: it moved to the About marquee, which reads
 * `@/data/techStack` directly so the row never renders empty on first paint.
 * Experience is static content and is imported directly too.
 */
export function usePortfolioData(): PortfolioData {
  const [projects, setProjects] = useState<Project[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cachedProjects = sessionStorage.getItem('portfolioProjects');
    const cachedCertificates = sessionStorage.getItem('portfolioCertificates');

    if (cachedProjects) setProjects(JSON.parse(cachedProjects));
    if (cachedCertificates) setCertificates(JSON.parse(cachedCertificates));

    setProjects(projectSeed);
    setCertificates(certificateSeed);

    sessionStorage.setItem('portfolioProjects', JSON.stringify(projectSeed));
    sessionStorage.setItem('portfolioCertificates', JSON.stringify(certificateSeed));

    setLoading(false);
  }, []);

  return { projects, certificates, loading };
}

/** Counts shown on the About stat cards. */
export function usePortfolioCounts() {
  const [projectCount, setProjectCount] = useState(0);
  const [certificateCount, setCertificateCount] = useState(0);

  useEffect(() => {
    setProjectCount(projectSeed.length);
    setCertificateCount(certificateSeed.length);
  }, []);

  return { projectCount, certificateCount };
}
