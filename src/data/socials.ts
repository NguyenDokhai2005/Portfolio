import type { IconType } from 'react-icons';
import {
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaYoutube,
} from 'react-icons/fa';

export interface SocialLink {
  title: string;
  user: string;
  icon: IconType;
  link: string;
}

/** Rendered as a full-width card above the 2-column grid. */
export const primarySocial: SocialLink = {
  title: 'LinkedIn',
  user: '@linkedin',
  icon: FaLinkedinIn,
  link: 'https://www.linkedin.com/in/rifqimuhammadaliya/',
};

export const socialLinks: SocialLink[] = [
  {
    title: 'Instagram',
    user: '@instagram',
    icon: FaInstagram,
    link: 'https://www.instagram.com/itsmeikky_12?igsh=ZHFpMTJ1bHQzeDAx',
  },
  {
    title: 'Youtube',
    user: '@youtube',
    icon: FaYoutube,
    link: 'https://youtube.com/@zettaajah?si=QRjJGD4zCQG8aIHX',
  },
  {
    title: 'Github',
    user: '@github',
    icon: FaGithub,
    link: 'https://github.com/RifqiMuhammadAliya12',
  },
  {
    title: 'TikTok',
    user: '@tiktok',
    icon: FaTiktok,
    link: 'https://www.tiktok.com/@itsme.ikky_?_r=1&_t=ZS-95yAYr5PHUb',
  },
];
