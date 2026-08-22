# MASTER PLAN (MD) - SUARA FAJAR DELIKSARI

## 0. SYSTEM PROMPT & ROLE INSTRUCTIONS (WAJIB DIBACA SEBELUM EKSEKUSI)

**[PERSONA]**
Kamu adalah "Antigravity DevTeam", sebuah entitas AI tingkat enterprise yang terdiri dari 3 peran utama yang bekerja secara simultan:
1. **Senior Auditor (Lead):** Bertanggung jawab menganalisa file referensi (`prompt.txt`), memastikan tidak ada satupun instruksi yang terlewat, dan menjaga kesesuaian hasil dengan dokumen spesifikasi master plan ini.
2. **System Architect (Backend & Infra):** Ahli dalam tech stack LiveKit, Supabase, Vercel, dan manajemen API. Bertanggung jawab atas efisiensi aliran data, keamanan (K3 security), dan skema struktur database realtime.
3. **UI/UX & Frontend Expert:** Spesialis desain antarmuka, pembuat animasi CSS yang smooth, dan memastikan pixel-perfect design sesuai panduan Color System & Typography.

**[WORKFLOW & CARA BERPIKIR]**
Saat menerima perintah untuk mengerjakan fitur apa pun dalam proyek ini, kamu **WAJIB** mengikuti alur pemikiran berikut:
* **Langkah 1 (Audit & Plan):** Baca dan ekstraksi informasi dari `prompt.txt` dan `plan.md`. Buat daftar checklist mental tentang apa yang harus dibangun.
* **Langkah 2 (Chain of Thought):** Jelaskan secara singkat (maksimal 3 kalimat) pendekatan arsitektur, state management, atau komponen apa saja yang akan kamu sentuh.
* **Langkah 3 (Execute):** Tulis kode dengan rapi. Gunakan skills MCP yang terinstal di IDE untuk membaca/membuat file, menjalankan command, atau mengecek struktur folder. Kerjakan secara **bertahap per komponen/halaman**, jangan memaksakan menulis semua sistem dalam satu kali generate.
* **Langkah 4 (Self-Review):** Setelah kode ditulis, evaluasi sendiri secara internal: Apakah sudah mematuhi Global Design System? Apakah logika realtime-nya sudah benar? Jika belum, segera lakukan self-correction pada kodenya.

**[STRICT CONSTRAINTS (BATASAN MUTLAK)]**
1. **NO PLACEHOLDERS:** Tulis kode yang production-ready. Jangan gunakan komentar pemalas seperti `// tambahkan logika disini`. Langsung tulis dan selesaikan logikanya.
2. **STRICT STYLING:** Patuhi secara mutlak Button Color System, aturan gradien, opacity 10%-33%-67%-100%, border putih 10%, dan shadow tipis yang ada di dokumen ini.
3. **BAHASA KODE:** Gunakan istilah teknis Bahasa Inggris untuk variabel/fungsi/state (contoh: `handlePlayStream()`), dan Bahasa Indonesia untuk label UI, komentar logika, atau teks frontend (contoh: `// Fungsi untuk memutar stream jemaat`).
4. **INTEGRASI PRIORITAS:** Pastikan semua state aplikasi (online/offline, metrics pendengar, komentar TikTok-style, setlist memori) tersentralisasi dan tersinkronisasi secara realtime penuh antara `/admin` dan `/stream` menggunakan Supabase.

---

## 1. IDENTITAS & TARGET PROYEK
* **Nama Proyek**: Suara Fajar Deliksari
* **Tagline**: Ibadah dan Doa Pagi
* **Organisasi**: Gereja Isa Almasih Deliksari Semarang
* **Tim Pengelola**: Multimedia GIA Deliksari Semarang
* **Tahun**: 2026
* **Versi**: 1.1 (Production Active - Audited & Synced)
* **Target Audiens**: Jemaat menggunakan HP low-end hingga mid-range. Pemakaian utama mode portrait. Akses langsung via browser (tanpa login/instal).
* **Target Operator (Admin)**: Diutamakan untuk laptop i5/i7 Gen 8 dan HP mid-range (Samsung s24fe, a06, a07). Aplikasi harus sangat efisien (resource-friendly).

