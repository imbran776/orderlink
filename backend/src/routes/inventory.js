import { Router } from 'express';
import { z } from 'zod';
import { getPool } from '../config/db.js';
import { roleMiddleware } from '../middleware/role.js';

const router = Router();

const inventorySchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  stock: z.number().int().nonnegative(),
  price: z.number().positive(),
  status: z.enum(['In Stock', 'Low Stock', 'Out of Stock'])
});

const querySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  sortField: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional()
});

function buildInventoryQuery(params) {
  let whereClause = '';
  const queryParams = [];

  const conditions = [];
  if (params.search) {
    conditions.push('(sku LIKE ? OR name LIKE ?)');
    queryParams.push(`%${params.search}%`, `%${params.search}%`);
  }
  if (params.category) {
    conditions.push('category = ?');
    queryParams.push(params.category);
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
  const allowedSortFields = ['id', 'sku', 'name', 'category', 'stock', 'price', 'status', 'created_at'];
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
    const { whereClause, queryParams, safeSortField, safeSortOrder, limit, offset } = buildInventoryQuery(params);

    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM inventory ${whereClause}`,
      queryParams
    );
    const total = countResult[0].total;

    const [items] = await pool.execute(
      `SELECT id, sku, name, category, stock, price, status, created_at 
       FROM inventory ${whereClause}
       ORDER BY ${safeSortField} ${safeSortOrder}
       LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
      queryParams
    );

    res.json({ items, total });
  } catch (err) {
    next(err);
  }
});

router.post('/', roleMiddleware('Distributor'), async (req, res, next) => {
  try {
    const data = inventorySchema.parse(req.body);
    const pool = getPool();

    const [result] = await pool.execute(
      'INSERT INTO inventory (sku, name, category, stock, price, status) VALUES (?, ?, ?, ?, ?, ?)',
      [data.sku, data.name, data.category, data.stock, data.price, data.status]
    );

    const [items] = await pool.execute(
      'SELECT id, sku, name, category, stock, price, status, created_at FROM inventory WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(items[0]);
  } catch (err) {
    next(err);
  }
});

router.put('/', roleMiddleware('Distributor'), async (req, res, next) => {
  try {
    const data = inventorySchema.extend({ id: z.number().int().positive() }).parse(req.body);
    const pool = getPool();

    const [result] = await pool.execute(
      'UPDATE inventory SET sku = ?, name = ?, category = ?, stock = ?, price = ?, status = ? WHERE id = ?',
      [data.sku, data.name, data.category, data.stock, data.price, data.status, data.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    const [items] = await pool.execute(
      'SELECT id, sku, name, category, stock, price, status, created_at FROM inventory WHERE id = ?',
      [data.id]
    );

    res.json(items[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/', roleMiddleware('Distributor'), async (req, res, next) => {
  try {
    const { id } = z.object({ id: z.number().int().positive() }).parse(req.body);
    const pool = getPool();

    const [result] = await pool.execute('DELETE FROM inventory WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;