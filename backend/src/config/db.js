import mysql from 'mysql2/promise';

let pool = null;

async function tryConnect(config, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔌 MySQL connect attempt ${attempt}/${retries} to ${config.host}:${config.port}...`);
      const testPool = mysql.createPool({
        ...config,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 30000,
        connectTimeout: 15000,
        timezone: '+00:00'
      });
      const conn = await testPool.getConnection();
      await conn.ping();
      conn.release();
      return testPool;
    } catch (err) {
      console.error(`❌ Attempt ${attempt} failed: ${err.code} - ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 2000 * attempt));
    }
  }
}

export async function connectDB() {
  if (pool) return pool;

  const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missing = requiredEnvVars.filter(v => !process.env[v]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const config = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  };

  console.log(`📊 DB target: ${config.user}@${config.host}:${config.port}/${config.database}`);

  pool = await tryConnect(config);

  console.log('✅ MySQL connection pool established');
  return pool;
}

export async function initializeTables() {
  if (!pool) return;
  try {
    // Users table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role ENUM('Distributor', 'Retailer', 'Driver') NOT NULL,
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Ensure avatar_url column exists if table was created previously
    try {
      await pool.execute('ALTER TABLE users ADD COLUMN avatar_url TEXT AFTER role');
    } catch {
      // Column may already exist
    }

    // Customers table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        company VARCHAR(255),
        total_orders INT DEFAULT 0,
        total_spent DECIMAL(12,2) DEFAULT 0,
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Inventory table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS inventory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sku VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        stock INT DEFAULT 0,
        price DECIMAL(12,2) NOT NULL,
        status ENUM('In Stock', 'Low Stock', 'Out of Stock') DEFAULT 'In Stock',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Orders table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(100) NOT NULL UNIQUE,
        customer_name VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        total DECIMAL(12,2) NOT NULL,
        status ENUM('Processing', 'Pending', 'Completed', 'Shipped', 'Cancelled') DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Seed users
    const [usersCount] = await pool.execute('SELECT COUNT(*) as count FROM users');
    if (usersCount[0].count === 0) {
      const bcrypt = await import('bcryptjs');
      const salt = await bcrypt.genSalt(12);
      const hash = await bcrypt.hash('demo123', salt);
      
      await pool.execute(
        'INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)',
        ['distributor@orderlink.io', hash, 'Distributor Demo', 'Distributor']
      );
      await pool.execute(
        'INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)',
        ['retailer@orderlink.io', hash, 'Retailer Demo', 'Retailer']
      );
      await pool.execute(
        'INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)',
        ['driver@orderlink.io', hash, 'Driver Demo', 'Driver']
      );
      console.log('✅ Seeded 3 demo users');
    }

    // Seed customers
    const [customersCount] = await pool.execute('SELECT COUNT(*) as count FROM customers');
    if (customersCount[0].count === 0) {
      const customers = [
        ['Budi Santoso', 'budi@warungsehat.com', '081234567890', 'Warung Sehat', 12, 5400000, 'Active'],
        ['Siti Aminah', 'siti@tokobahari.com', '081234567891', 'Toko Bahari', 8, 3200000, 'Active'],
        ['Joko Susanto', 'joko@minimarketjaya.com', '081234567892', 'Mini Market Jaya', 25, 12500000, 'Active'],
        ['Dewi Lestari', 'dewi@tokomakmur.com', '081234567893', 'Toko Makmur', 5, 1800000, 'Inactive'],
      ];
      for (const c of customers) {
        await pool.execute(
          'INSERT INTO customers (name, email, phone, company, total_orders, total_spent, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          c
        );
      }
      console.log('✅ Seeded 4 demo customers');
    }

    // Seed inventory
    const [inventoryCount] = await pool.execute('SELECT COUNT(*) as count FROM inventory');
    if (inventoryCount[0].count === 0) {
      const items = [
        ['SKU001', 'Indomie Goreng', 'Makanan', 150, 3500, 'In Stock'],
        ['SKU002', 'Aqua 600ml', 'Minuman', 200, 4000, 'In Stock'],
        ['SKU003', 'Beras Premium 5kg', 'Sembako', 30, 85000, 'In Stock'],
        ['SKU004', 'Minyak Goreng 1L', 'Sembako', 8, 25000, 'Low Stock'],
        ['SKU005', 'Gula Pasir 1kg', 'Sembako', 0, 18000, 'Out of Stock'],
        ['SKU006', 'Teh Celup', 'Minuman', 75, 12000, 'In Stock'],
        ['SKU007', 'Sabun Mandi', 'Kebersihan', 45, 8000, 'In Stock'],
        ['SKU008', 'Deterjen Bubuk', 'Kebersihan', 12, 22000, 'Low Stock'],
      ];
      for (const item of items) {
        await pool.execute(
          'INSERT INTO inventory (sku, name, category, stock, price, status) VALUES (?, ?, ?, ?, ?, ?)',
          item
        );
      }
      console.log('✅ Seeded 8 demo inventory items');
    }

    // Seed orders
    const [ordersCount] = await pool.execute('SELECT COUNT(*) as count FROM orders');
    if (ordersCount[0].count === 0) {
      const orders = [
        ['ORD-001', 'Budi Santoso', '2025-01-15', 450000, 'Completed'],
        ['ORD-002', 'Siti Aminah', '2025-01-16', 280000, 'Processing'],
        ['ORD-003', 'Joko Susanto', '2025-01-17', 1250000, 'Shipped'],
        ['ORD-004', 'Dewi Lestari', '2025-01-18', 180000, 'Pending'],
        ['ORD-005', 'Budi Santoso', '2025-01-19', 320000, 'Completed'],
      ];
      for (const order of orders) {
        await pool.execute(
          'INSERT INTO orders (order_id, customer_name, date, total, status) VALUES (?, ?, ?, ?, ?)',
          order
        );
      }
      console.log('✅ Seeded 5 demo orders');
    }

    // Add a second, idempotent fixture set for realistic list and dashboard testing.
    // Seed only from the original baseline counts, never on every restart.
    const [customerTotal] = await pool.execute('SELECT COUNT(*) as count FROM customers');
    if (customerTotal[0].count === 4) {
      const customers = [
        ['Andi Wijaya', 'andi@tokoanda.com', '081234567894', 'Toko Anda', 15, 6750000, 'Active'],
        ['Rina Susanti', 'rina@warungrina.com', '081234567895', 'Warung Rina', 8, 3200000, 'Active'],
        ['Bambang Hermanto', 'bambang@minimarketbambang.com', '081234567896', 'Mini Market Bambang', 22, 11000000, 'Active'],
        ['Sari Dewi', 'sari@tokosari.com', '081234567897', 'Toko Sari', 6, 2400000, 'Inactive'],
        ['Eko Prasetyo', 'eko@warungeko.com', '081234567898', 'Warung Eko', 18, 8100000, 'Active'],
        ['Maya Sari', 'maya@tokomaya.com', '081234567899', 'Toko Maya', 10, 4500000, 'Active'],
        ['Doni Setiawan', 'doni@minimarketdoni.com', '081234567900', 'Mini Market Doni', 30, 15000000, 'Active'],
        ['Lina Marlina', 'lina@warunglina.com', '081234567901', 'Warung Lina', 4, 1600000, 'Inactive'],
        ['Rudi Hartono', 'rudi@tokorudi.com', '081234567902', 'Toko Rudi', 12, 5400000, 'Active'],
        ['Fitri Handayani', 'fitri@warungfitri.com', '081234567903', 'Warung Fitri', 9, 3600000, 'Active']
      ];
      for (const customer of customers) {
        await pool.execute('INSERT INTO customers (name, email, phone, company, total_orders, total_spent, status) VALUES (?, ?, ?, ?, ?, ?, ?)', customer);
      }
      console.log('✅ Added 10 extra customers');
    }

    const [inventoryTotal] = await pool.execute('SELECT COUNT(*) as count FROM inventory');
    if (inventoryTotal[0].count === 8) {
      const items = [
        ['SKU009', 'Kopi Sachet', 'Minuman', 300, 2500, 'In Stock'],
        ['SKU010', 'Roti Tawar', 'Makanan', 50, 15000, 'In Stock'],
        ['SKU011', 'Telur 1kg', 'Sembako', 80, 28000, 'In Stock'],
        ['SKU012', 'Susu UHT', 'Minuman', 120, 18000, 'In Stock'],
        ['SKU013', 'Mie Instan Cup', 'Makanan', 200, 5500, 'In Stock'],
        ['SKU014', 'Kecap Manis', 'Bumbu', 60, 12000, 'In Stock'],
        ['SKU015', 'Sambal Botol', 'Bumbu', 90, 15000, 'In Stock'],
        ['SKU016', 'Tepung Terigu 1kg', 'Sembako', 150, 11000, 'In Stock'],
        ['SKU017', 'Garam 500g', 'Bumbu', 250, 5000, 'In Stock'],
        ['SKU018', 'Minyak Goreng 2L', 'Sembako', 5, 48000, 'Low Stock']
      ];
      for (const item of items) {
        await pool.execute('INSERT INTO inventory (sku, name, category, stock, price, status) VALUES (?, ?, ?, ?, ?, ?)', item);
      }
      console.log('✅ Added 10 extra inventory items');
    }

    const [orderTotal] = await pool.execute('SELECT COUNT(*) as count FROM orders');
    if (orderTotal[0].count === 5) {
      const names = ['Budi Santoso', 'Siti Aminah', 'Joko Susanto', 'Dewi Lestari', 'Andi Wijaya', 'Rina Susanti', 'Bambang Hermanto', 'Eko Prasetyo', 'Doni Setiawan', 'Rudi Hartono'];
      const amounts = [680000, 425000, 970000, 310000, 1250000, 540000, 780000, 395000, 1150000, 625000];
      const statuses = ['Completed', 'Processing', 'Shipped', 'Pending', 'Completed', 'Completed', 'Processing', 'Shipped', 'Completed', 'Pending'];
      for (let i = 0; i < 10; i++) {
        const date = new Date();
        date.setUTCDate(date.getUTCDate() - (i + 1));
        const dateString = date.toISOString().slice(0, 10);
        await pool.execute(
          'INSERT INTO orders (order_id, customer_name, date, total, status) VALUES (?, ?, ?, ?, ?)',
          [`ORD-${String(i + 6).padStart(3, '0')}`, names[i], dateString, amounts[i], statuses[i]]
        );
      }
      console.log('✅ Added 10 recent orders for Revenue Overview');
    }

    console.log('✅ Database initialization complete');
  } catch (err) {
    console.error('❌ Table initialization failed:', err.message);
  }
}

export function getPool() {
  if (!pool) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return pool;
}

export async function closeDB() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('📦 MySQL connection pool closed');
  }
}