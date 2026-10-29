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

## Dokumentasi API

### Base URL

```text
http://localhost:3000
```

Semua endpoint menggunakan HTTP dan mengembalikan respons dalam format JSON. Untuk endpoint yang tidak menerima parameter, tabel parameter tetap disediakan untuk memperjelas penggunaannya.

### Daftar endpoint

| Method | Path | Deskripsi |
|---|---|---|
| GET | `/` | Memeriksa apakah API berjalan |
| GET | `/health` | Memeriksa koneksi database |
| GET | `/users` | Mengambil daftar pengguna |
| GET | `/users/:id` | Mengambil satu pengguna berdasarkan ID |
| POST | `/users/register` | Mendaftarkan pengguna baru |

---

### 1. GET `/` — Cek API

Memeriksa apakah server API berjalan.

#### Parameter

Endpoint ini tidak membutuhkan parameter.

| Nama | Lokasi | Tipe | Wajib/opsional | Nilai bawaan | Keterangan |
|---|---|---|---|---|---|
| — | — | — | — | — | Tidak ada parameter yang diperlukan. |

#### Contoh request

```bash
curl -i http://localhost:3000/
```

#### Respons sukses

**Status: `200 OK`**

```json
{
  "message": "User API berjalan"
}
```

---

### 2. GET `/health` — Cek koneksi database

Memeriksa koneksi database dengan menjalankan query sederhana pada MySQL.

#### Parameter

Endpoint ini tidak membutuhkan parameter.

| Nama | Lokasi | Tipe | Wajib/opsional | Nilai bawaan | Keterangan |
|---|---|---|---|---|---|
| — | — | — | — | — | Tidak ada parameter yang diperlukan. |

#### Contoh request

```bash
curl -i http://localhost:3000/health
```

#### Respons sukses

**Status: `200 OK`**

```json
{
  "status": "ok",
  "database": "terhubung"
}
```

#### Kemungkinan respons error

**Status: `503 Service Unavailable`**

Dikembalikan apabila query pemeriksaan database gagal.

```json
{
  "status": "error",
  "database": "tidak terhubung"
}
```

---

### 3. GET `/users` — Mengambil daftar pengguna

Mengambil daftar pengguna dari database berdasarkan urutan `id` menaik. Endpoint ini mendukung pagination melalui query parameter `limit` dan `offset`.

#### Parameter

| Nama | Lokasi | Tipe | Wajib/opsional | Nilai bawaan | Keterangan |
|---|---|---|---|---|---|
| `limit` | query | Integer | Opsional | `20` | Jumlah maksimum pengguna yang dikembalikan. Harus berupa bilangan bulat dari 1 sampai 100. |
| `offset` | query | Integer | Opsional | `0` | Jumlah baris yang dilewati sebelum hasil dikembalikan. Harus berupa bilangan bulat minimal 0. |

Validasi dilakukan setelah nilai query dikonversi menjadi angka. Nilai yang bukan bilangan bulat atau berada di luar batas yang ditentukan akan menghasilkan HTTP 400.

#### Contoh request

Mengambil daftar pengguna menggunakan nilai bawaan:

```bash
curl -i http://localhost:3000/users
```

Mengambil maksimal 10 pengguna dengan melewati 5 baris pertama:

```bash
curl -i "http://localhost:3000/users?limit=10&offset=5"
```

#### Respons sukses

**Status: `200 OK`**

Respons berupa array objek pengguna. Contoh berikut menggunakan data ilustrasi.

```json
[
  {
    "id": 1,
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "created_at": "2026-10-29T02:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Siti Aminah",
    "email": "siti@example.com",
    "created_at": "2026-10-29T02:05:00.000Z"
  }
]
```

Jika tidak ada pengguna yang ditemukan, respons tetap berstatus `200 OK` dengan array kosong:

```json
[]
```

#### Kemungkinan respons error

**Status: `400 Bad Request` — `limit` tidak valid**

