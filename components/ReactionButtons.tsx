'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface Reaction {
  id: string;
  emoji: string;
  count: number;
}

export default function ReactionButtons() {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Fetch initial reactions
    fetchReactions();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('reactions-changes')
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'reactions'
        },
        (payload) => {
          setReactions((prev) =>
            prev.map((r) =>
              r.id === payload.new.id
                ? { ...r, count: payload.new.count }
                : r
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchReactions = async () => {
    const { data, error } = await supabase
      .from('reactions')
      .select('*')
      .order('emoji');

    if (data && !error) {
      setReactions(data);
    }
  };

  const handleReaction = async (emoji: string) => {
    if (isUpdating) return;

    setIsUpdating(true);

    try {
      const reaction = reactions.find((r) => r.emoji === emoji);
      if (!reaction) return;

      const { error } = await supabase
        .from('reactions')
        .update({ count: reaction.count + 1 })
        .eq('emoji', emoji);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating reaction:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-lg font-bold italic">Berikan Reaksi</h3>
      <div className="flex gap-4">
        {reactions.map((reaction) => (
          <button
            key={reaction.id}
            onClick={() => handleReaction(reaction.emoji)}
            disabled={isUpdating}
            className="flex flex-col items-center gap-2 px-6 py-4 bg-mid-gray border border-gray-700 rounded-lg hover:border-white transition-colors disabled:opacity-50"
          >
            <span className="text-4xl">{reaction.emoji}</span>
            <span className="text-xl font-bold">{reaction.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
