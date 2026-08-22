'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { AppState, ChatMessage } from '@/lib/types';
import { ProgramView169 } from '@/components/ProgramView169';
import AudioReceiver from '@/components/AudioReceiver';
import { TikTokChatbox } from '@/components/TikTokChatbox';
import { StreamFloatingActions } from '@/components/StreamFloatingActions';
import { BibleTicker } from '@/components/BibleTicker';
import LiveListenerCounter from '@/components/LiveListenerCounter';

export default function StreamPage() {
  const [token, setToken] = useState<string | null>(null);
  const [appState, setAppState] = useState<AppState | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [salamCount, setSalamCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch LiveKit Token for listener
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const roomName = process.env.NEXT_PUBLIC_ROOM_NAME || 'suara-fajar-deliksari';
        const participantName = `jemaat-${Math.random().toString(36).substring(2, 8)}`;
        const res = await fetch(`/api/livekit?room=${roomName}&name=${participantName}&operator=false`);
        if (res.ok) {
          const data = await res.json();
          setToken(data.token);
        }
      } catch (err) {
        console.error('Failed to get livekit token:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchToken();
  }, []);

  // 2. Fetch initial data and subscribe to Supabase Realtime
  useEffect(() => {
    // Initial fetch of app_state
    supabase
      .from('app_state')
      .select('*')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (data) setAppState(data as AppState);
      });

    // Initial fetch of chats (limit 20)
    supabase
      .from('chats')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(20)
      .then(({ data }) => {
        if (data) setMessages(data as ChatMessage[]);
      });

    // Initial fetch of reactions (Suka 👍 and Salam 🕊️)
    supabase
      .from('reactions')
      .select('*')
      .then(({ data }) => {
        if (data) {
          data.forEach((r) => {
            if (r.emoji === '👍') setLikeCount(r.count || 0);
            if (r.emoji === '🕊️') setSalamCount(r.count || 0);
          });
        }
      });

    // Realtime Subscriptions
    const stateChannel = supabase
      .channel('stream_app_state')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_state', filter: 'id=eq.1' },
        (payload) => {
          if (payload.new) setAppState(payload.new as AppState);
        }
      )
      .subscribe();

    const chatChannel = supabase
      .channel('stream_chats')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chats' },
        (payload) => {
          if (payload.new) {
            setMessages((prev) => [...prev, payload.new as ChatMessage]);
          }
        }
      )
      .subscribe();

    const reactChannel = supabase
      .channel('stream_reactions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reactions' },
        (payload) => {
          if (payload.new && typeof payload.new === 'object' && 'emoji' in payload.new) {
            const row = payload.new as { emoji: string; count: number };
            if (row.emoji === '👍') setLikeCount(row.count);
            if (row.emoji === '🕊️') setSalamCount(row.count);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(stateChannel);
      supabase.removeChannel(chatChannel);
      supabase.removeChannel(reactChannel);
    };
  }, []);

  // 3. Handle Reaction Click
  const handleReact = async (emoji: string) => {
    // Optimistic UI
    if (emoji === '👍') setLikeCount((prev) => prev + 1);
    if (emoji === '🕊️') setSalamCount((prev) => prev + 1);

    const current = emoji === '👍' ? likeCount : salamCount;
    await supabase
      .from('reactions')
      .upsert({
        emoji,
        label: emoji === '👍' ? 'Suka' : 'Salam',
        count: current + 1,
        reset_date: new Date().toISOString().split('T')[0],
      });
  };

  // 4. Handle Comment Submit
  const handleSendComment = async (name: string, message: string) => {
    const initial = name.charAt(0).toUpperCase() || 'J';
    await supabase.from('chats').insert({
      initial,
      name,
      message,
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between max-w-xl mx-auto p-4 sm:p-6 space-y-6">
      {/* ── Header (No Admin Button) ──────────────────────────────── */}
      <header className="text-center pt-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <span className="text-[11px] font-sans font-semibold tracking-wider text-amber-300 uppercase">
              GIA Deliksari
            </span>
          </div>
          <LiveListenerCounter />
        </div>

        <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-white">
          Suara Fajar Deliksari
        </h1>
        <p className="text-sm font-serif italic text-amber-300/90 mt-0.5">
          &ldquo;Worship and Morning Prayer&rdquo;
        </p>
      </header>

      {/* ── Program View 16:9 (Absolute Mirroring of Admin Control) ── */}
      <section aria-label="Program View">
        <ProgramView169 appState={appState} isStreamPage={true} />
      </section>

      {/* ── Main Audio Receiver & Action Button ─────────────────────── */}
      <section aria-label="Pemutar Audio Live">
        {isLoading ? (
          <div className="glass-panel p-8 text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-amber-400 border-r-transparent mb-2" />
            <p className="text-xs text-white/70">Menghubungkan ke studio siaran...</p>
          </div>
        ) : token ? (
          <AudioReceiver
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || ''}
            isLive={appState?.is_live ?? true}
          />
        ) : (
          <div className="glass-panel p-6 text-center border-rose-500/30">
            <p className="text-rose-400 text-xs font-semibold">Gagal memuat token audio.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-trans text-xs mt-3 px-3 py-1.5"
            >
              Muat Ulang
            </button>
          </div>
        )}
      </section>

      {/* ── TikTok-Style Live Chatbox View (Stacked max 6, no input) ─── */}
      <section aria-label="Live Chat" className="glass-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-white/60">
            Dinding Pesan & Doa
          </span>
          <span className="text-[10px] text-amber-300/80 font-mono">
            {messages.length} doa masuk
          </span>
        </div>
        <TikTokChatbox messages={messages} isAdmin={false} />
      </section>

      {/* ── 4 Floating Interaction Buttons ─────────────────────────── */}
      <section aria-label="Interaksi Jemaat">
        <StreamFloatingActions
          onReact={handleReact}
          onSendComment={handleSendComment}
          likeCount={likeCount}
          salamCount={salamCount}
        />
      </section>

      {/* ── Bible Verse Ticker ──────────────────────────────────────── */}
      <section aria-label="Ayat Alkitab Harian" className="pt-2">
        <BibleTicker />
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="dawn-divider pt-4 text-center text-[11px] text-white/40">
        <p>Multimedia GIA Deliksari Semarang · 2026</p>
      </footer>
    </div>
  );
}
