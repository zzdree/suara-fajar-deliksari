export interface AppState {
  id: number;
  is_live: boolean;
  is_demo: boolean;
  media_on: boolean;
  mic_on: boolean;
  mute_on: boolean;
  youtube_on: boolean;
  camera_on: boolean;
  blackout_on: boolean;
  sync_on: boolean;
  current_youtube_id: string | null;
  current_youtube_title: string | null;
  volume: number;
  updated_at?: string;
}

export interface ChatMessage {
  id?: string;
  initial?: string;
  name: string;
  message: string;
  created_at?: string;
}

export interface Reaction {
  emoji: string;
  label: string;
  count: number;
  reset_date: string;
}

export interface SetlistItem {
  id: string;
  position: number;
  youtube_id: string;
  title: string;
  is_playing: boolean;
  created_at?: string;
}

export interface Listener {
  id: string;
  last_heartbeat: string;
  created_at?: string;
}