## 2. ARSITEKTUR & TECH STACK
* **Infrastruktur**: Vercel (Deployment), GitHub (Repository).
* **Realtime Media & Audio**: LiveKit (WebRTC).
* **Database & Auth**: Supabase (Menyimpan log chat/react realtime, state aplikasi, memori setlist, konfigurasi & session admin).
* **Eksternal API**: YouTube API (Untuk embed video realtime dan import playlist).
* **Mode Operasi (Demo/Real)**: Siapkan fitur integrasi mode "Demo" (simulasi UI statis lokal untuk testing angka/state) dan implementasi "Real" menggunakan Supabase untuk sinkronisasi page `/stream` dan `/admin`.

---

## 3. GLOBAL DESIGN SYSTEM
Desain, style, dan branding diadaptasi khusus untuk proyek ini dengan mengambil referensi utama dari *Sela Radio Bukit Doa Getsemani*. Semua animasi dan CSS (transisi, wipe, pulse) harus smooth.

### A. Konsep Visual (Background & Panel)
* **Background Base**: Radial gradient warna merah maroon (4 tahap) dengan pembagian opacity 0%, 25%, 50%, 75%.
* **Card / Panel / Rounded Box**: Menggunakan radial gradient yang sama dengan background. Diberikan border/outline putih transparan halus (opacity 10%) dan shadow tipis.
* **Surface 16:9 (Video/Media)**: Dark radial gradient dengan opacity 100%, 67%, 33%. Border putih 10% dan shadow tipis.
* **Surface Transparan (Empty state/Input)**: Warna white transparent flat 5% dengan border putih 10%, tanpa shadow.
* **Garis Pembatas**: Gunakan garis horizontal tipis putih untuk membatasi area panel dengan footer.

### B. Konsep Warna Tombol (Button Color System)
| Tipe Tombol | Kondisi | Warna Base | Pembagian Opacity | Border (Outline) |
| :--- | :--- | :--- | :--- | :--- |
| **Accent Primary** | Default Action | Gold (Base, Middle, Dark) | 100%, 67%, 33% | 10% (Idle) -> 20% (Hover) |
| **Accent Secondary** | Aktif / Toggled | Merah, Hijau, Biru, Ungu | 100%, 67%, 33% | 10% (Idle) -> 20% (Hover) |
| **White Transparan** | Idle (Belum Aktif)| Putih Transparan | 5% Flat | 10% (Idle) -> 20% (Hover) |

*Catatan: Shadow/glow tipis menyesuaikan aktif/tidaknya tombol. Teks di dalam tombol (selain yang putih transparan) menggunakan warna base tergelap dari aksen tombol tersebut (contoh: tombol hijau, teks warna hijau paling gelap).*

### C. Tipografi
Kombinasi font minimalis: Sans Serif dan Serif. Variasikan weight (Bold/Black/Light/Normal) dan style (Italic).
* **Big text head**: Judul halaman (Administrator Panel, Login Panel).
* **Middle text head**: Judul panel utama.
* **Middle text box**: Label indikator di atas rounded box.
* **Middle text knob**: Label button medium (Keluar, Masuk, Demo, Toggle Text).
* **Small text knob**: Label button/trigger kecil (Play, Stop, Delete, Kirim, Tambah).
* **Light text box**: Teks empty state ("no signal", "no media", "belum ada komentar").
* **Bible verse**: Teks ayat (Serif Italic diapit tanda kutip), referensi kitab (Sans Serif Normal).

---

## 4. SPESIFIKASI HALAMAN (PAGE FLOW & LOGIC)

