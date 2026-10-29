# User API

API sederhana untuk mengelola data pengguna, dibuat dengan Node.js, Express.js, dan MySQL. Proyek ini dipakai untuk praktikum kolaborasi GitHub: issue, branch, commit, pull request, dan code review.

## Persyaratan

- Node.js versi 18 atau lebih baru
- npm (sudah terpasang bersama Node.js)
- MySQL yang berjalan di komputer lokal, misalnya lewat XAMPP atau Laragon

## Instalasi dan menjalankan

1. Jalankan MySQL dari XAMPP atau Laragon.
2. Salin file contoh konfigurasi menjadi `.env`:

   ```bash
   # macOS / Linux
   cp .env.example .env

   # Windows (Command Prompt)
   copy .env.example .env
   ```

3. Buka `.env`, lalu sesuaikan `DB_USER`, `DB_PASSWORD`, dan `DB_PORT` dengan MySQL di komputer kamu. Jika port 3306 sudah dipakai aplikasi lain, jalankan MySQL di port lain (misalnya 3307) dan isi `DB_PORT` dengan port tersebut.
4. Pasang dependency dan jalankan server:

   ```bash
   npm install
   npm run dev
   ```

Server berjalan di `http://localhost:3000`. Database dan tabel `users` dibuat otomatis saat server pertama kali dijalankan, lengkap dengan dua data pengguna contoh.

## Konfigurasi (.env)

| Variabel | Keterangan | Contoh |
|---|---|---|
| `PORT` | Port server API | `3000` |
| `DB_HOST` | Alamat server MySQL | `127.0.0.1` |
| `DB_PORT` | Port MySQL | `3306` |
| `DB_USER` | Username MySQL | `root` |
| `DB_PASSWORD` | Password MySQL (kosong untuk bawaan XAMPP/Laragon) | |
| `DB_NAME` | Nama database | `userdb` |

## Daftar endpoint

| Method | Path | Deskripsi |
|---|---|---|
| GET | `/` | Cek bahwa API berjalan |
| GET | `/health` | Cek koneksi ke database |
| GET | `/users` | Mengambil daftar pengguna |
| GET | `/users/:id` | Mengambil satu pengguna berdasarkan ID |

Detail parameter, contoh request, dan contoh respons belum didokumentasikan.
