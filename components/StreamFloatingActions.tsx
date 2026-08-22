'use client';

import React, { useState } from 'react';

interface StreamFloatingActionsProps {
  onReact: (emoji: string) => void;
  onSendComment: (name: string, message: string) => Promise<void> | void;
  likeCount: number;
  salamCount: number;
}

interface FloatingItem {
  id: number;
  emoji: string;
  left: number;
}

export function StreamFloatingActions({
  onReact,
  onSendComment,
  likeCount,
  salamCount,
}: StreamFloatingActionsProps) {
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentName, setCommentName] = useState('');
  const [commentMessage, setCommentMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [floatingParticles, setFloatingParticles] = useState<FloatingItem[]>([]);

  const triggerReaction = (emoji: string) => {
    onReact(emoji);
    const newId = Date.now() + Math.random();
    const randomLeft = 20 + Math.random() * 60; // 20% to 80%

    setFloatingParticles((prev) => [...prev, { id: newId, emoji, left: randomLeft }]);

    setTimeout(() => {
      setFloatingParticles((prev) => prev.filter((p) => p.id !== newId));
    }, 1600);
  };

  const handleShare = async () => {
    const url = window.location.origin;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Suara Fajar Deliksari',
          text: 'Mari bergabung dalam Ibadah dan Doa Fajar GIA Deliksari Semarang 🌅',
          url,
        });
        return;
      } catch {
        // User cancelled or not supported
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentMessage.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const finalName = commentName.trim() || 'Jemaat';
      await onSendComment(finalName, commentMessage.trim());
      setCommentMessage('');
      setShowCommentModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Particles Area */}
      <div className="fixed bottom-24 right-6 pointer-events-none z-50 h-48 w-32 overflow-hidden">
        {floatingParticles.map((p) => (
          <div
            key={p.id}
            className="animate-float-burst absolute text-3xl select-none"
            style={{ left: `${p.left}%`, bottom: '0px' }}
          >
            {p.emoji}
          </div>
        ))}
      </div>

      {/* Floating Interaction Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {/* Suka 👍 */}
        <button
          onClick={() => triggerReaction('👍')}
          className="btn-trans flex items-center gap-2 px-4 py-2.5 hover:border-amber-400/40 group"
          title="Kirim Suka"
        >
          <span className="text-xl group-hover:scale-125 transition-transform duration-200">👍</span>
          <span className="text-xs font-semibold text-white/90">Suka</span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-mono text-amber-300">
            {likeCount}
          </span>
        </button>

        {/* Salam 🕊️ */}
        <button
          onClick={() => triggerReaction('🕊️')}
          className="btn-trans flex items-center gap-2 px-4 py-2.5 hover:border-amber-400/40 group"
          title="Kirim Salam Damai"
        >
          <span className="text-xl group-hover:scale-125 transition-transform duration-200">🕊️</span>
          <span className="text-xs font-semibold text-white/90">Salam</span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-mono text-amber-300">
            {salamCount}
          </span>
        </button>

        {/* Komentar Modal Trigger 💬 */}
        <button
          onClick={() => setShowCommentModal(true)}
          className="btn-trans flex items-center gap-2 px-4 py-2.5 hover:border-amber-400/40 group"
          title="Tulis Pokok Doa/Komentar"
        >
          <span className="text-xl group-hover:scale-125 transition-transform duration-200">💬</span>
          <span className="text-xs font-semibold text-white/90">Komentar</span>
        </button>

        {/* Bagikan ↗️ */}
        <button
          onClick={handleShare}
          className="btn-trans flex items-center gap-2 px-4 py-2.5 hover:border-amber-400/40 group"
          title="Bagikan Tautan Siaran"
        >
          <span className="text-xl group-hover:scale-125 transition-transform duration-200">↗️</span>
          <span className="text-xs font-semibold text-white/90">
            {copyFeedback ? 'Tersalin!' : 'Bagikan'}
          </span>
        </button>
      </div>

      {/* Modal Komentar / Titip Doa */}
      {showCommentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md p-6 border border-white/15 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-serif text-xl font-bold text-white mb-1">
              Kirim Pesan & Pokok Doa
            </h3>
            <p className="text-xs text-white/60 mb-4">
              Pesan dan doa akan tampil di layar dan monitor doa fajar.
            </p>

            <form onSubmit={handleSubmitComment} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5">
                  Nama Jemaat <span className="text-white/40 font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  placeholder="Contoh: Maria / Anonim"
                  className="dawn-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5">
                  Pesan / Pokok Doa <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={commentMessage}
                  onChange={(e) => setCommentMessage(e.target.value)}
                  placeholder="Tuliskan pokok doa atau ucapan syukur..."
                  rows={3}
                  required
                  className="dawn-input text-sm resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCommentModal(false)}
                  disabled={isSubmitting}
                  className="btn-red px-4 py-2.5 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!commentMessage.trim() || isSubmitting}
                  className="btn-gold px-5 py-2.5 text-xs font-bold"
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
