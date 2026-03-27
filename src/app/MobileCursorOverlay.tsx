'use client';

import { useEffect, useRef, useState } from 'react';

const HIDE_DELAY_MS = 140;

export default function MobileCursorOverlay() {
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const hideTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia('(pointer: coarse)').matches) {
      return undefined;
    }

    const clearHideTimeout = () => {
      if (hideTimeoutRef.current !== null) {
        window.clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };

    const showAtTouch = (touch: Touch) => {
      clearHideTimeout();
      setPosition({ x: touch.clientX, y: touch.clientY });
      setIsActive(true);
    };

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      showAtTouch(touch);
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      showAtTouch(touch);
    };

    const handleTouchEnd = () => {
      clearHideTimeout();
      hideTimeoutRef.current = window.setTimeout(() => {
        setIsActive(false);
      }, HIDE_DELAY_MS);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      clearHideTimeout();
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`mobile-cursor-overlay ${isActive ? 'mobile-cursor-overlay-active' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    />
  );
}
