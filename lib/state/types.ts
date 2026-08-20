// Tipe state terpusat untuk sinkronisasi realtime admin ↔ stream
export type AppState = {
  isLive: boolean;
  isDemo: boolean;

  // 6 tombol kontrol (3x2)
  mediaOn: boolean;
  micOn: boolean;
  muteOn: boolean;
  youtubeOn: boolean;
  cameraOn: boolean;
  blackoutOn: boolean;

  // Sync rule
  syncOn: boolean;

  // YouTube current
  currentYoutubeId: string | null;
  currentYoutubeTitle: string | null;
  volume: number; // 0-100

  // Timestamps
  updatedAt: string;
};

export type ChatMessage = {
  id: string;
  createdAt: string;
  initial: string;
  name: string;
  message: string;
};

export type ReactionCounter = {
  emoji: string;
  label: string;
  count: number;
};

export type SetlistItem = {
  id: string;
  position: number;
  youtubeId: string;
  title: string;
  isPlaying?: boolean;
};

export type DeviceKind = 'media' | 'mic' | 'camera';

export const DEFAULT_APP_STATE: AppState = {
  isLive: false,
  isDemo: true,
  mediaOn: false,
  micOn: false,
  muteOn: false,
  youtubeOn: false,
  cameraOn: false,
  blackoutOn: false,
  syncOn: true,
  currentYoutubeId: null,
  currentYoutubeTitle: null,
  volume: 80,
  updatedAt: new Date(0).toISOString(),
};

// Reaksi default (Suka & Salam sesuai spec)
export const DEFAULT_REACTIONS: ReactionCounter[] = [
  { emoji: '👍', label: 'Suka', count: 0 },
  { emoji: '🕊️', label: 'Salam', count: 0 },
];
