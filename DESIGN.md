# 🎨 Design System Document (DESIGN.md)
## Suara Fajar Deliksari — "Dawn of Grace" (Fajar Kasih)

---

## 1. Konsep & Filosofi Desain

Aplikasi ini digunakan terutama pada waktu fajar (pukul 04.30 - 06.00 WIB) saat jemaat bangun untuk berdoa. Oleh karena itu, filosofi desain didasarkan pada:
- **Kenyamanan Mata di Kegelapan (Dark Dawn Theme)**: Menghindari background putih menyilaukan; menggunakan gradasi langit fajar (deep slate, dark burgundy fajar, dan aksen emas hangat).
- **Ketenangan & Spiritualitas (Spiritual Elegance)**: Tipografi elegan (perpaduan Serif klasik *Cormorant Garamond* untuk judul suci & *Inter/Plus Jakarta Sans* untuk keterbacaan tinggi).
- **Komunitas yang Hidup**: Feedback visual interaktif (gelombang suara saat berbicara, partikel doa melayang saat klik reaksi, dan feed doa jemaat).

---

## 2. Palet Warna (Color Palette Tokens)

```
Background Primary   : #0D090A (Malam Fajar Pekat)
Background Secondary : #181114 (Permukaan Glassmorphism Fajar)
Background Elevated  : #24171D (Card & Panel Mengambang)

Accent Gold (Fajar)  : #F59E0B (Emas Hangat / Amber 500)
Accent Gold Light    : #FDE68A (Cahaya Emas / Amber 200)
Accent Crimson       : #E11D48 (Kasih Fajar / Rose 600)
Accent Emerald (Live): #10B981 (On-Air / Terhubung)

Text Primary         : #F8FAFC (Putih Bersih 98%)
Text Secondary       : #CBD5E1 (Abu Lembut 80%)
Text Muted           : #94A3B8 (Abu Redup 60%)
Border Subtle        : rgba(255, 255, 255, 0.08)
Border Glowing       : rgba(245, 158, 11, 0.25)
```

---

## 3. Tipografi (Typography Hierarchy)

- **Headings & Titles**: `Cormorant Garamond`, serif, font-weight 600-700 (memberikan kesan sakral, damai, dan anggun).
- **Body & Controls**: `Inter` / `system-ui`, sans-serif, font-weight 400, 500, 600 (memberikan legibilitas maksimal di layar HP).
- **Sub-label & Badges**: Uppercase, tracking-widest (0.15em), font-weight 700.

---

## 4. Struktur Komponen UI

### 1. **Header & Status Banner**
- Logo Suara Fajar Deliksari dengan ornamen fajar.
- Indikator Live Badge (Pulsing Red/Gold Dot saat siaran aktif).
- Counter Pendengar Bersama (*"12 Jemaat Berdoa Bersama"*).

### 2. **Hero Audio Card (Pusat Siaran)**
- Visualizer gelombang suara dinamis (*audio frequency bars*) yang bergerak hidup saat audio tersambung.
- Tombol Putar Utama yang menonjol dan ramah sentuhan jempol (*thumb-friendly* di HP).
- Slider volume halus dengan ikon mute/unmute instan.

### 3. **Dinding Doa & Form Titip Doa (Prayer Section)**
- Tabs / Grid terpadu: Form kirim doa di atas/samping, dan Feed permohonan doa langsung dari jemaat lain dengan inisial avatar yang elegan.
- Animasi transisi saat permohonan doa baru masuk.

### 4. **Bar Reaksi Cepat (Faith Reaction Bar)**
- Tombol reaksi kaca (glass pill) dengan hitungan live:
  - 🙏 **Amin** (Doa Terkabul)
  - ❤️ **Kasih** (Kasih Kristus)
  - 🕊️ **Damai** (Damai Sejahtera)
  - ✝️ **Syukur** (Puji Tuhan)
- Efek mikro: Emoji melayang ke atas (*floating burst*) saat tombol ditekan.

### 5. **Jadwal & Agenda Fajar**
- Card ringkas menampilkan rundown ibadah fajar (Musik, Firman, Doa Syafaat) dengan highlight jadwal yang sedang berlangsung.

---

## 5. Prinsip UX & Responsivitas
- **Mobile First**: 90% jemaat mengakses melalui smartphone; seluruh kontrol diletakkan dalam jangkauan 1 jempol.
- **Feedback Langsung**: Setiap aksi (kirim doa, klik reaksi, putar audio) memberikan respons visual instan (*optimistic UI*).
- **Zero Confusion**: Hilangkan elemen yang tidak perlu dan pastikan tombol utama sangat jelas.
