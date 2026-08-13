import { Router } from 'express';
import { z } from 'zod';
import { getPool } from '../config/db.js';
import { roleMiddleware } from '../middleware/role.js';

const router = Router();

const customerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  company: z.string().min(1),
  total_orders: z.number().int().nonnegative().optional(),
  total_spent: z.number().nonnegative().optional(),
  status: z.enum(['Active', 'Inactive'])
});

const querySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  sortField: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional()
});

function buildCustomerQuery(params) {
  let whereClause = '';
  const queryParams = [];

  const conditions = [];
  if (params.search) {
    conditions.push('(name LIKE ? OR email LIKE ? OR company LIKE ?)');
    queryParams.push(`%${params.search}%`, `%${params.search}%`, `%${params.search}%`);
  }
  if (params.status) {
    conditions.push('status = ?');
    queryParams.push(params.status);
  }
  if (conditions.length > 0) {
    whereClause = 'WHERE ' + conditions.join(' AND ');
  }

  const sortField = params.sortField || 'id';
  const sortOrder = params.sortOrder || 'desc';
  const allowedSortFields = ['id', 'name', 'email', 'company', 'total_orders', 'total_spent', 'status', 'created_at'];
  const safeSortField = allowedSortFields.includes(sortField) ? sortField : 'id';
  const safeSortOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';

  const page = params.page || 1;
  const limit = Math.min(params.limit || 5, 100);
  const offset = (page - 1) * limit;

  return { whereClause, queryParams, safeSortField, safeSortOrder, limit, offset };
}

router.get('/', roleMiddleware('Distributor', 'Retailer'), async (req, res, next) => {
  try {
    const params = querySchema.parse(req.query);
    const pool = getPool();
    const { whereClause, queryParams, safeSortField, safeSortOrder, limit, offset } = buildCustomerQuery(params);

    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM customers ${whereClause}`,
      queryParams
    );
    const total = countResult[0].total;

    const [customers] = await pool.execute(
      `SELECT id, name, email, phone, company, total_orders, total_spent, status, created_at 
       FROM customers ${whereClause}
       ORDER BY ${safeSortField} ${safeSortOrder}
       LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
      queryParams
    );

    res.json({ customers, total });
  } catch (err) {
    next(err);
  }
});

router.post('/', roleMiddleware('Distributor', 'Retailer'), async (req, res, next) => {
  try {
    const data = customerSchema.parse(req.body);
    const pool = getPool();

    const [result] = await pool.execute(
      'INSERT INTO customers (name, email, phone, company, total_orders, total_spent, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [data.name, data.email, data.phone, data.company, data.total_orders || 0, data.total_spent || 0, data.status]
    );

    const [customers] = await pool.execute(
      'SELECT id, name, email, phone, company, total_orders, total_spent, status, created_at FROM customers WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(customers[0]);
  } catch (err) {
    next(err);
  }
});

router.put('/', roleMiddleware('Distributor', 'Retailer'), async (req, res, next) => {
  try {
    const data = customerSchema.extend({ id: z.number().int().positive() }).parse(req.body);
    const pool = getPool();

    const [result] = await pool.execute(
      'UPDATE customers SET name = ?, email = ?, phone = ?, company = ?, total_orders = ?, total_spent = ?, status = ? WHERE id = ?',
      [data.name, data.email, data.phone, data.company, data.total_orders || 0, data.total_spent || 0, data.status, data.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const [customers] = await pool.execute(
      'SELECT id, name, email, phone, company, total_orders, total_spent, status, created_at FROM customers WHERE id = ?',
      [data.id]
    );

    res.json(customers[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/', roleMiddleware('Distributor'), async (req, res, next) => {
  try {
    const { id } = z.object({ id: z.number().int().positive() }).parse(req.body);
    const pool = getPool();

    const [result] = await pool.execute('DELETE FROM customers WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;