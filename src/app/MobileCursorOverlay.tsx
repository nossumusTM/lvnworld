'use client';

import { useEffect, useState } from 'react';

const MOBILE_CURSOR_STORAGE_KEY = 'inaplanet-mobile-cursor-enabled';
const MOBILE_CURSOR_QUERY_PARAM = 'mobileCursor';

type MobileCursorWindow = Window & {
  enableMobileCursor?: () => void;
  disableMobileCursor?: () => void;
  toggleMobileCursor?: () => void;
};

function parseMobileCursorValue(value: string | null): boolean | null {
  if (!value) {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();
  if (['1', 'true', 'on', 'enable', 'enabled'].includes(normalizedValue)) {
    return true;
  }

  if (['0', 'false', 'off', 'disable', 'disabled'].includes(normalizedValue)) {
    return false;
  }

  return null;
}

export default function MobileCursorOverlay() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mobileCursorWindow = window as MobileCursorWindow;
    const syncCursorPreference = () => {
      const queryPreference = parseMobileCursorValue(
        new URLSearchParams(window.location.search).get(MOBILE_CURSOR_QUERY_PARAM)
      );

      if (queryPreference !== null) {
        window.localStorage.setItem(MOBILE_CURSOR_STORAGE_KEY, queryPreference ? '1' : '0');
        setIsEnabled(queryPreference);
        return queryPreference;
      }

      const storedPreference = parseMobileCursorValue(
        window.localStorage.getItem(MOBILE_CURSOR_STORAGE_KEY)
      );
      const nextEnabled = storedPreference ?? false;
      setIsEnabled(nextEnabled);
      return nextEnabled;
    };

    const applyCursorPreference = (enabled: boolean) => {
      window.localStorage.setItem(MOBILE_CURSOR_STORAGE_KEY, enabled ? '1' : '0');
      setIsEnabled(enabled);
      if (!enabled) {
        setIsActive(false);
      }
      window.dispatchEvent(new Event('mobile-cursor-setting-change'));
    };

    mobileCursorWindow.enableMobileCursor = () => applyCursorPreference(false);
    mobileCursorWindow.disableMobileCursor = () => applyCursorPreference(true);
    mobileCursorWindow.toggleMobileCursor = () => applyCursorPreference(!syncCursorPreference());

    const handlePreferenceChange = () => {
      const enabled = syncCursorPreference();
      if (!enabled) {
        setIsActive(false);
      }
    };

    handlePreferenceChange();

    if (!window.matchMedia('(pointer: coarse)').matches) {
      return () => {
        delete mobileCursorWindow.enableMobileCursor;
        delete mobileCursorWindow.disableMobileCursor;
        delete mobileCursorWindow.toggleMobileCursor;
        window.removeEventListener('storage', handlePreferenceChange);
        window.removeEventListener('mobile-cursor-setting-change', handlePreferenceChange);
      };
    }

    const showAtTouch = (touch: Touch) => {
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
      setIsActive(false);
    };

    window.addEventListener('storage', handlePreferenceChange);
    window.addEventListener('mobile-cursor-setting-change', handlePreferenceChange);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      delete mobileCursorWindow.enableMobileCursor;
      delete mobileCursorWindow.disableMobileCursor;
      delete mobileCursorWindow.toggleMobileCursor;
      window.removeEventListener('storage', handlePreferenceChange);
      window.removeEventListener('mobile-cursor-setting-change', handlePreferenceChange);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);

  if (!isEnabled) {
    return null;
  }

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
