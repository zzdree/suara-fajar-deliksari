'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface ReactionItem {
  emoji: string;
  label: string;
  count: number;
}

interface FloatingParticle {
  id: number;
  emoji: string;
  x: number;
}

const DEFAULT_REACTIONS: ReactionItem[] = [
  { emoji: '🙏', label: 'Amin', count: 0 },
  { emoji: '❤️', label: 'Kasih', count: 0 },
  { emoji: '🕊️', label: 'Damai', count: 0 },
  { emoji: '✝️', label: 'Syukur', count: 0 },
];

export default function ReactionButtons() {
  const [reactions, setReactions] = useState<ReactionItem[]>(DEFAULT_REACTIONS);
  const [particles, setParticles] = useState<FloatingParticle[]>([]);

  useEffect(() => {
    const fetchReactions = async () => {
      const { data, error } = await supabase
        .from('reactions')
        .select('*');

      if (data && !error && data.length > 0) {
        // Merge with default list to ensure all 4 emojis exist
        const dbItems = data as ReactionItem[];
        const merged = DEFAULT_REACTIONS.map((def) => {
          const found = dbItems.find((d) => d.emoji === def.emoji);
          return found ? { ...def, count: Number(found.count || 0) } : def;
        });
        setReactions(merged);
      }
    };

    fetchReactions();

    // Subscribe to realtime updates on reactions table
    const channel = supabase
      .channel('public:reactions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reactions' },
        (payload) => {
          if (payload.new && typeof payload.new === 'object' && 'emoji' in payload.new) {
            const updated = payload.new as ReactionItem;
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
      supabase.removeChannel(channel);
    };
  }, []);

  const handleReaction = async (emoji: string, e: React.MouseEvent<HTMLButtonElement>) => {
    // 1. Spawn floating particle effect
    const rect = e.currentTarget.getBoundingClientRect();
    const particleId = Date.now() + Math.random();
    setParticles((prev) => [
      ...prev,
      { id: particleId, emoji, x: rect.left + rect.width / 2 - 12 },
    ]);

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== particleId));
    }, 1600);

    // 2. Optimistic UI update
    const current = reactions.find((r) => r.emoji === emoji);
    const newCount = (current?.count || 0) + 1;
    setReactions((prev) =>
      prev.map((r) => (r.emoji === emoji ? { ...r, count: newCount } : r))
    );

    // 3. Upsert to Supabase
    try {
      await supabase
        .from('reactions')
        .upsert(
          {
            emoji,
            label: current?.label || 'Reaksi',
            count: newCount,
          },
          { onConflict: 'emoji' }
        );
    } catch (err) {
      console.warn('Error updating reaction:', err);
    }
  };

  return (
    <div className="glass-card p-5 sm:p-6 relative">
      <div className="text-center mb-4">
        <h3 className="text-base sm:text-lg font-serif font-bold text-white">
          Kirim Reaksi & Amin Doa
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Sentuh emoji untuk mengaminkan ibadah fajar bersama
        </p>
      </div>

      {/* Floating particles container */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {particles.map((p) => (
          <span
            key={p.id}
            style={{ left: `${p.x}px`, bottom: '150px' }}
            className="fixed text-3xl animate-float-burst"
          >
            {p.emoji}
          </span>
        ))}
      </div>

      {/* Reaction Buttons Grid */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-sm mx-auto">
        {reactions.map((reaction) => (
          <button
            key={reaction.emoji}
            onClick={(e) => handleReaction(reaction.emoji, e)}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-black/30 border border-white/10 hover:border-amber-500/40 hover:bg-amber-500/10 active:scale-90 transition-all duration-150 group shadow-md"
          >
            <span className="text-2xl sm:text-3xl group-hover:scale-125 transition-transform duration-200">
              {reaction.emoji}
            </span>
            <span className="text-[11px] font-bold text-slate-300 mt-1">
              {reaction.label}
            </span>
            <span className="text-[10px] font-mono font-bold text-amber-400 bg-white/5 px-2 py-0.5 rounded-full mt-0.5">
              {reaction.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
