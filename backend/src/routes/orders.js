import { Router } from 'express';
import { z } from 'zod';
import { getPool } from '../config/db.js';
import { roleMiddleware } from '../middleware/role.js';

const router = Router();

const orderSchema = z.object({
  order_id: z.string().min(1),
  customer_name: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  total: z.number().positive(),
  status: z.enum(['Processing', 'Pending', 'Completed', 'Shipped', 'Cancelled'])
});

const querySchema = z.object({
  search: z.string().optional(),
  sortField: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional()
});

function buildOrderQuery(params, user) {
  let whereClause = '';
  const queryParams = [];

  const conditions = [];

  // Drivers only see Shipped or Completed orders, or orders assigned to them if applicable
  if (user && user.role === 'Driver') {
    conditions.push("status IN ('Shipped', 'Completed')");
  }

  if (params.search) {
    conditions.push('(order_id LIKE ? OR customer_name LIKE ?)');
    queryParams.push(`%${params.search}%`, `%${params.search}%`);
  }

  if (conditions.length > 0) {
    whereClause = 'WHERE ' + conditions.join(' AND ');
  }

  const sortField = params.sortField || 'id';
  const sortOrder = params.sortOrder || 'desc';
  const allowedSortFields = ['id', 'order_id', 'customer_name', 'date', 'total', 'status', 'created_at'];
  const safeSortField = allowedSortFields.includes(sortField) ? sortField : 'id';
  const safeSortOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';

  const page = params.page || 1;
  const limit = Math.min(params.limit || 5, 100);
  const offset = (page - 1) * limit;

  return { whereClause, queryParams, safeSortField, safeSortOrder, limit, offset };
}

router.get('/', async (req, res, next) => {
  try {
    const params = querySchema.parse(req.query);
    const pool = getPool();
    const { whereClause, queryParams, safeSortField, safeSortOrder, limit, offset } = buildOrderQuery(params, req.user);

    // Count total
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM orders ${whereClause}`,
      queryParams
    );
    const total = countResult[0].total;

    // Get orders
    const [orders] = await pool.execute(
      `SELECT id, order_id, customer_name, date, total, status, created_at 
       FROM orders ${whereClause}
       ORDER BY ${safeSortField} ${safeSortOrder}
       LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
      queryParams
    );

    res.json({ orders, total });
  } catch (err) {
    next(err);
  }
});

router.post('/', roleMiddleware('Distributor', 'Retailer'), async (req, res, next) => {
  try {
    const data = orderSchema.parse(req.body);
    const pool = getPool();

    const [result] = await pool.execute(
      'INSERT INTO orders (order_id, customer_name, date, total, status) VALUES (?, ?, ?, ?, ?)',
      [data.order_id, data.customer_name, data.date, data.total, data.status]
    );

    const [orders] = await pool.execute(
      'SELECT id, order_id, customer_name, date, total, status, created_at FROM orders WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(orders[0]);
  } catch (err) {
    next(err);
  }
});

router.put('/', roleMiddleware('Distributor', 'Retailer', 'Driver'), async (req, res, next) => {
  try {
    const data = orderSchema.extend({ id: z.number().int().positive() }).parse(req.body);
    const pool = getPool();

    // Drivers can only update order status from Shipped -> Completed
    if (req.user.role === 'Driver') {
      if (data.status !== 'Completed') {
        return res.status(403).json({ error: 'Drivers can only mark orders as Completed' });
      }
    }

    const [result] = await pool.execute(
      'UPDATE orders SET order_id = ?, customer_name = ?, date = ?, total = ?, status = ? WHERE id = ?',
      [data.order_id, data.customer_name, data.date, data.total, data.status, data.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const [orders] = await pool.execute(
      'SELECT id, order_id, customer_name, date, total, status, created_at FROM orders WHERE id = ?',
      [data.id]
    );

    res.json(orders[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/', roleMiddleware('Distributor'), async (req, res, next) => {
  try {
    const { id } = z.object({ id: z.number().int().positive() }).parse(req.body);
    const pool = getPool();

    const [result] = await pool.execute('DELETE FROM orders WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;