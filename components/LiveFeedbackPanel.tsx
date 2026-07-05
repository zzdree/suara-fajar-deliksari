'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface Chat {
  id: string;
  created_at: string;
  name: string;
  message: string;
}

interface Reaction {
  id: string;
  emoji: string;
  count: number;
}

export default function LiveFeedbackPanel() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);

  useEffect(() => {
    // Fetch initial data
    fetchChats();
    fetchReactions();

    // Subscribe to new chats
    const chatsChannel = supabase
      .channel('chats-changes')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chats'
        },
        (payload) => {
          setChats((prev) => [payload.new as Chat, ...prev]);
        }
      )
      .subscribe();

    // Subscribe to reaction updates
    const reactionsChannel = supabase
      .channel('reactions-changes-operator')
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
      supabase.removeChannel(chatsChannel);
      supabase.removeChannel(reactionsChannel);
    };
  }, []);

  const fetchChats = async () => {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (data && !error) {
      setChats(data);
    }
  };

  const fetchReactions = async () => {
    const { data, error } = await supabase
      .from('reactions')
      .select('*')
      .order('emoji');

    if (data && !error) {
      setReactions(data);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
      {/* Prayer Requests Panel */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold italic text-center">Permohonan Doa Terbaru</h3>
        <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
          {chats.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada permohonan doa</p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className="p-4 bg-mid-gray border border-gray-700 rounded-lg"
              >
                <p className="font-bold text-sm text-gray-400 mb-1">
                  {new Date(chat.created_at).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="font-bold mb-2">{chat.name}</p>
                <p className="text-sm text-gray-300">{chat.message}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reactions Panel */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold italic text-center">Statistik Reaksi</h3>
        <div className="flex flex-col gap-3">
          {reactions.map((reaction) => (
            <div
              key={reaction.id}
              className="flex items-center justify-between p-4 bg-mid-gray border border-gray-700 rounded-lg"
            >
              <span className="text-4xl">{reaction.emoji}</span>
              <span className="text-3xl font-bold">{reaction.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
