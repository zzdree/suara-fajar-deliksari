'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { AppState, ChatMessage, SetlistItem } from '@/lib/types';
import { ProgramView169 } from '@/components/ProgramView169';
import { AudioVisualizer20 } from '@/components/AudioVisualizer20';
import { TikTokChatbox } from '@/components/TikTokChatbox';
import { extractYouTubeId, fetchYouTubeVideoInfo } from '@/lib/youtube';
import LiveListenerCounter from '@/components/LiveListenerCounter';
import { Room, LocalAudioTrack, LocalVideoTrack } from 'livekit-client';
import Link from 'next/link';

export default function AdminWorkspace() {
  // App State
  const [appState, setAppState] = useState<AppState>({
    id: 1,
    is_live: false,
    is_demo: false,
    media_on: false,
    mic_on: false,
    mute_on: false,
    youtube_on: false,
    camera_on: false,
    blackout_on: false,
    sync_on: true,
    current_youtube_id: null,
    current_youtube_title: null,
    volume: 80,
  });

  // Chats & Reactions
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [likeCount, setLikeCount] = useState(0);
  const [salamCount, setSalamCount] = useState(0);

  // Setlist Media Queue
  const [setlist, setSetlist] = useState<SetlistItem[]>([]);
  const [youtubeInput, setYoutubeInput] = useState('');
  const [isAddingVideo, setIsAddingVideo] = useState(false);

  // Hardware Devices
  const [mediaDevices, setMediaDevices] = useState<{ audio: MediaDeviceInfo[]; video: MediaDeviceInfo[] }>({
    audio: [],
    video: [],
  });
  const [selectedMedia, setSelectedMedia] = useState('default');
  const [selectedMic, setSelectedMic] = useState('default');
  const [selectedCam, setSelectedCam] = useState('default');

  // Real Hardware Streaming & LiveKit state
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [livekitConnected, setLivekitConnected] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Refs for persistent connections
  const roomRef = useRef<Room | null>(null);
  const localAudioTrackRef = useRef<LocalAudioTrack | null>(null);
  const localVideoTrackRef = useRef<LocalVideoTrack | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Helper to enumerate devices
  const refreshDevices = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setMediaDevices({
          audio: devices.filter((d) => d.kind === 'audioinput'),
          video: devices.filter((d) => d.kind === 'videoinput'),
        });
      } catch (err) {
        console.warn('Failed to enumerate devices:', err);
      }
    }
  }, []);

  // Helper to explicitly request mic + cam permission
  const requestHardwarePermissions = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setPermissionGranted(true);
      await refreshDevices();
      // Stop temporary permission-probing stream
      stream.getTracks().forEach((t) => t.stop());
    } catch (err) {
      console.warn('Microphone/Camera permission request:', err);
      // Fallback: try audio only if camera is unavailable
      try {
        const aStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setPermissionGranted(true);
        await refreshDevices();
        aStream.getTracks().forEach((t) => t.stop());
      } catch {
        // Ignored
      }
    }
  }, [refreshDevices]);

  // 1. Fetch initial state & hardware devices
  useEffect(() => {
    // Initial fetch of app_state
    supabase
      .from('app_state')
      .select('*')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (data) setAppState(data as AppState);
      });

    // Initial fetch of chats
    supabase
      .from('chats')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(30)
      .then(({ data }) => {
        if (data) setChats(data as ChatMessage[]);
      });

    // Initial fetch of reactions
    supabase
      .from('reactions')
      .select('*')
      .then(({ data }) => {
        if (data) {
          data.forEach((r) => {
            if (r.emoji === '👍') setLikeCount(r.count || 0);
            if (r.emoji === '🕊️') setSalamCount(r.count || 0);
          });
        }
      });

    // Initial fetch of setlist
    supabase
      .from('setlist')
      .select('*')
      .order('position', { ascending: true })
      .then(({ data }) => {
        if (data) setSetlist(data as SetlistItem[]);
      });

    // Prompt for media permissions and enumerate devices
    requestHardwarePermissions();

    // Connect to LiveKit Room as operator publisher
    const connectLiveKitPublisher = async () => {
      try {
        const roomName = process.env.NEXT_PUBLIC_ROOM_NAME || 'suara-fajar-deliksari';
        const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://suara-fajar-deliksari-8jxfwoq0.livekit.cloud';

        const res = await fetch(`/api/livekit?room=${encodeURIComponent(roomName)}&name=Operator-Studio&operator=true`);
        if (!res.ok) return;
        const { token } = await res.json();
        if (!token) return;

        const room = new Room({
          adaptiveStream: true,
          dynacast: true,
        });

        await room.connect(serverUrl, token);
        roomRef.current = room;
        setLivekitConnected(true);
      } catch (err) {
        console.warn('LiveKit publisher connection error:', err);
      }
    };

    connectLiveKitPublisher();

    // Realtime subscriptions
    const stateChan = supabase
      .channel('admin_app_state')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_state', filter: 'id=eq.1' },
        (payload) => {
          if (payload.new) setAppState(payload.new as AppState);
        }
      )
      .subscribe();

    const chatChan = supabase
      .channel('admin_chats')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chats' },
        (payload) => {
          if (payload.new) setChats((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    const reactChan = supabase
      .channel('admin_reactions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reactions' },
        (payload) => {
          if (payload.new && typeof payload.new === 'object' && 'emoji' in payload.new) {
            const row = payload.new as { emoji: string; count: number };
            if (row.emoji === '👍') setLikeCount(row.count);
            if (row.emoji === '🕊️') setSalamCount(row.count);
          }
        }
      )
      .subscribe();

    const setlistChan = supabase
      .channel('admin_setlist')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'setlist' },
        () => {
          supabase
            .from('setlist')
            .select('*')
            .order('position', { ascending: true })
            .then(({ data }) => {
              if (data) setSetlist(data as SetlistItem[]);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(stateChan);
      supabase.removeChannel(chatChan);
      supabase.removeChannel(reactChan);
      supabase.removeChannel(setlistChan);

      // Clean up LiveKit room and tracks
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
      }
      if (localVideoTrackRef.current) {
        localVideoTrackRef.current.stop();
      }
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [requestHardwarePermissions]);

  // Update AppState Helper
  const updateState = async (patch: Partial<AppState>) => {
    const updated = { ...appState, ...patch };
    setAppState(updated);

    if (!appState.is_demo) {
      await supabase.from('app_state').update(patch).eq('id', 1);
    }
  };

  // Hardware Mic Stream Start / Stop
  const startMic = async () => {
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: selectedMic !== 'default' ? { deviceId: { exact: selectedMic } } : true,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const src = ctx.createMediaStreamSource(stream);
      const node = ctx.createAnalyser();
      node.fftSize = 64;
      node.smoothingTimeConstant = 0.8;
      src.connect(node);
      setAnalyser(node);

      try {
        const audioTrack = new LocalAudioTrack(stream.getAudioTracks()[0]);
        localAudioTrackRef.current = audioTrack;

        if (roomRef.current?.localParticipant) {
          await roomRef.current.localParticipant.publishTrack(audioTrack);
        }
      } catch (trackErr) {
        console.warn('LiveKit audio publish warning:', trackErr);
      }
    } catch (err) {
      console.error('Error starting microphone:', err);
    }
  };

  const stopMic = async () => {
    if (localAudioTrackRef.current) {
      if (roomRef.current?.localParticipant) {
        await roomRef.current.localParticipant.unpublishTrack(localAudioTrackRef.current).catch(() => {});
      }
      localAudioTrackRef.current.stop();
      localAudioTrackRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAnalyser(null);
  };

  // Hardware Camera Stream Start / Stop
  const startCamera = async () => {
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: selectedCam !== 'default' ? { deviceId: { exact: selectedCam } } : true,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      setCameraStream(stream);

      try {
        const videoTrack = new LocalVideoTrack(stream.getVideoTracks()[0]);
        localVideoTrackRef.current = videoTrack;

        if (roomRef.current?.localParticipant) {
          await roomRef.current.localParticipant.publishTrack(videoTrack);
        }
      } catch (trackErr) {
        console.warn('LiveKit video publish warning:', trackErr);
      }
    } catch (err) {
      console.error('Error starting camera:', err);
    }
  };

  const stopCamera = async () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
    }
    if (localVideoTrackRef.current) {
      if (roomRef.current?.localParticipant) {
        await roomRef.current.localParticipant.unpublishTrack(localVideoTrackRef.current).catch(() => {});
      }
      localVideoTrackRef.current.stop();
      localVideoTrackRef.current = null;
    }
    setCameraStream(null);
  };

  // Toggle Button Handlers with Sync Logic & Real Hardware
  const toggleMedia = () => {
    const nextVal = !appState.media_on;
    if (appState.sync_on) {
      updateState({ media_on: nextVal, youtube_on: nextVal, is_live: nextVal || appState.mic_on });
    } else {
      updateState({ media_on: nextVal, is_live: nextVal || appState.mic_on });
    }
  };

  const toggleMic = async () => {
    const nextVal = !appState.mic_on;
    if (nextVal) {
      await startMic();
    } else {
      await stopMic();
    }

    if (appState.sync_on) {
      if (nextVal && !appState.camera_on) {
        await startCamera();
      } else if (!nextVal && appState.camera_on) {
        await stopCamera();
      }
      updateState({ mic_on: nextVal, camera_on: nextVal, is_live: nextVal || appState.media_on });
    } else {
      updateState({ mic_on: nextVal, is_live: nextVal || appState.media_on });
    }
  };

  const toggleMute = async () => {
    const nextVal = !appState.mute_on;
    if (nextVal) {
      // Mute active: stop audio media & mic
      await stopMic();
      updateState({ mute_on: true, media_on: false, mic_on: false, is_live: false });
    } else {
      updateState({ mute_on: false });
    }
  };

  const toggleYoutube = () => {
    const nextVal = !appState.youtube_on;
    if (appState.sync_on) {
      updateState({ youtube_on: nextVal, media_on: nextVal });
    } else {
      updateState({ youtube_on: nextVal });
    }
  };

  const toggleCamera = async () => {
    const nextVal = !appState.camera_on;
    if (nextVal) {
      await startCamera();
      if (appState.sync_on) {
        if (!appState.mic_on) await startMic();
        updateState({ camera_on: true, mic_on: true, youtube_on: false, is_live: true });
      } else {
        updateState({ camera_on: true, youtube_on: false, is_live: true });
      }
    } else {
      await stopCamera();
      if (appState.sync_on) {
        if (appState.mic_on) await stopMic();
        updateState({ camera_on: false, mic_on: false, is_live: appState.media_on });
      } else {
        updateState({ camera_on: false, is_live: appState.media_on || appState.mic_on });
      }
    }
  };

  const toggleBlackout = async () => {
    const nextVal = !appState.blackout_on;
    if (nextVal) {
      // Blackout active: stop camera & mute
      await stopCamera();
      if (appState.sync_on) {
        await stopMic();
        updateState({
          blackout_on: true,
          mute_on: true,
          media_on: false,
          mic_on: false,
          youtube_on: false,
          camera_on: false,
          is_live: false,
        });
      } else {
        updateState({ blackout_on: true, youtube_on: false, camera_on: false });
      }
    } else {
      updateState({ blackout_on: false });
    }
  };

  const toggleSync = () => {
    updateState({ sync_on: !appState.sync_on });
  };

  const toggleDemo = () => {
    updateState({ is_demo: !appState.is_demo });
  };

  // Setlist Operations
  const handleAddYouTube = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractYouTubeId(youtubeInput);
    if (!id || isAddingVideo) return;

    setIsAddingVideo(true);
    try {
      const info = await fetchYouTubeVideoInfo(id);
      const newPos = setlist.length + 1;

      const newItem: SetlistItem = {
        id: `local-${Date.now()}`,
        position: newPos,
        youtube_id: id,
        title: info.title,
        is_playing: false,
      };

      setSetlist((prev) => [...prev, newItem]);
      setYoutubeInput('');

      // Auto save to DB
      await supabase.from('setlist').insert({
        position: newPos,
        youtube_id: id,
        title: info.title,
        is_playing: false,
      });
    } finally {
      setIsAddingVideo(false);
    }
  };

  const handlePlaySong = async (song: SetlistItem) => {
    const updated = setlist.map((s) => ({ ...s, is_playing: s.id === song.id }));
    setSetlist(updated);

    updateState({
      current_youtube_id: song.youtube_id,
      current_youtube_title: song.title,
      youtube_on: true,
      media_on: true,
      is_live: true,
      blackout_on: false,
    });

    await supabase.from('setlist').update({ is_playing: false }).neq('id', song.id);
    await supabase.from('setlist').update({ is_playing: true }).eq('id', song.id);
  };

  const handleStopMedia = async () => {
    const updated = setlist.map((s) => ({ ...s, is_playing: false }));
    setSetlist(updated);
    updateState({ youtube_on: false, media_on: false });
    await supabase.from('setlist').update({ is_playing: false }).neq('position', -1);
  };

  const handleShuffle = async () => {
    if (setlist.length <= 1) return;
    const playing = setlist.find((s) => s.is_playing);
    const others = setlist.filter((s) => !s.is_playing);

    // Shuffle others
    const shuffled = [...others].sort(() => Math.random() - 0.5);
    const finalQueue = playing ? [playing, ...shuffled] : shuffled;
    const reindexed = finalQueue.map((item, idx) => ({ ...item, position: idx + 1 }));

    setSetlist(reindexed);

    // Update DB
    for (const item of reindexed) {
      await supabase.from('setlist').update({ position: item.position }).eq('id', item.id);
    }
  };

  const handleDeleteAll = async () => {
    setSetlist([]);
    await supabase.from('setlist').delete().neq('position', -1);
  };

  const handleDeleteSong = async (id: string) => {
    setSetlist((prev) => prev.filter((s) => s.id !== id));
    await supabase.from('setlist').delete().eq('id', id);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    updateState({ volume: val });
  };

  // Send admin comment
  const handleSendAdminComment = async (name: string, message: string) => {
    await supabase.from('chats').insert({
      initial: 'A',
      name: name || 'Admin',
      message,
    });
  };

  return (
    <div className="min-h-screen pb-12">
      {/* ── Header Bar ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0c080a]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-serif font-black italic text-lg sm:text-xl text-white tracking-tight">
              administrator panel
            </h1>
            {livekitConnected ? (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                ● LiveKit On-Air Ready
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-bold text-amber-400">
                Connecting LiveKit...
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!permissionGranted && (
              <button
                onClick={requestHardwarePermissions}
                className="btn-gold px-3 py-1 text-xs font-bold animate-pulse"
                title="Izinkan akses mikrofon dan kamera"
              >
                🎙️ Izinkan Mic & Cam
              </button>
            )}

            {/* Demo Toggle Button (Gold when off, Green when on) */}
            <button
              onClick={toggleDemo}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                appState.is_demo ? 'btn-green' : 'btn-gold'
              }`}
            >
              Demo: {appState.is_demo ? 'ON' : 'OFF'}
            </button>

            {/* Keluar Button (Red) */}
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="btn-red px-3.5 py-1.5 text-xs font-bold">
                Keluar
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* ── 3 Main Panels Grid ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ============================================================
              PANEL 1: STREAM CONTROL
              ============================================================ */}
          <div className="glass-card p-5 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-serif font-bold text-base text-white">Stream Control</h2>
                <span className="text-[10px] font-mono text-white/50">PANEL 1</span>
              </div>

              {/* 1. Program View (16:9) with Real Live Camera Feed */}
              <ProgramView169 appState={appState} cameraStream={cameraStream} />

              {/* 2. Audio View: 20-bar realtime visualizer with Web Audio API Frequency input */}
              <div className="mt-4">
                <span className="text-[10px] font-semibold text-white/60 tracking-wider uppercase mb-1.5 block">
                  Audio Level Monitor {appState.mic_on ? '(Mic Input Live)' : ''}
                </span>
                <AudioVisualizer20
                  isActive={appState.media_on || appState.mic_on}
                  analyser={analyser}
                />
              </div>

              {/* 3. 6 Control Buttons (Grid 3x2) */}
              <div className="mt-4 space-y-2">
                <span className="text-[10px] font-semibold text-white/60 tracking-wider uppercase block">
                  Media & Signal Triggers
                </span>

                {/* Top Row: Media, Microphone, Mute (Red when active) */}
                <div className="grid grid-cols-3 gap-2">
                  {/* Media */}
                  <button
                    onClick={toggleMedia}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      appState.media_on ? 'btn-red' : 'btn-trans'
                    }`}
                  >
                    <div className="h-2 w-6 rounded-full bg-white/30 relative">
                      <span className={`absolute top-0.5 h-1 w-2.5 rounded-full bg-white transition-all ${appState.media_on ? 'right-0.5' : 'left-0.5'}`} />
                    </div>
                    <span className="text-[11px] font-bold">Media</span>
                  </button>

                  {/* Microphone */}
                  <button
                    onClick={toggleMic}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      appState.mic_on ? 'btn-red' : 'btn-trans'
                    }`}
                  >
                    <div className="h-2 w-6 rounded-full bg-white/30 relative">
                      <span className={`absolute top-0.5 h-1 w-2.5 rounded-full bg-white transition-all ${appState.mic_on ? 'right-0.5' : 'left-0.5'}`} />
                    </div>
                    <span className="text-[11px] font-bold">Microphone</span>
                  </button>

                  {/* Mute */}
                  <button
                    onClick={toggleMute}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      appState.mute_on ? 'btn-red' : 'btn-trans'
                    }`}
                  >
                    <div className="h-2 w-6 rounded-full bg-white/30 relative">
                      <span className={`absolute top-0.5 h-1 w-2.5 rounded-full bg-white transition-all ${appState.mute_on ? 'right-0.5' : 'left-0.5'}`} />
                    </div>
                    <span className="text-[11px] font-bold">Mute</span>
                  </button>
                </div>

                {/* Bottom Row: Youtube, Camera, Blackout (Green when active) */}
                <div className="grid grid-cols-3 gap-2">
                  {/* Youtube */}
                  <button
                    onClick={toggleYoutube}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      appState.youtube_on ? 'btn-green' : 'btn-trans'
                    }`}
                  >
                    <div className="h-2 w-6 rounded-full bg-white/30 relative">
                      <span className={`absolute top-0.5 h-1 w-2.5 rounded-full bg-white transition-all ${appState.youtube_on ? 'right-0.5' : 'left-0.5'}`} />
                    </div>
                    <span className="text-[11px] font-bold">Youtube</span>
                  </button>

                  {/* Camera */}
                  <button
                    onClick={toggleCamera}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      appState.camera_on ? 'btn-green' : 'btn-trans'
                    }`}
                  >
                    <div className="h-2 w-6 rounded-full bg-white/30 relative">
                      <span className={`absolute top-0.5 h-1 w-2.5 rounded-full bg-white transition-all ${appState.camera_on ? 'right-0.5' : 'left-0.5'}`} />
                    </div>
                    <span className="text-[11px] font-bold">Camera</span>
                  </button>

                  {/* Blackout */}
                  <button
                    onClick={toggleBlackout}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      appState.blackout_on ? 'btn-green' : 'btn-trans'
                    }`}
                  >
                    <div className="h-2 w-6 rounded-full bg-white/30 relative">
                      <span className={`absolute top-0.5 h-1 w-2.5 rounded-full bg-white transition-all ${appState.blackout_on ? 'right-0.5' : 'left-0.5'}`} />
                    </div>
                    <span className="text-[11px] font-bold">Blackout</span>
                  </button>
                </div>
              </div>

              {/* 4. Sync Toggle Box (Gold Accent) */}
              <div
                onClick={toggleSync}
                className="mt-4 surface-trans-flat p-3 flex items-center justify-between cursor-pointer hover:border-amber-400/40 transition-colors"
              >
                <div>
                  <span className="text-xs font-bold text-white block">Sync Controller</span>
                  <span className="text-[10px] text-white/50">
                    {appState.sync_on ? 'Media & Signal terhubung simultan' : 'Media berjalan independen'}
                  </span>
                </div>
                <div className={`h-4 w-9 rounded-full relative transition-colors ${appState.sync_on ? 'bg-amber-500' : 'bg-white/20'}`}>
                  <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all ${appState.sync_on ? 'right-1' : 'left-1'}`} />
                </div>
              </div>
            </div>

            {/* 5. Device Selectors (Real Hardware Reading & Selection) */}
            <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-white/60 tracking-wider uppercase block">
                  Hardware Device Select
                </span>
                <button
                  onClick={requestHardwarePermissions}
                  className="text-[10px] text-amber-300 hover:underline"
                >
                  ↻ Scan Device
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2 text-xs">
                {/* Audio Media */}
                <select
                  value={selectedMedia}
                  onChange={(e) => setSelectedMedia(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/50 px-2.5 py-1.5 text-white/80 text-[11px] focus:outline-none"
                >
                  <option value="default">Media Output: Default Speaker</option>
                </select>

                {/* Microphone Selection */}
                <select
                  value={selectedMic}
                  onChange={(e) => {
                    setSelectedMic(e.target.value);
                    if (appState.mic_on) {
                      stopMic().then(() => startMic());
                    }
                  }}
                  className="w-full rounded-lg border border-white/10 bg-black/50 px-2.5 py-1.5 text-white/80 text-[11px] focus:outline-none"
                >
                  <option value="default">Mic: Default Input</option>
                  {mediaDevices.audio.map((d, i) => (
                    <option key={d.deviceId || i} value={d.deviceId}>
                      🎙️ {d.label || `Microphone ${i + 1}`}
                    </option>
                  ))}
                </select>

                {/* Camera Selection */}
                <select
                  value={selectedCam}
                  onChange={(e) => {
                    setSelectedCam(e.target.value);
                    if (appState.camera_on) {
                      stopCamera().then(() => startCamera());
                    }
                  }}
                  className="w-full rounded-lg border border-white/10 bg-black/50 px-2.5 py-1.5 text-white/80 text-[11px] focus:outline-none"
                >
                  <option value="default">Cam: Default Webcam</option>
                  {mediaDevices.video.map((d, i) => (
                    <option key={d.deviceId || i} value={d.deviceId}>
                      📹 {d.label || `Camera ${i + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>


          {/* ============================================================
              PANEL 2: LIVE FEEDBACK
              ============================================================ */}
          <div className="glass-card p-5 space-y-4 flex flex-col justify-between">
            <div>
              {/* Header Area: Status pulse + Listener counter */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {appState.is_live ? 'Online' : 'Standby'}
                  </span>
                </div>
                <LiveListenerCounter />
              </div>

              {/* Rundown Table (04.45 - 05.45) */}
              <div className="surface-trans-flat p-3 text-xs space-y-1.5">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block mb-1">
                  Rundown Doa Fajar
                </span>
                <div className="grid grid-cols-2 text-[11px] gap-y-1 text-white/80">
                  <span>04.45 - 05.00</span><span className="text-right">Lagu Pembuka</span>
                  <span>05.00 - 05.05</span><span className="text-right">Doa Pembuka</span>
                  <span>05.05 - 05.10</span><span className="text-right">Worship</span>
                  <span>05.10 - 05.25</span><span className="text-right font-semibold text-amber-200">Firman Tuhan</span>
                  <span>05.25 - 05.30</span><span className="text-right">Doa Penutup</span>
                  <span>05.30 - 05.45</span><span className="text-right">Lagu Penutup</span>
                </div>
              </div>

              {/* Chatbox (TikTok Style) */}
              <div className="mt-4">
                <span className="text-[10px] font-semibold text-white/60 tracking-wider uppercase mb-1.5 block">
                  Permohonan Doa Jemaat
                </span>
                <TikTokChatbox
                  messages={chats}
                  isAdmin={true}
                  onSendMessage={handleSendAdminComment}
                />
              </div>
            </div>

            {/* React Counter: 2 Kotak Besar (Suka 👍 & Salam 🕊️) */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <span className="text-[10px] font-semibold text-white/60 tracking-wider uppercase mb-2 block">
                Total Reaksi Jemaat
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div className="surface-trans-flat p-3 text-center">
                  <div className="text-2xl mb-1">👍</div>
                  <div className="text-xs font-semibold text-white/70">Suka</div>
                  <div className="text-lg font-mono font-bold text-amber-300 mt-0.5">
                    {likeCount}
                  </div>
                </div>

                <div className="surface-trans-flat p-3 text-center">
                  <div className="text-2xl mb-1">🕊️</div>
                  <div className="text-xs font-semibold text-white/70">Salam</div>
                  <div className="text-lg font-mono font-bold text-amber-300 mt-0.5">
                    {salamCount}
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* ============================================================
              PANEL 3: MEDIA CONTROL
              ============================================================ */}
          <div className="glass-card p-5 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-serif font-bold text-base text-white">Media Control</h2>
                <span className="text-[10px] font-mono text-white/50">PANEL 3</span>
              </div>

              {/* 1. YouTube View 16:9 & Title */}
              <div className="surface-16-9">
                {appState.current_youtube_id ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${appState.current_youtube_id}?autoplay=1&mute=0&controls=1`}
                    title="Media Monitor"
                    className="absolute inset-0 h-full w-full border-0"
                    allowFullScreen
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-mono text-xs tracking-widest text-white/40 uppercase">
                      no media
                    </span>
                    <span className="text-[10px] text-white/30 mt-1">no title</span>
                  </div>
                )}
              </div>

              {/* 2. Volume Slider */}
              <div className="mt-3 surface-trans-flat p-3 flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-white w-8 text-left">
                  {appState.volume}%
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={appState.volume}
                  onChange={handleVolumeChange}
                  className="dawn-slider flex-1"
                />
              </div>

              {/* 3. Setlist Warning Box */}
              {setlist.length < 3 && (
                <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-center">
                  <span className="text-[11px] font-medium text-amber-300">
                    ⚠️ Peringatan: Antrian kurang dari 3 lagu ({setlist.length}/3)
                  </span>
                </div>
              )}

              {/* 4. 5 Action Buttons */}
              <div className="mt-3 grid grid-cols-5 gap-1.5">
                {/* Play */}
                <button
                  onClick={() => setlist[0] && handlePlaySong(setlist[0])}
                  className="btn-green px-2 py-2 text-[10px] font-bold"
                  title="Play"
                >
                  Play
                </button>

                {/* Stop */}
                <button
                  onClick={handleStopMedia}
                  className="btn-gold px-2 py-2 text-[10px] font-bold"
                  title="Stop"
                >
                  Stop
                </button>

                {/* Fade */}
                <button
                  onClick={() => updateState({ volume: appState.volume > 0 ? 0 : 80 })}
                  className="btn-blue px-2 py-2 text-[10px] font-bold"
                  title="Fade In / Out"
                >
                  Fade
                </button>

                {/* Shuffle */}
                <button
                  onClick={handleShuffle}
                  className="btn-purple px-2 py-2 text-[10px] font-bold"
                  title="Shuffle Antrian"
                >
                  Shuffle
                </button>

                {/* Delete All */}
                <button
                  onClick={handleDeleteAll}
                  className="btn-red px-2 py-2 text-[10px] font-bold"
                  title="Hapus Semua"
                >
                  Del All
                </button>
              </div>

              {/* 5. Input YouTube */}
              <form onSubmit={handleAddYouTube} className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={youtubeInput}
                  onChange={(e) => setYoutubeInput(e.target.value)}
                  placeholder="URL / ID YouTube..."
                  className="flex-1 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={!youtubeInput.trim() || isAddingVideo}
                  className="btn-gold px-3.5 py-2 text-xs font-bold shrink-0"
                >
                  {isAddingVideo ? '...' : 'Tambah'}
                </button>
              </form>

              {/* 6. List Antrian */}
              <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {setlist.length === 0 ? (
                  <div className="text-center py-4 text-xs text-white/40 italic">
                    Belum ada antrian lagu.
                  </div>
                ) : (
                  setlist.map((song, idx) => (
                    <div
                      key={song.id || idx}
                      className={`flex items-center justify-between gap-2 p-2 rounded-xl border transition-all ${
                        song.is_playing
                          ? 'border-amber-400/40 bg-amber-500/10'
                          : 'border-white/10 bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-xs text-white/50 w-4">
                          {song.position || idx + 1}.
                        </span>
                        <span className="text-xs text-white truncate max-w-[140px]">
                          {song.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => (song.is_playing ? handleStopMedia() : handlePlaySong(song))}
                          className={`p-1.5 rounded-lg text-[10px] font-bold ${
                            song.is_playing ? 'btn-red' : 'btn-green'
                          }`}
                        >
                          {song.is_playing ? '■' : '▶'}
                        </button>
                        <button
                          onClick={() => handleDeleteSong(song.id)}
                          className="btn-red p-1.5 rounded-lg text-[10px] font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Link to public stream page */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-white/40">Halaman Publik:</span>
              <Link href="/stream" target="_blank" className="text-amber-300 hover:underline flex items-center gap-1">
                Buka Stream Jemaat ↗
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
