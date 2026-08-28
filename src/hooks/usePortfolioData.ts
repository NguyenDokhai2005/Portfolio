'use client';

import { useEffect, useState } from 'react';

import { certificates as certificateSeed } from '@/data/certificates';
import { projects as projectSeed } from '@/data/projects';
import { techStack as techStackSeed } from '@/data/techStack';
import type { Certificate, Project, TechStackItem } from '@/types';

interface PortfolioData {
  projects: Project[];
  certificates: Certificate[];
  techStacks: TechStackItem[];
  loading: boolean;
}

/**
 * Drop-in replacement for the original Supabase fetch hook. It keeps the same
 * contract (`loading` flag + sessionStorage warm cache) so swapping the local
 * arrays for a real API only means editing the `load()` body.
 */
export function usePortfolioData(): PortfolioData {
  const [projects, setProjects] = useState<Project[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [techStacks, setTechStacks] = useState<TechStackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cachedProjects = sessionStorage.getItem('portfolioProjects');
    const cachedCertificates = sessionStorage.getItem('portfolioCertificates');
    const cachedTechStacks = sessionStorage.getItem('portfolioTechStacks');

    if (cachedProjects) setProjects(JSON.parse(cachedProjects));
    if (cachedCertificates) setCertificates(JSON.parse(cachedCertificates));
    if (cachedTechStacks) setTechStacks(JSON.parse(cachedTechStacks));

    setProjects(projectSeed);
    setCertificates(certificateSeed);
    setTechStacks(techStackSeed);

    sessionStorage.setItem('portfolioProjects', JSON.stringify(projectSeed));
    sessionStorage.setItem('portfolioCertificates', JSON.stringify(certificateSeed));
    sessionStorage.setItem('portfolioTechStacks', JSON.stringify(techStackSeed));

    setLoading(false);
  }, []);

  return { projects, certificates, techStacks, loading };
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
