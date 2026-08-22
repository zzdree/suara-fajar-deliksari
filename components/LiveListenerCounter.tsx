'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function LiveListenerCounter() {
  const [listenerCount, setListenerCount] = useState<number>(1);

  useEffect(() => {
    // Generate or get persistent client ID
    let clientId = '';
    try {
      clientId = localStorage.getItem('sfd_client_id') || '';
      if (!clientId) {
        clientId = `cl_${Math.random().toString(36).substring(2, 11)}`;
        localStorage.setItem('sfd_client_id', clientId);
      }
    } catch {
      clientId = `cl_${Math.random().toString(36).substring(2, 11)}`;
    }

    const sendHeartbeat = async () => {
      try {
        await supabase
          .from('listeners')
          .upsert({ client_id: clientId, last_seen: new Date().toISOString() });

        // Query active listeners in last 60 seconds
        const activeSince = new Date(Date.now() - 60000).toISOString();
        const { count, error } = await supabase
          .from('listeners')
          .select('*', { count: 'exact', head: true })
          .gt('last_seen', activeSince);

        if (!error && count !== null) {
          setListenerCount(Math.max(1, count));
        }
      } catch (err) {
        console.warn('Listener heartbeat error:', err);
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-pill shadow-lg shadow-black/20">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span className="text-xs font-medium text-slate-300">
        <strong className="text-amber-300 font-bold">{listenerCount}</strong> Jemaat Bersama
      </span>
    </div>
  );
}
