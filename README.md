# 🔗 OrderLink - Platform Distribusi & Pengiriman B2B

![OrderLink Banner](https://raw.githubusercontent.com/imbran776/orderlink-repo/main/banner.png) <!-- placeholder, update this later -->

Platform pemesanan grosir end-to-end yang efisien, dengan pelacakan pengiriman real-time, portal multi-role untuk Distributor, Retailer, dan Driver, serta REST API terintegrasi. Dirancang untuk meningkatkan efisiensi operasional dan visibilitas rantai pasok.

---

## 🚀 Demo Aplikasi

**Link Demo Live:** [**orderlink-wfhc.vercel.app**](https://orderlink-wfhc.vercel.app)

**Deployment URLs:**
- **Frontend (Vercel):** [orderlink-wfhc.vercel.app](https://orderlink-wfhc.vercel.app)
- **Backend API (Railway):** [backend-production-ff65f.up.railway.app](https://backend-production-ff65f.up.railway.app)
- **Realtime Server (Railway):** [realtime-server-production-71ca.up.railway.app](https://realtime-server-production-71ca.up.railway.app)


### Akun Demo (Login untuk Eksplorasi)

Anda dapat login dengan berbagai peran untuk mencoba fungsionalitas aplikasi:

| Peran       | Email                      | Password   |
| :---------- | :------------------------- | :--------- |
| **Admin**   | `admin@example.com`        | `password` |
| **Distributor** | `distributor@example.com`  | `password` |
| **Retailer**| `retailer@example.com`     | `password` |
| **Driver**  | `driver@example.com`       | `password` |

### Gambaran Fungsionalitas Tiap Peran:

#### 🧑‍💼 Sebagai Distributor
- **Dashboard Overview:** Lihat metrik penjualan, order pending, stok menipis, dan armada aktif.
- **Manajemen Produk:** Tambah, edit, hapus produk dan kategori.
- **Manajemen Order:** Konfirmasi order dari retailer, lacak status pengiriman.
- **Manajemen Stok:** Pantau pergerakan stok, lakukan penyesuaian.
- **Manajemen Pengguna:** Kelola akun retailer dan driver.
- **Laporan:** Akses laporan penjualan dan performa.

#### 🛍️ Sebagai Retailer
- **Katalog Produk:** Jelajahi produk, tambahkan ke keranjang, buat order baru.
- **Order Saya:** Lacak status order yang telah dibuat, lihat riwayat.
- **Notifikasi:** Dapatkan update real-time tentang status order dan promosi.

#### 🚚 Sebagai Driver
- **Tugas Pengiriman:** Terima dan kelola daftar pengiriman yang ditugaskan.
- **Update Status:** Perbarui status pengiriman (on-the-way, delivered).
- **Bukti Pengiriman:** Unggah foto bukti pengiriman.

---

## ✨ Fitur Unggulan

Lihat detail fitur lengkap yang ditawarkan OrderLink di [`FEATURES.md`](./FEATURES.md).

---

## 🛠️ Tech Stack

OrderLink dibangun menggunakan teknologi modern untuk performa dan skalabilitas:

-   **Frontend:** React.js, Vite, Tailwind CSS, React Query
-   **Backend (API):** Laravel 11, PHP 8.3, Laravel Sanctum, MySQL
-   **Realtime:** Node.js, Socket.IO
-   **Database:** MySQL
-   **Package Manager:** Composer (PHP), NPM (JavaScript)
-   **Linter & Formatter:** Laravel Pint (PHP), ESLint, Prettier (JavaScript)
-   **Testing:** PHPUnit (PHP), Vitest (JavaScript)
-   **CI/CD:** GitHub Actions (Integrasi, Linting, Testing, Build Otomatis)

---

## ⚙️ Panduan Instalasi Lokal

Untuk menjalankan OrderLink di lingkungan lokal, metode yang direkomendasikan adalah menggunakan **Docker Compose**. Ini memastikan lingkungan pengembangan yang konsisten dan terisolasi dari sistem host Anda.

### **Persyaratan Sistem:**

-   [Docker Desktop](https://www.docker.com/products/docker-desktop/) (termasuk Docker Engine dan Docker Compose)
-   Git

### **Langkah-langkah Instalasi:**

1.  **Clone Repositori:**
    ```bash
    git clone https://github.com/imbran776/orderlink.git
    cd orderlink
    ```

2.  **Konfigurasi Environment (.env):**
    -   Buat file `.env` untuk backend dan frontend:
        ```bash
        cp backend/.env.example backend/.env
        cp frontend/.env.example frontend/.env
        cp realtime/.env.example realtime/.env
        ```
    -   Edit `backend/.env` dan `frontend/.env` untuk mengarahkan ke Docker Compose Services:
        **`backend/.env`:**
        ```env
        DB_HOST=mysql
        DB_PORT=3306
        DB_DATABASE=orderlink
        DB_USERNAME=root
        DB_PASSWORD=root
        APP_URL=http://localhost:8000
        SANCTUM_STATEFUL_DOMAINS=localhost:5173
        ```
        **`frontend/.env`:**
        ```env
        VITE_API_URL=http://localhost:8000/api
        VITE_SOCKET_URL=http://localhost:3001
        ```

3.  **Jalankan dengan Docker Compose:**
    ```bash
    docker-compose up --build -d
    ```
    -   Ini akan membangun image Docker, membuat tiga service (backend, frontend, mysql), dan menjalankannya di background.

4.  **Instal Dependensi Backend & Migrasi Database:**
    ```bash
    docker-compose exec backend composer install
    docker-compose exec backend php artisan key:generate
    docker-compose exec backend php artisan migrate:fresh --seed
    docker-compose exec backend php artisan storage:link
    ```

5.  **Instal Dependensi Frontend & Realtime:**
    ```bash
    docker-compose exec frontend npm install
    docker-compose exec realtime npm install
    ```

6.  **Akses Aplikasi:**
    -   Buka browser Anda:
        -   **Frontend:** `http://localhost:5173`
        -   **Backend (API):** `http://localhost:8000/api`
        -   **Realtime Server:** `http://localhost:3001`


---

## 🤝 Kontribusi

Tertarik untuk berkontribusi? Silakan buka issue atau ajukan Pull Request.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](https://opensource.org/licenses/MIT).

---

## 👨‍💻 Dikembangkan oleh

[Imbran Darwis](https://www.instagram.com/ranzxyz77)

```