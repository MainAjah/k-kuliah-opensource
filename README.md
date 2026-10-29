## Dokumentasi API

Base URL untuk pengembangan lokal:

```text
http://localhost:3000
```

Semua endpoint mengembalikan respons dalam format JSON. Endpoint yang tidak membutuhkan parameter tetap memiliki tabel parameter untuk menjelaskan bahwa tidak ada parameter yang diperlukan.

### 1. GET `/` — Cek API

Memeriksa apakah server API berjalan.

**Parameter**

| Nama | Lokasi | Tipe | Wajib/opsional | Nilai bawaan | Keterangan |
|---|---|---|---|---|---|
| — | — | — | — | — | Tidak membutuhkan parameter. |

**Contoh request**

```bash
curl -i http://localhost:3000/
```

**Respons sukses — HTTP 200 OK**

```json
{
  "message": "User API berjalan"
}
```

**Kemungkinan respons error**

Jika terjadi kesalahan yang tidak terduga di server:

HTTP 500 Internal Server Error

```json
{
  "error": "Terjadi kesalahan pada server"
}
```

### 2. GET `/health` — Cek koneksi database

Memeriksa apakah server dapat menjalankan query sederhana pada database MySQL.

**Parameter**

| Nama | Lokasi | Tipe | Wajib/opsional | Nilai bawaan | Keterangan |
|---|---|---|---|---|---|
| — | — | — | — | — | Tidak membutuhkan parameter. |

**Contoh request**

```bash
curl -i http://localhost:3000/health
```

**Respons sukses — HTTP 200 OK**

```json
{
  "status": "ok",
  "database": "terhubung"
}
```

**Kemungkinan respons error**

HTTP 503 Service Unavailable — ketika query pemeriksaan database gagal.

```json
{
  "status": "error",
  "database": "tidak terhubung"
}
```

### 3. GET `/users` — Mengambil daftar pengguna

Mengambil daftar pengguna dari database, diurutkan berdasarkan `id` secara menaik. Endpoint ini mendukung pagination menggunakan query parameter `limit` dan `offset`.

**Parameter**

| Nama | Lokasi | Tipe | Wajib/opsional | Nilai bawaan | Keterangan |
|---|---|---|---|---|---|
| `limit` | query | Integer | Opsional | `20` | Jumlah maksimum pengguna yang dikembalikan. Harus berupa bilangan bulat dari 1 sampai 100. |
| `offset` | query | Integer | Opsional | `0` | Jumlah baris yang dilewati sebelum hasil dikembalikan. Harus berupa bilangan bulat minimal 0. |

Nilai parameter dikonversi menjadi angka oleh API. Nilai yang bukan bilangan bulat atau berada di luar batas yang ditentukan akan menghasilkan HTTP 400 Bad Request.

**Contoh request**

Mengambil daftar pengguna dengan nilai bawaan:

```bash
curl -i http://localhost:3000/users
```

Mengambil maksimal 10 pengguna, dimulai dari baris ke-5 yang dilewati:

```bash
curl -i "http://localhost:3000/users?limit=10&offset=5"
```

**Respons sukses — HTTP 200 OK**

Respons berupa array objek pengguna. Jika tidak ada data yang sesuai, API mengembalikan array kosong `[]`.

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

Nilai `created_at` di atas merupakan ilustrasi format timestamp. Nilai sebenarnya berasal dari database.

**Kemungkinan respons error**

HTTP 400 Bad Request — `limit` bukan bilangan bulat antara 1 dan 100.

```json
{
  "error": "Parameter \"limit\" harus bilangan bulat 1 sampai 100"
}
```

HTTP 400 Bad Request — `offset` bukan bilangan bulat atau bernilai negatif.

```json
{
  "error": "Parameter \"offset\" harus bilangan bulat 0 atau lebih"
}
```

HTTP 500 Internal Server Error — jika terjadi kesalahan server yang tidak ditangani secara khusus.

```json
{
  "error": "Terjadi kesalahan pada server"
}
```

### 4. GET `/users/:id` — Mengambil satu pengguna

Mengambil satu pengguna berdasarkan ID. ID harus berupa bilangan bulat positif.

**Parameter**

| Nama | Lokasi | Tipe | Wajib/opsional | Nilai bawaan | Keterangan |
|---|---|---|---|---|---|
| `id` | path | Integer | Wajib | Tidak ada | ID pengguna yang ingin diambil. Harus berupa bilangan bulat minimal 1. |

**Contoh request**

Mengambil pengguna dengan ID 1:

```bash
curl -i http://localhost:3000/users/1
```

**Respons sukses — HTTP 200 OK**

```json
{
  "id": 1,
  "name": "Budi Santoso",
  "email": "budi@example.com",
  "created_at": "2026-10-29T02:00:00.000Z"
}
```

**Kemungkinan respons error**

HTTP 400 Bad Request — ID bukan bilangan bulat positif.

```json
{
  "error": "ID harus berupa bilangan bulat positif"
}
```

Contoh request:

```bash
curl -i http://localhost:3000/users/abc
```

HTTP 404 Not Found — ID valid, tetapi pengguna tidak ditemukan.

```json
{
  "error": "Pengguna tidak ditemukan"
}
```

Contoh request:

