'use client';

import { useState, useRef } from 'react';
import { LiveKitRoom, RoomAudioRenderer, useConnectionState } from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';

interface AudioReceiverProps {
  token: string;
  serverUrl: string;
}

function StreamStatusIndicator() {
  const connectionState = useConnectionState();

  if (connectionState === ConnectionState.Connected) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        Siaran Live Terhubung
      </div>
    );
  }

  if (connectionState === ConnectionState.Connecting || connectionState === ConnectionState.Reconnecting) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold animate-pulse">
        Menghubungkan ke Studio...
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs font-semibold">
      Standby
    </div>
  );
}

export default function AudioReceiver({ token, serverUrl }: AudioReceiverProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState<number>(85);
  const [isMuted, setIsMuted] = useState(false);
  const prevVolumeRef = useRef<number>(85);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (val > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(prevVolumeRef.current || 85);
    } else {
      prevVolumeRef.current = volume;
      setIsMuted(true);
      setVolume(0);
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-8 text-center relative overflow-hidden group">
      {/* Ambient background glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Top Status */}
        <div className="flex items-center justify-between w-full mb-6">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
              LIVE RADIO
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">WebRTC HD Audio</span>
          </div>
          {isPlaying && <StreamStatusIndicator />}
        </div>

        {/* Radio Title & Visualizer */}
        <div className="my-3 flex flex-col items-center">
          <div className="h-16 flex items-center justify-center gap-1.5 my-2">
            {isPlaying ? (
              <>
                <span className="w-1.5 rounded-full bg-gradient-to-t from-amber-600 to-amber-300 wave-bar-1" />
                <span className="w-1.5 rounded-full bg-gradient-to-t from-amber-600 to-amber-300 wave-bar-2" />
                <span className="w-1.5 rounded-full bg-gradient-to-t from-amber-600 to-amber-300 wave-bar-3" />
                <span className="w-1.5 rounded-full bg-gradient-to-t from-amber-600 to-amber-300 wave-bar-4" />
                <span className="w-1.5 rounded-full bg-gradient-to-t from-amber-600 to-amber-300 wave-bar-2" />
                <span className="w-1.5 rounded-full bg-gradient-to-t from-amber-600 to-amber-300 wave-bar-1" />
                <span className="w-1.5 rounded-full bg-gradient-to-t from-amber-600 to-amber-300 wave-bar-3" />
              </>
            ) : (
              <div className="flex items-center gap-1.5 opacity-30">
                <span className="w-1.5 h-2 rounded-full bg-slate-500" />
                <span className="w-1.5 h-3 rounded-full bg-slate-500" />
                <span className="w-1.5 h-4 rounded-full bg-slate-500" />
                <span className="w-1.5 h-2 rounded-full bg-slate-500" />
                <span className="w-1.5 h-3 rounded-full bg-slate-500" />
              </div>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
            Siaran Fajar GIA Deliksari
          </h2>
          <p className="text-sm text-slate-300/80 mt-1 max-w-sm">
            {isPlaying
              ? 'Mendengarkan siaran langsung firman & doa pagi'
              : 'Tekan tombol di bawah untuk menyalakan siaran audio'}
          </p>
        </div>

        {/* Big Play / Pause Button */}
        <div className="my-6">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Hentikan Audio' : 'Dengarkan Siaran Live'}
            className={`relative flex items-center justify-center h-20 w-20 rounded-full transition-all duration-300 active:scale-95 shadow-2xl ${
              isPlaying
                ? 'bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-rose-900/50 hover:brightness-110'
                : 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-amber-950 shadow-amber-500/30 hover:scale-105 hover:shadow-amber-500/50'
            }`}
          >
            {isPlaying ? (
              // Pause Icon
              <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1.5" />
                <rect x="14" y="4" width="4" height="16" rx="1.5" />
              </svg>
            ) : (
              // Play Icon
              <svg className="w-9 h-9 fill-current ml-1" viewBox="0 0 24 24">
                <path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86a1 1 0 00-1.5.86z" />
              </svg>
            )}
          </button>
        </div>

        {/* Volume Controls */}
        <div className="w-full max-w-xs flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-black/30 border border-white/5">
          <button
            onClick={toggleMute}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <svg className="w-5 h-5 fill-current text-rose-400" viewBox="0 0 24 24">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            ) : volume < 50 ? (
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            )}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="dawn-slider flex-1"
            aria-label="Volume"
          />
          <span className="text-xs font-mono text-slate-400 w-8 text-right">
            {volume}%
          </span>
        </div>

        {/* LiveKit Connection Engine */}
        {isPlaying && token && (
          <LiveKitRoom
            token={token}
            serverUrl={serverUrl}
            connect={true}
            audio={true}
            video={false}
          >
            <RoomAudioRenderer volume={volume / 100} />
          </LiveKitRoom>
        )}
      </div>
    </div>
  );
}