### PAGE 1: `/login` (Autentikasi Admin)
* **Desain Komponen**: Rounded box (lebar identik dengan panel admin).
* **Isi**: Header "login panel" (Big text head), Kolom input PIN dengan error state, Tombol lebar "Masuk" aksen Gold (Middle text knob).
* **Konfigurasi Auth**: Password default adalah `9900` (disimpan di `.env` dan sistem tabel config Supabase). Gunakan session authentication.
* **Footer**: Terdapat credit footer paling bawah.

### PAGE 2: `/admin` (Administrator Panel)
Layout memuat 3 panel utama. Responsive logic: Di laptop berjajar horizontal 3 ke samping (Grid scale 100%). Di HP berjajar vertikal 3 ke bawah.
* **Header Bar**: Kiri: "administrator panel" (Black Italic). Kanan: Tombol "Keluar" (Merah, redirect ke login) dan Tombol "Demo" (Gold saat off, Hijau saat on).

**Panel 1: Stream Control (Tengah Halaman)**
* **Program View (16:9)**: Layar pemantau realtime (YouTube embed / Camera LiveKit / Blackout). Jika off, muncul light text "no signal".
* **Audio View**: Rounded box panjang white transparent. Berisi 20 bar audio visualizer realtime yang merespon input media/mic (bentuk `|||||||` tumbuh dari tengah ke atas-bawah).
* **6 Tombol Kontrol (Grid 3x2)**:
    * Atas: Media, Microphone, Mute. (Jika aktif, beraksen Merah).
    * Bawah: Youtube, Camera, Blackout. (Jika aktif, beraksen Hijau).
    * UI Tombol: White transparan, memiliki toggle switch horizontal di bagian dalam (atas), dan keterangan teks di bawahnya.
* **Logic Sync Button**: Kotak panjang "sync" dengan toggle di kanan (Aksen Gold).
    * Jika *Sync ON*: Klik Media/Youtube otomatis on keduanya. Klik Mic/Camera otomatis on keduanya. Klik Mute/Blackout mematikan semua 4 media tersebut.
    * Jika *Sync OFF*: Berjalan independen. Mute mematikan Media & Mic. Blackout mematikan Youtube & Camera.
* **Device Select**: 3 Dropdown minimalis untuk (Media, Microphone, Camera). Mampu membaca real hardware device, terdapat opsi "Default" (OS system).

**Panel 2: Live Feedback**
* **Header Area**: Kiri: Titik kedip (pulse) + teks status Online/Offline. Kanan: Ikon user + angka realtime pendengar. (Status Online: ada siaran atau masuk jam 04.45 - 05.45).
* **Rundown**: Tabel minimalis white transparent: 04.45-05.00 (Lagu Pembuka), 05.00-05.05 (Doa Pembuka), 05.05-05.10 (Worship), 05.10-05.25 (Firman), 05.25-05.30 (Doa Penutup), 05.30-05.45 (Lagu Penutup).
* **Chatbox (TikTok Style)**: Numpuk max 6 komentar ke atas. Opacity: 4 terbawah (100%), ke-5 (67%), ke-6 (33%). Komentar berupa: Inisial, Nama, Waktu, Pesan.
* **Kirim Komentar**: Kolom input transparent 10% dan tombol Kirim (Gold, small text). Nama otomatis diset "admin".
* **React Counter**: 2 kotak besar status untuk hitungan Suka dan Salam (beserta ikon emoji besar). Otomatis reset harian (namun log disimpan di database).

**Panel 3: Media Control**
* **YouTube View 16:9 & Judul**: Menampilkan output YouTube realtime. Jika kosong muncul tulisan "no media" dan "no title".
* **Volume Slider**: Horizontal UI (Kiri status angka putih, kanan slider gold). Default 80.
* **Setlist Memory System**:
    * Peringatan Box Kuning Transparan: Muncul tulisan peringatan jika antrian `< 3` lagu.
    * 5 Tombol Action: Play (Hijau), Stop (Gold), Fade In/Out (Biru, fade volume ke 0 -> pause/play), Shuffle (Ungu), Delete All (Merah). 
    * *Logic Shuffle*: Acak semua setlist, *kecuali* lagu yang sedang terputar akan otomatis menjadi nomor urutan 1, sisanya diacak di bawahnya.
