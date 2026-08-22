# 🎨 Design System & Specification (DESIGN.md)
# Suara Fajar Deliksari — "Dawn of Grace" (Fajar Kasih)

---

## 1. Filosofi & Konsep Visual

Tema desain **"Dawn of Grace" (Fajar Kasih)** dirancang khusus untuk menciptakan suasana saat teduh, khidmat, dan teduh di mata jemaat yang beribadah pada subuh hari (pukul 04.45 – 05.45 WIB).

* **Quiet Reverence (Keheningan Sakral)**: Menggunakan latar belakang gelap bernuansa fajar (*deep maroon-charcoal* `#0c080a` dan `#180e12`) untuk menghindari silau layar HP saat bangun tidur.
* **Warm Amber Dawn Accent (Fajar Keemasan)**: Aksen keemasan lembut (`#f59e0b` / `#fbbf24`) melambangkan terbitnya fajar dan kasih anugerah yang baru setiap pagi (Ratapan 3:22-23).
* **Glassmorphism & Sacred Glow**: Efek kaca tembus pandang lembut (*frosted glass panels*) dengan border tipis berpendar halus memberi kesan modern, elegan, dan menenangkan.

---

## 2. Palet Warna & Token Desain

```css
:root {
  /* Surface & Background */
  --bg-dawn-deep: #0c080a;       /* Latar belakang utama (Deep Dawn) */
  --bg-dawn-surface: #180e12;    /* Permukaan card (Soft Mahogany) */
  --bg-dawn-elevated: #24141a;   /* Permukaan modal/panel */

  /* Primary Accent: Amber Gold */
  --gold-50: #fffbeb;
  --gold-200: #fde68a;
  --gold-400: #fbbf24;
  --gold-500: #f59e0b;          /* Warna aksen primer */
  --gold-600: #d97706;
  --gold-950: #451a03;

  /* State Colors */
  --state-live: #ef4444;         /* On-Air Red Pulse */
  --state-online: #10b981;       /* Connected / Active Emerald */
  --state-standby: #eab308;      /* Standby Amber */

  /* Glassmorphism Overlays */
  --glass-bg: rgba(24, 14, 18, 0.65);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-border-hover: rgba(245, 158, 11, 0.35);
  --glass-shadow: 0 16px 40px -8px rgba(0, 0, 0, 0.5);
}
```

---

## 3. Tipografi & Hirarki Teks

| Peran | Font Family | Contoh Penggunaan | Karakteristik |
| :--- | :--- | :--- | :--- |
| **Heading & Titel Sakral** | `Cormorant Garamond`, `Cinzel`, `Georgia`, serif | Judul Aplikasi, Ayat Alkitab, Nama Sesi Doa | Anggun, sakral, klasik, huruf berbobot jelas tanpa italic berlebihan. |
| **Body & UI Data** | `Plus Jakarta Sans`, `Inter`, `sans-serif` | Konten Doa, Tombol, Form Input, Jam & Angka | Sangat jelas terbaca di layar ponsel kecil, spasi huruf teratur. |
| **Data Monospace** | `JetBrains Mono`, `Consolas`, `monospace` | Jam Rundown, Durasi Siaran, Counter Reaksi | Rata angka tabular (*tabular figures*) agar layout tidak bergeser saat nilai berubah. |

---

## 4. Spesifikasi Komponen Utama

### A. Hero Audio Player (`AudioReceiver.tsx`)
* **Wujud Visual**: Panel kaca melengkung (radius 24px) dengan latar belakang gradien halus fajar.
* **Elemen Interaksi**:
  * Tombol Play/Pause utama berdiameter 64px dengan ikon dinamis dan bayangan pendar emas.
  * Indikator status koneksi:
    - 🔴 **LIVE ON AIR**: Animasi ping merah berdenyut saat siaran mikrofon aktif.
    - 🟢 **TERHUBUNG**: Status penerimaan audio siap.
    - 🟡 **STANDBY**: Menunggu penyiar memulai doa.
  * **Gelombang Audio (*Waveform Visualizer*)**: 4 batang animasi berosilasi lembut saat audio menyala untuk memberikan kepastian visual bahwa siaran sedang berjalan.
  * **Volume Slider**: Slider emas dengan tombol mute cepat.

