# 📻 Suara Fajar Deliksari — Live Audio Streaming Radio

> Aplikasi Web Live-Streaming Audio WebRTC untuk siaran Radio Doa Pagi Gereja (GIA Deliksari) dengan fitur interaktif real-time (Chat Doa, Emoji Reactions, dan Studio Operator Siaran).

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![LiveKit](https://img.shields.io/badge/Audio-LiveKit_WebRTC-002B36?style=flat-square)
![Supabase](https://img.shields.io/badge/Database-Supabase_Realtime-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

---

## 📖 Overview

**Suara Fajar Deliksari** adalah platform siaran radio doa pagi berbasis web modern yang dirancang khusus untuk memfasilitasi ibadah fajar jemaat secara digital dengan latensi audio sangat rendah (< 500ms). 

Aplikasi ini menggabungkan kekuatan **LiveKit WebRTC Cloud** untuk distribusi audio berkualitas tinggi dan **Supabase Realtime** untuk interaksi jemaat (permohonan doa langsung, reaksi emoji, dan status pendengar).

---

## ✨ Fitur Utama

- 🎙️ **Live Audio Broadcasting (WebRTC):** Siaran suara penyiar secara langsung dengan latensi minimal tanpa delay buffering radio konvensional.
- 📱 **Listener Interactive Portal (`/`):**
  - Pemutar audio terintegrasi (*one-click listen*) dengan visualizer audio responsif.
  - Chat Permohonan Doa (*Prayer Request*) real-time.
  - Tombol Reaksi Doa & Emoji interaktif (❤️, 🙏, 🕊️) dengan counter tersinkronisasi.
  - Indikator jumlah pendengar aktif (*Real-Time Listener Count*).
- 🎛️ **Operator Studio (`/operator`):**
  - Portal mikrofon penyiar untuk memulai dan mengakhiri siaran langsung.
  - Kontrol mic input, monitor level volume suara, dan status koneksi LiveKit room.
- 🔐 **Admin Dashboard & Control (`/admin` & `/login`):**
  - Manajemen status siaran (Live / Standby / Demo mode).
  - Manajemen setlist lagu dan integrasi audio background.
  - Proteksi otentikasi sesi berbasis PIN Admin.

---

## 🛠️ Tech Stack

| Komponen | Teknologi |
| :--- | :--- |
| **Framework Fullstack** | [Next.js 14](https://nextjs.org/) (App Router) |
| **Bahasa Pemrograman** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling & UI** | [Tailwind CSS](https://tailwindcss.com/) (Tema Dark & Responsive) |
| **WebRTC Audio Engine** | [LiveKit Cloud](https://livekit.io/) (`@livekit/components-react`, `livekit-client`) |
| **Realtime Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL + Realtime Publications) |
| **Deployment Platform** | [Vercel](https://vercel.com/) |

---

## 📂 Struktur Rute Aplikasi

```
app/
├── (public)
│   ├── page.tsx               ← Halaman Utama Pendengar (Player + Doa + Reaksi)
│   └── login/page.tsx         ← Halaman Login Admin / Operator
├── operator/page.tsx          ← Studio Penyiar / Mic Broadcaster
├── admin/page.tsx             ← Dashboard Kontrol Siaran
└── api/
    ├── livekit/route.ts       ← Token Generator WebRTC LiveKit
    └── auth/
        ├── login/route.ts     ← Handler Autentikasi Admin PIN
        └── logout/route.ts    ← Handler Logout Sesi
```

---

## 🚀 Panduan Instalasi Lokal

### 1. Clone Repositori
```bash
git clone https://github.com/zzdree/suara-fajar-deliksari.git
cd suara-fajar-deliksari
```

### 2. Install Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Salin template `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Lalu lengkapi nilainya:
```env
# LiveKit Configuration
LIVEKIT_URL=wss://your-project.livekit.cloud
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_ROOM_NAME=suara-fajar-deliksari
ADMIN_PIN=9900
ADMIN_SESSION_SECRET=your_secret_key_string
```

### 4. Setup Database Supabase
Buka **SQL Editor** pada dashboard proyek [Supabase](https://supabase.com) Anda, lalu jalankan script yang ada di:
👉 **[`lib/supabase/schema.sql`](lib/supabase/schema.sql)**

Script tersebut akan secara otomatis membuat tabel `app_state`, `chats`, `reactions`, `setlist`, `listeners`, serta mengaktifkan fungsi *Row Level Security (RLS)* dan *Realtime Publication*.

### 5. Jalankan Development Server
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

---

## ☁️ Panduan Deployment (Vercel)

Aplikasi ini dapat langsung dideploy ke [Vercel](https://vercel.com):

1. Push kode ke akun GitHub Anda.
2. Buka [Vercel Dashboard](https://vercel.com/new) dan impor repositori `suara-fajar-deliksari`.
3. Pada bagian **Environment Variables**, tambahkan semua variabel dari `.env.example`.
4. Klik **Deploy** 🚀.

---

## 👨‍💻 Author

- **Andreas Restuawanta Christwara** ([@zzdree](https://github.com/zzdree))

---

## 📜 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).