Contoh request:

```bash
curl -i "http://localhost:3000/users?limit=101"
```

Respons:

```json
{
  "error": "Parameter \"limit\" harus bilangan bulat 1 sampai 100"
}
```

**Status: `400 Bad Request` — `offset` tidak valid**

Contoh request:

```bash
curl -i "http://localhost:3000/users?offset=-1"
```

Respons:

```json
{
  "error": "Parameter \"offset\" harus bilangan bulat 0 atau lebih"
}
```

**Status: `500 Internal Server Error`**

Dapat terjadi apabila ada kesalahan server yang tidak ditangani secara khusus, misalnya kegagalan query database.

```json
{
  "error": "Terjadi kesalahan pada server"
}
```

---

### 4. GET `/users/:id` — Mengambil satu pengguna

Mengambil satu pengguna berdasarkan ID yang terdapat pada path URL.

#### Parameter

| Nama | Lokasi | Tipe | Wajib/opsional | Nilai bawaan | Keterangan |
|---|---|---|---|---|---|
| `id` | path | Integer | Wajib | Tidak ada | ID pengguna yang dicari. Harus berupa bilangan bulat positif, minimal 1. |

#### Contoh request

Mengambil pengguna dengan ID `1`:

```bash
curl -i http://localhost:3000/users/1
```

#### Respons sukses

**Status: `200 OK`**

Contoh respons apabila pengguna dengan ID `1` tersedia:

```json
{
  "id": 1,
  "name": "Budi Santoso",
  "email": "budi@example.com",
  "created_at": "2026-10-29T02:00:00.000Z"
}
```

#### Kemungkinan respons error

**Status: `400 Bad Request` — ID tidak valid**

Contoh request:

```bash
curl -i http://localhost:3000/users/abc
```

Respons:

```json
{
  "error": "ID harus berupa bilangan bulat positif"
}
```

**Status: `404 Not Found` — pengguna tidak ditemukan**

Contoh request:

```bash
curl -i http://localhost:3000/users/999999
```

Respons jika ID tersebut tidak tersedia:

```json
{
  "error": "Pengguna tidak ditemukan"
}
```

**Status: `500 Internal Server Error`**

Dapat terjadi apabila ada kesalahan server yang tidak ditangani secara khusus.

```json
{
  "error": "Terjadi kesalahan pada server"
}
```

---

### 5. POST `/users/register` — Mendaftarkan pengguna baru

Mendaftarkan pengguna baru menggunakan data JSON. Password disimpan dalam bentuk hash, bukan sebagai teks biasa.

#### Parameter

Semua parameter dikirim melalui request body dengan format JSON.

| Nama | Lokasi | Tipe | Wajib/opsional | Nilai bawaan | Keterangan |
|---|---|---|---|---|---|
| `name` | body | String | Wajib | Tidak ada | Tidak boleh kosong setelah spasi tepi dihapus. Maksimal 100 karakter. |
| `email` | body | String | Wajib | Tidak ada | Harus memiliki format email yang valid, maksimal 255 karakter, dan belum terdaftar. Spasi tepi dihapus dan huruf diubah menjadi huruf kecil. |
| `password` | body | String | Wajib | Tidak ada | Tidak boleh berupa string kosong dan harus memiliki minimal 8 karakter. Spasi tidak dihapus dari awal atau akhir. |

Body harus berupa objek JSON. Array, `null`, dan tipe JSON lain yang bukan objek akan ditolak.

#### Contoh request

```bash
curl -i -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Andi Pratama",
    "email": "andi@example.com",
    "password": "password123"
  }'
```

Gunakan email yang belum terdaftar agar pendaftaran berhasil.

#### Respons sukses

**Status: `201 Created`**

```json
{
  "id": 3,
  "name": "Andi Pratama",
  "email": "andi@example.com",
  "created_at": "2026-10-29T03:00:00.000Z"
}
```

