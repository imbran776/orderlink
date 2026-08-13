import { createPool } from 'mysql2/promise';

const pool = createPool({
  host: process.env.DB_HOST || 'mysql-fzhs.railway.internal',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'kbLreGPkksfYLioLiVwgMzVZbJpscVQW',
  database: process.env.DB_NAME || 'railway',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function seed() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Connected to MySQL');

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role ENUM('Distributor', 'Retailer', 'Driver') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created users table');

    const [rows] = await conn.execute('SELECT COUNT(*) as count FROM users');
    if (rows[0].count === 0) {
      const hashed = await import('bcryptjs');
      const salt = await hashed.genSalt(12);
      const hash = await hashed.hash('demo123', salt);

      await conn.execute(
        'INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)',
        ['distributor@orderlink.io', hash, 'Distributor Demo', 'Distributor']
      );
      await conn.execute(
        'INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)',
        ['retailer@orderlink.io', hash, 'Retailer Demo', 'Retailer']
      );
      await conn.execute(
        'INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)',
        ['driver@orderlink.io', hash, 'Driver Demo', 'Driver']
      );
      console.log('✅ Inserted 3 demo users');
    } else {
      console.log('ℹ️  Users already exist, skipping seed');
    }

    await conn.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();