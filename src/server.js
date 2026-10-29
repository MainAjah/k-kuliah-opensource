require('dotenv').config();

const app = require('./app');
const { initDb, dbConfig } = require('./db');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await initDb();
  } catch (err) {
    console.error(
      `Gagal terhubung ke database di ${dbConfig.host}:${dbConfig.port}`
    );
    console.error(err.code || err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

start();