### B. Indikator Jumlah Jemaat (`LiveListenerCounter.tsx`)
* **Wujud Visual**: Pill badge berbentuk kapsul mengapung di header.
* **Interaksi**: Titik hijau berdenyut (*emerald ping*) + angka jemaat tebal emas (*"X Jemaat Bersama"*).

### C. Dinding & Form Doa (`PrayerSection.tsx`)
* **Tab Switcher**: Dua mode — `Dinding Doa (Feed)` dan `✍️ Titip Doa (Form)`.
* **Feed Doa**:
  * Avatar inisial bergradien emas-marun.
  * Nama pengirim tebal berwarna terang + timestamp waktu kirim.
  * Isi pokok permohonan doa dalam teks yang kontras dan nyaman dibaca.
  * Transisi halus saat ada pokok doa baru yang masuk.
* **Form Doa**:
  * Input Nama dengan auto-memory ke `localStorage` (jemaat tidak perlu mengetik ulang setiap hari).
  * Textarea pokok doa dengan tombol kirim beranimasi kirim (*"Kirimkan ke Studio"*).

### D. Reaksi Iman Interaktif (`ReactionButtons.tsx`)
* **Grid 4 Tombol**:
  1. 🙏 **Amin** (*Pernyataan Iman*)
  2. ❤️ **Kasih** (*Kasih Persaudaraan*)
  3. 🕊️ **Damai** (*Damai Sejahtera*)
  4. ✝️ **Syukur** (*Pujian bagi Kristus*)
* **Micro-Interaction**:
  * *Scale tap* (efek mengecil dan membesar saat ditekan).
  * *Floating Particle Burst*: Partikel emoji melayang ke atas dengan rotasi dan efek memudar (*fade-out*).
  * Optimistic UI update (counter langsung bertambah sebelum respon database tiba).

### E. Rundown Doa Fajar (`ScheduleCard.tsx`)
* **Wujud Visual**: Daftar slot waktu dengan penanda titik fajar.
* **Fitur Dinamis**:
  * Deteksi waktu jam sistem jemaat secara otomatis.
  * Kartu jadwal yang sedang berlangsung otomatis berubah warna menjadi emas terang dengan badge `"BERLANGSUNG"`.

### F. Studio Penyiar & Admin (`BroadcasterStudio.tsx` & `LiveFeedbackPanel.tsx`)
* **Studio Mikrofon**: Tombol On-Air besar merah/hijau yang mudah ditekan dengan sekali sentuh oleh penyiar.
* **Moderasi Pokok Doa**: Panel permohonan doa yang mudah dibaca dari jarak 50cm (mode tablet/laptop penyiar) dengan tombol checklist *"Tandai Didoakan"*.

---

## 5. Standar Aksesibilitas (WCAG 2.1 AA) & Responsivitas

1. **Rasio Kontras**: Teks putih dan teks emas di atas latar belakang `#0c080a` memiliki rasio kontras > 7.5:1 (melebihi standar minimum AA 4.5:1).
2. **Ukuran Target Sentuh (Touch Target)**: Semua tombol memiliki dimensi minimal 44x44px untuk kenyamanan sentuhan jari pada layar smartphone.
3. **Mobile-First Responsive Grid**:
   - Layar Ponsel (< 768px): Tata letak linear 1 kolom vertikal dengan scrolling nyaman.
   - Layar Tablet & Desktop (≥ 768px): Grid 12-kolom (Hero Player di atas, 7 kolom untuk Dinding Doa, 5 kolom untuk Reaksi + Jadwal).
