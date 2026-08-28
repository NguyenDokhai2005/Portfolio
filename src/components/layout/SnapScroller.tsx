'use client';

import { useEffect } from 'react';

/**
 * Wheel-driven section stepping, layered on top of the CSS snap.
 *
 * CSS proximity snapping alone was measured to be inconsistent for the mouse
 * wheel: a 120px notch (and even three in a row) gets pulled straight back to
 * the section it started on, so the wheel appears dead, while a long fling skips
 * a section entirely. Touch swipes carry enough velocity to land on a snap point
 * unaided, so only `wheel` is intercepted and mobile keeps its native feel.
 *
 * The handler deliberately steps aside whenever there is still something to
 * scroll: inside an oversized section (Portfolio and Contact are up to three
 * viewports tall), inside a nested scroller such as the comment list, or under a
 * full-screen overlay like the certificate lightbox.
 */

/** Tolerance for comparing scroll offsets — subpixel zoom/DPR rounding. */
const EPSILON = 2;
/** Safety net in case `scrollend` never fires (pre-Chrome-114, older Safari). */
const SETTLE_FALLBACK = 900;
/**
 * Quiet time required after the scroll settles before another step is accepted.
 * Releasing on `scrollend` alone was measured to double-step: a trackpad flick
 * or three quick notches keep emitting events after the ~400ms smooth scroll has
 * finished, so the tail of one gesture triggered a second jump.
 */
const QUIET_PERIOD = 160;

/** True while a nested scroll area can still absorb the gesture itself. */
function nestedScrollerHasRoom(path: EventTarget[], direction: number): boolean {
  for (const node of path) {
    if (node === document.body || node === document.documentElement) break;
    if (!(node instanceof HTMLElement)) continue;

    const { overflowY } = getComputedStyle(node);
    if (overflowY !== 'auto' && overflowY !== 'scroll') continue;

    const max = node.scrollHeight - node.clientHeight;
    if (max <= 1) continue;
    if (direction > 0 && node.scrollTop < max - 1) return true;
    if (direction < 0 && node.scrollTop > 1) return true;
  }
  return false;
}

/**
 * Detects a viewport-covering fixed overlay (the lightbox). The navbar is also
 * fixed but only ~54px tall, so the height test keeps it navigable.
 */
function isUnderOverlay(path: EventTarget[]): boolean {
  return path.some((node) => {
    if (!(node instanceof HTMLElement)) return false;
    if (getComputedStyle(node).position !== 'fixed') return false;
    return node.getBoundingClientRect().height >= window.innerHeight * 0.9;
  });
}

export default function SnapScroller() {
  useEffect(() => {
    let locked = false;
    /** Whether the programmatic scroll has finished; the quiet countdown may
     *  only start afterwards, or the lock would lift mid-animation. */
    let settled = false;
    let quietTimer: number | undefined;
    let settleTimer: number | undefined;

    const beginQuietCountdown = () => {
      window.clearTimeout(quietTimer);
      quietTimer = window.setTimeout(() => {
        locked = false;
      }, QUIET_PERIOD);
    };

    const onScrollEnd = () => {
      settled = true;
      window.clearTimeout(settleTimer);
      beginQuietCountdown();
    };

    const lock = () => {
      locked = true;
      settled = false;
      window.clearTimeout(quietTimer);
      window.clearTimeout(settleTimer);
      window.addEventListener('scrollend', onScrollEnd, { once: true });
      settleTimer = window.setTimeout(onScrollEnd, SETTLE_FALLBACK);
    };

    const release = () => {
      locked = false;
      window.clearTimeout(quietTimer);
      window.clearTimeout(settleTimer);
      window.removeEventListener('scrollend', onScrollEnd);
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return; // pinch-zoom, not a scroll
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return; // horizontal

      const direction = event.deltaY > 0 ? 1 : -1;
      const path = event.composedPath();

      // A full-screen overlay must swallow the gesture outright: returning
      // without `preventDefault` would let native scrolling drift the page
      // behind the lightbox.
      if (isUnderOverlay(path)) {
        event.preventDefault();
        return;
      }

      // A nested scroller is the opposite — bail *without* preventDefault so the
      // browser scrolls that element natively.
      if (nestedScrollerHasRoom(path, direction)) return;

      // Swallow anything that arrives mid-flight, otherwise a trackpad's event
      // stream would queue up several sections' worth of jumps. Every swallowed
      // event pushes the quiet countdown back, so the lock survives for as long
      // as the gesture keeps producing events — one gesture stays one section.
      if (locked) {
        event.preventDefault();
        if (settled) beginQuietCountdown();
        return;
      }

      const slots = [...document.querySelectorAll<HTMLElement>('.snap-section')];
      if (slots.length === 0) return;

      const y = window.scrollY;
      const viewport = window.innerHeight;

      let current = 0;
      for (let index = 0; index < slots.length; index += 1) {
        if (slots[index].offsetTop <= y + EPSILON) current = index;
      }

      const slotTop = slots[current].offsetTop;
      const slotBottom = slotTop + slots[current].offsetHeight;

      // Oversized section: keep native scrolling until its far edge is reached,
      // so no content is ever skipped past.
      if (direction > 0 && y + viewport < slotBottom - EPSILON) return;
      if (direction < 0 && y > slotTop + EPSILON) return;

      const target = current + direction;
      if (target < 0 || target >= slots.length) return;

      event.preventDefault();
      lock();

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({
        top: slots[target].offsetTop,
        behavior: reduceMotion ? 'auto' : 'smooth',
      });
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', onWheel);
      release();
    };
  }, []);

  return null;
}
