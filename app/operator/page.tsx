'use client';

import { useEffect, useState } from 'react';
import { LiveKitRoom, useMicrophone, useLocalParticipant } from '@livekit/components-react';
import LiveFeedbackPanel from '@/components/LiveFeedbackPanel';

function OperatorControls() {
  const { isMicrophoneEnabled, localParticipant } = useLocalParticipant();
  const [isMicOn, setIsMicOn] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [embedId, setEmbedId] = useState('');

  const toggleMic = async () => {
    try {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
      setIsMicOn(!isMicrophoneEnabled);
    } catch (error) {
      console.error('Error toggling microphone:', error);
      alert('Gagal mengaktifkan mikrofon. Pastikan browser memiliki izin mikrofon.');
    }
  };

  const handleYoutubeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Extract YouTube video ID from URL
    const urlMatch = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    if (urlMatch && urlMatch[1]) {
      setEmbedId(urlMatch[1]);
    } else {
      alert('URL YouTube tidak valid');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Mic Control */}
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-2xl font-bold italic">Kontrol Mikrofon</h2>
        <button
          onClick={toggleMic}
          className={`px-12 py-6 text-2xl font-bold italic rounded-lg transition-colors ${
            isMicOn
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isMicOn ? '🎤 Mic ON - Klik untuk OFF' : '🎤 Mic OFF - Klik untuk ON'}
        </button>
        <p className="text-sm text-gray-400">
          {isMicOn ? '● Siaran sedang berjalan' : '○ Siaran tidak aktif'}
        </p>
      </div>

      {/* YouTube Embed */}
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold italic text-center">Musik YouTube</h2>
        <form onSubmit={handleYoutubeSubmit} className="flex gap-3">
          <input
            type="text"
            placeholder="Paste YouTube URL di sini..."
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="flex-1 px-4 py-3 bg-mid-gray border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Load
          </button>
        </form>
        
        {embedId && (
          <div className="w-full aspect-video bg-mid-gray rounded-lg overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${embedId}?autoplay=0`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}
        
        <p className="text-sm text-gray-400 text-center">
          💡 Tip: Gunakan software audio routing (seperti VB-Cable atau Voicemeeter) untuk mengirim audio YouTube ke stream
        </p>
      </div>
    </div>
  );
}

export default function OperatorPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const correctPin = process.env.NEXT_PUBLIC_OPERATOR_PIN || '123456';
    
    if (pinInput === correctPin) {
      setIsAuthenticated(true);
      generateToken();
    } else {
      alert('PIN salah! Coba lagi.');
      setPinInput('');
    }
  };

  const generateToken = async () => {
    setIsLoading(true);
    try {
      const roomName = process.env.NEXT_PUBLIC_ROOM_NAME || 'suara-fajar-deliksari';
      const participantName = 'operator';
      
      const response = await fetch(
        `/api/livekit?room=${roomName}&name=${participantName}&operator=true`
      );
      
      if (!response.ok) throw new Error('Failed to get token');
      
      const data = await response.json();
      setToken(data.token);
    } catch (error) {
      console.error('Error generating token:', error);
      alert('Gagal terhubung ke LiveKit. Periksa konfigurasi.');
    } finally {
      setIsLoading(false);
    }
  };

  // PIN Authentication Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold italic text-center mb-8">
            🔒 Halaman Operator
          </h1>
          <form onSubmit={handlePinSubmit} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="Masukkan PIN"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="px-6 py-4 bg-mid-gray border border-gray-700 rounded-lg text-white text-center text-2xl tracking-widest focus:outline-none focus:border-white"
              maxLength={10}
              autoFocus
            />
            <button
              type="submit"
              className="px-6 py-4 bg-white text-black font-bold italic text-xl rounded-lg hover:bg-gray-200 transition-colors"
            >
              Masuk
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Operator Dashboard
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold italic text-center mb-8">
          Dashboard Operator - Suara Fajar Deliksari
        </h1>

        {isLoading || !token ? (
          <div className="text-center text-gray-400">Menghubungkan ke server...</div>
        ) : (
          <LiveKitRoom
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || ''}
            connect={true}
            audio={true}
            video={false}
          >
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column: Controls */}
              <div className="flex flex-col gap-8">
                <OperatorControls />
              </div>

              {/* Right Column: Live Feedback */}
              <div>
                <h2 className="text-2xl font-bold italic text-center mb-6">Live Feedback</h2>
                <LiveFeedbackPanel />
              </div>
            </div>
          </LiveKitRoom>
        )}
      </div>
    </div>
  );
}
