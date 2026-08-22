'use client';

import { useEffect, useState } from 'react';

interface ScheduleItem {
  time: string;
  title: string;
  desc: string;
  startHour: number;
  startMin: number;
  endHour: number;
  endMin: number;
}

const SCHEDULE: ScheduleItem[] = [
  {
    time: '04:45 - 05:00 WIB',
    title: 'Musik Fajar & Pujian',
    desc: 'Saat teduh pembuka menyambut fajar',
    startHour: 4,
    startMin: 45,
    endHour: 5,
    endMin: 0,
  },
  {
    time: '05:00 - 05:30 WIB',
    title: 'Ibadah, Firman & Doa Syafaat',
    desc: 'Renungan pagi dan doa bersama jemaat',
    startHour: 5,
    startMin: 0,
    endHour: 5,
    endMin: 30,
  },
  {
    time: '05:30 - 05:45 WIB',
    title: 'Pujian Berkat & Penutup',
    desc: 'Penyerahan hari baru dalam tangan Tuhan',
    startHour: 5,
    startMin: 30,
    endHour: 5,
    endMin: 45,
  },
];

export default function ScheduleCard() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      // WIB = UTC+7
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const wibDate = new Date(utc + 3600000 * 7);
      const currentMin = wibDate.getHours() * 60 + wibDate.getMinutes();

      const foundIdx = SCHEDULE.findIndex((item) => {
        const start = item.startHour * 60 + item.startMin;
        const end = item.endHour * 60 + item.endMin;
        return currentMin >= start && currentMin < end;
      });

      setActiveIdx(foundIdx >= 0 ? foundIdx : null);
    };

    checkSchedule();
    const timer = setInterval(checkSchedule, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="glass-card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
          <h3 className="text-lg font-serif font-bold text-white">Rundown Doa Fajar</h3>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/[0.06] text-amber-200/80 border border-white/10">
          Setiap Hari
        </span>
      </div>

      <div className="space-y-2.5">
        {SCHEDULE.map((item, idx) => {
          const isNow = activeIdx === idx;
          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border transition-all duration-300 ${
                isNow
                  ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-950/20'
                  : 'bg-black/20 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-bold ${isNow ? 'text-amber-300' : 'text-slate-200'}`}>
                      {item.title}
                    </p>
                    {isNow && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-amber-950">
                        BERLANGSUNG
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                </div>
                <span className="text-xs font-mono font-medium text-slate-400 whitespace-nowrap">
                  {item.time.replace(' WIB', '')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
