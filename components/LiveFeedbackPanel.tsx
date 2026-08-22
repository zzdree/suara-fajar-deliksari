'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface Chat {
  id: string;
  created_at: string;
  initial?: string;
  name: string;
  message: string;
}

interface Reaction {
  emoji: string;
  label?: string;
  count: number;
}

export default function LiveFeedbackPanel() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [prayedIds, setPrayedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchChats();
    fetchReactions();

    const chatsChannel = supabase
      .channel('admin:chats')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chats' },
        (payload) => {
          setChats((prev) => [payload.new as Chat, ...prev]);
        }
      )
      .subscribe();

    const reactionsChannel = supabase
      .channel('admin:reactions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reactions' },
        (payload) => {
          if (payload.new && typeof payload.new === 'object' && 'emoji' in payload.new) {
            const updated = payload.new as Reaction;
            setReactions((prev) =>
              prev.map((r) =>
                r.emoji === updated.emoji ? { ...r, count: Number(updated.count || 0) } : r
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatsChannel);
      supabase.removeChannel(reactionsChannel);
    };
  }, []);

  const fetchChats = async () => {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    if (data && !error) {
      setChats(data);
    }
  };

  const fetchReactions = async () => {
    const { data, error } = await supabase.from('reactions').select('*');
    if (data && !error) {
      setReactions(data);
    }
  };

  const togglePrayed = (id: string) => {
    setPrayedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* ── Left: Prayer Requests Monitor (8 cols) ────────────────── */}
      <div className="lg:col-span-8 glass-card p-5 sm:p-6 flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div>
            <h3 className="text-lg font-serif font-bold text-white">
              Daftar Permohonan Doa Jemaat
            </h3>
            <p className="text-xs text-slate-400">
              Update real-time saat jemaat mengirimkan pokok doa
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {chats.length} Pokok Doa
          </span>
        </div>

        <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
          {chats.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              Belum ada permohonan doa yang masuk.
            </div>
          ) : (
            chats.map((chat) => {
              const isPrayed = prayedIds.has(chat.id);
              return (
                <div
                  key={chat.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isPrayed
                      ? 'bg-emerald-950/20 border-emerald-500/30 opacity-70'
                      : 'bg-black/30 border-white/10 hover:border-amber-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-amber-950 font-bold text-xs">
                        {chat.initial || chat.name?.charAt(0)?.toUpperCase() || 'J'}
                      </span>
                      <span className="font-bold text-sm text-white">{chat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400">
                        {new Date(chat.created_at).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <button
                        onClick={() => togglePrayed(chat.id)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                          isPrayed
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                        }`}
                      >
                        {isPrayed ? '✓ Sudah Didoakan' : 'Tandai Didoakan'}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 pl-9 leading-relaxed">
                    {chat.message}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right: Live Faith Reactions Monitor (4 cols) ─────────── */}
      <div className="lg:col-span-4 space-y-6">
        <div className="glass-card p-5 sm:p-6">
          <h3 className="text-lg font-serif font-bold text-white mb-1">
            Akumulasi Reaksi
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Total respon amin & doa jemaat
          </p>

          <div className="grid grid-cols-2 gap-3">
            {reactions.map((r) => (
              <div
                key={r.emoji}
                className="p-3.5 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{r.emoji}</span>
                  <span className="text-xs font-semibold text-slate-300">
                    {r.label || r.emoji}
                  </span>
                </div>
                <span className="text-lg font-mono font-bold text-amber-400">
                  {r.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5 border-amber-500/20 bg-amber-500/[0.03]">
          <h4 className="text-sm font-bold text-amber-300 mb-1">💡 Tips Pelayanan Siaran</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Bacakan pokok doa jemaat saat sesi doa syafaat fajar. Klik &ldquo;Tandai Didoakan&rdquo; untuk memudahkan tracking doa yang sudah dibacakan on-air.
          </p>
        </div>
      </div>
    </div>
  );
}
