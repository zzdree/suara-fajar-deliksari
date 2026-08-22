'use client';

import React, { useState } from 'react';
import { ChatMessage } from '@/lib/types';

interface TikTokChatboxProps {
  messages: ChatMessage[];
  isAdmin?: boolean;
  onSendMessage?: (name: string, message: string) => Promise<void> | void;
}

export function TikTokChatbox({ messages, isAdmin = false, onSendMessage }: TikTokChatboxProps) {
  const [adminMessage, setAdminMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Take the last 6 messages
  const displayMessages = messages.slice(-6);

  const getOpacityClass = (index: number, total: number) => {
    const reverseIndex = total - 1 - index; // 0 is newest (bottom)
    if (reverseIndex < 4) return 'opacity-100';
    if (reverseIndex === 4) return 'opacity-[0.67]';
    return 'opacity-[0.33]';
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminMessage.trim() || isSending || !onSendMessage) return;

    setIsSending(true);
    try {
      await onSendMessage('Admin', adminMessage.trim());
      setAdminMessage('');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Message List (TikTok Style Stack) */}
      <div className="flex flex-col justify-end gap-2 min-h-[220px] overflow-hidden">
        {displayMessages.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-xs font-light text-white/40 italic">
            belum ada komentar
          </div>
        ) : (
          displayMessages.map((msg, idx) => {
            const timeStr = msg.created_at
              ? new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
              : '';

            return (
              <div
                key={msg.id || idx}
                className={`flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] p-2.5 backdrop-blur-md transition-all duration-300 ${getOpacityClass(
                  idx,
                  displayMessages.length
                )}`}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-rose-700 text-xs font-bold text-white shadow-sm">
                  {msg.initial || msg.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-xs font-semibold text-amber-300/90">
                      {msg.name}
                    </span>
                    {timeStr && (
                      <span className="text-[10px] text-white/40 font-mono">
                        {timeStr}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-white/90 break-words leading-relaxed">
                    {msg.message}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Admin Quick Send Input */}
      {isAdmin && onSendMessage && (
        <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-white/10">
          <input
            type="text"
            value={adminMessage}
            onChange={(e) => setAdminMessage(e.target.value)}
            placeholder="Tulis pesan sebagai Admin..."
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2 text-xs text-white placeholder-white/40 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
          />
          <button
            type="submit"
            disabled={!adminMessage.trim() || isSending}
            className="btn-gold px-4 py-2 text-xs font-bold shrink-0"
          >
            {isSending ? '...' : 'Kirim'}
          </button>
        </form>
      )}
    </div>
  );
}
