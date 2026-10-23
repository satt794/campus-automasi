# 🎓 Campus Automasi

**Campus Automasi** adalah platform asisten akademik dan produktivitas terpadu untuk mahasiswa. Dibangun di atas Next.js (App Router), Supabase, dan Vercel Cron Jobs, platform ini mengotomatiskan rutinitas harian kampus—mulai dari manajemen jadwal kuliah dengan pengingat Telegram otomatis, pembagian skala prioritas tugas, pelacakan anggaran mingguan, hingga penyimpanan berkas kuliah.

---

## 🚀 Fitur Utama

1. **Finance Tracker (Pelacak Pengeluaran & Anggaran Mingguan)**
   - Pencatatan transaksi spesifik kebutuhan mahasiswa: `Transportasi`, `Uang Makan`, `Uang Print`, dan `Lain-lain`.
   - Pengaturan pagu anggaran mingguan (*weekly budget*) dengan kalkulasi sisa saldo secara dinamis dan *breakdown* pengeluaran berbasis kategori.

2. **File Management (Penyimpanan Berkas Akademik)**
   - Upload dan pengelolaan dokumen kuliah berbasis Supabase Storage dengan validasi format khusus: `.pdf`, `.ppt`, dan `.pptx` (maksimal 50MB).
   - Akses aman dan terisolasi per pengguna menggunakan *Row Level Security* (RLS) serta URL unduhan berbatas waktu (*signed URL*).

3. **Class Schedule & Bot Notifikasi Telegram**
   - Manajemen jadwal kuliah mingguan (hari, jam mulai/selesai, ruangan, dan dosen).
   - Cron Job otomatis (via Vercel Cron) yang mengecek database dan mengirimkan notifikasi pengingat ke Telegram pengguna **tepat 1 jam sebelum kelas dimulai**.

4. **Task Management (Klasifikasi Cerdas: Urgent vs Relax)**
   - Sistem otomatis membagi tugas aktif ke dalam dua kategori prioritas:
     - **Urgent**: Batas waktu pengumpulan kurang dari 3 hari (< 72 jam).
     - **Relax**: Batas waktu pengumpulan 3 hari atau lebih.
   - Pengingat harian otomatis melalui bot Telegram setiap pagi yang merangkum daftar seluruh tugas mendesak.

5. **Quick Notes dengan Debounced Auto-Save**
   - Catatan cepat responsif yang tersimpan otomatis ke database **1,5 detik** setelah pengguna berhenti mengetik (*debouncing*).
   - Dilengkapi status indikator visual (*unsaved*, *saving*, *saved*, *error*) tanpa memerlukan tombol simpan manual.

> 🌓 **Dark Mode**: Terintegrasi penuh dengan `next-themes` untuk transisi tema gelap dan terang yang mulus sesuai preferensi sistem pengguna.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js (App Router)](https://nextjs.org/)
- **UI & Styling**: [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [next-themes](https://github.com/pacocoursey/next-themes)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage, Row Level Security)
- **Automasi & Schedulers**: [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- **Notifikasi**: [Telegram Bot API](https://core.telegram.org/bots/api)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 💻 Panduan Menjalankan Secara Lokal (Local Development)

### 1. Prasyarat Sistem
- **Node.js**: Versi 18.17.0 atau lebih baru.
- **npm** atau **pnpm/yarn**.
- Akun dan project aktif di [Supabase](https://supabase.com).
- Token Bot Telegram dari [@BotFather](https://t.me/BotFather).

### 2. Kloning Repositori & Instalasi Dependensi
```bash
git clone https://github.com/username/campus-automasi.git
cd campus-automasi
npm install
```

### 3. Konfigurasi Environment Variables
Salin file template `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Buka `.env.local` dan isi seluruh variabel yang dibutuhkan (lihat petunjuk di dalam file `.env.example`).

### 4. Eksekusi Skema Database Supabase
1. Masuk ke [Supabase Dashboard](https://supabase.com/dashboard) project Anda.
2. Buka menu **SQL Editor**.
3. Buka file `supabase/schema.sql` pada repositori ini dan jalankan seluruh query SQL untuk membuat tabel, fungsi, RLS policy, serta storage bucket.

### 5. Menjalankan Server Development
Jalankan perintah berikut:
```bash
npm run dev
```
Buka browser dan akses aplikasi di: [http://localhost:3000](http://localhost:3000)

---

## ☁️ Deployment ke Vercel

1. Push repositori ini ke GitHub.
2. Impor project ke **Vercel**.
3. Daftarkan seluruh *Environment Variables* dari `.env.local` ke menu **Settings > Environment Variables** di dashboard Vercel.
4. Vercel akan otomatis mengenali konfigurasi cron job yang tertera pada file `vercel.json`.