Nilai ID dan timestamp pada contoh merupakan ilustrasi. Respons aktual mengikuti data yang tersimpan di database. Field `password_hash` tidak disertakan dalam respons.

#### Kemungkinan respons error

**Status: `400 Bad Request` — body bukan objek JSON**

```json
{
  "error": "Body request harus berupa objek JSON"
}
```

**Status: `400 Bad Request` — body berisi JSON yang sintaksnya tidak valid**

```json
{
  "error": "Body request bukan JSON yang valid"
}
```

**Status: `400 Bad Request` — nama kosong atau bukan string**

```json
{
  "error": "Field \"name\" wajib diisi dan tidak boleh kosong"
}
```

**Status: `400 Bad Request` — nama melebihi 100 karakter**

```json
{
  "error": "Field \"name\" maksimal 100 karakter"
}
```

**Status: `400 Bad Request` — email kosong atau bukan string**

```json
{
  "error": "Field \"email\" wajib diisi dan tidak boleh kosong"
}
```

**Status: `400 Bad Request` — format email tidak valid atau panjangnya melebihi 255 karakter**

```json
{
  "error": "Field \"email\" tidak berformat email yang valid"
}
```

**Status: `400 Bad Request` — password kosong atau bukan string**

```json
{
  "error": "Field \"password\" wajib diisi"
}
```

**Status: `400 Bad Request` — password kurang dari 8 karakter**

```json
{
  "error": "Field \"password\" minimal 8 karakter"
}
```

**Status: `409 Conflict` — email sudah terdaftar**

```json
{
  "error": "Email sudah terdaftar"
}
```

**Status: `500 Internal Server Error`**

Dapat terjadi apabila ada kesalahan server yang tidak ditangani secara khusus.

```json
{
  "error": "Terjadi kesalahan pada server"
}
```

---

## Struktur objek pengguna

Endpoint `GET /users` mengembalikan array objek pengguna, sedangkan `GET /users/:id` dan `POST /users/register` mengembalikan satu objek pengguna.

Struktur objek pengguna:

| Field | Tipe | Keterangan |
|---|---|---|
| `id` | Integer | ID unik pengguna yang dihasilkan database. |
| `name` | String | Nama pengguna. |
| `email` | String | Alamat email pengguna. |
| `created_at` | Timestamp | Waktu pembuatan data pengguna. |

Contoh:

```json
{
  "id": 1,
  "name": "Budi Santoso",
  "email": "budi@example.com",
  "created_at": "2026-10-29T02:00:00.000Z"
}
```

Field `password_hash` tidak dikembalikan oleh endpoint API tersebut.

## Format umum respons error

Sebagian besar respons error menggunakan objek JSON dengan field `error` yang berisi pesan kesalahan.

```json
{
  "error": "Pesan kesalahan"
}
```

Pengecualian terdapat pada endpoint `GET /health`, yang mengembalikan field `status` dan `database` ketika pemeriksaan koneksi database gagal.

## Ringkasan status HTTP

| Status HTTP | Arti | Kondisi |
|---|---|---|
| `200 OK` | Request berhasil. | API berjalan, database dapat diakses, atau data pengguna berhasil diambil. |
| `201 Created` | Resource berhasil dibuat. | Pendaftaran pengguna berhasil. |
| `400 Bad Request` | Request tidak valid. | Parameter tidak memenuhi aturan atau body registrasi tidak valid. |
| `404 Not Found` | Resource atau route tidak ditemukan. | Pengguna tidak ditemukan atau route tidak dikenal. |
| `409 Conflict` | Terjadi konflik dengan data yang sudah ada. | Email sudah terdaftar. |
| `500 Internal Server Error` | Terjadi kesalahan internal server. | Kesalahan yang tidak ditangani secara khusus. |
| `503 Service Unavailable` | Layanan tidak tersedia untuk sementara. | Pemeriksaan koneksi database pada endpoint `/health` gagal. |

