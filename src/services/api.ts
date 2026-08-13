export interface User {
  id: number;
  email: string;
  role: 'Admin' | 'Distributor' | 'Retailer' | 'Driver';
  full_name: string;
  avatar_url?: string | null;
}

export interface Order {
  id: number;
  order_id: string;
  customer_name: string;
  date: string;
  total: number;
  status: 'Processing' | 'Pending' | 'Completed' | 'Shipped' | 'Cancelled';
  created_at?: string;
}

export interface MetricCard {
  key: string;
  label: string;
  value: string;
  change: string;
  type: 'green' | 'gray';
}

export interface ChartPoint {
  id: number;
  date: string;
  value: number;
  timeframe: string;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
}

export interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  created_at?: string;
}

export interface InventoryResponse {
  items: InventoryItem[];
  total: number;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  total_orders: number;
  total_spent: number;
  status: 'Active' | 'Inactive';
  created_at?: string;
}

export interface CustomersResponse {
  customers: Customer[];
  total: number;
}

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export const apiService = {
  // Orders CRUD
  async getOrders(params: {
    search?: string;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  } = {}): Promise<OrdersResponse> {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.sortField) queryParams.append('sortField', params.sortField);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const res = await fetch(`${API_BASE}/api/orders?${queryParams.toString()}`, {
      headers: authHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async createOrder(order: Omit<Order, 'id'>): Promise<Order> {
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(order),
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  },

  async updateOrder(order: Order): Promise<Order> {
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(order),
    });
    if (!res.ok) throw new Error('Failed to update order');
    return res.json();
  },

  async deleteOrder(id: number): Promise<{ ok: boolean }> {
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) throw new Error('Failed to delete order');
    return res.json();
  },

  // Metrics
  async getMetrics(): Promise<MetricCard[]> {
    const res = await fetch(`${API_BASE}/api/metrics`, {
      headers: authHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch metrics');
    return res.json();
  },

  // Chart
  async getChartData(timeframe: string): Promise<ChartPoint[]> {
    const res = await fetch(`${API_BASE}/api/chart?timeframe=${timeframe}`, {
      headers: authHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch chart data');
    return res.json();
  },

  // Inventory CRUD
  async getInventory(params: {
    search?: string;
    category?: string;
    status?: string;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  } = {}): Promise<InventoryResponse> {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.category) queryParams.append('category', params.category);
    if (params.status) queryParams.append('status', params.status);
    if (params.sortField) queryParams.append('sortField', params.sortField);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const res = await fetch(`${API_BASE}/api/inventory?${queryParams.toString()}`, {
      headers: authHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch inventory');
    return res.json();
  },

  async createInventoryItem(item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
    const res = await fetch(`${API_BASE}/api/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to create inventory item');
    return res.json();
  },

  async updateInventoryItem(item: InventoryItem): Promise<InventoryItem> {
    const res = await fetch(`${API_BASE}/api/inventory`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to update inventory item');
    return res.json();
  },

  async deleteInventoryItem(id: number): Promise<{ ok: boolean }> {
    const res = await fetch(`${API_BASE}/api/inventory`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) throw new Error('Failed to delete inventory item');
    return res.json();
  },

  // Customers CRUD
  async getCustomers(params: {
    search?: string;
    status?: string;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  } = {}): Promise<CustomersResponse> {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.sortField) queryParams.append('sortField', params.sortField);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const res = await fetch(`${API_BASE}/api/customers?${queryParams.toString()}`, {
      headers: authHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  },

  async createCustomer(customer: Omit<Customer, 'id'>): Promise<Customer> {
    const res = await fetch(`${API_BASE}/api/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(customer),
    });
    if (!res.ok) throw new Error('Failed to create customer');
    return res.json();
  },

  async updateCustomer(customer: Customer): Promise<Customer> {
    const res = await fetch(`${API_BASE}/api/customers`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(customer),
    });
    if (!res.ok) throw new Error('Failed to update customer');
    return res.json();
  },

  async deleteCustomer(id: number): Promise<{ ok: boolean }> {
    const res = await fetch(`${API_BASE}/api/customers`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) throw new Error('Failed to delete customer');
    return res.json();
  },

  async updateProfile(profile: { full_name?: string; avatar_url?: string | null }): Promise<User> {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(profile),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  }
};