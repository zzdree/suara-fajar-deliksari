'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

interface PrayerMessage {
  id: string;
  created_at: string;
  initial: string;
  name: string;
  message: string;
}

export default function PrayerSection() {
  const [activeTab, setActiveTab] = useState<'form' | 'wall'>('wall');
  const [prayers, setPrayers] = useState<PrayerMessage[]>([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Load saved name
  useEffect(() => {
    try {
      const savedName = localStorage.getItem('sfd_user_name');
      if (savedName) setName(savedName);
    } catch {}
  }, []);

  // Fetch and subscribe to prayers
  useEffect(() => {
    const fetchPrayers = async () => {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (data && !error) {
        setPrayers(data);
      }
    };

    fetchPrayers();

    const channel = supabase
      .channel('public:chats')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chats' },
        (payload) => {
          setPrayers((prev) => [payload.new as PrayerMessage, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setStatus('idle');

    try {
      const trimmedName = name.trim();
      const trimmedMessage = message.trim();
      const initial = trimmedName.charAt(0).toUpperCase() || 'J';

      // Save name for convenience
      try {
        localStorage.setItem('sfd_user_name', trimmedName);
      } catch {}

      const { error } = await supabase.from('chats').insert([
        {
          initial,
          name: trimmedName,
          message: trimmedMessage,
        },
      ]);

      if (error) throw error;

      setStatus('success');
      setMessage('');
      setActiveTab('wall'); // switch to wall so user sees their prayer immediately

      setTimeout(() => setStatus('idle'), 4000);
    } catch (err) {
      console.error('Error submitting prayer:', err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card p-5 sm:p-7">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
            Persekutuan Doa Fajar
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Saling menopang dalam doa dan permohonan syafaat
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/10">
          <button
            onClick={() => setActiveTab('wall')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'wall'
                ? 'bg-amber-500 text-amber-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dinding Doa ({prayers.length})
          </button>
          <button
            onClick={() => setActiveTab('form')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'form'
                ? 'bg-amber-500 text-amber-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ✍️ Titip Doa
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-5">
        {activeTab === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nama Jemaat / Inisial
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Ibu Maria / Bpk. Yohanes"
                maxLength={50}
                required
                disabled={isSubmitting}
                className="dawn-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Pokok Permohonan Doa
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tuliskan pokok doa Anda (kesehatan, keluarga, pekerjaan, ucapan syukur)..."
                rows={3}
                maxLength={500}
                required
                disabled={isSubmitting}
                className="dawn-input text-sm resize-none"
              />
            </div>

            {status === 'success' && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium text-center">
                ✓ Pokok doa Anda berhasil dikirim ke studio siaran
              </div>
            )}

            {status === 'error' && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium text-center">
                ✗ Gagal mengirim doa. Pastikan koneksi internet aktif lalu coba lagi.
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !name.trim() || !message.trim()}
              className="dawn-btn-primary w-full"
            >
              {isSubmitting ? 'Mengirim Pokok Doa...' : 'Kirim Pokok Doa'}
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            {prayers.length === 0 ? (
              <div className="text-center py-10 px-4">
                <p className="text-3xl mb-2">🕊️</p>
                <p className="text-sm font-serif text-slate-300">Belum ada pokok doa pagi ini.</p>
                <p className="text-xs text-slate-500 mt-1">Jadilah yang pertama menitipkan pokok doa.</p>
                <button
                  onClick={() => setActiveTab('form')}
                  className="dawn-btn-secondary mt-4 text-xs py-2"
                >
                  Tulis Pokok Doa Sekarang
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {prayers.map((prayer) => (
                  <div
                    key={prayer.id}
                    className="p-3.5 rounded-xl bg-black/25 border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-amber-950 text-xs font-bold font-mono">
                          {prayer.initial || prayer.name?.charAt(0)?.toUpperCase() || 'J'}
                        </span>
                        <span className="text-xs font-bold text-slate-200">
                          {prayer.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        {new Date(prayer.created_at).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed pl-8">
                      {prayer.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
