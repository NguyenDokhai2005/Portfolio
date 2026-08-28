/**
 * Custom 1.2s ease-in-out-cubic scroll used by the navbar links.
 * Reimplements the original hand-rolled rAF tween (native smooth scroll is
 * noticeably faster and breaks the feel of the site).
 */
export const SCROLL_DURATION = 1200;

export function smoothScrollTo(selector: string) {
  const target = document.querySelector(selector);
  if (!target) return;

  const targetTop = target.getBoundingClientRect().top + window.scrollY - 3;
  const startTop = window.scrollY;
  const distance = targetTop - startTop;
  let startTime: number | null = null;

  const step = (now: number) => {
    if (startTime === null) startTime = now;
    const elapsed = now - startTime;
    const t = Math.min(elapsed / SCROLL_DURATION, 1);
    const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    window.scrollTo({ top: startTop + distance * eased });
    if (elapsed < SCROLL_DURATION) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}

export function scrollToPortfolio() {
  document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' });
}
