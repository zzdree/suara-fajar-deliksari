# Suara Fajar Deliksari - Radio Doa Pagi Live Streaming

Aplikasi web live-streaming audio untuk radio doa pagi gereja GIA Deliksari dengan fitur interaksi real-time (chat doa dan reaksi).

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS (Dark Mode)
- **Audio Streaming**: LiveKit (WebRTC)
- **Real-time Database**: Supabase (PostgreSQL + Realtime)
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

Sebelum memulai, Anda perlu membuat akun dan mendapatkan credentials dari:

1. **LiveKit Cloud** - [https://livekit.io](https://livekit.io)
   - Sign up dan buat project baru
   - Dapatkan: API Key, API Secret, dan WebSocket URL

2. **Supabase** - [https://supabase.com](https://supabase.com)
   - Sign up dan buat project baru
   - Dapatkan: Project URL dan Anon Key

## 🔧 Setup Instructions

### 1. Install Dependencies

Dependencies sudah terinstall. Jika perlu install ulang:

```bash
npm install
```

### 2. Configure Environment Variables

Edit file `.env.local` dengan credentials Anda:

```env
# LiveKit Configuration
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
NEXT_PUBLIC_ROOM_NAME=suara-fajar-deliksari
NEXT_PUBLIC_OPERATOR_PIN=123456
```

**⚠️ PENTING**: Ganti semua placeholder dengan credentials sebenarnya!

### 3. Setup Supabase Database

Buka Supabase Dashboard → SQL Editor, lalu jalankan script berikut:

```sql
-- 1. Create chats table (for prayer requests)
create table chats (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  message text not null
);

-- 2. Create reactions table (for real-time reactions counter)
create table reactions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  emoji text not null,
  count integer default 1 not null
);

-- 3. Enable Row Level Security
alter table chats enable row level security;
alter table reactions enable row level security;

-- 4. Create policies (allow public read, allow public insert)
create policy "Anyone can view chats" on chats for select using (true);
create policy "Anyone can insert chats" on chats for insert with check (true);
create policy "Anyone can view reactions" on reactions for select using (true);
create policy "Anyone can insert reactions" on reactions for insert with check (true);
create policy "Anyone can update reactions" on reactions for update using (true);

-- 5. Enable Realtime
alter publication supabase_realtime add table chats;
alter publication supabase_realtime add table reactions;

-- 6. Insert initial reaction counters
insert into reactions (emoji, count) values ('❤️', 0);
insert into reactions (emoji, count) values ('🙏', 0);
```

### 4. Run Development Server

```bash
npm run dev
```

Buka browser:
- **Halaman Audiens**: [http://localhost:3000](http://localhost:3000)
- **Halaman Operator**: [http://localhost:3000/operator](http://localhost:3000/operator)

## 📱 Fitur Aplikasi

### Halaman Audiens (`/`)

- ✅ Menampilkan nama radio dan jadwal rundown (bold italic)
- ✅ Audio receiver dengan tombol "Dengarkan Live"
- ✅ Form untuk mengirim permohonan doa
- ✅ Tombol reaksi (❤️ 🙏) dengan counter real-time
- ✅ Dark mode full dengan center-aligned layout

### Halaman Operator (`/operator`)

- ✅ PIN authentication gate (default: 123456)
- ✅ Toggle Mic On/Off untuk broadcast audio
- ✅ YouTube embed untuk musik pembuka/penutup
- ✅ Live feedback panel (permohonan doa + statistik reaksi)
- ✅ Dark mode full dengan responsive layout

## 🧪 Testing Guide

### Test Halaman Audiens

1. Buka `http://localhost:3000` di browser mobile/emulator
2. Verifikasi jadwal tampil dengan bold italic
3. Klik "Dengarkan Live" (browser akan minta permission audio)
4. Kirim permohonan doa → cek Supabase table `chats`
5. Klik tombol reaksi → cek Supabase table `reactions`
6. Buka tab kedua untuk verifikasi real-time updates

### Test Halaman Operator

1. Buka `http://localhost:3000/operator`
2. Masukkan PIN (default: 123456)
3. Klik "Mic ON" → browser akan minta permission mikrofon
4. Paste URL YouTube dan klik "Load"
5. Buka tab audiens di device lain, bicara di mic operator
6. Verifikasi suara terdengar di audiens (latency < 1 detik)
7. Kirim doa dari tab audiens → muncul di Live Feedback Panel operator

### Test End-to-End Audio Streaming

1. Di device pertama: buka `/operator` dan aktifkan Mic ON
2. Di device kedua: buka `/` dan klik "Dengarkan Live"
3. Bicara di mikrofon operator → terdengar di audiens
4. Verifikasi latency rendah (< 1 detik)

## 🚀 Deployment ke Production

### Deploy ke Vercel (Recommended)

1. Push code ke GitHub repository
2. Import project di [Vercel](https://vercel.com)
3. Tambahkan semua environment variables di Vercel dashboard
4. Deploy!

```bash
# Or deploy via Vercel CLI
npm i -g vercel
vercel --prod
```

### Environment Variables di Vercel

Jangan lupa tambahkan semua variables dari `.env.local` ke Vercel Dashboard → Settings → Environment Variables.

## ⚠️ Catatan Keamanan

### Client-Side PIN (Not Production-Grade)

PIN operator saat ini tersimpan di environment variable yang bisa di-inspect di browser. Untuk production yang lebih aman:

- Gunakan **NextAuth.js** dengan credential provider
- Atau gunakan **Supabase Auth** dengan email/password
- Atau minimal server-side session check

### Row Level Security (RLS)

RLS policies saat ini mengizinkan semua orang read/write. Untuk production:

- Batasi write hanya untuk authenticated users
- Tambahkan rate limiting untuk mencegah spam
- Tambahkan moderation untuk chat content

## 🎨 Design Guidelines

### Strict Dark Mode

- Background: Pure black (#000000)
- Text: White (#ffffff)
- Secondary: Dark gray (#0a0a0a, #1a1a1a)

### Typography

- Font: Inter (dari Google Fonts)
- Headings: Bold + Italic untuk emphasis
- Schedule/Rundown: Bold italic untuk keterbacaan

### Layout

- Semua konten center-aligned
- Mobile-first responsive design
- Fokus pada kenyamanan mata di pagi hari

## 🐛 Troubleshooting

### Audio tidak terdengar di audiens

- Pastikan operator sudah klik "Mic ON"
- Pastikan audiens sudah klik "Dengarkan Live"
- Check browser console untuk error LiveKit
- Verify LiveKit credentials di `.env.local`

### Real-time updates tidak jalan

- Check Supabase Realtime is enabled
- Verify tables sudah ditambahkan ke `supabase_realtime` publication
- Check browser console untuk Supabase connection errors

### "Failed to get token" error

- Verify semua LiveKit credentials benar
- Check `app/api/livekit/route.ts` tidak ada error
- Pastikan API route accessible (restart dev server)

## 📞 Support

Untuk bantuan lebih lanjut, hubungi tim IT GIA Deliksari.

---

**© 2026 GIA Deliksari - Diberkati untuk memberkati** 🙏
