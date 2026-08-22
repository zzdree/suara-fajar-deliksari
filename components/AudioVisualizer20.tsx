'use client';

import React from 'react';

interface AudioVisualizer20Props {
  isActive: boolean;
  barCount?: number;
}

export function AudioVisualizer20({ isActive, barCount = 20 }: AudioVisualizer20Props) {
  // Pre-generate pseudo-random heights or animation classes for the 20 bars
  const bars = Array.from({ length: barCount }, (_, i) => {
    // Wave symmetry from center
    const centerDist = Math.abs(i - barCount / 2) / (barCount / 2);
    const animIndex = (i % 4) + 1;
    return {
      id: i,
      animClass: `wave-bar-${animIndex}`,
      idleHeight: `${Math.max(4, Math.round(14 - centerDist * 8))}px`,
    };
  });

  return (
    <div className="surface-trans-flat flex h-14 w-full items-center justify-center gap-1.5 px-3 py-2">
      {bars.map((bar) => (
        <div
          key={bar.id}
          className={`w-1 rounded-full transition-all duration-300 ${
            isActive
              ? `bg-gradient-to-t from-amber-500 via-amber-300 to-amber-500 ${bar.animClass} shadow-[0_0_8px_rgba(245,158,11,0.5)]`
              : 'bg-white/10'
          }`}
          style={{
            height: isActive ? undefined : bar.idleHeight,
          }}
        />
      ))}
    </div>
  );
}
