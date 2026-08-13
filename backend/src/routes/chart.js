import { Router } from 'express';
import { z } from 'zod';
import { getPool } from '../config/db.js';
import { roleMiddleware } from '../middleware/role.js';

const router = Router();

const querySchema = z.object({
  // Accept the dashboard labels and short API aliases for backward compatibility.
  timeframe: z.enum(['7d', '30d', '90d', '1y', '7_days', '30_days', '90_days', '1_year']).optional()
});

router.get('/', roleMiddleware('Distributor', 'Retailer'), async (req, res, next) => {
  try {
    const { timeframe = '30d' } = querySchema.parse(req.query);
    const pool = getPool();

    const days = {
      '7d': 7,
      '7_days': 7,
      '30d': 30,
      '30_days': 30,
      '90d': 90,
      '90_days': 90,
      '1y': 365,
      '1_year': 365
    }[timeframe];

    const [rows] = await pool.execute(
      `SELECT 
         DATE(date) as date,
         SUM(total) as value
       FROM orders
       WHERE date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(date)
       ORDER BY DATE(date) ASC`,
      [days]
    );

    const chartData = rows.map((row, index) => ({
      id: index + 1,
      date: row.date.toISOString().split('T')[0],
      value: parseFloat(row.value),
      timeframe
    }));

    res.json(chartData);
  } catch (err) {
    next(err);
  }
});

export default router;