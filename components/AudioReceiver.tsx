'use client';

import { useState } from 'react';
import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';

interface AudioReceiverProps {
  token: string;
  serverUrl: string;
}

export default function AudioReceiver({ token, serverUrl }: AudioReceiverProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      {!isPlaying ? (
        <button
          onClick={() => setIsPlaying(true)}
          className="px-8 py-4 bg-white text-black font-bold italic text-xl rounded-lg hover:bg-gray-200 transition-colors"
        >
          🎧 Dengarkan Live
        </button>
      ) : (
        <LiveKitRoom
          token={token}
          serverUrl={serverUrl}
          connect={true}
          audio={true}
          video={false}
        >
          <RoomAudioRenderer />
          <div className="text-green-400 font-bold italic">
            ● Terhubung ke Live Stream
          </div>
        </LiveKitRoom>
      )}
    </div>
  );
}