```bash
curl -i http://localhost:3000/users/999999
```

HTTP 500 Internal Server Error — jika terjadi kesalahan server yang tidak ditangani secara khusus.

```json
{
  "error": "Terjadi kesalahan pada server"
}
```

### 5. POST `/users/register` — Mendaftarkan pengguna baru

Endpoint ini menerima data pengguna dalam body JSON, memvalidasi data, menyimpan password sebagai hash, dan mengembalikan data pengguna yang baru dibuat tanpa menyertakan hash password.

**Parameter**

| Nama | Lokasi | Tipe | Wajib/opsional | Nilai bawaan | Keterangan |
|---|---|---|---|---|---|
| `name` | body | String | Wajib | Tidak ada | Nama tidak boleh kosong setelah spasi tepi dihapus. Maksimal 100 karakter. |
| `email` | body | String | Wajib | Tidak ada | Harus memiliki format email yang valid, maksimal 255 karakter, dan belum terdaftar. Spasi tepi dihapus dan huruf diubah menjadi huruf kecil. |
| `password` | body | String | Wajib | Tidak ada | Minimal 8 karakter. Tidak dihapus spasi tepinya. Password disimpan dalam bentuk hash. |

Body harus berupa objek JSON, bukan array, `null`, atau tipe JSON lainnya.

**Contoh request**

```bash
curl -i -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Andi Pratama",
    "email": "andi@example.com",
    "password": "password123"
  }'
```

**Respons sukses — HTTP 201 Created**

```json
{
  "id": 3,
  "name": "Andi Pratama",
  "email": "andi@example.com",
  "created_at": "2026-10-29T03:00:00.000Z"
}
```

ID dan timestamp di atas merupakan ilustrasi. Respons aktual mengikuti data yang tersimpan di database.

**Kemungkinan respons error**

HTTP 400 Bad Request — body bukan objek JSON yang valid untuk endpoint ini.

```json
{
  "error": "Body request harus berupa objek JSON"
}
```

HTTP 400 Bad Request — nama kosong atau bukan string.

```json
{
  "error": "Field \"name\" wajib diisi dan tidak boleh kosong"
}
```

HTTP 400 Bad Request — nama lebih dari 100 karakter.

```json
{
  "error": "Field \"name\" maksimal 100 karakter"
}
```

HTTP 400 Bad Request — email kosong atau bukan string.

```json
{
  "error": "Field \"email\" wajib diisi dan tidak boleh kosong"
}
```

HTTP 400 Bad Request — email tidak memenuhi format atau batas panjang yang ditentukan.

```json
{
  "error": "Field \"email\" tidak berformat email yang valid"
}
```

HTTP 400 Bad Request — password kosong atau bukan string.

```json
{
  "error": "Field \"password\" wajib diisi"
}
```

HTTP 400 Bad Request — password kurang dari 8 karakter.

```json
{
  "error": "Field \"password\" minimal 8 karakter"
}
```

HTTP 409 Conflict — email sudah terdaftar.

```json
{
  "error": "Email sudah terdaftar"
}
```

HTTP 400 Bad Request — body berisi JSON yang sintaksnya tidak valid.

```json
{
  "error": "Body request bukan JSON yang valid"
}
```

HTTP 500 Internal Server Error — jika terjadi kesalahan server yang tidak ditangani secara khusus.

```json
{
  "error": "Terjadi kesalahan pada server"
}
```

### Struktur objek pengguna

Endpoint `GET /users`, `GET /users/:id`, dan `POST /users/register` mengembalikan objek pengguna dengan struktur berikut:

| Field | Tipe | Keterangan |
|---|---|---|
| `id` | Integer | ID unik pengguna yang dihasilkan database. |
| `name` | String | Nama pengguna. |
| `email` | String | Alamat email pengguna. |
| `created_at` | Timestamp | Waktu pembuatan data pengguna. |

Field `password_hash` tidak disertakan dalam respons API.

### Format umum respons error

Respons error menggunakan objek JSON dengan satu field `error` yang berisi pesan kesalahan.

```json
{
  "error": "Pesan kesalahan"
}
```

Namun, `GET /health` menggunakan struktur respons error khusus yang berisi field `status` dan `database`.

Status HTTP yang digunakan oleh API meliputi:

| Status HTTP | Arti | Contoh kondisi |
|---|---|---|
| `200 OK` | Request berhasil. | Pemeriksaan API, pemeriksaan database, atau pengambilan data pengguna berhasil. |
| `201 Created` | Resource berhasil dibuat. | Pendaftaran pengguna berhasil. |
| `400 Bad Request` | Request atau parameter tidak valid. | `limit`, `offset`, atau ID tidak valid; body registrasi tidak valid. |
| `404 Not Found` | Resource atau route tidak ditemukan. | Pengguna tidak ditemukan atau route tidak dikenal. |
| `409 Conflict` | Request bertentangan dengan data yang sudah ada. | Email sudah terdaftar. |
| `500 Internal Server Error` | Terjadi kesalahan server yang tidak ditangani secara khusus. | Kesalahan database atau kesalahan internal lainnya. |
| `503 Service Unavailable` | Layanan tidak dapat memenuhi pemeriksaan kesehatan. | Koneksi database gagal pada endpoint `/health`. |

