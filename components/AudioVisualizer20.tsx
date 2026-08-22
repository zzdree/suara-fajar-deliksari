'use client';

import React, { useEffect, useState } from 'react';

interface AudioVisualizer20Props {
  isActive: boolean;
  barCount?: number;
  analyser?: AnalyserNode | null;
}

export function AudioVisualizer20({
  isActive,
  barCount = 20,
  analyser = null,
}: AudioVisualizer20Props) {
  const [realLevels, setRealLevels] = useState<number[]>([]);

  useEffect(() => {
    if (!isActive || !analyser) {
      setRealLevels([]);
      return;
    }

    let animationFrameId: number;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateLevels = () => {
      analyser.getByteFrequencyData(dataArray);

      // Sample barCount frequency buckets
      const step = Math.floor(bufferLength / barCount);
      const sampled: number[] = [];
      for (let i = 0; i < barCount; i++) {
        const val = dataArray[i * step] || 0;
        sampled.push(val / 255); // 0 to 1
      }
      setRealLevels(sampled);
      animationFrameId = requestAnimationFrame(updateLevels);
    };

    updateLevels();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isActive, analyser, barCount]);

  const hasRealLevels = realLevels.length === barCount && realLevels.some((v) => v > 0.05);

  const bars = Array.from({ length: barCount }, (_, i) => {
    const centerDist = Math.abs(i - barCount / 2) / (barCount / 2);
    const animIndex = (i % 4) + 1;
    const idleHeight = Math.max(4, Math.round(14 - centerDist * 8));

    let height = `${idleHeight}px`;
    if (isActive) {
      if (hasRealLevels) {
        const dynamicH = Math.max(4, Math.round(realLevels[i] * 48));
        height = `${dynamicH}px`;
      }
    }

    return {
      id: i,
      animClass: !hasRealLevels && isActive ? `wave-bar-${animIndex}` : '',
      height,
    };
  });

  return (
    <div className="surface-trans-flat flex h-14 w-full items-center justify-center gap-1.5 px-3 py-2">
      {bars.map((bar) => (
        <div
          key={bar.id}
          className={`w-1 rounded-full transition-all duration-75 ${
            isActive
              ? `bg-gradient-to-t from-amber-500 via-amber-300 to-amber-500 ${bar.animClass} shadow-[0_0_8px_rgba(245,158,11,0.5)]`
              : 'bg-white/10'
          }`}
          style={{
            height: bar.height,
          }}
        />
      ))}
    </div>
  );
}