* **Input YouTube**: Kolom input URL/Playlist + tombol "Tambah" Gold. Limit playlist via API maksimal 20 lagu.
* **List Antrian**: 
    * UI drag-and-drop secara vertikal.
    * Indikator angka nomor antrian.
    * Judul/Link video.
    * Tombol action individu: Play (Hijau -> berubah jadi Stop Merah jika dimainkan), dan X/Delete (Merah).
    * Auto-save playlist memory ke database (agar besok tetap ada tanpa auto-schedule).

### PAGE 3: `/stream` (Halaman Publik Jemaat)
* **Header**: Teks putih "Suara Fajar Deliksari" dan teks Gold Serif Italic "Worship and Morning Prayer". (Tidak ada tombol admin).
* **Program View 16:9**: Absolute Mirroring dari kontrol Admin (Panel 1).
* **Main Action Button**: Tombol Play besar (Ikon segitiga Gold). Saat diklik: circle loading. Saat on: Tombol berubah jadi kotak Stop dengan animasi pulse gelombang memancar. Jika offline: Muncul tanda seru ("tidak ada siaran").
* **Chatbox View**: Menampilkan chat realtime bergaya TikTok seperti Panel 2 Admin, tapi **tanpa** kolom input.
* **4 Tombol Interaksi Floating (Suka, Salam, Komentar, Bagikan)**:
    * React (Suka/Salam): Diklik akan memunculkan animasi ikon/emoji melayang mengekor ke atas lalu menghilang (TikTok style react).
    * Komentar: Memunculkan pop-up modal. Isi modal: "Nama (Opsional)" (jika kosong = anonim), "Pesan", tombol Batal (Merah), tombol Kirim (Gold). Tidak bisa kirim jika pesan kosong.
    * Bagikan: Klik langsung copy link ke clipboard dan trigger native share OS (Android/Windows).
* **Bible Verse Ticker**: Teks berjalan di bagian bawah panel (font Serif Italic diapit tanda kutip). Berganti tiap 30 detik menggunakan animasi wipe smooth (pudar/dihapus dari kiri ke kanan). Sediakan array 200 data ayat.

---

## 6. CHANGELOG & AUDIT LOG

### [v1.1] - 2026-08-23
- **Auditor & Lead Execution**: Selesai audit menyeluruh dan sinkronisasi dua arah kode ↔ PLAN.md.
- **Bible Verse Ticker**: Selesai implementasi 200 data ayat Alkitab (`lib/bible-verses.ts`) dengan rotasi 30 detik dan transisi smooth wipe.
- **Admin Workspace 3-Panel**: Selesai implementasi Stream Control (Program View 16:9, Audio Visualizer 20-bar, 6 grid tombol media/signal dengan sync logic, hardware device select), Live Feedback (Rundown fajar 04.45-05.45, TikTok Chatbox, React Counter Suka & Salam), dan Media Control (YouTube 16:9 monitor, volume slider, setlist memory queue, shuffle, fade in/out, add video).
- **Public Stream (`/stream` & `/`)**: Selesai sinkronisasi Program View 16:9 mirroring, AudioReceiver dengan big Gold Play triangle / Stop pulse waves, TikTok Chatbox tanpa form input statis, 4 floating buttons (Suka 👍, Salam 🕊️, Komentar 💬 dengan pop-up modal, Bagikan ↗️ dengan clipboard & native share).
- **Database Realtime Sync**: Sinkronisasi Supabase Realtime untuk tabel `app_state`, `chats`, `reactions`, `setlist`, dan `listeners`.
- **LiveKit WebRTC Integration**: Perbaikan token JWT LiveKit asinkron (`await at.toJwt()`) dan audio room streaming.
- **Design System Alignment**: Penerapan penuh Sela Radio Getsemani radial maroon gradients, button color system (Gold/Red/Green/Blue/Purple), dan typography hierarchy.