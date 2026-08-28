'use client';

import gsap from 'gsap';
import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ElementType,
} from 'react';

interface TextTypeProps {
  text: string | string[];
  as?: ElementType;
  typingSpeed?: number;
  initialDelay?: number;
  pauseDuration?: number;
  deletingSpeed?: number;
  loop?: boolean;
  className?: string;
  showCursor?: boolean;
  hideCursorWhileTyping?: boolean;
  cursorCharacter?: string;
  cursorClassName?: string;
  cursorBlinkDuration?: number;
  textColors?: string[];
  variableSpeed?: { min: number; max: number };
  onSentenceComplete?: (sentence: string, index: number) => void;
  startOnVisible?: boolean;
  reverseMode?: boolean;
}

/**
 * Typewriter with a GSAP-driven blinking cursor. Cycles through `text`
 * entries: type → pause → delete → next.
 */
export default function TextType({
  text,
  as: Component = 'div',
  typingSpeed = 50,
  initialDelay = 0,
  pauseDuration = 2000,
  deletingSpeed = 30,
  loop = true,
  className = '',
  showCursor = true,
  hideCursorWhileTyping = false,
  cursorCharacter = '|',
  cursorClassName = '',
  cursorBlinkDuration = 0.5,
  textColors = [],
  variableSpeed,
  onSentenceComplete,
  startOnVisible = false,
  reverseMode = false,
  ...rest
}: TextTypeProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(!startOnVisible);

  const cursorRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLElement>(null);

  const sentences = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);

  const resolveSpeed = useCallback(() => {
    if (!variableSpeed) return typingSpeed;
    const { min, max } = variableSpeed;
    return Math.random() * (max - min) + min;
  }, [variableSpeed, typingSpeed]);

  useEffect(() => {
    if (!startOnVisible || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setIsVisible(true);
        });
      },
      { threshold: 0.1 },
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [startOnVisible]);

  useEffect(() => {
    if (!showCursor || !cursorRef.current) return;

    gsap.set(cursorRef.current, { opacity: 1 });
    gsap.to(cursorRef.current, {
      opacity: 0,
      duration: cursorBlinkDuration,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut',
    });
  }, [showCursor, cursorBlinkDuration]);

  useEffect(() => {
    if (!isVisible) return;

    let timeout: ReturnType<typeof setTimeout>;
    const current = sentences[sentenceIndex];
    const processed = reverseMode ? current.split('').reverse().join('') : current;

    const tick = () => {
      if (isDeleting) {
        if (displayedText === '') {
          setIsDeleting(false);
          if (sentenceIndex === sentences.length - 1 && !loop) return;
          onSentenceComplete?.(sentences[sentenceIndex], sentenceIndex);
          setSentenceIndex((index) => (index + 1) % sentences.length);
          setCharIndex(0);
          timeout = setTimeout(() => undefined, pauseDuration);
        } else {
          timeout = setTimeout(() => {
            setDisplayedText((prev) => prev.slice(0, -1));
          }, deletingSpeed);
        }
        return;
      }

      if (charIndex < processed.length) {
        timeout = setTimeout(() => {
          setDisplayedText((prev) => prev + processed[charIndex]);
          setCharIndex((index) => index + 1);
        }, resolveSpeed());
        return;
      }

      if (sentences.length >= 1) {
        if (!loop && sentenceIndex === sentences.length - 1) return;
        timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
      }
    };

    if (charIndex === 0 && !isDeleting && displayedText === '') {
      timeout = setTimeout(tick, initialDelay);
    } else {
      tick();
    }

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    charIndex,
    displayedText,
    isDeleting,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    sentences,
    sentenceIndex,
    loop,
    initialDelay,
    isVisible,
    reverseMode,
    variableSpeed,
  ]);

  const hideCursor =
    hideCursorWhileTyping &&
    (charIndex < sentences[sentenceIndex].length || isDeleting);

  return createElement(
    Component,
    {
      ref: containerRef,
      className: `inline-block whitespace-pre-wrap tracking-tight ${className}`,
      ...rest,
    },
    <span
      className="inline"
      style={{
        color:
          (textColors.length === 0
            ? 'inherit'
            : textColors[sentenceIndex % textColors.length]) || 'inherit',
      }}
    >
      {displayedText}
    </span>,
    showCursor ? (
      <span
        ref={cursorRef}
        className={`ml-1 inline-block opacity-100 ${hideCursor ? 'hidden' : ''} ${cursorClassName}`}
      >
        {cursorCharacter}
      </span>
    ) : null,
  );
}
