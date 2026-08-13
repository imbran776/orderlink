import { Router } from 'express';
import { z } from 'zod';
import { getPool } from '../config/db.js';
import { roleMiddleware } from '../middleware/role.js';

const router = Router();

router.get('/', roleMiddleware('Distributor', 'Retailer'), async (req, res, next) => {
  try {
    const pool = getPool();

    const [orderStats] = await pool.execute(
      `SELECT 
         COUNT(*) as total_orders,
         COALESCE(SUM(total), 0) as total_revenue,
         SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending_orders,
         SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_orders
       FROM orders`
    );

    const [inventoryStats] = await pool.execute(
      `SELECT 
         COUNT(*) as total_items,
         SUM(CASE WHEN status = 'Low Stock' THEN 1 ELSE 0 END) as low_stock,
         SUM(CASE WHEN status = 'Out of Stock' THEN 1 ELSE 0 END) as out_of_stock
       FROM inventory`
    );

    const [customerStats] = await pool.execute(
      `SELECT 
         COUNT(*) as total_customers,
         SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_customers
       FROM customers`
    );

    const stats = orderStats[0];
    const inv = inventoryStats[0];
    const cust = customerStats[0];

    const metrics = [
      {
        key: 'total_orders',
        label: 'Total Orders',
        value: stats.total_orders.toString(),
        change: '+12%',
        type: 'green'
      },
      {
        key: 'revenue',
        label: 'Revenue',
        value: `$${parseFloat(stats.total_revenue).toFixed(2)}`,
        change: '+8%',
        type: 'green'
      },
      {
        key: 'pending',
        label: 'Pending',
        value: stats.pending_orders.toString(),
        change: '-3%',
        type: 'gray'
      },
      {
        key: 'inventory',
        label: 'Inventory Items',
        value: inv.total_items.toString(),
        change: `${inv.low_stock} low`,
        type: 'gray'
      },
      {
        key: 'customers',
        label: 'Customers',
        value: cust.total_customers.toString(),
        change: `${cust.active_customers} active`,
        type: 'green'
      }
    ];

    res.json(metrics);
  } catch (err) {
    next(err);
  }
});

export default router;