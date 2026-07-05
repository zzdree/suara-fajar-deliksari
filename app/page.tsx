'use client';

import { useEffect, useState } from 'react';
import AudioReceiver from '@/components/AudioReceiver';
import PrayerRequestForm from '@/components/PrayerRequestForm';
import ReactionButtons from '@/components/ReactionButtons';

export default function AudiencePage() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Generate LiveKit token for audience
    const generateToken = async () => {
      try {
        const roomName = process.env.NEXT_PUBLIC_ROOM_NAME || 'suara-fajar-deliksari';
        const participantName = `listener-${Math.random().toString(36).substring(7)}`;
        
        const response = await fetch(
          `/api/livekit?room=${roomName}&name=${participantName}&operator=false`
        );
        
        if (!response.ok) throw new Error('Failed to get token');
        
        const data = await response.json();
        setToken(data.token);
      } catch (error) {
        console.error('Error generating token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generateToken();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-12">
      {/* Header: Radio Name */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold italic mb-2">
          Suara Fajar Deliksari
        </h1>
        <p className="text-gray-400 text-lg">Radio Doa Pagi GIA Deliksari</p>
      </div>

      {/* Schedule / Rundown */}
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold italic text-center mb-4">Jadwal Hari Ini</h2>
        <div className="bg-mid-gray border border-gray-700 rounded-lg p-6 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-bold italic">04.45 - 05.00</span>
            <span className="text-gray-300">Musik Pembuka</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold italic">05.00 - 05.30</span>
            <span className="text-gray-300">Worship, Doa, Firman</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold italic">05.30 - 05.45</span>
            <span className="text-gray-300">Musik Penutup</span>
          </div>
        </div>
      </div>

      {/* Audio Player */}
      <div className="w-full max-w-md">
        {isLoading ? (
          <div className="text-center text-gray-400">Memuat audio player...</div>
        ) : token ? (
          <AudioReceiver
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || ''}
          />
        ) : (
          <div className="text-center text-red-400">
            Gagal memuat audio player. Periksa konfigurasi LiveKit.
          </div>
        )}
      </div>

      {/* Prayer Request Form */}
      <div className="w-full max-w-md">
        <PrayerRequestForm />
      </div>

      {/* Reaction Buttons */}
      <div className="w-full max-w-md">
        <ReactionButtons />
      </div>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm mt-8">
        <p>© 2026 GIA Deliksari - Diberkati untuk memberkati</p>
      </footer>
    </div>
  );
}
