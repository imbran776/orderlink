# OrderLink Backend API

REST API untuk OrderLink platform. Stack: **Node.js + Express + MySQL**.

## Setup Local

```bash
cd backend
cp .env.example .env
# Edit .env dengan credentials kamu
npm install
npm run dev
```

Server jalan di `http://localhost:3001`.

## Deploy Railway

Railway auto-detect Node.js. Set environment variables di dashboard:

```
DB_HOST=<railway-mysql-host>
DB_PORT=3306
DB_USER=<railway-mysql-user>
DB_PASSWORD=<railway-mysql-password>
DB_NAME=orderlink
JWT_SECRET=<generate-random-32+-chars>
CORS_ORIGIN=https://orderlink-imbran776s-projects.vercel.app
NODE_ENV=production
```

## Generate JWT_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## API Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/auth/login` | - | - | Login |
| POST | `/api/auth/register` | - | - | Register |
| GET | `/api/auth/me` | JWT | Any | Current user |
| GET | `/api/orders` | JWT | Any | List orders |
| POST | `/api/orders` | JWT | Distributor/Retailer | Create order |
| PUT | `/api/orders` | JWT | Distributor/Retailer | Update order |
| DELETE | `/api/orders` | JWT | Distributor | Delete order |
| GET | `/api/inventory` | JWT | Any | List inventory |
| POST | `/api/inventory` | JWT | Distributor | Create item |
| PUT | `/api/inventory` | JWT | Distributor | Update item |
| DELETE | `/api/inventory` | JWT | Distributor | Delete item |
| GET | `/api/customers` | JWT | Any | List customers |
| POST | `/api/customers` | JWT | Distributor/Retailer | Create customer |
| PUT | `/api/customers` | JWT | Distributor/Retailer | Update customer |
| DELETE | `/api/customers` | JWT | Distributor | Delete customer |
| GET | `/api/metrics` | JWT | Any | Dashboard metrics |
| GET | `/api/chart` | JWT | Any | Chart data |

## Database Schema

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('Distributor', 'Retailer', 'Driver') DEFAULT 'Retailer',
  full_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  total DECIMAL(12, 2) NOT NULL,
  status ENUM('Processing', 'Pending', 'Completed', 'Shipped', 'Cancelled') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  price DECIMAL(12, 2) NOT NULL,
  status ENUM('In Stock', 'Low Stock', 'Out of Stock') DEFAULT 'In Stock',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  company VARCHAR(255) NOT NULL,
  total_orders INT DEFAULT 0,
  total_spent DECIMAL(12, 2) DEFAULT 0,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Security

- JWT-based auth
- Bcrypt password hashing (12 rounds)
- Helmet middleware
- CORS whitelist
- Rate limiting (100 req/15min global, 10 req/15min auth)
- Parameterized queries (mysql2)
- Zod input validation
- Role-based access control
- See `/security.md` in project root