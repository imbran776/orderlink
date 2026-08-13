import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function seedMoreData() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    console.log('🌱 Starting additional seed...');

    // Add 10 more customers
    const newCustomers = [
      ['Andi Wijaya', 'andi@tokoanda.com', '081234567894', 'Toko Anda', 15, 6750000, 'Active'],
      ['Rina Susanti', 'rina@warungrina.com', '081234567895', 'Warung Rina', 8, 3200000, 'Active'],
      ['Bambang Hermanto', 'bambang@minimarketbambang.com', '081234567896', 'Mini Market Bambang', 22, 11000000, 'Active'],
      ['Sari Dewi', 'sari@tokosari.com', '081234567897', 'Toko Sari', 6, 2400000, 'Inactive'],
      ['Eko Prasetyo', 'eko@warungeko.com', '081234567898', 'Warung Eko', 18, 8100000, 'Active'],
      ['Maya Sari', 'maya@toko maya.com', '081234567899', 'Toko Maya', 10, 4500000, 'Active'],
      ['Doni Setiawan', 'doni@minimarketdoni.com', '081234567900', 'Mini Market Doni', 30, 15000000, 'Active'],
      ['Lina Marlina', 'lina@warunglina.com', '081234567901', 'Warung Lina', 4, 1600000, 'Inactive'],
      ['Rudi Hartono', 'rudi@tokorudi.com', '081234567902', 'Toko Rudi', 12, 5400000, 'Active'],
      ['Fitri Handayani', 'fitri@warungfitri.com', '081234567903', 'Warung Fitri', 9, 3600000, 'Active'],
    ];

    for (const c of newCustomers) {
      await pool.execute(
        'INSERT INTO customers (name, email, phone, company, total_orders, total_spent, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        c
      );
    }
    console.log('✅ Added 10 customers');

    // Add 10 more inventory items
    const newInventory = [
      ['SKU009', 'Kopi Sachet', 'Minuman', 300, 2500, 'In Stock'],
      ['SKU010', 'Roti Tawar', 'Makanan', 50, 15000, 'In Stock'],
      ['SKU011', 'Telur 1kg', 'Sembako', 80, 28000, 'In Stock'],
      ['SKU012', 'Susu UHT', 'Minuman', 120, 18000, 'In Stock'],
      ['SKU013', 'Mie Instan Cup', 'Makanan', 200, 5500, 'In Stock'],
      ['SKU014', 'Kecap Manis', 'Bumbu', 60, 12000, 'In Stock'],
      ['SKU015', 'Sambal Botol', 'Bumbu', 90, 15000, 'In Stock'],
      ['SKU016', 'Tepung Terigu 1kg', 'Sembako', 150, 11000, 'In Stock'],
      ['SKU017', 'Garam 500g', 'Bumbu', 250, 5000, 'In Stock'],
      ['SKU018', 'Minyak Goreng 2L', 'Sembako', 5, 48000, 'Low Stock'],
    ];

    for (const item of newInventory) {
      await pool.execute(
        'INSERT INTO inventory (sku, name, category, stock, price, status) VALUES (?, ?, ?, ?, ?, ?)',
        item
      );
    }
    console.log('✅ Added 10 inventory items');

    // Add 10 more orders with dates in the last 30 days
    const now = new Date();
    const newOrders = [];
    const customerNames = ['Budi Santoso', 'Siti Aminah', 'Joko Susanto', 'Dewi Lestari', 'Andi Wijaya', 'Rina Susanti', 'Bambang Hermanto', 'Eko Prasetyo', 'Doni Setiawan', 'Rudi Hartono'];
    const statuses = ['Completed', 'Processing', 'Pending', 'Shipped'];
    
    for (let i = 0; i < 10; i++) {
      const daysAgo = Math.floor(Math.random() * 30); // 0-29 days ago
      const orderDate = new Date(now);
      orderDate.setDate(orderDate.getDate() - daysAgo);
      const dateStr = orderDate.toISOString().split('T')[0];
      
      const customer = customerNames[i % customerNames.length];
      const total = Math.floor(Math.random() * 1500000) + 100000; // 100k - 1.6M
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      newOrders.push([`ORD-${String(6 + i).padStart(3, '0')}`, customer, dateStr, total, status]);
    }

    for (const order of newOrders) {
      await pool.execute(
        'INSERT INTO orders (order_id, customer_name, date, total, status) VALUES (?, ?, ?, ?, ?)',
        order
      );
    }
    console.log('✅ Added 10 orders with recent dates');

    console.log('✅ Additional seed complete');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedMoreData();
