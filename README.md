# 📻 Suara Fajar Deliksari — Live Audio Streaming Radio & Komunitas Doa Pagi

> Platform Web Live-Streaming Audio WebRTC untuk siaran Radio Doa Pagi Gereja (**Gereja Isa Almasih Deliksari Semarang**) dengan latensi ultra-rendah (<500ms) dan fitur interaktif real-time (Dinding Doa, Reaksi Iman, dan Studio Mikrofon Penyiar).

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![LiveKit](https://img.shields.io/badge/Audio-LiveKit_WebRTC-002B36?style=for-the-badge&logo=livekit&logoColor=white)](https://livekit.io/)
[![Supabase](https://img.shields.io/badge/Database-Supabase_Realtime-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

---

## 🌐 Live Production Links

| Layanan | Tautan Akses | Keterangan |
| :--- | :--- | :--- |
| 🎧 **Portal Pendengar (Jemaat)** | [**`https://suara-fajar-deliksari.vercel.app`**](https://suara-fajar-deliksari.vercel.app) | Siaran audio live fajar, Dinding Doa, Reaksi Iman, Rundown |
| 🎙️ **Studio Operator & Admin** | [**`https://suara-fajar-deliksari.vercel.app/login`**](https://suara-fajar-deliksari.vercel.app/login) | Broadcaster Mic On-Air, Moderasi Doa Jemaat *(PIN Default: `9900`)* |
| 📁 **GitHub Repository** | [**`https://github.com/zzdree/suara-fajar-deliksari`**](https://github.com/zzdree/suara-fajar-deliksari) | Source code, arsitektur, dan pelacakan versi |

---

## 📑 Dokumentasi Lengkap Proyek

* 📋 [**`PRD.md` (Product Requirements Document)**](PRD.md) — Rincian visi produk, alur pengguna, fitur fungsional, dan matriks arsitektur teknis.
* 🎨 [**`DESIGN.md` (Design System Specification)**](DESIGN.md) — Filosofi desain *"Dawn of Grace"* (Fajar Kasih), palet warna, tipografi, dan panduan interaksi UI.

---

## ✨ Fitur Utama

### 1. 🎧 Portal Pendengar Jemaat (`/`)
- **Hero WebRTC Audio Player**: Putar audio siaran fajar satu sentuhan dengan visualizer gelombang suara animasi (*audio waveform bars*), indikator status siaran (*Live On Air* / *Standby*), dan pengatur volume.
- **Indikator Jemaat Bersama**: Real-time heartbeat yang menampilkan jumlah jemaat yang sedang terkoneksi secara langsung.
- **Persekutuan Doa Fajar**:
  - **✍️ Form Titip Doa**: Pengiriman permohonan doa instan ke studio siaran.
  - **🕊️ Dinding Doa Live**: Feed permohonan doa jemaat yang ter-update otomatis secara real-time via Supabase.
- **Reaksi Iman Interaktif (🙏 Amin, ❤️ Kasih, 🕊️ Damai, ✝️ Syukur)**: Animasi partikel melayang (*floating burst*) saat disentuh serta counter yang tersinkronisasi.
- **Jadwal & Rundown Doa**: Menampilkan agenda doa fajar setiap hari (04:45 - 05:45 WIB).

### 2. 🎙️ Studio Operator & Dashboard Admin (`/admin`)
- **Studio Mikrofon Penyiar Browser**: Broadcaster langsung dari browser via WebRTC LiveKit tanpa perlu aplikasi pihak ketiga.
- **Live Prayer Moderation**: Monitor permohonan doa masuk dengan tombol *"Tandai Didoakan"* untuk memudahkan pelayan firman/penyiar membacakan pokok doa di udara.
- **Statistik Interaksi Realtime**: Total akumulasi reaksi iman jemaat dan jumlah pendengar aktif.
- **Proteksi Akses**: Login berbasis PIN Administrator dengan cookie sesi terenkripsi.

---

## 🛠️ Tech Stack

| Komponen | Teknologi |
| :--- | :--- |
| **Framework Fullstack** | [Next.js 14](https://nextjs.org/) (App Router) |
| **Bahasa Pemrograman** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling & UI** | [Tailwind CSS](https://tailwindcss.com/) + Custom Glassmorphism System |
| **WebRTC Audio Engine** | [LiveKit Cloud](https://livekit.io/) (`@livekit/components-react`, `livekit-client`) |
| **Realtime Database** | [Supabase](https://supabase.com/) (PostgreSQL + Realtime Channel) |
| **Deployment** | [Vercel](https://vercel.com/) |

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
Salin `.env.example` ke `.env.local`:
```bash
cp .env.example .env.local
```
Lengkapi nilai konfigurasi:
```env
# LiveKit Cloud
LIVEKIT_URL=wss://your-project.livekit.cloud
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App & Auth
NEXT_PUBLIC_ROOM_NAME=suara-fajar-deliksari
ADMIN_PIN=9900
ADMIN_SESSION_SECRET=your_secret_key_string
```

### 4. Setup Database Supabase
Buka **SQL Editor** pada dashboard proyek [Supabase](https://supabase.com), lalu jalankan script DDL:
👉 [**`lib/supabase/schema.sql`**](lib/supabase/schema.sql)

Aktifkan **Realtime Replication** pada tabel `app_state`, `chats`, `reactions`, `setlist`, `listeners` di menu *Database ➔ Publications*.

### 5. Jalankan Development Server
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

---

## ☁️ Deployment (Vercel)

Proyek ini telah dikonfigurasi untuk auto-deploy di **Vercel**:
* **Production Alias**: [https://suara-fajar-deliksari.vercel.app](https://suara-fajar-deliksari.vercel.app)

---

## 👨‍💻 Kontributor

- **Andreas Restuawanta Christwara** ([@zzdree](https://github.com/zzdree))
- **Multimedia & Broadcast Ministry GIA Deliksari Semarang**

---

## 📜 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).
