'use client';

import React, { useRef, useEffect } from 'react';
import { AppState } from '@/lib/types';

interface ProgramView169Props {
  appState: AppState | null;
  className?: string;
  isStreamPage?: boolean;
  cameraStream?: MediaStream | null;
}

export function ProgramView169({
  appState,
  className = '',
  isStreamPage = false,
  cameraStream = null,
}: ProgramView169Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // If blackout is ON, or neither YouTube nor Camera is ON
  const isBlackout = appState?.blackout_on || false;
  const isYouTubeOn = appState?.youtube_on && Boolean(appState?.current_youtube_id);
  const isCameraOn = appState?.camera_on || false;
  const isLive = appState?.is_live || false;

  const showYouTube = !isBlackout && isYouTubeOn;
  const showCamera = !isBlackout && !isYouTubeOn && isCameraOn;
  const showNoSignal = isBlackout || (!showYouTube && !showCamera);

  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, showCamera]);

  return (
    <div className={`surface-16-9 ${className}`}>
      {/* 1. YouTube Active */}
      {showYouTube && appState?.current_youtube_id && (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${appState.current_youtube_id}?autoplay=1&mute=0&controls=0&modestbranding=1&rel=0&playsinline=1`}
          title={appState.current_youtube_title || 'YouTube Live Media'}
          className="absolute inset-0 h-full w-full border-0 pointer-events-none"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}

      {/* 2. Real Camera Stream Active */}
      {showCamera && (
        <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden">
          {cameraStream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover -scale-x-100"
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 animate-pulse text-2xl">
                📹
              </div>
              <span className="mt-2 text-xs font-semibold text-emerald-300">
                Kamera Studio On-Air
              </span>
            </div>
          )}
        </div>
      )}

      {/* 3. No Signal / Blackout / Idle State */}
      {showNoSignal && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-white/30 animate-ping" />
            <span className="font-mono text-sm tracking-widest text-white/40 uppercase">
              {isBlackout ? 'blackout mode' : isLive ? 'live audio only' : 'no signal'}
            </span>
          </div>
          {isStreamPage && (
            <p className="mt-2 text-xs text-white/30 font-light">
              GIA Deliksari — Suara Fajar
            </p>
          )}
        </div>
      )}

      {/* Top Indicators Overlay */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase backdrop-blur-md ${
              isLive
                ? 'bg-rose-600/80 text-white shadow-sm shadow-rose-600/50'
                : 'bg-white/10 text-white/60'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isLive ? 'bg-white animate-pulse' : 'bg-white/40'}`} />
            {isLive ? 'ON AIR' : 'STANDBY'}
          </span>
        </div>

        {appState?.current_youtube_title && showYouTube && (
          <div className="max-w-[60%] truncate rounded-md bg-black/60 px-2.5 py-0.5 text-[11px] font-medium text-amber-200 backdrop-blur-md">
            {appState.current_youtube_title}
          </div>
        )}
      </div>
    </div>
  );
}
