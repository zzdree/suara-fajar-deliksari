'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function PrayerRequestForm() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !message.trim()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const { error } = await supabase
        .from('chats')
        .insert([{ name: name.trim(), message: message.trim() }]);

      if (error) throw error;

      setSubmitStatus('success');
      setName('');
      setMessage('');
      
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (error) {
      console.error('Error submitting prayer:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h3 className="text-xl font-bold italic text-center mb-4">Titip Doa</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Nama Anda"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-4 py-3 bg-mid-gray border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white"
          disabled={isSubmitting}
          maxLength={50}
        />
        <textarea
          placeholder="Tulis permohonan doa Anda..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="px-4 py-3 bg-mid-gray border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white resize-none"
          rows={4}
          disabled={isSubmitting}
          maxLength={500}
        />
        <button
          type="submit"
          disabled={isSubmitting || !name.trim() || !message.trim()}
          className="px-6 py-3 bg-white text-black font-bold italic rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Mengirim...' : 'Kirim Doa'}
        </button>
        
        {submitStatus === 'success' && (
          <p className="text-green-400 text-center text-sm">✓ Doa berhasil dikirim</p>
        )}
        {submitStatus === 'error' && (
          <p className="text-red-400 text-center text-sm">✗ Gagal mengirim, coba lagi</p>
        )}
      </form>
    </div>
  );
}
