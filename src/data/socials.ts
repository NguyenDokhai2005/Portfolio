import type { IconType } from 'react-icons';
import { FaEnvelope, FaGithub, FaLinkedinIn } from 'react-icons/fa';

export interface SocialLink {
  title: string;
  user: string;
  icon: IconType;
  link: string;
}

/** Rendered as a full-width card above the 2-column grid. */
export const primarySocial: SocialLink = {
  title: 'LinkedIn',
  user: 'Khải Nguyễn Đỗ',
  icon: FaLinkedinIn,
  // Percent-encoded: the vanity slug contains Vietnamese diacritics, which some
  // clients mangle when the raw characters are placed in an href.
  link: 'https://www.linkedin.com/in/kh%E1%BA%A3i-nguy%E1%BB%85n-%C4%91%E1%BB%97-073821376/',
};

export const socialLinks: SocialLink[] = [
  {
    title: 'GitHub',
    user: '@NguyenDokhai2005',
    icon: FaGithub,
    link: 'https://github.com/NguyenDokhai2005',
  },
  {
    title: 'Email',
    user: 'nguyendokhai.030105@gmail.com',
    icon: FaEnvelope,
    link: 'mailto:nguyendokhai.030105@gmail.com',
  },
];
