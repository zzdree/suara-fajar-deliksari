'use client';

import React, { useState, useEffect } from 'react';
import { BIBLE_VERSES } from '@/lib/bible-verses';

export function BibleTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeState('out');
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % BIBLE_VERSES.length);
        setFadeState('in');
      }, 600);
    }, 30000); // Cycle every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const verse = BIBLE_VERSES[currentIndex] || BIBLE_VERSES[0];

  return (
    <div className="surface-trans-flat w-full px-4 py-3 text-center transition-all duration-700">
      <div
        className={`transition-all duration-500 transform ${
          fadeState === 'in' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
      >
        <p className="font-serif italic text-sm md:text-base text-amber-100/90 leading-relaxed">
          &ldquo;{verse.text}&rdquo;
        </p>
        <p className="mt-1 font-sans text-[11px] font-semibold tracking-wider text-amber-400/80 uppercase">
          — {verse.reference}
        </p>
      </div>
    </div>
  );
}
