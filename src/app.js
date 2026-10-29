const express = require('express');
const { pool } = require('./db');

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
