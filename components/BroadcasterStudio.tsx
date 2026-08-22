'use client';

import { useState, useEffect } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useConnectionState,
} from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';

interface BroadcasterStudioProps {
  roomName: string;
}

function MicControlPanel() {
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();
  const connectionState = useConnectionState();
  const [isToggling, setIsToggling] = useState(false);

  const toggleMic = async () => {
    if (!localParticipant || isToggling) return;
    setIsToggling(true);
    try {
      if (isMicrophoneEnabled) {
        await localParticipant.setMicrophoneEnabled(false);
      } else {
        await localParticipant.setMicrophoneEnabled(true);
      }
    } catch (err) {
      console.error('Error toggling mic:', err);
    } finally {
      setIsToggling(false);
    }
  };

  const isConnected = connectionState === ConnectionState.Connected;

  return (
    <div className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl bg-black/40 border border-white/10 text-center">
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
          }`}
        />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          {isConnected ? 'Studio Terhubung ke LiveKit' : 'Menghubungkan ke Studio...'}
        </span>
      </div>

      <button
        onClick={toggleMic}
        disabled={!isConnected || isToggling}
        className={`relative flex items-center justify-center h-24 w-24 rounded-full transition-all duration-300 shadow-2xl active:scale-95 ${
          isMicrophoneEnabled
            ? 'bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-rose-900/60 ring-4 ring-rose-500/30 animate-pulse'
            : 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-amber-950 shadow-amber-500/30 hover:scale-105'
        }`}
      >
        {isMicrophoneEnabled ? (
          <div className="flex flex-col items-center">
            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
            <span className="text-[10px] font-black tracking-widest mt-0.5 uppercase">ON AIR</span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
              <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-1 .9-2.14.9-3.28zm-3-3.88v-.62c0-2.21-1.79-4-4-4S8 4.29 8 6.5v.62l8 8V7.12zM4.41 2.86L3 4.27l6 6V11c0 1.66 1.34 3 3 3 .23 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c1.33-.19 2.53-.78 3.5-1.62l3.24 3.24 1.41-1.41L4.41 2.86z" />
            </svg>
            <span className="text-[10px] font-black tracking-widest mt-0.5 uppercase">MIC OFF</span>
          </div>
        )}
      </button>

      <p className="mt-4 text-xs font-semibold text-slate-300">
        {isMicrophoneEnabled
          ? '🔴 Suara Anda sedang disiarkan langsung ke jemaat.'
          : 'Klik tombol untuk menyalakan mikrofon dan mulai siaran live.'}
      </p>
    </div>
  );
}

export default function BroadcasterStudio({ roomName }: BroadcasterStudioProps) {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOperatorToken = async () => {
      try {
        const res = await fetch(
          `/api/livekit?room=${roomName}&name=Operator-Studio&operator=true`
        );
        if (!res.ok) throw new Error('Gagal membuat token operator LiveKit');
        const data = await res.json();
        setToken(data.token);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error connecting to LiveKit');
      }
    };

    fetchOperatorToken();
  }, [roomName]);

  return (
    <div className="glass-card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div>
          <h3 className="text-lg font-serif font-bold text-white">Studio Mikrofon Penyiar</h3>
          <p className="text-xs text-slate-400">Kontrol siaran suara langsung (LiveKit WebRTC)</p>
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono">
          ROOM: {roomName}
        </span>
      </div>

      {error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center">
          {error}
        </div>
      ) : !token ? (
        <div className="py-12 text-center text-slate-400 text-xs animate-pulse">
          Memuat sesi operator studio...
        </div>
      ) : (
        <LiveKitRoom
          token={token}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || ''}
          connect={true}
          audio={false}
          video={false}
        >
          <MicControlPanel />
          <RoomAudioRenderer />
        </LiveKitRoom>
      )}
    </div>
  );
}
