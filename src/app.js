const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('./db');

const BCRYPT_ROUNDS = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const app = express();

// Middleware agar body request berformat JSON bisa dibaca lewat req.body
app.use(express.json());

// GET / : cek bahwa API berjalan
app.get('/', (req, res) => {
  res.json({ message: 'User API berjalan' });
});

// GET /health : cek koneksi ke database
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'terhubung' });
  } catch (err) {
    res.status(503).json({ status: 'error', database: 'tidak terhubung' });
  }
});

// GET /users : ambil daftar pengguna (query opsional: limit, offset)
app.get('/users', async (req, res, next) => {
  try {
    const limit = req.query.limit === undefined ? 20 : Number(req.query.limit);
    const offset = req.query.offset === undefined ? 0 : Number(req.query.offset);

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return res
        .status(400)
        .json({ error: 'Parameter "limit" harus bilangan bulat 1 sampai 100' });
    }

    if (!Number.isInteger(offset) || offset < 0) {
      return res
        .status(400)
        .json({ error: 'Parameter "offset" harus bilangan bulat 0 atau lebih' });
    }

    const [rows] = await pool.query(
      'SELECT id, name, email, created_at FROM users ORDER BY id LIMIT ? OFFSET ?',
      [limit, offset]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /users/:id : ambil satu pengguna berdasarkan ID
app.get('/users/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res
        .status(400)
        .json({ error: 'ID harus berupa bilangan bulat positif' });
    }

    const [rows] = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /users/register : daftarkan pengguna baru
// Body JSON: { name, email, password }
app.post('/users/register', async (req, res, next) => {
  try {
    const body = req.body;

    if (body === null || typeof body !== 'object' || Array.isArray(body)) {
      return res
        .status(400)
        .json({ error: 'Body request harus berupa objek JSON' });
    }

    const { name, email, password } = body;

    // Validasi name
    if (typeof name !== 'string' || name.trim() === '') {
      return res
        .status(400)
        .json({ error: 'Field "name" wajib diisi dan tidak boleh kosong' });
    }
    const cleanName = name.trim();
    if (cleanName.length > 100) {
      return res
        .status(400)
        .json({ error: 'Field "name" maksimal 100 karakter' });
    }

    // Validasi email (dinormalisasi: tanpa spasi tepi, huruf kecil)
    if (typeof email !== 'string' || email.trim() === '') {
      return res
        .status(400)
        .json({ error: 'Field "email" wajib diisi dan tidak boleh kosong' });
    }
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail.length > 255 || !EMAIL_REGEX.test(cleanEmail)) {
      return res
        .status(400)
        .json({ error: 'Field "email" tidak berformat email yang valid' });
    }

    // Validasi password (tidak di-trim)
    if (typeof password !== 'string' || password === '') {
      return res
        .status(400)
        .json({ error: 'Field "password" wajib diisi' });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: 'Field "password" minimal 8 karakter' });
    }

    // Simpan hash, bukan password asli
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    let result;
    try {
      [result] = await pool.query(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
        [cleanName, cleanEmail, passwordHash]
      );
    } catch (err) {
      // Kolom email bersifat UNIQUE, jadi duplikat ditolak oleh database
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Email sudah terdaftar' });
      }
      throw err;
    }

    // Ambil data yang baru dibuat (tanpa password_hash)
    const [rows] = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// Route yang tidak dikenal
app.use((req, res) => {
  res.status(404).json({ error: 'Route tidak ditemukan' });
});

// Error handler dasar
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res
      .status(400)
      .json({ error: 'Body request bukan JSON yang valid' });
  }

  console.error(err);
  res.status(500).json({ error: 'Terjadi kesalahan pada server' });
});

module.exports = app;